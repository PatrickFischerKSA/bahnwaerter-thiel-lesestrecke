"use client";
import { useEffect, useRef, useState } from "react";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const targets = [{ id: "person", label: "Menschliche Figur" }, { id: "rails", label: "Gleise" }, { id: "cap", label: "Mütze / Kopfbedeckung" }, { id: "sofa", label: "Sofa (falls aus dem Film übernommen)" }];
const checklist = [...targets, { id: "places", label: "Wohnung und Auffindeort an den Gleisen getrennt" }, { id: "identities", label: "Lene, Kind und Thiel durch Beschriftung zugeordnet" }, { id: "sources", label: "Textseiten / Filmzeiten in der Legende angegeben" }, { id: "uncertainty", label: "Text, Film und Annahmen getrennt; unbekannte Positionen offen" }];
type Props = { file: File; url: string; answers: Record<string, string>; update: (key: string, value: string) => void };
export default function SketchReview({ file, url, answers, update }: Props) {
  const [hash, setHash] = useState("");
  const [crop, setCrop] = useState([0, 0, 100, 100]);
  const [target, setTarget] = useState("person");
  const [phase, setPhase] = useState("idle");
  const [status, setStatus] = useState("KI ist ausgeschaltet. Die manuelle Checkliste ist sofort nutzbar.");
  const [result, setResult] = useState<{ answer: string; target: string; crop: number[] }>();
  const [preview, setPreview] = useState("");
  const [supported, setSupported] = useState(true);
  const worker = useRef<Worker | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = useRef({ target, crop });
  const canvas = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const last = useRef({ target: "", crop: [0, 0, 100, 100] });
  const active = phase === "loading" || phase === "checking";
  const key = `case:sketch-review:${hash}`;
  let saved: Record<string, string> = {};
  try { const value = JSON.parse(answers[key] || "{}"); if (value && typeof value === "object" && !Array.isArray(value)) saved = value; } catch { /* Empty checklist if the stored value is malformed. */ }
  const persist = (id: string, value: string) => { if (hash) update(key, JSON.stringify({ ...saved, [id]: value })); };
  const stop = (message = "KI beendet. Du kannst mit der Checkliste weiterarbeiten oder die KI neu starten.") => {
    worker.current?.terminate(); worker.current = null;
    if (timeout.current) clearTimeout(timeout.current);
    setPhase("idle"); setStatus(message);
  };
  const arm = (ms: number) => { if (timeout.current) clearTimeout(timeout.current); timeout.current = setTimeout(() => stop("Zeitlimit erreicht. Die KI wurde beendet; die manuelle Checkliste bleibt verfügbar."), ms); };
  useEffect(() => {
    setSupported("gpu" in navigator);
    let alive = true;
    file.arrayBuffer().then(b => crypto.subtle.digest("SHA-256", b)).then(b => { if (alive) setHash(Array.from(new Uint8Array(b), n => n.toString(16).padStart(2, "0")).join("")); }).catch(() => { if (alive) { setHash(`file-${encodeURIComponent(file.name)}-${file.size}-${file.lastModified}`); } });
    return () => { alive = false; worker.current?.terminate(); if (timeout.current) clearTimeout(timeout.current); };
  }, [file]);
  useEffect(() => {
    let alive = true; const img = new Image(); img.src = url;
    img.decode().then(() => { if (alive) { image.current = img; draw(); } }).catch(() => { if (alive) setStatus("Bildvorschau nicht lesbar. Bitte die Skizze erneut hochladen."); });
    return () => { alive = false; image.current = null; };
    // Drawing is repeated by the crop effect once the image is loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  function draw() {
    const img = image.current, c = canvas.current;
    if (!img || !c) return;
    const [x, y, w, h] = current.current.crop;
    const sw = img.naturalWidth * w / 100, sh = img.naturalHeight * h / 100;
    const scale = Math.min(1, 768 / Math.max(sw, sh));
    c.width = Math.max(1, Math.round(sw * scale)); c.height = Math.max(1, Math.round(sh * scale));
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "white"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, img.naturalWidth * x / 100, img.naturalHeight * y / 100, sw, sh, 0, 0, c.width, c.height);
    setPreview(c.toDataURL("image/jpeg", .9));
  }
  useEffect(() => { current.current = { target, crop }; draw(); }, [crop, target]);
  function load() {
    stop(); setResult(undefined); setPhase("loading"); setStatus("SmolVLM wird geladen. Der erste Download kann mehrere Minuten dauern."); arm(600000);
    try {
      const w = new Worker(`${BASE}/ai/sketch-worker.js`, { type: "module" }); worker.current = w;
      w.onmessage = ({ data }) => {
        if (worker.current !== w) return;
        if (data.type === "stage") setStatus(String(data.message));
        if (data.type === "progress") setStatus(`Modelldownload: ${data.file || "Datei"} · ${data.percent}% (je Datei)`);
        if (data.type === "ready") { if (timeout.current) clearTimeout(timeout.current); setPhase("ready"); setStatus("SmolVLM ist bereit. Wähle Ausschnitt und Element, dann starte die Prüfung."); }
        if (data.type === "result") { if (timeout.current) clearTimeout(timeout.current); setPhase("ready"); setResult({ answer: String(data.answer).slice(0, 1500), ...last.current }); setStatus("KI-Hinweis erhalten. Prüfe ihn selbst; kein Häkchen wurde automatisch gesetzt."); }
        if (data.type === "error") stop(`KI nicht verfügbar: ${String(data.message).slice(0, 350)} Die Checkliste funktioniert weiter.`);
      };
      w.onerror = () => stop("Die Browser-KI konnte nicht ausgeführt werden. Nutze die Checkliste oder starte erneut.");
      w.postMessage({ type: "load" });
    } catch { stop("Browser-KI nicht verfügbar. Die Checkliste bleibt nutzbar."); }
  }
  function check() {
    if (!worker.current || phase !== "ready" || !preview) return;
    setResult(undefined); last.current = { target, crop: [...crop] }; setPhase("checking"); setStatus("Der gewählte Ausschnitt wird lokal geprüft …"); arm(90000);
    worker.current.postMessage({ type: "check", target, image: preview });
  }
  function changeCrop(i: number, n: number) {
    const next = [...crop]; next[i] = n;
    next[2] = Math.min(next[2], 100 - next[0]); next[3] = Math.min(next[3], 100 - next[1]); setCrop(next);
  }
  const verdict = result?.answer.match(/^(yes|no|uncertain)\b/i)?.[1].toLowerCase();
  const verdictText = verdict === "yes" ? "Hinweis auf das Element gefunden – selbst bestätigen." : verdict === "no" ? "Element nicht erkannt. Das beweist nicht, dass es fehlt." : "Keine eindeutige Erkennung. Bitte manuell prüfen.";
  const stale = result && (result.target !== target || result.crop.some((v, i) => v !== crop[i]));
  return <div className="sketch-review">
    <h3>Skizzenprüfung: KI-Hinweis und eigener Befund</h3>
    <p>Die KI sucht nur sichtbare Elemente. Sie erkennt keine Person als „Thiel“, beweist keine richtige Position und bewertet keine Schuld. Nicht erkannt bedeutet nicht: fehlt.</p>
    <details><summary>Lokale KI einschalten · SmolVLM-256M</summary><p>Beim Start werden Programm- und Modelldateien von jsDelivr und Hugging Face geladen (mehrere hundert MB; zusätzlicher Arbeitsspeicher nötig). Deine Skizze bleibt zur Auswertung auf diesem Gerät. WebGPU ist erforderlich. Der Browser kann Modelldateien zwischenspeichern; ein vollständig offline verfügbarer Betrieb ist nicht garantiert.</p>
      {!supported && <p>Dieser Browser bietet kein WebGPU. Verwende die manuelle Checkliste unten.</p>}
      <div className="actions"><button disabled={!supported || active || phase === "ready"} onClick={load}>KI laden</button><button disabled={phase === "idle"} onClick={() => stop()}>Abbrechen / KI beenden</button></div>
      <p role="status" aria-live="polite">{status}</p>
      <a href="https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct" target="_blank" rel="noreferrer">Modell und Herkunft</a>
    </details>
    <details open><summary>Ausschnitt und einzelnes Element auswählen</summary><p>Mit den Reglern begrenzt du den Bildausschnitt. Die Vorschau zeigt genau den Bereich, den die KI erhält. Die Checkliste ist auch ohne Ausschnitt nutzbar.</p>
      <div className="crop-controls">{["Links", "Oben", "Breite", "Höhe"].map((label, i) => <label key={label}>{label}: {crop[i]}%<input type="range" min={i < 2 ? 0 : 5} max={i < 2 ? 95 : 100 - crop[i - 2]} value={crop[i]} disabled={active} onChange={e => changeCrop(i, Number(e.target.value))} /></label>)}</div>
      <button disabled={active} onClick={() => setCrop([0, 0, 100, 100])}>Ganzes Bild</button><canvas ref={canvas} hidden />
      {preview && <img className="crop-preview" src={preview} alt="Aktuell gewählter Ausschnitt für die Elementprüfung" />}
      <label>Zu suchendes Element<select value={target} disabled={active} onChange={e => setTarget(e.target.value)}>{targets.map(t => <option value={t.id} key={t.id}>{t.label}</option>)}</select></label>
      <button disabled={phase !== "ready" || !preview} onClick={check}>Diesen Ausschnitt mit KI prüfen</button>
      {phase !== "ready" && !active && <p className="small">Für die KI-Prüfung oben „KI laden“ wählen. Die manuelle Prüfung benötigt das Modell nicht.</p>}
      {phase === "checking" && <p role="status">Prüfung läuft. Du kannst oben abbrechen.</p>}
      {result && <div className="review-result"><strong>Unbestätigter KI-Hinweis · {targets.find(t => t.id === result.target)?.label}</strong><p>Ausschnitt: {result.crop.join(" / ")}% (links / oben / Breite / Höhe).</p><p>{verdictText}</p><details><summary>Rohe Modellantwort anzeigen</summary><p lang="en">{result.answer || "Keine lesbare Antwort."}</p></details><p>Der KI-Hinweis kann falsch sein. Entscheidend ist deine eigene Prüfung.</p>{stale ? <p>Ausschnitt oder Suchziel wurde geändert. Dieser Hinweis gehört zur vorherigen Prüfung.</p> : <div className="actions"><button disabled={!hash} onClick={() => persist(result.target, "bestätigt")}>Selbst geprüft: vorhanden</button><button disabled={!hash} onClick={() => persist(result.target, "unklar")}>Hinweis unsicher / unklar</button><button disabled={!hash} onClick={() => persist(result.target, "ergänzen")}>Selbst geprüft: ergänzen</button></div>}</div>}
    </details>
    <details open><summary>Manuelle Checkliste · immer ohne KI nutzbar</summary><p>Deine Auswahl wird für dieses Bild gespeichert. „Nicht erforderlich“ ist möglich, wenn dein Ausschnitt oder deine Quelle das Element nicht verlangt. Ein Sofa ist beispielsweise kein allgemeines Pflichtmerkmal.</p>{checklist.map(t => <label className="review-check" key={t.id}><span>{t.label}</span><select disabled={!hash} value={saved[t.id] || ""} onChange={e => persist(t.id, e.target.value)}><option value="">Noch nicht geprüft</option><option value="bestätigt">Selbst geprüft: vorhanden</option><option value="unklar">Unklar / Rückfrage</option><option value="ergänzen">Ergänzen oder korrigieren</option><option value="nicht erforderlich">Nicht erforderlich (begründen)</option></select></label>)}<label className="case-field">Prüfnotiz: Quelle, Korrektur oder Begründung<textarea disabled={!hash} value={saved.note || ""} onChange={e => persist("note", e.target.value)} /></label><p className="small">Checkliste und Prüfnotiz erscheinen im Lesejournal-Export. Es gibt keine automatische Note und keine Zugangssperre.</p></details>
  </div>;
}
