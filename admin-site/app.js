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
let unifiedStaff = [];
let currentStaffFilter = 'all';

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
        const [counsellorsData, peersData, orgsData, usersData, contentData, resourcesData, unifiedStaffData] = await Promise.all([
            apiCall('/counsellors'),
            apiCall('/peer-supporters'),
            apiCall('/organizations'),
            apiCall('/auth/users'),
            apiCall('/content'),
            apiCall('/resources').catch(() => []),  // Resources might not exist yet
            apiCall('/admin/unified-staff').catch(() => [])  // Unified staff view
        ]);
        
        counsellors = counsellorsData;
        peers = peersData;
        organizations = orgsData;
        users = usersData;
        content = contentData;
        resources = resourcesData;
        unifiedStaff = unifiedStaffData;
        
        renderUnifiedStaff();
        renderCounsellors();
        renderPeers();
        renderOrganizations();
        renderUsers();
        renderResources();
        renderCMS();
        renderVoIPStaff();
        
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

async function seedResources() {
    try {
        await apiCall('/resources/seed', { method: 'POST' });
        showNotification('Default resources loaded successfully');
        loadAllData();
    } catch (error) {
        showNotification('Failed to load resources: ' + error.message, 'error');
    }
}

// ============ CATEGORY MANAGEMENT ============
let categories = [];

function loadCategories() {
    // Get unique categories from resources
    categories = [...new Set(resources.map(r => r.category).filter(Boolean))];
    renderCategories();
}

function renderCategories() {
    const container = document.getElementById('category-list-display');
    if (!container) return;
    
    if (categories.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">No categories yet. Add resources to create categories.</p>';
        return;
    }
    
    container.innerHTML = categories.map(cat => `
        <div class="category-tag" style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background: var(--primary-color); color: white; border-radius: 20px; font-size: 13px;">
            <span>${cat}</span>
            <button onclick="deleteCategory('${cat}')" style="background: none; border: none; color: white; cursor: pointer; padding: 0; font-size: 14px;" title="Delete category">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function addCategory() {
    const input = document.getElementById('new-category-input');
    const newCategory = input.value.trim();
    
    if (!newCategory) {
        showNotification('Please enter a category name', 'error');
        return;
    }
    
    if (categories.includes(newCategory)) {
        showNotification('Category already exists', 'error');
        return;
    }
    
    categories.push(newCategory);
    renderCategories();
    input.value = '';
    showNotification('Category added. It will appear in dropdowns when adding resources.');
}

async function deleteCategory(category) {
    // Check if any resources use this category
    const resourcesWithCategory = resources.filter(r => r.category === category);
    
    if (resourcesWithCategory.length > 0) {
        if (!confirm(`${resourcesWithCategory.length} resource(s) use this category. Deleting will NOT remove the resources, but the category won't appear in the list. Continue?`)) {
            return;
        }
    }
    
    categories = categories.filter(c => c !== category);
    renderCategories();
    showNotification('Category removed from list');
}

// ============ LOGO / SETTINGS MANAGEMENT ============
let siteSettings = {};
let newLogoData = null;

async function loadSettings() {
    try {
        const settings = await apiCall('/settings').catch(() => ({}));
        siteSettings = settings;
        
        // Display current logo
        const logoImg = document.getElementById('current-logo-img');
        if (logoImg && siteSettings.logo_url) {
            logoImg.src = siteSettings.logo_url;
        } else if (logoImg) {
            // Default logo
            logoImg.src = 'https://customer-assets.emergentagent.com/job_22c2fac2-c7ea-4255-b9fb-379a93a49652/artifacts/vcqj3xma_logo.png';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function previewNewLogo(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        if (file.size > 2 * 1024 * 1024) {
            showNotification('Logo must be less than 2MB', 'error');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            newLogoData = e.target.result;
            document.getElementById('new-logo-preview').src = newLogoData;
            document.getElementById('new-logo-preview-container').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

async function saveLogo() {
    if (!newLogoData) {
        showNotification('Please select a logo image first', 'error');
        return;
    }
    
    try {
        await apiCall('/settings', {
            method: 'PUT',
            body: JSON.stringify({
                logo_url: newLogoData
            })
        });
        
        // Update current logo display
        document.getElementById('current-logo-img').src = newLogoData;
        document.getElementById('new-logo-preview-container').style.display = 'none';
        document.getElementById('logo-upload-input').value = '';
        newLogoData = null;
        
        showNotification('Logo saved successfully! Refresh the page to see changes.');
    } catch (error) {
        showNotification('Failed to save logo: ' + error.message, 'error');
    }
}

// Update loadAllData to include settings and categories
const originalLoadAllData = loadAllData;
loadAllData = async function() {
    await originalLoadAllData();
    loadCategories();
    loadSettings();
};

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
                    <option value="Crisis Support">
                    <option value="Wellness">
                    <option value="Career & Employment">
                    <option value="Benefits & Support">
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
                <label>Upload Image</label>
                <div class="image-upload-container">
                    <input type="file" id="resource-image-file" accept="image/*" onchange="previewResourceImage(this)">
                    <div id="image-preview-container" style="display:none; margin-top:10px; align-items:center;">
                        <img id="image-preview" style="max-width:200px; max-height:150px; border-radius:8px;">
                        <button type="button" class="btn btn-small btn-danger" onclick="clearImagePreview()" style="margin-left:10px;">
                            <i class="fas fa-times"></i> Remove
                        </button>
                    </div>
                </div>
                <small style="color: var(--text-muted);">Upload an image (JPG, PNG, GIF - max 2MB)</small>
            </div>
            <div class="form-group">
                <label>Or Image URL</label>
                <input type="url" name="image_url" placeholder="https://example.com/image.jpg">
            </div>
            <div class="form-group">
                <label>External Link (optional)</label>
                <input type="url" name="link" placeholder="https://example.com/resource">
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitAddResource()">Add Resource</button>
        </div>
    `);
}

// Image preview and handling functions
let selectedImageData = null;

function previewResourceImage(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Check file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            showNotification('Image must be less than 2MB', 'error');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImageData = e.target.result;
            document.getElementById('image-preview').src = selectedImageData;
            document.getElementById('image-preview-container').style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }
}

function clearImagePreview() {
    selectedImageData = null;
    const fileInput = document.getElementById('resource-image-file');
    if (fileInput) fileInput.value = '';
    const previewContainer = document.getElementById('image-preview-container');
    if (previewContainer) previewContainer.style.display = 'none';
}

async function submitAddResource() {
    const form = document.getElementById('add-resource-form');
    const formData = new FormData(form);
    
    try {
        const resourceData = {
            category: formData.get('category'),
            title: formData.get('title'),
            description: formData.get('description'),
            link: formData.get('link') || null
        };
        
        // Use uploaded image if available, otherwise use URL
        if (selectedImageData) {
            resourceData.image_data = selectedImageData;
        } else if (formData.get('image_url')) {
            resourceData.image_url = formData.get('image_url');
        }
        
        await apiCall('/resources', {
            method: 'POST',
            body: JSON.stringify(resourceData)
        });
        
        selectedImageData = null; // Reset
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
    
    // Reset selected image
    selectedImageData = null;
    
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
                    <option value="Crisis Support">
                    <option value="Wellness">
                    <option value="Career & Employment">
                    <option value="Benefits & Support">
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
                <label>Content (detailed information)</label>
                <textarea name="content" rows="6">${resource.content || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Current Image</label>
                ${resource.image_url ? `<img src="${resource.image_url}" style="max-width: 200px; margin-top: 10px; border-radius: 8px;">` : '<p style="color: var(--text-muted);">No image</p>'}
            </div>
            <div class="form-group">
                <label>Upload New Image</label>
                <div class="image-upload-container">
                    <input type="file" id="edit-resource-image-file" accept="image/*" onchange="previewEditResourceImage(this)">
                    <div id="edit-image-preview-container" style="display:none; margin-top:10px; align-items:center;">
                        <img id="edit-image-preview" style="max-width:200px; max-height:150px; border-radius:8px;">
                        <button type="button" class="btn btn-small btn-danger" onclick="clearEditImagePreview()" style="margin-left:10px;">
                            <i class="fas fa-times"></i> Remove
                        </button>
                    </div>
                </div>
                <small style="color: var(--text-muted);">Upload to replace current image (max 2MB)</small>
            </div>
            <div class="form-group">
                <label>Or Image URL</label>
                <input type="url" name="image_url" value="${resource.image_url || ''}" placeholder="https://example.com/image.jpg">
            </div>
            <div class="form-group">
                <label>External Link (optional)</label>
                <input type="url" name="link" value="${resource.link || ''}">
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitEditResource()">Save Changes</button>
        </div>
    `);
}

function previewEditResourceImage(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > 2 * 1024 * 1024) {
            showNotification('Image must be less than 2MB', 'error');
            input.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImageData = e.target.result;
            document.getElementById('edit-image-preview').src = selectedImageData;
            document.getElementById('edit-image-preview-container').style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }
}

function clearEditImagePreview() {
    selectedImageData = null;
    const fileInput = document.getElementById('edit-resource-image-file');
    if (fileInput) fileInput.value = '';
    const previewContainer = document.getElementById('edit-image-preview-container');
    if (previewContainer) previewContainer.style.display = 'none';
}

async function submitEditResource() {
    const form = document.getElementById('edit-resource-form');
    const formData = new FormData(form);
    const resourceId = formData.get('id');
    
    try {
        const updateData = {
            category: formData.get('category'),
            title: formData.get('title'),
            description: formData.get('description'),
            content: formData.get('content'),
            link: formData.get('link') || null
        };
        
        // Use uploaded image if available, otherwise use URL field
        if (selectedImageData) {
            updateData.image_data = selectedImageData;
        } else if (formData.get('image_url')) {
            updateData.image_url = formData.get('image_url');
        }
        
        await apiCall(`/resources/${resourceId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        selectedImageData = null;
        showNotification('Resource updated successfully');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to update resource: ' + error.message, 'error');
    }
}

// ==========================================
// VoIP Extension Management
// ==========================================

// Render VoIP Staff List
function renderVoIPStaff() {
    const container = document.getElementById('voip-staff-list');
    if (!container) return;
    
    // Combine counsellors and peers
    const allStaff = [
        ...counsellors.map(c => ({ ...c, type: 'counsellor', displayName: c.name })),
        ...peers.map(p => ({ ...p, type: 'peer', displayName: p.firstName || p.name }))
    ];
    
    if (allStaff.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>No staff members found. Add counsellors or peer supporters first.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allStaff.map(staff => {
        const hasSip = staff.sip_extension;
        const typeColor = staff.type === 'counsellor' ? '#22c55e' : '#3b82f6';
        const typeIcon = staff.type === 'counsellor' ? 'user-md' : 'users';
        
        return `
            <div class="card voip-card ${hasSip ? 'has-sip' : ''}" style="border: ${hasSip ? '2px solid #8b5cf6' : '1px solid var(--border-color)'}; background: ${hasSip ? 'rgba(139, 92, 246, 0.05)' : 'var(--card-bg)'};">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-${typeIcon}" style="color: ${typeColor};"></i>
                        <strong style="color: var(--text-primary);">${staff.displayName}</strong>
                        <span class="badge" style="background: ${typeColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; text-transform: capitalize;">
                            ${staff.type}
                        </span>
                    </div>
                    ${hasSip ? `
                        <span class="sip-badge" style="background: #8b5cf6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-phone"></i> Ext. ${staff.sip_extension}
                        </span>
                    ` : `
                        <span style="color: var(--text-muted); font-size: 12px;">No Extension</span>
                    `}
                </div>
                <div class="card-actions" style="margin-top: 12px; display: flex; gap: 8px;">
                    ${hasSip ? `
                        <button class="btn btn-danger btn-small" onclick="removeSipExtension('${staff.id}', '${staff.type}', '${staff.displayName}')">
                            <i class="fas fa-times-circle"></i> Remove SIP
                        </button>
                    ` : `
                        <button class="btn btn-primary btn-small" onclick="openAssignSipModal('${staff.id}', '${staff.type}', '${staff.displayName}')" style="background: #8b5cf6;">
                            <i class="fas fa-plus-circle"></i> Assign Extension
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Open Assign SIP Modal
function openAssignSipModal(staffId, staffType, staffName) {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-phone-volume" style="color: #8b5cf6;"></i> Assign SIP Extension</h2>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div style="background: var(--card-bg); padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <span style="color: var(--text-muted); font-size: 12px;">Assigning to:</span>
                <p style="color: var(--text-primary); font-size: 18px; font-weight: 600; margin: 4px 0;">${staffName}</p>
                <span style="color: #8b5cf6; font-size: 12px; text-transform: capitalize;">(${staffType})</span>
            </div>
            <form id="assign-sip-form">
                <input type="hidden" name="staffId" value="${staffId}">
                <input type="hidden" name="staffType" value="${staffType}">
                
                <div class="form-group">
                    <label><i class="fas fa-hashtag"></i> Extension Number</label>
                    <input type="text" name="extension" required placeholder="e.g., 1000" pattern="[0-9]+" title="Enter numbers only">
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-key"></i> SIP Password</label>
                    <input type="password" name="password" required placeholder="Enter SIP password">
                </div>
                
                <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 12px; margin-top: 16px;">
                    <p style="color: #f59e0b; font-size: 13px; margin: 0;">
                        <i class="fas fa-info-circle"></i> 
                        Get the extension and password from your FusionPBX admin panel. 
                        The password will be encrypted before storing.
                    </p>
                </div>
                
                <div class="modal-actions" style="margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="background: #8b5cf6;">
                        <i class="fas fa-check"></i> Assign Extension
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById('assign-sip-form').addEventListener('submit', handleAssignSip);
    document.getElementById('modal-overlay').classList.remove('hidden');
}

// Handle Assign SIP
async function handleAssignSip(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const staffId = formData.get('staffId');
    const staffType = formData.get('staffType');
    const extension = formData.get('extension');
    const password = formData.get('password');
    
    try {
        const endpoint = staffType === 'counsellor' 
            ? `/admin/counsellors/${staffId}/sip`
            : `/admin/peer-supporters/${staffId}/sip`;
        
        await apiCall(endpoint, {
            method: 'PATCH',
            body: JSON.stringify({
                sip_extension: extension,
                sip_password: password
            })
        });
        
        showNotification(`SIP extension ${extension} assigned successfully`, 'success');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to assign SIP extension: ' + error.message, 'error');
    }
}

// Remove SIP Extension
async function removeSipExtension(staffId, staffType, staffName) {
    if (!confirm(`Remove SIP extension from ${staffName}?`)) {
        return;
    }
    
    try {
        const endpoint = staffType === 'counsellor' 
            ? `/admin/counsellors/${staffId}/sip`
            : `/admin/peer-supporters/${staffId}/sip`;
        
        await apiCall(endpoint, {
            method: 'DELETE'
        });
        
        showNotification(`SIP extension removed from ${staffName}`, 'success');
        loadAllData();
    } catch (error) {
        showNotification('Failed to remove SIP extension: ' + error.message, 'error');
    }
}

// ==========================================
// Unified Staff Management
// ==========================================

// Render Unified Staff List
function renderUnifiedStaff() {
    const container = document.getElementById('staff-list');
    if (!container) return;
    
    // Filter staff based on current filter
    let filteredStaff = unifiedStaff;
    if (currentStaffFilter !== 'all') {
        filteredStaff = unifiedStaff.filter(s => s.role === currentStaffFilter);
    }
    
    if (filteredStaff.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>No staff members found${currentStaffFilter !== 'all' ? ` with role "${currentStaffFilter}"` : ''}.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredStaff.map(staff => {
        const roleColors = {
            admin: '#ef4444',
            counsellor: '#22c55e',
            peer: '#3b82f6'
        };
        const roleIcons = {
            admin: 'shield-alt',
            counsellor: 'user-md',
            peer: 'hands-helping'
        };
        const roleColor = roleColors[staff.role] || '#6b7280';
        const roleIcon = roleIcons[staff.role] || 'user';
        
        // Profile status
        const hasProfile = staff.has_profile;
        const profile = staff.profile || {};
        const status = profile.status || 'N/A';
        
        // Status badge color
        const statusColors = {
            available: '#22c55e',
            busy: '#f59e0b',
            off: '#ef4444',
            limited: '#f59e0b',
            unavailable: '#6b7280'
        };
        const statusColor = statusColors[status] || '#6b7280';
        
        return `
            <div class="card staff-card" data-role="${staff.role}">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <i class="fas fa-${roleIcon}" style="color: ${roleColor}; font-size: 20px;"></i>
                            <strong style="color: var(--text-primary); font-size: 16px;">${staff.name}</strong>
                            <span class="badge" style="background: ${roleColor}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 11px; text-transform: uppercase;">
                                ${staff.role}
                            </span>
                        </div>
                        <p style="color: var(--text-muted); font-size: 13px; margin: 0;">
                            <i class="fas fa-envelope"></i> ${staff.email}
                        </p>
                    </div>
                    ${staff.role !== 'admin' ? `
                        <span class="status-badge" style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; text-transform: capitalize;">
                            ${status}
                        </span>
                    ` : ''}
                </div>
                
                ${staff.role !== 'admin' ? `
                    <div class="profile-info" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                        ${hasProfile ? `
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 13px;">
                                ${staff.role === 'counsellor' ? `
                                    <div><i class="fas fa-briefcase" style="color: var(--text-muted);"></i> ${profile.specialization || 'Not set'}</div>
                                ` : `
                                    <div><i class="fas fa-map-marker-alt" style="color: var(--text-muted);"></i> ${profile.area || 'Not set'}</div>
                                `}
                                <div><i class="fas fa-phone" style="color: var(--text-muted);"></i> ${profile.phone || 'Not set'}</div>
                                ${profile.sip_extension ? `
                                    <div><i class="fas fa-phone-volume" style="color: #8b5cf6;"></i> Ext. ${profile.sip_extension}</div>
                                ` : ''}
                            </div>
                        ` : `
                            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 10px; border-radius: 8px; color: #f59e0b; font-size: 13px;">
                                <i class="fas fa-exclamation-triangle"></i> No profile linked. Click "Fix Missing Profiles" to create one.
                            </div>
                        `}
                    </div>
                ` : ''}
                
                <div class="card-actions" style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                    ${staff.role !== 'admin' && hasProfile ? `
                        <button class="btn btn-secondary btn-small" onclick="openEditStaffModal('${staff.user_id}', '${staff.role}')">
                            <i class="fas fa-edit"></i> Edit Profile
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="openStatusModal('${staff.user_id}', '${staff.role}', '${status}')">
                            <i class="fas fa-toggle-on"></i> Status
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary btn-small" onclick="resetUserPassword('${staff.user_id}', '${staff.name}')">
                        <i class="fas fa-key"></i> Reset Password
                    </button>
                    ${staff.role !== 'admin' ? `
                        <button class="btn btn-danger btn-small" onclick="deleteStaffMember('${staff.user_id}', '${staff.role}', '${staff.name}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Filter Staff
function filterStaff(filter) {
    currentStaffFilter = filter;
    
    // Update active button
    document.querySelectorAll('.staff-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    renderUnifiedStaff();
}

// Fix Missing Profiles
async function fixMissingProfiles() {
    if (!confirm('This will create profiles for all users that don\'t have one. Continue?')) {
        return;
    }
    
    try {
        const result = await apiCall('/admin/fix-missing-profiles', { method: 'POST' });
        showNotification(result.message, 'success');
        loadAllData();
    } catch (error) {
        showNotification('Failed to fix profiles: ' + error.message, 'error');
    }
}

// Open Add Staff Modal
function openAddStaffModal() {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-user-plus"></i> Add Staff Member</h2>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <form id="add-staff-form">
                <div class="form-group">
                    <label><i class="fas fa-envelope"></i> Email *</label>
                    <input type="email" name="email" required placeholder="staff@example.com">
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-lock"></i> Password *</label>
                    <input type="password" name="password" required placeholder="Minimum 8 characters" minlength="8">
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-user"></i> Full Name *</label>
                    <input type="text" name="name" required placeholder="Full name">
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-user-tag"></i> Role *</label>
                    <select name="role" id="staff-role-select" required onchange="toggleRoleFields()">
                        <option value="">Select role...</option>
                        <option value="admin">Admin</option>
                        <option value="counsellor">Counsellor</option>
                        <option value="peer">Peer Supporter</option>
                    </select>
                </div>
                
                <!-- Counsellor-specific fields -->
                <div id="counsellor-fields" style="display: none;">
                    <div class="form-group">
                        <label><i class="fas fa-briefcase"></i> Specialization</label>
                        <input type="text" name="specialization" placeholder="e.g., Trauma & PTSD">
                    </div>
                </div>
                
                <!-- Peer-specific fields -->
                <div id="peer-fields" style="display: none;">
                    <div class="form-group">
                        <label><i class="fas fa-map-marker-alt"></i> Area</label>
                        <input type="text" name="area" placeholder="e.g., North East">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-history"></i> Background</label>
                        <input type="text" name="background" placeholder="e.g., Army, 10 years">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Years Served</label>
                        <input type="text" name="yearsServed" placeholder="e.g., 2005-2015">
                    </div>
                </div>
                
                <!-- Common profile fields for non-admin -->
                <div id="profile-fields" style="display: none;">
                    <div class="form-group">
                        <label><i class="fas fa-phone"></i> Phone</label>
                        <input type="tel" name="phone" placeholder="Phone number">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-sms"></i> SMS Number</label>
                        <input type="tel" name="sms" placeholder="SMS number (optional)">
                    </div>
                    <div class="form-group">
                        <label><i class="fab fa-whatsapp"></i> WhatsApp</label>
                        <input type="tel" name="whatsapp" placeholder="WhatsApp number (optional)">
                    </div>
                </div>
                
                <div class="modal-actions" style="margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-check"></i> Create Staff Member
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById('add-staff-form').addEventListener('submit', handleAddStaff);
    document.getElementById('modal-overlay').classList.remove('hidden');
}

// Toggle role-specific fields
function toggleRoleFields() {
    const role = document.getElementById('staff-role-select').value;
    const counsellorFields = document.getElementById('counsellor-fields');
    const peerFields = document.getElementById('peer-fields');
    const profileFields = document.getElementById('profile-fields');
    
    counsellorFields.style.display = role === 'counsellor' ? 'block' : 'none';
    peerFields.style.display = role === 'peer' ? 'block' : 'none';
    profileFields.style.display = (role === 'counsellor' || role === 'peer') ? 'block' : 'none';
}

// Handle Add Staff
async function handleAddStaff(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const staffData = {
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
        role: formData.get('role'),
        phone: formData.get('phone') || null,
        sms: formData.get('sms') || null,
        whatsapp: formData.get('whatsapp') || null,
        specialization: formData.get('specialization') || null,
        area: formData.get('area') || null,
        background: formData.get('background') || null,
        yearsServed: formData.get('yearsServed') || null
    };
    
    try {
        await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(staffData)
        });
        
        showNotification(`${staffData.role.charAt(0).toUpperCase() + staffData.role.slice(1)} "${staffData.name}" created successfully!`, 'success');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to create staff member: ' + error.message, 'error');
    }
}

// Delete Staff Member
async function deleteStaffMember(userId, role, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? This will remove their user account and profile.`)) {
        return;
    }
    
    try {
        // Delete user account
        await apiCall(`/auth/users/${userId}`, { method: 'DELETE' });
        
        // The profile deletion should ideally be handled server-side
        // For now, we just reload the data
        showNotification(`"${name}" has been deleted`, 'success');
        loadAllData();
    } catch (error) {
        showNotification('Failed to delete staff member: ' + error.message, 'error');
    }
}

// Reset User Password
function resetUserPassword(userId, name) {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-key"></i> Reset Password</h2>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <p style="margin-bottom: 16px;">Reset password for <strong>${name}</strong></p>
            <form id="reset-password-form">
                <input type="hidden" name="user_id" value="${userId}">
                <div class="form-group">
                    <label>New Password</label>
                    <input type="password" name="new_password" required minlength="8" placeholder="Minimum 8 characters">
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Reset Password</button>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await apiCall('/auth/admin-reset-password', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: formData.get('user_id'),
                    new_password: formData.get('new_password')
                })
            });
            showNotification('Password reset successfully', 'success');
            closeModal();
        } catch (error) {
            showNotification('Failed to reset password: ' + error.message, 'error');
        }
    });
    
    document.getElementById('modal-overlay').classList.remove('hidden');
}

// Open Status Modal
function openStatusModal(userId, role, currentStatus) {
    // Find the profile
    const staff = unifiedStaff.find(s => s.user_id === userId);
    if (!staff || !staff.profile) return;
    
    const profileId = staff.profile.id;
    const statuses = role === 'counsellor' 
        ? ['available', 'busy', 'off']
        : ['available', 'limited', 'unavailable'];
    
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-toggle-on"></i> Update Status</h2>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <p style="margin-bottom: 16px;">Update status for <strong>${staff.name}</strong></p>
            <div class="status-options" style="display: flex; flex-direction: column; gap: 10px;">
                ${statuses.map(status => `
                    <button class="btn ${currentStatus === status ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="updateStaffStatus('${profileId}', '${role}', '${status}')"
                            style="justify-content: flex-start;">
                        <i class="fas fa-circle" style="color: ${status === 'available' ? '#22c55e' : status === 'busy' || status === 'limited' ? '#f59e0b' : '#ef4444'};"></i>
                        ${status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('modal-overlay').classList.remove('hidden');
}

// Update Staff Status
async function updateStaffStatus(profileId, role, newStatus) {
    try {
        const endpoint = role === 'counsellor'
            ? `/admin/counsellors/${profileId}/status`
            : `/admin/peer-supporters/${profileId}/status`;
        
        await apiCall(endpoint, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        
        showNotification(`Status updated to "${newStatus}"`, 'success');
        closeModal();
        loadAllData();
    } catch (error) {
        showNotification('Failed to update status: ' + error.message, 'error');
    }
}