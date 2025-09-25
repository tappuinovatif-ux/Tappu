// Tappu - Absensi JavaScript Functions

// Global variables
let absensiChart = null;

// ESP32 WebSocket connection
let esp32Socket = null;
const ESP32_WEBSOCKET_URL = 'ws://192.168.1.100:81'; // Replace with your ESP32 IP

// Sample student data - 30 students per subject
const studentsData = {
    matematika: [
        { id: 1, name: 'Ahmad Rizki', status: 'hadir' },
        { id: 2, name: 'Siti Nurhaliza', status: 'hadir' },
        { id: 3, name: 'Budi Santoso', status: 'sakit' },
        { id: 4, name: 'Dewi Sartika', status: 'hadir' },
        { id: 5, name: 'Eko Prasetyo', status: 'hadir' },
        { id: 6, name: 'Fitri Handayani', status: 'izin' },
        { id: 7, name: 'Gilang Ramadhan', status: 'hadir' },
        { id: 8, name: 'Hani Safitri', status: 'hadir' },
        { id: 9, name: 'Indra Gunawan', status: 'hadir' },
        { id: 10, name: 'Joko Widodo', status: 'tanpa_keterangan' },
        { id: 11, name: 'Kartika Sari', status: 'hadir' },
        { id: 12, name: 'Lukman Hakim', status: 'hadir' },
        { id: 13, name: 'Maya Putri', status: 'hadir' },
        { id: 14, name: 'Nanda Pratama', status: 'sakit' },
        { id: 15, name: 'Oki Setiawan', status: 'hadir' },
        { id: 16, name: 'Putri Ayu', status: 'hadir' },
        { id: 17, name: 'Qori Ananda', status: 'hadir' },
        { id: 18, name: 'Rina Wati', status: 'izin' },
        { id: 19, name: 'Sandi Kurnia', status: 'hadir' },
        { id: 20, name: 'Tina Marlina', status: 'hadir' },
        { id: 21, name: 'Umar Bakri', status: 'hadir' },
        { id: 22, name: 'Vina Sari', status: 'hadir' },
        { id: 23, name: 'Wawan Setiadi', status: 'hadir' },
        { id: 24, name: 'Xenia Putri', status: 'hadir' },
        { id: 25, name: 'Yudi Pratama', status: 'hadir' },
        { id: 26, name: 'Zara Amelia', status: 'hadir' },
        { id: 27, name: 'Adi Nugroho', status: 'hadir' },
        { id: 28, name: 'Bella Safira', status: 'hadir' },
        { id: 29, name: 'Candra Wijaya', status: 'hadir' },
        { id: 30, name: 'Diah Permata', status: 'hadir' }
    ],
    fisika: [
        { id: 1, name: 'Andi Setiawan', status: 'hadir' },
        { id: 2, name: 'Bella Kusuma', status: 'hadir' },
        { id: 3, name: 'Citra Dewi', status: 'hadir' },
        { id: 4, name: 'Doni Pratama', status: 'sakit' },
        { id: 5, name: 'Eka Putri', status: 'hadir' },
        { id: 6, name: 'Fajar Nugroho', status: 'hadir' },
        { id: 7, name: 'Gita Savitri', status: 'izin' },
        { id: 8, name: 'Hendra Wijaya', status: 'hadir' },
        { id: 9, name: 'Ika Sari', status: 'hadir' },
        { id: 10, name: 'Jaka Sembung', status: 'hadir' },
        { id: 11, name: 'Karina Dewi', status: 'hadir' },
        { id: 12, name: 'Luki Hermawan', status: 'hadir' },
        { id: 13, name: 'Mira Santi', status: 'sakit' },
        { id: 14, name: 'Niko Pratama', status: 'hadir' },
        { id: 15, name: 'Ovi Rahayu', status: 'hadir' },
        { id: 16, name: 'Pandu Wijaya', status: 'hadir' },
        { id: 17, name: 'Qila Amara', status: 'hadir' },
        { id: 18, name: 'Reza Gunawan', status: 'hadir' },
        { id: 19, name: 'Sari Indah', status: 'hadir' },
        { id: 20, name: 'Toni Setiawan', status: 'izin' },
        { id: 21, name: 'Umi Kalsum', status: 'hadir' },
        { id: 22, name: 'Vicky Ramadan', status: 'hadir' },
        { id: 23, name: 'Winda Sari', status: 'hadir' },
        { id: 24, name: 'Yoga Pratama', status: 'hadir' },
        { id: 25, name: 'Zahra Putri', status: 'hadir' },
        { id: 26, name: 'Agus Salim', status: 'hadir' },
        { id: 27, name: 'Bima Sakti', status: 'hadir' },
        { id: 28, name: 'Cinta Larasati', status: 'hadir' },
        { id: 29, name: 'Dimas Aditya', status: 'hadir' },
        { id: 30, name: 'Elsa Maharani', status: 'tanpa_keterangan' }
    ],
    kimia: [
        { id: 1, name: 'Arif Rahman', status: 'hadir' },
        { id: 2, name: 'Bunga Citra', status: 'hadir' },
        { id: 3, name: 'Cahyo Budi', status: 'hadir' },
        { id: 4, name: 'Dina Mariana', status: 'hadir' },
        { id: 5, name: 'Edi Susanto', status: 'sakit' },
        { id: 6, name: 'Fani Oktavia', status: 'hadir' },
        { id: 7, name: 'Galih Pratama', status: 'hadir' },
        { id: 8, name: 'Hesti Purwanti', status: 'hadir' },
        { id: 9, name: 'Ivan Gunawan', status: 'hadir' },
        { id: 10, name: 'Jihan Aulia', status: 'hadir' },
        { id: 11, name: 'Kiki Amelia', status: 'hadir' },
        { id: 12, name: 'Lina Marlina', status: 'hadir' },
        { id: 13, name: 'Maulana Yusuf', status: 'hadir' },
        { id: 14, name: 'Nina Sari', status: 'izin' },
        { id: 15, name: 'Oscar Pratama', status: 'hadir' },
        { id: 16, name: 'Prita Dewi', status: 'hadir' },
        { id: 17, name: 'Qonita Rahma', status: 'hadir' },
        { id: 18, name: 'Rudi Hartono', status: 'hadir' },
        { id: 19, name: 'Sinta Bella', status: 'hadir' },
        { id: 20, name: 'Taufik Hidayat', status: 'hadir' },
        { id: 21, name: 'Ulfa Khoiriah', status: 'sakit' },
        { id: 22, name: 'Vero Maulana', status: 'hadir' },
        { id: 23, name: 'Wulan Dari', status: 'hadir' },
        { id: 24, name: 'Yanto Suryadi', status: 'hadir' },
        { id: 25, name: 'Zulfa Amara', status: 'hadir' },
        { id: 26, name: 'Alif Pratama', status: 'hadir' },
        { id: 27, name: 'Bayu Setiawan', status: 'hadir' },
        { id: 28, name: 'Cici Paramitha', status: 'hadir' },
        { id: 29, name: 'Dedi Kurniawan', status: 'hadir' },
        { id: 30, name: 'Erni Susilawati', status: 'hadir' }
    ]
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    setupAbsensiEventListeners();
    initializeAbsensiChart();
    connectToESP32();
    setupAttendanceControl();
});

// Setup event listeners for absensi page
function setupAbsensiEventListeners() {
    // Absensi controls
    const refreshBtn = document.getElementById('refreshAbsensi');
    const kelasSelect = document.getElementById('kelasSelect');
    const bulanSelect = document.getElementById('bulanSelect');
    const connectESP32Btn = document.getElementById('connectESP32');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshAbsensiData);
    }
    
    if (kelasSelect) {
        kelasSelect.addEventListener('change', updateAbsensiChart);
    }
    
    if (bulanSelect) {
        bulanSelect.addEventListener('change', updateAbsensiChart);
    }
    
    if (connectESP32Btn) {
        connectESP32Btn.addEventListener('click', connectToESP32);
    }
}

// Initialize absensi chart
function initializeAbsensiChart() {
    const ctx = document.getElementById('absensiChart');
    if (!ctx) return;
    
    absensiChart = new Chart(ctx.getContext('2d'), {
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
    if (!absensiChart) return;
    
    const kelasSelect = document.getElementById('kelasSelect');
    const bulanSelect = document.getElementById('bulanSelect');
    
    const kelas = kelasSelect ? kelasSelect.value : 'matematika';
    const bulan = bulanSelect ? bulanSelect.value : 'september';
    
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
    
    // Adjust data based on month
    if (bulan === 'oktober') {
        data = data.map(val => Math.max(0, val + Math.floor(Math.random() * 6) - 3));
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
    
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    if (statCards.length >= 4) {
        statCards[0].textContent = total;
        statCards[1].textContent = hadir;
        statCards[2].textContent = tidakHadir;
        statCards[3].textContent = persentase + '%';
    }
}

// Refresh absensi data
async function refreshAbsensiData() {
    try {
        showNotification('Memperbarui data absensi...', 'info');
        
        // Simulate API call to Google Sheets
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update chart with new data
        updateAbsensiChart();
        
        // Update ESP32 status
        updateESP32Status();
        
        showNotification('Data absensi berhasil diperbarui!', 'success');
    } catch (error) {
        console.error('Error refreshing absensi data:', error);
        showNotification('Gagal memperbarui data absensi. Coba lagi nanti.', 'error');
    }
}

// ESP32 WebSocket connection
function connectToESP32() {
    try {
        showNotification('Menghubungkan ke ESP32...', 'info');
        
        esp32Socket = new WebSocket(ESP32_WEBSOCKET_URL);
        
        esp32Socket.onopen = function(event) {
            console.log('Connected to ESP32');
            updateESP32Status(true);
            showNotification('ESP32 terhubung!', 'success');
        };
        
        esp32Socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            handleESP32Data(data);
        };
        
        esp32Socket.onclose = function(event) {
            console.log('Disconnected from ESP32');
            updateESP32Status(false);
            showNotification('ESP32 terputus', 'error');
        };
        
        esp32Socket.onerror = function(error) {
            console.error('ESP32 WebSocket error:', error);
            updateESP32Status(false);
            showNotification('Gagal terhubung ke ESP32', 'error');
        };
    } catch (error) {
        console.error('Failed to connect to ESP32:', error);
        updateESP32Status(false);
        showNotification('Gagal terhubung ke ESP32', 'error');
    }
}

// Handle ESP32 data
function handleESP32Data(data) {
    if (data.type === 'attendance') {
        // Handle attendance data from ESP32
        console.log('Attendance data received:', data);
        // Update attendance in real-time
        refreshAbsensiData();
        showNotification('Data absensi dari ESP32 diterima!', 'info');
    }
}

// Update ESP32 status indicator
function updateESP32Status(isOnline = false) {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.device-status span');
    
    if (statusIndicator && statusText) {
        if (isOnline) {
            statusIndicator.className = 'status-indicator online';
            statusText.textContent = 'ESP32 Device - Online';
        } else {
            statusIndicator.className = 'status-indicator offline';
            statusText.textContent = 'ESP32 Device - Offline';
        }
    }
}

// Setup attendance control
function setupAttendanceControl() {
    const markAllPresentBtn = document.getElementById('markAllPresent');
    const saveAttendanceBtn = document.getElementById('saveAttendance');
    const exportExcelBtn = document.getElementById('exportExcel');
    const kelasSelect = document.getElementById('kelasSelect');
    const searchInput = document.getElementById('studentSearchInput');
    
    if (markAllPresentBtn) {
        markAllPresentBtn.addEventListener('click', markAllStudentsPresent);
    }
    
    if (saveAttendanceBtn) {
        saveAttendanceBtn.addEventListener('click', saveAttendanceChanges);
    }
    
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportToExcel);
    }
    
    if (kelasSelect) {
        kelasSelect.addEventListener('change', function() {
            updateStudentList();
            updateAttendanceControlVisibility();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterStudentList(this.value);
        });
    }
    
    // Initial setup
    updateAttendanceControlVisibility();
    updateStudentList();
}

// Check if user can control attendance for current subject
function canControlAttendance() {
    const currentUserType = localStorage.getItem('tappuUserType');
    const kelasSelect = document.getElementById('kelasSelect');
    const currentSubject = kelasSelect ? kelasSelect.value : 'matematika';
    
    // Admin can control all subjects
    if (currentUserType === 'admin') return true;
    
    // Teachers can only control their own subject
    if (currentUserType === 'guru') {
        if (typeof canEditSubject === 'function') {
            const subjectMap = {
                'matematika': 'Matematika',
                'fisika': 'Fisika',
                'kimia': 'Kimia'
            };
            return canEditSubject(subjectMap[currentSubject]);
        }
    }
    
    return false;
}

// Update attendance control visibility
function updateAttendanceControlVisibility() {
    const attendanceControl = document.getElementById('attendanceControl');
    const currentUserType = localStorage.getItem('tappuUserType');
    
    if (attendanceControl) {
        if ((currentUserType === 'guru' || currentUserType === 'admin') && canControlAttendance()) {
            attendanceControl.style.display = 'block';
        } else {
            attendanceControl.style.display = 'none';
        }
    }
}

// Update student list
function updateStudentList() {
    const studentList = document.getElementById('studentList');
    const kelasSelect = document.getElementById('kelasSelect');
    
    if (!studentList || !kelasSelect) return;
    
    const currentSubject = kelasSelect.value;
    const students = studentsData[currentSubject] || [];
    
    studentList.innerHTML = '';
    
    students.forEach(student => {
        const studentItem = document.createElement('div');
        studentItem.className = 'student-item';
        studentItem.innerHTML = `
            <div class="student-info">
                <span class="student-name">${student.name}</span>
                <span class="student-id">#${student.id}</span>
            </div>
            <div class="attendance-status">
                <button class="status-btn ${student.status === 'hadir' ? 'active' : ''}" 
                        data-student-id="${student.id}" data-status="hadir">
                    <i class="fas fa-check"></i> Hadir
                </button>
                <button class="status-btn ${student.status === 'sakit' ? 'active' : ''}" 
                        data-student-id="${student.id}" data-status="sakit">
                    <i class="fas fa-thermometer-half"></i> Sakit
                </button>
                <button class="status-btn ${student.status === 'izin' ? 'active' : ''}" 
                        data-student-id="${student.id}" data-status="izin">
                    <i class="fas fa-hand-paper"></i> Izin
                </button>
                <button class="status-btn ${student.status === 'tanpa_keterangan' ? 'active' : ''}" 
                        data-student-id="${student.id}" data-status="tanpa_keterangan">
                    <i class="fas fa-question"></i> Alpha
                </button>
            </div>
        `;
        
        studentList.appendChild(studentItem);
    });
    
    // Add event listeners to status buttons
    const statusButtons = studentList.querySelectorAll('.status-btn');
    statusButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const studentId = parseInt(this.dataset.studentId);
            const newStatus = this.dataset.status;
            updateStudentStatus(studentId, newStatus);
        });
    });
}

// Update student status
function updateStudentStatus(studentId, newStatus) {
    const kelasSelect = document.getElementById('kelasSelect');
    const currentSubject = kelasSelect.value;
    
    // Update in data
    const student = studentsData[currentSubject].find(s => s.id === studentId);
    if (student) {
        student.status = newStatus;
        
        // Update UI
        const studentItem = document.querySelector(`[data-student-id="${studentId}"]`).closest('.student-item');
        const statusButtons = studentItem.querySelectorAll('.status-btn');
        
        statusButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.status === newStatus) {
                btn.classList.add('active');
            }
        });
        
        // Update statistics
        updateAttendanceStatistics();
        
        showNotification(`Status ${student.name} diubah menjadi ${getStatusText(newStatus)}`, 'info');
    }
}

// Mark all students present
function markAllStudentsPresent() {
    if (!confirm('Apakah Anda yakin ingin menandai semua siswa hadir?')) {
        return;
    }
    
    const kelasSelect = document.getElementById('kelasSelect');
    const currentSubject = kelasSelect.value;
    
    // Update all students to present
    studentsData[currentSubject].forEach(student => {
        student.status = 'hadir';
    });
    
    // Refresh student list
    updateStudentList();
    updateAttendanceStatistics();
    
    showNotification('Semua siswa telah ditandai hadir!', 'success');
}

// Save attendance changes
function saveAttendanceChanges() {
    try {
        showNotification('Menyimpan perubahan absensi...', 'info');
        
        // Simulate saving to Google Sheets
        setTimeout(() => {
            showNotification('Perubahan absensi berhasil disimpan!', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Error saving attendance:', error);
        showNotification('Gagal menyimpan perubahan absensi', 'error');
    }
}

// Update attendance statistics based on current data
function updateAttendanceStatistics() {
    const kelasSelect = document.getElementById('kelasSelect');
    const currentSubject = kelasSelect.value;
    const students = studentsData[currentSubject] || [];
    
    const statusCounts = {
        hadir: 0,
        sakit: 0,
        izin: 0,
        tanpa_keterangan: 0
    };
    
    students.forEach(student => {
        statusCounts[student.status]++;
    });
    
    const total = students.length;
    const hadir = statusCounts.hadir;
    const tidakHadir = total - hadir;
    const persentase = total > 0 ? Math.round((hadir / total) * 100) : 0;
    
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    if (statCards.length >= 4) {
        statCards[0].textContent = total;
        statCards[1].textContent = hadir;
        statCards[2].textContent = tidakHadir;
        statCards[3].textContent = persentase + '%';
    }
    
    // Update chart
    if (absensiChart) {
        const chartData = [
            statusCounts.hadir,
            statusCounts.sakit,
            statusCounts.izin,
            statusCounts.tanpa_keterangan
        ];
        absensiChart.data.datasets[0].data = chartData;
        absensiChart.update();
    }
}

// Filter student list based on search query
function filterStudentList(searchQuery) {
    const studentItems = document.querySelectorAll('.student-item');
    const query = searchQuery.toLowerCase().trim();
    
    studentItems.forEach(item => {
        const studentName = item.querySelector('.student-name').textContent.toLowerCase();
        const studentId = item.querySelector('.student-id').textContent.toLowerCase();
        
        if (studentName.includes(query) || studentId.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show message if no results found
    const visibleItems = Array.from(studentItems).filter(item => item.style.display !== 'none');
    const studentList = document.getElementById('studentList');
    
    // Remove existing no-results message
    const existingMessage = studentList.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    if (visibleItems.length === 0 && query !== '') {
        const noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results-message';
        noResultsMessage.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #6c757d;">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Tidak ada siswa yang ditemukan dengan kata kunci "<strong>${searchQuery}</strong>"</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Coba gunakan kata kunci yang berbeda</p>
            </div>
        `;
        studentList.appendChild(noResultsMessage);
    }
}

// Export attendance data to Excel
function exportToExcel() {
    try {
        showNotification('Menyiapkan file Excel...', 'info');
        
        const kelasSelect = document.getElementById('kelasSelect');
        const bulanSelect = document.getElementById('bulanSelect');
        const currentSubject = kelasSelect.value;
        const currentMonth = bulanSelect.value;
        const students = studentsData[currentSubject] || [];
        
        // Prepare data for Excel
        const excelData = [];
        
        // Add header row
        excelData.push([
            'No',
            'Nama Siswa',
            'ID Siswa',
            'Status Kehadiran',
            'Keterangan'
        ]);
        
        // Add student data
        students.forEach((student, index) => {
            excelData.push([
                index + 1,
                student.name,
                student.id,
                getStatusText(student.status),
                getStatusDescription(student.status)
            ]);
        });
        
        // Add summary statistics
        const statusCounts = {
            hadir: 0,
            sakit: 0,
            izin: 0,
            tanpa_keterangan: 0
        };
        
        students.forEach(student => {
            statusCounts[student.status]++;
        });
        
        const total = students.length;
        const persentase = total > 0 ? Math.round((statusCounts.hadir / total) * 100) : 0;
        
        // Add empty rows and summary
        excelData.push([]);
        excelData.push(['RINGKASAN ABSENSI']);
        excelData.push(['Total Siswa', total]);
        excelData.push(['Hadir', statusCounts.hadir]);
        excelData.push(['Sakit', statusCounts.sakit]);
        excelData.push(['Izin', statusCounts.izin]);
        excelData.push(['Tanpa Keterangan', statusCounts.tanpa_keterangan]);
        excelData.push(['Persentase Kehadiran', persentase + '%']);
        
        // Add metadata
        excelData.push([]);
        excelData.push(['INFORMASI LAPORAN']);
        excelData.push(['Mata Pelajaran', currentSubject.charAt(0).toUpperCase() + currentSubject.slice(1)]);
        excelData.push(['Bulan', currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1) + ' 2024']);
        excelData.push(['Tanggal Export', new Date().toLocaleDateString('id-ID')]);
        excelData.push(['Waktu Export', new Date().toLocaleTimeString('id-ID')]);
        
        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // Set column widths
        const colWidths = [
            { wch: 5 },   // No
            { wch: 25 },  // Nama Siswa
            { wch: 10 },  // ID Siswa
            { wch: 18 },  // Status Kehadiran
            { wch: 30 }   // Keterangan
        ];
        ws['!cols'] = colWidths;
        
        // Style the header row
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4472C4" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
        
        // Apply header styling
        ['A1', 'B1', 'C1', 'D1', 'E1'].forEach(cell => {
            if (ws[cell]) {
                ws[cell].s = headerStyle;
            }
        });
        
        // Add worksheet to workbook
        const sheetName = `Absensi ${currentSubject.charAt(0).toUpperCase() + currentSubject.slice(1)}`;
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        
        // Generate filename
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `Absensi_${currentSubject}_${currentMonth}_${currentDate}.xlsx`;
        
        // Save file
        XLSX.writeFile(wb, filename);
        
        showNotification('File Excel berhasil diunduh!', 'success');
        
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        showNotification('Gagal mengekspor ke Excel. Pastikan browser mendukung download file.', 'error');
    }
}

// Get status description for Excel export
function getStatusDescription(status) {
    const descriptions = {
        'hadir': 'Siswa hadir dalam pembelajaran',
        'sakit': 'Siswa tidak hadir karena sakit',
        'izin': 'Siswa tidak hadir dengan izin',
        'tanpa_keterangan': 'Siswa tidak hadir tanpa keterangan (Alpha)'
    };
    return descriptions[status] || 'Status tidak diketahui';
}

// Get status text in Indonesian
function getStatusText(status) {
    const statusMap = {
        'hadir': 'Hadir',
        'sakit': 'Sakit',
        'izin': 'Izin',
        'tanpa_keterangan': 'Tanpa Keterangan'
    };
    return statusMap[status] || status;
}
