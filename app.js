const categories = {
  catholic: {
    label: "Roman Catholic",
    color: "#4e9567",
    short: "Catholic"
  },
  anglican: {
    label: "Anglican",
    color: "#d98679",
    short: "Anglican"
  },
  calvinist: {
    label: "Calvinist",
    color: "#b94c8b",
    short: "Calvinist"
  },
  lutheran: {
    label: "Lutheran",
    color: "#e6a323",
    short: "Lutheran"
  }
};

const regions = [
  {
    id: "scotland",
    name: "Scotland",
    category: "calvinist",
    x: 35.2,
    y: 20.2,
    note: "The map shows Scotland as predominantly Calvinist by 1560, following the Scottish Reformation."
  },
  {
    id: "ireland",
    name: "Ireland",
    category: "catholic",
    x: 25.7,
    y: 27.1,
    note: "Ireland remained predominantly Roman Catholic on the map."
  },
  {
    id: "england",
    name: "England",
    category: "anglican",
    x: 34.1,
    y: 35.9,
    note: "England is the map's principal Anglican region after the English Reformation."
  },
  {
    id: "france",
    name: "France",
    category: "catholic",
    x: 35.2,
    y: 57.9,
    note: "France remained predominantly Roman Catholic, although the hatching marks Calvinist minorities known as Huguenots."
  },
  {
    id: "portugal",
    name: "Portugal",
    category: "catholic",
    x: 7.3,
    y: 69.6,
    note: "Portugal is shown as a predominantly Roman Catholic kingdom."
  },
  {
    id: "spain",
    name: "Spain",
    category: "catholic",
    x: 14.1,
    y: 78.1,
    note: "Spain is shown as a predominantly Roman Catholic kingdom."
  },
  {
    id: "sweden",
    name: "Sweden",
    category: "lutheran",
    x: 70.3,
    y: 18.8,
    note: "Sweden adopted Lutheran reforms and is shown as predominantly Lutheran."
  },
  {
    id: "denmark-norway",
    name: "Denmark–Norway",
    category: "lutheran",
    x: 61.8,
    y: 27.9,
    note: "The Scandinavian kingdom of Denmark–Norway is shown as predominantly Lutheran."
  },
  {
    id: "wittenberg",
    name: "Northern German States",
    category: "lutheran",
    x: 63.3,
    y: 47.8,
    note: "Many northern German states followed Lutheranism; Wittenberg was closely associated with Martin Luther."
  },
  {
    id: "swiss",
    name: "Geneva & the Swiss Confederation",
    category: "calvinist",
    x: 49.4,
    y: 63.5,
    note: "Geneva became a major Calvinist center. The wider Swiss Confederation also contained Catholic and minority areas."
  },
  {
    id: "italian-states",
    name: "Italian States",
    category: "catholic",
    x: 52.2,
    y: 71.2,
    note: "The Italian states are shown as predominantly Roman Catholic."
  },
  {
    id: "papal-states",
    name: "Papal States",
    category: "catholic",
    x: 57.7,
    y: 80.2,
    note: "The Papal States were governed by the pope and were Roman Catholic."
  },
  {
    id: "naples",
    name: "Naples",
    category: "catholic",
    x: 61.6,
    y: 87.8,
    note: "The Kingdom of Naples is shown as predominantly Roman Catholic."
  }
];

const elements = {
  learnMode: document.querySelector("#learnMode"),
  challengeMode: document.querySelector("#challengeMode"),
  explorePanel: document.querySelector("#explorePanel"),
  challengePanel: document.querySelector("#challengePanel"),
  progressWrap: document.querySelector("#progressWrap"),
  progressText: document.querySelector("#progressText"),
  progressBar: document.querySelector("#progressBar"),
  mapFrame: document.querySelector("#mapFrame"),
  hotspotLayer: document.querySelector("#hotspotLayer"),
  mapInstruction: document.querySelector("#mapInstruction"),
  resetButton: document.querySelector("#resetButton"),
  regionReveal: document.querySelector("#regionReveal"),
  revealNumber: document.querySelector("#revealNumber"),
  revealLabel: document.querySelector("#revealLabel"),
  revealTradition: document.querySelector("#revealTradition"),
  revealNote: document.querySelector("#revealNote"),
  legendList: document.querySelector("#legendList"),
  questionCount: document.querySelector("#questionCount"),
  questionRegion: document.querySelector("#questionRegion"),
  answerGrid: document.querySelector("#answerGrid"),
  feedback: document.querySelector("#feedback"),
  scoreText: document.querySelector("#scoreText"),
  completionDialog: document.querySelector("#completionDialog"),
  completionTitle: document.querySelector("#completionTitle"),
  completionSummary: document.querySelector("#completionSummary"),
  finalScore: document.querySelector("#finalScore"),
  retryButton: document.querySelector("#retryButton"),
  returnExploreButton: document.querySelector("#returnExploreButton")
};

let mode = "learn";
let questionOrder = [];
let questionIndex = 0;
let firstTryCorrect = 0;
let attemptsOnQuestion = 0;
let answerLocked = false;

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildLegend() {
  elements.legendList.innerHTML = Object.values(categories).map(category => `
    <div class="legend-item">
      <span class="legend-swatch" style="--swatch:${category.color}" aria-hidden="true"></span>
      <span>${category.label}</span>
    </div>
  `).join("");
}

function buildAnswers() {
  elements.answerGrid.innerHTML = Object.entries(categories).map(([key, category]) => `
    <button class="answer-button" type="button" data-answer="${key}" style="--answer-color:${category.color}">
      ${category.label}
    </button>
  `).join("");

  elements.answerGrid.querySelectorAll(".answer-button").forEach(button => {
    button.addEventListener("click", () => checkAnswer(button.dataset.answer, button));
  });
}

function buildHotspots() {
  elements.hotspotLayer.innerHTML = regions.map((region, index) => `
    <button
      class="hotspot"
      type="button"
      data-region="${region.id}"
      style="--x:${region.x}%; --y:${region.y}%; --category-color:${categories[region.category].color}"
      aria-label="Marker ${index + 1}: ${region.name}"
      title="${region.name}"
    >${index + 1}</button>
  `).join("");

  elements.hotspotLayer.querySelectorAll(".hotspot").forEach(button => {
    button.addEventListener("click", () => {
      const region = regions.find(item => item.id === button.dataset.region);
      if (mode === "learn") showRegion(region);
    });
  });
}

function setMode(nextMode) {
  mode = nextMode;
  const learning = mode === "learn";
  elements.learnMode.classList.toggle("is-active", learning);
  elements.challengeMode.classList.toggle("is-active", !learning);
  elements.learnMode.setAttribute("aria-pressed", String(learning));
  elements.challengeMode.setAttribute("aria-pressed", String(!learning));
  elements.explorePanel.hidden = !learning;
  elements.challengePanel.hidden = learning;
  elements.progressWrap.hidden = learning;
  elements.mapFrame.classList.toggle("is-challenge", !learning);
  elements.mapInstruction.textContent = learning
    ? "Select a numbered marker to investigate a region."
    : "Find the glowing marker, then classify its region.";

  if (learning) {
    resetHotspots();
  } else {
    startChallenge();
  }
}

function resetHotspots() {
  document.querySelectorAll(".hotspot").forEach(button => {
    button.classList.remove("is-selected", "is-muted", "is-current", "is-complete");
    button.disabled = false;
  });
}

function showRegion(region) {
  const index = regions.findIndex(item => item.id === region.id);
  const category = categories[region.category];
  document.querySelectorAll(".hotspot").forEach(button => {
    button.classList.toggle("is-selected", button.dataset.region === region.id);
  });
  elements.regionReveal.classList.remove("is-empty");
  elements.regionReveal.style.background = `linear-gradient(135deg, #173b4f 25%, ${category.color})`;
  elements.revealNumber.textContent = index + 1;
  elements.revealLabel.textContent = region.name;
  elements.revealTradition.textContent = category.label;
  elements.revealNote.textContent = region.note;
}

function startChallenge() {
  questionOrder = shuffle(regions);
  questionIndex = 0;
  firstTryCorrect = 0;
  attemptsOnQuestion = 0;
  answerLocked = false;
  resetHotspots();
  showQuestion();
}

function showQuestion() {
  const region = questionOrder[questionIndex];
  attemptsOnQuestion = 0;
  answerLocked = false;

  elements.questionCount.textContent = `Question ${questionIndex + 1} of ${regions.length}`;
  elements.questionRegion.textContent = region.name;
  elements.scoreText.textContent = `${firstTryCorrect} correct`;
  elements.feedback.className = "feedback";
  elements.feedback.innerHTML = '<span class="feedback-icon" aria-hidden="true">•</span><p>Choose an answer to continue.</p>';

  elements.answerGrid.querySelectorAll(".answer-button").forEach(button => {
    button.disabled = false;
    button.classList.remove("is-wrong", "is-correct");
  });

  document.querySelectorAll(".hotspot").forEach(button => {
    const completedIds = questionOrder.slice(0, questionIndex).map(item => item.id);
    button.classList.toggle("is-current", button.dataset.region === region.id);
    button.classList.toggle("is-complete", completedIds.includes(button.dataset.region));
    button.classList.toggle("is-muted", button.dataset.region !== region.id && !completedIds.includes(button.dataset.region));
    button.disabled = true;
  });

  const completed = questionIndex;
  elements.progressText.textContent = `${completed} / ${regions.length}`;
  elements.progressBar.style.width = `${(completed / regions.length) * 100}%`;
}

function checkAnswer(answer, button) {
  if (answerLocked) return;
  const region = questionOrder[questionIndex];
  const correct = answer === region.category;
  attemptsOnQuestion += 1;

  if (!correct) {
    button.disabled = true;
    button.classList.add("is-wrong");
    const hint = attemptsOnQuestion >= 2
      ? ` Hint: look for the color family associated with ${categories[region.category].short} areas in Explore mode.`
      : " Look again at the region’s place in Reformation Europe.";
    elements.feedback.className = "feedback is-wrong";
    elements.feedback.innerHTML = `<span class="feedback-icon" aria-hidden="true">×</span><p><strong>Not quite.</strong>${hint}</p>`;
    return;
  }

  answerLocked = true;
  if (attemptsOnQuestion === 1) firstTryCorrect += 1;
  button.classList.add("is-correct");
  elements.answerGrid.querySelectorAll(".answer-button").forEach(answerButton => {
    answerButton.disabled = true;
  });
  elements.scoreText.textContent = `${firstTryCorrect} correct`;
  elements.feedback.className = "feedback is-correct";
  elements.feedback.innerHTML = `<span class="feedback-icon" aria-hidden="true">✓</span><p><strong>Correct — ${categories[region.category].label}.</strong> ${region.note}</p>`;

  window.setTimeout(() => {
    questionIndex += 1;
    if (questionIndex >= regions.length) {
      finishChallenge();
    } else {
      showQuestion();
    }
  }, 1350);
}

function finishChallenge() {
  const percent = Math.round((firstTryCorrect / regions.length) * 100);
  elements.progressText.textContent = `${regions.length} / ${regions.length}`;
  elements.progressBar.style.width = "100%";
  elements.finalScore.textContent = `${firstTryCorrect}/${regions.length}`;
  elements.completionTitle.textContent = percent >= 85
    ? "Excellent map reading!"
    : percent >= 65
      ? "Strong work — keep mapping!"
      : "Good first expedition!";
  elements.completionSummary.textContent = `You classified all ${regions.length} regions and earned ${percent}% on the first try.`;
  elements.completionDialog.showModal();
}

function resetExplore() {
  resetHotspots();
  elements.regionReveal.classList.add("is-empty");
  elements.regionReveal.style.background = "";
  elements.revealNumber.textContent = "?";
  elements.revealLabel.textContent = "No region selected";
  elements.revealTradition.textContent = "Start with any marker";
  elements.revealNote.textContent = "Use the numbered points on the map to explore Europe.";
}

elements.learnMode.addEventListener("click", () => setMode("learn"));
elements.challengeMode.addEventListener("click", () => setMode("challenge"));
elements.resetButton.addEventListener("click", () => mode === "learn" ? resetExplore() : startChallenge());
elements.retryButton.addEventListener("click", () => {
  elements.completionDialog.close();
  startChallenge();
});
elements.returnExploreButton.addEventListener("click", () => {
  elements.completionDialog.close();
  setMode("learn");
});

buildLegend();
buildAnswers();
buildHotspots();
resetExplore();
