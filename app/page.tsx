"use client";

import { useEffect, useMemo, useState } from "react";

type Station = {
  id: string;
  number: string;
  kicker: string;
  title: string;
  thesis: string;
  focus: string[];
  prompt: string;
  scaffold: string;
  color: string;
};

const stations: Station[] = [
  {
    id: "ordnung", number: "01", kicker: "Exposition", title: "Ein Mann zwischen Dienst und Andacht",
    thesis: "Thiels Alltag wirkt geordnet. Doch die strenge Wiederholung ist weniger Stabilität als ein Schutz gegen innere Spannung.",
    focus: ["Berufsrolle und Körper", "Sonntagsweg und Ritual", "Minnas Nachleben im Wärterhäuschen"],
    prompt: "Zeige, wie der Erzähler Thiels äußere Verlässlichkeit aufbaut und zugleich erste Risse in dieser Ordnung sichtbar macht.",
    scaffold: "Beginne mit einem konkreten Detail der Routine. Erkläre dann, welche psychische Funktion diese Ordnung für Thiel erfüllt.", color: "ochre"
  },
  {
    id: "frauen", number: "02", kicker: "Figurenkonstellation", title: "Minna, Lene und das geteilte Leben",
    thesis: "Die beiden Frauen sind keine einfache Engel–Dämon-Gegenüberstellung. Sie markieren konkurrierende Räume, Körperbilder und Bindungen.",
    focus: ["Erinnerungsraum Minna", "Lenes Körper- und Sprachmacht", "Thiels Passivität"],
    prompt: "Vergleiche, wie Minna und Lene durch Raum, Körper und Wahrnehmung charakterisiert werden. Vermeide eine rein moralische Wertung.",
    scaffold: "Ordne jeder Figur zunächst zwei Textsignale zu. Formuliere anschließend, was die Gegenüberstellung über Thiels innere Spaltung verrät.", color: "rust"
  },
  {
    id: "raum", number: "03", kicker: "Poetik des Ortes", title: "Wärterhaus, Wald und Schienenraum",
    thesis: "Die Landschaft ist nicht bloße Kulisse. Natur, Technik und Wahrnehmung verschieben sich mit Thiels Zustand.",
    focus: ["Schwellen und Grenzen", "Eisenbahn als Rhythmus und Gewalt", "Naturbilder als Seelenraum"],
    prompt: "Untersuche einen Ortswechsel: Welche Geräusche, Bewegungen und Farben bestimmen ihn – und wie verändert sich dadurch die Wahrnehmung der Gefahr?",
    scaffold: "Beschreibe zuerst sinnliche Signale. Deute danach ihre Wirkung, ohne vorschnell zu behaupten, die Natur ‚spiegle‘ nur Thiels Seele.", color: "pine"
  },
  {
    id: "tobias", number: "04", kicker: "Ethik des Lesens", title: "Tobias: Gefährdung, Blick und unterlassene Handlung",
    thesis: "Die Novelle macht Gewalt früh lesbar. Entscheidend ist deshalb nicht nur Lenes Verhalten, sondern auch Thiels Wissen und Nichthandeln.",
    focus: ["Warnzeichen", "Vaterrolle", "Schuld zwischen Tun und Dulden"],
    prompt: "Rekonstruiere die Warnzeichen vor der Katastrophe. An welchem Punkt wird aus Thiels Überforderung moralische Verantwortung?",
    scaffold: "Baue eine Belegkette aus mindestens drei Momenten. Unterscheide Wissen, Handlungsmöglichkeit und tatsächliches Verhalten.", color: "blue"
  },
  {
    id: "unfall", number: "05", kicker: "Wendepunkt", title: "Der Zug: Beschleunigung zur Katastrophe",
    thesis: "Der Unfall wirkt plötzlich und ist zugleich sorgfältig vorbereitet: räumlich, akustisch, motivisch und durch menschliche Entscheidungen.",
    focus: ["Erzähltempo", "akustische Dramaturgie", "Technik und Verantwortung"],
    prompt: "Analysiere, wie Satzbau, Geräusch und Blickführung die Unfallszene beschleunigen. Was lässt der Text als Zufall erscheinen, was als Folge?",
    scaffold: "Markiere Tempowechsel und Wahrnehmungssprünge. Verbinde mindestens ein sprachliches Verfahren mit einer Deutung der Verantwortung.", color: "signal"
  },
  {
    id: "bruch", number: "06", kicker: "Erzählperspektive", title: "Nach dem Schock: Wenn Wahrnehmung zerfällt",
    thesis: "Im Zusammenbruch nähert sich die Erzählweise Thiels Bewusstsein an, ohne seine Gewalt zu entschuldigen.",
    focus: ["erlebte Wahrnehmung", "Vision und Realität", "Nähe ohne Entlastung"],
    prompt: "Zeige an zwei sprachlichen Merkmalen, wie die Grenze zwischen äußerem Geschehen und Thiels Wahrnehmung unsicher wird.",
    scaffold: "Benenne das Verfahren präzise. Erkläre anschließend, wie der Text zugleich psychische Nähe erzeugt und moralische Distanz wahrt.", color: "violet"
  },
  {
    id: "deutung", number: "07", kicker: "Synthese", title: "Novelle, Naturalismus – oder beides?",
    thesis: "Die Stärke des Textes liegt in seiner Doppelbewegung: soziale und körperliche Bedingtheit trifft auf straffe Motivführung und eine unerhörte Begebenheit.",
    focus: ["Milieu und Determination", "Dingsymbol und Leitmotiv", "Titel und Endbild"],
    prompt: "Entwickle eine Gesamtthese: Wie verbindet Hauptmann naturalistische Beobachtung mit novellistischer Verdichtung? Beziehe Titel, Eisenbahnmotiv und Schluss ein.",
    scaffold: "Formuliere zuerst eine streitbare These. Sichere sie dann an drei Stationen des Textes und schließe mit der Bedeutung des Titels.", color: "black"
  }
];

const STORAGE_KEY = "bahnwaerter-lesestrecke:v2";

export default function Home() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [active, setActive] = useState(stations[0].id);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setAnswers(saved.answers || {});
      setName(saved.name || "");
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, answers }));
  }, [name, answers]);

  const completed = useMemo(() => stations.filter((station) => (answers[station.id] || "").trim().length >= 80).length, [answers]);

  function exportWork() {
    const markdown = [
      "# Bahnwärter Thiel · Lesestrecke",
      name ? `\n**Name:** ${name}\n` : "",
      ...stations.map((station) => `\n## ${station.number} · ${station.title}\n\n**Auftrag:** ${station.prompt}\n\n${answers[station.id] || "_Noch nicht bearbeitet._"}`)
    ].join("\n");
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "bahnwaerter-thiel-lesestrecke.md"; link.click(); URL.revokeObjectURL(url);
  }

  return (
    <main>
      <header className="hero">
        <div className="hero-noise" aria-hidden="true" />
        <nav className="topline" aria-label="Seitennavigation">
          <span>Gerhart Hauptmann · 1888</span><span>Literarische Nahaufnahme</span>
        </nav>
        <div className="hero-copy">
          <p className="overline">Eine Lesestrecke in sieben Signalen</p>
          <h1>Bahnwärter<br/><em>Thiel</em></h1>
          <p className="dek">Ordnung. Begehren. Technik. Gewalt. Eine Novelle lesen, bevor sie zur Diagnose erstarrt.</p>
        </div>
        <div className="hero-rail" aria-hidden="true"><span/><i/><span/></div>
        <a className="start" href="#strecke">Lesestrecke beginnen <b>↓</b></a>
      </header>

      <section className="manifest">
        <p className="manifest-lead">Keine Inhaltsabfrage.</p>
        <p>Diese Lernlandschaft folgt den Signalen des Textes. Jede Station verbindet genaue Beobachtung, begriffliche Schärfung und eine eigene Deutung. Dein Arbeitsstand bleibt in diesem Browser.</p>
      </section>

      <div className="workspace" id="strecke">
        <aside className="route" aria-label="Stationen">
          <div className="route-head"><span>Streckenplan</span><strong>{completed}/7</strong></div>
          <div className="track">
            {stations.map((station) => {
              const done = (answers[station.id] || "").trim().length >= 80;
              return <a key={station.id} href={`#${station.id}`} onClick={() => setActive(station.id)} className={active === station.id ? "active" : ""}><i className={done ? "done" : ""}/><span>{station.number}</span><b>{station.title}</b></a>;
            })}
          </div>
          <label className="name-field"><span>Name / Kürzel</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="optional" /></label>
          <button className="export" onClick={exportWork}>Arbeitsjournal exportieren</button>
        </aside>

        <div className="journey">
          {stations.map((station, index) => (
            <article id={station.id} key={station.id} className={`station ${station.color}`} onMouseEnter={() => setActive(station.id)}>
              <div className="station-index"><span>{station.number}</span><small>{station.kicker}</small></div>
              <div className="station-body">
                <h2>{station.title}</h2>
                <p className="thesis">{station.thesis}</p>
                <div className="focus-line"><span>Lesesignale</span>{station.focus.map((item) => <b key={item}>{item}</b>)}</div>
                <section className="assignment">
                  <p className="label">Schreibauftrag</p>
                  <h3>{station.prompt}</h3>
                  <details><summary>Denkgerüst öffnen</summary><p>{station.scaffold}</p></details>
                  <textarea value={answers[station.id] || ""} onChange={(event) => setAnswers((current) => ({ ...current, [station.id]: event.target.value }))} placeholder="Beobachtung → Beleg → Deutung …" aria-label={`Antwort zu Station ${station.number}`} />
                  <div className="writing-meta"><span>{(answers[station.id] || "").trim().split(/\s+/).filter(Boolean).length} Wörter</span><span>{(answers[station.id] || "").trim().length >= 80 ? "Station dokumentiert" : "Mindestens 80 Zeichen für den Streckenfortschritt"}</span></div>
                </section>
              </div>
              {index < stations.length - 1 && <div className="connector" aria-hidden="true"><i/><i/><i/></div>}
            </article>
          ))}

          <section className="finale">
            <p className="overline">Ankunft</p><h2>Deine Deutung ist keine Endstation.</h2>
            <p>Prüfe zum Schluss, ob deine These die Ambivalenz des Textes aushält: Thiel ist geprägt, aber nicht schuldlos; die Technik ist Gewaltmacht, aber nicht alleinige Täterin; die Natur ist Wahrnehmungsraum, aber kein einfacher Seelenspiegel.</p>
            <button onClick={exportWork}>Lesestrecke sichern</button>
          </section>
        </div>
      </div>
    </main>
  );
}
