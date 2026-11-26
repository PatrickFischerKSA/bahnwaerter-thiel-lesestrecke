import demo from './demo-material.json';
import material from './imported-material.json';
import type { Perspective } from './answer-support';
const caseAngles: Record<string, string[]> = {
 'befundprotokoll': ['Wohnung und Gleise als getrennte Auffindeorte protokollieren: Was ist jeweils tatsächlich sichtbar oder erzählt?', 'Für denselben Befund Text und Film getrennt ausweisen. Welche Information ergänzt erst die Inszenierung?', 'Aus Auffindesituation und Verhalten keine beobachtete Tatausführung machen: Welche Zeitspanne bleibt unbeobachtet?'],
 'initial': ['Zwei konkurrierende Erklärungen zum Schlussbefund formulieren, ohne eine Diagnose vorzugeben.', 'Für jede Hypothese eine Beobachtung benennen, die sie stützen oder schwächen würde.'],
 'location': ['Die Spur so lokalisieren, dass jemand sie ohne deine Hilfe wiederfinden kann: Ausgabe und Seite, Filmzeit oder Quelle und Abschnitt.'],
 'quote': ['Einen kurzen Wortlaut oder eine sichtbare Handlung sichern. Figurenrede, Erzählerbericht und Filmbeobachtung ausdrücklich unterscheiden.'],
 'claim': ['Nur eine Behauptung aus dieser Spur ableiten. Welches Detail trägt sie – und welcher zusätzliche Schluss wäre bereits Spekulation?'],
 'counter': ['Die stärkste alternative Erklärung derselben Spur prüfen. Betrifft sie eine andere Zeit, eine andere Perspektive oder eine mehrdeutige Geste?'],
 'report:position': ['Untersuchungsbedarf, Betreuung und rechtliche Zurechnung als verschiedene Entscheidungen behandeln.', 'Welche Konsequenz lässt sich jetzt begründen, welche erst nach weiteren Ermittlungen?'],
 'report:evidence': ['Die tragenden Spuren nach Beweiswert ordnen, ihre Nummern nennen und jeweils den Schluss aus dem konkreten Detail erklären.'],
 'report:counter': ['Den stärksten Einwand gegen das eigene Ergebnis auswählen. Verändert er das Ergebnis oder begrenzt er nur dessen Sicherheit?'],
 'report:time': ['Vorher, Tatzeit und Nachher auseinanderhalten. Welche Beobachtung erlaubt tatsächlich einen Rückschluss auf die Tatzeit?', '§ 51 mit seinem Tatzeitbezug anlegen, ohne die spätere Einweisung als Beweis zu verwenden.'],
 'report:limits': ['Eine Lücke im Erzählen von einer widersprüchlichen Aussage unterscheiden. Was ist unbekannt, was nur mehrdeutig?'],
 'report:revision': ['Eine mögliche neue Information nennen und erläutern, in welche Richtung sie den eigenen Befund verändern würde.'],
 'skizze-legende': ['Jede Markierung nummerieren und der Text- oder Filmquelle zuordnen.', 'Wohnung und Gleise getrennt darstellen; nicht belegte Abstände und Positionen als offen kennzeichnen.'],
 'sketch-note': ['Für eine bestätigte oder korrigierte Erkennung den sichtbaren Ausschnitt und die zugehörige Beschriftung nennen.', 'Bildinhalt, Quellenbeleg und KI-Vermutung auseinanderhalten: Ein erkanntes Sofa belegt noch keine textgetreue Platzierung.']
};
export function questionAngle(prompt: string): string {
 if (/film|kamera|hör|sieh|sichtbar|ton|inszen/i.test(prompt)) return 'Eine konkrete Einstellung oder ein Geräusch mit der entsprechenden Textstelle vergleichen. Welche Wirkung ergibt sich aus dem Unterschied der Darstellung?';
 if (/warum|motiv|grund|gründe|absicht/i.test(prompt)) return 'Ausgesprochene Gründe von erschlossenen Motiven unterscheiden. Welche alternative Erklärung passt ebenfalls zum Verhalten?';
 if (/sprach|wort|bild|metaph|symbol|signal/i.test(prompt)) return 'Ein prägnantes Wort oder Bild auswählen, sein Verfahren benennen und die Wirkung im Satzkontext begründen.';
 if (/erzäh|perspekt|wahrnehm/i.test(prompt)) return 'Bestimmen, wer wahrnimmt, spricht oder urteilt. Welche Aussage lässt sich der Figur, welche dem Erzähler zuschreiben?';
 if (/verantwort|schuld|recht|gewalt|entscheid/i.test(prompt)) return 'Handlung, verfügbares Wissen und mögliche Alternativen getrennt rekonstruieren. Erklärung und Rechtfertigung nicht gleichsetzen.';
 if (/vergleich|gegensatz|unterschied|veränder|entwicklung/i.test(prompt)) return 'Zwei konkrete Befunde nach demselben Kriterium gegenüberstellen. Was verändert sich, was bleibt bestehen?';
 if (/novelle|natural|milieu|theorie|form/i.test(prompt)) return 'Den verwendeten Begriff zuerst bestimmen, dann an einem Detail prüfen. Auch einen Befund suchen, der sich dem Begriff nicht einfach fügt.';
 return 'Eine präzise Textbeobachtung auswählen und erläutern, welchen Teil dieser Frage sie beantwortet. Gesicherte Angabe und eigene Folgerung trennen.';
}
export function fieldPerspective(id: string): Perspective {
 const c = caseAngles[id.replace(/^case:/,'')];
 if (c) return { angles: c, evidence: id.includes('befund') || id.includes('initial') ? 'Schluss der Novelle, besonders S. 65–66; Filmspuren Wohnung, Gleise und Anstalt jeweils mit Zeitmarke.' : 'Die betreffende Spur oder Quelle so genau angeben, dass sie nachprüfbar ist.' };
 for (const m of material.modules) for (const e of m.entries) if (id === 'material:'+e.id) return { angles: e.prompts.map(p => `${p} — ${questionAngle(p)}`), evidence: `Text S. ${e.refs.join(', ')}. Mögliche Suchspuren: ${e.signalWords.join(', ')}. Wähle die Wörter, die deinen Befund tatsächlich tragen.`, limit: `Prüfe die Ausgangsthese „${e.context}“ auch auf Gegenbelege. Sie ist eine zu prüfende Lesart, kein feststehendes Ergebnis.` };
 const task = demo.tasks.find(t=>id==='material:demo:'+t.id);
 if(task) return { angles: [task.prompt, questionAngle(task.prompt), `Prüffokus: ${task.focusPrompt}. Ein konkretes Detail auswählen und dessen Funktion erläutern.`], evidence: 'Den verwendeten erfundenen Übungstext und die betreffende Formulierung nennen.', limit: 'Diese Übungstexte sind keine Hauptmann-Zitate. Eine Wirkungshypothese muss am Wortlaut überprüfbar bleiben.' };
 const t = material.theory.find(t => id === 'material:theorie:'+t.id);
 if (t) return { angles: [...t.questions, ...t.transferPrompts].map(p=>`${p} — ${questionAngle(p)}`), evidence: `Begriffe unterscheiden: ${t.keyIdeas.join(' · ')}. Videozeit und eine passende Textstelle angeben.` };
 const l = material.lessons.find(l=>id==='material:'+l.id);
 if(l) return { angles: [l.sebPrompt, `Prüffokus: ${l.reviewFocus}`, 'Zwei Passagen nach einem gemeinsamen Kriterium verbinden; eine Abweichung erklären statt nur Ergebnisse aufzuzählen.'], evidence: 'Fundstellen aus den verknüpften Dossiers mit kurzen Wortbelegen verwenden.' };
 return { angles: ['Beobachtung und Schlussfolgerung getrennt formulieren; eine alternative Erklärung am selben Beleg prüfen.'] };
}
