const STORAGE_KEY = "vsme-readiness-check-v3";

const disclosures = [
  { code:"B1", module:"basic", title:"Grundlage für die Erstellung", hint:"VSME-Option, Berichtsgrenze, Rechtsform, NACE, Bilanzsumme, Umsatz, Beschäftigte, Länder, Standorte und Zertifizierungen.", applicability:"yes", readiness:"partial", owner:"Geschäftsführung / Controlling" },
  { code:"B2", module:"basic", title:"Praktiken, Strategien und künftige Initiativen", hint:"Bestehende Praktiken, Policies, künftige Initiativen und Ziele für den Übergang zu einer nachhaltigeren Wirtschaft.", applicability:"yes", readiness:"partial", owner:"Geschäftsführung / ESG" },
  { code:"B3", module:"basic", title:"Energie und Treibhausgasemissionen", hint:"Energieverbrauch nach Quellen, Scope 1, standortbasierter Scope 2 und THG-Intensität.", applicability:"yes", readiness:"partial", owner:"Technik / Controlling" },
  { code:"B4", module:"basic", title:"Verschmutzung von Luft, Wasser und Boden", hint:"Gemeldete Schadstoffe aus eigenen Tätigkeiten, wenn eine gesetzliche oder freiwillige Berichterstattung besteht.", applicability:"unclear", readiness:"missing", owner:"HSE / Technik" },
  { code:"B5", module:"basic", title:"Biodiversität", hint:"Anzahl und Fläche eigener, gemieteter oder bewirtschafteter Standorte in oder nahe biodiversitätssensiblen Gebieten.", applicability:"unclear", readiness:"missing", owner:"Facility Management" },
  { code:"B6", module:"basic", title:"Wasser", hint:"Wasserentnahme sowie gegebenenfalls Wasserverbrauch an Standorten in Gebieten mit hohem Wasserstress.", applicability:"yes", readiness:"partial", owner:"Technik" },
  { code:"B7", module:"basic", title:"Ressourcennutzung, Kreislaufwirtschaft und Abfall", hint:"Kreislaufprinzipien, Materialflüsse sowie Abfallmengen nach gefährlich, nicht gefährlich und Verwertungsweg.", applicability:"yes", readiness:"partial", owner:"Produktion / HSE" },
  { code:"B8", module:"basic", title:"Belegschaft – allgemeine Merkmale", hint:"Beschäftigtenzahl nach Vertragsart, Geschlecht und Land sowie gegebenenfalls Leiharbeit und Selbstständige.", applicability:"yes", readiness:"ready", owner:"Personal" },
  { code:"B9", module:"basic", title:"Gesundheit und Sicherheit", hint:"Arbeitsbedingte Todesfälle, Anzahl und Quote meldepflichtiger Arbeitsunfälle.", applicability:"yes", readiness:"ready", owner:"HSE / Personal" },
  { code:"B10", module:"basic", title:"Vergütung, Tarifbindung und Weiterbildung", hint:"Mindestlohn, Entgeltunterschied, Tarifbindung und durchschnittliche jährliche Weiterbildungsstunden.", applicability:"yes", readiness:"partial", owner:"Personal" },
  { code:"B11", module:"basic", title:"Korruption und Bestechung", hint:"Anzahl der Verurteilungen und Gesamtbetrag der Geldbußen im Berichtszeitraum.", applicability:"yes", readiness:"ready", owner:"Compliance" },
  { code:"C1", module:"comprehensive", title:"Strategie und Geschäftsmodell", hint:"Produkte und Leistungen, Märkte, wesentliche Geschäftsbeziehungen und nachhaltigkeitsbezogene Strategieelemente.", applicability:"yes", readiness:"partial", owner:"Geschäftsführung" },
  { code:"C2", module:"comprehensive", title:"Beschreibung von Praktiken und Policies", hint:"Vertiefung zu B2 mit Verantwortlichkeit, Umfang, Zielsetzung und Umsetzungsstand.", applicability:"yes", readiness:"missing", owner:"ESG-Koordination" },
  { code:"C3", module:"comprehensive", title:"THG-Ziele und Klimatransition", hint:"THG-Reduktionsziele, Basis- und Zieljahr, einbezogene Scopes sowie Übergangsmaßnahmen.", applicability:"unclear", readiness:"missing", owner:"Geschäftsführung / Technik" },
  { code:"C4", module:"comprehensive", title:"Klimarisiken", hint:"Physische und transitorische Klimarisiken, Zeithorizonte, Exposition und mögliche finanzielle Effekte.", applicability:"unclear", readiness:"missing", owner:"Risikomanagement" },
  { code:"C5", module:"comprehensive", title:"Zusätzliche Belegschaftsmerkmale", hint:"Weiterführende Aufschlüsselungen der eigenen Belegschaft und Beschäftigungsstruktur.", applicability:"yes", readiness:"partial", owner:"Personal" },
  { code:"C6", module:"comprehensive", title:"Menschenrechtspolitiken und -prozesse", hint:"Policies, Prozesse und Beschwerdemechanismen für die eigene Belegschaft.", applicability:"unclear", readiness:"missing", owner:"Personal / Compliance" },
  { code:"C7", module:"comprehensive", title:"Schwerwiegende Menschenrechtsvorfälle", hint:"Bestätigte schwere Vorfälle in eigener Belegschaft, Wertschöpfungskette oder betroffenen Gemeinschaften.", applicability:"yes", readiness:"partial", owner:"Compliance / Einkauf" },
  { code:"C8", module:"comprehensive", title:"Bestimmte Tätigkeiten und Referenzwerte", hint:"Umsätze aus bestimmten Tätigkeiten sowie Ausschluss von EU-Referenzwerten, soweit anwendbar.", applicability:"unclear", readiness:"missing", owner:"Controlling / Compliance" },
  { code:"C9", module:"comprehensive", title:"Geschlechterdiversität im Leitungsorgan", hint:"Verhältnis der Geschlechter im Verwaltungs-, Leitungs- oder Aufsichtsorgan.", applicability:"yes", readiness:"ready", owner:"Geschäftsführung / Personal" }
];

const state = {
  meta:{ companyName:"Musterwerk GmbH", sector:"Produzierendes Gewerbe", employeeBand:"medium", reportingYear:2026, moduleOption:"comprehensive", reportingBasis:"individual" },
  drivers:{ banks:true, customers:true, tenders:false, internal:true },
  filter:"scope",
  items:disclosures.map(item => ({...item, evidence:"", note:""}))
};

const refs = {
  cards:document.querySelector("#disclosureCards"),
  template:document.querySelector("#disclosureTemplate"),
  saveStatus:document.querySelector("#saveStatus")
};

function inScope(item) { return item.module === "basic" || state.meta.moduleOption === "comprehensive"; }
function itemStatus(item) {
  if (item.applicability === "no") return "na";
  if (item.applicability === "unclear") return "clarify";
  return item.readiness;
}
function statusLabel(status) {
  return ({ready:"Berichtsfähig",partial:"Teilweise",missing:"Datenlücke",clarify:"Zu klären",na:"Nicht anwendbar"})[status];
}
function moduleLabel(module) { return module === "basic" ? "Basis-Modul" : "Comprehensive"; }
function scopedItems(module) { return state.items.filter(item => (!module || item.module === module) && (module || inScope(item))); }
function readinessStats(items = scopedItems()) {
  const stats = {ready:0,partial:0,missing:0,clarify:0,na:0,total:items.length};
  items.forEach(item => stats[itemStatus(item)] += 1);
  const denominator = Math.max(1, stats.ready + stats.partial + stats.missing + stats.clarify);
  stats.score = Math.round(((stats.ready + stats.partial * .5) / denominator) * 100);
  stats.completed = Math.round(((stats.total - stats.clarify) / Math.max(1, stats.total)) * 100);
  return stats;
}

function recommendation() {
  const external = [state.drivers.banks,state.drivers.customers,state.drivers.tenders].filter(Boolean).length;
  const comprehensive = external >= 2 || (external >= 1 && state.meta.employeeBand !== "micro");
  return {comprehensive, external};
}

function createCards() {
  refs.cards.replaceChildren();
  state.items.forEach(item => {
    const card = refs.template.content.firstElementChild.cloneNode(true);
    card.dataset.code = item.code;
    card.dataset.module = item.module;
    card.querySelector(".disclosure-code").textContent = item.code;
    card.querySelector(".disclosure-module").textContent = moduleLabel(item.module);
    card.querySelector(".disclosure-title").textContent = item.title;
    card.querySelector(".disclosure-hint").textContent = item.hint;
    const applicability = card.querySelector(".applicability");
    const dataStatus = card.querySelector(".data-status");
    const evidence = card.querySelector(".evidence");
    const owner = card.querySelector(".owner");
    const note = card.querySelector(".disclosure-note");
    applicability.value = item.applicability; dataStatus.value = item.readiness; evidence.value = item.evidence; owner.value = item.owner; note.value = item.note;
    applicability.addEventListener("change", event => updateItem(item.code,"applicability",event.target.value));
    dataStatus.addEventListener("change", event => updateItem(item.code,"readiness",event.target.value));
    evidence.addEventListener("input", event => updateItem(item.code,"evidence",event.target.value,false));
    owner.addEventListener("input", event => updateItem(item.code,"owner",event.target.value,false));
    note.addEventListener("input", event => updateItem(item.code,"note",event.target.value,false));
    refs.cards.append(card);
  });
}

function updateItem(code,key,value,fullRender=true) {
  const item = state.items.find(entry => entry.code === code);
  if (!item) return;
  item[key] = value;
  if (fullRender) render(); else renderResult();
  saveState();
}

function renderCards() {
  document.querySelectorAll(".filter-button").forEach(button => button.classList.toggle("active",button.dataset.filter === state.filter));
  document.querySelectorAll(".disclosure-card").forEach(card => {
    const item = state.items.find(entry => entry.code === card.dataset.code);
    const status = itemStatus(item);
    const visible = state.filter === "all" || (state.filter === "scope" && inScope(item)) || state.filter === item.module;
    card.hidden = !visible;
    card.className = `disclosure-card ${status}${!inScope(item) ? " out-of-scope" : ""}`;
    const badge = card.querySelector(".readiness-badge");
    badge.className = `readiness-badge ${status}`;
    badge.textContent = statusLabel(status);
    const dataStatus = card.querySelector(".data-status");
    dataStatus.disabled = item.applicability !== "yes";
    card.querySelector(".evidence").disabled = item.applicability === "no";
    card.querySelector(".owner").disabled = item.applicability === "no";
  });
}

function renderModuleGuidance() {
  const rec = recommendation();
  const box = document.querySelector("#moduleGuidance");
  const recommended = rec.comprehensive ? "Option B" : "Option A";
  box.innerHTML = `<strong>Orientierung: ${recommended}</strong><span>${rec.comprehensive ? `${rec.external} externe Nutzergruppen sprechen für die zusätzlichen C-Angaben.` : "Das Basis-Modul ist ein angemessener Einstieg; einzelne C-Angaben können freiwillig ergänzt werden."}</span>`;
}

function renderOverview() {
  const stats = readinessStats();
  document.querySelector("#readinessScore").textContent = `${stats.score} %`;
  document.querySelector("#readinessGauge").style.setProperty("--readiness",`${stats.score * 3.6}deg`);
  document.querySelector("#readinessLabel").textContent = stats.score >= 80 ? "Weitgehend berichtsfähig" : stats.score >= 50 ? "Aufbau läuft" : "Wesentliche Datenarbeit offen";
  document.querySelector("#readinessExplanation").textContent = `${stats.total} Angaben im gewählten Umfang: ${stats.ready} berichtsfähig, ${stats.partial} teilweise vorhanden und ${stats.missing + stats.clarify} offen.`;
  ["ready","partial","missing","clarify"].forEach(key => {
    document.querySelector(`#${key}Count`).textContent = stats[key];
    document.querySelector(`#board${key[0].toUpperCase()+key.slice(1)}Count`).textContent = stats[key];
    const container = document.querySelector(`#board${key[0].toUpperCase()+key.slice(1)}`);
    const items = scopedItems().filter(item => itemStatus(item) === key);
    container.innerHTML = items.map(item => `<button type="button" data-jump="${item.code}" title="${item.title}">${item.code}</button>`).join("") || "<span>–</span>";
  });
  document.querySelector("#completionText").textContent = `${stats.completed} %`;
  document.querySelector("#completionBar").value = stats.completed;
  document.querySelectorAll("[data-jump]").forEach(button => button.addEventListener("click",() => jumpToCard(button.dataset.jump)));
}

function gapAction(item) {
  const status = itemStatus(item);
  if (status === "clarify") return "Anwendbarkeit prüfen und Entscheidung dokumentieren";
  if (status === "missing") return "Datenquelle, Methode und Erfassungsprozess aufbauen";
  if (status === "partial") return item.evidence ? "Daten vervollständigen und Nachweis plausibilisieren" : "Quelle belegen, Daten vervollständigen und freigeben";
  return "–";
}

function moduleCoverage(module) { return readinessStats(scopedItems(module)).score; }

function renderResult() {
  const stats = readinessStats();
  const optionB = state.meta.moduleOption === "comprehensive";
  document.querySelector("#resultTitle").textContent = optionB ? "Option B · Basis + Comprehensive" : "Option A · Basis-Modul";
  document.querySelector("#resultReason").textContent = `${state.meta.companyName} ist im gewählten Umfang zu ${stats.score} % berichtsfähig. Der Lückenplan enthält alle teilweise vorhandenen, fehlenden oder noch auf Anwendbarkeit zu prüfenden Angaben.`;
  document.querySelector("#resultScore").textContent = `${stats.score} %`;
  document.querySelector("#resultReady").textContent = stats.ready;
  document.querySelector("#resultPartial").textContent = stats.partial;
  document.querySelector("#resultMissing").textContent = stats.missing + stats.clarify;
  document.querySelector("#resultNa").textContent = stats.na;
  const gaps = scopedItems().filter(item => ["partial","missing","clarify"].includes(itemStatus(item)));
  document.querySelector("#gapTableBody").innerHTML = gaps.map(item => `<tr><td><strong>${item.code}</strong></td><td>${item.title}</td><td><span class="table-status ${itemStatus(item)}">${statusLabel(itemStatus(item))}</span></td><td>${gapAction(item)}</td><td>${item.owner || "Festlegen"}</td></tr>`).join("") || `<tr><td colspan="5">Keine offenen Angaben im gewählten Umfang.</td></tr>`;
  const basic = moduleCoverage("basic"), comprehensive = moduleCoverage("comprehensive");
  document.querySelector("#basicCoverage").value = basic; document.querySelector("#basicCoverageText").textContent = `${basic} %`;
  document.querySelector("#comprehensiveCoverage").value = comprehensive; document.querySelector("#comprehensiveCoverageText").textContent = `${comprehensive} %`;
  const steps = [
    "VSME-Option, Berichtsgrenze und Berichtsjahr unter B1 verbindlich freigeben.",
    stats.clarify ? `${stats.clarify} offene Anwendbarkeitsentscheidungen dokumentieren.` : "Anwendbarkeit aller Angaben ist dokumentiert.",
    stats.missing ? `${stats.missing} fehlende Datenquellen und Erfassungsprozesse aufbauen.` : "Für alle anwendbaren Angaben bestehen Datenquellen.",
    "Teilstände vervollständigen, Nachweise plausibilisieren und den Bericht im Vier-Augen-Prinzip freigeben."
  ];
  document.querySelector("#nextSteps").innerHTML = steps.map(step => `<li>${step}</li>`).join("");
}

function jumpToCard(code) {
  state.filter = "all";
  document.querySelectorAll(".filter-button").forEach(button => button.classList.toggle("active",button.dataset.filter === "all"));
  renderCards();
  document.querySelector(`[data-code="${code}"]`)?.scrollIntoView({behavior:"smooth",block:"center"});
}

function render() { renderModuleGuidance(); renderCards(); renderOverview(); renderResult(); }
function showView(viewId) {
  document.querySelectorAll(".assessment-view").forEach(view => view.classList.toggle("active",view.id === viewId));
  document.querySelectorAll(".assessment-tab").forEach(tab => tab.classList.toggle("active",tab.dataset.view === viewId));
  if (viewId === "resultView") renderResult();
  window.scrollTo({top:0,behavior:"smooth"});
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); refs.saveStatus.textContent = "Lokal gespeichert"; }
  catch { refs.saveStatus.textContent = "Speichern nicht verfügbar"; }
}
function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || !Array.isArray(stored.items)) return;
    Object.assign(state.meta,stored.meta || {}); Object.assign(state.drivers,stored.drivers || {}); state.filter = stored.filter || "scope";
    state.items = disclosures.map(seed => ({...seed,evidence:"",note:"",...(stored.items.find(item => item.code === seed.code) || {})}));
  } catch { /* Ungültige lokale Daten werden ignoriert. */ }
}
function syncInputs() {
  ["companyName","sector","employeeBand","reportingYear","moduleOption","reportingBasis"].forEach(id => document.querySelector(`#${id}`).value = state.meta[id]);
  document.querySelector("#driverBanks").checked = state.drivers.banks; document.querySelector("#driverCustomers").checked = state.drivers.customers;
  document.querySelector("#driverTenders").checked = state.drivers.tenders; document.querySelector("#driverInternal").checked = state.drivers.internal;
}
function csvEscape(value) { return `"${String(value ?? "").replaceAll('"','""')}"`; }
function exportCsv() {
  const rows = [["Code","Modul","Angabe","Im gewählten Umfang","Anwendbarkeit","Datenstatus","Datenquelle / Nachweis","Verantwortlich","Erläuterung"]];
  state.items.forEach(item => rows.push([item.code,moduleLabel(item.module),item.title,inScope(item)?"Ja":"Nein",item.applicability,statusLabel(itemStatus(item)),item.evidence,item.owner,item.note]));
  const csv = "\ufeff" + rows.map(row => row.map(csvEscape).join(";")).join("\r\n");
  const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})); link.download = `vsme-readiness-${state.meta.reportingYear}.csv`; link.click(); URL.revokeObjectURL(link.href);
}

loadState(); syncInputs(); createCards();
["companyName","sector","employeeBand","reportingYear","moduleOption","reportingBasis"].forEach(id => document.querySelector(`#${id}`).addEventListener("input",event => { state.meta[id] = id === "reportingYear" ? Number(event.target.value) : event.target.value; render(); saveState(); }));
[["driverBanks","banks"],["driverCustomers","customers"],["driverTenders","tenders"],["driverInternal","internal"]].forEach(([id,key]) => document.querySelector(`#${id}`).addEventListener("change",event => { state.drivers[key] = event.target.checked; renderModuleGuidance(); saveState(); }));
document.querySelectorAll(".assessment-tab").forEach(tab => tab.addEventListener("click",() => showView(tab.dataset.view)));
document.querySelectorAll(".filter-button").forEach(button => button.addEventListener("click",() => { state.filter = button.dataset.filter; document.querySelectorAll(".filter-button").forEach(item => item.classList.toggle("active",item === button)); renderCards(); saveState(); }));
document.querySelector("#exportCsvBtn").addEventListener("click",exportCsv);
document.querySelector("#printBtn").addEventListener("click",() => { showView("resultView"); setTimeout(() => window.print(),250); });
document.querySelector("#resetBtn").addEventListener("click",() => { if (!confirm("Alle lokalen Eingaben dieses Readiness-Checks zurücksetzen?")) return; localStorage.removeItem(STORAGE_KEY); location.reload(); });
render();
