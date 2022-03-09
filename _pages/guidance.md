---
title: Technische Hinweise
permalink: /guidance/
layout: page
---
## Open-Source-Projekt auf GitHub

Die DNS-Online Plattform ist ein öffentlich zugängliches Instrument zur Verbreitung und Präsentation von Daten zu den Indikatoren der Deutschen Nachhaltigkeitsstrategie.

## Quellen

Das Statistische Bundesamt (Destatis) unterstützt aktiv die Entwicklung nationaler Online Plattformen, insbesondere als Open-Source-Lösung zur Darstellung von DNS-Indikatoren. Vorreiter in diesem Bereich sind die USA und Großbritannien. Der Projektcode für die DNS-Online Plattform ist im folgenden [GitHub Repository](https://github.com/sustainabledevelopment-deutschland/sustainabledevelopment-deutschland.github.io) öffentlich zugänglich.
Eine universelle Version des von den USA, Großbritannien und dem Center for Open Data Enterprise entwickelten Codes für eine Online Plattform ist verfügbar. Auf diesem basiert die DNS-Online Plattform. Bei Interesse empfehlen wir Ihnen, sich mit den SDG-Online Plattformen in den USA und in Großbritannien sowie mit der entsprechenden [Open-SDG Projektdokumentation](https://open-sdg.readthedocs.io/en/latest/) vertraut zu machen. Diese enthält technische Anweisungen, wie z.B. eine Kopie der Open SDG-Online Plattform erstellt werden kann.


- [SDG-Online Plattform USA](https://sdg.data.gov/)

- [SDG-Online Plattform Großbritannien](https://sustainabledevelopment-uk.github.io)

Wenn Sie Kommentare oder Feedback zum Open SDG-Projekt haben oder an der Open SDG-Community teilnehmen möchten, wenden Sie sich an [Open SDG GitHub](https://github.com/open-sdg/open-sdg/issues).

## Genutzte Software

#### Back-end IT-Anforderungen:
- GitHub: Hosting der Website, die für die Programmierung von Projekten mit dem Git-Versionskontrollsystem entwickelt wurde.
- Jekyll: Generator für statische Seiten, die in Ruby geschrieben wurden.

#### Front-end IT-Anforderungen:
- XHTML, CSS, JavaScript
- Chartist: JavaScript Bibliothek
- Bootstrap: framework CSS

### Aktuelle Darstellung

Aufgrund von technischen Schwierigkeiten finden sich auf der aktuellen Version der DNS-Online Plattform einige suboptimale Darstellungen, auf die an dieser Stelle hingewiesen wird:
- Ganze Zahlen werden ohne Nachkommastelle dargestellt (auch in Zeitreihen, in denen andere Zahlenwerte mit Nachkommastelle vorhanden sind).
- Sehr lange Zeitreihenbezeichnungen werden in den Achsenbeschriftungen der Grafiken nicht in mehrere Zeilen umgebrochen und z.&nbsp;T. abgeschnitten.
- Wenn man mit dem Mausanzeiger über einem Datenpunkt in den Grafiken verweilt, werden die Beschriftung und der exakte Wert dieses Datenpunktes angezeigt. Tief- und hochgestellte Ziffern und Buchstaben werden dabei nicht korrekt übernommen.
- Beim gleichen Vorgang werden auch die Namen der Datenreihen nicht umgebrochen.
