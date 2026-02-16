// Veterans Support Admin Portal - Main Application

// Ensure CONFIG is defined (fallback if config.js fails to load)
if (typeof CONFIG === 'undefined') {
    console.error('CONFIG not loaded! Make sure config.js is deployed alongside app.js');
    window.CONFIG = {
        API_URL: 'https://veterans-support-api.onrender.com',
        VERSION: '1.0.0'
    };
}

// State
let token = localStorage.getItem('auth_token');
let currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
let counsellors = [];
let peers = [];
let organizations = [];
let users = [];
let content = {};
let resources = [];

// API Helper
async function apiCall(endpoint, options = {}) {
    const url = `${CONFIG.API_URL}/api${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'API Error');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notification-message');
    
    notification.className = `notification ${type}`;
    messageEl.textContent = message;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Tab Management
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if logged in
    if (token && currentUser) {
        showScreen('dashboard-screen');
        document.getElementById('user-name').textContent = `Welcome, ${currentUser.name}`;
        loadAllData();
    } else {
        showScreen('login-screen');
    }
    
    // Login form handler
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout handler
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
});

// Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    
    try {
        errorEl.classList.add('hidden');
        
        const response = await fetch(`${CONFIG.API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }
        
        // Check if admin
        if (data.user.role !== 'admin') {
            throw new Error('Access denied. Admin only.');
        }
        
        // Save token and user
        token = data.access_token;
        currentUser = data.user;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        
        // Show dashboard
        document.getElementById('user-name').textContent = `Welcome, ${currentUser.name}`;
        showScreen('dashboard-screen');
        loadAllData();
        
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    }
}

// Logout
function handleLogout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    showScreen('login-screen');
    document.getElementById('login-form').reset();
}

// Load All Data
async function loadAllData() {
    try {
        const [counsellorsData, peersData, orgsData, usersData, contentData, resourcesData] = await Promise.all([
            apiCall('/counsellors'),
            apiCall('/peer-supporters'),
            apiCall('/organizations'),
            apiCall('/auth/users'),
            apiCall('/content'),
            apiCall('/resources').catch(() => [])  // Resources might not exist yet
        ]);
        
        counsellors = counsellorsData;
        peers = peersData;
        organizations = orgsData;
        users = usersData;
        content = contentData;
        resources = resourcesData;
        
        renderCounsellors();
        renderPeers();
        renderOrganizations();
        renderUsers();
        renderResources();
        renderCMS();
        
    } catch (error) {
        showNotification('Failed to load data: ' + error.message, 'error');
    }
}

// Render Counsellors
function renderCounsellors() {
    const container = document.getElementById('counsellors-list');
    
    if (counsellors.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-md"></i>
                <p>No counsellors added yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = counsellors.map(c => `
        <div class="card">
            <div class="card-header">
                <span class="card-name">${c.name}</span>
                <span class="status-badge status-${c.status}">${c.status}</span>
            </div>
            <p class="card-detail">${c.specialization}</p>
            <p class="card-detail">${c.phone}</p>
            ${c.sms ? `<p class="card-detail">SMS: ${c.sms}</p>` : ''}
            ${c.whatsapp ? `<p class="card-detail">WhatsApp: ${c.whatsapp}</p>` : ''}
            
            <div class="status-toggle">
                <span class="status-toggle-label">Status:</span>
                <button class="status-btn ${c.status === 'available' ? 'active status-available' : ''}" 
                        onclick="updateCounsellorStatus('${c.id}', 'available')">Available</button>
                <button class="status-btn ${c.status === 'busy' ? 'active status-busy' : ''}" 
                        onclick="updateCounsellorStatus('${c.id}', 'busy')">Busy</button>
                <button class="status-btn ${c.status === 'off' ? 'active status-off' : ''}" 
                        onclick="updateCounsellorStatus('${c.id}', 'off')">Off</button>
            </div>
            
            <div class="card-actions">
                <button class="btn btn-primary btn-small" onclick="openEditCounsellorModal('${c.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-small" onclick="confirmDelete('counsellor', '${c.id}', '${c.name}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Render Peers
function renderPeers() {
    const container = document.getElementById('peers-list');
    
    if (peers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>No peer supporters added yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = peers.map(p => `
        <div class="card">
            <div class="card-header">
                <span class="card-name">${p.firstName}</span>
                <span class="status-badge status-${p.status}">${p.status}</span>
            </div>
            <p class="card-detail">${p.area} - ${p.background}</p>
            <p class="card-detail">${p.yearsServed} years served</p>
            <p class="card-detail">${p.phone}</p>
            ${p.sms ? `<p class="card-detail">SMS: ${p.sms}</p>` : ''}
            ${p.whatsapp ? `<p class="card-detail">WhatsApp: ${p.whatsapp}</p>` : ''}
            
            <div class="status-toggle">
                <span class="status-toggle-label">Status:</span>
                <button class="status-btn ${p.status === 'available' ? 'active status-available' : ''}" 
                        onclick="updatePeerStatus('${p.id}', 'available')">Available</button>
                <button class="status-btn ${p.status === 'limited' ? 'active status-limited' : ''}" 
                        onclick="updatePeerStatus('${p.id}', 'limited')">Limited</button>
                <button class="status-btn ${p.status === 'unavailable' ? 'active status-unavailable' : ''}" 
                        onclick="updatePeerStatus('${p.id}', 'unavailable')">Unavailable</button>
            </div>
            
            <div class="card-actions">
                <button class="btn btn-primary btn-small" onclick="openEditPeerModal('${p.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-small" onclick="confirmDelete('peer', '${p.id}', '${p.firstName}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Render Organizations
function renderOrganizations() {
    const container = document.getElementById('organizations-list');
    
    if (organizations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-building"></i>
                <p>No organizations added yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = organizations.map(o => `
        <div class="card">
            <div class="card-header">
                <span class="card-name">${o.name}</span>
            </div>
            <p class="card-detail">${o.description}</p>
            <p class="card-detail">${o.phone}</p>
            ${o.sms ? `<p class="card-detail">SMS: ${o.sms}</p>` : ''}
            ${o.whatsapp ? `<p class="card-detail">WhatsApp: ${o.whatsapp}</p>` : ''}
            
            <div class="card-actions">
                <button class="btn btn-primary btn-small" onclick="openEditOrgModal('${o.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-small" onclick="confirmDelete('org', '${o.id}', '${o.name}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Render Users
function renderUsers() {
    const container = document.getElementById('users-list');
    
    if (users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>No users found</p>
            </div>
        `;
        return;
    }
    
    // Sort users: admins first, then counsellors, then peers
    const sortedUsers = [...users].sort((a, b) => {
        const roleOrder = { admin: 0, counsellor: 1, peer: 2 };
        return (roleOrder[a.role] || 3) - (roleOrder[b.role] || 3);
    });
    
    // Find linked profiles for each user
    const getUserProfile = (user) => {
        if (user.role === 'counsellor') {
            return counsellors.find(c => c.user_id === user.id);
        } else if (user.role === 'peer') {
            return peers.find(p => p.user_id === user.id);
        }
        return null;
    };
    
    container.innerHTML = `
        <div class="users-summary">
            <span class="user-count"><i class="fas fa-user-shield"></i> ${users.filter(u => u.role === 'admin').length} Admins</span>
            <span class="user-count"><i class="fas fa-user-md"></i> ${users.filter(u => u.role === 'counsellor').length} Counsellors</span>
            <span class="user-count"><i class="fas fa-users"></i> ${users.filter(u => u.role === 'peer').length} Peers</span>
        </div>
    ` + sortedUsers.map(u => {
        const profile = getUserProfile(u);
        const profileInfo = profile ? `<p class="card-detail profile-link"><i class="fas fa-link"></i> Linked to profile: ${profile.name || profile.firstName}</p>` : 
            (u.role !== 'admin' ? `<p class="card-detail no-profile"><i class="fas fa-unlink"></i> No profile linked</p>` : '');
        
        return `
        <div class="card user-card">
            <div class="card-header">
                <span class="card-name">${u.name}</span>
                <span class="role-badge role-${u.role}">${u.role.charAt(0).toUpperCase() + u.role.slice(1)}</span>
            </div>
            <p class="card-detail"><i class="fas fa-envelope"></i> ${u.email}</p>
            ${profileInfo}
            
            <div class="card-actions">
                <button class="btn btn-primary btn-small" onclick="openEditUserModal('${u.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-warning btn-small" onclick="openResetPasswordModal('${u.id}', '${u.name}')">
                    <i class="fas fa-key"></i> Reset Password
                </button>
                ${u.role !== 'admin' ? `
                    <button class="btn btn-danger btn-small" onclick="confirmDelete('user', '${u.id}', '${u.name}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
        </div>
    `}).join('');
}

// Render Resources
function renderResources() {
    const container = document.getElementById('resources-list');
    
    if (!resources || resources.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <p>No resources added yet. Click "Add Resource" to create helpful content for veterans.</p>
            </div>
        `;
        return;
    }
    
    // Group resources by category
    const categories = {};
    resources.forEach(r => {
        const cat = r.category || 'General';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(r);
    });
    
    container.innerHTML = Object.keys(categories).map(category => `
        <div class="resource-category">
            <h3 class="category-title"><i class="fas fa-folder"></i> ${category}</h3>
            <div class="resources-list">
                ${categories[category].map(r => `
                    <div class="resource-card">
                        ${r.image_url ? `<img src="${r.image_url}" alt="${r.title}" class="resource-image">` : ''}
                        <div class="resource-content">
                            <h4 class="resource-title">${r.title}</h4>
                            <p class="resource-description">${r.description || ''}</p>
                            ${r.link ? `<a href="${r.link}" target="_blank" class="resource-link"><i class="fas fa-external-link-alt"></i> View Resource</a>` : ''}
                        </div>
                        <div class="resource-actions">
                            <button class="btn btn-primary btn-small" onclick="openEditResourceModal('${r.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-small" onclick="confirmDelete('resource', '${r.id}', '${r.title}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Render CMS
function renderCMS() {
    const container = document.getElementById('cms-list');
    
    const pages = Object.keys(content);
    if (pages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <p>No content configured. Click "Load Defaults" to initialize or "Add Content" to create custom content.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pages.map(page => `
        <div class="cms-card">
            <h3 class="cms-page-title">${formatPageName(page)}</h3>
            ${Object.entries(content[page]).map(([section, value]) => `
                <div class="cms-section">
                    <div class="cms-section-header">
                        <div class="cms-section-title">${formatSectionName(section)}</div>
                        <button class="btn btn-danger btn-small" onclick="deleteContent('${page}', '${section}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="cms-section-value" onclick="openEditContentModal('${page}', '${section}', \`${escapeHtml(value)}\`)">
                        ${value.length > 100 ? escapeHtml(value.substring(0, 100)) + '...' : escapeHtml(value)}
                        <i class="fas fa-pencil-alt" style="float: right; opacity: 0.5;"></i>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// Helper functions
function formatPageName(name) {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatSectionName(name) {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Status Updates
async function updateCounsellorStatus(id, status) {
    try {
        await apiCall(`/counsellors/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        showNotification(`Status updated to ${status}`);
        loadAllData();
    } catch (error) {
        showNotification('Failed to update status: ' + error.message, 'error');
    }
}

async function updatePeerStatus(id, status) {
    try {
        await apiCall(`/peer-supporters/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        showNotification(`Status updated to ${status}`);
        loadAllData();
    } catch (error) {
        showNotification('Failed to update status: ' + error.message, 'error');
    }
}

// Modal Management
function openModal(content) {
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// Delete Confirmation
let deleteTarget = null;

function confirmDelete(type, id, name) {
    deleteTarget = { type, id };
    document.getElementById('delete-message').textContent = `Are you sure you want to delete "${name}"?`;
    document.getElementById('delete-modal').classList.remove('hidden');
    
    document.getElementById('confirm-delete-btn').onclick = executeDelete;
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.add('hidden');
    deleteTarget = null;
}

async function executeDelete() {
    if (!deleteTarget) return;
    
    const { type, id } = deleteTarget;
    let endpoint;
    
    switch (type) {
        case 'counsellor': endpoint = `/counsellors/${id}`; break;
        case 'peer': endpoint = `/peer-supporters/${id}`; break;
        case 'org': endpoint = `/organizations/${id}`; break;
        case 'user': endpoint = `/auth/users/${id}`; break;
        case 'resource': endpoint = `/resources/${id}`; break;
    }
    
    try {
        await apiCall(endpoint, { method: 'DELETE' });
        showNotification('Deleted successfully');
        closeDeleteModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to delete: ' + error.message, 'error');
    }
}

// Add Counsellor Modal
function openAddCounsellorModal() {
    openModal(`
        <div class="modal-header">
            <h3>Add New Counsellor</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="add-counsellor-form" class="modal-body">
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Password *</label>
                <input type="password" name="password" required minlength="8">
            </div>
            <div class="form-group">
                <label>Specialization *</label>
                <input type="text" name="specialization" required placeholder="e.g., Trauma & PTSD">
            </div>
            <div class="form-group">
                <label>Phone *</label>
                <input type="tel" name="phone" required placeholder="01234567890">
            </div>
            <div class="form-group">
                <label>SMS Number</label>
                <input type="tel" name="sms" placeholder="Optional">
            </div>
            <div class="form-group">
                <label>WhatsApp Number</label>
                <input type="tel" name="whatsapp" placeholder="Optional">
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitAddCounsellor()">Add Counsellor</button>
        </div>
    `);
}

async function submitAddCounsellor() {
    const form = document.getElementById('add-counsellor-form');
    const formData = new FormData(form);
    
    try {
        // First create user
        const userResult = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password'),
                name: formData.get('name'),
                role: 'counsellor'
            })
        });
        
        // Then create counsellor profile linked to the user
        await apiCall('/counsellors', {
            method: 'POST',
            body: JSON.stringify({
                name: formData.get('name'),
                specialization: formData.get('specialization'),
                phone: formData.get('phone'),
                sms: formData.get('sms') || null,
                whatsapp: formData.get('whatsapp') || null,
                user_id: userResult.id
            })
        });
        
        showNotification('Counsellor added successfully');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to add counsellor: ' + error.message, 'error');
    }
}

// Edit Counsellor Modal
function openEditCounsellorModal(id) {
    const counsellor = counsellors.find(c => c.id === id);
    if (!counsellor) return;
    
    // Filter users with 'counsellor' role who aren't already linked to another counsellor
    const linkedUserIds = counsellors.filter(c => c.user_id && c.id !== id).map(c => c.user_id);
    const availableCounsellorUsers = users.filter(u => u.role === 'counsellor' && !linkedUserIds.includes(u.id));
    
    const userOptions = availableCounsellorUsers.length > 0 
        ? `<option value="">-- Select user to link --</option>` + 
          availableCounsellorUsers.map(u => `<option value="${u.id}" ${counsellor.user_id === u.id ? 'selected' : ''}>${u.name} (${u.email})</option>`).join('')
        : `<option value="">No unlinked counsellor users available</option>`;
    
    openModal(`
        <div class="modal-header">
            <h3>Edit Counsellor</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="edit-counsellor-form" class="modal-body">
            <input type="hidden" name="id" value="${counsellor.id}">
            <div class="form-group">
                <label>Link to User Account</label>
                <select name="user_id">
                    ${userOptions}
                </select>
                <small style="color: var(--text-muted);">Link this profile to a user account to enable portal login</small>
            </div>
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" required value="${counsellor.name}">
            </div>
            <div class="form-group">
                <label>Specialization *</label>
                <input type="text" name="specialization" required value="${counsellor.specialization}">
            </div>
            <div class="form-group">
                <label>Phone *</label>
                <input type="tel" name="phone" required value="${counsellor.phone}">
            </div>
            <div class="form-group">
                <label>SMS Number</label>
                <input type="tel" name="sms" value="${counsellor.sms || ''}">
            </div>
            <div class="form-group">
                <label>WhatsApp Number</label>
                <input type="tel" name="whatsapp" value="${counsellor.whatsapp || ''}">
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitEditCounsellor()">Save Changes</button>
        </div>
    `);
}

async function submitEditCounsellor() {
    const form = document.getElementById('edit-counsellor-form');
    const formData = new FormData(form);
    const id = formData.get('id');
    
    try {
        await apiCall(`/counsellors/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: formData.get('name'),
                specialization: formData.get('specialization'),
                phone: formData.get('phone'),
                sms: formData.get('sms') || null,
                whatsapp: formData.get('whatsapp') || null,
                user_id: formData.get('user_id') || null
            })
        });
        
        showNotification('Counsellor updated successfully');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to update counsellor: ' + error.message, 'error');
    }
}

// Add Peer Modal
function openAddPeerModal() {
    openModal(`
        <div class="modal-header">
            <h3>Add New Peer Supporter</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="add-peer-form" class="modal-body">
            <div class="form-group">
                <label>First Name *</label>
                <input type="text" name="firstName" required>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Password *</label>
                <input type="password" name="password" required minlength="8">
            </div>
            <div class="form-group">
                <label>Area *</label>
                <input type="text" name="area" required placeholder="e.g., Greater Manchester">
            </div>
            <div class="form-group">
                <label>Background *</label>
                <input type="text" name="background" required placeholder="e.g., Royal Marines">
            </div>
            <div class="form-group">
                <label>Years Served *</label>
                <input type="text" name="yearsServed" required placeholder="e.g., 2001-2013">
            </div>
            <div class="form-group">
                <label>Phone *</label>
                <input type="tel" name="phone" required placeholder="01234567890">
            </div>
            <div class="form-group">
                <label>SMS Number</label>
                <input type="tel" name="sms" placeholder="Optional">
            </div>
            <div class="form-group">
                <label>WhatsApp Number</label>
                <input type="tel" name="whatsapp" placeholder="Optional">
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitAddPeer()">Add Peer Supporter</button>
        </div>
    `);
}

async function submitAddPeer() {
    const form = document.getElementById('add-peer-form');
    const formData = new FormData(form);
    
    try {
        // First create user
        const userResult = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password'),
                name: formData.get('firstName'),
                role: 'peer'
            })
        });
        
        // Then create peer profile linked to the user
        await apiCall('/peer-supporters', {
            method: 'POST',
            body: JSON.stringify({
                firstName: formData.get('firstName'),
                area: formData.get('area'),
                background: formData.get('background'),
                yearsServed: formData.get('yearsServed'),
                phone: formData.get('phone'),
                sms: formData.get('sms') || null,
                whatsapp: formData.get('whatsapp') || null,
                user_id: userResult.id
            })
        });
        
        showNotification('Peer supporter added successfully');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to add peer supporter: ' + error.message, 'error');
    }
}

// Edit Peer Modal
function openEditPeerModal(id) {
    const peer = peers.find(p => p.id === id);
    if (!peer) return;
    
    // Filter users with 'peer' role who aren't already linked to another peer
    const linkedUserIds = peers.filter(p => p.user_id && p.id !== id).map(p => p.user_id);
    const availablePeerUsers = users.filter(u => u.role === 'peer' && !linkedUserIds.includes(u.id));
    
    const userOptions = availablePeerUsers.length > 0 
        ? `<option value="">-- Select user to link --</option>` + 
          availablePeerUsers.map(u => `<option value="${u.id}" ${peer.user_id === u.id ? 'selected' : ''}>${u.name} (${u.email})</option>`).join('')
        : `<option value="">No unlinked peer users available</option>`;
    
    openModal(`
        <div class="modal-header">
            <h3>Edit Peer Supporter</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="edit-peer-form" class="modal-body">
            <input type="hidden" name="id" value="${peer.id}">
            <div class="form-group">
                <label>Link to User Account</label>
                <select name="user_id">
                    ${userOptions}
                </select>
                <small style="color: var(--text-muted);">Link this profile to a user account to enable portal login</small>
            </div>
            <div class="form-group">
                <label>First Name *</label>
                <input type="text" name="firstName" required value="${peer.firstName}">
            </div>
            <div class="form-group">
                <label>Area *</label>
                <input type="text" name="area" required value="${peer.area}">
            </div>
            <div class="form-group">
                <label>Background *</label>
                <input type="text" name="background" required value="${peer.background}">
            </div>
            <div class="form-group">
                <label>Years Served *</label>
                <input type="text" name="yearsServed" required value="${peer.yearsServed}">
            </div>
            <div class="form-group">
                <label>Phone *</label>
                <input type="tel" name="phone" required value="${peer.phone}">
            </div>
            <div class="form-group">
                <label>SMS Number</label>
                <input type="tel" name="sms" value="${peer.sms || ''}">
            </div>
            <div class="form-group">
                <label>WhatsApp Number</label>
                <input type="tel" name="whatsapp" value="${peer.whatsapp || ''}">
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitEditPeer()">Save Changes</button>
        </div>
    `);
}

async function submitEditPeer() {
    const form = document.getElementById('edit-peer-form');
    const formData = new FormData(form);
    const id = formData.get('id');
    
    try {
        await apiCall(`/peer-supporters/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                firstName: formData.get('firstName'),
                area: formData.get('area'),
                background: formData.get('background'),
                yearsServed: formData.get('yearsServed'),
                phone: formData.get('phone'),
                sms: formData.get('sms') || null,
                whatsapp: formData.get('whatsapp') || null,
                user_id: formData.get('user_id') || null
            })
        });
        
        showNotification('Peer supporter updated successfully');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to update peer supporter: ' + error.message, 'error');
    }
}

// Add Organization Modal
function openAddOrgModal() {
    openModal(`
        <div class="modal-header">
            <h3>Add Organization</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="add-org-form" class="modal-body">
            <div class="form-group">
                <label>Organization Name *</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Description *</label>
                <textarea name="description" required placeholder="Describe the organization's services"></textarea>
            </div>
            <div class="form-group">
                <label>Phone *</label>
                <input type="tel" name="phone" required placeholder="01234567890">
            </div>
            <div class="form-group">
                <label>SMS Number</label>
                <input type="tel" name="sms" placeholder="Optional">
            </div>
            <div class="form-group">
                <label>WhatsApp Number</label>
                <input type="tel" name="whatsapp" placeholder="Optional">
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitAddOrg()">Add Organization</button>
        </div>
    `);
}

async function submitAddOrg() {
    const form = document.getElementById('add-org-form');
    const formData = new FormData(form);
    
    try {
        await apiCall('/organizations', {
            method: 'POST',
            body: JSON.stringify({
                name: formData.get('name'),
                description: formData.get('description'),
                phone: formData.get('phone'),
                sms: formData.get('sms') || null,
                whatsapp: formData.get('whatsapp') || null
            })
        });
        
        showNotification('Organization added successfully');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to add organization: ' + error.message, 'error');
    }
}

// Edit Organization Modal
function openEditOrgModal(id) {
    const org = organizations.find(o => o.id === id);
    if (!org) return;
    
    openModal(`
        <div class="modal-header">
            <h3>Edit Organization</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="edit-org-form" class="modal-body">
            <input type="hidden" name="id" value="${org.id}">
            <div class="form-group">
                <label>Organization Name *</label>
                <input type="text" name="name" required value="${org.name}">
            </div>
            <div class="form-group">
                <label>Description *</label>
                <textarea name="description" required>${org.description}</textarea>
            </div>
            <div class="form-group">
                <label>Phone *</label>
                <input type="tel" name="phone" required value="${org.phone}">
            </div>
            <div class="form-group">
                <label>SMS Number</label>
                <input type="tel" name="sms" value="${org.sms || ''}">
            </div>
            <div class="form-group">
                <label>WhatsApp Number</label>
                <input type="tel" name="whatsapp" value="${org.whatsapp || ''}">
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitEditOrg()">Save Changes</button>
        </div>
    `);
}

async function submitEditOrg() {
    const form = document.getElementById('edit-org-form');
    const formData = new FormData(form);
    const id = formData.get('id');
    
    try {
        await apiCall(`/organizations/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: formData.get('name'),
                description: formData.get('description'),
                phone: formData.get('phone'),
                sms: formData.get('sms') || null,
                whatsapp: formData.get('whatsapp') || null
            })
        });
        
        showNotification('Organization updated successfully');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to update organization: ' + error.message, 'error');
    }
}

// Profile Only Modal (no user account)
function openProfileOnlyModal(type) {
    if (type === 'counsellor') {
        openModal(`
            <div class="modal-header">
                <h3>Add Counsellor Profile Only</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <form id="profile-only-form" class="modal-body">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Specialization *</label>
                    <input type="text" name="specialization" required>
                </div>
                <div class="form-group">
                    <label>Phone *</label>
                    <input type="tel" name="phone" required>
                </div>
                <div class="form-group">
                    <label>SMS Number</label>
                    <input type="tel" name="sms">
                </div>
                <div class="form-group">
                    <label>WhatsApp Number</label>
                    <input type="tel" name="whatsapp">
                </div>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="submitProfileOnly('counsellor')">Add Profile</button>
            </div>
        `);
    } else {
        openModal(`
            <div class="modal-header">
                <h3>Add Peer Supporter Profile Only</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <form id="profile-only-form" class="modal-body">
                <div class="form-group">
                    <label>First Name *</label>
                    <input type="text" name="firstName" required>
                </div>
                <div class="form-group">
                    <label>Area *</label>
                    <input type="text" name="area" required>
                </div>
                <div class="form-group">
                    <label>Background *</label>
                    <input type="text" name="background" required>
                </div>
                <div class="form-group">
                    <label>Years Served *</label>
                    <input type="text" name="yearsServed" required>
                </div>
                <div class="form-group">
                    <label>Phone *</label>
                    <input type="tel" name="phone" required>
                </div>
                <div class="form-group">
                    <label>SMS Number</label>
                    <input type="tel" name="sms">
                </div>
                <div class="form-group">
                    <label>WhatsApp Number</label>
                    <input type="tel" name="whatsapp">
                </div>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="submitProfileOnly('peer')">Add Profile</button>
            </div>
        `);
    }
}

async function submitProfileOnly(type) {
    const form = document.getElementById('profile-only-form');
    const formData = new FormData(form);
    
    try {
        if (type === 'counsellor') {
            await apiCall('/counsellors', {
                method: 'POST',
                body: JSON.stringify({
                    name: formData.get('name'),
                    specialization: formData.get('specialization'),
                    phone: formData.get('phone'),
                    sms: formData.get('sms') || null,
                    whatsapp: formData.get('whatsapp') || null
                })
            });
        } else {
            await apiCall('/peer-supporters', {
                method: 'POST',
                body: JSON.stringify({
                    firstName: formData.get('firstName'),
                    area: formData.get('area'),
                    background: formData.get('background'),
                    yearsServed: formData.get('yearsServed'),
                    phone: formData.get('phone'),
                    sms: formData.get('sms') || null,
                    whatsapp: formData.get('whatsapp') || null
                })
            });
        }
        
        showNotification('Profile added successfully');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to add profile: ' + error.message, 'error');
    }
}

// Add User Modal
function openAddUserModal() {
    openModal(`
        <div class="modal-header">
            <h3>Add New User</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="add-user-form" class="modal-body">
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Password *</label>
                <input type="password" name="password" required minlength="8">
            </div>
            <div class="form-group">
                <label>Role *</label>
                <select name="role" required>
                    <option value="counsellor">Counsellor</option>
                    <option value="peer">Peer Supporter</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitAddUser()">Add User</button>
        </div>
    `);
}

async function submitAddUser() {
    const form = document.getElementById('add-user-form');
    const formData = new FormData(form);
    
    try {
        await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password'),
                name: formData.get('name'),
                role: formData.get('role')
            })
        });
        
        showNotification('User added successfully');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to add user: ' + error.message, 'error');
    }
}

// Edit User Modal
function openEditUserModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Determine if user has linked profile
    const counsellorProfile = counsellors.find(c => c.user_id === userId);
    const peerProfile = peers.find(p => p.user_id === userId);
    const hasProfile = counsellorProfile || peerProfile;
    
    // Build role warning message
    let roleWarning = '';
    if (user.role === 'admin') {
        roleWarning = '<small style="color: var(--warning);">Note: Admin role cannot be changed for security.</small>';
    } else if (hasProfile) {
        roleWarning = '<small style="color: var(--text-muted);">Changing role will unlink any existing profile. You may need to create a new profile after changing roles.</small>';
    }
    
    openModal(`
        <div class="modal-header">
            <h3>Edit User: ${user.name}</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="edit-user-form" class="modal-body">
            <input type="hidden" name="id" value="${user.id}">
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" required value="${user.name}">
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" required value="${user.email}">
            </div>
            <div class="form-group">
                <label>Role *</label>
                <select name="role" ${user.role === 'admin' ? 'disabled' : ''}>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    <option value="counsellor" ${user.role === 'counsellor' ? 'selected' : ''}>Counsellor</option>
                    <option value="peer" ${user.role === 'peer' ? 'selected' : ''}>Peer Supporter</option>
                </select>
                ${roleWarning}
            </div>
            
            <!-- Password Change Section -->
            <div class="form-group" style="border-top: 1px solid var(--border); padding-top: 16px; margin-top: 16px;">
                <label><i class="fas fa-key"></i> Change Password (optional)</label>
                <input type="password" name="newPassword" minlength="8" placeholder="Leave blank to keep current password">
                <small style="color: var(--text-muted);">Minimum 8 characters. Only fill if you want to change the password.</small>
            </div>
            <div class="form-group">
                <label>Confirm New Password</label>
                <input type="password" name="confirmPassword" minlength="8" placeholder="Re-enter new password">
            </div>
            
            ${hasProfile ? `
                <div class="form-group">
                    <label>Linked Profile</label>
                    <p style="color: var(--success);"><i class="fas fa-check-circle"></i> ${counsellorProfile ? counsellorProfile.name : peerProfile.firstName}</p>
                </div>
            ` : user.role !== 'admin' ? `
                <div class="form-group">
                    <label>Linked Profile</label>
                    <p style="color: var(--warning);"><i class="fas fa-exclamation-triangle"></i> No profile linked. Go to ${user.role === 'counsellor' ? 'Counsellors' : 'Peers'} tab to link a profile.</p>
                </div>
            ` : ''}
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitEditUser()">Save Changes</button>
        </div>
    `);
}

async function submitEditUser() {
    const form = document.getElementById('edit-user-form');
    const formData = new FormData(form);
    const userId = formData.get('id');
    const user = users.find(u => u.id === userId);
    
    // Get role - if disabled (admin), use original role
    const roleSelect = form.querySelector('select[name="role"]');
    const newRole = roleSelect.disabled ? user.role : formData.get('role');
    
    // Check password fields
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    // Validate password if provided
    if (newPassword) {
        if (newPassword.length < 8) {
            showNotification('Password must be at least 8 characters', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
    }
    
    try {
        // Update user details
        await apiCall(`/auth/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: formData.get('name'),
                email: formData.get('email'),
                role: newRole
            })
        });
        
        // Update password if provided
        if (newPassword) {
            await apiCall('/auth/admin-reset-password', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: userId,
                    new_password: newPassword
                })
            });
            showNotification('User updated and password changed successfully');
        } else {
            showNotification('User updated successfully');
        }
        
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to update user: ' + error.message, 'error');
    }
}

// Reset Password Modal
function openResetPasswordModal(userId, userName) {
    openModal(`
        <div class="modal-header">
            <h3>Reset Password for ${userName}</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="reset-password-form" class="modal-body">
            <input type="hidden" name="userId" value="${userId}">
            <div class="form-group">
                <label>New Password *</label>
                <input type="password" name="newPassword" required minlength="8" placeholder="Minimum 8 characters">
            </div>
            <div class="form-group">
                <label>Confirm Password *</label>
                <input type="password" name="confirmPassword" required minlength="8" placeholder="Re-enter password">
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-warning" onclick="submitResetPassword()">Reset Password</button>
        </div>
    `);
}

async function submitResetPassword() {
    const form = document.getElementById('reset-password-form');
    const formData = new FormData(form);
    
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    try {
        await apiCall('/auth/admin-reset-password', {
            method: 'POST',
            body: JSON.stringify({
                user_id: formData.get('userId'),
                new_password: newPassword
            })
        });
        
        showNotification('Password reset successfully');
        closeModal();
    } catch (error) {
        showNotification('Failed to reset password: ' + error.message, 'error');
    }
}

// Add Content Modal
function openAddContentModal() {
    const existingPages = Object.keys(content);
    const pageOptions = existingPages.length > 0 
        ? existingPages.map(p => `<option value="${p}">${formatPageName(p)}</option>`).join('') 
        : '';
    
    openModal(`
        <div class="modal-header">
            <h3>Add New Content</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="add-content-form" class="modal-body">
            <div class="form-group">
                <label>Page Name *</label>
                <input type="text" name="pageName" required placeholder="e.g., home, about, resources" list="page-list">
                <datalist id="page-list">
                    ${pageOptions}
                </datalist>
                <small style="color: var(--text-muted);">Select existing page or type new page name</small>
            </div>
            <div class="form-group">
                <label>Section Name *</label>
                <input type="text" name="sectionName" required placeholder="e.g., title, description, hero_text">
                <small style="color: var(--text-muted);">Use underscores for multi-word names</small>
            </div>
            <div class="form-group">
                <label>Content *</label>
                <textarea name="contentValue" required rows="6" placeholder="Enter the content for this section"></textarea>
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitAddContent()">Add Content</button>
        </div>
    `);
}

async function submitAddContent() {
    const form = document.getElementById('add-content-form');
    const formData = new FormData(form);
    
    const pageName = formData.get('pageName').toLowerCase().replace(/\s+/g, '_');
    const sectionName = formData.get('sectionName').toLowerCase().replace(/\s+/g, '_');
    const contentValue = formData.get('contentValue');
    
    try {
        await apiCall(`/content/${pageName}/${sectionName}`, {
            method: 'PUT',
            body: JSON.stringify({
                content: contentValue
            })
        });
        
        showNotification('Content added successfully');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to add content: ' + error.message, 'error');
    }
}

// Edit Content Modal
function openEditContentModal(page, section, value) {
    openModal(`
        <div class="modal-header">
            <h3>Edit Content</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="edit-content-form" class="modal-body">
            <p style="color: var(--text-secondary); margin-bottom: 16px; background: var(--bg-primary); padding: 12px; border-radius: 8px;">
                <strong>Page:</strong> ${formatPageName(page)}<br>
                <strong>Section:</strong> ${formatSectionName(section)}
            </p>
            <input type="hidden" name="page" value="${page}">
            <input type="hidden" name="section" value="${section}">
            <div class="form-group">
                <label>Content</label>
                <textarea name="value" rows="8">${value}</textarea>
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitEditContent()">Save Changes</button>
        </div>
    `);
}

async function submitEditContent() {
    const form = document.getElementById('edit-content-form');
    const formData = new FormData(form);
    
    try {
        await apiCall(`/content/${formData.get('page')}/${formData.get('section')}`, {
            method: 'PUT',
            body: JSON.stringify({
                content: formData.get('value')
            })
        });
        
        showNotification('Content updated successfully');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to update content: ' + error.message, 'error');
    }
}

// Delete Content
async function deleteContent(page, section) {
    if (!confirm(`Delete "${formatSectionName(section)}" from ${formatPageName(page)}?`)) {
        return;
    }
    
    try {
        await apiCall(`/content/${page}/${section}`, {
            method: 'DELETE'
        });
        
        showNotification('Content deleted successfully');
        loadAllData();
    } catch (error) {
        showNotification('Failed to delete content: ' + error.message, 'error');
    }
}

// Seed Functions
async function seedContent() {
    try {
        await apiCall('/content/seed', { method: 'POST' });
        showNotification('Default content loaded successfully');
        loadAllData();
    } catch (error) {
        showNotification('Failed to load defaults: ' + error.message, 'error');
    }
}

// Modal overlay click - DISABLED to prevent accidental closures
// Users must click Cancel or Close button to close the modal
// This prevents losing form data on accidental clicks

// Note: Delete modal still closes on outside click for quick dismiss
document.getElementById('delete-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'delete-modal') {
        closeDeleteModal();
    }
});

// Forgot Password Modal
function openForgotPasswordModal() {
    // Create a simple modal for forgot password
    const modalHtml = `
        <div class="modal-header">
            <h3>Reset Password</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="forgot-password-form" class="modal-body">
            <p style="color: var(--text-secondary); margin-bottom: 16px;">
                Enter your email address and we'll send you a link to reset your password.
            </p>
            <div class="form-group">
                <label>Email Address *</label>
                <input type="email" name="email" required placeholder="Enter your email">
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitForgotPassword()">Send Reset Link</button>
        </div>
    `;
    openModal(modalHtml);
}

async function submitForgotPassword() {
    const form = document.getElementById('forgot-password-form');
    const formData = new FormData(form);
    const email = formData.get('email');
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        closeModal();
        
        if (data.reset_token) {
            // For testing - show the token
            showNotification('Check console for reset token (dev mode)', 'info');
            console.log('Reset token:', data.reset_token);
        } else {
            showNotification('If that email exists, a reset link has been sent', 'success');
        }
    } catch (error) {
        showNotification('Failed to send reset email: ' + error.message, 'error');
    }
}

// ============ RESOURCES MANAGEMENT ============

// Add Resource Modal
function openAddResourceModal() {
    // Get unique categories from existing resources
    const existingCategories = [...new Set(resources.map(r => r.category).filter(Boolean))];
    const categoryOptions = existingCategories.length > 0 
        ? existingCategories.map(c => `<option value="${c}">${c}</option>`).join('')
        : '';
    
    openModal(`
        <div class="modal-header">
            <h3>Add New Resource</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="add-resource-form" class="modal-body">
            <div class="form-group">
                <label>Category *</label>
                <input type="text" name="category" list="category-list" required placeholder="e.g., Mental Health, Employment, Housing">
                <datalist id="category-list">
                    ${categoryOptions}
                    <option value="Mental Health">
                    <option value="Employment Support">
                    <option value="Housing">
                    <option value="Financial Help">
                    <option value="Family Support">
                    <option value="Health & Wellbeing">
                    <option value="Legal Advice">
                    <option value="General">
                </datalist>
            </div>
            <div class="form-group">
                <label>Title *</label>
                <input type="text" name="title" required placeholder="Resource title">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="4" placeholder="Detailed description or advice..."></textarea>
            </div>
            <div class="form-group">
                <label>Image URL (optional)</label>
                <input type="url" name="image_url" placeholder="https://example.com/image.jpg">
                <small style="color: var(--text-muted);">Paste a direct link to an image</small>
            </div>
            <div class="form-group">
                <label>External Link (optional)</label>
                <input type="url" name="link" placeholder="https://example.com/resource">
            </div>
            <div class="form-group">
                <label>Order (for sorting)</label>
                <input type="number" name="order" value="0" min="0">
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitAddResource()">Add Resource</button>
        </div>
    `);
}

async function submitAddResource() {
    const form = document.getElementById('add-resource-form');
    const formData = new FormData(form);
    
    try {
        await apiCall('/resources', {
            method: 'POST',
            body: JSON.stringify({
                category: formData.get('category'),
                title: formData.get('title'),
                description: formData.get('description'),
                image_url: formData.get('image_url') || null,
                link: formData.get('link') || null,
                order: parseInt(formData.get('order')) || 0
            })
        });
        
        showNotification('Resource added successfully');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to add resource: ' + error.message, 'error');
    }
}

// Edit Resource Modal
function openEditResourceModal(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;
    
    // Get unique categories
    const existingCategories = [...new Set(resources.map(r => r.category).filter(Boolean))];
    const categoryOptions = existingCategories.map(c => `<option value="${c}">${c}</option>`).join('');
    
    openModal(`
        <div class="modal-header">
            <h3>Edit Resource</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="edit-resource-form" class="modal-body">
            <input type="hidden" name="id" value="${resource.id}">
            <div class="form-group">
                <label>Category *</label>
                <input type="text" name="category" list="category-list-edit" required value="${resource.category || ''}">
                <datalist id="category-list-edit">
                    ${categoryOptions}
                    <option value="Mental Health">
                    <option value="Employment Support">
                    <option value="Housing">
                    <option value="Financial Help">
                    <option value="Family Support">
                    <option value="Health & Wellbeing">
                    <option value="Legal Advice">
                    <option value="General">
                </datalist>
            </div>
            <div class="form-group">
                <label>Title *</label>
                <input type="text" name="title" required value="${resource.title || ''}">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="4">${resource.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Image URL (optional)</label>
                <input type="url" name="image_url" value="${resource.image_url || ''}">
                ${resource.image_url ? `<img src="${resource.image_url}" style="max-width: 200px; margin-top: 10px; border-radius: 8px;">` : ''}
            </div>
            <div class="form-group">
                <label>External Link (optional)</label>
                <input type="url" name="link" value="${resource.link || ''}">
            </div>
            <div class="form-group">
                <label>Order (for sorting)</label>
                <input type="number" name="order" value="${resource.order || 0}" min="0">
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitEditResource()">Save Changes</button>
        </div>
    `);
}

async function submitEditResource() {
    const form = document.getElementById('edit-resource-form');
    const formData = new FormData(form);
    const resourceId = formData.get('id');
    
    try {
        await apiCall(`/resources/${resourceId}`, {
            method: 'PUT',
            body: JSON.stringify({
                category: formData.get('category'),
                title: formData.get('title'),
                description: formData.get('description'),
                image_url: formData.get('image_url') || null,
                link: formData.get('link') || null,
                order: parseInt(formData.get('order')) || 0
            })
        });
        
        showNotification('Resource updated successfully');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to update resource: ' + error.message, 'error');
    }
}