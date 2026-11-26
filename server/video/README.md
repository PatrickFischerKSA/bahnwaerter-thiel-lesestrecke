# Schlussplädoyers: Klassenraum, Videos und Votum

Die GitHub-Pages-Lernplattform bleibt unter ihrer bisherigen URL. Die API läuft
unter https://thiel-plaedoyers.patrick-fischer.workers.dev.

## Unterrichtsablauf

1. Unter **Das Urteil → Video-Plädoyers und Klassen-Votum** einen Klassenraum
   anlegen. Anzahl der Teilnahmelinks wählen, Leitungslink und Links herunterladen.
2. Pro Person genau einen persönlichen Link verteilen. Personen brauchen kein
   zusätzliches Konto. Der Besitz des Links berechtigt zur jeweiligen Rolle.
3. Plädoyer aufnehmen oder als Datei auswählen: 2–3 Minuten, MP4/WebM/MOV,
   maximal 80 MiB. Browseraufnahmen stoppen nach drei Minuten. Eine Aufnahme
   kann vor dem Einreichen lokal heruntergeladen werden.
4. Empfehlung, Bezug auf § 51, einen weiteren historischen Quellenbezug und
   Gegenargument erfassen. Die Lehrperson prüft Inhalt, Ton und Länge im Video
   und gibt es frei. Nicht freigegebene Beiträge bleiben der Klasse verborgen.
5. Die Einreichung abschliessen: Ab dann ist die Liste der Videos unveränderlich.
   Alle freigegebenen Videos einzeln oder gemeinsam sichten.
6. Die Lehrperson öffnet die Abstimmung. Pro persönlichem Link wird eine Stimme
   gespeichert. Bis zum Schliessen kann sie geändert werden; eine Änderung
   erhöht die Stimmenzahl nicht. Die Begründung bleibt nicht öffentlich.
7. Nach Schliessen erscheint die Verteilung Gefängnis/Psychiatrie. Sie kann
   heruntergeladen und mit dem begründeten schriftlichen Urteil verglichen werden.

Die Phasen sind absichtlich nicht rückwärts schaltbar, damit die Beweisgrundlage
während der Abstimmung gleich bleibt. Für eine neue Runde einen neuen Raum anlegen.
Unterrichtsmaterial und schriftliche Prozessakte sind unabhängig davon frei zugänglich.

## Daten und Zugang

- Pro Raum eine eigene SQLite-Datenbank in einem Cloudflare Durable Object.
  D1 war im bestehenden Konto ausgeschöpft; es wird keine bestehende Datenbank
  verwendet oder gelöscht.
- Dateien liegen im separaten, nicht öffentlich freigegebenen R2-Bucket
  `thiel-plaedoyers-videos`. Abruf ausschliesslich über die authentifizierende API,
  einschliesslich HTTP-Range für Videowiedergabe.
- Leitungs- und Teilnahmeschlüssel: zwei kryptografisch zufällige UUIDs, serverseitig nur SHA-256.
  Vollständige Links beim Anlegen sichern: sie können aus der Datenbank nicht
  rekonstruiert werden. Keine Namen erforderlich; automatische Beitragskürzel.
- Die persönliche Stimme gehört zum Link, nicht zu einer überprüften Identität.
  Geteilte Links sind keine zusätzlichen Personen. Nur einen Link pro Person vergeben.
- Metadaten: Titel, Empfehlung, Quellenbezüge, Einwand, Dauer, Dateigrösse,
  Freigabe, Wiedergabezeit, Stimme und Begründung. Keine Gesichtsanalyse.
- Sichtungsprüfung: mindestens 90 % der angegebenen Videodauer als kumulierte
  Wiedergabezeit. Browser meldet normale Abspielintervalle; Server begrenzt Gutschrift
  durch verstrichene Zeit. Das ist keine Aufmerksamkeits- oder Identitätsprüfung
  und kein manipulationssicherer Anwesenheitsnachweis. Eine dokumentierte gemeinsame
  Vorführung ersetzt die individuelle Wiedergabeprüfung.
- Dauer wird im Browser aus der Datei bzw. Aufnahme ermittelt und serverseitig als
  Metadatum auf den zulässigen Bereich geprüft (kleine technische Toleranz).
  Der Server prüft Containerkennung, MIME-Typ und Dateigrösse, dekodiert aber nicht
  das ganze Video. Die Lehrperson prüft vor Freigabe die tatsächliche Aufnahme.
- Raumlaufzeit 90 Tage; danach entzieht die API den Zugriff. Ein Durable-Object-Alarm
  entfernt Dateien und Raumdaten. Die Lehrperson kann vorher den ganzen Raum löschen.
- Kein automatisches öffentliches Verzeichnis, keine Video-Uploads nach GitHub.
- Höchstens 60 persönliche Teilnahmen je Raum, 80 MiB pro Beitrag. Für ein weiteres
  Video muss der vorhandene Beitrag vor Ende der Einreichung entfernt werden.

## Betrieb

Konfiguration: `server/video/wrangler.jsonc`; Schema: `schema.sql`.
`CREATE TABLE IF NOT EXISTS` initialisiert die isolierte Raumdatenbank. Bei späteren
Schemaänderungen vorhandene Räume berücksichtigen und additive Migrationen schreiben.

```sh
npx wrangler dev --config server/video/wrangler.jsonc --port 8791
node tests/video/api.mjs
npx wrangler deploy --config server/video/wrangler.jsonc
```

Tests mit absichtlich erzeugten Daten räumen ihre Räume wieder auf. Der Browsertest
`tests/browser/video-pleas.cjs` erwartet unter `/tmp/thiel-test-120.mp4` einen
künstlichen 120-Sekunden-Clip und leitet API-Anfragen an den lokalen Worker weiter.
Er prüft Aufnahme, echten Dateiupload, Abruf, Freigabe, Sichtung, Votum und Mobilbreite.

Die Frontend-API kann bei einem Umzug beim Build durch `NEXT_PUBLIC_VIDEO_API`
ersetzt werden. Keine Zugangsschlüssel in Quelltext, Git oder Build-Variablen eintragen.

Cloudflare-Referenzen:
- https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/
- https://developers.cloudflare.com/r2/api/workers/workers-api-reference/
