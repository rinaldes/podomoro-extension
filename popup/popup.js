// Timer state
let timeLeft = 25 * 60; // 25 minutes in seconds
let timerId = null;
let isRunning = false;
let currentMode = 'work'; // 'work', 'shortBreak', or 'longBreak'
let pomodorosCompleted = 0;

// Settings
let settings = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLongBreak: 4
};

// DOM elements
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');
const skipButton = document.getElementById('skip');
const settingsButton = document.getElementById('settingsButton');
const sessionStatus = document.getElementById('sessionStatus');
const sessionCount = document.getElementById('sessionCount');
const autoStartCheckbox = document.getElementById('autoStart');
const buttonRow = document.querySelector('.button-row');

// Initialize state
let state = null;

// Check if timer is in initial state (not started or fully reset)
function isTimerInInitialState(state) {
  if (!state) return false;
  
  const currentDuration = state.currentMode === 'work' 
    ? state.settings.workDuration * 60
    : state.currentMode === 'shortBreak'
      ? state.settings.shortBreak * 60
      : state.settings.longBreak * 60;
      
  return state.timeRemaining === currentDuration;
}

// Update button row class based on visible buttons
function updateButtonRowClass() {
  const visibleButtons = Array.from(buttonRow.children).filter(btn => 
    btn.style.display !== 'none'
  ).length;
  
  buttonRow.classList.remove('two-buttons', 'three-buttons');
  if (visibleButtons === 2) {
    buttonRow.classList.add('two-buttons');
  } else if (visibleButtons === 3) {
    buttonRow.classList.add('three-buttons');
  }
}

// Update display based on state
function updateDisplay(state) {
  if (!state) return;

  // Update timer
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Update buttons visibility and text
  if (state.isRunning) {
    startButton.style.display = 'none';
    pauseButton.style.display = 'block';
    stopButton.style.display = 'block';
    resetButton.style.display = 'none';
  } else {
    startButton.style.display = 'block';
    pauseButton.style.display = 'none';
    stopButton.style.display = 'none';
    resetButton.style.display = isTimerInInitialState(state) ? 'none' : 'block';
    startButton.textContent = isTimerInInitialState(state) ? 'Start' : 'Continue';
  }

  // Update button row layout
  updateButtonRowClass();
  
  // Show skip button only during breaks
  if (state.currentMode !== 'work') {
    skipButton.classList.add('visible');
  } else {
    skipButton.classList.remove('visible');
  }
  
  // Disable settings button when timer is not in initial state
  const timerInitial = isTimerInInitialState(state);
  settingsButton.disabled = !timerInitial;
  settingsButton.title = timerInitial ? 'Settings' : 'Reset timer to access settings';
  if (timerInitial) {
    settingsButton.classList.remove('disabled');
  } else {
    settingsButton.classList.add('disabled');
  }

  // Update status
  sessionStatus.className = 'status-text';
  if (state.currentMode === 'work') {
    sessionStatus.textContent = 'Focus Time';
    sessionStatus.classList.add('focus');
  } else if (state.currentMode === 'shortBreak') {
    sessionStatus.textContent = 'Short Break';
    sessionStatus.classList.add('short-break');
  } else {
    sessionStatus.textContent = 'Long Break';
    sessionStatus.classList.add('long-break');
  }

  // Update session count
  sessionCount.textContent = `Session ${state.currentSession}/${state.settings.sessionsBeforeLongBreak}`;

  // Update auto-start checkbox
  autoStartCheckbox.checked = state.settings.autoStartNextSession;
}

// Load and update initial state
browser.runtime.sendMessage({ type: 'getState' }).then((response) => {
  state = response;
  updateDisplay(state);
});

// Listen for state updates
browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'stateUpdated') {
    state = message.state;
    updateDisplay(state);
  }
});

// Button event listeners
startButton.addEventListener('click', () => {
  browser.runtime.sendMessage({ type: 'startTimer' }).then((response) => {
    state = response;
    updateDisplay(state);
  });
});

pauseButton.addEventListener('click', () => {
  browser.runtime.sendMessage({ type: 'pauseTimer' }).then((response) => {
    state = response;
    updateDisplay(state);
  });
});

stopButton.addEventListener('click', () => {
  browser.runtime.sendMessage({ type: 'resetTimer' }).then((response) => {
    state = response;
    updateDisplay(state);
  });
});

resetButton.addEventListener('click', () => {
  browser.runtime.sendMessage({ type: 'resetTimer' }).then((response) => {
    state = response;
    updateDisplay(state);
  });
});

skipButton.addEventListener('click', () => {
  browser.runtime.sendMessage({ type: 'skipBreak' }).then((response) => {
    state = response;
    updateDisplay(state);
  });
});

settingsButton.addEventListener('click', () => {
  if (isTimerInInitialState(state)) {
    window.location.href = 'settings.html';
  }
});

// Auto-start checkbox listener
autoStartCheckbox.addEventListener('change', () => {
  browser.runtime.sendMessage({
    type: 'setAutoStart',
    enabled: autoStartCheckbox.checked
  }).then((response) => {
    state = response;
    updateDisplay(state);
  });
});
