const JOB_CONFIG = window.JOB_CONFIG;
console.log("job-builder.js loaded. JOB_CONFIG:", JOB_CONFIG);

if (!JOB_CONFIG || !JOB_CONFIG.categories) {
  console.error("JOB_CONFIG did not load correctly.");
}

const jobState = {
  primaryCategory: null,
  secondaryCategories: [],

  maintenanceLevel: null,
  supervisionLevel: null,

  seasons: [],
  seasonSource: "manual",

  outputs: "",
  outputsNone: false,
  outputTypes: [],

  equipment: "",
  equipmentNone: false,
  equipmentTypes: [],

  jobGoal: "",

  duties: {},
  otherDuties: {},

  additionalInfo: ""
};

const STEP_COUNT = 8;

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

  primaryTypeStep: document.getElementById("primaryTypeStep"),
  secondaryTypesStep: document.getElementById("secondaryTypesStep"),
  workContextStep: document.getElementById("workContextStep"),
  seasonStep: document.getElementById("seasonStep"),
  jobDetailsStep: document.getElementById("jobDetailsStep"),
  jobGoalStep: document.getElementById("jobGoalStep"),
  dutiesStep: document.getElementById("dutiesStep"),
  reviewStep: document.getElementById("reviewStep"),

  loadingStep: document.getElementById("loadingStep"),
  resultStep: document.getElementById("resultStep"),

  primaryTypeGrid: document.getElementById("primaryTypeGrid"),
  secondaryTypesGrid: document.getElementById("secondaryTypesGrid"),

  primaryTypeError: document.getElementById("primaryTypeError"),
  secondaryTypesError: document.getElementById("secondaryTypesError"),
  workContextError: document.getElementById("workContextError"),
  seasonError: document.getElementById("seasonError"),
  jobDetailsError: document.getElementById("jobDetailsError"),
  jobGoalError: document.getElementById("jobGoalError"),
  dutiesError: document.getElementById("dutiesError"),

  maintenanceQuestion: document.getElementById("maintenanceQuestion"),
  supervisionQuestion: document.getElementById("supervisionQuestion"),

  outputs: document.getElementById("outputs"),
  outputsNone: document.getElementById("outputsNone"),

  equipment: document.getElementById("equipment"),
  equipmentNone: document.getElementById("equipmentNone"),

  jobGoal: document.getElementById("jobGoal"),
  jobGoalSuggestions: document.getElementById("jobGoalSuggestions"),
  additionalInfo: document.getElementById("additionalInfo"),

  dutiesTitle: document.getElementById("dutiesTitle"),
  dutiesHelp: document.getElementById("dutiesHelp"),
  dutiesProgress: document.getElementById("dutiesProgress"),
  dutiesList: document.getElementById("dutiesList"),
  otherDuty: document.getElementById("otherDuty"),

  reviewContent: document.getElementById("reviewContent"),
  reviewBackBtn: document.getElementById("reviewBackBtn"),
  generateBtn: document.getElementById("generateBtn"),

  generatedDescription: document.getElementById("generatedDescription"),
  generationWarnings: document.getElementById("generationWarnings"),

  regenerateBtn: document.getElementById("regenerateBtn"),
  useDescriptionBtn: document.getElementById("useDescriptionBtn"),
  editDescriptionBtn: document.getElementById("editDescriptionBtn"),

  resultHelp: document.getElementById("resultHelp"),
  finalDescription: document.getElementById("finalDescription"),

  backBtn: document.getElementById("backBtn"),
  nextBtn: document.getElementById("nextBtn"),

  globalError: document.getElementById("globalError")
};

function getSetting_(name) {
  try {
    return clean_(
      JFCustomWidget.getWidgetSetting(name)
    );
  } catch (err) {
    console.warn(
      `Could not read setting ${name}:`,
      err
    );

    return "";
  }
}

function clean_(value) {
  return String(value ?? "").trim();
}

function getCategory(categoryId) {
  return JOB_CONFIG.categories[categoryId] || null;
}

function renderPrimaryTypes() {
  fields.primaryTypeGrid.innerHTML = "";

  Object.entries(JOB_CONFIG.categories).forEach(([id, category]) => {
    const button = createCategoryButton_(id, category);

    if (jobState.primaryCategory === id) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      const previousPrimary = jobState.primaryCategory;

      jobState.primaryCategory = id;

      // A category cannot be both primary and secondary.
      jobState.secondaryCategories =
        jobState.secondaryCategories.filter(categoryId => categoryId !== id);

      // Reset old automatic primary levels if the primary changed.
      if (previousPrimary === "maintenance" && id !== "maintenance") {
        jobState.maintenanceLevel = null;
      }

      if (previousPrimary === "supervision" && id !== "supervision") {
        jobState.supervisionLevel = null;
      }

      if (id === "maintenance") {
        jobState.maintenanceLevel = "primary";
      }

      if (id === "supervision") {
        jobState.supervisionLevel = "primary";
      }

      fields.primaryTypeError.textContent = "";

      renderPrimaryTypes();
      renderSecondaryTypes();

      // Primary selection advances immediately.
      currentStep = 2;
      renderStep();
    });

    fields.primaryTypeGrid.appendChild(button);
  });
}

function renderSecondaryTypes() {
  fields.secondaryTypesGrid.innerHTML = "";

  Object.entries(JOB_CONFIG.categories).forEach(([id, category]) => {
    if (id === jobState.primaryCategory) {
      return;
    }

    const button = createCategoryButton_(id, category);

    if (jobState.secondaryCategories.includes(id)) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      const selected = new Set(jobState.secondaryCategories);

      if (selected.has(id)) {
        selected.delete(id);
      } else {
        selected.add(id);
      }

      jobState.secondaryCategories = [...selected];

      fields.secondaryTypesError.textContent = "";
      renderSecondaryTypes();
    });

    fields.secondaryTypesGrid.appendChild(button);
  });
}

function createCategoryButton_(id, category) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "category-card";
  button.dataset.categoryId = id;

  button.innerHTML = `
    <img class="category-icon" src="${escapeHtml(category.icon)}" alt="" aria-hidden="true" />
    <span class="category-label">${escapeHtml(category.label)}</span>
  `;

  return button;
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

  fields.maintenanceQuestion.hidden =
    primary === "maintenance";

  fields.supervisionQuestion.hidden =
    primary === "supervision";

  if (primary === "maintenance") {
    jobState.maintenanceLevel = "primary";
  }

  if (primary === "supervision") {
    jobState.supervisionLevel = "primary";
  }

  syncWorkContextInputs_();
}

function syncWorkContextInputs_() {
  if (jobState.maintenanceLevel !== "primary") {
    const input = document.querySelector(
      `input[name="maintenanceLevel"][value="${jobState.maintenanceLevel || ""}"]`
    );

    if (input) input.checked = true;
  }

  if (jobState.supervisionLevel !== "primary") {
    const input = document.querySelector(
      `input[name="supervisionLevel"][value="${jobState.supervisionLevel || ""}"]`
    );

    if (input) input.checked = true;
  }
}

function syncSeasonState() {
  jobState.seasons = [
    ...document.querySelectorAll(
      'input[name="season"]:checked'
    )
  ].map(input => input.value);

  jobState.seasonSource = "manual";
}

function syncSeasonInputs_() {
  const selected = new Set(jobState.seasons);

  document.querySelectorAll(
    'input[name="season"]'
  ).forEach(input => {
    input.checked = selected.has(input.value);
  });
}

function syncJobGoalState() {
  jobState.jobGoal = clean_(fields.jobGoal.value);
  jobState.additionalInfo = clean_(fields.additionalInfo.value);
}

function buildDutyQueue() {
  const queue = [
    jobState.primaryCategory,
    ...jobState.secondaryCategories
  ];

  if (
    jobState.primaryCategory !== "maintenance" &&
    !jobState.secondaryCategories.includes("maintenance") &&
    jobState.maintenanceLevel &&
    jobState.maintenanceLevel !== "none"
  ) {
    queue.push("maintenance");
  }

  if (
    jobState.primaryCategory !== "supervision" &&
    !jobState.secondaryCategories.includes("supervision") &&
    jobState.supervisionLevel &&
    jobState.supervisionLevel !== "none"
  ) {
    queue.push("supervision");
  }

  dutyQueue = [...new Set(queue)].filter(Boolean);
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
  fields.primaryTypeError.textContent = "";
  fields.secondaryTypesError.textContent = "";
  fields.workContextError.textContent = "";
  fields.seasonError.textContent = "";
  fields.jobDetailsError.textContent = "";
  fields.jobGoalError.textContent = "";
  fields.dutiesError.textContent = "";
  fields.globalError.textContent = "";

  // STEP 1: Primary Type
  if (currentStep === 1) {
    if (!jobState.primaryCategory) {
      fields.primaryTypeError.textContent =
        "Please select the worker's primary type of work.";

      return false;
    }
  }

  // STEP 2: Secondary Types
  // Zero selections is valid.
  if (currentStep === 2) {
    return true;
  }

  // STEP 3: Maintenance / Supervision
  if (currentStep === 3) {
    syncWorkContextState();

    if (
      jobState.primaryCategory !== "maintenance" &&
      !jobState.maintenanceLevel
    ) {
      fields.workContextError.textContent =
        "Please indicate how much maintenance or repair work will be performed.";

      return false;
    }

    if (
      jobState.primaryCategory !== "supervision" &&
      !jobState.supervisionLevel
    ) {
      fields.workContextError.textContent =
        "Please indicate how much supervision will be performed.";

      return false;
    }
  }

  // STEP 4: Seasons
  if (currentStep === 4) {
    syncSeasonState();

    if (!jobState.seasons.length) {
      fields.seasonError.textContent =
        "Please select at least one season.";

      return false;
    }
  }

  // STEP 5: Outputs / Equipment
  if (currentStep === 5) {
    syncJobDetailsState();

    if (!jobState.outputs && !jobState.outputsNone) {
      fields.jobDetailsError.textContent =
        "Please describe the agricultural products involved or select None / Not applicable.";

      return false;
    }

    if (!jobState.equipment && !jobState.equipmentNone) {
      fields.jobDetailsError.textContent =
        "Please describe the major equipment used or select None / Not applicable.";

      return false;
    }
  }

  // STEP 6: Job Goal
  if (currentStep === 6) {
    syncJobGoalState();

    if (!jobState.jobGoal) {
      fields.jobGoalError.textContent =
        "Please briefly describe the main goal of the job.";

      return false;
    }
  }

  // STEP 7: Duties
  if (currentStep === 7) {
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

  if (currentStep === 6) {
    buildDutyQueue();
  }

  if (currentStep === 7) {
    saveCurrentDutyNotes();

    if (dutyQueueIndex < dutyQueue.length - 1) {
      dutyQueueIndex++;
      renderCurrentDutyCategory();
      updateProgress();
      updateWidgetHeight();
      return;
    }
  }

  if (currentStep < STEP_COUNT) {
    currentStep++;
  }

  if (currentStep === 3) {
    configureWorkContextStep();
  }

  if (currentStep === 4) {
    syncSeasonInputs_();
  }

  if (currentStep === 7) {
    renderCurrentDutyCategory();
  }

  if (currentStep === 8) {
    syncJobGoalState();
    renderReview();
  }

  renderStep();
}

function goBack() {
  if (currentStep === 7 && dutyQueueIndex > 0) {
    saveCurrentDutyNotes();
    dutyQueueIndex--;
    renderCurrentDutyCategory();
    updateProgress();
    updateWidgetHeight();
    return;
  }

  if (currentStep > 1) {
    currentStep--;
  }

  if (currentStep === 2) {
    renderSecondaryTypes();
  }

  if (currentStep === 3) {
    configureWorkContextStep();
  }

  if (currentStep === 4) {
    syncSeasonInputs_();
  }

  if (currentStep === 7) {
    dutyQueueIndex = Math.max(
      0,
      dutyQueue.length - 1
    );

    renderCurrentDutyCategory();
  }

  renderStep();
}

function renderReview() {
  const primary = getCategory(jobState.primaryCategory);

  const secondaryLabels = jobState.secondaryCategories
    .map(id => getCategory(id)?.label || id)
    .filter(Boolean);

  const seasonLabels = {
    spring: "Spring",
    summer: "Summer",
    fall: "Fall",
    winter: "Winter"
  };

  const dutySections = dutyQueue.map(categoryId => {
    const categoryConfig = getCategory(categoryId);
    const selectedIds = jobState.duties[categoryId] || [];

    const labels = selectedIds
      .map(id =>
        categoryConfig?.duties.find(duty => duty.id === id)?.label
      )
      .filter(Boolean);

    const other = clean_(jobState.otherDuties[categoryId]);

    return {
      label: categoryConfig?.label || categoryId,
      values: [
        ...labels,
        ...(other ? [`Other: ${other}`] : [])
      ]
    };
  });

  fields.reviewContent.innerHTML = `
    ${reviewSection("Primary Type", primary?.label || "")}
    ${reviewSection("Secondary Types", secondaryLabels.length ? secondaryLabels.join("; ") : "None")}
    ${reviewSection("Maintenance", formatLevel(jobState.maintenanceLevel))}
    ${reviewSection("Supervision", formatLevel(jobState.supervisionLevel))}
    ${reviewSection("Period / Seasons", jobState.seasons.map(season => seasonLabels[season] || season).join("; "))}
    ${reviewSection("Agricultural Products", jobState.outputsNone ? "None / Not applicable" : jobState.outputs)}
    ${reviewSection("Major Equipment", jobState.equipmentNone ? "None / Not applicable" : jobState.equipment)}
    ${reviewSection("Job Goal", jobState.jobGoal)}
    ${dutySections
      .map(section =>
        reviewSection(`${section.label} Duties`, section.values.join("; "))
      )
      .join("")}
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
  fields.primaryTypeStep.hidden = currentStep !== 1;
  fields.secondaryTypesStep.hidden = currentStep !== 2;
  fields.workContextStep.hidden = currentStep !== 3;
  fields.seasonStep.hidden = currentStep !== 4;
  fields.jobDetailsStep.hidden = currentStep !== 5;
  fields.jobGoalStep.hidden = currentStep !== 6;
  fields.dutiesStep.hidden = currentStep !== 7;
  fields.reviewStep.hidden = currentStep !== 8;

  fields.loadingStep.hidden = true;
  fields.resultStep.hidden = true;

  const isPrimary = currentStep === 1;
  const isReview = currentStep === 8;

  fields.backBtn.hidden = isPrimary || isReview;

  // Step 1 advances immediately on card selection.
  fields.nextBtn.hidden = isPrimary || isReview;

  fields.nextBtn.textContent =
    currentStep === 7
      ? "Review"
      : "Continue";

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

function hideAllBuilderSteps_() {
  fields.primaryTypeStep.hidden = true;
  fields.secondaryTypesStep.hidden = true;
  fields.workContextStep.hidden = true;
  fields.seasonStep.hidden = true;
  fields.jobDetailsStep.hidden = true;
  fields.jobGoalStep.hidden = true;
  fields.dutiesStep.hidden = true;
  fields.reviewStep.hidden = true;
}

function showLoadingScreen() {
  hideAllBuilderSteps_();

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
  generatedDescription = "";
  acceptedDescription = "";
  descriptionAccepted = false;

  fields.finalDescription.hidden = true;
  fields.finalDescription.textContent = "";

  fields.generatedDescription.hidden = false;
  fields.generatedDescription.readOnly = false;

  fields.regenerateBtn.hidden = false;
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

  syncJobGoalState();
  resetAcceptedDescription();
  showLoadingScreen();

  try {
    const endpoint =
      getSetting_("generationEndpoint");

    const token =
      getSetting_("generationToken");

    if (!endpoint) {
      throw new Error(
        "The generation endpoint is not configured."
      );
    }

    if (!token) {
      throw new Error(
        "The generation token is not configured."
      );
    }

    const payload = {
      action: "generateJobDescription",
      token,
      job: buildGenerationPayload()
    };

    const response = await fetch(endpoint, {
      method: "POST",

      // Deliberately use text/plain so the browser can send
      // a simple cross-origin POST without a JSON preflight.
      headers: {
        "Content-Type": "text/plain;charset=UTF-8"
      },

      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(
        `Generation server returned HTTP ${response.status}.`
      );
    }

    const data = await response.json();

    if (!data?.ok) {
      throw new Error(
        data?.error ||
        "The job description could not be generated."
      );
    }

    showResultScreen(
      data.description,
      Array.isArray(data.warnings)
        ? data.warnings
        : []
    );

  } catch (err) {
    console.error(
      "Job description generation failed:",
      err
    );

    showGenerationError(
      err?.message ||
      "The job description could not be generated."
    );
  }
}

function buildGenerationPayload() {
  const primaryCategory = getCategory(jobState.primaryCategory);

  const duties = {};

  Object.entries(jobState.duties).forEach(
    ([categoryId, dutyIds]) => {
      const category = getCategory(categoryId);

      duties[categoryId] = {
        categoryLabel: category?.label || categoryId,

        duties: dutyIds.map(id => {
          const duty = category?.duties.find(item => item.id === id);

          return {
            id,
            label: duty?.label || id,
            riskTags: duty?.riskTags || []
          };
        })
      };
    }
  );

  return {
    primaryCategory: jobState.primaryCategory,
    primaryCategoryLabel: primaryCategory?.label || jobState.primaryCategory,
    secondaryCategories: structuredClone(jobState.secondaryCategories),
    outputs: jobState.outputs,
    outputsNone: jobState.outputsNone,
    outputTypes: structuredClone(jobState.outputTypes),
    equipment: jobState.equipment,
    equipmentNone: jobState.equipmentNone,
    equipmentTypes: structuredClone(jobState.equipmentTypes),
    maintenanceLevel: jobState.maintenanceLevel,
    supervisionLevel: jobState.supervisionLevel,
    seasons: structuredClone(jobState.seasons),
    seasonSource: jobState.seasonSource,
    jobGoal: jobState.jobGoal,
    duties,
    otherDuties: structuredClone(jobState.otherDuties),
    additionalInfo: jobState.additionalInfo
  };
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

function invalidateGeneratedDescription() {
  generatedDescription = "";
  acceptedDescription = "";
  descriptionAccepted = false;
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

  fields.reviewBackBtn.addEventListener("click", () => {
    currentStep = 7;
    dutyQueueIndex = Math.max(0, dutyQueue.length - 1);
    renderCurrentDutyCategory();
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

  renderPrimaryTypes();
  renderSecondaryTypes();
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
}
