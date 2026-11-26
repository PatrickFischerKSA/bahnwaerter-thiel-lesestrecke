"use client";
import AnswerSupport from "./answer-support";
import { fieldPerspective } from "./solution-perspectives";
import { useState } from "react";
import CrimeSketch from "./crime-sketch";
import HistoricalSources from "./historical-sources";
import material from "./imported-material.json";
import demo from "./demo-material.json";
import text from "./text.json";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const law =
  "https://de.wikisource.org/wiki/Strafgesetzbuch_f%C3%BCr_das_Deutsche_Reich_(1871)";
type Props = {
  route: string;
  answers: Record<string, string>;
  update: (id: string, value: string) => void;
  go: (path: string) => void;
  reference: (page: number) => void;
};
type Evidence = {
  id: string;
  source: string;
  location: string;
  quote: string;
  claim: string;
  counter: string;
  weight: string;
};
function readEvidence(raw: string | undefined): Evidence[] {
  try {
    const d = JSON.parse(raw || "[]");
    return Array.isArray(d)
      ? d.filter(
          (e) =>
            e &&
            [
              "id",
              "source",
              "location",
              "quote",
              "claim",
              "counter",
              "weight",
            ].every((k) => typeof e[k] === "string"),
        )
      : [];
  } catch {
    return [];
  }
}
function saveFile(body: string, name: string) {
  const u = URL.createObjectURL(
    new Blob([body], { type: "text/markdown;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
const fields = [
  ["position", "Ergebnis: Welche Konsequenz ist nach Aktenlage vertretbar?"],
  [
    "evidence",
    "Begründung: Welche Spuren tragen das Ergebnis? Nenne ihre Nummern.",
  ],
  ["counter", "Gegenbefund: Was spricht am stärksten gegen dein Ergebnis?"],
  ["time", "Tatzeit: Was ist für den Zustand während der Tötungen belegt?"],
  ["limits", "Beweisgrenzen: Welche Feststellungen sind nicht möglich?"],
  ["revision", "Revision: Welche neue Spur würde dein Ergebnis verändern?"],
];
export default function Investigation({
  route,
  answers,
  update,
  go,
  reference,
}: Props) {
  const [message, setMessage] = useState("");
  const [activeClip, setActiveClip] = useState("wohnung");
  const entrySteps = ["Zwei Tote. Ein Überlebender.", "Spuren sichern", "Strafe oder Behandlung?", "Die Welt von 1888", "Wie konnte es dazu kommen?"];
  const storedStep = Number(answers["case:entry-step"] || 0);
  const entryStep = Number.isInteger(storedStep) && storedStep >= 0 && storedStep < 5 ? storedStep : 0;
  const pauseEntryFilms = () => document.querySelectorAll<HTMLVideoElement>(".entry-reader video").forEach(video => video.pause());
  const changeEntryStep = (step: number) => {
    pauseEntryFilms();
    update("case:entry-step", String(Math.max(0, Math.min(4, step))));
    requestAnimationFrame(() => document.getElementById("entry-navigation")?.scrollIntoView({ block: "start" }));
  };
  const evidence = readEvidence(answers["case:evidence"]);
  const field = (id: string, label: string, placeholder = "") => (
    <div key={id}><label className="case-field">
      {label}
      <textarea
        value={answers[id] || ""}
        onChange={(e) => update(id, e.target.value)}
        placeholder={placeholder}
      />
    </label><AnswerSupport value={answers[id] || ""} perspective={fieldPerspective(id)} /></div>
  );
  const ref = (p: number) => (
    <button key={p} className="textbutton" onClick={() => reference(p)}>
      Text S. {p}
    </button>
  );
  const heading = (kicker: string, title: string, lead: string) => (
    <header className="chapter-heading">
      <p className="eyebrow">{kicker}</p>
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
    </header>
  );
  if (route === "quellen") return <HistoricalSources answers={answers} update={update} />;
  if (route === "fall")
    return (
      <article className="case-file entry-reader">
        <div className="file-register">
          <span>AKTE THIEL / 1888</span>
          <span>Literarische Ermittlung · Ausgang offen</span>
          <span className="file-seal">Zurechnung ungeklärt</span>
        </div>
        {heading(
          "Der Fall Thiel · Gerhart Hauptmann, 1888",
          "Der Fall Thiel: Was ist geschehen?",
          "Zwei Tote in der Wohnung. Ein Mann auf den Gleisen. In seiner Hand die Mütze seines verstorbenen Sohnes.",
        )}
        <nav className="entry-navigation" id="entry-navigation" aria-label="Abschnitte der Einstiegsakte">
          <div className="entry-index">{entrySteps.map((name, index) => <button key={name} aria-current={entryStep === index ? "step" : undefined} onClick={() => changeEntryStep(index)}>{index + 1}. {name}</button>)}</div>
          <label className="entry-select">Abschnitt<select value={entryStep} onChange={event => changeEntryStep(Number(event.target.value))}>{entrySteps.map((name, index) => <option key={name} value={index}>{index + 1}. {name}</option>)}</select></label>
          <div className="entry-paging"><button disabled={entryStep === 0} onClick={() => changeEntryStep(entryStep - 1)}>Zurück</button><span aria-live="polite">{entryStep + 1} / 5 · {entrySteps[entryStep]}</span>{entryStep < 4 ? <button onClick={() => changeEntryStep(entryStep + 1)}>Weiter</button> : <button onClick={() => go("lesen/anfang")}>Text lesen</button>}</div>
        </nav>
        <div hidden={entryStep !== 0} className="entry-page" aria-label="Zwei Tote. Ein Überlebender.">
        <div className="clip-index" aria-label="Filmbeispiel wählen">{[["wohnung", "Die Wohnung"], ["gleise", "An den Gleisen"], ["anstalt", "In der Anstalt"]].map(([id, label]) => <button key={id} aria-pressed={activeClip === id} onClick={() => { pauseEntryFilms(); setActiveClip(id); }}>{label}</button>)}</div>
        <div className="evidence-divider">
          <span>1 · Zwei Tote. Ein Überlebender.</span>
          <span>DEFA · 1982</span>
        </div>
        <section
          className="film-exhibits"
          aria-label="Drei Filmspuren zum Ausgang des Falls"
        >
          {[
            {
              id: "wohnung",
              title: "Die Wohnung",
              time: "65:55–66:08 · 13 Sekunden",
              caption:
                "Die Kamera erschliesst den verwüsteten Raum und zeigt Lene auf dem Sofa.",
              alt: "Lene liegt reglos auf dem Sofa in der verwüsteten Wohnung.",
            },
            {
              id: "gleise",
              title: "Thiel an den Gleisen",
              time: "67:14–67:28 · 14 Sekunden",
              caption:
                "Thiel sitzt vor der Lokomotive und hält die Mütze seines Sohnes in den Händen.",
              alt: "Thiel sitzt an den Gleisen und hält Tobias’ Mütze.",
            },
            {
              id: "anstalt",
              title: "In der Anstalt",
              time: "69:08–69:24 · 16 Sekunden",
              caption:
                "Thiels Bewegungen und die Beobachtung durch das Personal bilden den Schluss der Filmhandlung.",
              alt: "Thiel steht in einem kargen Anstaltszimmer, einen Arm über dem Kopf.",
            },
          ].map((clip, index) => (
            <figure className="film-exhibit" key={clip.id} hidden={activeClip !== clip.id}>
              <video
                controls
                playsInline
                preload="none"
                poster={`${BASE}/media/fall/${clip.id}.jpg`}
                aria-label={`Filmspur ${index + 1}: ${clip.title}`}
                onPlay={(event) => {
                  const current = event.currentTarget;
                  current
                    .closest(".film-exhibits")
                    ?.querySelectorAll("video")
                    .forEach((video) => {
                      if (video !== current) video.pause();
                    });
                }}
              >
                <source
                  src={`${BASE}/media/fall/${clip.id}.mp4`}
                  type="video/mp4"
                />
                Dein Browser unterstützt die Videowiedergabe nicht.
              </video>
              <figcaption>
                <p className="eyebrow">
                  Filmspur {index + 1} · {clip.time}
                </p>
                <h2>{clip.title}</h2>
                <p>{clip.caption}</p>
                <a
                  href={`${BASE}/media/fall/${clip.id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Standbild öffnen: ${clip.alt}`}
                >
                  Standbild öffnen ↗
                </a>
                {" · "}
                <a href={`${BASE}/media/fall/${clip.id}.mp4`}>
                  Clip separat öffnen ↗
                </a>
              </figcaption>
            </figure>
          ))}
          <p className="film-source">
            Bahnwärter Thiel · DEFA, 1982. Zeitangaben beziehen sich auf die
            bereitgestellte Filmfassung. Die Bilder zeigen die filmische
            Interpretation; sie ersetzen keinen Textbeleg und kein Gutachten
            über Thiels Zustand zur Tatzeit.
          </p>
        </section>
        </div>
        <div hidden={entryStep !== 1} className="entry-page" aria-label="Spuren sichern">
        <section className="entry-stage" aria-labelledby="protokoll-heading">
          <p className="eyebrow">2 · Spuren sichern</p>
          <h2 id="protokoll-heading">Was wird gefunden, was wird beobachtet?</h2>
          <p>Halte Personen, Orte, Gegenstände und beobachtbares Verhalten fest. Trenne die Auffindesituation von Vermutungen über die Tat.</p>
        <details className="entry-module">
          <summary>Originalbefund lesen · Textseite 66</summary>
          <blockquote>{text.find((p) => p.page === 66)?.text}</blockquote>
          {ref(66)}
        </details>
        {field("case:befundprotokoll", "Dein Befundprotokoll: Beobachtung · Fundstelle · offene Frage", "Was ist im Film sichtbar? Was steht im Text? Was lässt sich daraus noch nicht schliessen?")}
          <details className="entry-module"><summary>Räumlichen Befund sichern: Skizze, Upload und Prüfung</summary>
            <CrimeSketch answers={answers} update={update} />
          </details>
        </section>
        </div>
        <div hidden={entryStep !== 2} className="entry-page" aria-label="Strafe oder Behandlung?">
        <div className="case-opening">
          <div>
            <p className="case-stamp">3 · Strafe oder Behandlung?</p>
            <h2>Gefängnis oder Krankenhaus?</h2>
            <p>
              Soll Thiel für die Tötungen bestraft werden, benötigt er psychiatrische Behandlung – und wie hängen diese Fragen zusammen? Entscheidend ist auch sein Zustand zur Tatzeit. Die Überführung in die Charité ist noch kein Urteil.
            </p>
            <details className="entry-module"><summary>Überlieferter Ablauf und offene Entscheidung</summary>
            <p>
              Arbeiter finden Lene und ihr kleines Kind getötet. Thiel sitzt an
              der Bahnstrecke. Er wird gewaltsam von den Gleisen entfernt,
              zunächst in ein Berliner Untersuchungsgefängnis und noch am ersten
              Tag in die psychiatrische Abteilung der Charité gebracht.
            </p>
            <p>
              <strong>
                Das ist der Schluss der Novelle. Er enthält weder eine
                Gerichtsverhandlung noch ein ärztliches Gutachten.
              </strong>
            </p>
            <div className="actions">
              <button className="primary" onClick={() => reference(65)}>
                Schlussprotokoll lesen · S. 65–66
              </button>
              <button onClick={() => go("kontext")}>
                Historischen Massstab klären →
              </button>
            </div>
            </details>
          </div>
        </div>
        </div>
        <div hidden={entryStep !== 3} className="entry-page" aria-label="Die Welt von 1888">
        <section className="entry-stage" aria-labelledby="background-heading">
          <p className="eyebrow">4 · Die Welt von 1888</p>
          <h2 id="background-heading">Welche Massstäbe gelten um 1888?</h2>
          <p>Strafrecht, Psychiatrie und gesellschaftliche Bedingungen liefern die Massstäbe für die Untersuchung. Danach wird die Vorgeschichte Abschnitt für Abschnitt am Text rekonstruiert.</p>
          <div className="actions"><button className="primary" onClick={() => go("kontext")}>Zeit, Recht und Psychiatrie</button><button onClick={() => go("quellen")}>Historische Originalquellen</button></div>
          <details className="entry-module"><summary>Ermittlungsauftrag und drei Untersuchungsfragen</summary>
        <div className="case-columns">
          <section className="panel padded">
            <h2>Auftrag der Spurensicherung</h2>
            <p>
              Rekonstruiere, was der Schluss voraussetzt. Sichere Textstellen,
              Filmbeobachtungen und historische Regeln getrennt. Prüfe zwei
              konkurrierende Erklärungen: verantwortliches Handeln und Verlust
              freier Willensbestimmung zur Tatzeit.
            </p>
            <p>
              Am Ende steht ein eigener{" "}
              <strong>
                Ermittlungsbericht mit Ergebnis, Belegen, Gegenbefund und
                Beweisgrenzen
              </strong>
              . Eine begründete Feststellung unzureichender Beweise ist ein
              Ergebnis; ein blosses „man weiss es nicht“ ist keines.
            </p>
          </section>
          <section className="panel padded">
            <h2>Drei verschiedene Fragen</h2>
            <ol>
              <li>
                <strong>Tat:</strong> Was wird über Lene, das Kind und Thiel
                berichtet, was bleibt ausgespart?
              </li>
              <li>
                <strong>Zurechnung:</strong> Was lässt sich über Thiels Zustand
                während der Tötungen erschliessen?
              </li>
              <li>
                <strong>Darstellung:</strong> Wie lenken Erzähler und Film
                unseren Befund?
              </li>
            </ol>
            <p>
              Frühere Pflichtverletzungen gegenüber Tobias, strafrechtliche
              Zurechnung der Tötungen und spätere Behandlungsbedürftigkeit sind
              nicht dasselbe.
            </p>
          </section>
        </div>
          </details>
          <details className="entry-module"><summary>Charité, Moabit und die Serienfolge: Bilder und Materialien</summary>
        <section
          className="institution-spread"
          aria-label="Bildbelege zu Medizin und Strafvollzug"
        >
          <figure className="archive-photo charite-photo">
            <a
              href={`${BASE}/media/fall/charite-1850.jpg`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={`${BASE}/media/fall/charite-1850.jpg`}
                alt="Historische Ansicht des Charité-Krankenhauses, 1850"
              />
            </a>
            <figcaption>
              <span className="exhibit-number">Beilage A / Medizin</span>
              <h2>Charité, 1850</h2>
              <p>
                Die Novelle nennt die psychiatrische Abteilung der Charité als
                Thiels letzten Aufenthaltsort. Die Gebäudeansicht zeigt die
                Institution, nicht seine konkrete Station.
              </p>
              <small>
                Anonyme Ansicht, 1850 · gemeinfrei ·{" "}
                <a
                  href="https://commons.wikimedia.org/wiki/File:Charite.JPG"
                  target="_blank"
                  rel="noreferrer"
                >
                  Bildnachweis ↗
                </a>
              </small>
            </figcaption>
          </figure>
          <figure className="archive-photo moabit-photo">
            <a
              href={`${BASE}/media/fall/moabit-1882.png`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={`${BASE}/media/fall/moabit-1882.png`}
                alt="Federzeichnung des Kriminalgerichtsgebäudes in Berlin-Moabit, 1882; das Untersuchungsgefängnis liegt dahinter"
              />
            </a>
            <figcaption>
              <span className="exhibit-number">
                Beilage B / Untersuchungshaft
              </span>
              <h2>Moabit, 1882</h2>
              <p>
                Die Federzeichnung zeigt das Kriminalgerichtsgebäude; dahinter
                liegt das Untersuchungsgefängnis. Der Komplex wurde 1877–1881
                gebaut und 1881 belegt, bestand also bereits bei Erscheinen der
                Novelle 1888. Moabit veranschaulicht den zeitgenössischen
                Haftort, ist aber nicht als Thiels Gefängnis belegt.
              </p>
              <small>
                Anonyme Federzeichnung, 1882 · gemeinfrei ·{" "}
                <a
                  href="https://commons.wikimedia.org/wiki/File:Berlin-Moabit-Kriminalgericht-1882.png"
                  target="_blank"
                  rel="noreferrer"
                >
                  Bildnachweis ↗
                </a>
                {" · "}
                <a
                  href="https://www.berlin.de/justizvollzug/anstalten/jva-moabit/die-anstalt/historie/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Anstaltsgeschichte ↗
                </a>
              </small>
            </figcaption>
          </figure>
          <aside className="file-margin">
            <span>Aktenvermerk</span>
            <p>
              Der Text nennt ein Berliner Untersuchungsgefängnis, aber keinen
              Namen. Untersuchungshaft, Strafvollzug und psychiatrische
              Unterbringung sind unterschiedliche Vorgänge.
            </p>
          </aside>
        </section>
        <section className="screening-note" aria-label="Serienfolge Charité">
          <span className="exhibit-number">
            Beilage C / Filmische Rekonstruktion
          </span>
          <div>
            <h2>Charité · Barmherzigkeit</h2>
            <p>
              Staffel 1, Folge 1. Eine zusätzliche Perspektive auf Krankenhaus,
              medizinische Autorität und soziale Hierarchien. Die historische
              Serie ist eine spätere Inszenierung, kein Dokument über Thiel.
            </p>
            <a
              className="episode-link"
              href="https://www.dropbox.com/scl/fi/e42zk5vr0iicc291ebj8v/Folge-1-Barmherzigkeit-S01E01.mp4?rlkey=etck8r642javgz2habtl2lc5e&amp;st=ffzyn1yi&amp;dl=0"
              target="_blank"
              rel="noreferrer"
            >
              ▶ Erste Folge ansehen: „Barmherzigkeit“ ↗
            </a>
          </div>
        </section>
          </details>
        </section>
        </div>
        <div hidden={entryStep !== 4} className="entry-page" aria-label="Wie konnte es dazu kommen?">
        <section className="entry-stage" aria-labelledby="repetition-heading">
          <p className="eyebrow">5 · Wie konnte es dazu kommen?</p>
          <h2 id="repetition-heading">Die Vorgeschichte am Wortlaut rekonstruieren.</h2>
          <p>Acht Abschnitte führen vom Alltag bis zum Zusammenbruch. In jedem Abschnitt stehen zuerst Originaltext und Film, danach Detailfragen mit Feedback und Musterüberlegungen. Sichere die Belege für dein späteres Ergebnis.</p>
          <button className="primary" onClick={() => go("lesen/anfang")}>Die Vorgeschichte lesen: Alltag und erste Bindung</button>
        </section>
        <details className="entry-module"><summary>Gesamter Ermittlungsweg und vorläufige Hypothese</summary>
        <section className="panel padded">
          <h2>Gang der Ermittlung</h2>
          <p><a href="#quellen">Historische Quellenakte: Gericht, Behandlung und philosophische Kritik</a></p>
          <ol className="case-steps">
            <li>
              <a href="#kontext">
                Tatort der Lektüre: Kaiserreich, Strafrecht, Psychiatrie.
              </a>
            </li>
            <li>
              <a href="#lesen/anfang">
                Genaue Textrepetition: acht Text- und Filmabschnitte vom Alltag bis
                zum Zusammenbruch.
              </a>
            </li>
            <li>
              <a href="#material">
                Neun Dossiers: 36 Passagen, drei Theorie-Videos und sieben
                Arbeitsbündel.
              </a>
            </li>
            <li>
              <a href="#spuren">
                Spurenregister: Aussage, Fundstelle, Gegenlesart, Beweiswert.
              </a>
            </li>
            <li>
              <a href="#bericht">Ermittlungsbericht: Charité oder Gefängnis?</a>
            </li>
          </ol>
          <p>
            Alle Akten bleiben direkt erreichbar. Die Reihenfolge organisiert
            die Ermittlung; sie sperrt keine Inhalte.
          </p>
        </section>
        {field(
          "case:initial",
          "Vorläufige Hypothese nach dem Schlussprotokoll",
          "Welche Erklärung steht zunächst im Raum – und was müsste sie belegen?",
        )}
        <button className="primary" onClick={() => go("lesen/anfang")}>
          Die Vorgeschichte am Text untersuchen
        </button>
        </details>
        </div>
        <p className="entry-footnote">Alle Abschnitte sind frei anwählbar. Notizen bleiben beim Wechsel erhalten.</p>
      </article>
    );
  if (route === "kontext")
    return (
      <>
        {heading(
          "Kontextakte · Literatur, Gesellschaft, Recht",
          "Ein Fall aus der Moderne.",
          "1888 ist das Erscheinungsjahr. Ein genaues Tatdatum nennt die Novelle nicht. Der historische Massstab wird deshalb als Kontext der Veröffentlichung rekonstruiert.",
        )}
        <p className="source-orientation"><a href="#quellen">Fünf Originalquellen: Gesetz, Gutachten, Pflege, Einrichtungen und Kritik an Strafe</a> · Drei aufklappbare Dossiers mit Fallfragen und Musterüberlegungen.</p>
        <div className="timeline">
          <article>
            <b>1871 / 1872</b>
            <p>
              Deutsches Kaiserreich; das Reichsstrafgesetzbuch von 1871 tritt
              1872 in Kraft.
            </p>
          </article>
          <article>
            <b>1888</b>
            <p>
              Hauptmann veröffentlicht <em>Bahnwärter Thiel</em>. Beruf, Körper,
              Abhängigkeit und Wahrnehmung stehen im Zentrum.
            </p>
          </article>
          <article>
            <b>1982</b>
            <p>
              Die DEFA-Verfilmung gestaltet den Stoff neu. Ihre Bilder sind eine
              spätere Lesart.
            </p>
          </article>
        </div>
        <section className="panel padded">
          <h2>Gerhart Hauptmann und der Naturalismus</h2>
          <p>
            Gerhart Hauptmann (1862–1946) gehört zu den prägenden Autoren des
            Naturalismus. <em>Bahnwärter Thiel</em> entstand in seiner frühen
            Schaffenszeit und wurde 1888 erstmals veröffentlicht. Hauptmann
            lebte zeitweise in Erkner; die märkische Bahnlandschaft ist deshalb
            kein beliebiger Schauplatz.
          </p>
          <p>
            Naturalistisches Erzählen nimmt Menschen in ihren körperlichen und
            sozialen Bedingungen ernst. In dieser Novelle werden Dienst,
            Haushalt, Sexualität, Trauer und Isolation zu Erklärungsfaktoren.
            Das ist keine Formel, nach der Umwelt zwangsläufig Gewalt erzeugt.
            Zugleich verdichten wiederkehrende Bilder, die Mütze und die Bahn
            das Geschehen literarisch. Ein Romanlabor ist kein Krankenblatt.
          </p>
          <p className="small">
            Quellen:{" "}
            <a
              href="https://www.hauptmannmuseum.de/publikationen"
              target="_blank"
              rel="noreferrer"
            >
              Gerhart-Hauptmann-Museum
            </a>{" "}
            ·{" "}
            <a
              href="https://www.uni-goettingen.de/de/704386.html"
              target="_blank"
              rel="noreferrer"
            >
              Universität Göttingen: Bahnwärter Thiel
            </a>
          </p>
        </section>
        <section className="panel padded">
          <h2>Kaiserreich: Fortschritt ohne gleiche Handlungsmacht</h2>
          <p>
            Das 1871 gegründete Deutsche Reich verbindet technische und
            wirtschaftliche Modernisierung mit ausgeprägten sozialen
            Hierarchien. Beruf, Herkunft und Geschlecht begrenzen Möglichkeiten.
            Frauen haben im Kaiserreich kein Reichstagswahlrecht; Erwerbsarbeit
            und Familienversorgung verschaffen ihnen dennoch keine
            gleichberechtigte öffentliche Stellung.
          </p>
          <p>
            Für die Fallakte folgt daraus eine konkrete Frage: Welche
            Entscheidungen sind im Haushalt tatsächlich möglich? Thiel nennt die
            Versorgung des Kindes als Heiratsgrund. Lene arbeitet im Haus und
            auf dem Feld. Diese Arbeit erklärt Abhängigkeiten; sie entschuldigt
            keine Misshandlung. Die Gewaltvorstellungen der Nachbarn gehören
            ebenfalls zum Befund.
          </p>
          <p>{[5, 6, 7, 14, 15].map(ref)}</p>
          <p className="small">
            Historischer Rahmen:{" "}
            <a
              href="https://www.dhm.de/lemo/kapitel/kaiserreich/alltagsleben"
              target="_blank"
              rel="noreferrer"
            >
              Deutsches Historisches Museum: Alltagsleben
            </a>{" "}
            ·{" "}
            <a
              href="https://www.dhm.de/lemo/kapitel/kaiserreich/innenpolitik/die-proletarische-frauenbewegung"
              target="_blank"
              rel="noreferrer"
            >
              Frauenbewegung und politische Ungleichheit
            </a>
            . Die Anwendung auf Thiels Haushalt ist eine Textinterpretation.
          </p>
        </section>
        <section className="panel padded">
          <h2>Die Bahn: System und einzelner Körper</h2>
          <p>
            Thiel führt keine Lokomotive. Er sichert einen Streckenabschnitt,
            bedient Barrieren und reagiert auf Signale. Die technische Ordnung
            verlangt zuverlässige Wiederholung. Seine Verletzungen zeigen die
            körperliche Gefahr; seine Routine bleibt zeitweise auch dann
            erhalten, als seine Wahrnehmung instabil wird.
          </p>
          <p>
            Ein Diensthandgriff beweist deshalb nicht automatisch freie
            Willensbestimmung bei einer anderen Handlung. Umgekehrt belegt
            belastende Arbeit allein keine Unzurechnungsfähigkeit. Die
            Ermittlung muss Zeitpunkt und Handlung benennen.
          </p>
          <p>{[3, 26, 27, 53, 54].map(ref)}</p>
        </section>
        <section className="panel padded legal">
          <p className="eyebrow">
            Historische Rechtsquelle · keine Anwendung heutigen Rechts
          </p>
          <h2>§ 51: Entscheidend ist die Tatzeit</h2>
          <p>
            § 51 des Reichsstrafgesetzbuchs von 1871 schloss Strafbarkeit aus,
            wenn Bewusstlosigkeit oder eine krankhafte Störung der
            Geistestätigkeit bei Begehung der Handlung die freie
            Willensbestimmung ausschloss. Späteres auffälliges Verhalten genügt
            dafür nicht von selbst. Der Paragraph ordnete nicht automatisch eine
            Einweisung in die Charité an.
          </p>
          <p>
            Die Leitfrage „Gefängnis?“ verkürzt die damaligen Strafarten: § 211
            sah für vorsätzliche Tötung mit Überlegung die Todesstrafe vor; §
            212 für vorsätzliche Tötung ohne Überlegung mindestens fünf Jahre
            Zuchthaus. Eine Ermittlung darf weder heutige Mordmerkmale noch
            heutige Unterbringungsregeln stillschweigend einsetzen.
          </p>
          <p className="small">
            <a href={law} target="_blank" rel="noreferrer">
              Primärquelle: Reichsstrafgesetzbuch 1871, §§ 51, 211, 212 ↗
            </a>
          </p>
          <h3>Prüfkette für den Bericht</h3>
          <ol>
            <li>Welches Verhalten ist für die konkrete Tat überliefert?</li>
            <li>
              Welche Indizien betreffen den Zustand davor, währenddessen und
              danach?
            </li>
            <li>
              Welche Folgerung trägt der historische Massstab – und welche
              nicht?
            </li>
          </ol>
        </section>
        <section className="panel padded">
          <h2>Charité: Behandlung, Beobachtung, institutionelle Macht</h2>
          <p>
            Die Charité ist ein Berliner Krankenhaus, kein Synonym für
            Freispruch. Im 19. Jahrhundert entwickelte sich dort die Psychiatrie
            als medizinisches Fach. Carl Westphal übernahm nach Wilhelm
            Griesinger die Leitung der Klinik für Geistes- und Nervenkranke und
            verband psychiatrische mit neurologischer Forschung und Lehre.
          </p>
          <p>
            Die Geschichte der Einrichtung umfasst schlechte Unterbringung und
            körperliche Zwangsmittel ebenso wie Reformbemühungen. Die Charité
            darf deshalb weder als heutige Therapieeinrichtung zurückprojiziert
            noch als blosse Strafe beschrieben werden. Der Erzähler nennt eine
            Überführung, aber keine Untersuchungsergebnisse. Historische
            Ausdrücke wie „Irrenabteilung“ werden als Quellenbegriffe kenntlich
            gemacht.
          </p>
          <p className="small">
            <a
              href="https://denkmaeler.charite.de/westphal/person.html"
              target="_blank"
              rel="noreferrer"
            >
              Charité: Carl Westphal und die Psychiatriegeschichte ↗
            </a>
          </p>
        </section>
        <section className="panel padded">
          <h2>Wer liefert die Beweise?</h2>
          <p>
            Die Novelle ist keine reale Strafakte. Der Erzähler kann
            Innenwahrnehmungen darstellen, die einer Polizei nicht direkt
            zugänglich wären. Die Tötungen werden ausgespart; die Entdeckung
            ihrer Folgen wird berichtet. Der Film ergänzt Gesichter, Stimmen,
            Räume und Abläufe. Diese Ergänzungen belegen die Interpretation der
            Verfilmung, nicht automatisch Hauptmanns Text.
          </p>
          <p>
            Im Spurenregister stehen daher{" "}
            <strong>
              Textbefund, Figurenwahrnehmung, Deutung und Filmgestaltung
            </strong>{" "}
            getrennt. Die Fallakte ist eine literarische Untersuchung mit
            historischem Rechtsmassstab, keine rückwirkende klinische Diagnose.
          </p>
        </section>
        <button className="primary" onClick={() => go("lesen/anfang")}>
          Die Vorgeschichte am Text untersuchen →
        </button>
      </>
    );
  if (route === "spuren")
    return (
      <>
        {heading(
          "Spurensicherung",
          "Das Spurenregister.",
          "Eine Aussage wird erst überprüfbar, wenn Herkunft, Fundstelle und Gegenlesart feststehen.",
        )}
        <section className="panel padded">
          <label>
            Herkunft
            <select
              value={answers["case:source"] || "Originaltext"}
              onChange={(e) => update("case:source", e.target.value)}
            >
              {[
                "Originaltext",
                "Figurenwahrnehmung im Text",
                "DEFA-Film 1982",
                "Historische Quelle",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          {field(
            "case:location",
            "Fundstelle",
            "Textseite / Filmminute / Titel und Paragraph der Quelle",
          )}
          {field(
            "case:quote",
            "Wortlaut oder konkret beschriebene Beobachtung",
          )}
          {field("case:claim", "Welche Behauptung stützt diese Spur?")}
          {field("case:counter", "Gegenlesart oder Grenze des Beweiswerts")}
          <label>
            Vorläufiger Beweiswert
            <select
              value={answers["case:weight"] || "offen"}
              onChange={(e) => update("case:weight", e.target.value)}
            >
              <option>offen</option>
              <option>belastend</option>
              <option>entlastend</option>
              <option>mehrdeutig</option>
            </select>
          </label>
          <button
            className="primary"
            onClick={() => {
              if (
                !answers["case:quote"]?.trim() ||
                !answers["case:location"]?.trim()
              ) {
                setMessage(
                  "Für einen Registereintrag fehlen noch Fundstelle oder Befund. Die übrigen Akten bleiben offen.",
                );
                return;
              }
              const e = {
                id: crypto.randomUUID(),
                source: answers["case:source"] || "Originaltext",
                location: answers["case:location"],
                quote: answers["case:quote"],
                claim: answers["case:claim"] || "",
                counter: answers["case:counter"] || "",
                weight: answers["case:weight"] || "offen",
              };
              update("case:evidence", JSON.stringify([...evidence, e]));
              ["quote", "claim", "counter", "location"].forEach((k) =>
                update("case:" + k, ""),
              );
              setMessage("Spur im Register gesichert.");
            }}
          >
            Spur registrieren
          </button>
          <p role="status">{message}</p>
        </section>
        {evidence.length === 0 && (
          <p>
            Noch keine registrierten Spuren. Im Leseraum lässt sich markierter
            Text mit „Markierung als Spur übernehmen“ in diese Maske übertragen.
          </p>
        )}
        {evidence.map((e, i) => (
          <article className="panel padded" key={e.id}>
            <p className="eyebrow">
              Spur {i + 1} · {e.source} · {e.weight}
            </p>
            <h2>{e.location}</h2>
            <blockquote>{e.quote}</blockquote>
            <p>
              <strong>These:</strong> {e.claim || "Noch offen."}
            </p>
            <p>
              <strong>Gegenlesart:</strong> {e.counter || "Noch nicht erfasst."}
            </p>
            <button
              onClick={() => {
                update("case:quote", e.quote);
                update("case:location", e.location);
                update("case:claim", e.claim);
                update("case:counter", e.counter);
                update("case:source", e.source);
                update("case:weight", e.weight);
                setMessage(
                  "Die Spur liegt als Vorlage in der Maske. Eine neue Registrierung erhält die alte Fassung.",
                );
              }}
            >
              Als neue Fassung aufnehmen
            </button>
          </article>
        ))}
        <button className="primary" onClick={() => go("bericht")}>
          Zum Ermittlungsbericht →
        </button>
      </>
    );
  if (route === "bericht")
    return (
      <>
        {heading(
          "Abschluss der Ermittlung",
          "Charité oder Gefängnis? Dein Befund.",
          "Die Entscheidung braucht Belege. Der stärkste Gegenbefund gehört in denselben Bericht.",
        )}
        <section className="panel padded">
          <p>
            <a href="#quellen">Historische Massstäbe für den Bericht prüfen</a><br />
            <strong>Aktenstand:</strong> {evidence.length} registrierte Spuren.{" "}
            <a href="#spuren">Register öffnen</a>
          </p>
          <label>
            Ergebnis der Untersuchung
            <select
              value={answers["case:outcome"] || ""}
              onChange={(e) => update("case:outcome", e.target.value)}
            >
              <option value="">Ergebnis auswählen</option>
              <option>
                Charité: psychiatrische Untersuchung vorrangig; Strafbarkeit
                bleibt gesondert zu prüfen
              </option>
              <option>
                Strafrechtliche Verantwortlichkeit: Ausschluss nach § 51 nicht
                ausreichend belegt
              </option>
              <option>
                Keine abschliessende Zurechnung aus dem überlieferten Material
                möglich
              </option>
            </select>
          </label>
          {fields.map(([id, label]) => field("case:report:" + id, label))}
          <div className="actions">
            <button
              onClick={() => {
                const missing = fields
                  .filter(([id]) => !answers["case:report:" + id]?.trim())
                  .map(([, l]) => l.split(":")[0]);
                setMessage(
                  `${answers["case:outcome"] ? "Ergebnis benannt." : "Ergebnis noch offen."} ${missing.length ? "Nicht ausgearbeitet: " + missing.join(", ") + "." : "Alle Berichtsbereiche sind ausgefüllt."} Die Prüfung kontrolliert Vollständigkeit, nicht die Gültigkeit des Urteils.`,
                );
              }}
            >
              Berichtsstruktur prüfen
            </button>
            <button
              className="primary"
              onClick={() =>
                saveFile(
                  [
                    "# Ermittlungsbericht · Bahnwärter Thiel",
                    "## Ergebnis",
                    answers["case:outcome"] || "Offen",
                    ...fields.map(
                      ([id, label]) =>
                        `## ${label}\n${answers["case:report:" + id] || "Noch offen."}`,
                    ),
                    "## Spurenregister",
                    ...evidence.map(
                      (e, i) =>
                        `### Spur ${i + 1}: ${e.location}\n${e.source} · ${e.weight}\n\n${e.quote}\n\nThese: ${e.claim}\nGegenlesart: ${e.counter}`,
                    ),
                  ].join("\n\n"),
                  "thiel-ermittlungsbericht.md",
                )
              }
            >
              Bericht exportieren
            </button>
          </div>
          <p role="status">{message}</p>
        </section>
        <details className="panel padded">
          <summary>
            Gegenprüfung: Was ein tragfähiges Ergebnis leisten muss
          </summary>
          <p>
            Der Wortlaut belegt die spätere Überführung und eine schwere Krise,
            aber keine gerichtliche Feststellung zur Tatzeit. Wer für
            strafrechtliche Verantwortlichkeit argumentiert, muss die Indizien
            für Wahrnehmungsstörungen bearbeiten. Wer deren Ausschluss annimmt,
            muss erklären, weshalb spätere Symptome Rückschlüsse auf die
            ausgesparte Tat erlauben. Die Sicherheit der Erzählung über das
            Ergebnis ersetzt diese Beweisführung nicht.
          </p>
          <p>
            Die Fürsorge für Tobias und die Gewalt gegen Lene und das kleine
            Kind dürfen weder gegeneinander aufgerechnet noch als eine einzige
            Tat behandelt werden. Ein belastbarer Bericht unterscheidet
            Erklärung, moralische Bewertung und strafrechtlichen Massstab.
          </p>
        </details>
        <button onClick={() => go("journal")}>
          Gesamte Arbeitsakte sichern →
        </button>
      </>
    );
  if (route.startsWith("theorie/")) {
    const r = material.theory.find((t) => route === "theorie/" + t.id);
    if (!r) return null;
    return (
      <>
        {heading(
          "Methodenakte · Video und Untersuchungsbegriffe",
          r.title,
          "Die Darstellungsweise ist Teil des Befunds.",
        )}
        <section className="panel padded">
          <video
            controls
            preload="none"
            className="theory-video"
            src={r.embedUrl}
          />
          <p className="small">
            {r.sourceTitle} ·{" "}
            <a href={r.openUrl} target="_blank" rel="noreferrer">
              Quelle separat öffnen
            </a>
          </p>
          <p>
            <strong>Begriffe:</strong> {r.keyIdeas.join(" · ")}
          </p>
          <h2>Untersuchungsfragen</h2>
          <ul>
            {r.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          <h3>Anwendung auf die Akte</h3>
          <ul>
            {r.transferPrompts.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          {field("material:theorie:" + r.id, "Methodenbefund mit Fundstelle")}
          <details>
            <summary>
              Einordnung und Formulierungsvorschlag aus dem Bestand
            </summary>
            <p>{r.summary}</p>
            <p>{r.writingFrame}</p>
            <p className="small">
              Das sind Interpretationsansätze, keine bereits bewiesenen
              Eigenschaften des Falls. „Produkt von Milieu“ bezeichnet eine
              Lesart; daraus folgt keine juristische Entlastung.
            </p>
          </details>
        </section>
        <a href="#material">Zur Materialakte →</a>
      </>
    );
  }
  const mod = material.modules.find((m) => route === "material/" + m.id);
  if (mod)
    return (
      <>
        {heading(
          "Materialdossier · " + mod.lens,
          mod.title,
          "Vier Passagen aus dem übernommenen Bestand. Jede These wird an der eingebundenen Ausgabe überprüft.",
        )}
        <section className="panel padded">
          <h2>Fragestellung</h2>
          <p>{mod.task}</p>
          <p>
            Die Fundstellen unten beziehen sich auf die gedruckten Seiten der
            aktuellen Textausgabe. Die abweichenden Seitenangaben des
            Ausgangsbestands bleiben im Quellenvermerk dokumentiert.
          </p>
          <div className="actions">
            {mod.relatedTheoryIds.map((id) => (
              <a key={id} href={"#theorie/" + id}>
                {material.theory.find((t) => t.id === id)?.title} ↗
              </a>
            ))}
          </div>
          <details>
            <summary>Ursprünglicher Modulauftrag</summary>
            <p>{mod.briefing}</p>
          </details>
        </section>
        {mod.entries.map((e) => (
          <section className="panel padded" key={e.id}>
            <p className="eyebrow">
              {e.id} · {e.passageLabel}
            </p>
            <h2>{e.title}</h2>
            <div>{e.refs.map(ref)}</div>
            <p>
              <strong>These aus dem Bestand – zu prüfen:</strong> {e.context}
            </p>
            <p className="small">
              Suchbegriffe, keine behaupteten Zitate:{" "}
              {e.signalWords.join(" · ")}
            </p>
            <ol>
              {e.prompts.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
            {field(
              "material:" + e.id,
              "Passagenbefund: Wortlaut, Folgerung, Gegenlesart",
            )}
            <details>
              <summary>Prüfraster und Formulierungsvorschlag</summary>
              <p>{e.writingFrame}</p>
              <p>
                Die Ausgangsthese ist keine Musterlösung. Der Befund muss eine
                konkrete Textstelle auswerten, einen Einwand bearbeiten und die
                Grenze zwischen Beobachtung und Schlussfolgerung benennen.
              </p>
              <ul>
                <li>Welche Wörter tragen die Behauptung?</li>
                <li>
                  Ist die behauptete Absicht erzählt oder nur erschlossen?
                </li>
                <li>
                  Betrifft die Stelle die Tatzeit oder eine andere Situation?
                </li>
              </ul>
            </details>
            <details>
              <summary>Quellenvermerk</summary>
              <p>
                Ausgangsbestand: {e.pageHint}. Neu zugeordnete Fundstellen der
                eingebundenen Ausgabe: {e.refs.join(", ")}. Die ursprüngliche
                Seitenzählung darf nicht als Sprungziel dieser Ausgabe verwendet
                werden.
              </p>
            </details>
            <div className="actions">
              {e.relatedTheoryIds.map((id) => (
                <a key={id} href={"#theorie/" + id}>
                  {material.theory.find((t) => t.id === id)?.shortTitle} ↗
                </a>
              ))}
              <button
                onClick={() => {
                  update("case:location", "Text S. " + e.refs.join(", "));
                  update("case:claim", answers["material:" + e.id] || "");
                  update("case:source", "Originaltext");
                  go("spuren");
                }}
              >
                Befund ins Spurenregister übernehmen
              </button>
            </div>
          </section>
        ))}
        <a href="#material">Alle Dossiers →</a>
      </>
    );
  if (route === "material")
    return (
      <>
        {heading(
          "Vollständige Materialakte",
          "Neun Dossiers. Drei Methoden.",
          "Der Bestand aus bahnwaerter_lektueretool ist hier nach Ermittlungsfragen erschlossen.",
        )}
        <section className="panel padded">
          <p>
            <strong>Bestand:</strong> 36 Passagen mit 108 Fragen, neun
            Modulaufträge, sieben Arbeitsbündel, drei Theorie-Videos samt
            Transferfragen und ein gesonderter Demonstrationsbestand.
          </p>
          <p>
            <a
              href="https://github.com/PatrickFischerKSA/bahnwaerter_lektueretool"
              target="_blank"
              rel="noreferrer"
            >
              Herkunft des Materials ↗
            </a>{" "}
            ·{" "}
            <a href={`${BASE}/material/lektueretool-quellbestand.zip`}>
              Quellbestand als ZIP
            </a>
          </p>
          <p className="small">
            Stand: {material.sourceCommit.slice(0, 7)}. Interpretationsvorgaben
            des Bestands werden als prüfbare Thesen ausgewiesen. Die Fundstellen
            wurden für den Leseraum neu zugeordnet. Konten, Klassenfreigaben und
            servergestützte Reviews der Ausgangssoftware sind kein Bestandteil
            dieser lokalen Arbeitsakte.
          </p>
        </section>
        <div className="dossier-grid">
          {material.modules.map((m, i) => (
            <a
              className="panel padded dossier-link"
              key={m.id}
              href={"#material/" + m.id}
            >
              <p className="eyebrow">Dossier {i + 1} · 4 Passagen</p>
              <h2>{m.title}</h2>
              <p>{m.lens}</p>
              <b>Untersuchungsakte öffnen →</b>
            </a>
          ))}
        </div>
        <h2>Methodenakten mit Video</h2>
        <div className="dossier-grid">
          {material.theory.map((t) => (
            <a
              className="panel padded dossier-link"
              key={t.id}
              href={"#theorie/" + t.id}
            >
              <h2>{t.title}</h2>
              <p>{t.sourceTitle}</p>
              <b>Video und Fragen →</b>
            </a>
          ))}
        </div>
        <h2>Sieben Arbeitsbündel des Bestands</h2>
        {material.lessons.map((l) => (
          <section className="panel padded" key={l.id}>
            <h3>{l.title.replace("Lektion", "Bündel")}</h3>
            <p>{l.summary}</p>
            <p>
              <strong>Untersuchungsauftrag:</strong> {l.sebPrompt}
            </p>
            <p>
              <strong>Prüffokus:</strong> {l.reviewFocus}
            </p>
            <div className="actions">
              {l.moduleIds.map((id) => (
                <a key={id} href={"#material/" + id}>
                  {material.modules.find((m) => m.id === id)?.title} ↗
                </a>
              ))}
            </div>
            {field("material:" + l.id, "Synthese des Dossiers")}
          </section>
        ))}
        <details className="panel padded">
          <summary>Arbeitsverfahren des Ausgangsbestands</summary>
          <ul>
            {material.starter.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <p>
            In dieser Ermittlung werden die Einträge als überprüfbare Spuren
            registriert. Überarbeitungen können als neue Registerfassung
            erhalten und die gesamte Akte als Datei gesichert werden.
          </p>
        </details>
        <section className="panel padded">
          <h2>Separater Demonstrationsbestand</h2>
          <p>
            <strong>
              Die folgenden vier Texte sind erfundene Übungstexte aus dem
              Software-Demoprojekt. Sie stammen nicht von Hauptmann und sind
              keine Beweise im Fall Thiel.
            </strong>
          </p>
          {demo.segments.map((s) => (
            <details key={s.id}>
              <summary>{s.title}</summary>
              <blockquote>{s.content}</blockquote>
            </details>
          ))}
          <h3>Drei zugehörige Aufträge</h3>
          {demo.tasks.map((t) => (
            <div key={t.id}>
              <p><strong>{t.title}:</strong> {t.prompt}</p>
              {field("material:demo:" + t.id, "Eigener Befund zum Übungstext")}
            </div>
          ))}
          <h3>Rubrik des Ausgangsbestands</h3>
          {demo.rubrics[0].criteria.map((c) => (
            <p key={c.id}>
              <strong>{c.label}:</strong> {c.description}
            </p>
          ))}
          <details>
            <summary>Beispiel einer Annotation und ihrer Revision</summary>
            <p>
              Die anonymisierten Beispieldaten demonstrieren die Überarbeitung
              einer Deutung; sie werden nicht als reale Klassenarbeiten
              ausgegeben.
            </p>
            {demo.annotations.map((a) => (
              <div key={a.id}>
                <blockquote>{a.quote}</blockquote>
                {demo.annotationVersions
                  .filter((v) => v.annotationId === a.id)
                  .map((v) => (
                    <div key={v.id}>
                      <h4>{v.title}</h4>
                      <p>{v.body}</p>
                    </div>
                  ))}
              </div>
            ))}
            <h3>Rückmeldungen und Revisionen aus dem Demobestand</h3>
            {demo.threads
              .flatMap((t) => t.messages)
              .map((m) => (
                <p key={m.id}>{m.body}</p>
              ))}
          </details>
        </section>
      </>
    );
  return null;
}
