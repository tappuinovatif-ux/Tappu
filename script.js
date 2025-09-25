// Tappu - Platform Pembelajaran JavaScript

// Global variables
let currentUser = null;
let currentUserType = null;
let absensiChart = null;

// Google API configuration
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your actual API key
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your actual client ID
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets.readonly';

// ESP32 WebSocket connection
let esp32Socket = null;
const ESP32_WEBSOCKET_URL = 'ws://192.168.1.100:81'; // Replace with your ESP32 IP

// Sample user data (in real application, this would be from a database)
const users = {
    'admin': { password: 'admin123', type: 'admin', name: 'Administrator' },
    'guru1': { password: 'guru123', type: 'guru', name: 'Pak Budi' },
    'guru2': { password: 'guru123', type: 'guru', name: 'Bu Sari' },
    'siswa1': { password: 'siswa123', type: 'siswa', name: 'Ahmad' },
    'siswa2': { password: 'siswa123', type: 'siswa', name: 'Siti' }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeGoogleAPI();
    connectToESP32();
});

// Initialize application
function initializeApp() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('tappuUser');
    const savedUserType = localStorage.getItem('tappuUserType');
    
    if (savedUser && savedUserType) {
        currentUser = savedUser;
        currentUserType = savedUserType;
        showUserInterface();
    }
    
    // Initialize charts
    initializeAbsensiChart();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    setupNavigation();
    
    // Login/Logout
    setupAuthentication();
    
    // Kelas navigation
    setupKelasNavigation();
    
    // Google Drive sync
    document.getElementById('syncGoogleDrive').addEventListener('click', syncGoogleDrive);
    
    // Tugas management
    setupTugasManagement();
    
    // Absensi controls
    setupAbsensiControls();
    
    // ESP32 connection
    document.getElementById('connectESP32').addEventListener('click', connectToESP32);
    
    // Mobile menu
    setupMobileMenu();
    
    // Class entry buttons
    setupClassEntry();
    
    // Back to class list
    setupBackNavigation();
}

// Navigation setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.id === 'loginBtn' || this.id === 'logoutBtn') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Authentication setup
function setupAuthentication() {
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginForm = document.getElementById('loginForm');
    const closeBtn = document.querySelector('.close');
    
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'block';
    });
    
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    closeBtn.addEventListener('click', function() {
        loginModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;
        
        if (authenticateUser(username, password, userType)) {
            currentUser = users[username].name;
            currentUserType = userType;
            
            // Save to localStorage
            localStorage.setItem('tappuUser', currentUser);
            localStorage.setItem('tappuUserType', currentUserType);
            
            showUserInterface();
            loginModal.style.display = 'none';
            loginForm.reset();
        } else {
            alert('Login gagal! Periksa username, password, dan tipe pengguna.');
        }
    });
}

// Authenticate user
function authenticateUser(username, password, userType) {
    const user = users[username];
    return user && user.password === password && user.type === userType;
}

// Show user interface after login
function showUserInterface() {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'block';
    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('currentUser').textContent = currentUser;
    document.getElementById('currentUserType').textContent = currentUserType;
    
    // Show/hide features based on user type
    updateUIBasedOnUserType();
}

// Update UI based on user type
function updateUIBasedOnUserType() {
    const addTugasBtn = document.getElementById('addTugas');
    
    if (currentUserType === 'guru' || currentUserType === 'admin') {
        addTugasBtn.style.display = 'inline-block';
    } else {
        addTugasBtn.style.display = 'none';
    }
    
    // Additional UI updates based on user type can be added here
}

// Logout function
function logout() {
    currentUser = null;
    currentUserType = null;
    localStorage.removeItem('tappuUser');
    localStorage.removeItem('tappuUserType');
    
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('addTugas').style.display = 'none';
    
    // Navigate to home
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('.nav-link[href="#beranda"]').classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('beranda').classList.add('active');
}

// Kelas navigation setup
function setupKelasNavigation() {
    const tabBtns = document.querySelectorAll('#detail-kelas .tab-btn');
    const tabContents = document.querySelectorAll('#detail-kelas .tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show target tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Setup class entry functionality
function setupClassEntry() {
    const masukKelasButtons = document.querySelectorAll('.masuk-kelas-btn');
    
    masukKelasButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const kelasCard = this.closest('.kelas-card');
            const kelasName = kelasCard.getAttribute('data-kelas');
            const kelasTitle = kelasCard.querySelector('h3').textContent;
            
            // Hide kelas list section
            document.getElementById('kelas').classList.remove('active');
            
            // Show detail kelas section
            document.getElementById('detail-kelas').classList.add('active');
            
            // Update kelas title
            document.getElementById('kelasTitle').textContent = kelasTitle;
            
            // Update materials based on selected class
            updateMateriByKelas(kelasName);
            
            // Update assignments based on selected class
            updateTugasByKelas(kelasName);
        });
    });
}

// Setup back navigation
function setupBackNavigation() {
    const backBtn = document.getElementById('backToKelas');
    
    backBtn.addEventListener('click', function() {
        // Hide detail kelas section
        document.getElementById('detail-kelas').classList.remove('active');
        
        // Show kelas list section
        document.getElementById('kelas').classList.add('active');
        
        // Reset to first tab
        const tabBtns = document.querySelectorAll('#detail-kelas .tab-btn');
        const tabContents = document.querySelectorAll('#detail-kelas .tab-content');
        
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        tabBtns[0].classList.add('active');
        tabContents[0].classList.add('active');
    });
}

// Update materials based on selected class
function updateMateriByKelas(kelasName) {
    const materiList = document.getElementById('materiList');
    let materiData = {};
    
    switch(kelasName) {
        case 'matematika':
            materiData = [
                { name: 'Aljabar Linear', type: 'pdf', subject: 'Matematika', date: '2 hari yang lalu' },
                { name: 'Persamaan Kuadrat', type: 'powerpoint', subject: 'Matematika', date: '1 minggu yang lalu' },
                { name: 'Trigonometri', type: 'pdf', subject: 'Matematika', date: '2 minggu yang lalu' }
            ];
            break;
        case 'fisika':
            materiData = [
                { name: 'Hukum Newton', type: 'powerpoint', subject: 'Fisika', date: '1 hari yang lalu' },
                { name: 'Gerak Lurus', type: 'pdf', subject: 'Fisika', date: '3 hari yang lalu' },
                { name: 'Energi dan Usaha', type: 'pdf', subject: 'Fisika', date: '1 minggu yang lalu' }
            ];
            break;
        case 'kimia':
            materiData = [
                { name: 'Tabel Periodik', type: 'pdf', subject: 'Kimia', date: '1 hari yang lalu' },
                { name: 'Ikatan Kimia', type: 'powerpoint', subject: 'Kimia', date: '4 hari yang lalu' },
                { name: 'Reaksi Redoks', type: 'pdf', subject: 'Kimia', date: '1 minggu yang lalu' }
            ];
            break;
        default:
            materiData = [];
    }
    
    materiList.innerHTML = '';
    materiData.forEach(materi => {
        const iconClass = materi.type === 'pdf' ? 'fas fa-file-pdf' : 'fas fa-file-powerpoint';
        const materiItem = document.createElement('div');
        materiItem.className = 'materi-item';
        materiItem.innerHTML = `
            <div class="materi-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="materi-info">
                <h4>${materi.name}</h4>
                <p>${materi.subject} - Uploaded ${materi.date}</p>
            </div>
            <div class="materi-actions">
                <button class="btn-icon"><i class="fas fa-eye"></i></button>
                <button class="btn-icon"><i class="fas fa-download"></i></button>
            </div>
        `;
        materiList.appendChild(materiItem);
    });
}

// Update assignments based on selected class
function updateTugasByKelas(kelasName) {
    const tugasList = document.getElementById('tugasList');
    let tugasData = {};
    
    switch(kelasName) {
        case 'matematika':
            tugasData = [
                { title: 'Soal Aljabar Linear', deadline: '25 September 2024', status: 'pending' },
                { title: 'Latihan Persamaan Kuadrat', deadline: '30 September 2024', status: 'completed' },
                { title: 'Quiz Trigonometri', deadline: '5 Oktober 2024', status: 'pending' }
            ];
            break;
        case 'fisika':
            tugasData = [
                { title: 'Laporan Praktikum Newton', deadline: '28 September 2024', status: 'pending' },
                { title: 'Soal Gerak Lurus', deadline: '2 Oktober 2024', status: 'pending' },
                { title: 'Presentasi Energi', deadline: '10 Oktober 2024', status: 'pending' }
            ];
            break;
        case 'kimia':
            tugasData = [
                { title: 'Hafalan Tabel Periodik', deadline: '26 September 2024', status: 'completed' },
                { title: 'Praktikum Ikatan Kimia', deadline: '3 Oktober 2024', status: 'pending' },
                { title: 'Analisis Reaksi Redoks', deadline: '8 Oktober 2024', status: 'pending' }
            ];
            break;
        default:
            tugasData = [];
    }
    
    tugasList.innerHTML = '';
    tugasData.forEach(tugas => {
        const statusClass = tugas.status === 'completed' ? 'completed' : 'pending';
        const statusText = tugas.status === 'completed' ? 'Selesai' : 'Pending';
        const tugasItem = document.createElement('div');
        tugasItem.className = 'tugas-item';
        tugasItem.innerHTML = `
            <div class="tugas-info">
                <h4>${tugas.title}</h4>
                <p>Deadline: ${tugas.deadline}</p>
                <span class="status ${statusClass}">${statusText}</span>
            </div>
            <div class="tugas-actions">
                <button class="btn-secondary">Lihat Detail</button>
            </div>
        `;
        tugasList.appendChild(tugasItem);
    });
}

// Initialize Google API
function initializeGoogleAPI() {
    if (typeof gapi !== 'undefined') {
        gapi.load('client:auth2', initializeGapiClient);
    }
}

async function initializeGapiClient() {
    try {
        await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            clientId: GOOGLE_CLIENT_ID,
            discoveryDocs: [DISCOVERY_DOC],
            scope: SCOPES
        });
        console.log('Google API initialized successfully');
    } catch (error) {
        console.error('Error initializing Google API:', error);
    }
}

// Sync with Google Drive
async function syncGoogleDrive() {
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
        try {
            await gapi.auth2.getAuthInstance().signIn();
        } catch (error) {
            console.error('Google Sign-in failed:', error);
            alert('Gagal masuk ke Google Drive. Periksa koneksi internet dan coba lagi.');
            return;
        }
    }
    
    try {
        const response = await gapi.client.drive.files.list({
            q: "mimeType='application/pdf' or mimeType='application/vnd.ms-powerpoint' or mimeType='application/vnd.openxmlformats-officedocument.presentationml.presentation'",
            fields: 'files(id, name, mimeType, modifiedTime)'
        });
        
        const files = response.result.files;
        updateMateriList(files);
        alert('Sinkronisasi Google Drive berhasil!');
    } catch (error) {
        console.error('Error syncing Google Drive:', error);
        alert('Gagal sinkronisasi Google Drive. Coba lagi nanti.');
    }
}

// Update materi list from Google Drive
function updateMateriList(files) {
    const materiList = document.getElementById('materiList');
    materiList.innerHTML = '';
    
    files.forEach(file => {
        const materiItem = document.createElement('div');
        materiItem.className = 'materi-item';
        
        const iconClass = getFileIcon(file.mimeType);
        const modifiedDate = new Date(file.modifiedTime).toLocaleDateString('id-ID');
        
        materiItem.innerHTML = `
            <div class="materi-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="materi-info">
                <h4>${file.name}</h4>
                <p>Google Drive - Diperbarui ${modifiedDate}</p>
            </div>
            <div class="materi-actions">
                <button class="btn-icon" onclick="viewFile('${file.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn-icon" onclick="downloadFile('${file.id}', '${file.name}')"><i class="fas fa-download"></i></button>
            </div>
        `;
        
        materiList.appendChild(materiItem);
    });
}

// Get file icon based on mime type
function getFileIcon(mimeType) {
    if (mimeType.includes('pdf')) return 'fas fa-file-pdf';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fas fa-file-powerpoint';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'fas fa-file-word';
    return 'fas fa-file';
}

// View file from Google Drive
function viewFile(fileId) {
    window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
}

// Download file from Google Drive
async function downloadFile(fileId, fileName) {
    try {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        });
        
        const blob = new Blob([response.body], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Gagal mengunduh file. Coba lagi nanti.');
    }
}

// Tugas management setup
function setupTugasManagement() {
    const addTugasBtn = document.getElementById('addTugas');
    const tugasModal = document.getElementById('tugasModal');
    const tugasForm = document.getElementById('tugasForm');
    const closeBtn = tugasModal.querySelector('.close');
    
    addTugasBtn.addEventListener('click', function() {
        tugasModal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', function() {
        tugasModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === tugasModal) {
            tugasModal.style.display = 'none';
        }
    });
    
    tugasForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addNewTugas();
        tugasModal.style.display = 'none';
        tugasForm.reset();
    });
}

// Add new tugas
function addNewTugas() {
    const title = document.getElementById('tugasTitle').value;
    const kelas = document.getElementById('tugasKelas').value;
    const deadline = document.getElementById('tugasDeadline').value;
    const description = document.getElementById('tugasDescription').value;
    
    const tugasList = document.getElementById('tugasList');
    const tugasItem = document.createElement('div');
    tugasItem.className = 'tugas-item';
    
    const deadlineDate = new Date(deadline).toLocaleDateString('id-ID');
    
    tugasItem.innerHTML = `
        <div class="tugas-info">
            <h4>${title}</h4>
            <p>${kelas} - Deadline: ${deadlineDate}</p>
            <span class="status pending">Pending</span>
        </div>
        <div class="tugas-actions">
            <button class="btn-secondary">Lihat Detail</button>
        </div>
    `;
    
    tugasList.appendChild(tugasItem);
    alert('Tugas berhasil ditambahkan!');
}

// Absensi controls setup
function setupAbsensiControls() {
    const refreshBtn = document.getElementById('refreshAbsensi');
    const kelasSelect = document.getElementById('kelasSelect');
    const bulanSelect = document.getElementById('bulanSelect');
    
    refreshBtn.addEventListener('click', refreshAbsensiData);
    kelasSelect.addEventListener('change', updateAbsensiChart);
    bulanSelect.addEventListener('change', updateAbsensiChart);
}

// Initialize absensi chart
function initializeAbsensiChart() {
    const ctx = document.getElementById('absensiChart').getContext('2d');
    
    absensiChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Hadir', 'Sakit', 'Izin', 'Tanpa Keterangan'],
            datasets: [{
                data: [85, 8, 5, 2],
                backgroundColor: [
                    '#28a745',
                    '#ffc107',
                    '#17a2b8',
                    '#dc3545'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                title: {
                    display: true,
                    text: 'Statistik Kehadiran Siswa',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// Update absensi chart
function updateAbsensiChart() {
    const kelas = document.getElementById('kelasSelect').value;
    const bulan = document.getElementById('bulanSelect').value;
    
    // Simulate different data based on selection
    let data;
    switch (kelas) {
        case 'matematika':
            data = [85, 8, 5, 2];
            break;
        case 'fisika':
            data = [82, 10, 6, 2];
            break;
        case 'kimia':
            data = [88, 7, 4, 1];
            break;
        default:
            data = [85, 8, 5, 2];
    }
    
    absensiChart.data.datasets[0].data = data;
    absensiChart.update();
    
    // Update stats
    updateAbsensiStats(data);
}

// Update absensi statistics
function updateAbsensiStats(data) {
    const total = data.reduce((sum, val) => sum + val, 0);
    const hadir = data[0];
    const tidakHadir = total - hadir;
    const persentase = Math.round((hadir / total) * 100);
    
    document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = hadir;
    document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = tidakHadir;
    document.querySelector('.stat-card:nth-child(4) .stat-number').textContent = persentase + '%';
}

// Refresh absensi data
async function refreshAbsensiData() {
    try {
        // Simulate API call to Google Sheets
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update chart with new data
        updateAbsensiChart();
        
        // Update ESP32 status
        updateESP32Status();
        
        alert('Data absensi berhasil diperbarui!');
    } catch (error) {
        console.error('Error refreshing absensi data:', error);
        alert('Gagal memperbarui data absensi. Coba lagi nanti.');
    }
}

// ESP32 WebSocket connection
function connectToESP32() {
    try {
        esp32Socket = new WebSocket(ESP32_WEBSOCKET_URL);
        
        esp32Socket.onopen = function(event) {
            console.log('Connected to ESP32');
            updateESP32Status(true);
        };
        
        esp32Socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            handleESP32Data(data);
        };
        
        esp32Socket.onclose = function(event) {
            console.log('Disconnected from ESP32');
            updateESP32Status(false);
        };
        
        esp32Socket.onerror = function(error) {
            console.error('ESP32 WebSocket error:', error);
            updateESP32Status(false);
        };
    } catch (error) {
        console.error('Failed to connect to ESP32:', error);
        updateESP32Status(false);
    }
}

// Handle ESP32 data
function handleESP32Data(data) {
    if (data.type === 'attendance') {
        // Handle attendance data from ESP32
        console.log('Attendance data received:', data);
        // Update attendance in real-time
        refreshAbsensiData();
    }
}

// Update ESP32 status indicator
function updateESP32Status(isOnline = false) {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.device-status span');
    
    if (isOnline) {
        statusIndicator.className = 'status-indicator online';
        statusText.textContent = 'ESP32 Device - Online';
    } else {
        statusIndicator.className = 'status-indicator offline';
        statusText.textContent = 'ESP32 Device - Offline';
    }
}

// Mobile menu setup
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
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
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
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
    // Additional initialization if needed
    console.log('Tappu Platform loaded successfully');
});
