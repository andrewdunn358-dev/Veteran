/**
 * SIP Phone for Staff Portal - Sipgate Integration
 * =================================================
 * Makes external phone calls via Sipgate Classic SIP
 * Uses SIP.js library for WebRTC-to-SIP bridging
 */

// Sipgate Configuration
const SIPGATE_CONFIG = {
    sipId: '2032810e0',
    sipPassword: '9PWM5ANU',
    sipServer: 'sip.sipgate.co.uk',
    wsServer: 'wss://sip.sipgate.co.uk:8089/ws', // WebSocket SIP
    callerId: '01670898443',
    stunServer: 'stun:stun.sipgate.net:3478'
};

// SIP Phone State
let sipPhone = {
    userAgent: null,
    session: null,
    isRegistered: false,
    isInCall: false,
    localStream: null,
    isMuted: false
};

// DOM Elements
let sipUI = {};

/**
 * Initialize SIP Phone
 */
async function initSIPPhone() {
    console.log('Initializing Sipgate SIP Phone...');
    
    // Check if SIP.js is loaded
    if (typeof SIP === 'undefined') {
        console.error('SIP.js library not loaded');
        updateSIPStatus('error', 'SIP.js not loaded');
        return false;
    }
    
    setupSIPUI();
    
    try {
        // Create User Agent
        const uri = SIP.UserAgent.makeURI(`sip:${SIPGATE_CONFIG.sipId}@${SIPGATE_CONFIG.sipServer}`);
        
        const transportOptions = {
            server: SIPGATE_CONFIG.wsServer,
            traceSip: true
        };
        
        const userAgentOptions = {
            uri: uri,
            transportOptions: transportOptions,
            authorizationUsername: SIPGATE_CONFIG.sipId,
            authorizationPassword: SIPGATE_CONFIG.sipPassword,
            displayName: 'Radio Check Staff',
            sessionDescriptionHandlerFactoryOptions: {
                peerConnectionConfiguration: {
                    iceServers: [
                        { urls: SIPGATE_CONFIG.stunServer },
                        { urls: 'stun:stun.l.google.com:19302' }
                    ]
                }
            },
            logLevel: 'debug'
        };
        
        sipPhone.userAgent = new SIP.UserAgent(userAgentOptions);
        
        // Setup User Agent event handlers
        sipPhone.userAgent.delegate = {
            onConnect: () => {
                console.log('SIP Transport connected');
            },
            onDisconnect: (error) => {
                console.log('SIP Transport disconnected', error);
                sipPhone.isRegistered = false;
                updateSIPStatus('offline', 'Disconnected');
            },
            onInvite: (invitation) => {
                console.log('Incoming SIP call (not expected for outbound-only)');
                // We're not handling incoming calls for now
                invitation.reject();
            }
        };
        
        // Start the User Agent
        await sipPhone.userAgent.start();
        console.log('SIP User Agent started');
        
        // Register with Sipgate
        const registerer = new SIP.Registerer(sipPhone.userAgent);
        
        registerer.stateChange.addListener((state) => {
            console.log('Registration state:', state);
            switch (state) {
                case SIP.RegistererState.Registered:
                    sipPhone.isRegistered = true;
                    updateSIPStatus('online', 'Ready for external calls');
                    showSIPNotification('Sipgate connected', 'success');
                    break;
                case SIP.RegistererState.Unregistered:
                    sipPhone.isRegistered = false;
                    updateSIPStatus('offline', 'Not registered');
                    break;
                case SIP.RegistererState.Terminated:
                    sipPhone.isRegistered = false;
                    updateSIPStatus('offline', 'Registration terminated');
                    break;
            }
        });
        
        await registerer.register();
        console.log('Registration request sent');
        
        return true;
        
    } catch (error) {
        console.error('SIP initialization error:', error);
        updateSIPStatus('error', 'Connection failed: ' + error.message);
        return false;
    }
}

/**
 * Make an external phone call via Sipgate
 * @param {string} phoneNumber - The phone number to call (UK format)
 */
async function makeExternalCall(phoneNumber) {
    console.log('Making external call to:', phoneNumber);
    
    if (!sipPhone.isRegistered) {
        showSIPNotification('SIP phone not connected. Please wait...', 'error');
        return false;
    }
    
    if (sipPhone.isInCall) {
        showSIPNotification('Already in a call', 'warning');
        return false;
    }
    
    // Format phone number for SIP
    let formattedNumber = phoneNumber.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
    
    // Convert UK local to international format if needed
    if (formattedNumber.startsWith('0')) {
        formattedNumber = '+44' + formattedNumber.substring(1);
    }
    if (!formattedNumber.startsWith('+')) {
        formattedNumber = '+44' + formattedNumber;
    }
    
    console.log('Formatted number:', formattedNumber);
    
    try {
        // Create target URI
        const targetURI = SIP.UserAgent.makeURI(`sip:${formattedNumber}@${SIPGATE_CONFIG.sipServer}`);
        
        if (!targetURI) {
            throw new Error('Invalid phone number');
        }
        
        // Create inviter (outgoing call)
        const inviter = new SIP.Inviter(sipPhone.userAgent, targetURI, {
            sessionDescriptionHandlerOptions: {
                constraints: {
                    audio: true,
                    video: false
                }
            }
        });
        
        sipPhone.session = inviter;
        
        // Setup session event handlers
        setupSessionHandlers(inviter, formattedNumber);
        
        // Send invite
        await inviter.invite();
        
        sipPhone.isInCall = true;
        showDialingSIPUI(formattedNumber);
        updateSIPStatus('calling', 'Calling ' + phoneNumber);
        
        return true;
        
    } catch (error) {
        console.error('Call failed:', error);
        showSIPNotification('Call failed: ' + error.message, 'error');
        cleanupSIPCall();
        return false;
    }
}

/**
 * Setup session event handlers
 */
function setupSessionHandlers(session, phoneNumber) {
    session.stateChange.addListener((state) => {
        console.log('Call state:', state);
        
        switch (state) {
            case SIP.SessionState.Establishing:
                updateSIPStatus('calling', 'Connecting...');
                break;
                
            case SIP.SessionState.Established:
                sipPhone.isInCall = true;
                updateSIPStatus('in-call', 'In call');
                showActiveSIPCall(phoneNumber);
                startSIPCallTimer();
                
                // Setup remote audio
                setupRemoteAudio(session);
                break;
                
            case SIP.SessionState.Terminating:
                updateSIPStatus('ending', 'Ending call...');
                break;
                
            case SIP.SessionState.Terminated:
                sipPhone.isInCall = false;
                showSIPNotification('Call ended', 'info');
                cleanupSIPCall();
                updateSIPStatus('online', 'Ready for external calls');
                break;
        }
    });
}

/**
 * Setup remote audio playback
 */
function setupRemoteAudio(session) {
    const sessionDescriptionHandler = session.sessionDescriptionHandler;
    
    if (sessionDescriptionHandler && sessionDescriptionHandler.remoteMediaStream) {
        const remoteAudio = document.getElementById('sip-remote-audio') || createSIPAudioElement();
        remoteAudio.srcObject = sessionDescriptionHandler.remoteMediaStream;
        remoteAudio.play().catch(e => console.error('Audio play error:', e));
    }
    
    // Also listen for track events
    if (sessionDescriptionHandler && sessionDescriptionHandler.peerConnection) {
        sessionDescriptionHandler.peerConnection.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind);
            const remoteAudio = document.getElementById('sip-remote-audio') || createSIPAudioElement();
            remoteAudio.srcObject = event.streams[0];
            remoteAudio.play().catch(e => console.error('Audio play error:', e));
        };
    }
}

/**
 * End the current SIP call
 */
function endSIPCall() {
    if (sipPhone.session) {
        try {
            if (sipPhone.session.state === SIP.SessionState.Established) {
                sipPhone.session.bye();
            } else if (sipPhone.session.state === SIP.SessionState.Establishing) {
                sipPhone.session.cancel();
            }
        } catch (error) {
            console.error('Error ending call:', error);
        }
    }
    cleanupSIPCall();
}

/**
 * Toggle mute on current call
 */
function toggleSIPMute() {
    if (!sipPhone.session || !sipPhone.isInCall) return;
    
    const sessionDescriptionHandler = sipPhone.session.sessionDescriptionHandler;
    if (sessionDescriptionHandler && sessionDescriptionHandler.peerConnection) {
        const senders = sessionDescriptionHandler.peerConnection.getSenders();
        senders.forEach(sender => {
            if (sender.track && sender.track.kind === 'audio') {
                sender.track.enabled = !sender.track.enabled;
                sipPhone.isMuted = !sender.track.enabled;
            }
        });
        
        const muteBtn = document.getElementById('sip-mute-btn');
        if (muteBtn) {
            muteBtn.classList.toggle('muted', sipPhone.isMuted);
            muteBtn.innerHTML = sipPhone.isMuted ? 
                '<i class="fas fa-microphone-slash"></i> Unmute' :
                '<i class="fas fa-microphone"></i> Mute';
        }
        
        showSIPNotification(sipPhone.isMuted ? 'Muted' : 'Unmuted', 'info');
    }
}

/**
 * Cleanup call resources
 */
function cleanupSIPCall() {
    sipPhone.session = null;
    sipPhone.isInCall = false;
    sipPhone.isMuted = false;
    
    stopSIPCallTimer();
    hideSIPCallUI();
    
    // Stop remote audio
    const remoteAudio = document.getElementById('sip-remote-audio');
    if (remoteAudio) {
        remoteAudio.srcObject = null;
    }
}

// ============ UI Functions ============

let sipCallTimer = null;
let sipCallStartTime = null;

function setupSIPUI() {
    // Create SIP phone UI container
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
                    <h3>External Calls (Sipgate)</h3>
                    <div id="sip-status" class="sip-status">
                        <span class="status-dot offline"></span>
                        <span id="sip-status-text">Initializing...</span>
                    </div>
                </div>
            </div>
            
            <div class="sip-dial-section">
                <div class="sip-input-group">
                    <input type="tel" id="sip-phone-number" placeholder="Enter phone number" class="sip-phone-input">
                    <button id="sip-call-btn" class="btn btn-success" onclick="dialSIPNumber()" disabled>
                        <i class="fas fa-phone"></i> Call
                    </button>
                </div>
                <div class="sip-quick-dial">
                    <span class="quick-dial-label">Quick dial:</span>
                    <button class="btn btn-small btn-outline" onclick="setSIPNumber('+447911123456')">Test UK Mobile</button>
                </div>
            </div>
            
            <div id="sip-active-call" class="sip-active-call hidden">
                <div class="sip-call-info">
                    <i class="fas fa-phone-alt sip-call-icon"></i>
                    <div class="sip-call-details">
                        <span id="sip-call-number" class="sip-call-number">Calling...</span>
                        <span id="sip-call-timer" class="sip-call-timer">00:00</span>
                    </div>
                </div>
                <div class="sip-call-controls">
                    <button id="sip-mute-btn" class="btn btn-secondary" onclick="toggleSIPMute()">
                        <i class="fas fa-microphone"></i> Mute
                    </button>
                    <button class="btn btn-danger" onclick="endSIPCall()">
                        <i class="fas fa-phone-slash"></i> End Call
                    </button>
                </div>
            </div>
            
            <audio id="sip-remote-audio" autoplay style="display: none;"></audio>
        `;
        
        // Insert after webrtc-phone-section
        const webrtcSection = document.getElementById('webrtc-phone-section');
        if (webrtcSection) {
            webrtcSection.parentNode.insertBefore(container, webrtcSection.nextSibling);
        } else {
            document.querySelector('.portal-content').prepend(container);
        }
    }
    
    sipUI = {
        container: container,
        status: document.getElementById('sip-status'),
        statusText: document.getElementById('sip-status-text'),
        phoneInput: document.getElementById('sip-phone-number'),
        callBtn: document.getElementById('sip-call-btn'),
        activeCall: document.getElementById('sip-active-call'),
        callNumber: document.getElementById('sip-call-number'),
        callTimer: document.getElementById('sip-call-timer')
    };
    
    // Enable call button when registered
    if (sipUI.phoneInput) {
        sipUI.phoneInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && sipPhone.isRegistered) {
                dialSIPNumber();
            }
        });
    }
}

function updateSIPStatus(status, text) {
    const statusDot = document.querySelector('#sip-status .status-dot');
    const statusText = document.getElementById('sip-status-text');
    
    if (statusDot) {
        statusDot.className = 'status-dot ' + status;
    }
    if (statusText) {
        statusText.textContent = text;
    }
    
    // Enable/disable call button
    const callBtn = document.getElementById('sip-call-btn');
    if (callBtn) {
        callBtn.disabled = !sipPhone.isRegistered || sipPhone.isInCall;
    }
}

function dialSIPNumber() {
    const phoneInput = document.getElementById('sip-phone-number');
    if (phoneInput && phoneInput.value) {
        makeExternalCall(phoneInput.value);
    }
}

function setSIPNumber(number) {
    const phoneInput = document.getElementById('sip-phone-number');
    if (phoneInput) {
        phoneInput.value = number;
    }
}

function showDialingSIPUI(phoneNumber) {
    const activeCall = document.getElementById('sip-active-call');
    const callNumber = document.getElementById('sip-call-number');
    
    if (activeCall) activeCall.classList.remove('hidden');
    if (callNumber) callNumber.textContent = 'Calling: ' + phoneNumber;
}

function showActiveSIPCall(phoneNumber) {
    const activeCall = document.getElementById('sip-active-call');
    const callNumber = document.getElementById('sip-call-number');
    
    if (activeCall) activeCall.classList.remove('hidden');
    if (callNumber) callNumber.textContent = 'Connected: ' + phoneNumber;
}

function hideSIPCallUI() {
    const activeCall = document.getElementById('sip-active-call');
    if (activeCall) activeCall.classList.add('hidden');
    
    const callTimer = document.getElementById('sip-call-timer');
    if (callTimer) callTimer.textContent = '00:00';
}

function startSIPCallTimer() {
    sipCallStartTime = Date.now();
    sipCallTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sipCallStartTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        
        const timerEl = document.getElementById('sip-call-timer');
        if (timerEl) {
            timerEl.textContent = `${mins}:${secs}`;
        }
    }, 1000);
}

function stopSIPCallTimer() {
    if (sipCallTimer) {
        clearInterval(sipCallTimer);
        sipCallTimer = null;
    }
    sipCallStartTime = null;
}

function createSIPAudioElement() {
    const audio = document.createElement('audio');
    audio.id = 'sip-remote-audio';
    audio.autoplay = true;
    document.body.appendChild(audio);
    return audio;
}

function showSIPNotification(message, type = 'info') {
    // Use existing notification system if available
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    } else {
        console.log(`[SIP ${type}] ${message}`);
    }
}

// Export for use
window.SIPPhone = {
    init: initSIPPhone,
    makeCall: makeExternalCall,
    endCall: endSIPCall,
    toggleMute: toggleSIPMute,
    isConnected: () => sipPhone.isRegistered,
    isInCall: () => sipPhone.isInCall
};
