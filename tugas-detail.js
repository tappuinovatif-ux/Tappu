// Tappu - Tugas Detail JavaScript Functions

// Global variables
let selectedFiles = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    setupTugasDetailEventListeners();
    loadTugasData();
});

// Setup event listeners for tugas detail page
function setupTugasDetailEventListeners() {
    // File upload
    setupFileUpload();
    
    // Submission actions
    setupSubmissionActions();
    
    // Load tugas data from URL parameters
    loadTugasFromURL();
}

// Setup file upload functionality
function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('uploadZone');
    const uploadedFiles = document.getElementById('uploadedFiles');
    const filePreviewList = document.getElementById('filePreviewList');
    
    if (!fileInput || !uploadZone) return;
    
    // File input change event
    fileInput.addEventListener('change', function(e) {
        handleFileSelection(e.target.files);
    });
    
    // Drag and drop events
    uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFileSelection(e.dataTransfer.files);
    });
}

// Handle file selection
function handleFileSelection(files) {
    const uploadZone = document.getElementById('uploadZone');
    const uploadedFiles = document.getElementById('uploadedFiles');
    const filePreviewList = document.getElementById('filePreviewList');
    
    if (files.length === 0) return;
    
    // Add files to selected files array
    Array.from(files).forEach(file => {
        if (isValidFile(file)) {
            selectedFiles.push(file);
        } else {
            showNotification(`File ${file.name} tidak didukung. Hanya file PDF, JPG, PNG, DOC, dan DOCX yang diizinkan.`, 'error');
        }
    });
    
    if (selectedFiles.length > 0) {
        // Hide upload zone and show file preview
        uploadZone.style.display = 'none';
        uploadedFiles.style.display = 'block';
        
        // Update file preview list
        updateFilePreviewList();
    }
}

// Check if file is valid
function isValidFile(file) {
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    return allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
}

// Update file preview list
function updateFilePreviewList() {
    const filePreviewList = document.getElementById('filePreviewList');
    if (!filePreviewList) return;
    
    filePreviewList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-preview-item';
        
        const fileIcon = getFileIconClass(file.type);
        const fileSize = formatFileSize(file.size);
        
        fileItem.innerHTML = `
            <div class="file-preview-info">
                <i class="${fileIcon}"></i>
                <div>
                    <h4>${file.name}</h4>
                    <p>${fileSize}</p>
                </div>
            </div>
            <button class="btn-icon" onclick="removeFile(${index})" title="Hapus File">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        filePreviewList.appendChild(fileItem);
    });
}

// Get file icon class based on file type
function getFileIconClass(fileType) {
    if (fileType.includes('pdf')) return 'fas fa-file-pdf';
    if (fileType.includes('image')) return 'fas fa-file-image';
    if (fileType.includes('word') || fileType.includes('document')) return 'fas fa-file-word';
    return 'fas fa-file';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Remove file from selection
function removeFile(index) {
    selectedFiles.splice(index, 1);
    
    if (selectedFiles.length === 0) {
        // Show upload zone again
        document.getElementById('uploadZone').style.display = 'block';
        document.getElementById('uploadedFiles').style.display = 'none';
    } else {
        updateFilePreviewList();
    }
}

// Setup submission actions
function setupSubmissionActions() {
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitTugas);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelSubmission);
    }
}

// Submit tugas
async function submitTugas() {
    if (selectedFiles.length === 0) {
        showNotification('Pilih file terlebih dahulu!', 'error');
        return;
    }
    
    try {
        showNotification('Mengumpulkan tugas...', 'info');
        
        // Simulate file upload
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Add to history
        addToHistory();
        
        // Clear selection
        selectedFiles = [];
        document.getElementById('uploadZone').style.display = 'block';
        document.getElementById('uploadedFiles').style.display = 'none';
        
        // Update status
        updateTugasStatus('completed');
        
        showNotification('Tugas berhasil dikumpulkan!', 'success');
        
    } catch (error) {
        console.error('Error submitting tugas:', error);
        showNotification('Gagal mengumpulkan tugas. Coba lagi nanti.', 'error');
    }
}

// Cancel submission
function cancelSubmission() {
    selectedFiles = [];
    document.getElementById('uploadZone').style.display = 'block';
    document.getElementById('uploadedFiles').style.display = 'none';
}

// Add submission to history
function addToHistory() {
    const historyCard = document.getElementById('historyCard');
    const historyList = document.getElementById('historyList');
    
    if (!historyList) return;
    
    const now = new Date();
    const timestamp = now.toLocaleString('id-ID');
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <h4>Pengumpulan Tugas</h4>
        <p>File dikumpulkan: ${selectedFiles.map(f => f.name).join(', ')}</p>
        <p class="timestamp">Dikumpulkan pada: ${timestamp}</p>
    `;
    
    historyList.insertBefore(historyItem, historyList.firstChild);
    historyCard.style.display = 'block';
}

// Update tugas status
function updateTugasStatus(status) {
    const statusElement = document.getElementById('tugasStatus');
    const submissionCard = document.getElementById('submissionCard');
    
    if (statusElement) {
        statusElement.className = `status ${status}`;
        statusElement.textContent = status === 'completed' ? 'Selesai' : 'Pending';
    }
    
    if (status === 'completed' && submissionCard) {
        submissionCard.style.display = 'none';
    }
}

// Load tugas data from URL parameters or localStorage
function loadTugasFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const tugasId = urlParams.get('id');
    const tugasTitle = urlParams.get('title');
    const tugasSubject = urlParams.get('subject');
    const tugasDeadline = urlParams.get('deadline');
    const tugasStatus = urlParams.get('status');
    
    // Try to load from localStorage first if tugasId is available
    if (tugasId) {
        const savedTugas = JSON.parse(localStorage.getItem('tappuTugas') || '[]');
        const tugasData = savedTugas.find(tugas => tugas.id === tugasId);
        
        if (tugasData) {
            // Load from saved data
            document.getElementById('tugasTitle').textContent = tugasData.title;
            document.title = `Tappu - ${tugasData.title}`;
            document.getElementById('tugasSubject').textContent = tugasData.subject;
            document.getElementById('tugasDeadline').textContent = new Date(tugasData.deadline).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Load rich content description
            const descriptionElement = document.getElementById('tugasDescription');
            if (descriptionElement && tugasData.description) {
                descriptionElement.innerHTML = tugasData.description;
            }
            
            updateTugasStatus(tugasData.status);
            return;
        }
    }
    
    // Fallback to URL parameters if no saved data found
    if (tugasTitle) {
        document.getElementById('tugasTitle').textContent = tugasTitle;
        document.title = `Tappu - ${tugasTitle}`;
    }
    
    if (tugasSubject) {
        document.getElementById('tugasSubject').textContent = tugasSubject;
    }
    
    if (tugasDeadline) {
        document.getElementById('tugasDeadline').textContent = tugasDeadline;
    }
    
    if (tugasStatus) {
        updateTugasStatus(tugasStatus);
    }
}

// Load tugas data (can be expanded to load from API)
function loadTugasData() {
    // This function can be expanded to load tugas data from an API
    // For now, it uses URL parameters or default data
    
    // Check if user is student - hide submission if completed
    const currentUserType = localStorage.getItem('tappuUserType');
    const submissionCard = document.getElementById('submissionCard');
    
    if (currentUserType === 'siswa') {
        // Students can submit assignments
        if (submissionCard) {
            submissionCard.style.display = 'block';
        }
    } else {
        // Teachers and admins cannot submit
        if (submissionCard) {
            submissionCard.style.display = 'none';
        }
    }
}

// Simulate Google Drive integration for file attachments
function syncTugasFiles() {
    // This would integrate with Google Drive API to fetch assignment files
    showNotification('Sinkronisasi file tugas dari Google Drive...', 'info');
    
    setTimeout(() => {
        showNotification('File tugas berhasil disinkronkan!', 'success');
    }, 1500);
}
