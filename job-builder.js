const JOB_CONFIG = window.JOB_CONFIG;

if (!JOB_CONFIG || !JOB_CONFIG.categories) {
  console.error("JOB_CONFIG did not load correctly.");
}

const jobState = {
  primaryCategory: null,

  outputs: "",
  outputsNone: false,

  equipment: "",
  equipmentNone: false,

  maintenanceLevel: null,
  supervisionLevel: null,

  duties: {},
  otherDuties: {},

  additionalInfo: ""
};

const STEP_COUNT = 5;

let currentStep = 1;

let dutyQueue = [];
let dutyQueueIndex = 0;

const fields = {
  widgetRoot: document.getElementById("widgetRoot"),

  progressText: document.getElementById("progressText"),
  progressFill: document.getElementById("progressFill"),

  categoryStep: document.getElementById("categoryStep"),
  contextStep: document.getElementById("contextStep"),
  dutiesStep: document.getElementById("dutiesStep"),
  notesStep: document.getElementById("notesStep"),
  reviewStep: document.getElementById("reviewStep"),

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
    button.textContent = category.label;

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

function syncContextState() {
  jobState.outputs = clean_(fields.outputs.value);
  jobState.outputsNone = fields.outputsNone.checked;

  jobState.equipment = clean_(fields.equipment.value);
  jobState.equipmentNone = fields.equipmentNone.checked;

  jobState.maintenanceLevel =
    document.querySelector('input[name="maintenanceLevel"]:checked')?.value || null;

  jobState.supervisionLevel =
    document.querySelector('input[name="supervisionLevel"]:checked')?.value || null;
}

function configureContextStep() {
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
    syncContextState();

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

  if (currentStep === 2) {
    buildDutyQueue();
  }

  if (currentStep === 3) {
    saveCurrentDutyNotes();

    if (dutyQueueIndex < dutyQueue.length - 1) {
      dutyQueueIndex++;
      renderCurrentDutyCategory();
      updateProgress();
      return;
    }
  }

  if (currentStep < STEP_COUNT) {
    currentStep++;
  }

  if (currentStep === 2) {
    configureContextStep();
  }

  if (currentStep === 3) {
    renderCurrentDutyCategory();
  }

  if (currentStep === 5) {
    syncFinalState();
    renderReview();
  }

  renderStep();
}

function goBack() {
  if (currentStep === 3 && dutyQueueIndex > 0) {
    saveCurrentDutyNotes();
    dutyQueueIndex--;
    renderCurrentDutyCategory();
    updateProgress();
    return;
  }

  if (currentStep > 1) {
    currentStep--;
  }

  if (currentStep === 3) {
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
  fields.contextStep.hidden = currentStep !== 2;
  fields.dutiesStep.hidden = currentStep !== 3;
  fields.notesStep.hidden = currentStep !== 4;
  fields.reviewStep.hidden = currentStep !== 5;

  fields.backBtn.hidden = currentStep === 1;

  fields.nextBtn.hidden = currentStep === 5;
  fields.nextBtn.textContent = currentStep === 4 ? "Review" : "Continue";

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
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        const height =
          fields.widgetRoot.getBoundingClientRect().height;

        const style =
          getComputedStyle(document.body);

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
}

function initializeWidget() {
  renderCategories();
  wireEvents();
  renderStep();
}

JFCustomWidget.subscribe("ready", initializeWidget);
