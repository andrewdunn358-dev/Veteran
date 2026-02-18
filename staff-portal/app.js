// Staff Portal - Radio Check Veterans Support
// For Counsellors and Peer Supporters

// State
let token = localStorage.getItem('staff_token');
let currentUser = JSON.parse(localStorage.getItem('staff_user') || 'null');
let myProfile = null;

// Real-time alert tracking
let knownAlertIds = new Set();
let alertPollingInterval = null;
let soundEnabled = localStorage.getItem('alert_sound') !== 'false';

// Alert sound (using Web Audio API for more reliable playback)
let audioContext = null;
function playAlertSound() {
    if (!soundEnabled) return;
    
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Create an urgent alert tone (three ascending beeps)
        var now = audioContext.currentTime;
        
        for (var i = 0; i < 3; i++) {
            var oscillator = audioContext.createOscillator();
            var gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800 + (i * 200); // 800Hz, 1000Hz, 1200Hz
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, now + (i * 0.15));
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.15) + 0.12);
            
            oscillator.start(now + (i * 0.15));
            oscillator.stop(now + (i * 0.15) + 0.12);
        }
    } catch (e) {
        console.log('Audio playback failed:', e);
    }
}

// Toggle sound
function toggleAlertSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('alert_sound', soundEnabled);
    updateSoundButton();
    if (soundEnabled) {
        playAlertSound(); // Play test sound
    }
}

function updateSoundButton() {
    var btn = document.getElementById('sound-toggle');
    if (btn) {
        btn.innerHTML = soundEnabled ? 
            '<i class="fas fa-volume-up"></i>' : 
            '<i class="fas fa-volume-mute"></i>';
        btn.title = soundEnabled ? 'Sound ON - Click to mute' : 'Sound OFF - Click to enable';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (token && currentUser) {
        initPortal();
    } else {
        showScreen('login-screen');
    }
});

// Show Screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(function(s) {
        s.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Show Notification
function showNotification(message, type) {
    type = type || 'success';
    var notif = document.getElementById('notification');
    notif.textContent = message;
    notif.className = 'notification ' + type;
    setTimeout(function() {
        notif.classList.add('hidden');
    }, 3000);
}

// API Call
async function apiCall(endpoint, options) {
    options = options || {};
    var headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    
    var response = await fetch(CONFIG.API_URL + '/api' + endpoint, {
        method: options.method || 'GET',
        headers: headers,
        body: options.body
    });
    
    var data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.detail || 'Request failed');
    }
    
    return data;
}

// Login
async function handleLogin(e) {
    e.preventDefault();
    
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var errorEl = document.getElementById('login-error');
    
    try {
        errorEl.classList.add('hidden');
        
        var response = await fetch(CONFIG.API_URL + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });
        
        var data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Invalid credentials');
        }
        
        // Check role - only allow counsellor, peer, or admin
        var role = data.user.role;
        if (!['counsellor', 'peer', 'admin'].includes(role)) {
            throw new Error('Access denied. This portal is for staff only.');
        }
        
        // Save auth
        token = data.access_token;
        currentUser = data.user;
        localStorage.setItem('staff_token', token);
        localStorage.setItem('staff_user', JSON.stringify(currentUser));
        
        initPortal();
        
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    }
    
    return false;
}

// Logout
function handleLogout() {
    token = null;
    currentUser = null;
    myProfile = null;
    localStorage.removeItem('staff_token');
    localStorage.removeItem('staff_user');
    showScreen('login-screen');
}

// Initialize Portal
async function initPortal() {
    showScreen('portal-screen');
    
    var role = currentUser.role;
    
    // Set header info
    document.getElementById('user-name').textContent = 'Welcome, ' + currentUser.name;
    document.getElementById('portal-title').textContent = 
        role === 'counsellor' ? 'Counsellor Portal' : 
        role === 'peer' ? 'Peer Support Portal' : 'Staff Portal';
    
    // Set role badge
    var badge = document.getElementById('user-role-badge');
    badge.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    badge.className = 'role-badge role-' + role;
    
    // Show/hide sections based on role
    document.getElementById('panic-section').style.display = 
        (role === 'counsellor' || role === 'admin') ? 'block' : 'none';
    document.getElementById('safeguarding-section').style.display = 
        (role === 'counsellor' || role === 'admin') ? 'block' : 'none';
    document.getElementById('panic-button-section').style.display = 
        role === 'peer' ? 'block' : 'none';
    
    // Load profile to get current status
    await loadMyProfile();
    
    // Load staff users for sharing
    await loadStaffUsers();
    
    // Load data
    loadCallbacks();
    loadNotes();
    if (role === 'counsellor' || role === 'admin') {
        loadPanicAlerts();
        loadSafeguardingAlerts(false); // Initial load, no sound
        loadLiveChats(); // Load live chat rooms
        startAlertPolling(); // Start real-time polling
        updateSoundButton(); // Update sound toggle button
        
        // Show live chat section
        document.getElementById('livechat-section').style.display = 'block';
    }
    
    // Auto-refresh every 30 seconds for callbacks/notes
    setInterval(function() {
        loadCallbacks();
        loadNotes();
        loadLiveChats(); // Also refresh live chats
        if (role === 'counsellor' || role === 'admin') {
            loadPanicAlerts();
            // Note: Safeguarding alerts are polled separately with sound support
        }
    }, 30000);
}

// Load My Profile
async function loadMyProfile() {
    try {
        var role = currentUser.role;
        var profiles;
        
        if (role === 'counsellor') {
            profiles = await apiCall('/counsellors');
            myProfile = profiles.find(function(p) { return p.user_id === currentUser.id; });
        } else if (role === 'peer') {
            profiles = await apiCall('/peer-supporters');
            myProfile = profiles.find(function(p) { return p.user_id === currentUser.id; });
        }
        
        if (myProfile) {
            updateStatusUI(myProfile.status);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Update Status UI
function updateStatusUI(status) {
    // Update buttons
    document.querySelectorAll('.status-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    var activeBtn = document.querySelector('.status-btn.' + status);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Update current status display
    var statusEl = document.getElementById('current-status');
    statusEl.textContent = status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
    statusEl.style.background = 
        status === 'available' ? 'var(--success-light)' :
        status === 'busy' ? 'var(--warning-light)' : 'var(--danger-light)';
    statusEl.style.color = 
        status === 'available' ? 'var(--success)' :
        status === 'busy' ? 'var(--warning)' : 'var(--danger)';
}

// Update My Status
async function updateMyStatus(newStatus) {
    try {
        if (!myProfile) {
            showNotification('Profile not found', 'error');
            return;
        }
        
        var role = currentUser.role;
        var endpoint = role === 'counsellor' 
            ? '/counsellors/' + myProfile.id + '/status'
            : '/peer-supporters/' + myProfile.id + '/status';
        
        await apiCall(endpoint, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        
        myProfile.status = newStatus;
        updateStatusUI(newStatus);
        showNotification('Status updated to ' + newStatus);
        
    } catch (error) {
        showNotification('Failed to update status: ' + error.message, 'error');
    }
}

// Load Callbacks
async function loadCallbacks() {
    try {
        var callbacks = await apiCall('/callbacks');
        allCallbacks = callbacks; // Store for notes dropdown
        var role = currentUser.role;
        var userId = currentUser.id;
        
        // Filter by type based on role
        var filtered = callbacks;
        if (role === 'peer') {
            filtered = callbacks.filter(function(c) { return c.request_type === 'peer'; });
        } else if (role === 'counsellor') {
            filtered = callbacks.filter(function(c) { return c.request_type === 'counsellor'; });
        }
        
        // Split into active and pending
        var myActive = filtered.filter(function(c) { 
            return c.assigned_to === userId && c.status === 'in_progress'; 
        });
        var pending = filtered.filter(function(c) { return c.status === 'pending'; });
        
        renderCallbacks('active-callbacks', myActive, true);
        renderCallbacks('pending-callbacks', pending, false);
        
        // Update counts
        document.getElementById('active-count').textContent = myActive.length || '';
        document.getElementById('pending-count').textContent = pending.length || '';
        
    } catch (error) {
        console.error('Error loading callbacks:', error);
    }
}

// Render Callbacks
function renderCallbacks(containerId, callbacks, isActive) {
    var container = document.getElementById(containerId);
    
    if (callbacks.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>' + 
            (isActive ? 'No active callbacks' : 'No pending callbacks') + '</p></div>';
        return;
    }
    
    container.innerHTML = callbacks.map(function(cb) {
        var actions = isActive 
            ? '<button class="btn btn-success" onclick="completeCallback(\'' + cb.id + '\')"><i class="fas fa-check"></i> Complete</button>' +
              '<button class="btn btn-secondary" onclick="releaseCallback(\'' + cb.id + '\')"><i class="fas fa-undo"></i> Release</button>'
            : '<button class="btn btn-primary" onclick="takeCallback(\'' + cb.id + '\')"><i class="fas fa-hand-paper"></i> Take Callback</button>';
        
        return '<div class="card">' +
            '<div class="card-header">' +
                '<span class="card-name">' + cb.name + '</span>' +
                '<span class="card-status ' + cb.status + '">' + cb.status.replace('_', ' ') + '</span>' +
            '</div>' +
            '<div class="card-phone"><i class="fas fa-phone"></i>' + cb.phone + '</div>' +
            '<div class="card-message">' + (cb.message || 'No message') + '</div>' +
            '<div class="card-time">' + new Date(cb.created_at).toLocaleString() + '</div>' +
            '<div class="card-actions">' + actions + '</div>' +
        '</div>';
    }).join('');
}

// Take Callback
async function takeCallback(id) {
    try {
        await apiCall('/callbacks/' + id + '/take', { method: 'PATCH' });
        showNotification('Callback assigned to you');
        loadCallbacks();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

// Complete Callback
async function completeCallback(id) {
    try {
        await apiCall('/callbacks/' + id + '/complete', { method: 'PATCH' });
        showNotification('Callback completed');
        loadCallbacks();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

// Release Callback
async function releaseCallback(id) {
    try {
        await apiCall('/callbacks/' + id + '/release', { method: 'PATCH' });
        showNotification('Callback released');
        loadCallbacks();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

// Load Panic Alerts (Counsellors)
async function loadPanicAlerts() {
    try {
        var alerts = await apiCall('/panic-alerts');
        var active = alerts.filter(function(a) { 
            return a.status === 'active' || a.status === 'acknowledged'; 
        });
        
        renderPanicAlerts(active);
        document.getElementById('panic-count').textContent = active.length || '';
        
    } catch (error) {
        console.error('Error loading panic alerts:', error);
    }
}

// Render Panic Alerts
function renderPanicAlerts(alerts) {
    var container = document.getElementById('panic-list');
    
    if (alerts.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No active alerts</p></div>';
        return;
    }
    
    container.innerHTML = alerts.map(function(alert) {
        var actions = '';
        if (alert.status === 'active') {
            actions = '<button class="btn btn-warning" onclick="acknowledgeAlert(\'' + alert.id + '\')"><i class="fas fa-hand-paper"></i> Acknowledge</button>';
        }
        actions += '<button class="btn btn-success" onclick="resolveAlert(\'' + alert.id + '\')"><i class="fas fa-check"></i> Resolve</button>';
        
        return '<div class="card alert-card">' +
            '<div class="card-header">' +
                '<span class="card-name">' + (alert.user_name || 'Peer Supporter') + '</span>' +
                '<span class="card-status ' + alert.status + '">' + alert.status + '</span>' +
            '</div>' +
            (alert.user_phone ? '<div class="card-phone"><i class="fas fa-phone"></i>' + alert.user_phone + '</div>' : '') +
            '<div class="card-message">' + (alert.message || 'Needs immediate assistance') + '</div>' +
            '<div class="card-time">' + new Date(alert.created_at).toLocaleString() + '</div>' +
            '<div class="card-actions">' + actions + '</div>' +
        '</div>';
    }).join('');
}

// Acknowledge Alert
async function acknowledgeAlert(id) {
    try {
        await apiCall('/panic-alerts/' + id + '/acknowledge', { method: 'PATCH' });
        showNotification('Alert acknowledged');
        loadPanicAlerts();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

// Resolve Alert
async function resolveAlert(id) {
    try {
        await apiCall('/panic-alerts/' + id + '/resolve', { method: 'PATCH' });
        showNotification('Alert resolved');
        loadPanicAlerts();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

// Trigger Panic (Peers)
async function triggerPanic() {
    var message = prompt('What do you need help with? (optional)');
    
    try {
        await fetch(CONFIG.API_URL + '/api/panic-alert', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                user_name: currentUser.name,
                user_phone: myProfile ? myProfile.phone : null,
                message: message || 'Peer supporter needs counsellor assistance'
            })
        });
        
        showNotification('Alert sent! A counsellor has been notified.');
        
    } catch (error) {
        showNotification('Failed to send alert', 'error');
    }
}

// ============ SAFEGUARDING ALERTS ============

// Load Safeguarding Alerts (Counsellors/Admins)
async function loadSafeguardingAlerts(isPolling) {
    try {
        var alerts = await apiCall('/safeguarding-alerts');
        var active = alerts.filter(function(a) { 
            return a.status === 'active' || a.status === 'acknowledged'; 
        });
        
        // Check for new alerts (only during polling)
        if (isPolling) {
            var newAlerts = active.filter(function(a) {
                return a.status === 'active' && !knownAlertIds.has(a.id);
            });
            
            if (newAlerts.length > 0) {
                // Play sound for new alerts
                playAlertSound();
                
                // Show notification banner
                showNewAlertBanner(newAlerts.length);
                
                // Highlight new alert cards
                newAlerts.forEach(function(a) {
                    knownAlertIds.add(a.id);
                });
            }
        } else {
            // Initial load - just track IDs without alerting
            active.forEach(function(a) {
                knownAlertIds.add(a.id);
            });
        }
        
        renderSafeguardingAlerts(active);
        document.getElementById('safeguarding-count').textContent = active.length || '';
        
        // Add pulsing effect if there are active alerts
        var section = document.getElementById('safeguarding-section');
        if (active.filter(function(a) { return a.status === 'active'; }).length > 0) {
            section.classList.add('has-active');
        } else {
            section.classList.remove('has-active');
        }
        
    } catch (error) {
        console.error('Error loading safeguarding alerts:', error);
    }
}

// Show new alert notification banner
function showNewAlertBanner(count) {
    var banner = document.getElementById('new-alert-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'new-alert-banner';
        banner.className = 'new-alert-banner';
        document.body.appendChild(banner);
    }
    
    banner.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + count + ' NEW SAFEGUARDING ALERT' + (count > 1 ? 'S' : '') + ' <button onclick="dismissAlertBanner()">View</button>';
    banner.classList.add('show');
    
    // Auto-dismiss after 10 seconds
    setTimeout(function() {
        banner.classList.remove('show');
    }, 10000);
}

function dismissAlertBanner() {
    var banner = document.getElementById('new-alert-banner');
    if (banner) {
        banner.classList.remove('show');
    }
    // Switch to safeguarding tab
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.section').forEach(function(s) { s.style.display = 'none'; });
    document.querySelector('.tab[data-section="safeguarding"]').classList.add('active');
    document.getElementById('safeguarding-section').style.display = 'block';
}

// Start/stop alert polling
function startAlertPolling() {
    if (alertPollingInterval) return;
    alertPollingInterval = setInterval(function() {
        loadSafeguardingAlerts(true);
    }, 30000); // Poll every 30 seconds
}

function stopAlertPolling() {
    if (alertPollingInterval) {
        clearInterval(alertPollingInterval);
        alertPollingInterval = null;
    }
}

// Render Safeguarding Alerts
function renderSafeguardingAlerts(alerts) {
    var container = document.getElementById('safeguarding-list');
    
    if (alerts.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-shield-alt"></i><p>No active safeguarding alerts</p></div>';
        return;
    }
    
    container.innerHTML = alerts.map(function(alert) {
        var actions = '';
        if (alert.status === 'active') {
            actions = '<button class="btn btn-warning" onclick="acknowledgeSafeguardingAlert(\'' + alert.id + '\')"><i class="fas fa-hand-paper"></i> Acknowledge</button>';
        }
        actions += '<button class="btn btn-success" onclick="resolveSafeguardingAlert(\'' + alert.id + '\')"><i class="fas fa-check"></i> Resolve</button>';
        
        var characterIcon = alert.character === 'tommy' ? 'fa-user' : 'fa-user-circle';
        var characterName = alert.character === 'tommy' ? 'Tommy' : 'Doris';
        
        // Risk level styling
        var riskLevel = alert.risk_level || 'AMBER';
        var riskScore = alert.risk_score || 0;
        var riskClass = riskLevel.toLowerCase();
        var riskBadgeColor = riskLevel === 'RED' ? '#dc2626' : (riskLevel === 'AMBER' ? '#f59e0b' : '#eab308');
        
        // Format indicators
        var indicatorsHtml = '';
        if (alert.triggered_indicators && alert.triggered_indicators.length > 0) {
            indicatorsHtml = '<div class="card-indicators"><i class="fas fa-exclamation-circle"></i> ' + alert.triggered_indicators.slice(0, 5).join(', ') + '</div>';
        }
        
        // Contact captured status
        var contactStatus = alert.contact_captured ? 
            '<div class="contact-captured"><i class="fas fa-check-circle" style="color:#22c55e"></i> Contact details captured</div>' :
            '<div class="contact-not-captured"><i class="fas fa-exclamation-triangle" style="color:#f59e0b"></i> NO CONTACT DETAILS - Anonymous user</div>';
        
        // Geolocation info with map
        var locationHtml = '';
        if (alert.geo_city || alert.geo_country) {
            var locationParts = [];
            if (alert.geo_city) locationParts.push(alert.geo_city);
            if (alert.geo_region) locationParts.push(alert.geo_region);
            if (alert.geo_country) locationParts.push(alert.geo_country);
            locationHtml = '<div class="location-info"><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ' + locationParts.join(', ') + '</div>';
            if (alert.geo_isp) {
                locationHtml += '<div class="location-info"><i class="fas fa-wifi"></i> <strong>ISP:</strong> ' + escapeHtml(alert.geo_isp) + '</div>';
            }
            if (alert.geo_timezone) {
                locationHtml += '<div class="location-info"><i class="fas fa-clock"></i> <strong>Timezone:</strong> ' + alert.geo_timezone + '</div>';
            }
            // Add map if we have coordinates
            if (alert.geo_lat && alert.geo_lon) {
                locationHtml += '<div class="location-map" id="map-' + alert.id + '" data-lat="' + alert.geo_lat + '" data-lon="' + alert.geo_lon + '" data-city="' + escapeHtml(alert.geo_city || 'Unknown') + '"></div>';
            }
        }
        
        // Client tracking info
        var trackingInfo = '';
        if (alert.client_ip || alert.user_agent || locationHtml) {
            trackingInfo = '<div class="tracking-info">' +
                '<div class="tracking-header"><i class="fas fa-fingerprint"></i> Tracking Information</div>' +
                locationHtml +
                (alert.client_ip ? '<div class="tracking-item"><strong>IP Address:</strong> ' + alert.client_ip + '</div>' : '') +
                (alert.user_agent ? '<div class="tracking-item"><strong>Device:</strong> ' + escapeHtml(alert.user_agent.substring(0, 100)) + (alert.user_agent.length > 100 ? '...' : '') + '</div>' : '') +
            '</div>';
        }
        
        // Conversation history preview
        var historyHtml = '';
        if (alert.conversation_history && alert.conversation_history.length > 0) {
            var lastMessages = alert.conversation_history.slice(-6);
            historyHtml = '<div class="conversation-history">' +
                '<div class="history-header" onclick="toggleHistory(\'' + alert.id + '\')">' +
                    '<i class="fas fa-comments"></i> View Conversation History (' + alert.conversation_history.length + ' messages)' +
                    '<i class="fas fa-chevron-down"></i>' +
                '</div>' +
                '<div class="history-content" id="history-' + alert.id + '" style="display:none;">' +
                lastMessages.map(function(msg) {
                    var isUser = msg.role === 'user';
                    return '<div class="history-message ' + (isUser ? 'user' : 'assistant') + '">' +
                        '<span class="msg-role">' + (isUser ? 'User' : characterName) + ':</span> ' +
                        escapeHtml(msg.content.substring(0, 200)) + (msg.content.length > 200 ? '...' : '') +
                    '</div>';
                }).join('') +
                '</div>' +
            '</div>';
        }
        
        return '<div class="card safeguarding-card ' + alert.status + ' risk-' + riskClass + '" data-alert-id="' + alert.id + '">' +
            '<div class="card-header">' +
                '<span class="card-name"><i class="fas ' + characterIcon + '"></i> Chat with ' + characterName + '</span>' +
                '<span class="risk-badge" style="background-color:' + riskBadgeColor + '">' + riskLevel + ' (' + riskScore + ')</span>' +
            '</div>' +
            contactStatus +
            '<div class="card-session"><i class="fas fa-fingerprint"></i> Session: ' + alert.session_id + '</div>' +
            indicatorsHtml +
            '<div class="card-trigger">' +
                '<label><i class="fas fa-quote-left"></i> Triggering Message:</label>' +
                '<div class="trigger-message">"' + escapeHtml(alert.triggering_message) + '"</div>' +
            '</div>' +
            trackingInfo +
            historyHtml +
            '<div class="card-time"><i class="fas fa-clock"></i> ' + new Date(alert.created_at).toLocaleString() + '</div>' +
            (alert.acknowledged_by ? '<div class="card-ack"><i class="fas fa-user-check"></i> Acknowledged by ' + alert.acknowledged_by + '</div>' : '') +
            '<div class="card-actions">' + actions + '</div>' +
        '</div>';
    }).join('');
    
    // Initialize maps after rendering
    setTimeout(initializeAlertMaps, 100);
}

// Toggle conversation history visibility
function toggleHistory(alertId) {
    var historyEl = document.getElementById('history-' + alertId);
    if (historyEl) {
        historyEl.style.display = historyEl.style.display === 'none' ? 'block' : 'none';
    }
}

// Initialize maps for all alert cards
var alertMaps = {};
function initializeAlertMaps() {
    document.querySelectorAll('.location-map').forEach(function(mapDiv) {
        var alertId = mapDiv.id.replace('map-', '');
        var lat = parseFloat(mapDiv.dataset.lat);
        var lon = parseFloat(mapDiv.dataset.lon);
        var city = mapDiv.dataset.city;
        
        if (lat && lon && !alertMaps[alertId]) {
            var map = L.map(mapDiv.id, {
                zoomControl: true,
                scrollWheelZoom: false
            }).setView([lat, lon], 10);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);
            
            L.marker([lat, lon])
                .addTo(map)
                .bindPopup('<strong>' + city + '</strong><br>Approximate location')
                .openPopup();
            
            alertMaps[alertId] = map;
        }
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Acknowledge Safeguarding Alert
async function acknowledgeSafeguardingAlert(id) {
    try {
        await apiCall('/safeguarding-alerts/' + id + '/acknowledge', { method: 'PATCH' });
        showNotification('Safeguarding alert acknowledged');
        loadSafeguardingAlerts();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

// Resolve Safeguarding Alert
async function resolveSafeguardingAlert(id) {
    var notes = prompt('Resolution notes (optional - what action was taken?):');
    
    try {
        var url = '/safeguarding-alerts/' + id + '/resolve';
        if (notes) {
            url += '?notes=' + encodeURIComponent(notes);
        }
        await apiCall(url, { method: 'PATCH' });
        showNotification('Safeguarding alert resolved');
        loadSafeguardingAlerts();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

// ============ LIVE CHAT FUNCTIONALITY ============

var activeLiveChats = [];
var currentChatRoom = null;
var chatPollingInterval = null;

// Load Live Chats
async function loadLiveChats() {
    try {
        var rooms = await apiCall('/live-chat/rooms');
        activeLiveChats = rooms.filter(function(r) { return r.status === 'active'; });
        renderLiveChats(activeLiveChats);
        document.getElementById('livechat-count').textContent = activeLiveChats.length || '';
    } catch (error) {
        console.error('Error loading live chats:', error);
    }
}

// Render Live Chats
function renderLiveChats(rooms) {
    var container = document.getElementById('livechat-list');
    
    if (rooms.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>No active live chats</p><span>When users request live support, they will appear here</span></div>';
        return;
    }
    
    container.innerHTML = rooms.map(function(room) {
        var staffType = room.staff_type === 'counsellor' ? 'Counsellor' : 'Peer';
        var messageCount = room.messages ? room.messages.length : 0;
        var lastMessage = room.messages && room.messages.length > 0 ? 
            room.messages[room.messages.length - 1] : null;
        var waitingTime = getWaitingTime(room.created_at);
        
        return '<div class="card livechat-card" data-room-id="' + room.id + '">' +
            '<div class="card-header">' +
                '<span class="card-name"><i class="fas fa-comment-dots"></i> Live Chat Request</span>' +
                '<span class="badge primary">' + staffType + ' Request</span>' +
            '</div>' +
            '<div class="livechat-meta">' +
                '<span><i class="fas fa-clock"></i> Waiting: ' + waitingTime + '</span>' +
                '<span><i class="fas fa-comments"></i> ' + messageCount + ' messages</span>' +
            '</div>' +
            (room.safeguarding_alert_id ? 
                '<div class="livechat-safeguarding"><i class="fas fa-shield-alt"></i> Linked to Safeguarding Alert</div>' : '') +
            (lastMessage ? 
                '<div class="livechat-preview">' +
                    '<label>Latest message:</label>' +
                    '<div class="preview-text">"' + escapeHtml(lastMessage.text.substring(0, 100)) + (lastMessage.text.length > 100 ? '...' : '') + '"</div>' +
                '</div>' : 
                '<div class="livechat-preview"><label>No messages yet - user just connected</label></div>') +
            '<div class="card-time"><i class="fas fa-calendar"></i> Started: ' + new Date(room.created_at).toLocaleString() + '</div>' +
            '<div class="card-actions">' +
                '<button class="btn btn-primary" onclick="joinLiveChat(\'' + room.id + '\')">' +
                    '<i class="fas fa-headset"></i> Join Chat' +
                '</button>' +
            '</div>' +
        '</div>';
    }).join('');
}

// Get waiting time string
function getWaitingTime(createdAt) {
    var created = new Date(createdAt);
    var now = new Date();
    var diff = Math.floor((now - created) / 1000); // seconds
    
    if (diff < 60) return diff + ' seconds';
    if (diff < 3600) return Math.floor(diff / 60) + ' minutes';
    return Math.floor(diff / 3600) + ' hours';
}

// Join Live Chat
async function joinLiveChat(roomId) {
    currentChatRoom = roomId;
    showLiveChatModal(roomId);
}

// Show Live Chat Modal
async function showLiveChatModal(roomId) {
    // Get room messages
    try {
        var response = await apiCall('/live-chat/rooms/' + roomId + '/messages');
        var messages = response.messages || [];
        
        // Create modal HTML
        var modalHtml = '<div class="livechat-modal" id="livechat-modal">' +
            '<div class="livechat-modal-content">' +
                '<div class="livechat-modal-header">' +
                    '<h3><i class="fas fa-headset"></i> Live Chat Support</h3>' +
                    '<button class="btn btn-icon" onclick="closeLiveChatModal()"><i class="fas fa-times"></i></button>' +
                '</div>' +
                '<div class="livechat-messages" id="livechat-messages">' +
                    messages.map(function(msg) {
                        var isStaff = msg.sender === 'staff';
                        return '<div class="chat-message ' + (isStaff ? 'staff' : 'user') + '">' +
                            '<span class="msg-sender">' + (isStaff ? 'You' : 'User') + '</span>' +
                            '<span class="msg-text">' + escapeHtml(msg.text) + '</span>' +
                            '<span class="msg-time">' + new Date(msg.timestamp).toLocaleTimeString() + '</span>' +
                        '</div>';
                    }).join('') +
                '</div>' +
                '<div class="livechat-input">' +
                    '<input type="text" id="livechat-input" placeholder="Type your message..." onkeypress="handleChatKeypress(event)">' +
                    '<button class="btn btn-primary" onclick="sendChatMessage()">' +
                        '<i class="fas fa-paper-plane"></i>' +
                    '</button>' +
                '</div>' +
                '<div class="livechat-actions">' +
                    '<button class="btn btn-warning" onclick="endLiveChat(\'' + roomId + '\')">' +
                        '<i class="fas fa-phone-slash"></i> End Chat' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>';
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Start polling for new messages
        startChatPolling(roomId);
        
        // Focus input
        document.getElementById('livechat-input').focus();
        
        // Scroll to bottom
        var messagesDiv = document.getElementById('livechat-messages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
    } catch (error) {
        console.error('Error opening chat:', error);
        showNotification('Failed to open chat', 'error');
    }
}

// Handle Enter key in chat input
function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Send Chat Message
async function sendChatMessage() {
    var input = document.getElementById('livechat-input');
    var text = input.value.trim();
    
    if (!text || !currentChatRoom) return;
    
    try {
        await apiCall('/live-chat/rooms/' + currentChatRoom + '/messages', {
            method: 'POST',
            body: JSON.stringify({ text: text, sender: 'staff' })
        });
        
        input.value = '';
        
        // Add message to UI immediately
        var messagesDiv = document.getElementById('livechat-messages');
        messagesDiv.innerHTML += '<div class="chat-message staff">' +
            '<span class="msg-sender">You</span>' +
            '<span class="msg-text">' + escapeHtml(text) + '</span>' +
            '<span class="msg-time">' + new Date().toLocaleTimeString() + '</span>' +
        '</div>';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Failed to send message', 'error');
    }
}

// Start polling for new messages
function startChatPolling(roomId) {
    chatPollingInterval = setInterval(async function() {
        try {
            var response = await apiCall('/live-chat/rooms/' + roomId + '/messages');
            updateChatMessages(response.messages || []);
        } catch (error) {
            console.log('Chat polling error:', error);
        }
    }, 3000);
}

// Update chat messages in modal
function updateChatMessages(messages) {
    var messagesDiv = document.getElementById('livechat-messages');
    if (!messagesDiv) return;
    
    messagesDiv.innerHTML = messages.map(function(msg) {
        var isStaff = msg.sender === 'staff';
        return '<div class="chat-message ' + (isStaff ? 'staff' : 'user') + '">' +
            '<span class="msg-sender">' + (isStaff ? 'You' : 'User') + '</span>' +
            '<span class="msg-text">' + escapeHtml(msg.text) + '</span>' +
            '<span class="msg-time">' + new Date(msg.timestamp).toLocaleTimeString() + '</span>' +
        '</div>';
    }).join('');
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Close Live Chat Modal
function closeLiveChatModal() {
    if (chatPollingInterval) {
        clearInterval(chatPollingInterval);
        chatPollingInterval = null;
    }
    currentChatRoom = null;
    
    var modal = document.getElementById('livechat-modal');
    if (modal) {
        modal.remove();
    }
}

// End Live Chat
async function endLiveChat(roomId) {
    if (!confirm('Are you sure you want to end this chat?')) return;
    
    try {
        await apiCall('/live-chat/rooms/' + roomId + '/end', { method: 'POST' });
        closeLiveChatModal();
        loadLiveChats();
        showNotification('Chat ended successfully', 'success');
    } catch (error) {
        console.error('Error ending chat:', error);
        showNotification('Failed to end chat', 'error');
    }
}

// ============ NOTES FUNCTIONALITY ============

var staffUsers = [];
var allCallbacks = [];
var currentNotesTab = 'my';
var editingNoteId = null;

// Load Notes
async function loadNotes() {
    try {
        var notes = await apiCall('/notes?include_shared=true');
        var myNotes = notes.filter(function(n) { return n.author_id === currentUser.id; });
        var sharedNotes = notes.filter(function(n) { 
            return n.author_id !== currentUser.id && 
                   (n.shared_with.includes(currentUser.id) || !n.is_private);
        });
        
        // For admin, show all notes in "shared" tab
        if (currentUser.role === 'admin') {
            sharedNotes = notes.filter(function(n) { return n.author_id !== currentUser.id; });
        }
        
        document.getElementById('notes-count').textContent = myNotes.length || '';
        
        if (currentNotesTab === 'my') {
            renderNotes(myNotes, false);
        } else {
            renderNotes(sharedNotes, true);
        }
    } catch (error) {
        console.error('Error loading notes:', error);
    }
}

// Render Notes
function renderNotes(notes, isSharedTab) {
    var container = document.getElementById('notes-list');
    
    if (notes.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-sticky-note"></i><p>' + 
            (isSharedTab ? 'No notes shared with you' : 'No notes yet. Create one!') + '</p></div>';
        return;
    }
    
    container.innerHTML = notes.map(function(note) {
        var isOwner = note.author_id === currentUser.id;
        var cardClass = 'card note-card' + (note.shared_with.length > 0 || !note.is_private ? ' shared' : '');
        
        var badgeHtml = note.is_private 
            ? '<span class="note-badge private"><i class="fas fa-lock"></i> Private</span>'
            : '<span class="note-badge shared"><i class="fas fa-share"></i> Shared</span>';
        
        var callbackInfo = '';
        if (note.callback_id) {
            var cb = allCallbacks.find(function(c) { return c.id === note.callback_id; });
            if (cb) {
                callbackInfo = '<span><i class="fas fa-phone"></i> Linked to: ' + cb.name + '</span>';
            }
        }
        
        var actions = '';
        if (isOwner || currentUser.role === 'admin') {
            actions = '<div class="card-actions">' +
                '<button class="btn btn-small btn-secondary" onclick="editNote(\'' + note.id + '\')"><i class="fas fa-edit"></i> Edit</button>' +
                '<button class="btn btn-small btn-danger" onclick="deleteNote(\'' + note.id + '\')"><i class="fas fa-trash"></i> Delete</button>' +
                '</div>';
        }
        
        return '<div class="' + cardClass + '">' +
            '<div class="card-header">' +
                '<span class="card-name">' + note.title + '</span>' +
                badgeHtml +
            '</div>' +
            '<div class="card-message">' + note.content.replace(/\n/g, '<br>') + '</div>' +
            '<div class="note-meta">' +
                '<span><i class="fas fa-user"></i> ' + note.author_name + '</span>' +
                '<span><i class="fas fa-clock"></i> ' + new Date(note.created_at).toLocaleString() + '</span>' +
                callbackInfo +
            '</div>' +
            actions +
        '</div>';
    }).join('');
}

// Switch Notes Tab
function switchNotesTab(tab) {
    currentNotesTab = tab;
    document.querySelectorAll('.notes-tab').forEach(function(t) {
        t.classList.remove('active');
    });
    document.querySelector('.notes-tab[data-tab="' + tab + '"]').classList.add('active');
    loadNotes();
}

// Load Staff Users for sharing dropdown
async function loadStaffUsers() {
    try {
        staffUsers = await apiCall('/staff-users');
    } catch (error) {
        console.error('Error loading staff users:', error);
    }
}

// Open Note Modal
function openNoteModal(noteId) {
    editingNoteId = noteId || null;
    
    // Populate callbacks dropdown
    var callbackSelect = document.getElementById('note-callback');
    callbackSelect.innerHTML = '<option value="">None</option>' + 
        allCallbacks.map(function(cb) {
            return '<option value="' + cb.id + '">' + cb.name + ' - ' + cb.phone + '</option>';
        }).join('');
    
    // Populate share dropdown (exclude current user)
    var shareSelect = document.getElementById('note-share');
    shareSelect.innerHTML = staffUsers
        .filter(function(u) { return u.id !== currentUser.id; })
        .map(function(u) {
            return '<option value="' + u.id + '">' + u.name + ' (' + u.role + ')</option>';
        }).join('');
    
    if (noteId) {
        // Edit mode - fetch note and populate form
        document.getElementById('note-modal-title').innerHTML = '<i class="fas fa-edit"></i> Edit Note';
        apiCall('/notes/' + noteId).then(function(note) {
            document.getElementById('note-title').value = note.title;
            document.getElementById('note-content').value = note.content;
            document.getElementById('note-callback').value = note.callback_id || '';
            document.getElementById('note-private').checked = note.is_private;
            toggleShareGroup();
            
            // Select shared users
            if (note.shared_with && note.shared_with.length > 0) {
                var options = shareSelect.options;
                for (var i = 0; i < options.length; i++) {
                    if (note.shared_with.includes(options[i].value)) {
                        options[i].selected = true;
                    }
                }
            }
        });
    } else {
        // Create mode - clear form
        document.getElementById('note-modal-title').innerHTML = '<i class="fas fa-sticky-note"></i> New Note';
        document.getElementById('note-title').value = '';
        document.getElementById('note-content').value = '';
        document.getElementById('note-callback').value = '';
        document.getElementById('note-private').checked = true;
        toggleShareGroup();
    }
    
    document.getElementById('note-modal').classList.remove('hidden');
}

// Close Note Modal
function closeNoteModal() {
    document.getElementById('note-modal').classList.add('hidden');
    editingNoteId = null;
}

// Toggle Share Group visibility
function toggleShareGroup() {
    var isPrivate = document.getElementById('note-private').checked;
    document.getElementById('share-group').style.display = isPrivate ? 'none' : 'block';
}

// Save Note
async function saveNote() {
    var title = document.getElementById('note-title').value.trim();
    var content = document.getElementById('note-content').value.trim();
    var callbackId = document.getElementById('note-callback').value || null;
    var isPrivate = document.getElementById('note-private').checked;
    
    // Get selected users to share with
    var sharedWith = [];
    if (!isPrivate) {
        var shareSelect = document.getElementById('note-share');
        for (var i = 0; i < shareSelect.options.length; i++) {
            if (shareSelect.options[i].selected) {
                sharedWith.push(shareSelect.options[i].value);
            }
        }
    }
    
    if (!title || !content) {
        showNotification('Please enter title and content', 'error');
        return;
    }
    
    try {
        if (editingNoteId) {
            // Update existing note
            await apiCall('/notes/' + editingNoteId, {
                method: 'PATCH',
                body: JSON.stringify({
                    title: title,
                    content: content,
                    is_private: isPrivate,
                    shared_with: sharedWith
                })
            });
            showNotification('Note updated');
        } else {
            // Create new note
            await apiCall('/notes', {
                method: 'POST',
                body: JSON.stringify({
                    title: title,
                    content: content,
                    callback_id: callbackId,
                    is_private: isPrivate,
                    shared_with: sharedWith
                })
            });
            showNotification('Note created');
        }
        
        closeNoteModal();
        loadNotes();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

// Edit Note
function editNote(noteId) {
    openNoteModal(noteId);
}

// Delete Note
async function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        await apiCall('/notes/' + noteId, { method: 'DELETE' });
        showNotification('Note deleted');
        loadNotes();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

// Setup private checkbox listener
document.addEventListener('DOMContentLoaded', function() {
    var privateCheckbox = document.getElementById('note-private');
    if (privateCheckbox) {
        privateCheckbox.addEventListener('change', toggleShareGroup);
    }
});
