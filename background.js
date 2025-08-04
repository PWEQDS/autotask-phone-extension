// Background script for Autotask AGFEO Phone Integration
// Handles phone call requests and protocol execution

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'makeCall') {
        const phoneNumber = message.phoneNumber;
        
        // Log the call attempt
        console.log('AGFEO Extension: Attempting to call', phoneNumber);
        
        // Create the tksuite protocol URL
        const tksuiteUrl = `tksuite:${phoneNumber}?call`;
        
        try {
            // Try to open the protocol URL
            chrome.tabs.create({
                url: tksuiteUrl,
                active: false
            }).then(() => {
                console.log('AGFEO Extension: Call initiated successfully');
                
                // Show notification to user
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: 'AGFEO Phone Call',
                    message: `Anruf wird eingeleitet: ${phoneNumber}`
                });
                
                sendResponse({ success: true });
            }).catch((error) => {
                console.error('AGFEO Extension: Error initiating call', error);
                
                // Fallback: try to navigate in current tab
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]) {
                        chrome.tabs.update(tabs[0].id, { url: tksuiteUrl });
                    }
                });
                
                sendResponse({ success: false, error: error.message });
            });
            
        } catch (error) {
            console.error('AGFEO Extension: Call failed', error);
            sendResponse({ success: false, error: error.message });
        }
        
        return true; // Keep message channel open for async response
    }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('AGFEO Phone Extension installed/updated');
    
    if (details.reason === 'install') {
        // Show welcome notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'AGFEO Phone Extension',
            message: 'Extension erfolgreich installiert! Click-to-Call ist jetzt auf Autotask/Datto Seiten verfügbar.'
        });
    }
});

// Storage helper functions
const storage = {
    get: (keys) => {
        return chrome.storage.sync.get(keys);
    },
    
    set: (data) => {
        return chrome.storage.sync.set(data);
    }
};

// Save call history
function saveCallHistory(phoneNumber) {
    storage.get(['callHistory']).then((result) => {
        const history = result.callHistory || [];
        const callRecord = {
            phoneNumber: phoneNumber,
            timestamp: new Date().toISOString(),
            source: 'autotask'
        };
        
        // Add to beginning of array and limit to 50 entries
        history.unshift(callRecord);
        if (history.length > 50) {
            history.splice(50);
        }
        
        storage.set({ callHistory: history });
    });
}

// Extended message handling for additional features
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'getCallHistory':
            storage.get(['callHistory']).then((result) => {
                sendResponse({ history: result.callHistory || [] });
            });
            return true;
            
        case 'clearCallHistory':
            storage.set({ callHistory: [] }).then(() => {
                sendResponse({ success: true });
            });
            return true;
            
        case 'getSettings':
            storage.get(['settings']).then((result) => {
                const defaultSettings = {
                    autoDetect: true,
                    showNotifications: true,
                    dialPrefix: ''
                };
                sendResponse({ settings: { ...defaultSettings, ...result.settings } });
            });
            return true;
            
        case 'saveSettings':
            storage.set({ settings: message.settings }).then(() => {
                sendResponse({ success: true });
            });
            return true;
    }
});