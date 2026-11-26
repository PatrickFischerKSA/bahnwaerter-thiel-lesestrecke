// Runs in a dedicated worker; images are never sent to an inference server.
const MODEL = 'HuggingFaceTB/SmolVLM-256M-Instruct';
const REVISION = 'd039ab0d4b9311b617e8ffec1d06c8464364aeb3';
const targets = { person: 'a human figure', rails: 'railway tracks', cap: 'a cap or hat', sofa: 'a sofa or couch' };
let processor, model, RawImage;
let busy = false;
let lastProgress = 0;
self.onmessage = async ({ data }) => {
  if (busy) return;
  busy = true;
  try {
    if (data.type === 'load') {
      const adapter = await navigator.gpu?.requestAdapter();
      if (!adapter) throw new Error('Keine nutzbare WebGPU-Grafikunterstützung. Verwende die manuelle Checkliste.');
      const lib = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');
      lib.env.allowLocalModels = false;
      RawImage = lib.RawImage;
      const options = { revision: REVISION, progress_callback: p => {
        if (p.status === 'progress' && Date.now() - lastProgress > 200) { lastProgress = Date.now(); self.postMessage({ type: 'progress', file: p.file, percent: Math.min(100, Math.round(p.progress || 0)) }); }
      } };
      processor = await lib.AutoProcessor.from_pretrained(MODEL, options);
      model = await lib.AutoModelForVision2Seq.from_pretrained(MODEL, { ...options, device: 'webgpu', dtype: { embed_tokens: 'fp32', vision_encoder: 'fp32', decoder_model_merged: 'q4' } });
      self.postMessage({ type: 'ready' });
    } else if (data.type === 'check') {
      if (!model || !targets[data.target]) throw new Error('Modell oder Prüfgegenstand nicht verfügbar.');
      self.postMessage({ type: 'stage', message: 'Bildausschnitt wird gelesen …' });
      const image = await RawImage.fromURL(data.image);
      const messages = [{ role: 'user', content: [{ type: 'image' }, { type: 'text', text: `Is ${targets[data.target]} visible in this image? Answer only YES, NO, or UNCERTAIN.` }] }];
      const prompt = processor.apply_chat_template(messages, { add_generation_prompt: true });
      self.postMessage({ type: 'stage', message: 'Bild wird für das Modell vorbereitet …' });
      const inputs = await processor(prompt, [image], { do_image_splitting: false });
      self.postMessage({ type: 'stage', message: 'Lokale Bilderkennung läuft …' });
      const output = await model.generate({ ...inputs, max_new_tokens: 6, do_sample: false, repetition_penalty: 1.1 });
      const ids = output.tolist()[0].slice(inputs.input_ids.dims[1]);
      const answer = processor.tokenizer.decode(ids, { skip_special_tokens: true }).trim();
      self.postMessage({ type: 'result', answer });
    }
  } catch (error) {
    self.postMessage({ type: 'error', message: String(error?.message || error) });
  } finally { busy = false; }
};
