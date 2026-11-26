"use client";
import { useState } from "react";
import { reviewWriting } from "./lib/feedback.mjs";
export type Perspective = { angles: string[]; evidence?: string; limit?: string };
export default function AnswerSupport({ value, perspective }: { value: string; perspective: Perspective }) {
  const [checked, setChecked] = useState<string | null>(null);
  const result = checked === null ? null : reviewWriting(checked);
  return <div className="answer-support">
    <details><summary>Lösungsperspektiven · den eigenen Befund entwickeln</summary>
      <ul>{perspective.angles.map(a => <li key={a}>{a}</li>)}</ul>
      {perspective.evidence && <p><strong>Belegauftrag:</strong> {perspective.evidence}</p>}
      <p><strong>Gegenprüfung:</strong> {perspective.limit || "Welche andere Erklärung lässt dieselbe Stelle zu? Entscheide, welche Lesart der Wortlaut stärker trägt und was offenbleibt."}</p>
      <p className="small">Wähle einen tragfähigen Ansatz, ergänze deine Fundstelle und begründe den Zusammenhang. Die Perspektiven legen keine einheitliche Interpretation fest.</p>
    </details>
    <button type="button" className="textbutton" onClick={() => setChecked(value)}>Rückmeldung zu meinem Entwurf</button>
    <div aria-live="polite">{result && <div className="feedback">
      {checked !== value && <p>Dein Entwurf wurde verändert. Prüfe die neue Fassung erneut.</p>}
      {result.map((item: string) => <p key={item}>{item}</p>)}
      {checked?.trim() && <details><summary>Inhaltlich nachprüfen</summary><ul>{perspective.angles.map(a => <li key={a}>{a}</li>)}</ul><p>{perspective.limit}</p></details>}
      <p className="small">Lokale Formulierungsprüfung, keine Benotung: Sie erkennt Beleg- und Begründungssignale, prüft aber weder die Richtigkeit eines Zitats noch die Tragfähigkeit einer Deutung. Ungewohnte Formulierungen können übersehen werden.</p>
    </div>}</div>
  </div>;
}
