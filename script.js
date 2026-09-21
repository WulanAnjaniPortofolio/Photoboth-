const screens = {
    landing: document.getElementById('screen-landing'),
    camera: document.getElementById('screen-camera'),
    preview: document.getElementById('screen-preview')
};

const modalIzin = document.getElementById('modal-izin');
const video = document.getElementById('camera-feed');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const flashEffect = document.getElementById('flash-effect');
const photoCounter = document.getElementById('photo-counter');
const previewContainer = document.getElementById('preview-container');

let stream;
let photos = [];
const totalPhotos = 3;

// Navigasi Layar
function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

// Event Listeners
document.getElementById('btn-mulai').addEventListener('click', () => {
    modalIzin.classList.remove('hidden');
});

document.getElementById('btn-tolak').addEventListener('click', () => {
    modalIzin.classList.add('hidden');
    alert("Kamera dibutuhkan untuk menggunakan Photo Booth.");
});

document.getElementById('btn-izinkan').addEventListener('click', async () => {
    modalIzin.classList.add('hidden');
    await startCamera();
});

document.getElementById('btn-ulang').addEventListener('click', () => {
    photos = [];
    previewContainer.innerHTML = '';
    showScreen('landing');
});

// Fungsi Mulai Kamera
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" } 
        });
        video.srcObject = stream;
        showScreen('camera');
        startPhotoSequence();
    } catch (err) {
        alert("Gagal mengakses kamera: " + err.message);
    }
}

// Sekuens Pengambilan Foto
async function startPhotoSequence() {
    photos = [];
    
    for (let i = 1; i <= totalPhotos; i++) {
        photoCounter.innerText = `${i-1}/${totalPhotos}`;
        await runCountdown();
        takePhoto();
        photoCounter.innerText = `${i}/${totalPhotos}`;
        await sleep(1000); // Jeda sebelum foto berikutnya
    }
    
    stopCamera();
    showPreview();
}

function runCountdown() {
    return new Promise(resolve => {
        countdownOverlay.classList.remove('hidden');
        let count = 3;
        countdownNumber.innerText = count;
        
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownNumber.innerText = count;
            } else {
                clearInterval(interval);
                countdownOverlay.classList.add('hidden');
                resolve();
            }
        }, 1000);
    });
}

function takePhoto() {
    // Flash effect
    flashEffect.classList.add('flash-active');
    setTimeout(() => flashEffect.classList.remove('flash-active'), 100);

    const canvas = document.getElementById('canvas-capture');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Terapkan filter hitam putih pada hasil jepretan agar sama dengan preview
    ctx.filter = 'grayscale(100%)';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const photoData = canvas.toDataURL('image/png');
    photos.push(photoData);
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

function showPreview() {
    previewContainer.innerHTML = '';
    photos.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        previewContainer.appendChild(img);
    });
    showScreen('preview');
}

// Generate Strip & Download
document.getElementById('btn-download').addEventListener('click', () => {
    generatePhotoStrip();
});

function generatePhotoStrip() {
    const stripCanvas = document.getElementById('canvas-strip');
    const ctx = stripCanvas.getContext('2d');
    
    // Ukuran template strip
    const width = 400;
    const height = 1100;
    stripCanvas.width = width;
    stripCanvas.height = height;
    
    // Background frame (Krem/Putih kotor)
    ctx.fillStyle = "#F5EFE6";
    ctx.fillRect(0, 0, width, height);

    // Menggambar Foto ke dalam Strip
    let yOffset = 150; 
    photos.forEach(src => {
        const img = new Image();
        img.src = src;
        // Kita gunakan rasio crop standar
        ctx.drawImage(img, 40, yOffset, 320, 240);
        yOffset += 260; // Jarak antar foto
    });

    // Menambahkan Logo di Header (Opsional/Sederhana)
    const logoImg = new Image();
    logoImg.src = 'logo-pse.png';
    logoImg.onload = () => {
        ctx.drawImage(logoImg, 120, 20, 160, 100);
        
        // Menambahkan teks footer
        ctx.fillStyle = "#333";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Santai Tempatnya, Juara Rasanya.", width / 2, height - 80);
        ctx.font = "16px Arial";
        
        // Menggunakan tanggal hari ini
        const today = new Date();
        const dateString = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        ctx.fillText(`- ${dateString} -`, width / 2, height - 50);

        // Download eksekusi
        downloadCanvas(stripCanvas);
    };
    
    // Fallback jika logo gagal load cepat
    logoImg.onerror = () => downloadCanvas(stripCanvas);
}

function downloadCanvas(canvas) {
    const link = document.createElement('a');
    link.download = 'Pojok-Santai-Enak-Photobooth.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Helper: Sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
       }
