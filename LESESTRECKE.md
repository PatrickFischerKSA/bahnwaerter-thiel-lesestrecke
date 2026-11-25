# Bahnwärter Thiel · Leseraum

GitHub Pages: https://patrickfischerksa.github.io/bahnwaerter-thiel-lesestrecke/

## Unterrichtsfolge

Acht frei anwählbare chronologische Abschnitte: Originaltext und Film, darunter jeweils vier Fragen. Erst anschliessend folgen die sieben unverändert übernommenen Deutungsstationen. Die Schlusssequenz steht in Abschnitt acht. Keine Mindestlänge, Pflichtantwort oder Freischaltung.

Textseiten beziehen sich auf die gedruckten Seiten 3–66 der eingebundenen Vorlage. Das PDF umfasst nur den Erzähltext, ohne Nachwort. Die HTML-Leseansicht ist eine Übertragung; zum Abgleich steht das Original-PDF bereit. Filmzeitfenster beziehen sich auf die bereitgestellte 72:20-Datei. Sie sind Vergleichsabschnitte, keine Behauptung einer deckungsgleichen Erzählreihenfolge.

## Antworten und Feedback

Der bisherige Schlüssel `bahnwaerter-lesestrecke:v2` und die sieben ursprünglichen Antwort-IDs bleiben erhalten. Speicherung wird erst nach dem Einlesen aktiviert. Neue Antworten ergänzen das bestehende Objekt. Markdown-Export und JSON-Sicherung/Import stehen im Journal bereit.

`app/chapters.json` enthält Fragen, freiwillige Musterlösungen, Belegseiten und Synonymfelder. `app/lib/feedback.mjs` erkennt Wortfelder, Flexionen und kleine Tippfehler. Das Verfahren vergibt bewusst keine Noten und behauptet keine vollständige semantische Bewertung. Ausgewählte eindeutig formulierte falsche Tatsachen erhalten begründete Korrekturen. Andere Antworten werden mit Prüfaspekten und Modellantworten verglichen. Deutungen bleiben offen für andere belegte Lesarten.

## Film

Dropbox-Streaming wird erst beim Laden eines Filmfensters gestartet. Der Player springt zur Anfangszeit und pausiert am Ende. Jedes Fenster ist unmittelbar anwählbar. Bei Problemen ist eine lokale Kopie derselben Filmdatei auswählbar; sie wird nicht hochgeladen. Die nativen 384 × 288 Pixel begrenzen die Bildschärfe. Standbilder stammen aus der gelieferten Datei.

## Prüfung und Veröffentlichung

- `npm test`: Inhaltsabdeckung, Zeitfenster, Referenzen, Feedback und Reihenfolge.
- `npm run typecheck`: App-Typprüfung.
- `NEXT_PUBLIC_BASE_PATH=/bahnwaerter-thiel-lesestrecke npm run build`: statischer Export nach `out`.
- GitHub Actions prüft und veröffentlicht bei Push nach `main`.

Alte Vinext-/Cloudflare-Starterdateien bleiben im Repository, werden für diese GitHub-Pages-Ausgabe jedoch nicht verwendet. Der TypeScript-Prüfbereich umfasst die aktuelle Next-App.

## Ermittlungsfassung (25. November 2026)

Auf ausdrücklichen Wunsch beginnt die neue Fassung beim Schluss: `#fall` fragt „Charité oder Gefängnis?“. Der bisherige chronologische Leseraum bleibt zur Rekonstruktion vollständig bestehen. `#kontext` unterscheidet Erscheinungsjahr und unbestimmtes Tatdatum, Kaiserreich, Familienwirtschaft, Bahnarbeit, historischen § 51 und institutionelle Psychiatrie. Die Überführung in die Charité wird ausdrücklich nicht als Urteil ausgegeben.

`app/imported-material.json` übernimmt den Inhalt von `public/reader/data.js` aus dem angeforderten Repository `bahnwaerter_lektueretool`: neun Module, 36 Einträge / 108 Fragen, sieben Arbeitsbündel, drei Theorie-Videos und den ursprünglichen Arbeitsauftrag. Die alten Seitenangaben bleiben dokumentiert; `refs` enthält neu zugeordnete gedruckte Textseiten. Interpretationsvorgaben erscheinen als prüfbare Ausgangsthesen. `app/demo-material.json` bewahrt den didaktischen Demobestand; die vier erfundenen Textsegmente sind explizit keine Hauptmann-Zitate. Der vollständige Quellstand liegt zusätzlich als ZIP in `public/material` (Commit im JSON dokumentiert).

`#spuren` speichert Herkunft, Fundstelle, Befund, These, Gegenlesart und Beweiswert. Revisionen erzeugen neue Registerfassungen. `#bericht` führt Ergebnis, Begründung, Gegenbefund, Tatzeit, Beweisgrenzen und Revisionskriterium zusammen. Berichte sind unabhängig von Pflichtfeldern exportierbar. Die Strukturprüfung bewertet nur ausgefüllte Bereiche, nicht die Richtigkeit des Ergebnisses. Die neuen Daten liegen als `case:`- und `material:`-Einträge im bisherigen Speicherobjekt und werden durch den bestehenden JSON-Export gesichert.

Die servergestützte Klassenverwaltung, Authentifizierung, SEB-Prüfungslogik und Mehrbenutzer-Reviews des Ausgangsprojekts werden nicht als funktionsfähige GitHub-Pages-Funktionen behauptet. Ihr Quellcode bleibt im Quellarchiv; das gesamte fachliche Material ist in der Arbeitsakte erschlossen.
