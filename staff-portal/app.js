// Staff Portal - Radio Check Veterans Support
// For Counsellors and Peer Supporters

// State
let token = localStorage.getItem('staff_token');
let currentUser = JSON.parse(localStorage.getItem('staff_user') || 'null');
let myProfile = null;

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
    document.getElementById('panic-button-section').style.display = 
        role === 'peer' ? 'block' : 'none';
    
    // Load profile to get current status
    await loadMyProfile();
    
    // Load data
    loadCallbacks();
    if (role === 'counsellor' || role === 'admin') {
        loadPanicAlerts();
    }
    
    // Auto-refresh every 30 seconds
    setInterval(function() {
        loadCallbacks();
        if (role === 'counsellor' || role === 'admin') {
            loadPanicAlerts();
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
