// Veterans Support Admin Portal - Minimal Working Version
// Configuration
var CONFIG = window.CONFIG || { API_URL: 'https://veterans-support-api.onrender.com' };

// State
var token = localStorage.getItem('auth_token');
var currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');

// API Helper
async function apiCall(endpoint, options) {
    options = options || {};
    var headers = {
        'Content-Type': 'application/json'
    };
    if (options.headers) {
        for (var key in options.headers) {
            headers[key] = options.headers[key];
        }
    }
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    
    var response = await fetch(CONFIG.API_URL + '/api' + endpoint, {
        method: options.method || 'GET',
        headers: headers,
        body: options.body
    });
    
    if (!response.ok) {
        var error = await response.json();
        throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
}

// Show/Hide Screens
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(function(s) {
        s.style.display = 'none';
    });
    var screen = document.getElementById(screenId);
    if (screen) {
        screen.style.display = 'block';
    }
}

// Switch Tabs
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(function(content) {
        content.classList.remove('active');
    });
    
    var tabBtn = document.querySelector('[data-tab="' + tabId + '"]');
    var tabContent = document.getElementById(tabId + '-tab');
    
    if (tabBtn) tabBtn.classList.add('active');
    if (tabContent) tabContent.classList.add('active');
}

// Notification
function showNotification(message, type) {
    type = type || 'success';
    alert((type === 'error' ? 'Error: ' : '') + message);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (token && currentUser) {
        showScreen('dashboard-screen');
        document.getElementById('user-name').textContent = 'Welcome, ' + currentUser.name;
        setupRoleBasedUI();
        loadAllData();
    } else {
        showScreen('login-screen');
    }
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            switchTab(btn.dataset.tab);
        });
    });
});

// Login
async function handleLogin(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var errorEl = document.getElementById('login-error');
    
    if (!email || !password) {
        errorEl.textContent = 'Please enter email and password';
        errorEl.classList.remove('hidden');
        return false;
    }
    
    try {
        errorEl.classList.add('hidden');
        
        var response = await fetch(CONFIG.API_URL + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });
        
        var data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Invalid email or password');
        }
        
        if (!['admin', 'counsellor', 'peer'].includes(data.user.role)) {
            throw new Error('Access denied. Staff accounts only.');
        }
        
        token = data.access_token;
        currentUser = data.user;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        
        document.getElementById('user-name').textContent = 'Welcome, ' + currentUser.name;
        setupRoleBasedUI();
        showScreen('dashboard-screen');
        loadAllData();
        
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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    showScreen('login-screen');
}

// Role-based UI
function setupRoleBasedUI() {
    var role = currentUser ? currentUser.role : null;
    var isAdmin = role === 'admin';
    var isCounsellor = role === 'counsellor';
    var isPeer = role === 'peer';
    
    // Hide admin tabs for non-admins
    var adminOnlyTabs = ['counsellors-tab-btn', 'peers-tab-btn', 'orgs-tab-btn', 'resources-tab-btn', 'users-tab-btn', 'cms-tab-btn', 'settings-tab-btn'];
    adminOnlyTabs.forEach(function(tabId) {
        var tab = document.getElementById(tabId);
        if (tab) {
            tab.style.display = isAdmin ? '' : 'none';
        }
    });
    
    // Show My Portal tab for counsellors and peers
    var myPortalTab = document.getElementById('myportal-tab-btn');
    if (myPortalTab) {
        myPortalTab.style.display = (isCounsellor || isPeer) ? '' : 'none';
    }
    
    // Set portal title
    var portalTitle = document.getElementById('portal-title');
    if (portalTitle) {
        if (isCounsellor) portalTitle.textContent = 'Counsellor Portal';
        else if (isPeer) portalTitle.textContent = 'Peer Support Portal';
    }
    
    // Show panic alerts for counsellors
    var panicAlertsSection = document.getElementById('panic-alerts-section');
    if (panicAlertsSection) {
        panicAlertsSection.style.display = isCounsellor ? '' : 'none';
    }
    
    // Show panic button for peers
    var panicButtonSection = document.getElementById('panic-button-section');
    if (panicButtonSection) {
        panicButtonSection.style.display = isPeer ? '' : 'none';
    }
    
    // Switch to My Portal for counsellors/peers
    if (isCounsellor || isPeer) {
        switchTab('myportal');
        loadPortalData();
    } else {
        switchTab('counsellors');
    }
}

// Load Portal Data
async function loadPortalData() {
    try {
        var role = currentUser ? currentUser.role : null;
        
        var callbacks = await apiCall('/callbacks');
        renderCallbacks(callbacks);
        
        if (role === 'counsellor') {
            var alerts = await apiCall('/panic-alerts');
            renderPanicAlerts(alerts);
        }
    } catch (error) {
        console.error('Error loading portal data:', error);
    }
}

// Render Panic Alerts
function renderPanicAlerts(alerts) {
    var activeAlerts = alerts.filter(function(a) { return a.status === 'active' || a.status === 'acknowledged'; });
    var container = document.getElementById('panic-alerts-list');
    var section = document.getElementById('panic-alerts-section');
    var countBadge = document.getElementById('alert-count');
    
    if (!container) return;
    
    if (countBadge) {
        countBadge.textContent = activeAlerts.length > 0 ? activeAlerts.length : '';
    }
    
    if (activeAlerts.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No active alerts</p></div>';
        return;
    }
    
    container.innerHTML = activeAlerts.map(function(alert) {
        return '<div class="alert-card">' +
            '<div class="alert-card-header"><span class="alert-name">' + (alert.user_name || 'Peer Supporter') + '</span>' +
            '<span class="alert-status ' + alert.status + '">' + alert.status + '</span></div>' +
            (alert.user_phone ? '<div class="alert-phone"><i class="fas fa-phone"></i> ' + alert.user_phone + '</div>' : '') +
            '<div class="alert-message">' + (alert.message || 'Needs assistance') + '</div>' +
            '<div class="alert-time">' + new Date(alert.created_at).toLocaleString() + '</div>' +
            '<div class="alert-actions">' +
            (alert.status === 'active' ? '<button class="btn btn-warning" onclick="acknowledgeAlert(\'' + alert.id + '\')"><i class="fas fa-hand-paper"></i> Acknowledge</button>' : '') +
            '<button class="btn btn-success" onclick="resolveAlert(\'' + alert.id + '\')"><i class="fas fa-check"></i> Resolve</button>' +
            '</div></div>';
    }).join('');
}

// Render Callbacks
function renderCallbacks(callbacks) {
    var userId = currentUser ? currentUser.id : null;
    var role = currentUser ? currentUser.role : null;
    
    var filtered = callbacks;
    if (role === 'peer') filtered = callbacks.filter(function(c) { return c.request_type === 'peer'; });
    else if (role === 'counsellor') filtered = callbacks.filter(function(c) { return c.request_type === 'counsellor'; });
    
    var myCallbacks = filtered.filter(function(c) { return c.assigned_to === userId && c.status === 'in_progress'; });
    var pendingCallbacks = filtered.filter(function(c) { return c.status === 'pending'; });
    
    var myContainer = document.getElementById('my-callbacks-list');
    var pendingContainer = document.getElementById('pending-callbacks-list');
    var pendingCount = document.getElementById('pending-count');
    
    if (myContainer) {
        if (myCallbacks.length === 0) {
            myContainer.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No active callbacks</p></div>';
        } else {
            myContainer.innerHTML = myCallbacks.map(function(cb) {
                return '<div class="callback-card">' +
                    '<div class="callback-header"><span class="callback-name">' + cb.name + '</span>' +
                    '<span class="callback-status in_progress">In Progress</span></div>' +
                    '<div class="callback-phone"><i class="fas fa-phone"></i> ' + cb.phone + '</div>' +
                    '<div class="callback-message">' + (cb.message || 'No message') + '</div>' +
                    '<div class="callback-actions">' +
                    '<button class="btn btn-success" onclick="completeCallback(\'' + cb.id + '\')"><i class="fas fa-check"></i> Complete</button>' +
                    '<button class="btn btn-secondary" onclick="releaseCallback(\'' + cb.id + '\')"><i class="fas fa-undo"></i> Release</button>' +
                    '</div></div>';
            }).join('');
        }
    }
    
    if (pendingContainer) {
        if (pendingCount) pendingCount.textContent = pendingCallbacks.length > 0 ? pendingCallbacks.length : '';
        
        if (pendingCallbacks.length === 0) {
            pendingContainer.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No pending callbacks</p></div>';
        } else {
            pendingContainer.innerHTML = pendingCallbacks.map(function(cb) {
                return '<div class="callback-card">' +
                    '<div class="callback-header"><span class="callback-name">' + cb.name + '</span>' +
                    '<span class="callback-status pending">Pending</span></div>' +
                    '<div class="callback-phone"><i class="fas fa-phone"></i> ' + cb.phone + '</div>' +
                    '<div class="callback-message">' + (cb.message || 'No message') + '</div>' +
                    '<div class="callback-time">' + new Date(cb.created_at).toLocaleString() + '</div>' +
                    '<div class="callback-actions">' +
                    '<button class="btn btn-primary" onclick="takeCallback(\'' + cb.id + '\')"><i class="fas fa-hand-paper"></i> Take Callback</button>' +
                    '</div></div>';
            }).join('');
        }
    }
}

// Alert Actions
async function acknowledgeAlert(alertId) {
    try {
        await apiCall('/panic-alerts/' + alertId + '/acknowledge', { method: 'PATCH' });
        showNotification('Alert acknowledged');
        loadPortalData();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

async function resolveAlert(alertId) {
    try {
        await apiCall('/panic-alerts/' + alertId + '/resolve', { method: 'PATCH' });
        showNotification('Alert resolved');
        loadPortalData();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

// Callback Actions
async function takeCallback(callbackId) {
    try {
        await apiCall('/callbacks/' + callbackId + '/take', { method: 'PATCH' });
        showNotification('Callback assigned to you');
        loadPortalData();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

async function releaseCallback(callbackId) {
    try {
        await apiCall('/callbacks/' + callbackId + '/release', { method: 'PATCH' });
        showNotification('Callback released');
        loadPortalData();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

async function completeCallback(callbackId) {
    try {
        await apiCall('/callbacks/' + callbackId + '/complete', { method: 'PATCH' });
        showNotification('Callback completed');
        loadPortalData();
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

// Status Update
async function updateMyStatus(newStatus) {
    try {
        var role = currentUser ? currentUser.role : null;
        var endpoint;
        
        if (role === 'counsellor') {
            var counsellors = await apiCall('/counsellors');
            var mine = counsellors.find(function(c) { return c.user_id === currentUser.id; });
            if (!mine) throw new Error('Profile not found');
            endpoint = '/counsellors/' + mine.id + '/status';
        } else if (role === 'peer') {
            var peers = await apiCall('/peer-supporters');
            var mine = peers.find(function(p) { return p.user_id === currentUser.id; });
            if (!mine) throw new Error('Profile not found');
            endpoint = '/peer-supporters/' + mine.id + '/status';
        }
        
        await apiCall(endpoint, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
        showNotification('Status updated to ' + newStatus);
    } catch (error) {
        showNotification('Failed: ' + error.message, 'error');
    }
}

// Panic Alert (for peers)
async function triggerPanicAlert() {
    var message = prompt('What do you need help with? (optional)');
    try {
        await fetch(CONFIG.API_URL + '/api/panic-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({
                user_name: currentUser.name,
                message: message || 'Peer supporter needs counsellor assistance'
            })
        });
        showNotification('Alert sent! A counsellor has been notified.');
    } catch (error) {
        showNotification('Failed to send alert', 'error');
    }
}

// Load All Data (for admin)
async function loadAllData() {
    try {
        var role = currentUser ? currentUser.role : null;
        if (role === 'admin') {
            // Load admin data
            var counsellors = await apiCall('/counsellors').catch(function() { return []; });
            var peers = await apiCall('/peer-supporters').catch(function() { return []; });
            renderCounsellors(counsellors);
            renderPeers(peers);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Render Counsellors (admin view)
function renderCounsellors(counsellors) {
    var container = document.getElementById('counsellors-list');
    if (!container) return;
    
    if (counsellors.length === 0) {
        container.innerHTML = '<p>No counsellors found</p>';
        return;
    }
    
    container.innerHTML = counsellors.map(function(c) {
        var statusColor = c.status === 'available' ? '#22c55e' : c.status === 'busy' ? '#f59e0b' : '#ef4444';
        return '<div class="card">' +
            '<h3>' + c.name + '</h3>' +
            '<p>' + (c.specialization || 'Counsellor') + '</p>' +
            '<span style="color:' + statusColor + '">' + (c.status || 'Unknown') + '</span>' +
            '</div>';
    }).join('');
}

// Render Peers (admin view)
function renderPeers(peers) {
    var container = document.getElementById('peers-list');
    if (!container) return;
    
    if (peers.length === 0) {
        container.innerHTML = '<p>No peer supporters found</p>';
        return;
    }
    
    container.innerHTML = peers.map(function(p) {
        var statusColor = p.status === 'available' ? '#22c55e' : p.status === 'limited' ? '#f59e0b' : '#ef4444';
        return '<div class="card">' +
            '<h3>' + p.firstName + '</h3>' +
            '<p>' + (p.background || 'Peer Supporter') + '</p>' +
            '<span style="color:' + statusColor + '">' + (p.status || 'Unknown') + '</span>' +
            '</div>';
    }).join('');
}
