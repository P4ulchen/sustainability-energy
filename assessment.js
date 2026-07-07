(() => {
  "use strict";

  const STORAGE_KEY = "vsme_readiness_assessment_v2";
  const DATA = window.VSME_DATA;
  const stepNames = ["Kontext", "Unternehmensprofil", "Informationsbedarf", "VSME-Readiness", "Nachweise und Rollen", "Prioritäten", "Ergebnis und nächste Schritte"];

  const emptyDisclosure = () => ({ relevance: "", availability: "", evidence: "", ownership: "", process: "", notes: "", confidence: {} });
  const defaultAnswers = () => ({
    assessmentContext: [], contextOther: "",
    profile: { employeeCount: "", sector: "", sectorOther: "", sites: "", geography: "", managementSystems: [], sectorPrompts: [], assessmentScope: "comprehensive" },
    requestProfile: { requesters: [], topics: [] },
    disclosures: Object.fromEntries(DATA.disclosures.map(item => [item.id, emptyDisclosure()])),
    evidenceOverview: { documentStorage: [], centralOwner: "", functionsInvolved: [], largestObstacle: "" },
    priorities: { effort: "", desiredOutcomes: [] }
  });
  const newState = () => ({
    toolVersion: DATA.toolVersion,
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    currentStep: 1,
    maxStepVisited: 1,
    answers: defaultAnswers(),
    results: {},
    exportedAt: null
  });

  let state = loadState();
  let allExpanded = false;

  const refs = {
    saveStatus: document.querySelector("#saveStatus"),
    formError: document.querySelector("#formError"),
    progress: document.querySelector("#assessmentProgress"),
    progressLabel: document.querySelector("#progressLabel"),
    progressPercent: document.querySelector("#progressPercent"),
    stepNav: document.querySelector("#stepNav"),
    backBtn: document.querySelector("#backBtn"),
    nextBtn: document.querySelector("#nextBtn"),
    disclosureList: document.querySelector("#disclosureList"),
    disclosureTemplate: document.querySelector("#disclosureTemplate")
  };

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored || stored.toolVersion !== DATA.toolVersion || !stored.answers) return newState();
      const defaults = defaultAnswers();
      stored.answers.profile = { ...defaults.profile, ...(stored.answers.profile || {}) };
      stored.answers.requestProfile = { ...defaults.requestProfile, ...(stored.answers.requestProfile || {}) };
      stored.answers.evidenceOverview = { ...defaults.evidenceOverview, ...(stored.answers.evidenceOverview || {}) };
      stored.answers.priorities = { ...defaults.priorities, ...(stored.answers.priorities || {}) };
      stored.answers.disclosures = Object.fromEntries(DATA.disclosures.map(item => [item.id, { ...emptyDisclosure(), ...(stored.answers.disclosures?.[item.id] || {}) }]));
      stored.currentStep = Math.min(7, Math.max(1, Number(stored.currentStep) || 1));
      stored.maxStepVisited = Math.max(stored.currentStep, Number(stored.maxStepVisited) || 1);
      return stored;
    } catch (_error) {
      return newState();
    }
  }

  function saveState(message = "Nur lokal gespeichert") {
    state.lastUpdatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      refs.saveStatus.textContent = message;
    } catch (_error) {
      refs.saveStatus.textContent = "Lokales Speichern nicht verfügbar";
    }
  }

  function selectedValues(selector) {
    return [...document.querySelectorAll(selector)].filter(input => input.checked).map(input => input.value);
  }

  function setChecks(selector, values) {
    const selected = new Set(values || []);
    document.querySelectorAll(selector).forEach(input => { input.checked = selected.has(input.value); });
  }

  function setRadio(name, value) {
    document.querySelectorAll(`input[name="${name}"]`).forEach(input => { input.checked = input.value === value; });
  }

  function bindRadio(name, object, key, callback) {
    document.querySelectorAll(`input[name="${name}"]`).forEach(input => input.addEventListener("change", () => {
      object[key] = input.value;
      saveState();
      callback?.();
    }));
  }

  function bindCheckboxes(selector, object, key, options = {}) {
    document.querySelectorAll(selector).forEach(input => input.addEventListener("change", () => {
      if (options.exclusive && input.checked && options.exclusive.includes(input.value)) {
        document.querySelectorAll(selector).forEach(other => { if (other !== input) other.checked = false; });
      } else if (input.checked && options.exclusive) {
        document.querySelectorAll(selector).forEach(other => { if (options.exclusive.includes(other.value)) other.checked = false; });
      }
      object[key] = selectedValues(selector);
      saveState();
      options.callback?.();
    }));
  }

  function initialiseStaticForm() {
    const sector = document.querySelector("#sector");
    DATA.sectorOptions.forEach(([value, label]) => sector.add(new Option(label, value)));

    setChecks('input[name="assessmentContext"]', state.answers.assessmentContext);
    document.querySelector("#contextOther").value = state.answers.contextOther || "";
    document.querySelector("#employeeCount").value = state.answers.profile.employeeCount ?? "";
    sector.value = state.answers.profile.sector;
    document.querySelector("#sectorOther").value = state.answers.profile.sectorOther || "";
    setRadio("sites", state.answers.profile.sites);
    setRadio("geography", state.answers.profile.geography);
    setRadio("assessmentScope", state.answers.profile.assessmentScope);
    setChecks("#managementSystems input", state.answers.profile.managementSystems);
    setChecks('input[name="requesters"]', state.answers.requestProfile.requesters);
    setChecks("#requestedTopics input", state.answers.requestProfile.topics);
    setChecks("#documentStorage input", state.answers.evidenceOverview.documentStorage);
    setRadio("centralOwner", state.answers.evidenceOverview.centralOwner);
    setChecks("#functionsInvolved input", state.answers.evidenceOverview.functionsInvolved);
    setRadio("largestObstacle", state.answers.evidenceOverview.largestObstacle);
    setRadio("effort", state.answers.priorities.effort);
    setChecks('input[name="desiredOutcomes"]', state.answers.priorities.desiredOutcomes);

    bindCheckboxes('input[name="assessmentContext"]', state.answers, "assessmentContext", { callback: renderContextOther });
    document.querySelector("#contextOther").addEventListener("input", event => { state.answers.contextOther = event.target.value; saveState(); });
    document.querySelector("#employeeCount").addEventListener("input", event => {
      state.answers.profile.employeeCount = event.target.value === "" ? "" : Number(event.target.value);
      saveState();
    });
    sector.addEventListener("change", event => { state.answers.profile.sector = event.target.value; state.answers.profile.sectorPrompts = []; saveState(); renderSectorFields(); renderDisclosureList(); });
    document.querySelector("#sectorOther").addEventListener("input", event => { state.answers.profile.sectorOther = event.target.value; saveState(); });
    bindRadio("sites", state.answers.profile, "sites");
    bindRadio("geography", state.answers.profile, "geography");
    bindRadio("assessmentScope", state.answers.profile, "assessmentScope", () => { renderDisclosureList(); renderDisclosureProgress(); });
    bindCheckboxes("#managementSystems input", state.answers.profile, "managementSystems", { exclusive: ["none"] });
    bindCheckboxes('input[name="requesters"]', state.answers.requestProfile, "requesters", { exclusive: ["none", "not_sure"], callback: renderRequestProfile });
    bindCheckboxes("#requestedTopics input", state.answers.requestProfile, "topics", { exclusive: ["not_sure"], callback: renderRequestProfile });
    bindCheckboxes("#documentStorage input", state.answers.evidenceOverview, "documentStorage", { exclusive: ["no_central"] });
    bindRadio("centralOwner", state.answers.evidenceOverview, "centralOwner");
    bindCheckboxes("#functionsInvolved input", state.answers.evidenceOverview, "functionsInvolved");
    bindRadio("largestObstacle", state.answers.evidenceOverview, "largestObstacle");
    bindRadio("effort", state.answers.priorities, "effort");
    bindCheckboxes('input[name="desiredOutcomes"]', state.answers.priorities, "desiredOutcomes");

    renderContextOther();
    renderSectorFields();
    renderRequestProfile();
  }

  function renderContextOther() {
    document.querySelector("#contextOtherWrap").hidden = !state.answers.assessmentContext.includes("other");
  }

  function renderSectorFields() {
    const profile = state.answers.profile;
    document.querySelector("#sectorOtherWrap").hidden = profile.sector !== "other";
    const prompts = DATA.sectorPrompts[profile.sector] || [];
    const panel = document.querySelector("#sectorPromptPanel");
    panel.hidden = prompts.length === 0;
    const container = document.querySelector("#sectorPrompts");
    container.replaceChildren();
    prompts.forEach((label, index) => {
      const value = `${profile.sector}_${index}`;
      const wrapper = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = value;
      input.checked = profile.sectorPrompts.includes(value);
      const span = document.createElement("span");
      span.textContent = label;
      wrapper.append(input, span);
      input.addEventListener("change", () => { profile.sectorPrompts = selectedValues("#sectorPrompts input"); saveState(); });
      container.append(wrapper);
    });
  }

  function renderRequestProfile() {
    const box = document.querySelector("#requestProfilePreview");
    const requesters = state.answers.requestProfile.requesters;
    const contexts = state.answers.assessmentContext;
    const areas = [];
    if (contexts.includes("customer_requests") || requesters.includes("major_customers")) areas.push("Energie, Emissionen, Lieferanten- und Umweltdaten");
    if (contexts.includes("bank_financing") || requesters.includes("banks_lenders")) areas.push("Energie, Emissionen, Klimarisiken und Governance");
    if (contexts.includes("public_tenders") || requesters.includes("public_procurement")) areas.push("Richtlinien, Zertifikate, Arbeitsschutz und Compliance");
    if (requesters.includes("employees")) areas.push("Belegschaft, Gesundheit, Sicherheit und Weiterbildung");
    if (requesters.includes("none")) {
      box.innerHTML = "<strong>Noch kein externer Zeitdruck</strong><p>Das Ergebnis priorisiert interne Datenklarheit und einen schlanken wiederholbaren Prozess.</p>";
      return;
    }
    if (!areas.length) {
      box.innerHTML = "<strong>Ihr Anforderungsprofil entsteht</strong><p>Wählen Sie Informationsnutzer aus. Daraus leitet der Check wahrscheinliche – nicht rechtlich verpflichtende – Themenfelder ab.</p>";
      return;
    }
    box.innerHTML = `<strong>Voraussichtlich relevante Informationsbereiche</strong><p>${[...new Set(areas)].join("; ")}.</p><small>Diese Priorisierung ist eine praktische Orientierung, keine Aussage über gesetzliche Pflichtangaben.</small>`;
  }

  function scopedDisclosures() {
    return DATA.disclosures.filter(item => item.module === "basic" || state.answers.profile.assessmentScope === "comprehensive");
  }

  function optionText(group, value) {
    return DATA.labels[group]?.[value] || "Noch offen";
  }

  function buildConfidence(container, itemId, answer) {
    container.replaceChildren();
    DATA.confidenceQuestions.forEach(([key, label]) => {
      const wrapper = document.createElement("label");
      wrapper.textContent = label;
      const select = document.createElement("select");
      select.innerHTML = '<option value="">Nicht bewertet</option><option value="yes">Ja</option><option value="partly">Teilweise</option><option value="no">Nein</option><option value="not_sure">Nicht sicher</option>';
      select.value = answer.confidence[key] || "";
      select.addEventListener("change", () => { state.answers.disclosures[itemId].confidence[key] = select.value; saveState(); });
      wrapper.append(select);
      container.append(wrapper);
    });
  }

  function renderDisclosureList() {
    const previousOpen = new Set([...refs.disclosureList.querySelectorAll(".disclosure-card.open")].map(card => card.dataset.id));
    refs.disclosureList.replaceChildren();
    scopedDisclosures().forEach(item => {
      const answer = state.answers.disclosures[item.id];
      const card = refs.disclosureTemplate.content.firstElementChild.cloneNode(true);
      card.dataset.id = item.id;
      card.querySelector(".disclosure-code").textContent = item.id;
      card.querySelector(".disclosure-category").textContent = `${item.module === "basic" ? "Basis" : "Comprehensive"} · ${item.category}`;
      card.querySelector(".disclosure-title").textContent = item.title;
      card.querySelector(".disclosure-description").textContent = item.description;
      card.querySelector(".guidance-evidence").textContent = item.guidance.evidence;
      card.querySelector(".guidance-owner").textContent = item.guidance.owner;
      card.querySelector(".guidance-action").textContent = item.guidance.firstAction;

      const fieldMap = { relevance: ".field-relevance", availability: ".field-availability", evidence: ".field-evidence", ownership: ".field-ownership", process: ".field-process", notes: ".field-notes" };
      Object.entries(fieldMap).forEach(([key, selector]) => {
        const field = card.querySelector(selector);
        field.value = answer[key] || "";
        const eventName = key === "notes" ? "input" : "change";
        field.addEventListener(eventName, () => {
          answer[key] = field.value;
          if (key === "availability") updateConfidenceVisibility(card, answer);
          updateDisclosureState(card, answer);
          renderDisclosureProgress();
          saveState();
        });
      });

      const toggle = card.querySelector(".disclosure-toggle");
      const body = card.querySelector(".disclosure-body");
      const open = allExpanded || previousOpen.has(item.id);
      body.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      card.classList.toggle("open", open);
      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        body.hidden = isOpen;
        card.classList.toggle("open", !isOpen);
      });
      buildConfidence(card.querySelector(".confidence-grid"), item.id, answer);
      updateConfidenceVisibility(card, answer);
      updateDisclosureState(card, answer);
      refs.disclosureList.append(card);
    });
    document.querySelector("#scopeLabel").textContent = state.answers.profile.assessmentScope === "basic" ? "11 Angaben · Basis-Modul" : "20 Angaben · Basis + Comprehensive";
  }

  function updateConfidenceVisibility(card, answer) {
    card.querySelector(".confidence-panel").hidden = !["complete_current", "partially_available"].includes(answer.availability);
  }

  function updateDisclosureState(card, answer) {
    const stateLabel = card.querySelector(".disclosure-state");
    card.classList.remove("complete", "clarify", "gap");
    if (!answer.relevance || !answer.availability) {
      stateLabel.textContent = "Noch offen";
      return;
    }
    if (answer.relevance === "not_relevant") {
      stateLabel.textContent = "Derzeit nicht relevant";
      card.classList.add("complete");
    } else if (answer.relevance === "not_sure" || answer.availability === "not_sure") {
      stateLabel.textContent = "Klärung erforderlich";
      card.classList.add("clarify");
    } else if (["not_available", "fragmented"].includes(answer.availability)) {
      stateLabel.textContent = optionText("availability", answer.availability);
      card.classList.add("gap");
    } else {
      stateLabel.textContent = "Grundlage eingeschätzt";
      card.classList.add("complete");
    }
  }

  function renderDisclosureProgress() {
    const items = scopedDisclosures();
    const complete = items.filter(item => {
      const answer = state.answers.disclosures[item.id];
      return Boolean(answer.relevance && answer.availability);
    }).length;
    document.querySelector("#disclosureCompletion").textContent = `${complete} von ${items.length} vollständig eingeschätzt`;
  }

  function validateStep(step) {
    let message = "";
    if (step === 1 && !state.answers.assessmentContext.length) message = "Bitte wählen Sie mindestens einen Anlass für das Assessment aus.";
    if (step === 1 && state.answers.assessmentContext.includes("other") && !state.answers.contextOther.trim()) message = "Bitte beschreiben Sie den anderen Anlass kurz.";
    if (step === 2) {
      const profile = state.answers.profile;
      if (profile.employeeCount === "" || profile.employeeCount === null || !Number.isFinite(Number(profile.employeeCount)) || Number(profile.employeeCount) < 0 || !profile.sector || !profile.sites || !profile.geography || !profile.assessmentScope) message = "Bitte füllen Sie die Anzahl der Mitarbeiter, Branche, Standorte, den geografischen Umfang und die Prüftiefe aus.";
      else if (profile.sector === "other" && !profile.sectorOther.trim()) message = "Bitte ergänzen Sie Ihre Branche.";
    }
    if (step === 3 && !state.answers.requestProfile.requesters.length) message = "Bitte wählen Sie mindestens eine Informationsnutzer-Gruppe oder „Aktuell keine Anfragen“ aus.";
    if (step === 4) {
      const missing = scopedDisclosures().filter(item => {
        const answer = state.answers.disclosures[item.id];
        return !answer.relevance || !answer.availability;
      });
      if (missing.length) message = `Bitte beantworten Sie Relevanz und Datenverfügbarkeit für alle Angaben. Noch offen: ${missing.map(item => item.id).join(", ")}.`;
    }
    if (step === 6 && (!state.answers.priorities.effort || !state.answers.priorities.desiredOutcomes.length)) message = "Bitte wählen Sie den realistischen internen Aufwand und mindestens ein gewünschtes Ergebnis aus.";
    refs.formError.hidden = !message;
    refs.formError.textContent = message;
    if (message) {
      refs.formError.focus?.();
      refs.formError.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  function showStep(step, options = {}) {
    if (step > state.maxStepVisited && !options.force) return;
    state.currentStep = step;
    state.maxStepVisited = Math.max(state.maxStepVisited, step);
    document.querySelectorAll("[data-step-panel]").forEach(panel => {
      const active = Number(panel.dataset.stepPanel) === step;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
    refs.stepNav.querySelectorAll("button").forEach(button => {
      const number = Number(button.dataset.step);
      button.setAttribute("aria-current", number === step ? "step" : "false");
      button.disabled = number > state.maxStepVisited;
      button.closest("li").classList.toggle("complete", number < state.maxStepVisited);
    });
    const progress = Math.round(((step - 1) / 6) * 100);
    refs.progress.value = progress;
    refs.progressLabel.textContent = `${step}. ${stepNames[step - 1]}`;
    refs.progressPercent.textContent = step === 7 ? "Auswertung erstellt" : `${progress} % des Ablaufs`;
    refs.backBtn.hidden = step === 1;
    refs.nextBtn.hidden = step === 7;
    refs.nextBtn.textContent = step === 6 ? "Ergebnis erstellen" : step < 6 ? `Weiter zu ${stepNames[step].toLowerCase()}` : "";
    refs.formError.hidden = true;
    if (step === 7) renderResults();
    saveState();
    if (!options.noScroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const scores = {
    availability: { complete_current: 4, partially_available: 2, fragmented: 1, not_available: 0, not_sure: 0, "": 0 },
    evidence: { documented_retrievable: 4, exists_scattered: 2, incomplete: 1, not_available: 0, not_sure: 0, "": 0 },
    ownership: { clearly_assigned: 4, informally_assigned: 2, multiple_departments_no_lead: 1, no_owner: 0, not_sure: 0, "": 0 },
    process: { documented_process: 4, informal_process: 2, ad_hoc: 1, no_process: 0, not_sure: 0, "": 0 }
  };

  function relevantAssessments() {
    return scopedDisclosures().map(item => ({ item, answer: state.answers.disclosures[item.id] })).filter(({ answer }) => answer.relevance !== "not_relevant");
  }

  function levelForAverage(average, uncertainRatio = 0) {
    if (average >= 3.25) return { key: "strong", label: "Starke Grundlage" };
    if (average >= 2) return { key: "partial", label: "Teilweise etabliert" };
    if (average >= 1) return { key: "gaps", label: "Erhebliche Lücken" };
    if (uncertainRatio >= 0.35) return { key: "visibility", label: "Eingeschränkte Transparenz" };
    return { key: "gaps", label: "Erhebliche Lücken" };
  }

  function calculateDimensions(assessments) {
    return [
      ["availability", "Datenverfügbarkeit", "Sind die Informationen vollständig und aktuell verfügbar?"],
      ["evidence", "Nachweisqualität", "Sind Quellen, Methoden und Belege nachvollziehbar auffindbar?"],
      ["ownership", "Verantwortung und Governance", "Ist eine klare Federführung mit Review-Verantwortung benannt?"],
      ["process", "Prozessreife", "Kann die Information periodisch und wiederholbar erhoben werden?"]
    ].map(([key, title, explanation]) => {
      const count = Math.max(1, assessments.length);
      const total = assessments.reduce((sum, row) => sum + scores[key][row.answer[key] || ""], 0);
      const uncertain = assessments.filter(row => !row.answer[key] || row.answer[key] === "not_sure").length;
      const average = total / count;
      return { key, title, explanation, average, uncertain, ...levelForAverage(average, uncertain / count) };
    });
  }

  function disclosureReadiness(answer) {
    if (answer.relevance === "not_sure" || [answer.availability, answer.evidence, answer.ownership, answer.process].some(value => !value || value === "not_sure")) return { label: "Klärung erforderlich", key: "clarify", score: 0 };
    const score = scores.availability[answer.availability] + scores.evidence[answer.evidence] + scores.ownership[answer.ownership] + scores.process[answer.process];
    if (score >= 13) return { label: "Starke Grundlage", key: "strong", score };
    if (score >= 8) return { label: "Teilweise etabliert", key: "partial", score };
    if (score >= 4) return { label: "Erhebliche Lücken", key: "gaps", score };
    return { label: "Eingeschränkte Transparenz", key: "visibility", score };
  }

  function priorityScore(item, answer) {
    let score = 0;
    [...state.answers.assessmentContext, ...state.answers.requestProfile.requesters].forEach(driver => { score += item.stakeholderRelevance[driver] || 0; });
    if (item.sectors.includes(state.answers.profile.sector)) score += 2;
    if (item.sectors.includes("all")) score += 0.5;
    const readiness = disclosureReadiness(answer);
    score += Math.max(0, (16 - readiness.score) / 4);
    if (["B1", "B3", "B8"].includes(item.id)) score += 1.5;
    const outcomes = state.answers.priorities.desiredOutcomes;
    if (outcomes.includes("financing") && ["B3", "B11", "C1", "C3", "C4"].includes(item.id)) score += 2;
    if (outcomes.includes("tenders") && ["B2", "B9", "B11", "C2", "C6"].includes(item.id)) score += 2;
    if (outcomes.includes("standard_package") && ["B1", "B3", "B7", "B8", "B9", "B11"].includes(item.id)) score += 1.5;
    if (outcomes.includes("customer_response") && ["B2", "B3", "B7", "C2", "C6", "C7"].includes(item.id)) score += 2;
    return score;
  }

  function whyItMatters(item) {
    const reasons = [];
    const contexts = state.answers.assessmentContext;
    const requesters = state.answers.requestProfile.requesters;
    if ((contexts.includes("customer_requests") || requesters.includes("major_customers")) && item.stakeholderRelevance.customer_requests >= 2) reasons.push("Kunden- oder Lieferkettenanfragen");
    if ((contexts.includes("bank_financing") || requesters.includes("banks_lenders")) && item.stakeholderRelevance.bank_financing >= 2) reasons.push("Finanzierungs- oder Bankanfragen");
    if ((contexts.includes("public_tenders") || requesters.includes("public_procurement")) && item.stakeholderRelevance.public_tenders >= 2) reasons.push("Ausschreibungen und Beschaffung");
    if (item.sectors.includes(state.answers.profile.sector)) reasons.push("betriebliche Relevanz Ihrer Branche");
    if (!reasons.length && item.dependencies.length) reasons.push("Grundlage für weiterführende Angaben");
    return reasons.slice(0, 2).join(" und ");
  }

  function mainGap(answer) {
    if (answer.relevance === "not_sure") return "Relevanz muss intern geklärt werden";
    const ranked = [
      [scores.availability[answer.availability || ""], "Daten sind nicht ausreichend verfügbar"],
      [scores.evidence[answer.evidence || ""], "Nachweise sind nicht konsistent auffindbar"],
      [scores.ownership[answer.ownership || ""], "Verantwortung und Federführung sind unklar"],
      [scores.process[answer.process || ""], "Ein wiederholbarer Erfassungsprozess fehlt"]
    ].sort((a, b) => a[0] - b[0]);
    return ranked[0][1];
  }

  function buildPriorities(assessments) {
    return assessments
      .map(({ item, answer }) => ({ item, answer, readiness: disclosureReadiness(answer), priorityScore: priorityScore(item, answer) }))
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 8)
      .map((row, index) => ({ ...row, priorityLabel: index < 3 ? "Jetzt starten" : index < 6 ? "Als Nächstes aufbauen" : row.readiness.key === "clarify" ? "Klären und beobachten" : "Nachrangig beobachten" }));
  }

  function serviceRecommendations(assessments) {
    const answers = assessments.map(row => row.answer);
    const evidenceGaps = answers.filter(answer => ["exists_scattered", "incomplete", "not_available"].includes(answer.evidence)).length;
    const missingProcess = answers.filter(answer => answer.availability === "not_available" || answer.process === "no_process").length;
    const recs = [];
    if (evidenceGaps >= 3 || state.answers.evidenceOverview.largestObstacle === "fragmented" || state.answers.evidenceOverview.largestObstacle === "missing_evidence") recs.push({ title: "ESG-Statusanalyse", text: "Relevante Informationen sind teilweise vorhanden, aber Nachweise und Methoden noch nicht zentral dokumentiert. Eine strukturierte Statusanalyse kann daraus eine konsistente, extern nutzbare Arbeitsgrundlage machen.", href: "bericht-esg-statusanalyse.html", action: "ESG-Statusanalyse ansehen" });
    if (missingProcess >= 3 || ["missing_data", "no_process"].includes(state.answers.evidenceOverview.largestObstacle)) recs.push({ title: "ESG-Entwicklungsplan", text: "Der Bedarf geht über einmaliges Datensammeln hinaus. Ein Entwicklungsplan kann Quellen, Verantwortlichkeiten, Dokumentationsstandards und wiederkehrende Routinen schrittweise aufbauen.", href: "bericht-esg-entwicklungsplan.html", action: "ESG-Entwicklungsplan ansehen" });
    return recs;
  }

  function renderResultChecklist() {
    const container = document.querySelector("#resultChecklist");
    container.replaceChildren();
    DATA.disclosures.forEach(item => {
      const answer = state.answers.disclosures[item.id];
      const isInScope = item.module === "basic" || state.answers.profile.assessmentScope === "comprehensive";
      let status = { label: "Nicht geprüft", key: "unassessed" };
      if (isInScope && answer.relevance === "not_relevant") status = { label: "Derzeit nicht relevant", key: "not-relevant" };
      else if (isInScope && answer.relevance) status = disclosureReadiness(answer);

      const article = document.createElement("article");
      article.className = `result-standard ${status.key}`;
      const header = document.createElement("header");
      header.innerHTML = `<div><b>${item.id}</b><span><small>${item.module === "basic" ? "Basis" : "Comprehensive"} · ${item.category}</small><strong>${item.title}</strong></span></div><em>${status.label}</em>`;
      article.append(header);

      const grid = document.createElement("div");
      grid.className = "result-standard-values";
      const fields = [
        ["Relevanz", "relevance", answer.relevance],
        ["Daten", "availability", answer.availability],
        ["Nachweise", "evidence", answer.evidence],
        ["Verantwortung", "ownership", answer.ownership],
        ["Prozess", "process", answer.process]
      ];
      fields.forEach(([label, group, value]) => {
        const field = document.createElement("div");
        const fieldLabel = document.createElement("span");
        const fieldValue = document.createElement("strong");
        fieldLabel.textContent = label;
        fieldValue.textContent = value ? optionText(group, value) : "Nicht bewertet";
        field.append(fieldLabel, fieldValue);
        grid.append(field);
      });
      article.append(grid);
      if (answer.notes.trim()) {
        const note = document.createElement("p");
        note.className = "result-standard-note";
        const noteLabel = document.createElement("strong");
        noteLabel.textContent = "Notiz: ";
        note.append(noteLabel, document.createTextNode(answer.notes.trim()));
        article.append(note);
      }
      container.append(article);
    });
  }

  function renderResults() {
    const assessments = relevantAssessments();
    const dimensions = calculateDimensions(assessments);
    const priorities = buildPriorities(assessments);
    const consulting = serviceRecommendations(assessments);
    state.results = { generatedAt: new Date().toISOString(), dimensions, priorities: priorities.map(row => ({ id: row.item.id, priorityLabel: row.priorityLabel, status: row.readiness.label, mainGap: mainGap(row.answer), action: row.item.guidance.firstAction })), consulting: consulting.map(item => item.title) };
    saveState();

    const weak = dimensions.filter(dimension => ["gaps", "visibility"].includes(dimension.key));
    const partial = dimensions.filter(dimension => dimension.key === "partial");
    let summary = "Ihr Unternehmen verfügt über eine starke operative Grundlage für die betrachteten ESG-Informationen.";
    if (weak.length) summary = `Ihre ESG-Datengrundlage weist vor allem bei ${weak.map(item => item.title.toLowerCase()).join(" und ")} Handlungsbedarf auf. Ein klarer Start bei Verantwortung, Nachweisablage und den priorisierten Datenbereichen reduziert Unsicherheit am schnellsten.`;
    else if (partial.length) summary = `Ihre ESG-Datengrundlage ist teilweise etabliert. ${partial.map(item => item.title).join(" und ")} sollten konsistenter dokumentiert und in einen wiederholbaren Ablauf überführt werden.`;
    document.querySelector("#resultSummary").textContent = summary;
    document.querySelector("#resultDate").textContent = new Date().toLocaleDateString("de-DE");

    const dimensionGrid = document.querySelector("#dimensionGrid");
    dimensionGrid.replaceChildren();
    dimensions.forEach(dimension => {
      const article = document.createElement("article");
      article.className = `dimension-card ${dimension.key}`;
      const width = Math.round((dimension.average / 4) * 100);
      article.innerHTML = `<span class="dimension-label">${dimension.title}</span><strong>${dimension.label}</strong><div class="dimension-track" aria-label="${dimension.title}: ${dimension.label}"><i style="width:${width}%"></i></div><p>${dimension.explanation}</p>${dimension.uncertain ? `<small>${dimension.uncertain} Bereich${dimension.uncertain === 1 ? "" : "e"} mit eingeschränkter Transparenz</small>` : ""}`;
      dimensionGrid.append(article);
    });

    renderResultChecklist();

    const priorityList = document.querySelector("#priorityList");
    priorityList.replaceChildren();
    priorities.forEach(row => {
      const article = document.createElement("article");
      article.className = "priority-card";
      article.innerHTML = `<div class="priority-top"><span>${row.priorityLabel}</span><b>${row.item.id}</b></div><h3>${row.item.title}</h3><dl><div><dt>Warum relevant</dt><dd>${whyItMatters(row.item)}</dd></div><div><dt>Aktueller Status</dt><dd>${row.readiness.label}</dd></div><div><dt>Hauptlücke</dt><dd>${mainGap(row.answer)}</dd></div><div><dt>Nächste Aktion</dt><dd>${row.item.guidance.firstAction}</dd></div></dl>`;
      priorityList.append(article);
    });

    const consultingSection = document.querySelector("#consultingSection");
    consultingSection.hidden = consulting.length === 0;
    const serviceBox = document.querySelector("#serviceRecommendations");
    serviceBox.replaceChildren();
    consulting.forEach(item => {
      const article = document.createElement("article");
      article.innerHTML = `<h3>${item.title}</h3><p>${item.text}</p><a href="${item.href}">${item.action} <span aria-hidden="true">→</span></a>`;
      serviceBox.append(article);
    });

    const message = buildSummaryText();
    const contactMessage = document.querySelector("#contactMessage");
    if (!contactMessage.dataset.edited) contactMessage.value = message;
  }

  function buildSummaryText() {
    const result = state.results;
    if (!result.dimensions) return "Noch kein Ergebnis erstellt.";
    const profile = state.answers.profile;
    const requests = state.answers.requestProfile;
    const evidenceOverview = state.answers.evidenceOverview;
    const priorities = state.answers.priorities;
    const maps = {
      context: { customer_requests: "Kunden- oder Lieferkettenanfragen", bank_financing: "Bank, Investor, Versicherer oder Finanzierung", public_tenders: "Ausschreibung oder Beschaffung", internal_data_management: "Interne ESG-Steuerung und Datensammlung", future_reporting: "Vorbereitung auf künftige Berichtserwartungen", parent_company: "Anfrage einer Muttergesellschaft oder Gruppe", other: state.answers.contextOther || "Anderer Anlass" },
      requesters: { major_customers: "Große Kunden", smaller_customers: "Kleinere Kunden", parent_company: "Muttergesellschaft oder Gruppe", banks_lenders: "Banken oder Kreditgeber", investors: "Investoren", insurers: "Versicherer", public_procurement: "Öffentliche Beschaffung", suppliers: "Lieferanten", employees: "Beschäftigte oder Bewerbende", none: "Aktuell keine Anfragen", not_sure: "Nicht sicher" },
      topics: { energy: "Energieverbrauch", emissions: "Treibhausgasemissionen", climate: "Klimarisiken oder -ziele", waste_water: "Abfall und Wasser", environmental_policies: "Umweltrichtlinien", workforce: "Belegschaftsdaten", health_safety: "Gesundheit und Sicherheit", human_rights: "Menschenrechte oder Lieferkette", governance: "Governance und Compliance", certificates: "Zertifikate oder Managementsysteme", supplier_standards: "Lieferantenstandards", other: "Sonstiges", not_sure: "Nicht sicher" },
      management: { iso9001: "ISO 9001", iso14001: "ISO 14001", iso50001: "ISO 50001", emas: "EMAS", energy_audit: "DIN EN 16247-1", ohs: "Arbeitsschutzmanagement", supplier_code: "Lieferantenkodex", sustainability_policy: "Umwelt- oder Nachhaltigkeitspolitik", none: "Nichts davon", other: "Sonstiges" },
      sites: { one: "Ein Standort", two_five: "Zwei bis fünf Standorte", more_five: "Mehr als fünf Standorte", remote_office: "Überwiegend remote oder bürobasiert" },
      geography: { germany: "Nur Deutschland", eu: "Mehrere EU-Länder", eu_non_eu: "EU und Nicht-EU-Länder", not_sure: "Nicht sicher" },
      scope: { basic: "Basis-Modul B1–B11", comprehensive: "Basis + Comprehensive B1–B11 und C1–C9" },
      storage: { network: "Netzlaufwerk", cloud: "Cloud-Speicher", accounting: "Buchhaltungssystem", hr: "HR-System", energy: "Energiemanagementsystem", employee_folders: "Persönliche Ablagen", email: "E-Mail-Postfächer", paper: "Papierakten", no_central: "Keine zentrale Ablage", other: "Sonstiges" },
      centralOwner: { clear: "Ja, klar zugewiesen", shared: "Zwischen Bereichen geteilt", informal: "Nicht formell zugewiesen", no: "Nein" },
      functions: { management: "Geschäftsführung", finance: "Finance oder Buchhaltung", operations: "Operations", facility: "Facility Management", hr: "HR", procurement: "Einkauf", quality: "Qualitätsmanagement", environment: "Umweltmanagement", legal: "Legal oder Compliance", sales: "Vertrieb oder Ausschreibungen", advisor: "Externe Beratung", other: "Sonstiges" },
      obstacle: { missing_data: "Daten fehlen", fragmented: "Daten sind fragmentiert", missing_evidence: "Nachweise fehlen", unclear_roles: "Verantwortung ist unklar", capacity: "Zeit oder Kapazität fehlt", relevance: "Unklar, welche Informationen zählen", methods: "Berechnungsmethoden sind unklar", no_process: "Kein zentraler Prozess", other: "Sonstiges" },
      effort: { limited: "Begrenzt: eine verantwortliche Person, wenig Zeit", moderate: "Moderat: mehrere Bereiche können beitragen", high: "Hoch: managementgestütztes Projekt ist möglich", not_sure: "Nicht sicher" },
      outcomes: { customer_response: "Konkrete Kundenanfrage beantworten", standard_package: "Standardisiertes ESG-Datenpaket", financing: "Finanzierungsfähigkeit verbessern", tenders: "Auf Ausschreibungen vorbereiten", annual_process: "Jährlichen Datenprozess aufbauen", identify_gaps: "Größte ESG-Datenlücken erkennen", future_reporting: "Basis für künftige Berichterstattung" },
      confidence: { yes: "Ja", partly: "Teilweise", no: "Nein", not_sure: "Nicht sicher" }
    };
    const list = (values, map) => values?.length ? values.map(value => map[value] || value).join(", ") : "Keine Angabe";
    const sectorLabel = profile.sector === "other" ? profile.sectorOther || "Sonstige" : DATA.sectorOptions.find(([value]) => value === profile.sector)?.[1] || "Keine Angabe";
    const promptOptions = DATA.sectorPrompts[profile.sector] || [];
    const sectorPromptLabels = profile.sectorPrompts.map(value => {
      const index = Number(value.slice(value.lastIndexOf("_") + 1));
      return promptOptions[index] || value;
    });
    const lines = [
      "VSME Readiness-Check – vollständige Eingabeübersicht",
      `Assessment-Datum: ${new Date(result.generatedAt).toLocaleDateString("de-DE")}`,
      "",
      "1. Assessment-Kontext",
      `Anlass: ${list(state.answers.assessmentContext, maps.context)}`,
      state.answers.contextOther.trim() ? `Freitext zum Anlass: ${state.answers.contextOther.trim()}` : "Freitext zum Anlass: Keine Angabe",
      "",
      "2. Unternehmensprofil",
      `Mitarbeiterzahl: ${profile.employeeCount === "" ? "Keine Angabe" : profile.employeeCount}`,
      `Branche: ${sectorLabel}`,
      `Standorte: ${maps.sites[profile.sites] || "Keine Angabe"}`,
      `Geografischer Umfang: ${maps.geography[profile.geography] || "Keine Angabe"}`,
      `Managementsysteme und Grundlagen: ${list(profile.managementSystems, maps.management)}`,
      `Branchenspezifische Merkmale: ${sectorPromptLabels.length ? sectorPromptLabels.join(", ") : "Keine Angabe"}`,
      `Prüftiefe: ${maps.scope[profile.assessmentScope] || "Keine Angabe"}`,
      "",
      "3. Informationsbedarf",
      `Informationsnutzer: ${list(requests.requesters, maps.requesters)}`,
      `Bereits angefragte Themen: ${list(requests.topics, maps.topics)}`,
      "",
      "4. VSME-Readiness-Angaben"
    ];

    DATA.disclosures.forEach(item => {
      const answer = state.answers.disclosures[item.id];
      const isInScope = item.module === "basic" || profile.assessmentScope === "comprehensive";
      if (!isInScope) {
        lines.push(`${item.id} – ${item.title}`, "  Nicht geprüft (außerhalb der gewählten Prüftiefe)");
        return;
      }
      lines.push(
        `${item.id} – ${item.title}`,
        `  Relevanz: ${answer.relevance ? optionText("relevance", answer.relevance) : "Nicht bewertet"}`,
        `  Datenverfügbarkeit: ${answer.availability ? optionText("availability", answer.availability) : "Nicht bewertet"}`,
        `  Nachweisqualität: ${answer.evidence ? optionText("evidence", answer.evidence) : "Nicht bewertet"}`,
        `  Verantwortung: ${answer.ownership ? optionText("ownership", answer.ownership) : "Nicht bewertet"}`,
        `  Prozessreife: ${answer.process ? optionText("process", answer.process) : "Nicht bewertet"}`,
        `  Notiz: ${answer.notes.trim() || "Keine Angabe"}`
      );
      const confidenceEntries = DATA.confidenceQuestions
        .filter(([key]) => answer.confidence[key])
        .map(([key, label]) => `${label} ${maps.confidence[answer.confidence[key]] || answer.confidence[key]}`);
      lines.push(`  Datenvertrauen: ${confidenceEntries.length ? confidenceEntries.join("; ") : "Keine Detailangaben"}`);
    });

    lines.push(
      "",
      "5. Nachweise und Rollen",
      `Dokumentenablage: ${list(evidenceOverview.documentStorage, maps.storage)}`,
      `Zentrale ESG-Datenverantwortung: ${maps.centralOwner[evidenceOverview.centralOwner] || "Keine Angabe"}`,
      `Beteiligte Funktionen: ${list(evidenceOverview.functionsInvolved, maps.functions)}`,
      `Größtes Hindernis: ${maps.obstacle[evidenceOverview.largestObstacle] || "Keine Angabe"}`,
      "",
      "6. Prioritäten",
      `Realisierbarer interner Aufwand: ${maps.effort[priorities.effort] || "Keine Angabe"}`,
      `Gewünschte Ergebnisse: ${list(priorities.desiredOutcomes, maps.outcomes)}`,
      "",
      "7. Auswertung",
      ...result.dimensions.map(item => `Readiness – ${item.title}: ${item.label}`),
      ...result.priorities.map(item => `Priorität – ${item.id} · ${item.priorityLabel}: ${item.mainGap}. Nächste Aktion: ${item.action}`)
    );
    if (result.consulting.length) lines.push(`Optionale Unterstützung: ${result.consulting.join(", ")}`);
    lines.push("", "Diese Readiness-Einschätzung beruht auf Selbstauskünften und dient der internen ESG-Vorbereitung. Sie ist keine Rechts-, Prüfungs-, Assurance- oder Compliance-Beratung.");
    return lines.join("\n");
  }

  function excelXmlEscape(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
  }

  function excelColumnName(index) {
    let value = index + 1;
    let name = "";
    while (value > 0) {
      value -= 1;
      name = String.fromCharCode(65 + (value % 26)) + name;
      value = Math.floor(value / 26);
    }
    return name;
  }

  function excelCell(value, style = 5) {
    return { value, style };
  }

  function excelRow(values, style = 5, height = null) {
    return { cells: values.map(value => value && typeof value === "object" && Object.hasOwn(value, "value") ? value : excelCell(value, style)), height };
  }

  function excelWorksheetXml({ rows, widths, merges = [], freezeRows = 0, autoFilter = "" }) {
    const maxColumns = widths.length;
    const dimension = `A1:${excelColumnName(maxColumns - 1)}${Math.max(1, rows.length)}`;
    const columns = widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join("");
    const sheetRows = rows.map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const cells = row.cells.map((cell, columnIndex) => {
        if (cell === null || cell === undefined) return "";
        const reference = `${excelColumnName(columnIndex)}${rowNumber}`;
        const style = Number.isInteger(cell.style) ? cell.style : 5;
        if (typeof cell.value === "number" && Number.isFinite(cell.value)) return `<c r="${reference}" s="${style}" t="n"><v>${cell.value}</v></c>`;
        return `<c r="${reference}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${excelXmlEscape(cell.value)}</t></is></c>`;
      }).join("");
      return `<row r="${rowNumber}"${row.height ? ` ht="${row.height}" customHeight="1"` : ""}>${cells}</row>`;
    }).join("");
    const pane = freezeRows ? `<pane ySplit="${freezeRows}" topLeftCell="A${freezeRows + 1}" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A${freezeRows + 1}" sqref="A${freezeRows + 1}"/>` : "<selection activeCell=\"A1\" sqref=\"A1\"/>";
    const mergeXml = merges.length ? `<mergeCells count="${merges.length}">${merges.map(reference => `<mergeCell ref="${reference}"/>`).join("")}</mergeCells>` : "";
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="${dimension}"/><sheetViews><sheetView showGridLines="0" workbookViewId="0">${pane}</sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>${columns}</cols><sheetData>${sheetRows}</sheetData>${autoFilter ? `<autoFilter ref="${autoFilter}"/>` : ""}${mergeXml}<pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>`;
  }

  function excelStylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="5">
    <font><sz val="10"/><color rgb="FF203A33"/><name val="Aptos"/><family val="2"/></font>
    <font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Aptos Display"/><family val="2"/></font>
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Aptos"/><family val="2"/></font>
    <font><b/><sz val="10"/><color rgb="FFC96942"/><name val="Aptos"/><family val="2"/></font>
    <font><b/><sz val="10"/><color rgb="FF173F36"/><name val="Aptos"/><family val="2"/></font>
  </fonts>
  <fills count="11">
    <fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF173F36"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFC96942"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEEF3EF"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF6F1E6"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFDDEDE6"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFDCEBF2"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF5DDD6"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF5E8D2"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE3E9E6"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFCAD6D1"/></left><right style="thin"><color rgb="FFCAD6D1"/></right><top style="thin"><color rgb="FFCAD6D1"/></top><bottom style="thin"><color rgb="FFCAD6D1"/></bottom><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="12">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="9" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="10" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;
  }

  function excelInputRows() {
    const rows = [];
    let section = "Allgemein";
    buildSummaryText().split("\n").forEach(line => {
      const text = line.trim();
      if (!text || text.startsWith("VSME Readiness-Check") || text.startsWith("Diese Readiness-Einschätzung")) return;
      if (/^\d+\./.test(text)) {
        section = text;
        return;
      }
      if (section.startsWith("4.") || section.startsWith("7.")) return;
      const separator = text.indexOf(":");
      rows.push(separator > -1 ? [section.replace(/^\d+\.\s*/, ""), text.slice(0, separator), text.slice(separator + 1).trim()] : [section.replace(/^\d+\.\s*/, ""), "Angabe", text]);
    });
    return rows;
  }

  function excelStatusStyle(answer, isInScope) {
    if (!isInScope) return 10;
    if (answer.relevance === "not_relevant") return 10;
    const key = disclosureReadiness(answer).key;
    return ({ strong: 6, partial: 7, gaps: 8, visibility: 9, clarify: 9 })[key] || 10;
  }

  function buildExcelSheets() {
    const result = state.results;
    const profile = state.answers.profile;
    const sectorLabel = profile.sector === "other" ? profile.sectorOther || "Sonstige" : DATA.sectorOptions.find(([value]) => value === profile.sector)?.[1] || "Keine Angabe";
    const scopeLabel = profile.assessmentScope === "basic" ? "Basis-Modul B1–B11" : "Basis + Comprehensive B1–B11 und C1–C9";
    const contextLabels = { customer_requests: "Kunden- oder Lieferkettenanfragen", bank_financing: "Finanzierung", public_tenders: "Ausschreibungen", internal_data_management: "Interne ESG-Steuerung", future_reporting: "Künftige Berichtserwartungen", parent_company: "Muttergesellschaft oder Gruppe", other: state.answers.contextOther || "Anderer Anlass" };
    const contexts = state.answers.assessmentContext.map(value => contextLabels[value] || value).join(", ") || "Keine Angabe";
    const services = result.consulting.length ? result.consulting : ["Aktuell keine externe Unterstützung aus den Antworten abgeleitet"];
    const blankSix = () => Array.from({ length: 6 }, () => excelCell("", 1));
    const overviewRows = [
      excelRow([excelCell("VSME-Readiness Check\nManagementübersicht · lokal aus den Assessment-Angaben erzeugt", 1), ...blankSix().slice(1)], 1, 42),
      excelRow(blankSix(), 1, 18), excelRow(["", "", "", "", "", ""]),
      excelRow([excelCell("Assessment", 2), excelCell("Unternehmensprofil", 2), "", excelCell("Optionale Unterstützung", 2), excelCell("", 2), excelCell("", 2)]),
      excelRow([excelCell("Datum", 4), new Date(result.generatedAt).toLocaleDateString("de-DE"), "", services[0] || "", "", ""]),
      excelRow([excelCell("Mitarbeiter", 4), profile.employeeCount === "" ? "Keine Angabe" : Number(profile.employeeCount), "", services[1] || "", "", ""]),
      excelRow([excelCell("Branche", 4), sectorLabel, "", "Nur angezeigt, wenn die Antworten den Bedarf stützen.", "", ""]),
      excelRow([excelCell("Prüftiefe", 4), scopeLabel, "", "", "", ""]),
      excelRow(["", "", "", "", "", ""]),
      excelRow([excelCell("Readiness-Dimension", 3), excelCell("Einordnung", 3), "", excelCell("Assessment-Kontext", 3), excelCell("", 3), excelCell("", 3)]),
      ...result.dimensions.map((dimension, index) => excelRow([dimension.title, excelCell(dimension.label, ({ strong: 6, partial: 7, gaps: 8, visibility: 9 })[dimension.key] || 10), "", index === 0 ? contexts : "", "", ""]))
    ];

    const checklistRows = DATA.disclosures.map(item => {
      const answer = state.answers.disclosures[item.id];
      const isInScope = item.module === "basic" || profile.assessmentScope === "comprehensive";
      let status = "Nicht geprüft";
      if (isInScope && answer.relevance === "not_relevant") status = "Derzeit nicht relevant";
      else if (isInScope && answer.relevance) status = disclosureReadiness(answer).label;
      const confidence = DATA.confidenceQuestions.filter(([key]) => answer.confidence[key]).map(([key, label]) => `${label} ${({ yes: "Ja", partly: "Teilweise", no: "Nein", not_sure: "Nicht sicher" })[answer.confidence[key]]}`).join("; ");
      const note = [answer.notes.trim(), confidence ? `Datenvertrauen: ${confidence}` : ""].filter(Boolean).join(" | ");
      return excelRow([
        excelCell(item.id, 11), item.title,
        answer.relevance ? optionText("relevance", answer.relevance) : "Nicht bewertet",
        answer.availability ? optionText("availability", answer.availability) : "Nicht bewertet",
        answer.evidence ? optionText("evidence", answer.evidence) : "Nicht bewertet",
        answer.ownership ? optionText("ownership", answer.ownership) : "Nicht bewertet",
        answer.process ? optionText("process", answer.process) : "Nicht bewertet",
        excelCell(status, excelStatusStyle(answer, isInScope)), note
      ]);
    });
    const checklist = [
      excelRow([excelCell("VSME-Readiness Checkliste\nAlle Angaben B1–B11 und C1–C9 mit den im Tool erfassten Antworten", 1), ...Array.from({ length: 8 }, () => excelCell("", 1))], 1, 42),
      excelRow(Array.from({ length: 9 }, () => excelCell("", 1)), 1, 18), excelRow(Array(9).fill("")),
      excelRow(["Code", "VSME-Angabe", "Relevanz", "Daten", "Nachweise", "Verantwortung", "Prozess", "Status", "Notiz / Datenvertrauen"], 3),
      ...checklistRows
    ];

    const priorityRows = result.priorities.map(item => excelRow([item.priorityLabel, excelCell(item.id, 11), DATA.disclosures.find(disclosure => disclosure.id === item.id)?.title || item.id, item.status, item.mainGap, item.action]));
    const priorities = [
      excelRow([excelCell("Priorisierte Informationsbereiche\nAus Kontext, externer Nachfrage, Branche und Readiness-Gap abgeleitet", 1), ...Array.from({ length: 5 }, () => excelCell("", 1))], 1, 42),
      excelRow(Array.from({ length: 6 }, () => excelCell("", 1)), 1, 18), excelRow(Array(6).fill("")),
      excelRow(["Priorität", "Code", "Informationsbereich", "Status", "Hauptlücke", "Nächste Aktion"], 3),
      ...priorityRows
    ];

    const inputData = excelInputRows();
    const inputs = [
      excelRow([excelCell("Assessment-Eingaben\nVollständige, nachvollziehbare Übersicht der im Browser erfassten Angaben", 1), excelCell("", 1), excelCell("", 1)], 1, 42),
      excelRow([excelCell("", 1), excelCell("", 1), excelCell("", 1)], 1, 18), excelRow(["", "", ""]),
      excelRow(["Bereich", "Feld", "Eingabe"], 3),
      ...inputData.map(values => excelRow(values))
    ];
    return [
      { name: "Übersicht", rows: overviewRows, widths: [27, 34, 4, 27, 22, 22], merges: ["A1:F2", "D4:F4", "D10:F10"], freezeRows: 2 },
      { name: "VSME-Checkliste", rows: checklist, widths: [8, 36, 24, 24, 27, 27, 24, 23, 46], merges: ["A1:I2"], freezeRows: 4, autoFilter: `A4:I${checklist.length}` },
      { name: "Prioritäten", rows: priorities, widths: [23, 8, 36, 24, 40, 48], merges: ["A1:F2"], freezeRows: 4, autoFilter: `A4:F${priorities.length}` },
      { name: "Eingaben", rows: inputs, widths: [28, 34, 72], merges: ["A1:C2"], freezeRows: 4, autoFilter: `A4:C${inputs.length}` }
    ];
  }

  async function exportExcel() {
    if (!window.JSZip) {
      refs.saveStatus.textContent = "Excel-Export nicht verfügbar";
      return;
    }
    const sheets = buildExcelSheets();
    const zip = new window.JSZip();
    const contentOverrides = sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("");
    zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${contentOverrides}<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`);
    zip.folder("_rels").file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`);
    const sheetEntries = sheets.map((sheet, index) => `<sheet name="${excelXmlEscape(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("");
    zip.folder("xl").file("workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="14000"/></bookViews><sheets>${sheetEntries}</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`);
    const sheetRelationships = sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("");
    zip.folder("xl").folder("_rels").file("workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetRelationships}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
    zip.folder("xl").file("styles.xml", excelStylesXml());
    const worksheetFolder = zip.folder("xl").folder("worksheets");
    sheets.forEach((sheet, index) => worksheetFolder.file(`sheet${index + 1}.xml`, excelWorksheetXml(sheet)));
    const now = new Date().toISOString();
    zip.folder("docProps").file("core.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>VSME-Readiness Ergebnis</dc:title><dc:creator>Dammann Sustainability &amp; Energy</dc:creator><cp:lastModifiedBy>Dammann Sustainability &amp; Energy</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`);
    zip.folder("docProps").file("app.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Dammann Sustainability &amp; Energy</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Arbeitsblätter</vt:lpstr></vt:variant><vt:variant><vt:i4>${sheets.length}</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="${sheets.length}" baseType="lpstr">${sheets.map(sheet => `<vt:lpstr>${excelXmlEscape(sheet.name)}</vt:lpstr>`).join("")}</vt:vector></TitlesOfParts><Company>Dammann Sustainability &amp; Energy</Company><AppVersion>16.0300</AppVersion></Properties>`);
    const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", compression: "DEFLATE", compressionOptions: { level: 6 } });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `VSME-Readiness-Ergebnis-${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    state.exportedAt = new Date().toISOString();
    saveState("Excel-Datei lokal erstellt");
  }

  function initialiseEvents() {
    refs.nextBtn.addEventListener("click", () => {
      if (!validateStep(state.currentStep)) return;
      showStep(Math.min(7, state.currentStep + 1), { force: true });
    });
    refs.backBtn.addEventListener("click", () => showStep(Math.max(1, state.currentStep - 1)));
    refs.stepNav.querySelectorAll("button").forEach(button => button.addEventListener("click", () => showStep(Number(button.dataset.step))));
    document.querySelector("#expandAllBtn").addEventListener("click", event => {
      allExpanded = !allExpanded;
      event.currentTarget.textContent = allExpanded ? "Alle schließen" : "Alle öffnen";
      document.querySelectorAll(".disclosure-card").forEach(card => {
        card.classList.toggle("open", allExpanded);
        card.querySelector(".disclosure-toggle").setAttribute("aria-expanded", String(allExpanded));
        card.querySelector(".disclosure-body").hidden = !allExpanded;
      });
    });
    document.querySelector("#resetBtn").addEventListener("click", () => {
      if (!window.confirm("Alle lokal gespeicherten Eingaben dieses Assessments löschen und neu starten?")) return;
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    });
    document.querySelector("#printBtn").addEventListener("click", () => { state.exportedAt = new Date().toISOString(); saveState(); window.print(); });
    document.querySelector("#excelBtn").addEventListener("click", exportExcel);
    document.querySelector("#contactMessage").addEventListener("input", event => { event.currentTarget.dataset.edited = "true"; });
    document.querySelector("#contactForm").addEventListener("submit", event => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      const name = document.querySelector("#contactName").value.trim();
      const company = document.querySelector("#contactCompany").value.trim();
      const email = document.querySelector("#contactEmail").value.trim();
      const phone = document.querySelector("#contactPhone").value.trim();
      const message = document.querySelector("#contactMessage").value.trim();
      const body = `Name: ${name}\nUnternehmen: ${company}\nE-Mail: ${email}\nTelefon: ${phone || "–"}\n\n${message}`;
      window.location.href = `mailto:beratung@dammann-sustainability-energy.de?subject=${encodeURIComponent("Anfrage VSME Readiness Review")}&body=${encodeURIComponent(body)}`;
    });
  }

  initialiseStaticForm();
  renderDisclosureList();
  renderDisclosureProgress();
  initialiseEvents();
  showStep(state.currentStep, { force: true, noScroll: true });
})();
