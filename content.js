// Content script for Autotask AGFEO Phone Integration
// Detects phone numbers and adds click-to-call functionality

(function() {
    'use strict';

    // Phone number regex patterns - supporting various formats
    const phonePatterns = [
        // German phone numbers
        /(\+49\s?)?(\(0\)?\s?)?(\d{2,4}[\s\-\/]?\d{2,8}[\s\-\/]?\d{2,8})/g,
        // International formats
        /(\+\d{1,3}\s?)?(\(?\d{1,4}\)?[\s\-\.]?\d{1,4}[\s\-\.]?\d{1,9})/g,
        // Common formats with parentheses
        /(\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4})/g
    ];

    // Function to normalize phone number (remove spaces, dashes, etc.)
    function normalizePhoneNumber(phoneStr) {
        return phoneStr.replace(/[\s\-\(\)\.\+\/]/g, '');
    }

    // Function to check if a phone number is valid
    function isValidPhoneNumber(phoneStr) {
        const normalized = normalizePhoneNumber(phoneStr);
        // Must be at least 6 digits and max 15 digits
        return /^\d{6,15}$/.test(normalized);
    }

    // Function to create click-to-call button
    function createCallButton(phoneNumber) {
        const button = document.createElement('span');
        button.className = 'agfeo-call-button';
        button.innerHTML = '📞';
        button.title = `Anrufen: ${phoneNumber}`;
        button.style.cursor = 'pointer';
        button.style.marginLeft = '5px';
        button.style.color = '#2196F3';
        button.style.fontSize = '14px';
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const normalizedNumber = normalizePhoneNumber(phoneNumber);
            
            // Send message to background script to handle the call
            chrome.runtime.sendMessage({
                action: 'makeCall',
                phoneNumber: normalizedNumber
            });
        });
        
        return button;
    }

    // Function to enhance phone numbers in text nodes
    function enhancePhoneNumbers() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script and style elements
                    const parent = node.parentElement;
                    if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Skip if already processed
                    if (parent && parent.classList.contains('agfeo-enhanced')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            let hasPhoneNumber = false;
            
            // Check all phone patterns
            for (let pattern of phonePatterns) {
                if (pattern.test(text)) {
                    hasPhoneNumber = true;
                    break;
                }
            }
            
            if (hasPhoneNumber) {
                const parent = textNode.parentElement;
                if (parent) {
                    parent.classList.add('agfeo-enhanced');
                    
                    // Replace text with enhanced version
                    let enhancedHTML = text;
                    
                    phonePatterns.forEach(pattern => {
                        enhancedHTML = enhancedHTML.replace(pattern, (match) => {
                            if (isValidPhoneNumber(match)) {
                                return `<span class="agfeo-phone-wrapper">${match}</span>`;
                            }
                            return match;
                        });
                    });
                    
                    if (enhancedHTML !== text) {
                        const wrapper = document.createElement('span');
                        wrapper.innerHTML = enhancedHTML;
                        parent.replaceChild(wrapper, textNode);
                        
                        // Add call buttons to phone wrappers
                        const phoneWrappers = wrapper.querySelectorAll('.agfeo-phone-wrapper');
                        phoneWrappers.forEach(phoneWrapper => {
                            const phoneNumber = phoneWrapper.textContent;
                            const callButton = createCallButton(phoneNumber);
                            phoneWrapper.appendChild(callButton);
                        });
                    }
                }
            }
        });
    }

    // Function to enhance input fields and form fields that might contain phone numbers
    function enhancePhoneInputs() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[name*="phone"], input[name*="telefon"], input[id*="phone"], input[id*="telefon"]');
        
        inputs.forEach(input => {
            if (input.classList.contains('agfeo-enhanced')) return;
            
            input.classList.add('agfeo-enhanced');
            
            // Add call button next to input if it contains a phone number
            const checkAndAddButton = () => {
                const value = input.value.trim();
                if (value && isValidPhoneNumber(value)) {
                    // Remove existing button if any
                    const existingButton = input.parentNode.querySelector('.agfeo-input-call-button');
                    if (existingButton) {
                        existingButton.remove();
                    }
                    
                    const callButton = createCallButton(value);
                    callButton.className += ' agfeo-input-call-button';
                    callButton.style.marginLeft = '10px';
                    
                    input.parentNode.insertBefore(callButton, input.nextSibling);
                }
            };
            
            // Check on input events
            input.addEventListener('input', checkAndAddButton);
            input.addEventListener('blur', checkAndAddButton);
            
            // Initial check
            checkAndAddButton();
        });
    }

    // Function to observe DOM changes
    function observeChanges() {
        const observer = new MutationObserver((mutations) => {
            let shouldProcess = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            shouldProcess = true;
                        }
                    });
                }
            });
            
            if (shouldProcess) {
                setTimeout(() => {
                    enhancePhoneNumbers();
                    enhancePhoneInputs();
                }, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize when DOM is ready
    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(processPage, 500);
            });
        } else {
            setTimeout(processPage, 500);
        }
    }

    function processPage() {
        enhancePhoneNumbers();
        enhancePhoneInputs();
        observeChanges();
        
        console.log('AGFEO Phone Extension: Page processed for phone numbers');
    }

    // Start the enhancement
    initialize();

})();