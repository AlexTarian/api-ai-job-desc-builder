const JOB_CONFIG = window.JOB_CONFIG;
console.log("job-builder.js loaded. JOB_CONFIG:", JOB_CONFIG);

if (!JOB_CONFIG || !JOB_CONFIG.categories) {
  console.error("JOB_CONFIG did not load correctly.");
}

const jobState = {
  primaryCategory: null,

  maintenanceLevel: null,
  supervisionLevel: null,

  outputs: "",
  outputsNone: false,

  equipment: "",
  equipmentNone: false,

  duties: {},
  otherDuties: {},

  additionalInfo: ""
};

const STEP_COUNT = 6;

let currentStep = 1;

let dutyQueue = [];
let dutyQueueIndex = 0;
let initialized = false;
let jotformReady = false;
let generatedDescription = "";
let acceptedDescription = "";
let descriptionAccepted = false;

const fields = {
  widgetRoot: document.getElementById("widgetRoot"),

  progressText: document.getElementById("progressText"),
  progressFill: document.getElementById("progressFill"),

  categoryStep: document.getElementById("categoryStep"),
  workContextStep: document.getElementById("workContextStep"),
  jobDetailsStep: document.getElementById("jobDetailsStep"),
  dutiesStep: document.getElementById("dutiesStep"),
  notesStep: document.getElementById("notesStep"),
  reviewStep: document.getElementById("reviewStep"),
  loadingStep: document.getElementById("loadingStep"),
  resultStep: document.getElementById("resultStep"),

  reviewBackBtn: document.getElementById("reviewBackBtn"),
  generateBtn: document.getElementById("generateBtn"),

  generatedDescription: document.getElementById("generatedDescription"),
  generationWarnings: document.getElementById("generationWarnings"),

  regenerateBtn: document.getElementById("regenerateBtn"),
  useDescriptionBtn: document.getElementById("useDescriptionBtn"),

  categoryGrid: document.getElementById("categoryGrid"),
  categoryError: document.getElementById("categoryError"),

  outputs: document.getElementById("outputs"),
  outputsNone: document.getElementById("outputsNone"),
  equipment: document.getElementById("equipment"),
  equipmentNone: document.getElementById("equipmentNone"),

  maintenanceQuestion: document.getElementById("maintenanceQuestion"),
  supervisionQuestion: document.getElementById("supervisionQuestion"),
  contextError: document.getElementById("contextError"),

  dutiesTitle: document.getElementById("dutiesTitle"),
  dutiesHelp: document.getElementById("dutiesHelp"),
  dutiesProgress: document.getElementById("dutiesProgress"),
  dutiesList: document.getElementById("dutiesList"),
  otherDuty: document.getElementById("otherDuty"),
  dutiesError: document.getElementById("dutiesError"),

  additionalInfo: document.getElementById("additionalInfo"),

  reviewContent: document.getElementById("reviewContent"),
  generateBtn: document.getElementById("generateBtn"),

  backBtn: document.getElementById("backBtn"),
  nextBtn: document.getElementById("nextBtn"),

  editDescriptionBtn: document.getElementById("editDescriptionBtn"),
  resultHelp: document.getElementById("resultHelp"),
  finalDescription: document.getElementById("finalDescription"),

  globalError: document.getElementById("globalError")
};

function clean_(value) {
  return String(value ?? "").trim();
}

function getCategory(categoryId) {
  return JOB_CONFIG.categories[categoryId] || null;
}

function renderCategories() {
  fields.categoryGrid.innerHTML = "";

  Object.entries(JOB_CONFIG.categories).forEach(([id, category]) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "category-card";
    button.innerHTML = `
      <img
        class="category-icon"
        src="${escapeHtml(category.icon)}"
        alt=""
        aria-hidden="true"
      />

      <span class="category-label">
        ${escapeHtml(category.label)}
      </span>
    `;

    if (jobState.primaryCategory === id) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      jobState.primaryCategory = id;
      fields.categoryError.textContent = "";
      renderCategories();
    });

    fields.categoryGrid.appendChild(button);
  });
}

function syncWorkContextState() {
  jobState.maintenanceLevel =
    document.querySelector('input[name="maintenanceLevel"]:checked')?.value || null;

  jobState.supervisionLevel =
    document.querySelector('input[name="supervisionLevel"]:checked')?.value || null;
}

function syncJobDetailsState() {
  jobState.outputs = clean_(fields.outputs.value);
  jobState.outputsNone = fields.outputsNone.checked;

  jobState.equipment = clean_(fields.equipment.value);
  jobState.equipmentNone = fields.equipmentNone.checked;
}

function configureWorkContextStep() {
  const primary = jobState.primaryCategory;

  fields.maintenanceQuestion.hidden = primary === "maintenance";
  fields.supervisionQuestion.hidden = primary === "supervision";

  if (primary === "maintenance") {
    jobState.maintenanceLevel = "primary";
  }

  if (primary === "supervision") {
    jobState.supervisionLevel = "primary";
  }
}

function buildDutyQueue() {
  dutyQueue = [jobState.primaryCategory];

  if (
    jobState.primaryCategory !== "maintenance" &&
    jobState.maintenanceLevel &&
    jobState.maintenanceLevel !== "none"
  ) {
    dutyQueue.push("maintenance");
  }

  if (
    jobState.primaryCategory !== "supervision" &&
    jobState.supervisionLevel &&
    jobState.supervisionLevel !== "none"
  ) {
    dutyQueue.push("supervision");
  }

  dutyQueueIndex = 0;
}

function renderCurrentDutyCategory() {
  const categoryId = dutyQueue[dutyQueueIndex];
  const category = getCategory(categoryId);

  fields.dutiesList.innerHTML = "";

  if (!category) return;

  fields.dutiesTitle.textContent = category.label;
  fields.dutiesHelp.textContent = "Select all duties that apply.";
  fields.dutiesProgress.textContent = `${dutyQueueIndex + 1} / ${dutyQueue.length}`;

  const selected = new Set(jobState.duties[categoryId] || []);

  category.duties.forEach(duty => {
    const label = document.createElement("label");
    label.className = "duty-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = duty.id;
    checkbox.checked = selected.has(duty.id);

    checkbox.addEventListener("change", () => {
      const current = new Set(jobState.duties[categoryId] || []);

      if (checkbox.checked) {
        current.add(duty.id);
      } else {
        current.delete(duty.id);
      }

      jobState.duties[categoryId] = [...current];
    });

    const text = document.createElement("span");
    text.textContent = duty.label;

    label.appendChild(checkbox);
    label.appendChild(text);

    fields.dutiesList.appendChild(label);
  });

  fields.otherDuty.value =
    jobState.otherDuties[categoryId] || "";
}

function saveCurrentDutyNotes() {
  const categoryId = dutyQueue[dutyQueueIndex];

  if (!categoryId) return;

  jobState.otherDuties[categoryId] =
    clean_(fields.otherDuty.value);
}

function validateStep() {
  fields.categoryError.textContent = "";
  fields.contextError.textContent = "";
  fields.dutiesError.textContent = "";

  if (currentStep === 1) {
    if (!jobState.primaryCategory) {
      fields.categoryError.textContent =
        "Please select the worker's primary type of work.";

      return false;
    }
  }

  if (currentStep === 2) {
    syncWorkContextState();

    if (
      jobState.primaryCategory !== "maintenance" &&
      !jobState.maintenanceLevel
    ) {
      fields.contextError.textContent =
        "Please indicate how much maintenance or repair work will be performed.";

      return false;
    }

    if (
      jobState.primaryCategory !== "supervision" &&
      !jobState.supervisionLevel
    ) {
      fields.contextError.textContent =
        "Please indicate how much supervision will be performed.";

      return false;
    }
  }

  if (currentStep === 3) {
    syncJobDetailsState();

    if (!jobState.outputs && !jobState.outputsNone) {
      fields.contextError.textContent =
        "Please describe the agricultural products involved or select None / Not applicable.";

      return false;
    }

    if (!jobState.equipment && !jobState.equipmentNone) {
      fields.contextError.textContent =
        "Please describe the equipment used or select None / Not applicable.";

      return false;
    }
  }

  if (currentStep === 4) {
    saveCurrentDutyNotes();

    const categoryId = dutyQueue[dutyQueueIndex];
    const selected = jobState.duties[categoryId] || [];
    const other = clean_(jobState.otherDuties[categoryId]);

    if (!selected.length && !other) {
      fields.dutiesError.textContent =
        "Please select at least one duty or describe other work.";

      return false;
    }
  }

  return true;
}

function goNext() {
  if (!validateStep()) return;

  if (currentStep === 3) {
    buildDutyQueue();
  }

  if (currentStep === 4) {
    saveCurrentDutyNotes();

    if (dutyQueueIndex < dutyQueue.length - 1) {
      dutyQueueIndex++;
      renderCurrentDutyCategory();
      updateProgress();
      return;
    }
  }

  if (currentStep === 6) {
    handleSubmit();
    return;
  }

  if (currentStep < STEP_COUNT) {
    currentStep++;
  }

  if (currentStep === 2) {
    configureWorkContextStep();
  }

  if (currentStep === 4) {
    renderCurrentDutyCategory();
  }

  if (currentStep === 6) {
    syncFinalState();
    renderReview();
  }

  renderStep();
}

function goBack() {
  if (currentStep === 4 && dutyQueueIndex > 0) {
    saveCurrentDutyNotes();
    dutyQueueIndex--;
    renderCurrentDutyCategory();
    updateProgress();
    return;
  }

  if (currentStep > 1) {
    currentStep--;
  }

  if (currentStep === 4) {
    renderCurrentDutyCategory();
  }

  renderStep();
}

function syncFinalState() {
  jobState.additionalInfo =
    clean_(fields.additionalInfo.value);
}

function renderReview() {
  const category = getCategory(jobState.primaryCategory);

  const dutySections = dutyQueue.map(categoryId => {
    const categoryConfig = getCategory(categoryId);
    const selectedIds = jobState.duties[categoryId] || [];

    const labels = selectedIds
      .map(id => categoryConfig.duties.find(duty => duty.id === id)?.label)
      .filter(Boolean);

    const other = clean_(jobState.otherDuties[categoryId]);

    return {
      label: categoryConfig.label,
      values: [
        ...labels,
        ...(other ? [`Other: ${other}`] : [])
      ]
    };
  });

  fields.reviewContent.innerHTML = `
    ${reviewSection("Primary Category", category?.label || "")}
    ${reviewSection("Agricultural Products", jobState.outputsNone ? "None / Not applicable" : jobState.outputs)}
    ${reviewSection("Equipment / Tools", jobState.equipmentNone ? "None / Not applicable" : jobState.equipment)}
    ${reviewSection("Maintenance", formatLevel(jobState.maintenanceLevel))}
    ${reviewSection("Supervision", formatLevel(jobState.supervisionLevel))}
    ${dutySections.map(section => reviewSection(`${section.label} Duties`, section.values.join("; "))).join("")}
    ${reviewSection("Additional Information", jobState.additionalInfo || "None")}
  `;
}

function reviewSection(label, value) {
  return `
    <div class="review-section">
      <div class="review-label">${escapeHtml(label)}</div>
      <div class="review-value">${escapeHtml(value)}</div>
    </div>
  `;
}

function handleSubmit() {
  console.log(
    "Structured job payload:",
    structuredClone(jobState)
  );

  fields.globalError.textContent =
    "AI generation will be connected next.";
}

function formatLevel(value) {
  const labels = {
    none: "None",
    incidental: "Occasional / incidental",
    regular: "Regular part of the job",
    significant: "Significant part of the job",
    primary: "Primary type of work"
  };

  return labels[value] || "";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function renderStep() {
  fields.categoryStep.hidden = currentStep !== 1;
  fields.workContextStep.hidden = currentStep !== 2;
  fields.jobDetailsStep.hidden = currentStep !== 3;
  fields.dutiesStep.hidden = currentStep !== 4;
  fields.notesStep.hidden = currentStep !== 5;
  fields.reviewStep.hidden = currentStep !== 6;

  fields.loadingStep.hidden = true;
  fields.resultStep.hidden = true;

  const isReview = currentStep === 6;

  fields.backBtn.hidden = currentStep === 1 || isReview;
  fields.nextBtn.hidden = isReview;

  fields.nextBtn.textContent =
    currentStep === 5 ? "Review" : "Continue";

  updateProgress();
  updateWidgetHeight();
}

function updateProgress() {
  const percentage = (currentStep / STEP_COUNT) * 100;

  fields.progressText.textContent =
    `Step ${currentStep} of ${STEP_COUNT}`;

  fields.progressFill.style.width =
    `${percentage}%`;
}

function updateWidgetHeight() {
  if (!jotformReady || typeof JFCustomWidget === "undefined") {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        const height = fields.widgetRoot.getBoundingClientRect().height;
        const style = getComputedStyle(document.body);

        const padding =
          (parseFloat(style.paddingTop) || 0) +
          (parseFloat(style.paddingBottom) || 0);

        JFCustomWidget.requestFrameResize({
          height: Math.ceil(height + padding)
        });
      } catch (err) {
        console.warn("Could not resize widget:", err);
      }
    });
  });
}

function showLoadingScreen() {
  fields.categoryStep.hidden = true;
  fields.workContextStep.hidden = true;
  fields.jobDetailsStep.hidden = true;
  fields.dutiesStep.hidden = true;
  fields.notesStep.hidden = true;
  fields.reviewStep.hidden = true;
  fields.resultStep.hidden = true;

  fields.loadingStep.hidden = false;

  fields.backBtn.hidden = true;
  fields.nextBtn.hidden = true;

  updateWidgetHeight();
}

function showResultScreen(description, warnings = []) {
  fields.loadingStep.hidden = true;
  fields.resultStep.hidden = false;

  generatedDescription = clean_(description);
  acceptedDescription = "";
  descriptionAccepted = false;

  fields.generatedDescription.value = generatedDescription;

  fields.generatedDescription.hidden = false;
  fields.finalDescription.hidden = true;
  fields.finalDescription.textContent = "";

  fields.regenerateBtn.hidden = false;
  fields.useDescriptionBtn.hidden = false;
  fields.editDescriptionBtn.hidden = true;

  fields.resultHelp.textContent =
    "Review and edit the description below before using it in the form.";

  if (warnings.length) {
    fields.generationWarnings.hidden = false;
    fields.generationWarnings.innerHTML = warnings
      .map(warning => `<div>⚠ ${escapeHtml(warning)}</div>`)
      .join("");
  } else {
    fields.generationWarnings.hidden = true;
    fields.generationWarnings.innerHTML = "";
  }

  updateWidgetHeight();
}

function acceptJobDescription() {
  const description = clean_(fields.generatedDescription.value);

  if (!description) {
    fields.globalError.textContent =
      "Please review the generated job description before continuing.";
    return;
  }

  acceptedDescription = description;
  descriptionAccepted = true;

  fields.globalError.textContent = "";

  fields.finalDescription.textContent = description;

  fields.generatedDescription.hidden = true;
  fields.finalDescription.hidden = false;

  fields.regenerateBtn.hidden = true;
  fields.useDescriptionBtn.hidden = true;
  fields.editDescriptionBtn.hidden = false;

  fields.resultHelp.textContent =
    "This job description has been finalized.";

  syncJobDescriptionField(description);

  updateWidgetHeight();
}

function editAcceptedDescription() {
  descriptionAccepted = false;
  acceptedDescription = "";

  fields.finalDescription.hidden = true;
  fields.generatedDescription.hidden = false;

  fields.regenerateBtn.hidden = false;
  fields.useDescriptionBtn.hidden = false;
  fields.editDescriptionBtn.hidden = true;

  fields.resultHelp.textContent =
    "Review and edit the description below before using it in the form.";

  fields.generatedDescription.focus();

  updateWidgetHeight();
}

function resetAcceptedDescription() {
  acceptedDescription = "";
  descriptionAccepted = false;

  fields.generatedDescription.readOnly = false;
  fields.useDescriptionBtn.hidden = false;
  fields.editDescriptionBtn.hidden = true;
}

function showGenerationError(message) {
  fields.loadingStep.hidden = true;
  fields.reviewStep.hidden = false;

  fields.globalError.textContent =
    message || "The job description could not be generated. Please try again.";

  updateWidgetHeight();
}

async function generateJobDescription() {
  fields.globalError.textContent = "";

  syncFinalState();

  showLoadingScreen();

  try {
    const payload = buildGenerationPayload();

    console.log(
      "Generation payload:",
      structuredClone(payload)
    );

    // Temporary placeholder until GAS/OpenAI is connected.
    await new Promise(resolve => setTimeout(resolve, 1500));

    const description =
      "Generated job description will appear here once the AI backend is connected.";

    showResultScreen(description);
  } catch (err) {
    console.error("Generation failed:", err);

    showGenerationError(
      "We couldn't generate the job description. Please review the information and try again."
    );
  }
}

function buildGenerationPayload() {
  return structuredClone(jobState);
}

function syncJobDescriptionField(description) {
  try {
    JFCustomWidget.setFieldsValueByLabel([
      {
        label: "Job Description",
        value: description
      }
    ]);
  } catch (err) {
    console.warn(
      "Could not update Job Description field:",
      err
    );
  }
}

function wireEvents() {
  fields.nextBtn.addEventListener("click", goNext);
  fields.backBtn.addEventListener("click", goBack);

  fields.outputsNone.addEventListener("change", () => {
    fields.outputs.disabled = fields.outputsNone.checked;

    if (fields.outputsNone.checked) {
      fields.outputs.value = "";
    }
  });

  fields.equipmentNone.addEventListener("change", () => {
    fields.equipment.disabled = fields.equipmentNone.checked;

    if (fields.equipmentNone.checked) {
      fields.equipment.value = "";
    }
  });

  fields.generateBtn.addEventListener("click", () => {
    console.log("Structured job payload:", structuredClone(jobState));
  });

  fields.reviewBackBtn.addEventListener("click", () => {
    currentStep = 5;
    renderStep();
  });

  fields.generateBtn.addEventListener(
    "click",
    generateJobDescription
  );

  fields.regenerateBtn.addEventListener(
    "click",
    generateJobDescription
  );

  fields.useDescriptionBtn.addEventListener("click", () => {
    const description =
      clean_(fields.generatedDescription.value);

    console.log(
      "Accepted job description:",
      description
    );
  });

  fields.useDescriptionBtn.addEventListener(
    "click",
    acceptJobDescription
  );

  fields.editDescriptionBtn.addEventListener(
    "click",
    editAcceptedDescription
  );
  
}

function initializeWidget() {
  if (initialized) return;
  initialized = true;

  console.log("Initializing Job Description Builder:", JOB_CONFIG);

  renderCategories();
  wireEvents();
  renderStep();
}

function initializeWhenDomReady() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWidget);
  } else {
    initializeWidget();
  }
}

initializeWhenDomReady();

if (typeof JFCustomWidget !== "undefined") {
  JFCustomWidget.subscribe("ready", function () {
    jotformReady = true;
    initializeWidget();
    updateWidgetHeight();
  });
}

JFCustomWidget.subscribe("submit", function () {
    if (!descriptionAccepted || !acceptedDescription) {
      fields.globalError.textContent =
        "Please generate, review, and select a job description before continuing.";

      JFCustomWidget.sendSubmit({
        valid: false,
        value: ""
      });

      return;
    }

    fields.globalError.textContent = "";

    JFCustomWidget.sendSubmit({
      valid: true,
      value: acceptedDescription
    });
  });
