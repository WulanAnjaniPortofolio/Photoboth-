/* =========================================
   PSE PHOTO BOOTH
   VERSION DASAR - TANPA DOODLE
========================================= */


/* =========================================
   AMBIL ELEMENT DARI HTML
========================================= */

const home = document.getElementById("home");
const cameraPage = document.getElementById("cameraPage");
const resultPage = document.getElementById("resultPage");

const startBtn = document.getElementById("startBtn");
const captureBtn = document.getElementById("captureBtn");

const video = document.getElementById("video");
const countdown = document.getElementById("countdown");

const photoNumber = document.getElementById("photoNumber");

const photoCanvas = document.getElementById("photoCanvas");
const resultCanvas = document.getElementById("resultCanvas");

const downloadBtn = document.getElementById("downloadBtn");
const retryBtn = document.getElementById("retryBtn");


/* =========================================
   VARIABEL
========================================= */

let cameraStream = null;

let photos = [];

let currentPhoto = 0;

const TOTAL_PHOTOS = 3;


/* =========================================
   PINDAH HALAMAN
========================================= */

function showPage(page) {

    home.classList.remove("active");
    cameraPage.classList.remove("active");
    resultPage.classList.remove("active");

    page.classList.add("active");
}


/* =========================================
   START PHOTO BOOTH
========================================= */

startBtn.addEventListener("click", async function () {

    console.log("START diklik");

    /* Reset */

    photos = [];
    currentPhoto = 0;

    photoNumber.innerText = "Foto 1 dari 3";


    /*
       LANGSUNG MASUK HALAMAN KAMERA
       supaya kalau permission bermasalah
       kita tetap tahu halaman kameranya bekerja.
    */

    showPage(cameraPage);


    /* =====================================
       CEK SUPPORT KAMERA
    ===================================== */

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        alert(
            "Browser tidak mendukung kamera.\n\n" +
            "Pastikan kamu membuka website melalui HTTPS."
        );

        showPage(home);

        return;
    }


    /* =====================================
       MINTA AKSES KAMERA
    ===================================== */

    try {

        console.log("Meminta izin kamera...");


        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: "user"
                },

                audio: false

            });


        console.log("Kamera berhasil dibuka");


        /* Masukkan kamera ke video */

        video.srcObject = cameraStream;


        /* Pastikan video tampil */

        video.style.display = "block";


        await video.play();


        console.log("Video berjalan");


    }

    catch (error) {

        console.error("CAMERA ERROR:", error);


        alert(
            "Kamera tidak bisa digunakan.\n\n" +
            "Coba izinkan kamera untuk website ini."
        );


        stopCamera();

        showPage(home);

    }

});


/* =========================================
   TOMBOL AMBIL FOTO
========================================= */

captureBtn.addEventListener(
    "click",
    function () {

        startCountdown();

    }
);


/* =========================================
   COUNTDOWN
========================================= */

function startCountdown() {

    let number = 3;


    countdown.innerText = number;

    countdown.style.display = "block";


    const timer = setInterval(
        function () {

            number--;


            if (number > 0) {

                countdown.innerText = number;

            }

            else {

                countdown.innerText = "";

                countdown.style.display = "none";

                clearInterval(timer);


                takePhoto();

            }

        },
        1000
    );

}


/* =========================================
   AMBIL FOTO
========================================= */

function takePhoto() {

    const width = video.videoWidth;

    const height = video.videoHeight;


    /* Kamera belum siap */

    if (!width || !height) {

        alert(
            "Kamera belum siap.\n" +
            "Tunggu sebentar lalu coba lagi."
        );

        return;
    }


    /* Ukuran canvas mengikuti kamera */

    photoCanvas.width = width;

    photoCanvas.height = height;


    const ctx =
        photoCanvas.getContext("2d");


    /* =====================================
       MIRROR SELFIE
    ===================================== */

    ctx.save();

    ctx.translate(width, 0);

    ctx.scale(-1, 1);


    ctx.drawImage(
        video,
        0,
        0,
        width,
        height
    );


    ctx.restore();


    /* =====================================
       SIMPAN FOTO
    ===================================== */

    const photo =
        photoCanvas.toDataURL(
            "image/jpeg",
            0.92
        );


    photos.push(photo);

    currentPhoto++;


    console.log(
        "Foto diambil:",
        currentPhoto
    );


    /* =====================================
       CEK SUDAH 3 FOTO?
    ===================================== */

    if (currentPhoto < TOTAL_PHOTOS) {

        photoNumber.innerText =
            "Foto " +
            (currentPhoto + 1) +
            " dari 3";

    }

    else {

        photoNumber.innerText =
            "Selesai!";


        finishPhotoSession();

    }

}


/* =========================================
   SELESAI SESI FOTO
========================================= */

async function finishPhotoSession() {

    /* Matikan kamera */

    stopCamera();


    /* Buat hasil */

    await createResult();


    /* Pindah ke halaman hasil */

    showPage(resultPage);

}


/* =========================================
   MATIKAN KAMERA
========================================= */

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                function (track) {

                    track.stop();

                }
            );

        cameraStream = null;

    }


    if (video) {

        video.srcObject = null;

    }

}


/* =========================================
   BUAT PHOTO STRIP
========================================= */

function createResult() {

    return new Promise(
        function (resolve) {


            const ctx =
                resultCanvas.getContext("2d");


            /* =================================
               UKURAN PHOTO STRIP
            ================================= */

            const canvasWidth = 640;

            const sideMargin = 45;

            const photoWidth = 550;

            const photoGap = 8;

            const headerHeight = 180;

            const footerHeight = 160;


            /* =================================
               LOAD SEMUA FOTO
            ================================= */

            const loadedPhotos = [];

            let loadedCount = 0;


            photos.forEach(
                function (src, index) {

                    const image =
                        new Image();


                    image.onload =
                        function () {

                            loadedPhotos[index] =
                                image;

                            loadedCount++;


                            if (
                                loadedCount ===
                                photos.length
                            ) {

                                drawResult(
                                    ctx,
                                    loadedPhotos,
                                    canvasWidth,
                                    sideMargin,
                                    photoWidth,
                                    photoGap,
                                    headerHeight,
                                    footerHeight
                                );

                                resolve();

                            }

                        };


                    image.onerror =
                        function () {

                            console.error(
                                "Foto gagal dimuat"
                            );

                            loadedPhotos[index] =
                                null;

                            loadedCount++;


                            if (
                                loadedCount ===
                                photos.length
                            ) {

                                drawResult(
                                    ctx,
                                    loadedPhotos,
                                    canvasWidth,
                                    sideMargin,
                                    photoWidth,
                                    photoGap,
                                    headerHeight,
                                    footerHeight
                                );

                                resolve();

                            }

                        };


                    image.src = src;

                }
            );

        }
    );

}


/* =========================================
   GAMBAR PHOTO STRIP
========================================= */

function drawResult(
    ctx,
    images,
    canvasWidth,
    sideMargin,
    photoWidth,
    photoGap,
    headerHeight,
    footerHeight
) {


    /* =====================================
       HITUNG TINGGI FOTO
    ===================================== */

    let totalPhotoHeight = 0;

    const photoData = [];


    images.forEach(
        function (image) {

            if (!image) {
                return;
            }


            const photoHeight =
                photoWidth *
                (image.height / image.width);


            photoData.push({

                image: image,

                width: photoWidth,

                height: photoHeight

            });


            totalPhotoHeight +=
                photoHeight;

        }
    );


    totalPhotoHeight +=
        photoGap *
        (photoData.length - 1);


    /* =====================================
       TINGGI CANVAS
    ===================================== */

    const canvasHeight =
        headerHeight +
        totalPhotoHeight +
        footerHeight;


    resultCanvas.width =
        canvasWidth;

    resultCanvas.height =
        canvasHeight;


    /* =====================================
       BACKGROUND
    ===================================== */

    ctx.fillStyle =
        "#f4f0e8";


    ctx.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );


    /* =====================================
       BORDER
    ===================================== */

    ctx
