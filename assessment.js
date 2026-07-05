const STORAGE_KEY = "vsme-readiness-check-v2";

const disclosures = [
  { code: "B1", module: "basic", title: "Grundlage für die Erstellung", hint: "Berichtsoption, Konsolidierung, Standorte und wesentliche Unternehmensangaben.", core: true },
  { code: "B2", module: "basic", title: "Praktiken, Strategien und künftige Initiativen", hint: "Vorhandene ESG-Maßnahmen, Policies, Ziele und geplante Verbesserungen.", core: true },
  { code: "B3", module: "basic", title: "Energie und Treibhausgasemissionen", hint: "Energieverbrauch sowie Scope-1- und Scope-2-Emissionen." },
  { code: "B4", module: "basic", title: "Verschmutzung von Luft, Wasser und Boden", hint: "Relevante Schadstoffe und Emissionen, falls anwendbar." },
  { code: "B5", module: "basic", title: "Biodiversität", hint: "Standorte in oder nahe biodiversitätssensiblen Gebieten und Flächennutzung." },
  { code: "B6", module: "basic", title: "Wasser", hint: "Wasserentnahme und gegebenenfalls Verbrauch in Gebieten mit Wasserstress." },
  { code: "B7", module: "basic", title: "Ressourcen, Kreislaufwirtschaft und Abfall", hint: "Materialeinsatz, Kreislaufprinzipien, Abfallmengen und Verwertung." },
  { code: "B8", module: "basic", title: "Belegschaft – allgemeine Merkmale", hint: "Beschäftigtenzahl, Vertragsarten, Geschlecht und Länder." },
  { code: "B9", module: "basic", title: "Gesundheit und Sicherheit", hint: "Arbeitsschutzabdeckung, Unfälle und arbeitsbedingte Todesfälle." },
  { code: "B10", module: "basic", title: "Vergütung, Tarifbindung und Weiterbildung", hint: "Mindestlohn, Entgeltunterschiede, Tarifbindung und Trainingsstunden." },
  { code: "B11", module: "basic", title: "Korruption und Bestechung", hint: "Verurteilungen und Geldbußen wegen Korruption oder Bestechung." },
  { code: "C1", module: "comprehensive", title: "Strategie und Geschäftsmodell", hint: "Geschäftsmodell, Wertschöpfung, Märkte und nachhaltigkeitsbezogene Initiativen." },
  { code: "C2", module: "comprehensive", title: "Vertiefte Beschreibung von Praktiken und Policies", hint: "Verantwortung, Geltungsbereich, Ziele und Umsetzungsstand." },
  { code: "C3", module: "comprehensive", title: "THG-Ziele und Klimatransition", hint: "Reduktionsziele, Basisjahr, Zieljahr und Übergangsmaßnahmen." },
  { code: "C4", module: "comprehensive", title: "Klimarisiken", hint: "Physische und transitorische Klimarisiken sowie mögliche finanzielle Effekte." },
  { code: "C5", module: "comprehensive", title: "Zusätzliche Belegschaftsmerkmale", hint: "Weiterführende Merkmale und Kennzahlen zur eigenen Belegschaft." },
  { code: "C6", module: "comprehensive", title: "Menschenrechtspolitiken und -prozesse", hint: "Policies, Beschwerdewege und Verfahren für die eigene Belegschaft." },
  { code: "C7", module: "comprehensive", title: "Schwerwiegende Menschenrechtsvorfälle", hint: "Bestätigte Vorfälle in eigener Belegschaft, Wertschöpfungskette oder Gemeinschaften." },
  { code: "C8", module: "comprehensive", title: "Bestimmte Sektoren und EU-Referenzwerte", hint: "Umsätze aus ausgeschlossenen oder besonders sensiblen Tätigkeiten." },
  { code: "C9", module: "comprehensive", title: "Geschlechterdiversität im Leitungsorgan", hint: "Verhältnis der Geschlechter im Verwaltungs-, Leitungs- oder Aufsichtsorgan." }
];

const seedTopics = [
  { id: "climate", code: "E1", title: "Klima, Energie und Emissionen", description: "Energieverbrauch, fossile Brennstoffe, THG-Emissionen, Klimaziele und physische oder transitorische Risiken.", standards: ["B3", "C3", "C4"], applicability: "yes", impact: 4, financial: 4, note: "" },
  { id: "pollution", code: "E2", title: "Verschmutzung", description: "Emissionen oder Einleitungen in Luft, Wasser und Boden sowie relevante Gefahrstoffe.", standards: ["B4"], applicability: "unclear", impact: 2.5, financial: 2, note: "" },
  { id: "biodiversity", code: "E4", title: "Biodiversität und Flächennutzung", description: "Standorte, Lieferketten oder Tätigkeiten mit Einfluss auf Ökosysteme und sensible Gebiete.", standards: ["B5"], applicability: "unclear", impact: 2, financial: 1.5, note: "" },
  { id: "water", code: "E3", title: "Wasser", description: "Wasserentnahme, Wasserverbrauch, Abwasser und Tätigkeiten in Gebieten mit Wasserstress.", standards: ["B6"], applicability: "unclear", impact: 2.5, financial: 2, note: "" },
  { id: "circularity", code: "E5", title: "Ressourcen, Kreislaufwirtschaft und Abfall", description: "Materialeinsatz, Ressourceneffizienz, Produktlebensdauer, Abfälle und Verwertung.", standards: ["B7"], applicability: "yes", impact: 3.5, financial: 3, note: "" },
  { id: "workforce", code: "S1", title: "Belegschaft und Beschäftigungsstruktur", description: "Beschäftigtenstruktur, Vertragsarten, Diversität und zusätzliche Belegschaftsmerkmale.", standards: ["B8", "C5"], applicability: "yes", impact: 3, financial: 2.5, note: "" },
  { id: "safety", code: "S1", title: "Gesundheit und Arbeitssicherheit", description: "Arbeitsschutzsysteme, Unfälle, arbeitsbedingte Erkrankungen und Prävention.", standards: ["B9"], applicability: "yes", impact: 4, financial: 4, note: "" },
  { id: "pay", code: "S1", title: "Vergütung, Tarifbindung und Weiterbildung", description: "Faire Vergütung, Entgeltunterschiede, Tarifbindung und Kompetenzentwicklung.", standards: ["B10"], applicability: "yes", impact: 3, financial: 3, note: "" },
  { id: "humanrights", code: "S1–S3", title: "Menschenrechte und Beschwerdewege", description: "Menschenrechtspolitiken, Beschwerdeverfahren und schwerwiegende Vorfälle im Unternehmen oder der Wertschöpfungskette.", standards: ["C6", "C7"], applicability: "unclear", impact: 3, financial: 3, note: "" },
  { id: "conduct", code: "G1", title: "Unternehmensführung und Integrität", description: "Korruptionsprävention, Compliance, Verurteilungen und Geldbußen.", standards: ["B11"], applicability: "yes", impact: 3, financial: 4, note: "" },
  { id: "strategy", code: "G1", title: "Strategie, Geschäftsmodell und ESG-Steuerung", description: "Einbindung von Nachhaltigkeit in Geschäftsmodell, Verantwortlichkeiten, Policies und Ziele.", standards: ["C1", "C2"], applicability: "yes", impact: 3, financial: 4, note: "" },
  { id: "sectors", code: "G1", title: "Sensible Sektoren und Leitungsdiversität", description: "Tätigkeiten in besonders sensiblen Sektoren sowie Zusammensetzung des Leitungsorgans.", standards: ["C8", "C9"], applicability: "unclear", impact: 2, financial: 2.5, note: "" }
];

const state = {
  meta: { companyName: "Musterwerk GmbH", sector: "Produzierendes Gewerbe", employeeBand: "medium", reportingYear: 2026 },
  drivers: { banks: true, customers: true, tenders: false, internal: true },
  threshold: 3,
  topics: structuredClone(seedTopics)
};

const refs = {
  topicCards: document.querySelector("#topicCards"), topicTemplate: document.querySelector("#topicTemplate"), canvas: document.querySelector("#matrixCanvas"),
  threshold: document.querySelector("#threshold"), thresholdOut: document.querySelector("#thresholdOut"), saveStatus: document.querySelector("#saveStatus")
};

function formatNumber(value) { return Number(value).toFixed(1).replace(".", ","); }
function topicScore(topic) { return Math.max(Number(topic.impact), Number(topic.financial)); }
function topicStatus(topic) {
  if (topic.applicability === "no") return "na";
  if (topic.applicability === "unclear") return "observe";
  return topicScore(topic) >= state.threshold ? "relevant" : "observe";
}
function statusLabel(status) { return status === "relevant" ? "Priorisiert" : status === "na" ? "Nicht anwendbar" : "Nachrangig"; }

function moduleRecommendation() {
  const external = [state.drivers.banks, state.drivers.customers, state.drivers.tenders].filter(Boolean).length;
  const relevantComprehensive = state.topics.filter(t => topicStatus(t) === "relevant" && t.standards.some(code => code.startsWith("C"))).length;
  const comprehensive = external >= 2 || (external >= 1 && state.meta.employeeBand !== "micro") || (external >= 1 && relevantComprehensive >= 2);
  return { comprehensive, external, relevantComprehensive };
}

function disclosureState(disclosure) {
  if (disclosure.core) return { status: "core", label: "Pflichtbestandteil", reason: "Im Basis-Modul grundsätzlich einzuplanen." };
  const linked = state.topics.filter(topic => topic.standards.includes(disclosure.code));
  if (linked.some(topic => topic.applicability === "yes")) return { status: "relevant", label: "Einplanen", reason: linked.filter(t => t.applicability === "yes").map(t => t.title).join(", ") };
  if (linked.some(topic => topic.applicability === "unclear")) return { status: "check", label: "Anwendbarkeit prüfen", reason: "Unternehmensbezug und verfügbare Nachweise noch klären." };
  return { status: "inactive", label: "Nicht anwendbar", reason: "Auslassung im Bericht kurz und nachvollziehbar begründen." };
}

function createTopicCards() {
  refs.topicCards.replaceChildren();
  state.topics.forEach(topic => {
    const node = refs.topicTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.id = topic.id;
    node.querySelector(".topic-code").textContent = topic.code;
    node.querySelector(".topic-title").textContent = topic.title;
    node.querySelector(".topic-description").textContent = topic.description;
    node.querySelector(".topic-standards").innerHTML = topic.standards.map(code => `<span>${code}</span>`).join("");
    const applicability = node.querySelector(".applicability");
    const impact = node.querySelector(".impact-score");
    const financial = node.querySelector(".financial-score");
    const note = node.querySelector(".topic-note");
    applicability.value = topic.applicability; impact.value = topic.impact; financial.value = topic.financial; note.value = topic.note;
    impact.nextElementSibling.textContent = formatNumber(topic.impact); financial.nextElementSibling.textContent = formatNumber(topic.financial);
    applicability.addEventListener("change", event => updateTopic(topic.id, "applicability", event.target.value));
    impact.addEventListener("input", event => { event.target.nextElementSibling.textContent = formatNumber(event.target.value); updateTopic(topic.id, "impact", Number(event.target.value)); });
    financial.addEventListener("input", event => { event.target.nextElementSibling.textContent = formatNumber(event.target.value); updateTopic(topic.id, "financial", Number(event.target.value)); });
    note.addEventListener("input", event => updateTopic(topic.id, "note", event.target.value));
    refs.topicCards.append(node);
  });
}

function updateTopic(id, key, value) {
  const topic = state.topics.find(item => item.id === id);
  if (!topic) return;
  topic[key] = value;
  render(); saveState();
}

function refreshTopicCards() {
  document.querySelectorAll(".vsme-topic-card").forEach(card => {
    const topic = state.topics.find(item => item.id === card.dataset.id);
    const status = topicStatus(topic);
    const badge = card.querySelector(".topic-status");
    badge.className = `topic-status ${status}`;
    badge.textContent = statusLabel(status);
    card.querySelectorAll("input[type=range]").forEach(input => { input.disabled = topic.applicability === "no"; });
  });
}

function drawMatrix() {
  const canvas = refs.canvas;
  const ctx = canvas.getContext("2d");
  const width = canvas.width, height = canvas.height;
  const plot = { x: 86, y: 46, w: width - 132, h: height - 118 };
  const toX = score => plot.x + ((score - 1) / 4) * plot.w;
  const toY = score => plot.y + plot.h - ((score - 1) / 4) * plot.h;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#edf3ef"; ctx.fillRect(toX(state.threshold), plot.y, plot.x + plot.w - toX(state.threshold), plot.h);
  ctx.fillRect(plot.x, plot.y, plot.w, toY(state.threshold) - plot.y);
  ctx.strokeStyle = "#d8dfdb"; ctx.lineWidth = 1; ctx.font = "13px Segoe UI, sans-serif"; ctx.fillStyle = "#66736e";
  for (let i = 1; i <= 5; i += 1) {
    const x = toX(i), y = toY(i);
    ctx.beginPath(); ctx.moveTo(x, plot.y); ctx.lineTo(x, plot.y + plot.h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(plot.x, y); ctx.lineTo(plot.x + plot.w, y); ctx.stroke();
    ctx.fillText(String(i), x - 4, plot.y + plot.h + 24); ctx.fillText(String(i), plot.x - 28, y + 5);
  }
  ctx.strokeStyle = "#ce6844"; ctx.lineWidth = 2; ctx.setLineDash([8, 7]);
  ctx.beginPath(); ctx.moveTo(toX(state.threshold), plot.y); ctx.lineTo(toX(state.threshold), plot.y + plot.h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(plot.x, toY(state.threshold)); ctx.lineTo(plot.x + plot.w, toY(state.threshold)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = "#173f36"; ctx.lineWidth = 2; ctx.strokeRect(plot.x, plot.y, plot.w, plot.h);
  const colors = { relevant: "#173f36", observe: "#c48935", na: "#a5afaa" };
  state.topics.forEach((topic, index) => {
    const status = topicStatus(topic); const x = toX(topic.financial); const y = toY(topic.impact); const radius = status === "relevant" ? 15 : 11;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = colors[status]; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#1b2824"; ctx.font = "700 11px Segoe UI, sans-serif"; ctx.fillText(`${index + 1} ${topic.code}`, x + radius + 5, y + 4);
  });
  ctx.fillStyle = "#4f5e58"; ctx.font = "700 13px Segoe UI, sans-serif"; ctx.fillText("Finanzielle Priorität →", plot.x + plot.w - 150, height - 22);
  ctx.save(); ctx.translate(23, plot.y + 165); ctx.rotate(-Math.PI / 2); ctx.fillText("Impact-Priorität →", 0, 0); ctx.restore();
}

function renderSummary() {
  const relevant = state.topics.filter(topic => topicStatus(topic) === "relevant").sort((a,b) => topicScore(b) - topicScore(a));
  const planned = state.topics.filter(topic => topic.applicability === "yes");
  const open = state.topics.filter(topic => topic.applicability === "unclear").length;
  const completed = Math.round(((state.topics.length - open) / state.topics.length) * 100);
  document.querySelector("#topicCount").textContent = state.topics.length;
  document.querySelector("#relevantCount").textContent = planned.length;
  document.querySelector("#openCount").textContent = open;
  document.querySelector("#progressText").textContent = `${completed} %`;
  document.querySelector("#progressBar").value = completed;
  const list = document.querySelector("#priorityList");
  list.innerHTML = relevant.slice(0,5).map(topic => `<li><strong>${topic.code}</strong> ${topic.title}</li>`).join("") || "<li>Noch keine Themen oberhalb der Schwelle.</li>";
}

function renderDisclosures(module, containerId) {
  const container = document.querySelector(containerId);
  container.innerHTML = disclosures.filter(item => item.module === module).map(item => {
    const result = disclosureState(item);
    return `<article class="disclosure-item ${result.status}"><strong class="disclosure-code">${item.code}</strong><div><h3>${item.title}</h3><p>${item.hint} ${result.reason ? `· ${result.reason}` : ""}</p></div><span class="disclosure-state">${result.label}</span></article>`;
  }).join("");
}

function renderResult() {
  const recommendation = moduleRecommendation();
  const title = recommendation.comprehensive ? "Option B · Basis + Comprehensive" : "Option A · Basis-Modul";
  document.querySelector("#moduleTitle").textContent = title;
  document.querySelector("#moduleBadge").textContent = recommendation.comprehensive ? "B+C" : "B";
  document.querySelector("#moduleReason").textContent = recommendation.comprehensive
    ? `Für ${state.meta.companyName} sprechen ${recommendation.external} externe Nutzergruppen für Option B. Das Comprehensive-Modul wird zusätzlich zum vollständigen Basis-Modul angewendet.`
    : `Für ${state.meta.companyName} ist Option A der angemessene Einstieg. Das Basis-Modul B1–B11 wird vollständig betrachtet; nicht anwendbare Angaben werden kenntlich gemacht.`;
  const basics = disclosures.filter(d => d.module === "basic" && ["core","relevant"].includes(disclosureState(d).status)).length;
  const comprehensive = disclosures.filter(d => d.module === "comprehensive" && disclosureState(d).status === "relevant").length;
  document.querySelector("#basicRelevant").textContent = `${basics} / 11`;
  document.querySelector("#comprehensiveRelevant").textContent = `${comprehensive} / 9`;
  const top = state.topics.filter(t => topicStatus(t) === "relevant").sort((a,b) => topicScore(b)-topicScore(a))[0];
  document.querySelector("#resultPriority").textContent = top ? top.code : "Noch offen";
  renderDisclosures("basic", "#basicDisclosures"); renderDisclosures("comprehensive", "#comprehensiveDisclosures");
  const topNames = state.topics.filter(t => topicStatus(t) === "relevant").sort((a,b) => topicScore(b)-topicScore(a)).slice(0,3).map(t => t.title);
  document.querySelector("#nextSteps").innerHTML = [
    "Option A oder B, Berichtsgrenze, Berichtsjahr und Verantwortliche für B1 festlegen.",
    `Datenquellen und Nachweise für ${topNames.join(", ") || "die relevanten Themen"} erfassen.`,
    recommendation.comprehensive ? "B1–B11 und die anwendbaren C1–C9 in einem VSME-Datenblatt zusammenführen." : "B1–B11 vollständig prüfen und die anwendbaren Angaben im VSME-Datenblatt zusammenführen.",
    "Ergebnis intern freigeben und mindestens jährlich oder bei neuen Anfragen aktualisieren."
  ].map(step => `<li>${step}</li>`).join("");
}

function render() { refs.thresholdOut.textContent = formatNumber(state.threshold); refreshTopicCards(); drawMatrix(); renderSummary(); renderResult(); }

function showView(viewId) {
  document.querySelectorAll(".assessment-view").forEach(view => view.classList.toggle("active", view.id === viewId));
  document.querySelectorAll(".assessment-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.view === viewId));
  if (viewId === "assessmentView") drawMatrix();
  if (viewId === "resultView") renderResult();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); refs.saveStatus.textContent = "Lokal gespeichert"; } catch { refs.saveStatus.textContent = "Speichern nicht verfügbar"; }
}
function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || !Array.isArray(stored.topics)) return;
    Object.assign(state.meta, stored.meta || {}); Object.assign(state.drivers, stored.drivers || {}); state.threshold = Number(stored.threshold) || 3;
    state.topics = seedTopics.map(seed => ({ ...seed, ...(stored.topics.find(item => item.id === seed.id) || {}) }));
  } catch { /* Ungültige lokale Daten werden ignoriert. */ }
}
function syncInputsFromState() {
  ["companyName","sector","employeeBand","reportingYear"].forEach(id => { document.querySelector(`#${id}`).value = state.meta[id]; });
  document.querySelector("#driverBanks").checked = state.drivers.banks; document.querySelector("#driverCustomers").checked = state.drivers.customers;
  document.querySelector("#driverTenders").checked = state.drivers.tenders; document.querySelector("#driverInternal").checked = state.drivers.internal; refs.threshold.value = state.threshold;
}
function csvEscape(value) { return `"${String(value ?? "").replaceAll('"','""')}"`; }
function exportCsv() {
  const rows = [["Bereich","Code","Bezeichnung","Unternehmensbezug","Auswirkungsrelevanz","Finanzielle Relevanz","Status","VSME-Zuordnung","Begründung"]];
  state.topics.forEach(topic => rows.push(["Thema",topic.code,topic.title,topic.applicability,formatNumber(topic.impact),formatNumber(topic.financial),statusLabel(topicStatus(topic)),topic.standards.join(" | "),topic.note]));
  disclosures.forEach(item => { const result = disclosureState(item); rows.push(["VSME",item.code,item.title,"","","",result.label,item.module === "basic" ? "Basis-Modul" : "Comprehensive-Modul",result.reason]); });
  const csv = "\ufeff" + rows.map(row => row.map(csvEscape).join(";")).join("\r\n");
  const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})); link.download = `vsme-relevanz-${state.meta.reportingYear}.csv`; link.click(); URL.revokeObjectURL(link.href);
}

loadState(); syncInputsFromState(); createTopicCards();
["companyName","sector","employeeBand","reportingYear"].forEach(id => document.querySelector(`#${id}`).addEventListener("input", event => { state.meta[id] = id === "reportingYear" ? Number(event.target.value) : event.target.value; renderResult(); saveState(); }));
[["driverBanks","banks"],["driverCustomers","customers"],["driverTenders","tenders"],["driverInternal","internal"]].forEach(([id,key]) => document.querySelector(`#${id}`).addEventListener("change", event => { state.drivers[key] = event.target.checked; renderResult(); saveState(); }));
refs.threshold.addEventListener("input", event => { state.threshold = Number(event.target.value); render(); saveState(); });
document.querySelectorAll(".assessment-tab").forEach(tab => tab.addEventListener("click", () => showView(tab.dataset.view)));
document.querySelector("#showResultBtn").addEventListener("click", () => showView("resultView"));
document.querySelector("#exportCsvBtn").addEventListener("click", exportCsv);
document.querySelector("#printBtn").addEventListener("click", () => { showView("resultView"); setTimeout(() => window.print(), 250); });
document.querySelector("#resetBtn").addEventListener("click", () => { if (!confirm("Alle lokalen Eingaben dieses Assessments zurücksetzen?")) return; localStorage.removeItem(STORAGE_KEY); location.reload(); });
render();
