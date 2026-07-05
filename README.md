# Website – Übergabe

Die Website ist statisch und kann direkt auf gängigem Webhosting veröffentlicht werden.

## Vor Veröffentlichung ersetzen

- `[Vorname]` sowie die übrigen Kontakt- und Unternehmensangaben
- `beratung@ihre-domain.de`
- `+49 (0) 421 000 00 00` und den Wert im zugehörigen `tel:`-Link
- vollständiges Impressum und vollständige Datenschutzerklärung

## Dateien

- `index.html`: Beratungswebsite
- `assessment.html`: deutschsprachiges Double-Materiality- und VSME-Relevanzassessment für KMU
- `assessment.css`: eigenständige Darstellung des VSME-Assessments
- `impressum.html`: beispielhaftes Impressum mit markierten Platzhaltern
- `datenschutz.html`: beispielhafte Datenschutzerklärung für die aktuelle statische Umsetzung
- `bericht-esg-statusanalyse.html`: exemplarischer Bericht zur ESG-Datenreife und zu Datenlücken
- `bericht-esg-entwicklungsplan.html`: exemplarische 12-Monats-Roadmap für kontinuierliche ESG-Datenerfassung
- `bericht-energie-co2-massnahmenplan.html`: exemplarischer Energie- und CO₂-Maßnahmenplan
- `reports.css`: Darstellung der Leistungs- und Berichtsseiten
- `styles.css`: gemeinsames Erscheinungsbild und responsive Layouts
- `main.js`: mobile Navigation und Jahreszahl
- `assessment.js`: Assessment, Matrix, Themenbearbeitung sowie PDF-, Excel-, SVG- und PNG-Export

## Lokale Vorschau

Im Ordner einen einfachen lokalen Webserver starten, zum Beispiel:

```powershell
python -m http.server 8000
```

Danach `http://localhost:8000` im Browser öffnen.
