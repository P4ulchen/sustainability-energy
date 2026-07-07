window.VSME_DATA = (() => {
  const commonConfidence = [
    ["period", "Ist der Berichtszeitraum klar definiert?"],
    ["boundary", "Ist die organisatorische Abgrenzung definiert?"],
    ["source", "Ist die Datenquelle dokumentiert?"],
    ["plausibility", "Wurden die Daten auf Plausibilität geprüft?"],
    ["method", "Ist die Berechnungsmethode dokumentiert, soweit relevant?"],
    ["location", "Ist der Ablageort des Nachweises bekannt?"],
    ["review", "Wurde die Information intern geprüft?"]
  ];

  const disclosures = [
    {
      id: "B1", module: "basic", category: "Grundlagen", title: "Grundlagen für die Erstellung",
      description: "Berichtsoption, Berichtsgrenze, Rechtsform, wirtschaftliche Tätigkeit, Größenmerkmale, Länder, Standorte und Zertifizierungen.",
      sectors: ["all"], stakeholderRelevance: { internal_data_management: 3, parent_company: 2, banks_lenders: 1 }, dependencies: ["reporting_boundary", "data_owner"],
      guidance: { evidence: "Handelsregisterdaten, Organigramm, Jahresabschluss, Standortliste, Zertifikate und dokumentierte Berichtsgrenze.", owner: "Geschäftsführung, Finance oder Controlling.", firstAction: "Berichtsjahr, organisatorische Grenze und Stammdaten in einem freigegebenen Basisblatt festhalten." }
    },
    {
      id: "B2", module: "basic", category: "Strategie", title: "Praktiken, Strategien und künftige Initiativen",
      description: "Bestehende Praktiken, Richtlinien, künftige Initiativen und Ziele für den Übergang zu einer nachhaltigeren Wirtschaft.",
      sectors: ["all"], stakeholderRelevance: { customer_requests: 2, public_tenders: 3, internal_data_management: 3, major_customers: 2 }, dependencies: ["data_owner", "evidence_storage"],
      guidance: { evidence: "Umwelt- oder Nachhaltigkeitspolitik, Maßnahmenlisten, Managementbeschlüsse, Ziele und Fortschrittsnachweise.", owner: "Geschäftsführung oder ESG-Koordination.", firstAction: "Bestehende Praktiken und Richtlinien inventarisieren und jeweils Verantwortung, Status und Nachweis zuordnen." }
    },
    {
      id: "B3", module: "basic", category: "Umwelt", title: "Energie und Treibhausgasemissionen",
      description: "Energieverbrauch nach Quellen, Scope 1, standortbasierter Scope 2 und Treibhausgasintensität.",
      sectors: ["manufacturing", "construction", "logistics", "energy", "food", "real_estate"], stakeholderRelevance: { customer_requests: 3, bank_financing: 3, public_tenders: 2, internal_data_management: 3, major_customers: 3, banks_lenders: 3, insurers: 2 }, dependencies: ["reporting_boundary", "data_owner", "evidence_storage"],
      guidance: { evidence: "Lieferantenrechnungen, Zählerstände, Energiemanagement-Exporte, Vermieterabrechnungen, Tankkarten- und Buchhaltungsdaten; für Emissionen zusätzlich Emissionsfaktoren und Rechenweg.", owner: "Facility Management, Operations, Finance oder Umweltmanagement.", firstAction: "Ein zentrales Verzeichnis für Strom, Wärme, Brennstoffe, Kraftstoffe und Standorte anlegen." }
    },
    {
      id: "B4", module: "basic", category: "Umwelt", title: "Verschmutzung von Luft, Wasser und Boden",
      description: "Gemeldete Schadstoffe aus eigenen Tätigkeiten, wenn eine gesetzliche oder freiwillige Berichterstattung besteht.",
      sectors: ["manufacturing", "construction", "food", "energy"], stakeholderRelevance: { public_tenders: 2, major_customers: 1, insurers: 2 }, dependencies: ["site_inventory", "evidence_storage"],
      guidance: { evidence: "Genehmigungen, Emissionsmessungen, Behördenmeldungen, Abwasseranalysen und Gefahrstoffverzeichnis.", owner: "HSE, Umweltmanagement oder Technik.", firstAction: "Mit HSE oder Technik klären, welche genehmigungs- oder meldepflichtigen Stoffströme bestehen." }
    },
    {
      id: "B5", module: "basic", category: "Umwelt", title: "Biodiversität",
      description: "Anzahl und Fläche eigener, gemieteter oder bewirtschafteter Standorte in oder nahe biodiversitätssensiblen Gebieten.",
      sectors: ["manufacturing", "construction", "food", "energy", "real_estate"], stakeholderRelevance: { public_tenders: 1, investors: 1, insurers: 1 }, dependencies: ["site_inventory", "reporting_boundary"],
      guidance: { evidence: "Standort- und Flächenliste, Miet- oder Eigentumsunterlagen, Kartenabgleich und Schutzgebietsprüfung.", owner: "Facility Management, Operations oder Umweltmanagement.", firstAction: "Vollständige Standortliste mit Flächenangaben erstellen und Schutzgebietsnähe prüfen." }
    },
    {
      id: "B6", module: "basic", category: "Umwelt", title: "Wasser",
      description: "Wasserentnahme sowie gegebenenfalls Wasserverbrauch an Standorten in Gebieten mit hohem Wasserstress.",
      sectors: ["manufacturing", "construction", "food", "energy", "real_estate"], stakeholderRelevance: { customer_requests: 2, major_customers: 2, insurers: 1 }, dependencies: ["site_inventory", "evidence_storage"],
      guidance: { evidence: "Wasserrechnungen, Zählerstände, Vermieterabrechnungen, Produktionsdaten und Standortprüfung zu Wasserstress.", owner: "Facility Management, Operations oder Technik.", firstAction: "Wasserbezug je Standort erfassen und Standorte mit möglichem Wasserstress markieren." }
    },
    {
      id: "B7", module: "basic", category: "Umwelt", title: "Ressourcennutzung, Kreislaufwirtschaft und Abfall",
      description: "Kreislaufprinzipien, wesentliche Materialflüsse und Abfallmengen nach Art und Verwertungsweg.",
      sectors: ["manufacturing", "construction", "logistics", "wholesale", "food", "energy"], stakeholderRelevance: { customer_requests: 3, public_tenders: 2, major_customers: 3, suppliers: 1 }, dependencies: ["supplier_process", "evidence_storage"],
      guidance: { evidence: "Entsorgernachweise, Abfallregister, Wiegescheine, Einkaufs- und Materialdaten sowie Verpackungsinformationen.", owner: "Operations, Einkauf, HSE oder Umweltmanagement.", firstAction: "Abfall- und Materialdaten aus Einkauf, Produktion und Entsorgung in einer gemeinsamen Übersicht konsolidieren." }
    },
    {
      id: "B8", module: "basic", category: "Soziales", title: "Belegschaft – allgemeine Merkmale",
      description: "Beschäftigtenzahl nach Vertragsart, Geschlecht und Land sowie gegebenenfalls Leiharbeit und Selbstständige.",
      sectors: ["all"], stakeholderRelevance: { public_tenders: 2, parent_company: 2, banks_lenders: 1, employees: 3 }, dependencies: ["workforce_owner", "reporting_boundary"],
      guidance: { evidence: "HR-System- und Payroll-Exporte, Personallisten und dokumentierte Definitionen für Beschäftigtengruppen.", owner: "HR oder Payroll.", firstAction: "Stichtag, Durchschnittsmethode und Beschäftigtengruppen gemeinsam mit HR verbindlich definieren." }
    },
    {
      id: "B9", module: "basic", category: "Soziales", title: "Gesundheit und Sicherheit",
      description: "Arbeitsbedingte Todesfälle sowie Anzahl und Quote meldepflichtiger Arbeitsunfälle.",
      sectors: ["manufacturing", "construction", "logistics", "food", "energy", "healthcare"], stakeholderRelevance: { public_tenders: 3, customer_requests: 2, insurers: 3, employees: 3 }, dependencies: ["workforce_owner", "evidence_storage"],
      guidance: { evidence: "Unfallregister, Berufsgenossenschaftsmeldungen, HSE-Auswertungen, Arbeitsstunden und interne Prüfprotokolle.", owner: "HSE, Arbeitssicherheit oder HR.", firstAction: "Unfalldefinitionen, Bezugsgröße und zuständige Datenquelle mit HSE und HR abstimmen." }
    },
    {
      id: "B10", module: "basic", category: "Soziales", title: "Vergütung, Tarifbindung und Weiterbildung",
      description: "Angemessene Vergütung, Entgeltunterschied, Tarifbindung und durchschnittliche Weiterbildungsstunden.",
      sectors: ["all"], stakeholderRelevance: { public_tenders: 2, parent_company: 2, employees: 3, investors: 1 }, dependencies: ["workforce_owner"],
      guidance: { evidence: "Payroll-Auswertungen, Tarifunterlagen, Lernmanagement- oder Trainingslisten und dokumentierte Berechnungsmethoden.", owner: "HR, Payroll oder Controlling.", firstAction: "Verfügbare Vergütungs-, Tarif- und Trainingsdaten sowie deren Definitionen mit HR inventarisieren." }
    },
    {
      id: "B11", module: "basic", category: "Governance", title: "Korruption und Bestechung",
      description: "Verurteilungen und Geldbußen wegen Korruption oder Bestechung im Berichtszeitraum.",
      sectors: ["all"], stakeholderRelevance: { bank_financing: 2, public_tenders: 3, banks_lenders: 2, investors: 2, insurers: 2 }, dependencies: ["data_owner", "evidence_storage"],
      guidance: { evidence: "Compliance-Register, Rechtsfallübersichten, Richtlinien, Freigaben und Bestätigungen der Geschäftsführung.", owner: "Legal, Compliance oder Geschäftsführung.", firstAction: "Zuständigkeit und dokumentierten jährlichen Negativ- bzw. Vorfallnachweis festlegen." }
    },
    {
      id: "C1", module: "comprehensive", category: "Strategie", title: "Strategie, Geschäftsmodell und Nachhaltigkeitsinitiativen",
      description: "Produkte, Märkte, wesentliche Geschäftsbeziehungen und nachhaltigkeitsbezogene Strategieelemente.",
      sectors: ["all"], stakeholderRelevance: { bank_financing: 3, parent_company: 3, banks_lenders: 3, investors: 3 }, dependencies: ["data_owner", "reporting_boundary"],
      guidance: { evidence: "Strategieunterlagen, Produkt- und Marktübersichten, Managementpräsentationen und dokumentierte Initiativen.", owner: "Geschäftsführung oder Strategie.", firstAction: "Geschäftsmodell, Kernmärkte und Nachhaltigkeitsinitiativen in einer managementtauglichen Seite beschreiben." }
    },
    {
      id: "C2", module: "comprehensive", category: "Strategie", title: "Beschreibung von Praktiken, Strategien und Initiativen",
      description: "Vertiefung zu B2 mit Verantwortlichkeit, Umfang, Zielsetzung und Umsetzungsstand.",
      sectors: ["all"], stakeholderRelevance: { customer_requests: 2, public_tenders: 3, parent_company: 2, major_customers: 2 }, dependencies: ["data_owner", "evidence_storage"],
      guidance: { evidence: "Richtlinienregister, Maßnahmenpläne, Rollenbeschreibungen, Zielblätter und Freigaben.", owner: "ESG-Koordination und jeweilige Fachverantwortliche.", firstAction: "Für jede wesentliche Praxis Zweck, Umfang, Verantwortliche und Umsetzungsstand dokumentieren." }
    },
    {
      id: "C3", module: "comprehensive", category: "Klima", title: "THG-Reduktionsziele und Klimatransition",
      description: "Treibhausgasziele, Basis- und Zieljahr, einbezogene Scopes und Übergangsmaßnahmen.",
      sectors: ["manufacturing", "construction", "logistics", "energy", "food", "real_estate"], stakeholderRelevance: { customer_requests: 3, bank_financing: 3, major_customers: 3, banks_lenders: 3, investors: 3 }, dependencies: ["B3", "reporting_boundary", "data_owner"],
      guidance: { evidence: "Freigegebene Zieldefinition, Basisjahrberechnung, Scope-Abgrenzung, Maßnahmenplan und Fortschrittsmonitoring.", owner: "Geschäftsführung, ESG oder Energiemanagement.", firstAction: "Vor einer Zielsetzung zuerst belastbares Basisjahr und organisatorische Emissionsgrenze sichern." }
    },
    {
      id: "C4", module: "comprehensive", category: "Klima", title: "Klimarisiken",
      description: "Physische und transitorische Klimarisiken, Zeithorizonte, Exposition und mögliche finanzielle Effekte.",
      sectors: ["all"], stakeholderRelevance: { bank_financing: 3, banks_lenders: 3, investors: 3, insurers: 3 }, dependencies: ["site_inventory", "data_owner"],
      guidance: { evidence: "Risikoregister, Standort- und Lieferkettenanalysen, Versicherungsunterlagen und Managementbewertung.", owner: "Risikomanagement, Finance oder Geschäftsführung.", firstAction: "Einen kompakten Workshop zu physischen und transitorischen Risiken mit Standorten, Einkauf und Finance durchführen." }
    },
    {
      id: "C5", module: "comprehensive", category: "Soziales", title: "Zusätzliche Belegschaftsmerkmale",
      description: "Weiterführende Aufschlüsselungen der eigenen Belegschaft und Beschäftigungsstruktur.",
      sectors: ["all"], stakeholderRelevance: { parent_company: 2, employees: 3, investors: 2 }, dependencies: ["B8", "workforce_owner"],
      guidance: { evidence: "HR- und Payroll-Exporte, definierte Merkmale, Stichtags- oder Durchschnittsberechnungen.", owner: "HR oder Payroll.", firstAction: "Zusätzliche Merkmale auf Verfügbarkeit, Datenschutz und konsistente Definition prüfen." }
    },
    {
      id: "C6", module: "comprehensive", category: "Menschenrechte", title: "Menschenrechtspolitiken und -prozesse",
      description: "Richtlinien, Prozesse und Beschwerdemechanismen für die eigene Belegschaft.",
      sectors: ["all"], stakeholderRelevance: { customer_requests: 3, public_tenders: 2, parent_company: 3, major_customers: 3, employees: 2 }, dependencies: ["data_owner", "evidence_storage"],
      guidance: { evidence: "Verhaltenskodex, Menschenrechts- oder HR-Richtlinien, Beschwerdeprozess, Schulungen und Fallregister.", owner: "HR, Compliance oder Legal.", firstAction: "Vorhandene Policies und Beschwerdewege auf Geltungsbereich, Verantwortlichkeit und Zugänglichkeit prüfen." }
    },
    {
      id: "C7", module: "comprehensive", category: "Menschenrechte", title: "Schwerwiegende Menschenrechtsvorfälle",
      description: "Bestätigte schwerwiegende Vorfälle in eigener Belegschaft, Wertschöpfungskette oder betroffenen Gemeinschaften.",
      sectors: ["manufacturing", "construction", "logistics", "wholesale", "food", "energy"], stakeholderRelevance: { customer_requests: 3, parent_company: 3, major_customers: 3, investors: 2, suppliers: 2 }, dependencies: ["supplier_process", "evidence_storage"],
      guidance: { evidence: "Hinweisgeber- und Fallregister, Lieferantenbewertungen, Auditberichte, Abhilfemaßnahmen und Legal-Bestätigung.", owner: "Compliance, Legal, HR oder Einkauf.", firstAction: "Eskalationsweg und jährliche Abfrage bestätigter schwerwiegender Vorfälle definieren." }
    },
    {
      id: "C8", module: "comprehensive", category: "Governance", title: "Umsätze aus bestimmten Tätigkeiten und Referenzwerte",
      description: "Umsätze aus bestimmten Tätigkeiten sowie Ausschluss von EU-Referenzwerten, soweit anwendbar.",
      sectors: ["energy", "finance", "manufacturing"], stakeholderRelevance: { bank_financing: 2, banks_lenders: 2, investors: 3 }, dependencies: ["reporting_boundary", "data_owner"],
      guidance: { evidence: "Umsatzaufschlüsselung, Produktklassifikation, Branchenzuordnung und Compliance-Prüfung.", owner: "Finance, Controlling oder Compliance.", firstAction: "Mit Finance und Compliance klären, ob einschlägige Tätigkeiten bestehen und wie Umsätze abgegrenzt werden." }
    },
    {
      id: "C9", module: "comprehensive", category: "Governance", title: "Geschlechterdiversität im Leitungsorgan",
      description: "Verhältnis der Geschlechter im Verwaltungs-, Leitungs- oder Aufsichtsorgan.",
      sectors: ["all"], stakeholderRelevance: { bank_financing: 1, banks_lenders: 1, investors: 2, public_tenders: 1 }, dependencies: ["data_owner"],
      guidance: { evidence: "Organigramm, Handelsregister, Gesellschafter- oder Aufsichtsratsunterlagen und dokumentierte Berechnung.", owner: "Geschäftsführung, HR oder Corporate Office.", firstAction: "Relevantes Leitungsorgan und Berechnungsmethode dokumentieren." }
    }
  ];

  return {
    toolVersion: "2.0",
    regulatoryAsOf: "7. Juli 2026",
    confidenceQuestions: commonConfidence,
    disclosures,
    sectorOptions: [
      ["manufacturing", "Produktion und Industrie"], ["construction", "Bau und Gebäudetechnik"],
      ["engineering", "Ingenieur- und technische Dienstleistungen"], ["logistics", "Logistik und Transport"],
      ["wholesale", "Groß- und Einzelhandel"], ["food", "Lebensmittel und Landwirtschaft"],
      ["energy", "Energie und Versorgung"], ["it", "IT und digitale Dienstleistungen"],
      ["professional", "Professionelle Dienstleistungen"], ["healthcare", "Gesundheit und Soziales"],
      ["real_estate", "Immobilien und Gebäudemanagement"], ["other", "Sonstige"]
    ],
    sectorPrompts: {
      manufacturing: ["Wesentlicher Strom- oder Gasverbrauch", "Produktionsbedingter Brennstoffeinsatz", "Eigene Fahrzeuge oder Maschinen", "Dokumentationspflichtige Abfallströme", "Gefahrstoffe oder regulierte Substanzen", "Wesentliche Rohstoff- oder Lieferantenabhängigkeiten"],
      logistics: ["Eigene oder geleaste Fahrzeuge", "Tankkartendaten", "Flottenmanagementsystem", "Externe Logistikdienstleister", "Materialtransporte für Kunden oder Lieferanten"],
      professional: ["Hohe Geschäftsreisetätigkeit", "Homeoffice oder hybride Arbeit", "Rechenzentrums- oder Cloud-Nutzung", "Wesentliche Beschaffungsanforderungen", "Öffentliche Auftraggeber oder Ausschreibungen"],
      it: ["Hohe Geschäftsreisetätigkeit", "Homeoffice oder hybride Arbeit", "Rechenzentrums- oder Cloud-Nutzung", "Wesentliche Beschaffungsanforderungen", "Öffentliche Auftraggeber oder Ausschreibungen"]
    },
    labels: {
      relevance: { clearly: "Klar relevant", potentially: "Potenziell relevant", not_relevant: "Derzeit nicht relevant", not_sure: "Nicht sicher" },
      availability: { complete_current: "Vollständig und aktuell", partially_available: "Teilweise verfügbar", fragmented: "Verfügbar, aber fragmentiert", not_available: "Nicht verfügbar", not_sure: "Nicht sicher" },
      evidence: { documented_retrievable: "Dokumentiert und leicht auffindbar", exists_scattered: "Vorhanden, aber verstreut", incomplete: "Unvollständig", not_available: "Kein Nachweis verfügbar", not_sure: "Nicht sicher" },
      ownership: { clearly_assigned: "Klar zugewiesen", informally_assigned: "Informell zugewiesen", multiple_departments_no_lead: "Mehrere Bereiche, keine Federführung", no_owner: "Nicht zugewiesen", not_sure: "Nicht sicher" },
      process: { documented_process: "Etabliert und dokumentiert", informal_process: "Vorhanden, aber informell", ad_hoc: "Nur ad hoc", no_process: "Kein Prozess", not_sure: "Nicht sicher" }
    }
  };
})();
