// Timer state
let state = {
  timeRemaining: 25 * 60,
  isRunning: false,
  currentMode: 'work',
  currentSession: 1,
  settings: {
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsBeforeLongBreak: 4,
    autoStartNextSession: true
  }
};

let timerId = null;

// Load saved state
browser.storage.local.get(['timerState', 'timerSettings']).then((result) => {
  if (result.timerSettings) {
    state.settings = result.timerSettings;
  }
  if (result.timerState) {
    const savedState = result.timerState;
    state.timeRemaining = savedState.timeRemaining;
    state.isRunning = false; // Always start paused when restoring
    state.currentMode = savedState.currentMode;
    state.currentSession = savedState.currentSession;
  }
  
  // Initialize timer if needed
  if (state.timeRemaining === undefined) {
    resetTimer();
  }
});

function saveState() {
  browser.storage.local.set({
    timerState: { ...state }
  });
  // Notify popup about the update
  browser.runtime.sendMessage({
    type: 'stateUpdated',
    state: state
  });
}

function startTimer() {
  if (!state.isRunning) {
    state.isRunning = true;
    timerId = setInterval(() => {
      state.timeRemaining--;
      
      if (state.timeRemaining <= 0) {
        handleTimerComplete();
      }
      
      saveState();
    }, 1000);
    saveState();
  }
}

function pauseTimer() {
  if (state.isRunning) {
    clearInterval(timerId);
    state.isRunning = false;
    saveState();
  }
}

function resetTimer() {
  clearInterval(timerId);
  state.isRunning = false;
  state.timeRemaining = state.settings.workDuration * 60;
  state.currentMode = 'work';
  state.currentSession = 1;
  saveState();
}

function handleTimerComplete() {
  clearInterval(timerId);
  state.isRunning = false;
  
  // Update mode and session
  if (state.currentMode === 'work') {
    if (state.currentSession >= state.settings.sessionsBeforeLongBreak) {
      state.currentMode = 'longBreak';
      state.timeRemaining = state.settings.longBreak * 60;
      state.currentSession = 1;
    } else {
      state.currentMode = 'shortBreak';
      state.timeRemaining = state.settings.shortBreak * 60;
      state.currentSession++;
    }
  } else {
    state.currentMode = 'work';
    state.timeRemaining = state.settings.workDuration * 60;
  }
  
  // Notify user
  browser.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-48.png',
    title: 'Pomodoro Timer',
    message: `${state.currentMode === 'work' ? 'Work session' : 'Break'} started!`
  });
  
  // Auto-start next session if enabled
  if (state.settings.autoStartNextSession) {
    startTimer();
  }
  
  saveState();
}

function skipBreak() {
  if (state.currentMode !== 'work') {
    clearInterval(timerId);
    state.isRunning = false;
    state.currentMode = 'work';
    state.timeRemaining = state.settings.workDuration * 60;
    
    // Notify user
    browser.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'Pomodoro Timer',
      message: 'Break skipped. Starting work session.'
    });
    
    // Auto-start new work session if enabled
    if (state.settings.autoStartNextSession) {
      startTimer();
    }
    
    saveState();
  }
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'getState':
      sendResponse(state);
      break;
    case 'startTimer':
      startTimer();
      sendResponse(state);
      break;
    case 'pauseTimer':
      pauseTimer();
      sendResponse(state);
      break;
    case 'resetTimer':
      resetTimer();
      sendResponse(state);
      break;
    case 'skipBreak':
      skipBreak();
      sendResponse(state);
      break;
    case 'updateSettings':
      state.settings = message.settings;
      browser.storage.local.set({ timerSettings: message.settings });
      resetTimer();
      sendResponse(state);
      break;
    case 'setAutoStart':
      state.settings.autoStartNextSession = message.enabled;
      browser.storage.local.set({ timerSettings: state.settings });
      sendResponse(state);
      break;
  }
});
