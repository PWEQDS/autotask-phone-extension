// Popup JavaScript for AGFEO Phone Extension

document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phoneInput');
    const callButton = document.getElementById('callButton');
    const status = document.getElementById('status');
    const historyContainer = document.getElementById('historyContainer');
    const clearHistoryButton = document.getElementById('clearHistory');
    const autoDetectSetting = document.getElementById('autoDetectSetting');
    const notificationsSetting = document.getElementById('notificationsSetting');

    // Load settings
    loadSettings();
    
    // Load call history
    loadCallHistory();

    // Manual dial functionality
    callButton.addEventListener('click', function() {
        const phoneNumber = phoneInput.value.trim();
        if (phoneNumber) {
            makeCall(phoneNumber);
        }
    });

    // Enter key support for phone input
    phoneInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const phoneNumber = phoneInput.value.trim();
            if (phoneNumber) {
                makeCall(phoneNumber);
            }
        }
    });

    // Clear history
    clearHistoryButton.addEventListener('click', function() {
        if (confirm('Möchten Sie den Anrufverlauf wirklich löschen?')) {
            chrome.runtime.sendMessage({ action: 'clearCallHistory' }, function(response) {
                if (response.success) {
                    loadCallHistory();
                    showStatus('Anrufverlauf gelöscht', 'success');
                }
            });
        }
    });

    // Settings change handlers
    autoDetectSetting.addEventListener('change', saveSettings);
    notificationsSetting.addEventListener('change', saveSettings);

    // Function to make a call
    function makeCall(phoneNumber) {
        showStatus('Anruf wird eingeleitet...', 'success');
        callButton.disabled = true;

        chrome.runtime.sendMessage({
            action: 'makeCall',
            phoneNumber: normalizePhoneNumber(phoneNumber)
        }, function(response) {
            callButton.disabled = false;
            
            if (response && response.success) {
                showStatus(`Anruf eingeleitet: ${phoneNumber}`, 'success');
                phoneInput.value = '';
                
                // Reload history to show new call
                setTimeout(() => {
                    loadCallHistory();
                }, 500);
            } else {
                const errorMsg = response && response.error ? response.error : 'Unbekannter Fehler';
                showStatus(`Anruf fehlgeschlagen: ${errorMsg}`, 'error');
            }
        });
    }

    // Function to show status message
    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        
        setTimeout(() => {
            status.style.display = 'none';
        }, 5000);
    }

    // Function to normalize phone number
    function normalizePhoneNumber(phoneStr) {
        return phoneStr.replace(/[\s\-\(\)\.\+]/g, '');
    }

    // Function to format timestamp
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const callDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (callDate.getTime() === today.getTime()) {
            return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
        }
    }

    // Function to load call history
    function loadCallHistory() {
        chrome.runtime.sendMessage({ action: 'getCallHistory' }, function(response) {
            const history = response.history || [];
            
            if (history.length === 0) {
                historyContainer.innerHTML = '<div class="empty-state">Noch keine Anrufe getätigt</div>';
                clearHistoryButton.style.display = 'none';
            } else {
                let historyHTML = '';
                
                // Show last 10 calls
                const recentCalls = history.slice(0, 10);
                
                recentCalls.forEach(call => {
                    historyHTML += `
                        <div class="history-item">
                            <div>
                                <div class="history-phone">${call.phoneNumber}</div>
                                <div class="history-time">${formatTimestamp(call.timestamp)}</div>
                            </div>
                            <button class="history-call" onclick="makeCallFromHistory('${call.phoneNumber}')">
                                Erneut anrufen
                            </button>
                        </div>
                    `;
                });
                
                historyContainer.innerHTML = historyHTML;
                clearHistoryButton.style.display = 'block';
            }
        });
    }

    // Function to make call from history
    window.makeCallFromHistory = function(phoneNumber) {
        makeCall(phoneNumber);
    };

    // Function to load settings
    function loadSettings() {
        chrome.runtime.sendMessage({ action: 'getSettings' }, function(response) {
            const settings = response.settings || {};
            
            autoDetectSetting.checked = settings.autoDetect !== false;
            notificationsSetting.checked = settings.showNotifications !== false;
        });
    }

    // Function to save settings
    function saveSettings() {
        const settings = {
            autoDetect: autoDetectSetting.checked,
            showNotifications: notificationsSetting.checked
        };
        
        chrome.runtime.sendMessage({
            action: 'saveSettings',
            settings: settings
        }, function(response) {
            if (response.success) {
                showStatus('Einstellungen gespeichert', 'success');
            }
        });
    }

    // Real-time phone number validation
    phoneInput.addEventListener('input', function() {
        const phoneNumber = phoneInput.value.trim();
        const isValid = phoneNumber.length >= 6 && /^\+?[\d\s\-\(\)\.]+$/.test(phoneNumber);
        
        callButton.disabled = !isValid;
        
        if (phoneNumber && !isValid) {
            phoneInput.style.borderColor = '#f44336';
        } else {
            phoneInput.style.borderColor = '#ddd';
        }
    });

    // Focus phone input on popup open
    phoneInput.focus();
});