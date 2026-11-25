"use client";

type Props = { answers: Record<string, string>; update: (id: string, value: string) => void };
const sources = [
  {
    id: "gesetz", group: "gericht", author: "Deutsches Reich", year: "1871", title: "§ 51: Der Zustand zur Tatzeit",
    work: "Strafgesetzbuch für das Deutsche Reich, § 51", location: "§ 51; Gesetzestext von 1871, in Kraft ab 1872",
    url: "https://de.wikisource.org/wiki/Strafgesetzbuch_f%C3%BCr_das_Deutsche_Reich_(1871)",
    brief: "Wann schliesst eine psychische Störung die Strafbarkeit aus?",
    quote: "zur Zeit der Begehung der Handlung", 
    context: "Der Gesetzestext ist eine Rechtsnorm, kein medizinisches Gutachten. Er verbindet eine krankhafte Störung der Geistestätigkeit oder Bewusstlosigkeit mit einer weiteren Voraussetzung: Die freie Willensbestimmung muss dadurch ausgeschlossen sein.",
    guidance: ["Untersuche den Zustand während der konkreten Tat. Späteres auffälliges Verhalten genügt nicht allein.", "Trenne die Feststellung einer Erkrankung von der rechtlichen Frage nach der freien Willensbestimmung.", "Der Paragraph ordnet keine automatische Einweisung in die Charité an."],
    question: "Welche Beobachtungen betreffen Thiel vor, während und nach den Tötungen? Was davon kann den Zustand zur Tatzeit belegen?",
    model: "Die Auffindung Thiels an den Gleisen und sein Zustand bei der Einweisung betreffen die Zeit nach den Tötungen. Frühere Wahrnehmungsstörungen können für die Rekonstruktion wichtig sein, ersetzen aber keinen Befund während der Tat. Der Text lässt gerade hier eine Beweislücke. Weder die Schwere der Tat noch die spätere Einweisung entscheidet für sich über § 51.",
    check: "Hast du Tatzeit und spätere Beobachtung getrennt? Nenne für jede Behauptung eine Textstelle. Eine Diagnose allein beantwortet die Rechtsfrage noch nicht."
  },
  {
    id: "krafft", group: "gericht", author: "Richard von Krafft-Ebing", year: "1875", title: "Erst untersuchen, dann begutachten",
    work: "Lehrbuch der gerichtlichen Psychopathologie mit Berücksichtigung der Gesetzgebung von Österreich, Deutschland und Frankreich", location: "Gedruckte S. 31–34 (nicht die Seitenzählung des Scan-Viewers)",
    url: "https://archive.org/details/lehrbuchdergeric00kraf",
    brief: "Warum die Tat allein kein psychiatrisches Gutachten ersetzt.",
    quote: "Nie darf aus der That und ihren Umständen allein vom Experten die Entscheidung gefällt werden.",
    context: "Krafft-Ebing war Psychiater. Sein Lehrbuch vermittelt zwischen ärztlicher Untersuchung und Justiz. Es behandelt mehrere Rechtsordnungen; seine medizinischen Empfehlungen sind nicht mit einem deutschen Gesetz gleichzusetzen.",
    guidance: ["Erhebe Lebensgeschichte, frühere Erkrankungen und den gesamten körperlichen und psychischen Zustand.", "Prüfe Zeugenaussagen: Menschen können Krankheitszeichen vorschnell als moralische Fehler beurteilen.", "Beobachtung braucht Zeit. Reicht das Untersuchungsgefängnis nicht aus, empfiehlt er ein Krankenhaus oder eine psychiatrische Anstalt.", "Ein Gutachten muss Befunde und Schlussfolgerungen verständlich begründen. Ärztliche Befunde und rechtliche Zurechnung sind zu unterscheiden."],
    question: "Welche Untersuchungen und Informationen fehlen in Thiels Akte? Begründe, ob eine klinische Beobachtung sinnvoll wäre, ohne damit schon ein Urteil zu fällen.",
    model: "Es fehlen eine ärztliche Untersuchung, eine systematische Krankengeschichte und verlässliche Beobachtungen zur Tatzeit. Nachbarn können Alltag und Veränderungen beschreiben, aber keine Diagnose ersetzen. Klinische Beobachtung wäre als Klärungsschritt begründbar. Sie beweist weder Straflosigkeit noch eine bestimmte Krankheit. Die Novelle ist zudem ein literarischer Bericht, keine vollständige Ermittlungsakte.",
    check: "Unterscheidest du Untersuchungsort und endgültige Entscheidung? Benenne fehlende Informationen statt sie durch Vermutungen zu ersetzen."
  },
  {
    id: "conolly", group: "behandlung", author: "John Conolly", year: "1860", title: "Ruhe statt mechanischem Zwang",
    work: "Die Behandlung der Irren ohne mechanischen Zwang", location: "Deutsche Ausgabe 1860, gedruckte S. 55–56 und 115–116; englisches Original 1856",
    url: "https://archive.org/details/10286145bsb",
    brief: "Eine ältere Reformposition zum Verhalten des Pflegepersonals.",
    quote: "Völlige Ruhe im Benehmen, Gelassenheit, Vermeidung scharfer Vorwürfe",
    context: "Conolly war Arzt und Vertreter des Non-Restraint-Ansatzes: Behandlung ohne mechanische Zwangsmittel wie Fesseln. Die Quelle ist ein Vorläufer der Debatten um 1888. Der historische Titel verwendet eine heute abwertende Bezeichnung.",
    guidance: ["Sorge für Nahrung, Kleidung, ein geeignetes Bett und aufmerksame Betreuung.", "Begegne erregten Menschen ruhig und geduldig; Streit und scharfe Vorwürfe können die Erregung steigern.", "Gewinne Vertrauen durch verlässliches Verhalten. Personal benötigt Anleitung und Aufsicht.", "Verzicht auf Fesseln bedeutet hier nicht Verzicht auf institutionelle Kontrolle: Auch Verhalten und Gefühle sollen gelenkt werden."],
    question: "Wie müsste das Personal Thiel nach diesem Text begegnen? Vergleiche die Filmsequenz in der Anstalt mit den Empfehlungen und benenne auch, was das Bild nicht zeigt.",
    model: "Zu prüfen wären ruhige Ansprache, Versorgung, Schutz und aufmerksame Begleitung statt Vorwürfen oder gewaltsamer Konfrontation. Einzelne Bewegungen Thiels und die Anwesenheit von Personal reichen nicht aus, um die gesamte Behandlung zu beurteilen. Die Verfilmung von 1982 ist eine Inszenierung, kein Dokument der Klinik um 1888. Auch eine Behandlung ohne Fesseln kann von Kontrolle geprägt sein.",
    check: "Trennst du sichtbare Filmbeobachtung, historische Empfehlung und eigene Wertung? Behaupte keine Behandlungsmethode, die im Ausschnitt nicht erkennbar ist."
  },
  {
    id: "griesinger", group: "behandlung", author: "Wilhelm Griesinger", year: "1868", title: "Welche Hilfe braucht dieser Mensch?",
    work: "Ueber Irrenanstalten und deren Weiter-Entwicklung in Deutschland", location: "Archiv für Psychiatrie und Nervenkrankheiten 1 (1868), S. 8–43. Verlinkter Nachdruck: S. 64–90; Auswahl S. 65–68.",
    url: "https://www.freud-biographik.de/Quellen%20zur%20Ausstellung.pdf",
    brief: "Unterbringung nach Bedarf statt vorschneller Einteilung.",
    quote: "die Mittel müssen den Bedürfnissen angepasst werden",
    context: "Griesinger war Psychiater. Er untersucht, wie psychiatrische Einrichtungen organisiert sein sollen. Dieser Reformtext von 1868 liegt vor der Veröffentlichung der Novelle, gehört aber zu deren historischem Umfeld. Der Link führt zu einer späteren Quellenedition mit dem Originaltext.",
    guidance: ["Unterscheide kurzfristige Behandlung und längerfristige Versorgung.", "Nicht jede psychische Erkrankung verlangt dieselbe Unterbringung; auch Familie und soziale Verhältnisse beeinflussen den Hilfebedarf.", "Lege Menschen nicht vorschnell als heilbar oder unheilbar fest. Der Verlauf muss beobachtet werden."],
    question: "Was müsste eine Unterbringung Thiels leisten: Untersuchung, Behandlung, Versorgung oder Schutz? Welche Informationen brauchst du für jede dieser Aufgaben?",
    model: "Untersuchung soll offene Befundfragen klären; Behandlung setzt einen begründeten medizinischen Befund voraus. Versorgung betrifft die Fähigkeit, den Alltag zu bewältigen, Schutz eine konkret zu prüfende Gefahr. Diese Aufgaben sind nicht identisch. Aus Thiels Unterbringung lässt sich weder eine genaue Diagnose noch ein gesichertes Urteil über seinen Zustand zur Tatzeit ableiten.",
    check: "Begründest du den Zweck der Massnahme? Das Wort Anstalt allein erklärt weder Behandlung noch rechtliche Grundlage."
  },
  {
    id: "nietzsche", group: "philosophie", author: "Friedrich Nietzsche", year: "1881", title: "Behandeln statt vergelten?",
    work: "Morgenröthe, Aphorismus 202: Zur Pflege der Gesundheit", location: "Aphorismus 202 (vollständigen Text zur Gegenprüfung heranziehen)",
    url: "https://www.textlog.de/nietzsche/schriften/morgenroete/zur-pflege-der-gesundheit",
    brief: "Eine streitbare Kritik an Schuld, Rache und Strafe.",
    quote: "nicht mit hochmütiger Barmherzigkeit, sondern mit ärztlicher Klugheit, ärztlichem guten Willen",
    context: "Nietzsche war Philosoph. Der Aphorismus ist ein zugespitztes Gedankenexperiment, kein klinischer Leitfaden. Er stellt Behandlung und veränderte Lebensbedingungen gegen moralische Verurteilung und Rache und fragt nach gesellschaftlicher Wiederaufnahme.",
    guidance: ["Prüfe, ob eine Reaktion helfen, schützen oder vor allem vergelten soll.", "Frage nach Lebensbedingungen und Zukunft des Betroffenen, ohne die Opfer aus dem Blick zu verlieren.", "Lies die Gegenbefunde mit: Nietzsche verknüpft Krankheit und Kriminalität rhetorisch. Der Text enthält ausserdem eine verstörende Passage, die sogenannten unheilbaren Verbrechern Suizid als Ausweg nahelegt. Das ist keine hier vertretene Empfehlung."],
    question: "Entlastet die medizinische Betrachtung Thiel von vorschneller Verurteilung – oder verleiht sie anderen Menschen neue Macht über ihn? Wo liegen die Grenzen von Nietzsches Vorschlag?",
    model: "Eine medizinische Betrachtung kann Schuldzuschreibungen infrage stellen und Hilfe begründen. Sie darf aber Straftat und Erkrankung nicht gleichsetzen. Wer über Heilbarkeit urteilt, besitzt erhebliche Macht; Nietzsches Suizidpassage zeigt eine problematische Grenze seines Entwurfs. Die Interessen der Opfer, der Schutz anderer und Thiels eigener Anspruch auf einen begründeten Umgang müssen mitbedacht werden.",
    check: "Prüfst du auch die problematischen Stellen? Eine überzeugende Interpretation darf die Quelle weder als bloss grausam abtun noch als uneingeschränkt humane Pflegeanleitung ausgeben."
  }
];
const groups = [
  { id: "gericht", title: "Gericht: Was muss festgestellt werden?", lead: "Tatzeit, Beweise und Grenzen des Gutachtens", count: "2 Quellen" },
  { id: "behandlung", title: "Klinik: Wie soll man Thiel begegnen?", lead: "Betreuung, Zwang und geeignete Unterbringung", count: "2 Quellen" },
  { id: "philosophie", title: "Kritik: Was rechtfertigt die Reaktion?", lead: "Behandlung, Vergeltung und die Macht der Diagnose", count: "1 Quelle" }
];
export default function HistoricalSources({ answers, update }: Props) {
  return <article className="case-file historical-file">
    <header className="chapter-heading"><p className="eyebrow">Quellenakte · Massstäbe des 19. Jahrhunderts</p><h1>Untersuchen. Behandeln. Urteilen.</h1><p className="lead">Fünf historische Stimmen zum Fall Thiel. Öffne das Dossier, dessen Massstab du für deine Ermittlung brauchst.</p></header>
    <aside className="source-orientation"><strong>1888 ist nicht 1908.</strong><p>Bei Erscheinen der Novelle existierte die Bezeichnung Schizophrenie noch nicht. Eugen Bleuler führte sie 1908 ein. Die damaligen Krankheitsbegriffe sind keine einfachen Synonyme heutiger Diagnosen. Keine dieser Quellen diagnostiziert Thiel. Historische Behandlungsvorschläge sind Untersuchungsmaterial, keine heutigen medizinischen Empfehlungen.</p><a href="https://www.schizophrenie.uzh.ch/de/teilprojekte/psychiatrie.html" target="_blank" rel="noreferrer">Begriffsgeschichte · Universität Zürich</a></aside>
    <nav className="source-jumps" aria-label="Quellendossiers">{groups.map(g => <a key={g.id} href={`#quellen-${g.id}`} onClick={e => { e.preventDefault(); const el = document.getElementById(`quellen-${g.id}`) as HTMLDetailsElement | null; if (el) { el.open = true; el.scrollIntoView({ behavior: "smooth", block: "start" }); } }}>{g.title.split(":")[0]} · {g.count}</a>)}</nav>
    {groups.map(g => <details className="source-dossier" id={`quellen-${g.id}`} key={g.id}>
      <summary><span><strong>{g.title}</strong><small>{g.lead}</small></span><span className="source-count">{g.count}</span></summary>
      <div className="source-dossier-body">{sources.filter(s => s.group === g.id).map(s => <section key={s.id} className="source-leaf">
        <p className="eyebrow">{s.author} · {s.year}</p><h2>{s.title}</h2><p>{s.brief}</p>
        <details><summary>Originalauszug und Einordnung</summary><blockquote>{s.quote}</blockquote><p>{s.context}</p><p className="small"><strong>Quelle:</strong> {s.work}. {s.location}</p><a href={s.url} target="_blank" rel="noreferrer">Originaltext öffnen</a><p className="small">Das Zitat ist ein kurzer Originalauszug. Die folgenden Erläuterungen sind heutige Zusammenfassungen.</p></details>
        <details><summary>Was folgt daraus für Untersuchung und Umgang?</summary><ul>{s.guidance.map(t => <li key={t}>{t}</li>)}</ul></details>
        <details><summary>Am Fall Thiel prüfen · eigene Notiz</summary><p>{s.question}</p><label className="case-field" htmlFor={`note-${s.id}`}>Befund mit Text- oder Filmstelle<textarea id={`note-${s.id}`} value={answers[`material:historisch:${s.id}`] || ""} onChange={e => update(`material:historisch:${s.id}`, e.target.value)} placeholder="Beobachtung · Fundstelle · Schlussfolgerung · Grenze" /></label><p className="small">Wird mit deinen übrigen Notizen im Lesejournal gespeichert. Keine Pflichtantwort.</p><details><summary>Prüfhilfe und mögliche Begründung</summary><p><strong>Prüfhilfe:</strong> {s.check}</p><p><strong>Musterüberlegung:</strong> {s.model}</p><p>Eine andere Deutung ist möglich, wenn sie ihre Belege und Grenzen ausweist. Es wird keine Diagnose automatisch als richtig bewertet.</p></details></details>
      </section>)}</div>
    </details>)}
    <details className="source-dossier"><summary><span><strong>Die Quellen gegeneinander prüfen</strong><small>Vom historischen Massstab zum eigenen Bericht</small></span></summary><div className="source-dossier-body"><p>§ 51 fragt nach der Tatzeit. Krafft-Ebing verlangt eine ausreichende Untersuchung. Conolly beschreibt den Umgang mit Erkrankten; Griesinger den Bedarf an Einrichtungen. Nietzsche stellt den Sinn der Reaktion infrage. Diese Fragen ergänzen sich, beantworten einander aber nicht automatisch.</p><label className="case-field">Welche Konsequenz tragen die Quellen – und welche nicht?<textarea value={answers["material:historisch:synthese"] || ""} onChange={e => update("material:historisch:synthese", e.target.value)} placeholder="Untersuchungsbedarf · Betreuung · rechtliche Frage · verbleibende Ungewissheit" /></label><details><summary>Mögliche Synthese öffnen</summary><p>Eine psychiatrische Untersuchung kann sinnvoll sein, ohne dass Straflosigkeit feststeht. Ein respektvoller Umgang ist nicht von einem Freispruch abhängig. Die spätere Einweisung beweist den Zustand zur Tatzeit nicht. Ein vertretbarer Bericht benennt deshalb sowohl seinen Befund als auch die Informationen, die eine Entscheidung noch verändern könnten.</p></details></div></details>
    <p className="source-jumps"><a href="#lesen/anfang">Text und Film</a><a href="#spuren">Spurenregister</a><a href="#bericht">Ermittlungsbericht</a><a href="#journal">Notizen und Export</a></p>
  </article>;
}
