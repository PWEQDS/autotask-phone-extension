# AGFEO Phone Extension für Autotask/Datto

Eine Chrome-Erweiterung für die nahtlose Integration von AGFEO-Telefonsystemen mit Autotask/Datto. Ermöglicht Click-to-Call-Funktionalität direkt auf Autotask- und Datto-Webseiten.

## Features

- 📞 **Automatische Telefonnummer-Erkennung** auf Autotask/Datto-Seiten
- 🔗 **Click-to-Call** mit AGFEO-Integration über `tksuite:<nummer>?call` Protokoll
- 📱 **Unterstützung verschiedener Telefonformat** (deutsch und international)
- 📋 **Anrufverlauf** mit Wiederanruf-Funktion
- ⚙️ **Einstellungen** für automatische Erkennung und Benachrichtigungen
- 🎯 **Manuelle Anruf-Funktion** über Popup-Interface
- 📝 **Formular-Integration** für Telefonnummer-Eingabefelder

## Installation

### 1. Extension herunterladen
Klonen Sie das Repository oder laden Sie die Dateien herunter:
```bash
git clone https://github.com/PWEQDS/autotask-phone-extension.git
```

### 2. Chrome Extension laden
1. Öffnen Sie Chrome und navigieren Sie zu `chrome://extensions/`
2. Aktivieren Sie den "Entwicklermodus" (oben rechts)
3. Klicken Sie auf "Entpackte Erweiterung laden"
4. Wählen Sie den Ordner mit der Extension aus
5. Die Extension sollte jetzt installiert und aktiv sein

### 3. AGFEO TKSuite konfigurieren
Stellen Sie sicher, dass das `tksuite:` Protokoll auf Ihrem System registriert ist, damit die Anrufe an AGFEO weitergeleitet werden können.

## Verwendung

### Automatische Erkennung
- Die Extension erkennt automatisch Telefonnummern auf Autotask/Datto-Seiten
- Erkannte Nummern werden hervorgehoben und erhalten einen 📞-Button
- Klicken Sie auf den Button, um den Anruf über AGFEO zu starten

### Unterstützte Telefonnummer-Formate
- `+49 40 123456789` (internationale Schreibweise)
- `089 987654321` (deutsche Ortsvorwahl)
- `+49 (0)30 555-1234` (mit Null in Klammern)
- `040/123-456-78` (mit Schrägstrichen)
- `0172 9876543` (Mobilnummern)
- `(030) 123-456` (Ortsvorwahl in Klammern)

### Manueller Anruf
1. Klicken Sie auf das Extension-Icon in der Chrome-Toolbar
2. Geben Sie eine Telefonnummer in das Eingabefeld ein
3. Klicken Sie auf "Anrufen" oder drücken Sie Enter

### Anrufverlauf
- Alle getätigten Anrufe werden im Popup gespeichert
- Klicken Sie auf "Erneut anrufen" für Wiederanrufe
- Der Verlauf kann gelöscht werden

### Einstellungen
- **Automatische Erkennung**: Ein-/Ausschalten der automatischen Nummern-Erkennung
- **Benachrichtigungen**: Ein-/Ausschalten von Anruf-Benachrichtigungen

## Technische Details

### Dateien
- `manifest.json` - Extension-Konfiguration
- `content.js` - Content Script für Telefonnummer-Erkennung
- `background.js` - Service Worker für Anruf-Handling
- `popup.html/js` - Popup-Interface
- `styles.css` - Styling für erkannte Telefonnummern
- `icons/` - Extension-Icons

### Berechtigungen
- `activeTab` - Zugriff auf aktive Browser-Tabs
- `storage` - Speicherung von Einstellungen und Anrufverlauf
- `notifications` - Anzeige von Benachrichtigungen

### Funktionsweise
1. Content Script scannt Webseiten nach Telefonnummern
2. Erkannte Nummern werden mit Click-to-Call-Buttons versehen
3. Bei Klick wird eine Nachricht an den Background Script gesendet
4. Background Script öffnet `tksuite:<nummer>?call` URL
5. AGFEO TKSuite führt den Anruf aus

## Development

### Struktur
```
autotask-phone-extension/
├── manifest.json          # Extension-Manifest
├── content.js            # Content Script
├── background.js         # Service Worker
├── popup.html           # Popup HTML
├── popup.js             # Popup JavaScript
├── styles.css           # CSS Styling
├── icons/               # Extension Icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # Dokumentation
```

### Testing
Eine Test-Seite ist verfügbar, um die Extension-Funktionalität zu überprüfen:
```bash
# Server starten
python3 -m http.server 8080

# Testseite öffnen
http://localhost:8080/agfeo-test-page.html
```

### Debug
- Chrome DevTools Console für Logging-Ausgaben
- Extension-Popup für manuelles Testen
- `chrome://extensions/` für Extension-Management

## Troubleshooting

### Extension funktioniert nicht
1. Überprüfen Sie, ob die Extension aktiviert ist (`chrome://extensions/`)
2. Aktualisieren Sie die Webseite nach Installation
3. Prüfen Sie die Browser-Console auf Fehlermeldungen

### Anrufe werden nicht ausgeführt
1. Stellen Sie sicher, dass AGFEO TKSuite installiert ist
2. Überprüfen Sie die `tksuite:` Protokoll-Registrierung
3. Prüfen Sie die Extension-Permissions

### Telefonnummern werden nicht erkannt
1. Überprüfen Sie die Einstellungen (automatische Erkennung aktiviert)
2. Unterstützte Formate verwenden
3. Seite nach Änderungen neu laden

## Support

Bei Problemen oder Fragen:
1. Überprüfen Sie die Console-Ausgaben
2. Testen Sie mit der bereitgestellten Test-Seite
3. Erstellen Sie ein Issue im GitHub Repository

## Lizenz

[Lizenz hier einfügen]

## Changelog

### Version 1.0.0
- Initiale Implementierung
- Automatische Telefonnummer-Erkennung
- Click-to-Call mit AGFEO-Integration
- Popup-Interface mit Anrufverlauf
- Einstellungen-Management