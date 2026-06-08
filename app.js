const API_BASE = window.location.origin;

const questionBank = [
  { type: 'choice', question: 'Pe ce principiu se bazează toate evaluările și consilierile psihologice?', options: ['Respectarea confidențialității și a respectului reciproc', 'Respectarea ordinelor superiorilor indiferent de situație', 'Protejarea intereselor departamentului înaintea pacientului', 'Păstrarea informațiilor doar în cadrul conducerii'], correct: 0 },
  { type: 'choice', question: 'Ce trebuie să facă un membru al departamentului dacă are un conflict intern?', options: ['Să se adreseze unui Director Adjunct SMURD', 'Să urmeze scara ierarhică a Departamentului de Psihologie', 'Să contacteze un Supervizor din HR', 'Să raporteze direct situația unui Director General'], correct: 1 },
  { type: 'choice', question: 'Cine are responsabilitatea de a analiza problemele comportamentale ale colegilor sancționați?', options: ['Secretarii departamentului', 'Managerii SMURD', 'Supervizorii Psihologie', 'Directorii afacerilor partenere'], correct: 2 },
  { type: 'choice', question: 'Care este suma maximă care poate fi solicitată pentru o ședință de terapie sau evaluare psihologică?', options: ['15.000$', '25.000$', '50.000$', '75.000$'], correct: 2 },
  { type: 'choice', question: 'Ce sancțiune se aplică în mod normal pentru neîndeplinirea raportului săptămânal?', options: ['Suspendare temporară', 'Avertisment Verbal (AV)', 'Faction Warning (FW)', 'Retrogradare'], correct: 1 },
  { type: 'choice', question: 'Cât timp trebuie păstrate înregistrările ședințelor psihologice?', options: ['24 de ore', '48 de ore', '72 de ore', '7 zile'], correct: 2 },
  { type: 'choice', question: 'În cât timp trebuie prezentate dovezile solicitate de un superior?', options: ['12 ore', '24 ore', '48 ore', 'Până la sfârșitul săptămânii'], correct: 1 },
  { type: 'choice', question: 'Ce se poate întâmpla dacă un psiholog nu poate prezenta dovezile unei ședințe atunci când acestea sunt solicitate?', options: ['Primește o atenționare verbală informală', 'Este sancționat cu AV', 'Pierde automat licența', 'Este obligat să refacă ședința'], correct: 1 },
  { type: 'choice', question: 'Care este termenul de valabilitate al unei adeverințe psihologice?', options: ['7 zile', '10 zile', '14 zile (2 săptămâni)', '30 zile'], correct: 2 },
  { type: 'choice', question: 'După cât timp poate fi reluată o ședință cu statusul „Picat”?', options: ['12 ore', '24 ore', '48 ore', '72 ore'], correct: 1 },
  { type: 'choice', question: 'Ce condiție trebuie îndeplinită pentru ca un psiholog să poată susține o ședință psihologică?', options: ['Să fie minim gradul de Supervizor', 'Să dețină o licență activă', 'Să aibă minimum 3 rapoarte efectuate', 'Să fie aprobat de conducerea SMURD'], correct: 1 },
  { type: 'choice', question: 'Ce sancțiune se aplică pentru utilizarea licenței unui alt psiholog?', options: ['AV', 'FW', 'Suspendare pe perioadă determinată', 'Demitere din departament'], correct: 3 },
  { type: 'choice', question: 'În cazul unei intervenții pentru tentativă de suicid, pe ce frecvență trebuie mutată echipa medicală?', options: ['Frecvența 10', 'Frecvența 11', 'Frecvența 12', 'Frecvența 15'], correct: 2 },
  { type: 'choice', question: 'Care este prima etapă a protocolului de intervenție psihologică în caz de tentativă de suicid?', options: ['Transportarea pacientului la spital', 'Evaluarea rapidă a situației', 'Completarea documentelor necesare', 'Solicitarea unei echipe de negociatori'], correct: 1 },
  { type: 'choice', question: 'Care dintre următoarele comportamente este interzis în timpul unei intervenții suicidare?', options: ['Folosirea unui ton calm și empatic', 'Adresarea pacientului pe nume', 'Ridicarea vocii și folosirea unui ton autoritar', 'Încurajarea pacientului să vorbească despre situație'], correct: 2 }
];

const TOTAL_STEPS = 15;
let questions = [];
let currentQuestionIndex = 0;
let selectedAnswerIndex = null;
let score = 0;
let timerValue = 45;
let timerInterval = null;
let securityLock = false;
let testFailed = false;
let resultSent = false;
let testUserName = '';
let testUserCNP = '';

const pageHome = document.getElementById('pageHome');
const pageRules = document.getElementById('pageRules');
const pagePreTest = document.getElementById('pagePreTest');
const pageTest = document.getElementById('pageTest');
const pageResult = document.getElementById('pageResult');
const startTestBtn = document.getElementById('startTestBtn');
const confirmStartBtn = document.getElementById('confirmStartBtn');
const cancelTestBtn = document.getElementById('cancelTestBtn');
const preTestNextBtn = document.getElementById('preTestNextBtn');
const preTestCancelBtn = document.getElementById('preTestCancelBtn');
const preTestName = document.getElementById('preTestName');
const preTestCNP = document.getElementById('preTestCNP');
const nextBtn = document.getElementById('nextBtn');
const retryBtn = document.getElementById('retryBtn');
const questionTitle = document.getElementById('questionTitle');
const answersContainer = document.getElementById('answers');
const questionCounter = document.getElementById('questionCounter');
const timerDisplay = document.getElementById('timer');
const progressFill = document.getElementById('progressFill');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
const resultScore = document.getElementById('resultScore');
const resultImage = document.getElementById('resultImage');
const alertOverlay = document.getElementById('alertOverlay');
const alertText = document.getElementById('alertText');
const closeAlertBtn = document.getElementById('closeAlertBtn');

function exitFullscreenMode() {
  if (document.fullscreenElement) {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

function switchPage(activePage) {
  const leavingTest = !activePage.classList.contains('page-test');
  if (leavingTest) {
    exitFullscreenMode();
  }

  [pageHome, pageRules, pagePreTest, pageTest, pageResult].forEach(page => page.classList.remove('active'));
  activePage.classList.add('active');
}

function shuffle(array) {
  return array.slice().sort(() => Math.random() - 0.5);
}

function buildQuestionSet() {
  return shuffle(questionBank).slice(0, 15);
}

function updateTimerBar() {
  const progress = Math.max((timerValue / 45) * 100, 0);
  progressFill.style.width = `${progress}%`;
}

function updateQuestion() {
  const current = questions[currentQuestionIndex];
  const label = current.type === 'input' ? 'Pas' : 'Intrebare';
  questionTitle.textContent = current.question;
  questionCounter.textContent = `${label} ${currentQuestionIndex + 1} / ${TOTAL_STEPS}`;
  timerValue = 45;
  updateTimerBar();

  answersContainer.innerHTML = '';
  nextBtn.disabled = true;

  if (current.type === 'input') {
    const input = document.createElement('input');
    input.className = 'answer-input';
    input.placeholder = current.placeholder || '';
    input.type = current.inputType || 'text';
    input.autocomplete = 'off';
    input.addEventListener('input', () => {
      nextBtn.disabled = !input.value.trim();
    });
    answersContainer.appendChild(input);
    input.focus();
    selectedAnswerIndex = null;
    return;
  }

  current.options.forEach((option, index) => {
    const answerButton = document.createElement('button');
    answerButton.className = 'answer-option';
    answerButton.textContent = option;
    answerButton.addEventListener('click', () => selectAnswer(index, answerButton));
    answersContainer.appendChild(answerButton);
  });

  selectedAnswerIndex = null;
}

function selectAnswer(index, button) {
  if (securityLock) return;

  selectedAnswerIndex = index;
  answersContainer.querySelectorAll('.answer-option').forEach((btn, idx) => {
    btn.classList.toggle('selected', idx === index);
  });
  nextBtn.disabled = false;
}

function getCurrentInputValue() {
  const input = answersContainer.querySelector('input');
  return input ? input.value.trim() : '';
}

function resetTimer() {
  clearInterval(timerInterval);
  timerValue = 45;
  timerDisplay.textContent = `${timerValue}s`;
  updateTimerBar();
  timerInterval = setInterval(() => {
    timerValue -= 1;
    timerDisplay.textContent = `${timerValue}s`;
    updateTimerBar();
    if (timerValue <= 0) {
      clearInterval(timerInterval);
      proceedAfterTimeout();
    }
  }, 1000);
}

function proceedAfterTimeout() {
  if (questions[currentQuestionIndex].type !== 'input' && selectedAnswerIndex === null) {
    failTest('Timp expirat. Examen picat.');
    return;
  }
  goToNextQuestion();
}

function goToNextQuestion() {
  if (!questions.length || securityLock) return;

  const current = questions[currentQuestionIndex];
  if (current.type === 'choice' && selectedAnswerIndex === current.correct) {
    score += 1;
  }

  if (current.type === 'input') {
    const value = getCurrentInputValue();
    if (!value) {
      showAlert('Completeaza campurile inainte de a continua.');
      return;
    }
  }

  currentQuestionIndex += 1;
  if (currentQuestionIndex >= questions.length) {
    endTest(!testFailed);
  } else {
    updateQuestion();
    resetTimer();
  }
}

async function postTestResultToDiscord(passed, percentage) {
  try {
    const response = await fetch(`${API_BASE}/api/test-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 0,
        user_name: testUserName,
        user_cnp: testUserCNP,
        percentage: percentage,
        passed: passed
      })
    });
    if (response.ok) {
      console.log('Rezultat test postat pe Discord');
    } else {
      const text = await response.text();
      console.error('Eroare la postarea rezultatului:', response.status, text);
    }
  } catch (e) {
    console.error('Eroare la trimiterea rezultatului:', e);
  }
}

function endTest(passed) {
  if (resultSent) return;
  resultSent = true;
  clearInterval(timerInterval);
  const percentage = Math.round((score / 15) * 100);
  const success = passed && percentage >= 70;

  if (success) {
    resultTitle.textContent = 'Felicitari!';
    resultMessage.textContent = `Ai trecut testul cu punctajul ${percentage}%. Poti continua procesul tau de integrare in departament.`;
  } else {
    resultTitle.textContent = 'Din pacate...';
    resultMessage.textContent = `Ai picat testul cu punctajul ${percentage}%. Poti sustine iarasi testul peste 24 ore.`;
  }

  resultImage.innerHTML = '';
  resultImage.style.display = 'none';
  resultScore.textContent = `${percentage}%`;
  postTestResultToDiscord(success, percentage);
  switchPage(pageResult);
}

function showAlert(message) {
  alertText.textContent = message;
  alertOverlay.classList.remove('hidden');
}

function hideAlert() {
  alertOverlay.classList.add('hidden');
}

function requestFullscreenMode() {
  const docEl = document.documentElement;
  if (docEl.requestFullscreen) {
    return docEl.requestFullscreen();
  }
  if (docEl.webkitRequestFullscreen) {
    return docEl.webkitRequestFullscreen();
  }
  return Promise.resolve();
}

function failTest(reason) {
  if (securityLock) return;
  securityLock = true;
  testFailed = true;
  clearInterval(timerInterval);
  endTest(false);
}

function checkForFraud() {
  if (document.hidden) {
    failTest('Schimbarea tab-ului detectata. Examen picat.');
    return;
  }

  if (!document.fullscreenElement) {
    failTest('Full screen pierdut. Examen picat.');
    return;
  }

  const devToolsOpen = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160;
  if (devToolsOpen) {
    failTest('DevTools detectat. Examen picat.');
  }
}

function protectNavigation() {
  history.pushState(null, '', location.href);
  window.addEventListener('popstate', () => {
    history.pushState(null, '', location.href);
    failTest('Navigare detectata. Examen picat.');
  });
}

function startTest() {
  questions = buildQuestionSet();
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswerIndex = null;
  securityLock = false;
  testFailed = false;
  resultSent = false;

  requestFullscreenMode().catch(() => {
    failTest('Full screen obligatoriu. Examen picat.');
  });

  switchPage(pageTest);
  updateQuestion();
  resetTimer();
  protectNavigation();
  setInterval(checkForFraud, 1200);
}

startTestBtn.addEventListener('click', () => {
  switchPage(pageRules);
});

confirmStartBtn.addEventListener('click', () => {
  switchPage(pagePreTest);
  preTestName.focus();
});

cancelTestBtn.addEventListener('click', () => switchPage(pageHome));

preTestNextBtn.addEventListener('click', () => {
  const name = preTestName.value.trim();
  const cnp = preTestCNP.value.trim();
  if (!name || !cnp) {
    showAlert('Completeaza toate campurile inainte de a continua.');
    return;
  }
  testUserName = name;
  testUserCNP = cnp;
  startTest();
});

preTestCancelBtn.addEventListener('click', () => {
  switchPage(pageHome);
  preTestName.value = '';
  preTestCNP.value = '';
});

nextBtn.addEventListener('click', () => goToNextQuestion());

retryBtn.addEventListener('click', () => {
  switchPage(pageHome);
  preTestName.value = '';
  preTestCNP.value = '';
});

closeAlertBtn.addEventListener('click', () => {
  hideAlert();
});

document.addEventListener('keydown', (event) => {
  if (['F12', 'I', 'J', 'U'].includes(event.key.toUpperCase()) && (event.ctrlKey || event.metaKey || event.shiftKey)) {
    event.preventDefault();
    failTest('DevTools forbiden. Examen picat.');
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && pageTest.classList.contains('active')) {
    failTest('Tab-change detectat. Examen picat.');
  }
});

window.addEventListener('beforeunload', (event) => {
  if (pageTest.classList.contains('active')) {
    event.preventDefault();
    event.returnValue = '';
  }
});
