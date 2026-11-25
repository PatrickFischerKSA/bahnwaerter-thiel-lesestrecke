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

export const stations: Station[] = [
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

