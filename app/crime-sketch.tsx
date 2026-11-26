"use client";
import { useEffect, useRef, useState } from "react";
import SketchReview from "./sketch-review";
const KEY = "tatortskizze";
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("thiel-bildakte", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("images");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function storage(mode: "read" | "write" | "delete", file?: File): Promise<File | undefined> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("images", mode === "read" ? "readonly" : "readwrite");
    const store = tx.objectStore("images");
    const req = mode === "read" ? store.get(KEY) : mode === "delete" ? store.delete(KEY) : store.put(file, KEY);
    tx.oncomplete = () => { db.close(); resolve(mode === "read" ? req.result : file); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
  });
}
export default function CrimeSketch({ answers, update }: { answers: Record<string, string>; update: (id: string, value: string) => void }) {
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(true);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { let alive = true; storage("read").then(f => { if (alive) setFile(f); }).catch(() => { if (alive) setStatus("Der lokale Bildspeicher ist nicht verfügbar. Bewahre deine Skizze als Datei auf."); }).finally(() => { if (alive) setBusy(false); }); return () => { alive = false; }; }, []);
  useEffect(() => { if (!file) { setUrl(""); return; } const u = URL.createObjectURL(file); setUrl(u); return () => URL.revokeObjectURL(u); }, [file]);
  async function upload(f?: File) {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 10 * 1024 * 1024) { setStatus("Bitte ein JPG-, PNG- oder WebP-Bild bis 10 MB wählen. HEIC und PDF vorher als Bild exportieren."); return; }
    setBusy(true);
    try {
      const u = URL.createObjectURL(f);
      try { const image = new Image(); image.src = u; await image.decode(); } finally { URL.revokeObjectURL(u); }
      await storage("write", f); setFile(f); setStatus("Skizze in deiner lokalen Bildakte gespeichert. Sie wurde nicht an eine Lehrperson gesendet.");
      update("case:skizze-datei", f.name);
    } catch { setStatus("Das Bild konnte nicht gelesen oder gespeichert werden. Die bisherige Skizze bleibt erhalten. Bitte ein anderes Bild oder einen anderen Browser versuchen."); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  }
  return <section className="sketch-assignment" aria-labelledby="sketch-heading">
    <p className="eyebrow">Ermittlungsauftrag · Skizze anfertigen und hochladen</p><h2 id="sketch-heading">Sichere die räumlichen Befunde.</h2>
    <p>Zeichne auf Papier oder digital eine beschriftete Skizze. Fotografiere oder exportiere sie und lade sie hier in deine Bildakte. Rekonstruiere die Wohnung und Thiels Auffindeort an den Gleisen als <strong>getrennte Ansichten</strong>. Erfinde keine massstabsgetreue Verbindung zwischen beiden Orten.</p>
    <details><summary>Was in die Skizze gehört</summary><ol><li>Markiere die im Schlussbericht belegten Fundorte von Lene, dem kleinen Kind und Thiel. Ordne Gegenstände wie die Mütze nur dort zu, wo die Quelle dies trägt.</li><li>Nummeriere Befunde und ergänze eine Legende mit Textseite oder Filmzeit.</li><li>Unterscheide Textbefund (T), Filmgestaltung (F) und eigene Annahme (A). Nicht bekannte Positionen bleiben ausdrücklich offen.</li><li>Trenne Auffindesituation und vermuteten Tatablauf. Keine Diagnose und kein Schuldurteil in die Ortszeichnung eintragen.</li></ol><p>Zeichnerisches Können wird nicht beurteilt. Entscheidend sind Zuordnung, Beschriftung, Quellen und erkennbare Unsicherheit.</p></details>
    <label className="case-field">Skizze auswählen / ersetzen (JPG, PNG, WebP; maximal 10 MB)<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => void upload(e.target.files?.[0])} /></label>
    <p role="status">{status || (busy ? "Bildakte wird geladen …" : file ? "Gespeicherte Skizze geladen." : "Noch keine Skizze hinterlegt.")}</p>
    {file && url && <figure className="sketch-preview"><img src={url} alt="Deine hochgeladene Tatortskizze" /><figcaption>{file.name} · <a href={url} download={file.name}>Skizze herunterladen</a></figcaption><button disabled={busy} onClick={async () => { setBusy(true); try { await storage("delete"); setFile(undefined); update("case:skizze-datei", ""); setStatus("Skizze aus der lokalen Bildakte entfernt."); } catch { setStatus("Löschen nicht möglich. Bitte erneut versuchen."); } finally { setBusy(false); } }}>Skizze entfernen</button></figure>}
    {file && url && <SketchReview key={url} file={file} url={url} answers={answers} update={update} />}
    <details><summary>Befundlegende und Selbstprüfung</summary><label className="case-field">Nummer · Beobachtung · Quelle · offene Frage<textarea value={answers["case:skizze-legende"] || ""} onChange={e => update("case:skizze-legende", e.target.value)} placeholder="1 · … · Text S. … / Film … · unklar bleibt …" /></label><p>Prüfe jede Markierung: Ist sie belegt? Stammt sie aus dem Text oder aus der Verfilmung? Sind unbekannte Entfernungen und die nicht beobachtete Tat als offen gekennzeichnet?</p></details>
    <p className="small">Das Bild bleibt in diesem Browser auf diesem Gerät. Es ist kein zentraler Klassen-Upload und wird nur nach deinem Start lokal von der Browser-KI geprüft. Lade es für die Abgabe separat herunter; der Text-Export des Lesejournals enthält die Legende und den Dateinamen, nicht das Bild. Beim Löschen der Browserdaten geht auch die lokale Bildakte verloren.</p>
  </section>;
}
