// Configuration file for Veterans Support Admin Portal
// Update this URL to point to your backend API

const CONFIG = {
    // Backend API URL - Preview environment
    API_URL: 'https://radio-check-callback.preview.emergentagent.com',
    
    // For Render production, use:
    // API_URL: 'https://veterans-support-api.onrender.com',
    
    // For local development, use:
    // API_URL: 'http://localhost:8001',
    
    // App version
    VERSION: '1.0.0'
};

// Make config available globally
window.CONFIG = CONFIG;
