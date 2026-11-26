"use client";
import { useEffect, useRef, useState } from "react";
import AnswerSupport from "./answer-support";
import { questionAngle } from "./solution-perspectives";
import chapters from "./chapters.json";
import pages from "./text.json";
import Trial from "./trial";
import Investigation from "./investigation";
import { stations } from "./legacy-data";
import { assess, factWarnings } from "./lib/feedback.mjs";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const FILM =
  "https://www.dropbox.com/scl/fi/qk4hy2y67dtb4k4fht0qi/Bahnwaerter-Thiel-DEFA-1982.mp4?rlkey=081ob7k97ko7pyfq1gtm1xm4c&raw=1";
const KEY = "bahnwaerter-lesestrecke:v2";
type Question = (typeof chapters)[number]["questions"][number];
const time = (n: number) =>
  `${Math.floor(n / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(n % 60)
    .toString()
    .padStart(2, "0")}`;
function download(body: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function QuestionCard({
  q,
  value,
  onChange,
  onRef,
}: {
  q: Question;
  value: string;
  onChange: (s: string) => void;
  onRef: (p: number) => void;
}) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), 650);
    return () => clearTimeout(id);
  }, [value]);
  const result = assess(debounced, q.criteria);
  const warnings = factWarnings(debounced, q.refs);
  return (
    <article className="question">
      <label htmlFor={q.id}>
        <h3>{q.prompt}</h3>
      </label>
      <textarea
        id={q.id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Befund · Fundstelle · Folgerung · Gegenlesart"
      />
      <div className="feedback" aria-live="polite">
        {debounced.trim() ? (
          <>
            {warnings.map((w: { text: string; page: number }) => (
              <p className="correction" key={w.text}>
                <strong>Faktenkorrektur: </strong>
                {w.text}{" "}
                <button className="textbutton" onClick={() => onRef(w.page)}>
                  Textseite {w.page}
                </button>
              </p>
            ))}
            {result.found.length > 0 && (
              <p>
                <strong>Erkannte Aspekte:</strong>{" "}
                {result.found.join(" · ")}.
              </p>
            )}
            {result.missing.length > 0 ? (
              <p>
                <strong>Offene Aspekte:</strong> {result.missing.join(" · ")}. Falls
                du diese Aspekte anders formuliert hast, vergleiche selbst mit
                den Lösungsperspektiven.
              </p>
            ) : (
              <p>
                Die zentralen Stichwortfelder sind angesprochen. Prüfe jetzt, ob
                dein Beleg die Aussage wirklich trägt und ob du Gegenargumente
                berücksichtigst.
              </p>
            )}
            <p className="small">
              Wortfelder, Synonyme und kleine Tippfehler werden berücksichtigt.
              Diese Rückmeldung erkennt keine vollständige Argumentation und
              bewertet deine Antwort nicht als richtig oder falsch.
            </p>
          </>
        ) : (
          <p>
            Die Rückmeldung erscheint beim Schreiben. Lösungsperspektiven und
            Textstellen sind jederzeit zugänglich.
          </p>
        )}
      </div>
      <div className="references">
        Nachlesen:{" "}
        {q.refs.map((p) => (
          <button key={p} className="textbutton" onClick={() => onRef(p)}>
            S. {p}
          </button>
        ))}
      </div>
      <AnswerSupport value={value} perspective={{
        angles: q.perspectives,
        evidence: `Text S. ${q.refs.join(', ')}. Wähle selbst einen kurzen Wortbeleg; beim Filmvergleich zusätzlich eine Zeitmarke.`,
        limit: 'Unterscheide ausdrücklich erzählte Angaben, Urteile anderer Figuren und eigene Deutungen. Welche Einschränkung braucht dein Ergebnis?'
      }} />
    </article>
  );
}
export default function Home() {
  const [route, setRoute] = useState("fall");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [filmSource, setFilmSource] = useState(FILM);
  const [filmActive, setFilmActive] = useState(false);
  const [filmError, setFilmError] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [highlight, setHighlight] = useState<number | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const main = useRef<HTMLElement>(null);
  const localURL = useRef("");
  useEffect(() => {
    const sync = () => {
      let r = decodeURIComponent(location.hash.slice(1)) || "fall";
      if (stations.some((s) => s.id === r)) r = "vertiefung/" + r;
      if (r === "inhalt") return;
      if (r === "strecke") r = "lesen/anfang";
      setRoute(r);
      setFilmActive(false);
      setFilmError(false);
    };
    sync();
    addEventListener("hashchange", sync);
    try {
      const old = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (old.answers && typeof old.answers === "object")
        setAnswers(
          Object.fromEntries(
            Object.entries(old.answers).filter(
              ([, v]) => typeof v === "string",
            ),
          ) as Record<string, string>,
        );
      if (typeof old.name === "string") setName(old.name);
    } catch {
      setNotice(
        "Der gespeicherte Arbeitsstand konnte nicht gelesen werden. Du kannst weiterhin arbeiten und exportieren.",
      );
    }
    setReady(true);
    return () => {
      removeEventListener("hashchange", sync);
      if (localURL.current) URL.revokeObjectURL(localURL.current);
    };
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(KEY, JSON.stringify({ name, answers }));
      } catch {
        setNotice(
          "Speichern im Browser ist nicht möglich. Bitte sichere dein Arbeitsjournal als Datei.",
        );
      }
  }, [name, answers, ready]);
  const index = Math.max(
    0,
    chapters.findIndex((c) => "lesen/" + c.id === route),
  );
  const chapter = chapters[index];
  const isReading = route.startsWith("lesen/");
  const station = stations.find((s) => "vertiefung/" + s.id === route);
  useEffect(() => {
    if (highlight !== null && isReading) {
      const id = setTimeout(
        () =>
          document
            .getElementById("text-" + highlight)
            ?.scrollIntoView({ block: "center", behavior: "smooth" }),
        100,
      );
      return () => clearTimeout(id);
    }
  }, [highlight, route, isReading]);
  function go(path: string) {
    setHighlight(null);
    location.hash = path;
    main.current?.scrollIntoView({ block: "start" });
  }
  function reference(p: number) {
    const c = chapters.find((c) => p >= c.pages[0] && p <= c.pages[1]);
    setShowPDF(false);
    if (c) {
      location.hash = "lesen/" + c.id;
      setHighlight(p);
      setTimeout(
        () =>
          document
            .getElementById("text-" + p)
            ?.scrollIntoView({ block: "center", behavior: "smooth" }),
        120,
      );
    }
  }
  function update(id: string, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }
  function exportWork() {
    download(
      [
        "# Bahnwärter Thiel · Text und Film",
        name ? `Name: ${name}` : "",
        ...chapters.flatMap((c) => [
          `## ${c.title}`,
          `Text S. ${c.pages.join("–")} · Film ${time(c.start)}–${time(c.end)}`,
          ...c.questions.map(
            (q) =>
              `### ${q.prompt}\n\n${answers[q.id] || "_Noch keine Notiz._"}`,
          ),
        ]),
        ...stations.map(
          (s) =>
            `## Vertiefung · ${s.title}\n\n${s.prompt}\n\n${answers[s.id] || "_Noch keine Notiz._"}`,
        ),
        ...Object.entries(answers)
          .filter(([k]) => k.startsWith("case:") || k.startsWith("material:"))
          .map(([k, v]) => `## ${k}\n\n${v}`),
      ].join("\n\n"),
      "bahnwaerter-thiel-lesejournal.md",
      "text/markdown;charset=utf-8",
    );
  }
  const sourceNotes = (
    <details className="sources">
      <summary>Ausgaben, Filmfassung und Quellen</summary>
      <p>
        <strong>Text:</strong> Gerhart Hauptmann, <em>Bahnwärter Thiel</em>{" "}
        (1888). Eingebunden ist ausschliesslich der Erzähltext der vorliegenden
        Reclam-Ausgabe, Textseiten 3–66, ohne Nachwort. Die Seitenzahlen
        beziehen sich auf die gedruckte Paginierung; PDF-Blatt 1 entspricht
        Textseite 3. Die Leseansicht wurde aus dem PDF übertragen; bei Zweifeln
        gilt das sichtbare Original im PDF.
      </p>
      <p>
        <a
          href={`${BASE}/media/bahnwaerter-thiel-text.pdf`}
          target="_blank"
          rel="noreferrer"
        >
          Erzähltext als PDF öffnen ↗
        </a>
      </p>
      <p>
        <strong>Film:</strong> <em>Bahnwärter Thiel</em>, Regie Hans-Joachim
        Kasprzik, DEFA / Fernsehen der DDR, 1982. Die bereitgestellte Datei
        dauert 72:20 Minuten und hat eine Bildauflösung von 384 × 288 Pixeln.
        Filmstills stammen aus dieser Datei. Die Zeitfenster sind didaktische
        Vergleichsabschnitte; der Film erzählt nicht durchgehend in derselben
        Reihenfolge wie die Novelle.
      </p>
      <p>
        <a
          href="https://goethe.klassik-stiftung.de/de/objekt/gnd/1121210325/"
          target="_blank"
          rel="noreferrer"
        >
          Filmnachweis der Klassik Stiftung Weimar ↗
        </a>{" "}
        ·{" "}
        <a href={FILM} target="_blank" rel="noreferrer">
          Bereitgestellte Filmdatei ↗
        </a>
      </p>
    </details>
  );
  return (
    <>
      <a href="#inhalt" className="skip">
        Zum Inhalt
      </a>
      <header className="masthead">
        <a href="#fall" className="brand">
          Bahnwärter <em>Thiel</em>
          <span>Gerhart Hauptmann · 1888 / DEFA · 1982</span>
        </a>
        <a href="#journal">Arbeitsakte ↗</a>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <p className="eyebrow">Ermittlungsakte Thiel</p>
          <nav aria-label="Ermittlungsweg">
            <h2>01 · Fall und Massstab</h2>
            <a
              href="#fall"
              aria-current={route === "fall" ? "page" : undefined}
            >
              Zwei Tote. Ein Überlebender.
            </a>
            <a
              href="#kontext"
              aria-current={route === "kontext" ? "page" : undefined}
            >
              Zeit, Recht und Psychiatrie
            </a>
            <h2>02 · Wie konnte es dazu kommen?</h2>
            {chapters.map((c, i) => (
              <a
                aria-current={route === "lesen/" + c.id ? "page" : undefined}
                href={"#lesen/" + c.id}
                key={c.id}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {c.title}
              </a>
            ))}
            <h2>03 · Die Prozessakte</h2>
            <a href="#prozess/vorbereitung" aria-current={route === "prozess/vorbereitung" ? "page" : undefined}>Die Verfahrensbeteiligten</a>
            <a href="#material">Neun Dossiers & Theorie-Videos</a>
            <a href="#quellen" aria-current={route === "quellen" ? "page" : undefined}>Historische Quellen: Recht & Behandlung</a>
            <a href="#spuren">Spurenregister</a>
            <h2>04 · Die Hauptverhandlung</h2>
            <a href="#prozess/verhandlung" aria-current={route === "prozess/verhandlung" ? "page" : undefined}>Beweisaufnahme und Plädoyers</a>
            {stations.map((s) => (
              <a
                aria-current={station?.id === s.id ? "page" : undefined}
                href={"#vertiefung/" + s.id}
                key={s.id}
              >
                {s.number} · {s.title}
              </a>
            ))}
            <h2>05 · Das Urteil</h2>
            <a href="#prozess/urteil" aria-current={route === "prozess/urteil" ? "page" : undefined}>Urteilsberatung und Verkündung</a>
            <a href="#bericht">Ermittlungsbericht</a>
            <a
              href="#grundlagen"
              aria-current={route === "grundlagen" ? "page" : undefined}
            >
              Begriffsregister
            </a>
            <a
              href="#journal"
              aria-current={route === "journal" ? "page" : undefined}
            >
              Lesejournal & Export
            </a>
          </nav>
          <p className="small">
            Freie Reihenfolge möglich. Keine Pflichtantworten, keine
            Freischaltungen.
          </p>
        </aside>
        <main id="inhalt" ref={main} tabIndex={-1}>
          {notice && (
            <p role="status" className="notice">
              {notice}
            </p>
          )}
          {route.startsWith("prozess/") ? <Trial key={route} route={route} answers={answers} update={update} /> : ["fall", "kontext", "spuren", "bericht", "material", "quellen"].includes(
            route,
          ) ||
          route.startsWith("material/") ||
          route.startsWith("theorie/") ? (
            <Investigation
              key={route}
              route={route}
              answers={answers}
              update={update}
              go={go}
              reference={reference}
            />
          ) : isReading ? (
            <>
              <header className="chapter-heading">
                <p className="eyebrow">
                  Rekonstruktion · Abschnitt {index + 1} von 8
                </p>
                <h1>{chapter.title}</h1>
                <p className="lead">{chapter.focus}</p>
                <p className="meta">
                  Textseiten {chapter.pages.join("–")} <span>·</span> Film{" "}
                  {time(chapter.start)}–{time(chapter.end)}
                </p>
              </header>
              {index === 0 && (
                <p className="intro">
                  Vom Schluss zurück zur Vorgeschichte: Welche Befunde erklären
                  die Eskalation, welche erlauben Aussagen über die Zurechnung?
                  Text und Film werden getrennt ausgewertet. Der Erzählerbericht
                  ist keine Vernehmungsakte; die Verfilmung ist eine spätere
                  Interpretation.
                </p>
              )}
              <div className="reading-grid">
                <section className="reader panel" aria-label="Originaltext">
                  <div className="panel-title">
                    <h2>1 · Den Text lesen</h2>
                    <button onClick={() => setShowPDF(!showPDF)}>
                      {showPDF ? "Leseansicht" : "Original-PDF"}
                    </button>
                  </div>
                  {showPDF ? (
                    <>
                      <iframe
                        title="Originaltext als PDF"
                        src={`${BASE}/media/bahnwaerter-thiel-text.pdf#page=${chapter.pages[0] - 2}`}
                        className="pdf"
                      />
                      <p>
                        <a
                          href={`${BASE}/media/bahnwaerter-thiel-text.pdf#page=${chapter.pages[0] - 2}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          PDF separat öffnen ↗
                        </a>
                      </p>
                    </>
                  ) : (
                    <div className="text-scroll" key={chapter.id}>
                      {pages
                        .filter(
                          (p) =>
                            p.page >= chapter.pages[0] &&
                            p.page <= chapter.pages[1],
                        )
                        .map((p) => (
                          <section
                            id={"text-" + p.page}
                            key={p.page}
                            className={
                              highlight === p.page
                                ? "text-page highlighted"
                                : "text-page"
                            }
                          >
                            <p className="page-number">Textseite {p.page}</p>
                            <p>{p.text}</p>
                          </section>
                        ))}
                    </div>
                  )}
                  <button
                    className="capture"
                    onClick={() => {
                      const quote = window.getSelection()?.toString().trim();
                      if (!quote) {
                        setNotice(
                          "Zuerst eine Passage im Originaltext markieren.",
                        );
                        return;
                      }
                      update("case:quote", quote);
                      update(
                        "case:location",
                        "Text S. " +
                          chapter.pages.join("–") +
                          " (genaue Seite ergänzen)",
                      );
                      update("case:source", "Originaltext");
                      go("spuren");
                    }}
                  >
                    Markierung als Spur übernehmen
                  </button>
                  <p className="small reader-note">
                    Seitenzahlen entsprechen dem gedruckten Text. Du kannst
                    zwischen Leseansicht und Original-PDF wechseln.
                  </p>
                </section>
                <section className="film panel" aria-label="Filmfenster">
                  <div className="panel-title">
                    <h2>2 · Die Filmfassung sehen</h2>
                    <span>
                      {time(chapter.start)}–{time(chapter.end)}
                    </span>
                  </div>
                  {filmActive ? (
                    <video
                      key={chapter.id + filmSource}
                      ref={video}
                      controls
                      playsInline
                      preload="metadata"
                      poster={`${BASE}/media/${chapter.id}.jpg`}
                      src={`${filmSource}#t=${chapter.start},${chapter.end}`}
                      onLoadedMetadata={(e) => {
                        e.currentTarget.currentTime = chapter.start;
                      }}
                      onTimeUpdate={(e) => {
                        if (e.currentTarget.currentTime >= chapter.end) {
                          e.currentTarget.pause();
                        }
                      }}
                      onError={() => setFilmError(true)}
                      aria-label={"Film: " + chapter.title}
                    />
                  ) : (
                    <button
                      className="poster"
                      onClick={() => setFilmActive(true)}
                      aria-label="Filmfenster laden"
                    >
                      <img
                        src={`${BASE}/media/${chapter.id}.jpg`}
                        alt={`Standbild aus dem zugeordneten Filmabschnitt: ${chapter.title}`}
                      />
                      <span>▶ Filmfenster laden</span>
                    </button>
                  )}
                  <div className="film-copy">
                    {filmActive && (
                      <button
                        onClick={() => {
                          if (video.current) {
                            video.current.pause();
                            video.current.currentTime = chapter.start;
                          }
                        }}
                      >
                        Zum Beginn dieses Filmfensters
                      </button>
                    )}
                    <p>
                      <strong>Beim Vergleichen beachten:</strong>{" "}
                      {chapter.filmnote}
                    </p>
                    <p className="small">
                      Nach dem Laden auf ▶ drücken. Der Film hält am Ende dieses
                      Zeitfensters an. Der nächste Abschnitt bleibt frei
                      anwählbar.
                    </p>
                    {filmError && (
                      <p role="alert">
                        Die Filmdatei konnte hier nicht geladen werden. Öffne
                        die bereitgestellte Datei oder wähle deine
                        heruntergeladene Kopie unten aus.
                      </p>
                    )}
                    <details>
                      <summary>Filmquelle und alternative Wiedergabe</summary>
                      <p>
                        Der Player lädt die bereitgestellte Dropbox-Datei. Bei
                        langsamer Verbindung kannst du dieselbe Datei lokal
                        auswählen; sie wird nicht hochgeladen.
                      </p>
                      <label>
                        Eigene Filmdatei wählen
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (localURL.current)
                                URL.revokeObjectURL(localURL.current);
                              localURL.current = URL.createObjectURL(file);
                              setFilmSource(localURL.current);
                              setFilmActive(true);
                              setFilmError(false);
                            }
                          }}
                        />
                      </label>
                      <a href={FILM} target="_blank" rel="noreferrer">
                        Film separat öffnen ↗
                      </a>
                    </details>
                  </div>
                </section>
              </div>
              <p className="case-context-links">
                <a href="#spuren">Spurenregister</a> ·{" "}
                <a href="#material">Passagendossiers & Theorie-Videos</a> ·{" "}
                <a href="#kontext">Historischer Massstab</a>
              </p>
              <section className="questions">
                <p className="eyebrow">Auswertung des Materials</p>
                <h2>3 · Befundaufnahme</h2>
                <p>
                  Jede Folgerung braucht eine Fundstelle. Textbefund,
                  Figurenwahrnehmung und Filmgestaltung werden getrennt erfasst.
                  Musterlösungen stehen als Vergleichsbefunde bereit.
                </p>
                {chapter.questions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    q={q}
                    value={answers[q.id] || ""}
                    onChange={(v) => update(q.id, v)}
                    onRef={reference}
                  />
                ))}
              </section>
              <div className="page-nav">
                {index > 0 ? (
                  <button onClick={() => go("lesen/" + chapters[index - 1].id)}>
                    ← Vorheriger Abschnitt
                  </button>
                ) : (
                  <span />
                )}
                {index < 7 ? (
                  <button
                    className="primary"
                    onClick={() => go("lesen/" + chapters[index + 1].id)}
                  >
                    Weiter: {chapters[index + 1].title} →
                  </button>
                ) : (
                  <button className="primary" onClick={() => go("prozess/vorbereitung")}>
                    Rollen verteilen und Prozess vorbereiten →
                  </button>
                )}
              </div>
              {sourceNotes}
            </>
          ) : station ? (
            <>
              <header className="chapter-heading">
                <p className="eyebrow">
                  Gegenprüfung · Dossier {station.number} von 07
                </p>
                <h1>{station.title}</h1>
                <p className="lead">{station.kicker}</p>
              </header>
              <p className="intro">
                Sieben Deutungsansätze aus dem bisherigen Bestand. Ihre Thesen
                stehen zur Prüfung; Gegenbefunde gehören in die Untersuchung.
                Die Text- und Filmakten liefern das Material.
              </p>
              <section className="panel padded">
                <p className="eyebrow">Eine These zum Prüfen</p>
                <p className="lead">{station.thesis}</p>
                <ul>
                  {station.focus.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <h2>{station.prompt}</h2>
                <details>
                  <summary>Untersuchungsansatz</summary>
                  <p>{station.scaffold}</p>
                </details>
                <label htmlFor={"legacy-" + station.id}>
                  Befund mit Beleg und Gegenlesart
                </label>
                <textarea
                  id={"legacy-" + station.id}
                  value={answers[station.id] || ""}
                  onChange={(e) => update(station.id, e.target.value)}
                  placeholder="Beobachtung → Beleg → Deutung …"
                />
                <AnswerSupport value={answers[station.id] || ""} perspective={{ angles: [questionAngle(station.prompt), ...station.focus.map(f => `Prüfe „${f}“ an einer konkreten Stelle: Stützt oder begrenzt sie deine These?`)], evidence: 'Für jede verglichene Passage Seite und Wortlaut angeben.', limit: `Die These „${station.thesis}“ auf einen Gegenbefund prüfen; sie darf im Ergebnis auch eingeschränkt werden.` }} />
                <p className="small">
                  {
                    (answers[station.id] || "")
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length
                  }{" "}
                  Wörter · Dein Arbeitsstand bleibt in diesem Browser. Keine
                  Mindestlänge.
                </p>
                <details>
                  <summary>Die eigene Argumentation prüfen</summary>
                  <ul>
                    <li>
                      Habe ich eine konkrete Stelle genannt, die meine Aussage
                      tatsächlich stützt?
                    </li>
                    <li>
                      Trenne ich die Wahrnehmung einer Figur von einer
                      gesicherten Tatsache?
                    </li>
                    <li>Welche andere Deutung lässt meine Stelle zu?</li>
                    <li>
                      Erkläre ich Bedingungen des Verhaltens, ohne Gewalt damit
                      zu entschuldigen?
                    </li>
                  </ul>
                </details>
                <a href="#grundlagen">Begriffe nachschlagen →</a>
              </section>
              <div className="page-nav">
                <button onClick={() => go("lesen/anfang")}>
                  Zum Text und Film
                </button>
                <button
                  className="primary"
                  onClick={() =>
                    go(
                      station.id === "deutung"
                        ? "prozess/verhandlung"
                        : "vertiefung/" +
                            stations[stations.indexOf(station) + 1].id,
                    )
                  }
                >
                  {station.id === "deutung"
                    ? "Einwände in die Verhandlung einbringen"
                    : "Nächste Vertiefung →"}
                </button>
              </div>
              {station.id === "deutung" && (
                <section className="panel padded">
                  <p className="eyebrow">Ankunft</p>
                  <h2>Ergebnis und Beweisgrenzen.</h2>
                  <p>
                    Bringe die Spannungen des Textes in die Verhandlung ein:
                    Wie verhält sich Thiels Prägung zu seiner Verantwortlichkeit?
                    Welche Rolle spielt die Technik neben menschlichen Handlungen?
                    Wann erscheint Natur als Wahrnehmungsraum, wann wäre die
                    Deutung als Seelenspiegel zu einfach? Diese Fragen legen das
                    Urteil nicht vorab fest.
                  </p>
                </section>
              )}
            </>
          ) : route === "grundlagen" ? (
            <>
              <header className="chapter-heading">
                <p className="eyebrow">Begleitwissen · nach Bedarf</p>
                <h1>Begriffe der Textuntersuchung.</h1>
                <p className="lead">
                  Erzählverfahren, soziale Bedingungen und Beweiswert sind
                  verschiedene Ebenen der Untersuchung.
                </p>
              </header>
              <div className="glossary">
                {[
                  [
                    "Autor und Erzähler",
                    "Gerhart Hauptmann ist der historische Verfasser. Der Erzähler ist die Stimme, die uns die Geschichte vermittelt. Aussagen über Thiel sind deshalb nicht automatisch Hauptmanns persönliche Urteile. Frage: Wer nimmt hier etwas wahr, und was kann diese Stimme wissen?",
                  ],
                  [
                    "Novelle",
                    "Eine vergleichsweise kurze Erzählung, die ein besonderes Geschehen konzentriert entfaltet. Wiederkehrende Dinge und Wendepunkte verbinden einzelne Szenen. Prüfe am Text, wie seine Teile aufeinander bezogen sind; ein überraschendes Ereignis allein beweist die Gattung nicht.",
                  ],
                  [
                    "Naturalismus",
                    "Eine literarische Richtung des späten 19. Jahrhunderts. Sie interessiert sich unter anderem dafür, wie Lebensumstände, Körper, Arbeit und soziale Beziehungen Menschen prägen. Hauptmanns genaue Schilderungen lassen sich damit untersuchen. Das bedeutet nicht, dass seine Figuren völlig ohne Handlungsmöglichkeiten wären.",
                  ],
                  [
                    "Milieu und Determination",
                    "Milieu meint das soziale Umfeld: Wohnung, Beruf, finanzielle Lage, Beziehungen und Erwartungen. Determination bezeichnet die Vorstellung, Verhalten sei durch Bedingungen festgelegt. Eine Erklärung, weshalb jemand unter Druck gerät, ist aber noch keine Rechtfertigung seines Handelns.",
                  ],
                  [
                    "Leitmotiv und Dingsymbol",
                    "Ein Leitmotiv ist ein wiederkehrendes Element, etwa ein Geräusch oder ein Bild. Ein Dingsymbol ist ein konkreter Gegenstand, der über seine praktische Funktion hinaus Bedeutung gewinnt. Zeige erst Wiederholungen und Veränderungen, bevor du eine feste Bedeutung zuschreibst.",
                  ],
                  [
                    "Metapher und Personifikation",
                    "Eine Metapher überträgt eine Bedeutung: Technik kann etwa als bedrohliches Tier beschrieben werden. Eine Personifikation gibt Dingen menschliche Eigenschaften. Untersuche, welche Wahrnehmung dadurch entsteht; die Beschreibung muss keine objektive Eigenschaft des Gegenstands sein.",
                  ],
                  [
                    "Erzählzeit und erzählte Zeit",
                    "Erzählte Zeit ist die Dauer des Geschehens in der Geschichte. Erzählzeit meint den Umfang beziehungsweise die Zeit des Erzählens. Wenige Sätze können Jahre zusammenfassen; viele Zeilen können einen Augenblick ausdehnen. Im Film übernehmen Schnitt, Einstellungslänge und Ton vergleichbare, aber nicht identische Aufgaben.",
                  ],
                  [
                    "Bahnwärter und Industrialisierung",
                    "Thiel fährt keinen Zug. Seine Arbeit liegt an der Strecke und verlangt Aufmerksamkeit, regelmässige Abläufe und die Beachtung von Signalen. Die Eisenbahn verbindet Geschwindigkeit und wirtschaftlichen Wandel mit Arbeitsdisziplin und Gefahren. Unterscheide, was der Text konkret zeigt und was du als historischen Zusammenhang ergänzen musst.",
                  ],
                  [
                    "Psychologische Deutung",
                    "Du darfst Angst, Abhängigkeit, Trauer oder Überforderung als Deutungen prüfen. Eine literarische Figur lässt sich aus wenigen Textstellen jedoch nicht verlässlich medizinisch diagnostizieren. Beschreibe zunächst beobachtbares Verhalten und die erzählte Wahrnehmung.",
                  ],
                  [
                    "Filmanalyse",
                    "Notiere eine konkrete Minute, die Bildgrösse, den Blickwinkel, die Dauer, Geräusche und Musik. Frage dann nach ihrer Wirkung. Der Film ist eine eigene Bearbeitung: Eine Ergänzung oder Umstellung ist kein automatischer Fehler. Vergleiche, welche neue Perspektive sie ermöglicht.",
                  ],
                ].map(([title, text]) => (
                  <article className="panel padded" key={title}>
                    <h2>{title}</h2>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
              {sourceNotes}
            </>
          ) : route === "journal" ? (
            <>
              <header className="chapter-heading">
                <p className="eyebrow">Arbeitsstand und Sicherung</p>
                <h1>Die Arbeitsakte.</h1>
                <p className="lead">
                  Fallrekonstruktion, Spurenregister und Ermittlungsbericht.
                </p>
              </header>
              <section className="panel padded">
                <label>
                  Name / Kürzel (optional)
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <p>
                  Deine Antworten werden nur in diesem Browser gespeichert. Ein
                  Export sichert sie unabhängig davon. Bereits vorhandene
                  Antworten aus der bisherigen Lesestrecke werden übernommen.
                </p>
                <div className="actions">
                  <button className="primary" onClick={exportWork}>
                    Lesejournal als Text exportieren
                  </button>
                  <button
                    onClick={() =>
                      download(
                        JSON.stringify({ name, answers }, null, 2),
                        "bahnwaerter-thiel-sicherung.json",
                        "application/json",
                      )
                    }
                  >
                    Sicherung herunterladen
                  </button>
                </div>
                <details>
                  <summary>Gesicherte Antworten ergänzend importieren</summary>
                  <p>
                    Vorhandene Einträge bleiben erhalten; gleichnamige Antworten
                    werden durch die Sicherung ersetzt.
                  </p>
                  <input
                    type="file"
                    accept="application/json,.json"
                    aria-label="Sicherungsdatei"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const d = JSON.parse(await f.text());
                        if (
                          !d.answers ||
                          typeof d.answers !== "object" ||
                          Array.isArray(d.answers)
                        )
                          throw Error();
                        const a = Object.fromEntries(
                          Object.entries(d.answers).filter(
                            ([, v]) => typeof v === "string",
                          ),
                        );
                        setAnswers(
                          (old) => ({ ...old, ...a }) as Record<string, string>,
                        );
                        if (typeof d.name === "string") setName(d.name);
                        setNotice("Die Sicherung wurde übernommen.");
                      } catch {
                        setNotice(
                          "Diese Datei ist keine gültige Sicherung. Die vorhandenen Antworten bleiben erhalten.",
                        );
                      }
                    }}
                  />
                </details>
              </section>
              <section className="panel padded">
                <h2>Ermittlungsbestand</h2>
                <p>
                  <a href="#spuren">Spurenregister</a> ·{" "}
                  <a href="#bericht">Bericht und Berichtsexport</a>
                </p>
                {Object.entries(answers)
                  .filter(
                    ([k, v]) =>
                      (k.startsWith("case:report:") ||
                        k.startsWith("material:")) &&
                      v.trim(),
                  )
                  .map(([k, v]) => (
                    <details key={k}>
                      <summary>
                        {k
                          .replace("case:report:", "Bericht · ")
                          .replace("material:", "Material · ")}
                      </summary>
                      <p>{v}</p>
                    </details>
                  ))}
              </section>
              {chapters.map((c) => (
                <section className="panel padded" key={c.id}>
                  <h2>
                    <a href={"#lesen/" + c.id}>{c.title} →</a>
                  </h2>
                  {!c.questions.some((q) => answers[q.id]?.trim()) && (
                    <p>Noch keine Notizen zu diesem Abschnitt.</p>
                  )}
                  {c.questions
                    .filter((q) => answers[q.id]?.trim())
                    .map((q) => (
                      <div className="journal-entry" key={q.id}>
                        <h3>{q.prompt}</h3>
                        <p>{answers[q.id] || "Noch keine Notiz."}</p>
                      </div>
                    ))}
                </section>
              ))}
              {stations.map((s) => (
                <section className="panel padded" key={s.id}>
                  <h2>
                    <a href={"#vertiefung/" + s.id}>Vertiefung · {s.title} →</a>
                  </h2>
                  <p>{answers[s.id] || "Noch keine Notiz."}</p>
                </section>
              ))}
            </>
          ) : (
            <section className="panel padded">
              <h1>Zur Lesestrecke</h1>
              <p>Dieser Abschnitt wurde nicht gefunden.</p>
              <a href="#lesen/anfang">Mit Text und Film beginnen →</a>
            </section>
          )}
          <footer>
            Gerhart Hauptmann · Bahnwärter Thiel
            <br />
            Schlussbefund → Rekonstruktion → Spurensicherung → begründetes
            Ergebnis. Alle Akten frei zugänglich.
          </footer>
        </main>
      </div>
    </>
  );
}
