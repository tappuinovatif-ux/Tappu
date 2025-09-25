// Tappu - Kelas Detail JavaScript Functions

// Google API configuration
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your actual API key
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your actual client ID
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    setupKelasDetailEventListeners();
    initializeGoogleAPI();
    loadSavedTugas();
    setupDeleteButtons();
});

// Setup event listeners for kelas detail page
function setupKelasDetailEventListeners() {
    // Tab navigation
    setupTabNavigation();
    
    // Google Drive sync
    const syncBtn = document.getElementById('syncGoogleDrive');
    if (syncBtn) {
        syncBtn.addEventListener('click', syncGoogleDrive);
    }
    
    // Tugas management
    setupTugasManagement();
}

// Setup tab navigation
function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show target tab content
            tabContents.forEach(content => content.classList.remove('active'));
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
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
    if (typeof gapi === 'undefined') {
        showNotification('Google API belum dimuat. Coba lagi nanti.', 'error');
        return;
    }

    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
        try {
            await gapi.auth2.getAuthInstance().signIn();
        } catch (error) {
            console.error('Google Sign-in failed:', error);
            showNotification('Gagal masuk ke Google Drive. Periksa koneksi internet dan coba lagi.', 'error');
            return;
        }
    }
    
    try {
        showNotification('Sinkronisasi Google Drive dimulai...', 'info');
        
        const response = await gapi.client.drive.files.list({
            q: "mimeType='application/pdf' or mimeType='application/vnd.ms-powerpoint' or mimeType='application/vnd.openxmlformats-officedocument.presentationml.presentation'",
            fields: 'files(id, name, mimeType, modifiedTime)'
        });
        
        const files = response.result.files;
        updateMateriList(files);
        showNotification('Sinkronisasi Google Drive berhasil!', 'success');
    } catch (error) {
        console.error('Error syncing Google Drive:', error);
        showNotification('Gagal sinkronisasi Google Drive. Coba lagi nanti.', 'error');
    }
}

// Update materi list from Google Drive
function updateMateriList(files) {
    const materiList = document.getElementById('materiList');
    if (!materiList) return;
    
    materiList.innerHTML = '';
    
    if (files.length === 0) {
        materiList.innerHTML = '<p class="no-data">Tidak ada file ditemukan di Google Drive.</p>';
        return;
    }
    
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
                <button class="btn-icon" onclick="viewFile('${file.id}')" title="Lihat File">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="downloadFile('${file.id}', '${file.name}')" title="Unduh File">
                    <i class="fas fa-download"></i>
                </button>
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
        showNotification('Mengunduh file...', 'info');
        
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        });
        
        const blob = new Blob([response.body], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('File berhasil diunduh!', 'success');
    } catch (error) {
        console.error('Error downloading file:', error);
        showNotification('Gagal mengunduh file. Coba lagi nanti.', 'error');
    }
}

// Tugas management setup
function setupTugasManagement() {
    const addTugasBtn = document.getElementById('addTugas');
    const tugasModal = document.getElementById('tugasModal');
    const tugasForm = document.getElementById('tugasForm');
    
    if (addTugasBtn && tugasModal && tugasForm) {
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
}

// Add new tugas
function addNewTugas() {
    const title = document.getElementById('tugasTitle').value;
    const deadline = document.getElementById('tugasDeadline').value;
    const description = document.getElementById('tugasDescription').innerHTML;
    
    const tugasList = document.getElementById('tugasList');
    if (!tugasList) return;
    
    // Create unique ID for the task
    const tugasId = 'tugas_' + Date.now();
    const currentSubject = getCurrentSubject();
    
    // Get uploaded images and attachments
    const images = getUploadedImages();
    const attachments = getUploadedAttachments();
    
    // Create tugas object
    const tugasData = {
        id: tugasId,
        title: title,
        deadline: deadline,
        description: description,
        images: images,
        attachments: attachments,
        subject: currentSubject,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    saveTugasToStorage(tugasData);
    
    const tugasItem = document.createElement('div');
    tugasItem.className = 'tugas-item';
    tugasItem.setAttribute('data-tugas-id', tugasId);
    
    const deadlineDate = new Date(deadline).toLocaleDateString('id-ID');
    
    tugasItem.innerHTML = `
        <div class="tugas-info">
            <h4>${title}</h4>
            <p>Deadline: ${deadlineDate}</p>
            <span class="status pending">Pending</span>
        </div>
        <div class="tugas-actions">
            <button class="btn-secondary">Lihat Detail</button>
            <button class="btn-delete" onclick="deleteTugas('${tugasId}')" style="display: none;"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    tugasList.appendChild(tugasItem);
    
    // Show delete button if user is teacher or admin
    updateDeleteButtonsVisibility();
    
    showNotification('Tugas berhasil ditambahkan!', 'success');
}

// Rich text editor functions
function formatText(command) {
    document.execCommand(command, false, null);
    updateToolbarState();
}

function updateToolbarState() {
    const commands = ['bold', 'italic', 'underline'];
    commands.forEach(command => {
        const btn = document.querySelector(`[onclick="formatText('${command}')"]`);
        if (btn) {
            if (document.queryCommandState(command)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
}

// Insert detailed table function with customization
function insertDetailedTable() {
    const rows = prompt('Berapa baris yang diinginkan? (default: 3)', '3');
    const cols = prompt('Berapa kolom yang diinginkan? (default: 3)', '3');
    
    const numRows = parseInt(rows) || 3;
    const numCols = parseInt(cols) || 3;
    
    let tableHTML = '<table class="tugas-table">\n<thead>\n<tr>\n';
    
    // Create header row
    for (let i = 1; i <= numCols; i++) {
        tableHTML += `<th>Header ${i}</th>\n`;
    }
    tableHTML += '</tr>\n</thead>\n<tbody>\n';
    
    // Create data rows
    for (let i = 1; i <= numRows; i++) {
        tableHTML += '<tr>\n';
        for (let j = 1; j <= numCols; j++) {
            tableHTML += `<td>Data ${i}.${j}</td>\n`;
        }
        tableHTML += '</tr>\n';
    }
    
    tableHTML += '</tbody>\n</table>\n<br>';
    
    const editor = document.getElementById('tugasDescription');
    if (editor) {
        editor.focus();
        document.execCommand('insertHTML', false, tableHTML);
    }
}

// Insert simple table function (keep for backward compatibility)
function insertTable() {
    insertDetailedTable();
}

// Add important note function
function addImportantNote() {
    const noteHTML = `
        <div class="important-note">
            <div class="note-title">
                <i class="fas fa-exclamation-triangle note-icon"></i>
                <strong>Catatan Penting</strong>
            </div>
            <div class="note-content">
                Masukkan catatan penting di sini...
            </div>
        </div>
        <br>
    `;
    
    const editor = document.getElementById('tugasDescription');
    if (editor) {
        editor.focus();
        document.execCommand('insertHTML', false, noteHTML);
    }
}

// Add step by step guide function
function addStepByStep() {
    const stepHTML = `
        <div class="step-by-step">
            <div class="step-title">
                <i class="fas fa-list-ol step-icon"></i>
                <strong>Langkah-langkah Pengerjaan</strong>
            </div>
            <ol class="step-list">
                <li>Langkah pertama: Baca soal dengan teliti</li>
                <li>Langkah kedua: Identifikasi yang diketahui dan ditanya</li>
                <li>Langkah ketiga: Tentukan rumus yang akan digunakan</li>
                <li>Langkah keempat: Substitusi nilai ke dalam rumus</li>
                <li>Langkah kelima: Hitung dan tuliskan jawaban akhir</li>
            </ol>
        </div>
        <br>
    `;
    
    const editor = document.getElementById('tugasDescription');
    if (editor) {
        editor.focus();
        document.execCommand('insertHTML', false, stepHTML);
    }
}

// Add math formula function
function addMathFormula() {
    const formula = prompt('Masukkan rumus matematika (contoh: x = (-b ± √(b²-4ac)) / 2a)', 'x = (-b ± √(b²-4ac)) / 2a');
    
    if (formula) {
        const formulaHTML = `
            <div class="math-formula">
                <div class="formula-title">
                    <i class="fas fa-square-root-alt formula-icon"></i>
                    <strong>Rumus</strong>
                </div>
                <div class="formula-content">
                    ${formula}
                </div>
            </div>
            <br>
        `;
        
        const editor = document.getElementById('tugasDescription');
        if (editor) {
            editor.focus();
            document.execCommand('insertHTML', false, formulaHTML);
        }
    }
}

// Add code block function
function addCodeBlock() {
    const code = prompt('Masukkan kode atau contoh perhitungan:', 'Contoh:\na = 5\nb = 3\nc = a + b\nprint(c)  // Output: 8');
    
    if (code) {
        const codeHTML = `
            <div class="code-block">
                <div class="code-title">
                    <i class="fas fa-code code-icon"></i>
                    <strong>Contoh Kode/Perhitungan</strong>
                </div>
                <pre class="code-content">${code}</pre>
            </div>
            <br>
        `;
        
        const editor = document.getElementById('tugasDescription');
        if (editor) {
            editor.focus();
            document.execCommand('insertHTML', false, codeHTML);
        }
    }
}

// Image upload handling
function setupImageUpload() {
    const imageInput = document.getElementById('tugasImages');
    const imagePreview = document.getElementById('imagePreview');
    
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            handleImageUpload(e.target.files);
        });
    }
}

function handleImageUpload(files) {
    const imagePreview = document.getElementById('imagePreview');
    if (!imagePreview) return;
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageItem = document.createElement('div');
                imageItem.className = 'image-preview-item';
                imageItem.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <button class="remove-btn" onclick="removeImage(this)" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                imageItem.dataset.fileName = file.name;
                imageItem.dataset.fileData = e.target.result;
                imagePreview.appendChild(imageItem);
            };
            reader.readAsDataURL(file);
        }
    });
}

function removeImage(btn) {
    btn.parentElement.remove();
}

// Attachment upload handling
function setupAttachmentUpload() {
    const attachmentInput = document.getElementById('tugasAttachments');
    
    if (attachmentInput) {
        attachmentInput.addEventListener('change', function(e) {
            handleAttachmentUpload(e.target.files);
        });
    }
}

function handleAttachmentUpload(files) {
    const attachmentPreview = document.getElementById('attachmentPreview');
    if (!attachmentPreview) return;
    
    Array.from(files).forEach(file => {
        const attachmentItem = document.createElement('div');
        attachmentItem.className = 'attachment-preview-item';
        attachmentItem.innerHTML = `
            <i class="fas fa-file"></i>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="remove-btn" onclick="removeAttachment(this)" type="button">
                <i class="fas fa-times"></i>
            </button>
        `;
        attachmentItem.dataset.fileName = file.name;
        attachmentItem.dataset.fileSize = file.size;
        attachmentPreview.appendChild(attachmentItem);
    });
}

function removeAttachment(btn) {
    btn.parentElement.remove();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get uploaded images data
function getUploadedImages() {
    const imageItems = document.querySelectorAll('.image-preview-item');
    const images = [];
    
    imageItems.forEach(item => {
        images.push({
            name: item.dataset.fileName,
            data: item.dataset.fileData
        });
    });
    
    return images;
}

// Get uploaded attachments data
function getUploadedAttachments() {
    const attachmentItems = document.querySelectorAll('.attachment-preview-item');
    const attachments = [];
    
    attachmentItems.forEach(item => {
        attachments.push({
            name: item.dataset.fileName,
            size: item.dataset.fileSize
        });
    });
    
    return attachments;
}

// Close modal function
function closeModal() {
    const tugasModal = document.getElementById('tugasModal');
    if (tugasModal) {
        tugasModal.style.display = 'none';
        
        // Clear form
        document.getElementById('tugasForm').reset();
        document.getElementById('tugasDescription').innerHTML = '';
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('attachmentPreview').innerHTML = '';
    }
}

// Initialize enhanced form features
function initializeEnhancedForm() {
    setupImageUpload();
    setupAttachmentUpload();
    
    // Setup rich text editor events
    const editor = document.getElementById('tugasDescription');
    if (editor) {
        editor.addEventListener('keyup', updateToolbarState);
        editor.addEventListener('mouseup', updateToolbarState);
    }
}

// Call initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedForm();
});

// Save tugas to localStorage
function saveTugasToStorage(tugasData) {
    let savedTugas = JSON.parse(localStorage.getItem('tappuTugas') || '[]');
    savedTugas.push(tugasData);
    localStorage.setItem('tappuTugas', JSON.stringify(savedTugas));
}

// Load saved tugas from localStorage
function loadSavedTugas() {
    const savedTugas = JSON.parse(localStorage.getItem('tappuTugas') || '[]');
    const currentSubject = getCurrentSubject();
    const tugasList = document.getElementById('tugasList');
    
    if (!tugasList) return;
    
    // Filter tugas for current subject
    const subjectTugas = savedTugas.filter(tugas => tugas.subject === currentSubject);
    
    // Add saved tugas to the list
    subjectTugas.forEach(tugasData => {
        const tugasItem = document.createElement('div');
        tugasItem.className = 'tugas-item';
        tugasItem.setAttribute('data-tugas-id', tugasData.id);
        
        const deadlineDate = new Date(tugasData.deadline).toLocaleDateString('id-ID');
        
        tugasItem.innerHTML = `
            <div class="tugas-info">
                <h4>${tugasData.title}</h4>
                <p>Deadline: ${deadlineDate}</p>
                <span class="status ${tugasData.status}">${tugasData.status === 'completed' ? 'Selesai' : 'Pending'}</span>
            </div>
            <div class="tugas-actions">
                <button class="btn-secondary">Lihat Detail</button>
                <button class="btn-delete" onclick="deleteTugas('${tugasData.id}')" style="display: none;"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        tugasList.appendChild(tugasItem);
    });
    
    // Update delete buttons visibility
    updateDeleteButtonsVisibility();
}

// Delete tugas
function deleteTugas(tugasId) {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
        return;
    }
    
    // Remove from localStorage
    let savedTugas = JSON.parse(localStorage.getItem('tappuTugas') || '[]');
    savedTugas = savedTugas.filter(tugas => tugas.id !== tugasId);
    localStorage.setItem('tappuTugas', JSON.stringify(savedTugas));
    
    // Remove from DOM
    const tugasItem = document.querySelector(`[data-tugas-id="${tugasId}"]`);
    if (tugasItem) {
        tugasItem.remove();
        showNotification('Tugas berhasil dihapus!', 'success');
    }
}

// Setup delete buttons
function setupDeleteButtons() {
    updateDeleteButtonsVisibility();
}

// Update delete buttons visibility based on user type and subject permissions
function updateDeleteButtonsVisibility() {
    const currentUserType = localStorage.getItem('tappuUserType');
    const currentSubject = getCurrentSubject();
    const deleteButtons = document.querySelectorAll('.btn-delete');
    
    deleteButtons.forEach(btn => {
        if (currentUserType === 'admin') {
            btn.style.display = 'inline-block';
        } else if (currentUserType === 'guru') {
            // Check if teacher can edit this subject
            if (typeof canEditSubject === 'function' && canEditSubject(currentSubject)) {
                btn.style.display = 'inline-block';
            } else {
                btn.style.display = 'none';
            }
        } else {
            btn.style.display = 'none';
        }
    });
}

// Setup tugas detail links
function setupTugasDetailLinks() {
    // Add event listeners to existing "Lihat Detail" buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-secondary') && e.target.textContent.includes('Lihat Detail')) {
            const tugasItem = e.target.closest('.tugas-item');
            if (tugasItem) {
                const tugasId = tugasItem.getAttribute('data-tugas-id');
                
                if (tugasId) {
                    // Navigate with tugasId to load from localStorage
                    window.location.href = `tugas-detail.html?id=${tugasId}`;
                } else {
                    // Fallback for existing tugas without ID
                    const tugasTitle = tugasItem.querySelector('h4').textContent;
                    const tugasDeadline = tugasItem.querySelector('p').textContent.replace('Deadline: ', '');
                    const tugasStatus = tugasItem.querySelector('.status').classList.contains('completed') ? 'completed' : 'pending';
                    
                    // Get current subject from page title or URL
                    const currentSubject = getCurrentSubject();
                    
                    // Navigate to tugas detail page with parameters
                    const params = new URLSearchParams({
                        title: tugasTitle,
                        subject: currentSubject,
                        deadline: tugasDeadline,
                        status: tugasStatus
                    });
                    
                    window.location.href = `tugas-detail.html?${params.toString()}`;
                }
            }
        }
    });
}

// Get current subject from page context
function getCurrentSubject() {
    const pageTitle = document.title;
    if (pageTitle.includes('Matematika')) return 'Matematika';
    if (pageTitle.includes('Fisika')) return 'Fisika';
    if (pageTitle.includes('Kimia')) return 'Kimia';
    
    // Fallback: get from URL or default
    const path = window.location.pathname;
    if (path.includes('matematika')) return 'Matematika';
    if (path.includes('fisika')) return 'Fisika';
    if (path.includes('kimia')) return 'Kimia';
    
    return 'Matematika'; // Default
}

// Initialize tugas detail links when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupTugasDetailLinks();
});
