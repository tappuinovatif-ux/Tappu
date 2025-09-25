// Tappu - Common JavaScript Functions

// Global variables
let currentUser = null;
let currentUserType = null;

// Sample user data (in real application, this would be from a database)
const users = {
    'admin': { password: 'admin123', type: 'admin', name: 'Administrator' },
    'azizah': { password: 'guru123', type: 'guru', name: 'Bu Azizah', subject: 'Fisika' },
    'waafi': { password: 'guru123', type: 'guru', name: 'Bu Waafi', subject: 'Kimia' },
    'agus': { password: 'guru123', type: 'guru', name: 'Pak Agus', subject: 'Matematika' },
    'siswa1': { password: 'siswa123', type: 'siswa', name: 'Ahmad' },
    'siswa2': { password: 'siswa123', type: 'siswa', name: 'Siti' }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Initialize application
function initializeApp() {
    // Hide navigation menus initially
    hideNavigationMenus();
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('tappuUser');
    const savedUserType = localStorage.getItem('tappuUserType');
    
    if (savedUser && savedUserType) {
        currentUser = savedUser;
        currentUserType = savedUserType;
        showUserInterface();
    }
}

// Hide navigation menus when not logged in
function hideNavigationMenus() {
    const berandaMenu = document.getElementById('berandaMenu');
    const kelasMenu = document.getElementById('kelasMenu');
    const absensiMenu = document.getElementById('absensiMenu');
    
    if (berandaMenu) berandaMenu.style.display = 'none';
    if (kelasMenu) kelasMenu.style.display = 'none';
    if (absensiMenu) absensiMenu.style.display = 'none';
}

// Show navigation menus after login
function showNavigationMenus() {
    const berandaMenu = document.getElementById('berandaMenu');
    const kelasMenu = document.getElementById('kelasMenu');
    const absensiMenu = document.getElementById('absensiMenu');
    
    if (berandaMenu) berandaMenu.style.display = 'block';
    if (kelasMenu) kelasMenu.style.display = 'block';
    if (absensiMenu) absensiMenu.style.display = 'block';
}

// Get current user's subject (for teachers)
function getCurrentUserSubject() {
    const savedUser = localStorage.getItem('tappuUser');
    if (!savedUser) return null;
    
    // Find user by name
    for (const [username, userData] of Object.entries(users)) {
        if (userData.name === savedUser) {
            return userData.subject || null;
        }
    }
    return null;
}

// Check if current user can edit specific subject
function canEditSubject(subject) {
    const userType = localStorage.getItem('tappuUserType');
    const userSubject = getCurrentUserSubject();
    
    // Admin can edit everything
    if (userType === 'admin') return true;
    
    // Teachers can only edit their own subject
    if (userType === 'guru') {
        return userSubject === subject;
    }
    
    // Students cannot edit
    return false;
}

// Setup event listeners
function setupEventListeners() {
    // Login/Logout
    setupAuthentication();
    
    // Mobile menu
    setupMobileMenu();
}

// Authentication setup
function setupAuthentication() {
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginForm = document.getElementById('loginForm');
    const closeBtn = document.querySelector('.close');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'block';
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            loginModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (authenticateUser(username, password)) {
                currentUser = users[username].name;
                currentUserType = users[username].type;
                
                // Save to localStorage
                localStorage.setItem('tappuUser', currentUser);
                localStorage.setItem('tappuUserType', currentUserType);
                
                showUserInterface();
                loginModal.style.display = 'none';
                loginForm.reset();
                
                // Show success message
                showNotification('Login berhasil!', 'success');
            } else {
                showNotification('Login gagal! Periksa username dan password.', 'error');
            }
        });
    }
}

// Authenticate user
function authenticateUser(username, password) {
    const user = users[username];
    return user && user.password === password;
}

// Show user interface after login
function showUserInterface() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    const currentUserSpan = document.getElementById('currentUser');
    const currentUserTypeSpan = document.getElementById('currentUserType');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (userInfo) userInfo.style.display = 'block';
    if (currentUserSpan) currentUserSpan.textContent = currentUser;
    if (currentUserTypeSpan) currentUserTypeSpan.textContent = currentUserType;
    
    // Show navigation menu items after login
    showNavigationMenus();
    
    // Show/hide features based on user type
    updateUIBasedOnUserType();
}

// Update UI based on user type
function updateUIBasedOnUserType() {
    const addTugasBtn = document.getElementById('addTugas');
    
    if (addTugasBtn) {
        if (currentUserType === 'admin') {
            addTugasBtn.style.display = 'inline-block';
        } else if (currentUserType === 'guru') {
            // Check if teacher can edit current subject
            const currentSubject = getCurrentSubjectFromPage();
            if (canEditSubject(currentSubject)) {
                addTugasBtn.style.display = 'inline-block';
            } else {
                addTugasBtn.style.display = 'none';
            }
        } else {
            addTugasBtn.style.display = 'none';
        }
    }
    
    // Update delete buttons visibility if function exists
    if (typeof updateDeleteButtonsVisibility === 'function') {
        updateDeleteButtonsVisibility();
    }
    
    // Show read-only message if teacher cannot edit this subject
    showReadOnlyMessage();
}

// Get current subject from page context
function getCurrentSubjectFromPage() {
    const pageTitle = document.title;
    if (pageTitle.includes('Matematika')) return 'Matematika';
    if (pageTitle.includes('Fisika')) return 'Fisika';
    if (pageTitle.includes('Kimia')) return 'Kimia';
    
    // Fallback: get from URL
    const path = window.location.pathname;
    if (path.includes('matematika')) return 'Matematika';
    if (path.includes('fisika')) return 'Fisika';
    if (path.includes('kimia')) return 'Kimia';
    
    return null;
}

// Show read-only message for unauthorized teachers
function showReadOnlyMessage() {
    const currentUserType = localStorage.getItem('tappuUserType');
    const currentSubject = getCurrentSubjectFromPage();
    
    if (currentUserType === 'guru' && currentSubject && !canEditSubject(currentSubject)) {
        // Remove existing message
        const existingMessage = document.querySelector('.read-only-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Add read-only message
        const tugasHeader = document.querySelector('.tugas-header');
        if (tugasHeader) {
            const readOnlyMessage = document.createElement('div');
            readOnlyMessage.className = 'read-only-message';
            readOnlyMessage.innerHTML = `
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 20px; color: #856404;">
                    <i class="fas fa-info-circle" style="margin-right: 10px;"></i>
                    <strong>Mode Hanya Lihat:</strong> Anda hanya dapat melihat tugas mata pelajaran ${currentSubject}. 
                    Untuk mengedit, silakan akses mata pelajaran yang Anda ampu.
                </div>
            `;
            tugasHeader.parentNode.insertBefore(readOnlyMessage, tugasHeader.nextSibling);
        }
    }
}

// Logout function
function logout() {
    currentUser = null;
    currentUserType = null;
    localStorage.removeItem('tappuUser');
    localStorage.removeItem('tappuUserType');
    
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    const addTugasBtn = document.getElementById('addTugas');
    
    if (loginBtn) loginBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
    if (addTugasBtn) addTugasBtn.style.display = 'none';
    
    // Navigate to landing page
    window.location.href = 'landing.html';
}

// Mobile menu setup
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize on page load
window.addEventListener('load', function() {
    console.log('Tappu Platform loaded successfully');
});
