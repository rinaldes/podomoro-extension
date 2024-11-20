// Browser API compatibility layer
const browserAPI = {
    runtime: {},
    storage: {},
    notifications: {}
};

if (typeof chrome !== 'undefined') {
    // Chrome environment
    browserAPI.runtime = chrome.runtime;
    browserAPI.storage = chrome.storage;
    browserAPI.notifications = chrome.notifications;
} else if (typeof browser !== 'undefined') {
    // Firefox environment
    browserAPI.runtime = browser.runtime;
    browserAPI.storage = browser.storage;
    browserAPI.notifications = browser.notifications;
}

// Add promise support for Chrome's callback-based APIs
if (typeof chrome !== 'undefined') {
    // Storage
    browserAPI.storage.local.promisedGet = (keys) => {
        return new Promise((resolve) => {
            chrome.storage.local.get(keys, resolve);
        });
    };

    browserAPI.storage.local.promisedSet = (items) => {
        return new Promise((resolve) => {
            chrome.storage.local.set(items, resolve);
        });
    };

    // Notifications
    browserAPI.notifications.promisedCreate = (id, options) => {
        return new Promise((resolve) => {
            chrome.notifications.create(id, options, resolve);
        });
    };
} else {
    // Firefox already has promise-based APIs
    browserAPI.storage.local.promisedGet = browser.storage.local.get;
    browserAPI.storage.local.promisedSet = browser.storage.local.set;
    browserAPI.notifications.promisedCreate = browser.notifications.create;
}

export default browserAPI;
