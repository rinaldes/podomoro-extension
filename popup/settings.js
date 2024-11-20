// DOM elements
const backButton = document.getElementById('backButton');
const saveSettingsButton = document.getElementById('saveSettings');
const resetDefaultsButton = document.getElementById('resetDefaults');
const revertChangesButton = document.getElementById('revertChanges');
const workDurationInput = document.getElementById('workDuration');
const shortBreakInput = document.getElementById('shortBreak');
const longBreakInput = document.getElementById('longBreak');
const sessionsBeforeLongBreakInput = document.getElementById('sessionsBeforeLongBreak');

// Default settings
const defaultSettings = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLongBreak: 4
};

// Store the last saved settings
let savedSettings = null;

// Load current settings
browser.runtime.sendMessage({ type: 'getState' }).then((state) => {
  savedSettings = state.settings;
  loadSettingsToInputs(savedSettings);
});

function loadSettingsToInputs(settings) {
  workDurationInput.value = settings.workDuration;
  shortBreakInput.value = settings.shortBreak;
  longBreakInput.value = settings.longBreak;
  sessionsBeforeLongBreakInput.value = settings.sessionsBeforeLongBreak;
}

function saveSettings() {
  const settings = {
    workDuration: parseInt(workDurationInput.value),
    shortBreak: parseInt(shortBreakInput.value),
    longBreak: parseInt(longBreakInput.value),
    sessionsBeforeLongBreak: parseInt(sessionsBeforeLongBreakInput.value)
  };

  browser.runtime.sendMessage({
    type: 'updateSettings',
    settings: settings
  }).then(() => {
    savedSettings = settings;
    window.location.href = 'popup.html';
  });
}

function resetToDefaults() {
  // Only update input values, without saving
  loadSettingsToInputs(defaultSettings);
}

function revertChanges() {
  // Restore the last saved settings to inputs
  loadSettingsToInputs(savedSettings);
}

function goBack() {
  window.location.href = 'popup.html';
}

// Event listeners
backButton.addEventListener('click', goBack);
saveSettingsButton.addEventListener('click', saveSettings);
resetDefaultsButton.addEventListener('click', resetToDefaults);
revertChangesButton.addEventListener('click', revertChanges);
