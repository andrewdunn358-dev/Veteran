/**
 * SIP Phone Integration for Staff Portal
 * Uses JsSIP library for WebRTC-based VoIP calls
 * 
 * This integrates with FreeSWITCH or any SIP server supporting WebSocket
 */

// SIP Configuration - RadioCheck VoIP Server
const SIP_CONFIG = {
    // WebSocket URL to FusionPBX server
    wsServer: 'wss://radiocheck.voip.synthesis-it.co.uk:7443',
    // SIP domain
    domain: 'radiocheck.voip.synthesis-it.co.uk',
    // STUN/TURN servers for NAT traversal
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN server if needed for firewalls
    ]
};

// Global state
let sipUA = null;
let currentCall = null;
let isRegistered = false;
let localStream = null;

/**
 * Initialize SIP User Agent
 * Call this after staff member logs in
 */
function initializeSIP(staffId, staffName, password) {
    // Check if JsSIP is loaded
    if (typeof JsSIP === 'undefined') {
        console.error('JsSIP library not loaded');
        showNotification('VoIP not available - JsSIP library missing', 'error');
        return false;
    }

    // Generate SIP URI from staff ID
    const sipUri = `sip:${staffId}@${SIP_CONFIG.domain}`;
    
    // Create WebSocket connection
    const socket = new JsSIP.WebSocketInterface(SIP_CONFIG.wsServer);
    
    // UA configuration
    const configuration = {
        sockets: [socket],
        uri: sipUri,
        password: password || staffId, // Use staff ID as default password
        display_name: staffName,
        register: true,
        register_expires: 300, // Re-register every 5 minutes
        session_timers: false,
        // WebRTC configuration
        pcConfig: {
            iceServers: SIP_CONFIG.iceServers
        }
    };

    try {
        sipUA = new JsSIP.UA(configuration);
        
        // Set up event handlers
        setupSIPEventHandlers();
        
        // Start the UA
        sipUA.start();
        
        console.log('SIP UA initialized for:', sipUri);
        return true;
        
    } catch (error) {
        console.error('Failed to initialize SIP:', error);
        showNotification('Failed to initialize VoIP: ' + error.message, 'error');
        return false;
    }
}

/**
 * Set up SIP event handlers
 */
function setupSIPEventHandlers() {
    if (!sipUA) return;

    // Connection events
    sipUA.on('connecting', () => {
        console.log('SIP: Connecting to server...');
        updatePhoneStatus('connecting');
    });

    sipUA.on('connected', () => {
        console.log('SIP: Connected to server');
        updatePhoneStatus('connected');
    });

    sipUA.on('disconnected', () => {
        console.log('SIP: Disconnected from server');
        updatePhoneStatus('disconnected');
        isRegistered = false;
    });

    // Registration events
    sipUA.on('registered', () => {
        console.log('SIP: Registered successfully');
        isRegistered = true;
        updatePhoneStatus('registered');
        showNotification('Phone registered - Ready for calls', 'success');
    });

    sipUA.on('unregistered', () => {
        console.log('SIP: Unregistered');
        isRegistered = false;
        updatePhoneStatus('unregistered');
    });

    sipUA.on('registrationFailed', (e) => {
        console.error('SIP: Registration failed:', e.cause);
        isRegistered = false;
        updatePhoneStatus('registration-failed');
        showNotification('Phone registration failed: ' + e.cause, 'error');
    });

    // Incoming call event
    sipUA.on('newRTCSession', (data) => {
        const session = data.session;
        
        if (session.direction === 'incoming') {
            handleIncomingCall(session, data.request);
        } else {
            // Outgoing call - set up session handlers
            setupCallSessionHandlers(session);
        }
    });
}

/**
 * Handle incoming call
 */
function handleIncomingCall(session, request) {
    console.log('Incoming call from:', session.remote_identity.uri.toString());
    
    // Store session
    currentCall = session;
    
    // Set up session handlers
    setupCallSessionHandlers(session);
    
    // Extract caller info
    const callerUri = session.remote_identity.uri.toString();
    const callerName = session.remote_identity.display_name || callerUri;
    
    // Play ringtone
    playRingtone();
    
    // Show incoming call UI
    showIncomingCallModal(callerName, callerUri, session);
}

/**
 * Set up call session event handlers
 */
function setupCallSessionHandlers(session) {
    session.on('progress', () => {
        console.log('Call in progress (ringing)');
        updateCallStatus('ringing');
    });

    session.on('accepted', () => {
        console.log('Call accepted');
        stopRingtone();
        updateCallStatus('connected');
        startCallTimer();
    });

    session.on('confirmed', () => {
        console.log('Call confirmed');
        // Attach remote stream to audio element
        attachRemoteStream(session);
    });

    session.on('ended', (e) => {
        console.log('Call ended:', e.cause);
        stopRingtone();
        cleanupCall();
        updateCallStatus('ended');
        showNotification('Call ended: ' + (e.cause || 'Completed'), 'info');
    });

    session.on('failed', (e) => {
        console.log('Call failed:', e.cause);
        stopRingtone();
        cleanupCall();
        updateCallStatus('failed');
        showNotification('Call failed: ' + e.cause, 'error');
    });

    session.on('hold', () => {
        console.log('Call on hold');
        updateCallStatus('on-hold');
    });

    session.on('unhold', () => {
        console.log('Call resumed');
        updateCallStatus('connected');
    });

    // Handle ICE connection state
    session.on('icecandidate', (event) => {
        if (event.candidate) {
            console.log('ICE candidate:', event.candidate.candidate);
        }
    });
}

/**
 * Make an outgoing call
 */
function makeCall(targetExtension) {
    if (!sipUA || !isRegistered) {
        showNotification('Phone not registered. Please wait...', 'error');
        return false;
    }

    if (currentCall) {
        showNotification('Already in a call', 'error');
        return false;
    }

    const targetUri = `sip:${targetExtension}@${SIP_CONFIG.domain}`;
    
    console.log('Calling:', targetUri);
    
    const callOptions = {
        mediaConstraints: {
            audio: true,
            video: false // Set to true for video calls
        },
        pcConfig: {
            iceServers: SIP_CONFIG.iceServers
        }
    };

    try {
        currentCall = sipUA.call(targetUri, callOptions);
        showOutgoingCallUI(targetExtension);
        return true;
    } catch (error) {
        console.error('Failed to make call:', error);
        showNotification('Failed to make call: ' + error.message, 'error');
        return false;
    }
}

/**
 * Answer incoming call
 */
function answerCall() {
    if (!currentCall) {
        console.error('No incoming call to answer');
        return;
    }

    stopRingtone();

    const answerOptions = {
        mediaConstraints: {
            audio: true,
            video: false
        },
        pcConfig: {
            iceServers: SIP_CONFIG.iceServers
        }
    };

    try {
        currentCall.answer(answerOptions);
        hideIncomingCallModal();
        showActiveCallUI();
    } catch (error) {
        console.error('Failed to answer call:', error);
        showNotification('Failed to answer call: ' + error.message, 'error');
    }
}

/**
 * Reject incoming call
 */
function rejectCall() {
    if (!currentCall) return;
    
    stopRingtone();
    
    try {
        currentCall.terminate({
            status_code: 486,
            reason_phrase: 'Busy Here'
        });
    } catch (error) {
        console.error('Failed to reject call:', error);
    }
    
    hideIncomingCallModal();
    cleanupCall();
}

/**
 * Hang up current call
 */
function hangupCall() {
    if (!currentCall) return;
    
    try {
        currentCall.terminate();
    } catch (error) {
        console.error('Failed to hang up:', error);
    }
    
    cleanupCall();
}

/**
 * Toggle call hold
 */
function toggleHold() {
    if (!currentCall) return;
    
    try {
        if (currentCall.isOnHold().local) {
            currentCall.unhold();
        } else {
            currentCall.hold();
        }
    } catch (error) {
        console.error('Failed to toggle hold:', error);
    }
}

/**
 * Toggle mute
 */
function toggleMute() {
    if (!currentCall) return;
    
    try {
        if (currentCall.isMuted().audio) {
            currentCall.unmute({ audio: true });
            updateMuteButton(false);
        } else {
            currentCall.mute({ audio: true });
            updateMuteButton(true);
        }
    } catch (error) {
        console.error('Failed to toggle mute:', error);
    }
}

/**
 * Send DTMF tone
 */
function sendDTMF(digit) {
    if (!currentCall) return;
    
    try {
        currentCall.sendDTMF(digit);
    } catch (error) {
        console.error('Failed to send DTMF:', error);
    }
}

/**
 * Attach remote audio stream
 */
function attachRemoteStream(session) {
    const remoteAudio = document.getElementById('remote-audio');
    if (!remoteAudio) {
        console.error('Remote audio element not found');
        return;
    }

    // Get the peer connection
    const pc = session.connection;
    
    if (pc) {
        pc.ontrack = (event) => {
            console.log('Remote track received');
            remoteAudio.srcObject = event.streams[0];
            remoteAudio.play().catch(e => console.log('Audio play failed:', e));
        };
        
        // For older browsers
        pc.onaddstream = (event) => {
            console.log('Remote stream received (legacy)');
            remoteAudio.srcObject = event.stream;
            remoteAudio.play().catch(e => console.log('Audio play failed:', e));
        };
    }
}

/**
 * Clean up after call ends
 */
function cleanupCall() {
    currentCall = null;
    stopCallTimer();
    hideActiveCallUI();
    hideIncomingCallModal();
    
    // Stop local stream
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
}

/**
 * Unregister and disconnect SIP
 */
function disconnectSIP() {
    if (sipUA) {
        sipUA.unregister();
        sipUA.stop();
        sipUA = null;
    }
    isRegistered = false;
    updatePhoneStatus('disconnected');
}

// ============ UI FUNCTIONS ============

let callTimerInterval = null;
let callDuration = 0;
let ringtoneAudio = null;

function updatePhoneStatus(status) {
    const statusEl = document.getElementById('phone-status');
    if (statusEl) {
        const statusMap = {
            'connecting': { text: 'Connecting...', class: 'status-connecting' },
            'connected': { text: 'Connected', class: 'status-connected' },
            'registered': { text: 'Online', class: 'status-online' },
            'unregistered': { text: 'Offline', class: 'status-offline' },
            'disconnected': { text: 'Disconnected', class: 'status-offline' },
            'registration-failed': { text: 'Failed', class: 'status-error' }
        };
        
        const statusInfo = statusMap[status] || { text: status, class: '' };
        statusEl.textContent = statusInfo.text;
        statusEl.className = 'phone-status ' + statusInfo.class;
    }
}

function updateCallStatus(status) {
    const statusEl = document.getElementById('call-status');
    if (statusEl) {
        statusEl.textContent = status;
    }
}

function showIncomingCallModal(callerName, callerUri, session) {
    // Create or show modal
    let modal = document.getElementById('incoming-call-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'incoming-call-modal';
        modal.className = 'call-modal incoming';
        modal.innerHTML = `
            <div class="call-modal-content">
                <div class="call-avatar">
                    <i class="fas fa-phone-volume fa-3x"></i>
                </div>
                <h3>Incoming Call</h3>
                <p id="caller-name" class="caller-name"></p>
                <p id="caller-uri" class="caller-uri"></p>
                <div class="call-actions">
                    <button class="btn btn-success btn-lg" onclick="answerCall()">
                        <i class="fas fa-phone"></i> Answer
                    </button>
                    <button class="btn btn-danger btn-lg" onclick="rejectCall()">
                        <i class="fas fa-phone-slash"></i> Decline
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('caller-name').textContent = callerName;
    document.getElementById('caller-uri').textContent = callerUri;
    modal.style.display = 'flex';
}

function hideIncomingCallModal() {
    const modal = document.getElementById('incoming-call-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showOutgoingCallUI(targetExtension) {
    showActiveCallUI();
    updateCallStatus('Calling ' + targetExtension + '...');
}

function showActiveCallUI() {
    let callUI = document.getElementById('active-call-ui');
    
    if (!callUI) {
        callUI = document.createElement('div');
        callUI.id = 'active-call-ui';
        callUI.className = 'active-call-panel';
        callUI.innerHTML = `
            <div class="call-info">
                <i class="fas fa-phone-alt"></i>
                <span id="call-status">Connected</span>
                <span id="call-timer">00:00</span>
            </div>
            <div class="call-controls">
                <button class="btn btn-icon" onclick="toggleMute()" id="mute-btn" title="Mute">
                    <i class="fas fa-microphone"></i>
                </button>
                <button class="btn btn-icon" onclick="toggleHold()" id="hold-btn" title="Hold">
                    <i class="fas fa-pause"></i>
                </button>
                <button class="btn btn-danger" onclick="hangupCall()" title="End Call">
                    <i class="fas fa-phone-slash"></i> End
                </button>
            </div>
        `;
        document.body.appendChild(callUI);
    }
    
    callUI.style.display = 'flex';
}

function hideActiveCallUI() {
    const callUI = document.getElementById('active-call-ui');
    if (callUI) {
        callUI.style.display = 'none';
    }
}

function updateMuteButton(isMuted) {
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.innerHTML = isMuted 
            ? '<i class="fas fa-microphone-slash"></i>' 
            : '<i class="fas fa-microphone"></i>';
        muteBtn.classList.toggle('active', isMuted);
    }
}

function startCallTimer() {
    callDuration = 0;
    callTimerInterval = setInterval(() => {
        callDuration++;
        const minutes = Math.floor(callDuration / 60).toString().padStart(2, '0');
        const seconds = (callDuration % 60).toString().padStart(2, '0');
        const timerEl = document.getElementById('call-timer');
        if (timerEl) {
            timerEl.textContent = `${minutes}:${seconds}`;
        }
    }, 1000);
}

function stopCallTimer() {
    if (callTimerInterval) {
        clearInterval(callTimerInterval);
        callTimerInterval = null;
    }
}

function playRingtone() {
    try {
        ringtoneAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp2bi4B1bGVlbnuGkZaSjoV9dnJwcnh/h42RkY6JhH57eHl7f4OIi42MiYWBfnt5eXt+goaJi4uJhoJ+e3l4eXt+goaIioqIhYF9enl4eHt+goWIiYmHhIF9enl4eHt+gYWHiYmHhIB9enl4eHt9gYSHiIiGg398enh4eHp9gYSGiIiGg398enh3eHp9gIOGh4eFgn97eXh4eXx/goWGh4aEgX56eHh4eXx/goSGhoaEgX56eHd4eXx+gYSFhoaDgH57eXh4eXt+gYOFhYWDgH57eXh4eXt+gIOEhYWDf3x6eXh4eXt+f4OEhYSCf3x6eHh4eXt9f4KDhISCfnt5eHh4eHt9f4GDg4OCfnt5eHd4eHp9f4GCg4KBfXt5eHd4eHp8foGCgoGAfXp5eHd3eHp8foCBgoGAfXp5eHd3eHp8fn+BgYF/fHp4d3d3eXt9fn+AgYB+fHp4d3d3eHt8fn+Af35+fHp4d3Z3eHp8fX5/f35+fHp4d3Z3eHp7fX5+fX5+fHl4dnZ2eHl7fH19fX19fHp4dnZ2d3l6fHx9fX18fHp4dnV2d3l6e3x8fHx8e3p4dnV1dnh5ent8e3t8e3p4dnV1dnd5ent7e3t7e3p3dnV0dXd4ent6e3t6enp3dnR0dXd4eXp6enp6enl3dnR0dHZ3eXl6enl6eXl2dnNzdHV3eHl5eXl5eXh2dXNzdHV2eHh5eXl4eHd1dHNzdHV2d3h4eHh4d3Z0dHNzdHV2d3d4eHd3dnV0c3NzdHV2d3d3d3d2dXRzc3J0dHV2d3Z3dnZ1dHRzc3N0dHV2dnZ2dnV0dHNycnNzdHV1dnV1dXR0c3Nyc3NzdHR1dXV1dHRzc3JycnNzdHR0dXR0dHNyc3JycnNzdHRzdHR0c3JycnJyc3NzdHRzdHNzc3JycXJyc3NzdHNzc3NycnJxcnJzc3NzdHNzc3JycnFxcnJzc3NzdHNzcnJxcXFxcnJyc3Nzc3NycnFxcXFxcnJyc3Nyc3JycXBwcXFxcnJyc3NycnJxcHBwcHFxcnJyc3JycXFwcHBwcXFxcnJyc3JxcXBwcHBxcXFxcnJycnFxcHBvb3BwcXFxcnJycXFwcHBvb3BwcHFxcXJxcXFwb29vb3BwcHFxcXFxcHBvb29vb3BwcHFxcXBwcG9vb29vcHBwcHFwcHBvb25ubm9vcHBwcHBwb29ubm5ub29vcHBwcG9vbm5ubm5vb3BwcHBvbm5tbW5ub29vb3Bvbm5tbW1tbm9vb29vbm5tbW1tbW5ub29vbm5tbGxsbW1ub29ubm5tbGxsbG1tb25ubm5tbGxsbGxtbW5ubm1tbGtrbGxsbW1tbW1tbGtrbGxsbG1tbW1tbGxramprbGxsbG1tbGxrampramprbGxsbGxramlqamtrbGxsbGtramlpaWpramprbGxramppampqa2trbGtramhpaWlpamtramtramlpZ2hpamprampramlpaGdoaGlpampqamlpaGdnZ2hpampqaWloZ2dnZ2doaWlpaWloZ2dnZmdnaGlpaWloZ2ZmZmZnaGhoaGhoZmZmZWZmZ2doaGhnZ2ZlZWVlZmdnZ2doZmZlZWVlZWZnZ2dnZmVlZGRlZWZmZ2dmZmVkZGRkZWVmZmZmZWVkZGRkZGVlZmZmZWVkZGNjZGRlZWVlZWRkY2NjY2RkZWVlZGRkY2NiY2NkZGRkZGRjY2JiYmNjZGRkZGRjYmJhYmJjY2NjY2NiYmFhYWJiY2NjY2JiYWFhYWFiYmNjYmJhYWFhYGFhYmJiYmJhYWBgYGBhYWJiYmFhYGBgYGBgYWFhYWFgYF9fX2BgYGFhYWFgX19fX19fYGBgYGBfX19eXl9fYGBgX19fXl5eXl9fX19fX15eXl5eXl5fX19fXl5eXV1dXl5eX19eXl5dXV1dXl5eXl5eXV1dXV1dXV5eXl5dXV1dXF1dXV5eXl1dXVxcXF1dXV1dXV1cXFxcXF1dXV1dXVxcXFtbXFxdXV1dXFxcW1tbW1xcXFxcXFtbW1tbW1xcXFxbW1tbWltbW1xcW1tbW1paWltbW1tbW1paWlpaWltbW1taWlpaWVpaWltbW1paWVlZWVpaWlpaWllZWVlZWVpaWlpZWVlZWFhZWVpaWVlZWVhYWFlZWVlZWVhYWFhYWFlZWVlYWFhYV1hYWFhZWVhYWFdXV1dYWFhYWFhXV1dXV1dXWFhYV1dXVlZXV1dXV1dXVlZWVlZXV1dXVlZWVlVWVlZXV1ZWVlZVVVVWVlZWVlVVVVVVVVZWVlZVVVVVVFVVVVVVVVVUVFRUVFRVVVVVVFRUVFRUVFRVVVRUVFRUU1RUVFRUVFRUVFRTU1NTVEQAAAAA');
        ringtoneAudio.loop = true;
        ringtoneAudio.play().catch(e => console.log('Could not play ringtone:', e));
    } catch (e) {
        console.log('Ringtone not available');
    }
}

function stopRingtone() {
    if (ringtoneAudio) {
        ringtoneAudio.pause();
        ringtoneAudio = null;
    }
}

// Export functions for global access
window.SIPPhone = {
    init: initializeSIP,
    call: makeCall,
    answer: answerCall,
    reject: rejectCall,
    hangup: hangupCall,
    hold: toggleHold,
    mute: toggleMute,
    dtmf: sendDTMF,
    disconnect: disconnectSIP,
    isRegistered: () => isRegistered,
    isInCall: () => currentCall !== null
};

// Auto-initialize when staff logs in (hook into existing login flow)
document.addEventListener('DOMContentLoaded', () => {
    // Add hidden audio element for remote audio
    if (!document.getElementById('remote-audio')) {
        const audio = document.createElement('audio');
        audio.id = 'remote-audio';
        audio.autoplay = true;
        audio.style.display = 'none';
        document.body.appendChild(audio);
    }
});

console.log('SIP Phone module loaded. Use SIPPhone.init(staffId, staffName, password) to initialize.');
