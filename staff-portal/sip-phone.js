/**
 * External Calling via SIP Softphone (MicroSIP, Zoiper, etc.)
 * ===========================================================
 * Uses tel: and sip: URL protocols to trigger the desktop softphone
 * 
 * How it works:
 * 1. Staff enters phone number and clicks "Call"
 * 2. Browser opens MicroSIP via sip: or tel: protocol
 * 3. MicroSIP dials the number using Sipgate account
 */

// Configuration
const SOFTPHONE_CONFIG = {
    // SIP domain for URI format
    sipDomain: 'sipgate.co.uk',
    // Preferred protocol: 'sip' or 'tel'
    protocol: 'tel',
    // Call history
    callHistory: []
};

// State
let softphoneState = {
    isReady: true
};

// DOM Elements
let softphoneUI = {};

/**
 * Initialize Softphone Integration
 */
function initSIPPhone() {
    console.log('Initializing Softphone Integration (MicroSIP)...');
    setupSoftphoneUI();
    loadCallHistory();
    updateSoftphoneStatus('online', 'Ready - Using MicroSIP');
    return true;
}

/**
 * Make an external call via MicroSIP
 * @param {string} phoneNumber - The phone number to call
 */
function makeExternalCall(phoneNumber) {
    console.log('Making external call via MicroSIP to:', phoneNumber);
    
    if (!phoneNumber || phoneNumber.trim() === '') {
        showSoftphoneNotification('Please enter a phone number', 'warning');
        return false;
    }
    
    // Format phone number
    let formattedNumber = formatPhoneNumber(phoneNumber);
    console.log('Formatted number:', formattedNumber);
    
    // Build the URI based on protocol preference
    let callUri;
    if (SOFTPHONE_CONFIG.protocol === 'sip') {
        // SIP URI format: sip:+441234567890@sipgate.co.uk
        callUri = `sip:${formattedNumber}@${SOFTPHONE_CONFIG.sipDomain}`;
    } else {
        // Tel URI format: tel:+441234567890
        callUri = `tel:${formattedNumber}`;
    }
    
    console.log('Opening URI:', callUri);
    
    // Save to call history
    addToCallHistory(phoneNumber, formattedNumber);
    
    // Open MicroSIP via protocol handler
    try {
        window.location.href = callUri;
        showSoftphoneNotification('Opening MicroSIP...', 'success');
        showActiveCallUI(phoneNumber);
    } catch (error) {
        console.error('Failed to open softphone:', error);
        showSoftphoneNotification('Could not open MicroSIP. Is it installed?', 'error');
    }
    
    return true;
}

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(number) {
    // Remove spaces, dashes, parentheses
    let formatted = number.replace(/[\s\-\(\)]/g, '');
    
    // Convert UK local to international format
    if (formatted.startsWith('0')) {
        formatted = '+44' + formatted.substring(1);
    }
    
    // Add + if missing and looks like international
    if (!formatted.startsWith('+') && formatted.length > 10) {
        formatted = '+' + formatted;
    }
    
    return formatted;
}

/**
 * Add call to history
 */
function addToCallHistory(displayNumber, formattedNumber) {
    const entry = {
        display: displayNumber,
        formatted: formattedNumber,
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
    
    SOFTPHONE_CONFIG.callHistory.unshift(entry);
    
    // Keep only last 10 calls
    if (SOFTPHONE_CONFIG.callHistory.length > 10) {
        SOFTPHONE_CONFIG.callHistory.pop();
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('sipgate_call_history', JSON.stringify(SOFTPHONE_CONFIG.callHistory));
    } catch (e) {
        console.log('Could not save call history:', e);
    }
    
    updateCallHistoryUI();
}

/**
 * Load call history from localStorage
 */
function loadCallHistory() {
    try {
        const saved = localStorage.getItem('sipgate_call_history');
        if (saved) {
            SOFTPHONE_CONFIG.callHistory = JSON.parse(saved);
            updateCallHistoryUI();
        }
    } catch (e) {
        console.log('Could not load call history:', e);
    }
}

/**
 * Redial a number from history
 */
function redialNumber(formattedNumber) {
    const phoneInput = document.getElementById('sip-phone-number');
    if (phoneInput) {
        phoneInput.value = formattedNumber;
    }
    makeExternalCall(formattedNumber);
}

// ============ UI Functions ============

function setupSoftphoneUI() {
    let container = document.getElementById('sip-phone-section');
    if (!container) {
        container = document.createElement('div');
        container.id = 'sip-phone-section';
        container.className = 'section sip-phone-section';
        container.innerHTML = `
            <div class="sip-phone-header">
                <div class="sip-phone-icon">
                    <i class="fas fa-phone-square-alt"></i>
                </div>
                <div class="sip-phone-info">
                    <h3>External Calls</h3>
                    <div id="sip-status" class="sip-status">
                        <span class="status-dot online"></span>
                        <span id="sip-status-text">Ready - Using MicroSIP</span>
                    </div>
                </div>
                <div class="sip-protocol-toggle">
                    <button class="btn btn-small btn-outline ${SOFTPHONE_CONFIG.protocol === 'tel' ? 'active' : ''}" onclick="setProtocol('tel')" title="Use tel: protocol">
                        tel:
                    </button>
                    <button class="btn btn-small btn-outline ${SOFTPHONE_CONFIG.protocol === 'sip' ? 'active' : ''}" onclick="setProtocol('sip')" title="Use sip: protocol">
                        sip:
                    </button>
                </div>
            </div>
            
            <div class="sip-dial-section">
                <div class="sip-input-group">
                    <input type="tel" id="sip-phone-number" placeholder="Enter phone number" class="sip-phone-input">
                    <button id="sip-call-btn" class="btn btn-success" onclick="dialNumber()">
                        <i class="fas fa-phone"></i> Call
                    </button>
                </div>
                <div class="sip-how-it-works">
                    <i class="fas fa-info-circle"></i>
                    <span>Opens MicroSIP to dial the number using your Sipgate account</span>
                </div>
            </div>
            
            <div id="sip-call-history" class="sip-call-history">
                <h4><i class="fas fa-history"></i> Recent Calls</h4>
                <div id="sip-history-list" class="sip-history-list">
                    <p class="no-history">No recent calls</p>
                </div>
            </div>
        `;
        
        // Insert after webrtc-phone-section
        const webrtcSection = document.getElementById('webrtc-phone-section');
        if (webrtcSection) {
            webrtcSection.parentNode.insertBefore(container, webrtcSection.nextSibling);
        } else {
            const portalContent = document.querySelector('.portal-content');
            if (portalContent) {
                portalContent.prepend(container);
            }
        }
    }
    
    softphoneUI = {
        container: container,
        phoneInput: document.getElementById('sip-phone-number'),
        callBtn: document.getElementById('sip-call-btn'),
        historyList: document.getElementById('sip-history-list')
    };
    
    // Enter key to dial
    const phoneInput = document.getElementById('sip-phone-number');
    if (phoneInput) {
        phoneInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                dialNumber();
            }
        });
    }
}

function updateSoftphoneStatus(status, text) {
    const statusDot = document.querySelector('#sip-status .status-dot');
    const statusText = document.getElementById('sip-status-text');
    
    if (statusDot) {
        statusDot.className = 'status-dot ' + status;
    }
    if (statusText) {
        statusText.textContent = text;
    }
}

function dialNumber() {
    const phoneInput = document.getElementById('sip-phone-number');
    if (phoneInput && phoneInput.value.trim()) {
        makeExternalCall(phoneInput.value.trim());
    } else {
        showSoftphoneNotification('Please enter a phone number', 'warning');
    }
}

function setProtocol(protocol) {
    SOFTPHONE_CONFIG.protocol = protocol;
    
    // Update button states
    document.querySelectorAll('.sip-protocol-toggle .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    showSoftphoneNotification(`Using ${protocol}: protocol`, 'info');
}

function showActiveCallUI(phoneNumber) {
    // Just update status briefly
    updateSoftphoneStatus('in-call', 'Dialing ' + phoneNumber + '...');
    
    // Reset after 3 seconds
    setTimeout(() => {
        updateSoftphoneStatus('online', 'Ready - Using MicroSIP');
    }, 3000);
}

function updateCallHistoryUI() {
    const historyList = document.getElementById('sip-history-list');
    if (!historyList) return;
    
    if (SOFTPHONE_CONFIG.callHistory.length === 0) {
        historyList.innerHTML = '<p class="no-history">No recent calls</p>';
        return;
    }
    
    historyList.innerHTML = SOFTPHONE_CONFIG.callHistory.map(call => `
        <div class="history-item" onclick="redialNumber('${call.formatted}')">
            <div class="history-number">
                <i class="fas fa-phone-alt"></i>
                <span>${call.display}</span>
            </div>
            <div class="history-time">${call.time}</div>
        </div>
    `).join('');
}

function showSoftphoneNotification(message, type = 'info') {
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    } else {
        console.log(`[Softphone ${type}] ${message}`);
    }
}

// Export for use
window.SIPPhone = {
    init: initSIPPhone,
    makeCall: makeExternalCall,
    isReady: () => softphoneState.isReady
};

window.initSIPPhone = initSIPPhone;
window.makeExternalCall = makeExternalCall;
window.dialNumber = dialNumber;
window.setProtocol = setProtocol;
window.redialNumber = redialNumber;
