/* =================================
   MENGAMBIL ELEMENT DARI HTML
================================= */

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


/* =================================
   VARIABEL
================================= */

let photos = [];

let cameraStream = null;

let currentPhoto = 0;


/* =================================
   FUNGSI PINDAH HALAMAN
================================= */

function showPage(page) {

    home.classList.remove("active");

    cameraPage.classList.remove("active");

    resultPage.classList.remove("active");

    page.classList.add("active");

}


/* =================================
   TOMBOL MULAI FOTO
================================= */

startBtn.addEventListener("click", async function() {

    /*
       MEMINTA IZIN KAMERA
       BAGIAN INI JANGAN DIUBAH
    */

    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: "user"
                },

                audio: false

            });


        /*
           Masukkan kamera ke video
        */

        video.srcObject = cameraStream;


        /*
           Pastikan video berjalan
        */

        await video.play();


        /*
           Pindah ke halaman kamera
        */

        showPage(cameraPage);


        /*
           Reset foto
        */

        currentPhoto = 0;

        photos = [];


        photoNumber.innerText =
            "Foto 1 dari 3";


    } catch (error) {

        console.log(error);

        alert(
            "Kamera tidak bisa digunakan. " +
            "Pastikan kamu memberikan izin kamera."
        );

    }

});


/* =================================
   TOMBOL FOTO
================================= */

captureBtn.addEventListener("click", function() {

    startCountdown();

});


/* =================================
   COUNTDOWN
================================= */

function startCountdown() {

    let number = 3;

    countdown.innerText = number;

    countdown.style.display = "block";


    const timer =
        setInterval(function() {

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

        }, 1000);

}


/* =================================
   MENGAMBIL FOTO
================================= */

function takePhoto() {

    /*
       Ambil ukuran ASLI kamera.
       Tidak dipaksa jadi ukuran tertentu.
    */

    const width =
        video.videoWidth;

    const height =
        video.videoHeight;


    if (!width || !height) {

        alert(
            "Kamera belum siap. Coba lagi."
        );

        return;

    }


    photoCanvas.width = width;

    photoCanvas.height = height;


    const context =
        photoCanvas.getContext("2d");


    /*
       MIRROR SEPERTI KAMERA SELFIE
    */

    context.save();

    context.translate(
        width,
        0
    );

    context.scale(
        -1,
        1
    );


    context.drawImage(
        video,
        0,
        0,
        width,
        height
    );


    context.restore();


    /*
       UBAH FOTO JADI HITAM PUTIH
    */

    const imageData =
        context.getImageData(
            0,
            0,
            width,
            height
        );


    const data =
        imageData.data;


    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        const gray =
            0.299 * data[i] +
            0.587 * data[i + 1] +
            0.114 * data[i + 2];


        data[i] = gray;

        data[i + 1] = gray;

        data[i + 2] = gray;

    }


    context.putImageData(
        imageData,
        0,
        0
    );


    /*
       SIMPAN FOTO
    */

    const photo =
        photoCanvas.toDataURL(
            "image/jpeg",
            0.92
        );


    photos.push(photo);


    currentPhoto++;


    /*
       BELUM 3 FOTO
    */

    if (currentPhoto < 3) {

        photoNumber.innerText =
            "Foto " +
            (currentPhoto + 1) +
            " dari 3";

    }


    /*
       SUDAH 3 FOTO
    */

    else {

        finishPhotoSession();

    }

}


/* =================================
   SELESAI FOTO
================================= */

async function finishPhotoSession() {

    /*
       MATIKAN KAMERA
    */

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(function(track) {

                track.stop();

            });

        cameraStream = null;

    }


    /*
       TUNGGU HASIL SELESAI DIBUAT
    */

    await createResult();


    /*
       BARU PINDAH KE HASIL
    */

    showPage(resultPage);

}


/* =================================
   MEMBUAT HASIL PHOTO BOOTH
================================= */

async function createResult() {

    const ctx =
        resultCanvas.getContext("2d");


    /* =================================
       UKURAN PHOTO STRIP
    ================================= */

    const canvasWidth = 640;

    const sideMargin = 45;

    const photoWidth = 550;


    /*
       JARAK ANTAR FOTO
       Dibuat sangat kecil.
    */

    const photoGap = 6;


    /*
       HEADER & FOOTER
    */

    const headerHeight = 225;

    const footerHeight = 220;


    /* =================================
       LOAD SEMUA FOTO
    ================================= */

    const loadedPhotos =
        await Promise.all(

            photos.map(function(src) {

                return loadImage(src);

            })

        );


    /* =================================
       LOAD DOODLE
    ================================= */

    const doodleFiles = [

        "doodle-a.png",

        "doodle-b.png",

        "doodle-c.png",

        "doodle-d.png",

        "doodle-e.png",

        "doodle-f.png",

        "bintang.png",

        "ayam-paha.png",

        "gelato-cup.png"

    ];


    const doodles =
        await Promise.all(

            doodleFiles.map(function(src) {

                return safeLoadImage(src);

            })

        );


    /* =================================
       HITUNG UKURAN SETIAP FOTO
    ================================= */

    const photoData = [];

    let totalPhotoHeight = 0;


    loadedPhotos.forEach(function(image) {

        /*
           PENTING:

           Tinggi mengikuti rasio asli foto.

           TIDAK ADA CROP.
        */

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

    });


    /*
       Total jarak antar foto
    */

    totalPhotoHeight +=
        photoGap * 2;


    /* =================================
       TINGGI CANVAS OTOMATIS
    ================================= */

    const canvasHeight =
        headerHeight +
        totalPhotoHeight +
        footerHeight;


    resultCanvas.width =
        canvasWidth;

    resultCanvas.height =
        canvasHeight;


    /* =================================
       BACKGROUND
    ================================= */

    ctx.fillStyle =
        "#f4f0e8";


    ctx.fillRect(

        0,
        0,
        canvasWidth,
        canvasHeight

    );


    /* =================================
       BORDER
    ================================= */

    ctx.strokeStyle =
        "#151515";


    ctx.lineWidth = 7;


    ctx.strokeRect(

        16,
        16,

        canvasWidth - 32,

        canvasHeight - 32

    );


    /* =================================
       LOGO
    ================================= */

    const logo =
        await safeLoadImage(
            "logo-pse.png"
        );


    if (logo) {

        const logoWidth = 100;


        const logoHeight =
            logoWidth *
            (logo.height / logo.width);


        ctx.save();


        ctx.filter =
            "grayscale(100%)";


        ctx.drawImage(

            logo,

            (canvasWidth - logoWidth) / 2,

            25,

            logoWidth,

            logoHeight

        );


        ctx.restore();

    }


    /* =================================
       DOODLE HEADER
    ================================= */

    drawDoodle(

        ctx,

        doodles[0],

        25,

        50,

        65,

        -12

    );


    drawDoodle(

        ctx,

        doodles[2],

        545,

        55,

        60,

        13

    );


    drawDoodle(

        ctx,

        doodles[6],

        75,

        155,

        34,

        -8

    );


    drawDoodle(

        ctx,

        doodles[7],

        505,

        145,

        62,

        10

    );


    /* =================================
       JUDUL
    ================================= */

    ctx.fillStyle =
        "#151515";


    ctx.textAlign =
        "center";


    ctx.font =
        "bold 32px Arial";


    ctx.fillText(

        "PHOTO BOOTH",

        canvasWidth / 2,

        135

    );


    ctx.font =
        "bold 20px Arial";


    ctx.fillText(

        "POJOK SANTAI ENAK",

        canvasWidth / 2,

        170

    );


    /* =================================
       GARIS HEADER
    ================================= */

    ctx.beginPath();


    ctx.moveTo(
        80,
        200
    );


    ctx.lineTo(
        560,
        200
    );


    ctx.lineWidth = 3;


    ctx.strokeStyle =
        "#151515";


    ctx.stroke();


    /* =================================
       FOTO
    ================================= */

    let currentY =
        headerHeight;


    for (
        let i = 0;
        i < photoData.length;
        i++
    ) {

        const photo =
            photoData[i];


        const x =
            sideMargin;


        /* ==============================
           FOTO ASLI
        ============================== */

        ctx.save();


        ctx.filter =
            "grayscale(100%)";


        /*
           TIDAK CROP.

           Seluruh foto digambar.
        */

        ctx.drawImage(

            photo.image,

            x,

            currentY,

            photo.width,

            photo.height

        );


        ctx.restore();


        /* ==============================
           DOODLE DI ATAS FOTO
        ============================== */

        if (i === 0) {

            /*
               AYAM
               kanan atas
            */

            drawDoodle(

                ctx,

                doodles[7],

                x + photo.width - 105,

                currentY + 35,

                72,

                12

            );


            /*
               DOODLE KIRI ATAS
            */

            drawDoodle(

                ctx,

                doodles[1],

                x + 30,

                currentY + 55,

                48,

                -14

            );


            /*
               BINTANG KIRI BAWAH
            */

            drawDoodle(

                ctx,

                doodles[6],

                x + 35,

                currentY +
                photo.height -
                75,

                38,

                -8

            );

        }


        if (i === 1) {

            /*
               GELATO KIRI ATAS
            */

            drawDoodle(

                ctx,

                doodles[8],

                x + 30,

                currentY + 30,

                72,

                -8

            );


            /*
               DOODLE KANAN BAWAH
            */

            drawDoodle(

                ctx,

                doodles[3],

                x + photo.width - 100,

                currentY +
                photo.height -
                85,

                60,

                14

            );


            /*
               BINTANG
            */

            drawDoodle(

                ctx,

                doodles[6],

                x + photo.width / 2,

                currentY +
                photo.height -
                65,

                32,

                5

            );

        }


        if (i === 2) {

            /*
               AYAM KIRI BAWAH
            */

            drawDoodle(

                ctx,

                doodles[7],

                x + 25,

                currentY +
                photo.height -
                105,

                75,

                -13

            );


            /*
               GELATO KANAN BAWAH
            */

            drawDoodle(

                ctx,

                doodles[8],

                x + photo.width - 105,

                currentY +
                photo.height -
                95,

                70,

                10

            );


            /*
               DOODLE KANAN ATAS
            */

            drawDoodle(

                ctx,

                doodles[4],

                x + photo.width - 90,

                currentY + 40,

                50,

                14

            );


            /*
               BINTANG KIRI ATAS
            */

            drawDoodle(

                ctx,

                doodles[6],

                x + 105,

                currentY + 35,

                30,

                -5

            );

        }


        /*
           LANJUT KE FOTO BERIKUTNYA
        */

        currentY +=
            photo.height +
            photoGap;

    }


    /* =================================
       FOOTER
    ================================= */

    /* garis */

    ctx.beginPath();


    ctx.moveTo(
        80,
        currentY + 15
    );


    ctx.lineTo(
        560,
        currentY + 15
    );


    ctx.lineWidth = 3;


    ctx.stroke();


    /* =================================
       DOODLE FOOTER
    ================================= */

    drawDoodle(

        ctx,

        doodles[7],

        30,

        currentY + 45,

        70,

        -10

    );


    drawDoodle(

        ctx,

        doodles[8],

        535,

        currentY + 45,

        68,

        10

    );


    drawDoodle(

        ctx,

        doodles[2],

        90,

        currentY + 105,

        42,

        -12

    );


    drawDoodle(

        ctx,

        doodles[6],

        505,

        currentY + 110,

        35,

        10

    );


    /* =================================
       TEKS FOOTER
    ================================= */

    ctx.fillStyle =
        "#151515";


    ctx.textAlign =
        "center";


    ctx.font =
        "bold 25px Arial";


    ctx.fillText(

        "THANK YOU!",

        canvasWidth / 2,

        currentY + 85

    );


    ctx.font =
        "17px Arial";


    ctx.fillText(

        "POJOK SANTAI ENAK",

        canvasWidth / 2,

        currentY + 120

    );


    /* TANGGAL OTOMATIS */

    const today =
        new Date();


    const dateText =
        today.toLocaleDateString(
            "id-ID",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );


    ctx.font =
        "14px Arial";


    ctx.fillText(

        dateText,

        canvasWidth / 2,

        currentY + 150

    );


    drawDoodle(

        ctx,

        doodles[6],

        canvasWidth / 2 - 15,

        currentY + 165,

        30,

        0

    );

}


/* =================================
   GAMBAR DOODLE
================================= */

function drawDoodle(

    ctx,
    image,
    x,
    y,
    width,
    rotation = 0

) {

    /*
       Kalau file doodle tidak ditemukan,
       lewati saja.
    */

    if (!image) {
        return;
    }


    const height =
        width *
        (image.height / image.width);


    /*
       Titik tengah doodle
    */

    const centerX =
        x + width / 2;


    const centerY =
        y + height / 2;


    ctx.save();


    /*
       Pindahkan titik tengah
    */

    ctx.translate(
        centerX,
        centerY
    );


    /*
       Putar doodle
    */

    ctx.rotate(
        rotation *
        Math.PI /
        180
    );


    /*
       Semua doodle jadi hitam putih
    */

    ctx.filter =
        "grayscale(100%)";


    /*
       Gambar
    */

    ctx.drawImage(

        image,

        -width / 2,

        -height / 2,

        width,

        height

    );


    ctx.restore();

}


/* =================================
   LOAD GAMBAR
================================= */

function loadImage(src) {

    return new Promise(
        function(resolve, reject) {

            const image =
                new Image();


            image.onload =
                function() {

                    resolve(image);

                };


            image.onerror =
                function() {

                    reject(
                        new Error(
                            "Gambar gagal dimuat: " +
                            src
                        )
                    );

                };


            image.src = src;

        }
    );

}


/* =================================
   LOAD DOODLE TANPA BIKIN ERROR
================================= */

function safeLoadImage(src) {

    return new Promise(
        function(resolve) {

            const image =
                new Image();


            image.onload =
                function() {

                    resolve(image);

                };


            image.onerror =
                function() {

                    console.log(
                        "Doodle tidak ditemukan:",
                        src
                    );


                    resolve(null);

                };


            image.src = src;

        }
    );

}


/* =================================
   DOWNLOAD
================================= */

downloadBtn.addEventListener(
    "click",
    function() {

        const image =
            resultCanvas.toDataURL(
                "image/png"
            );


        const link =
            document.createElement("a");


        link.href =
            image;


        link.download =
            "PSE-PhotoBooth.png";


        link.click();

    }
);


/* =================================
   AMBIL ULANG
================================= */

retryBtn.addEventListener(
    "click",
    async function() {

        /*
           Bersihkan foto lama
        */

        photos = [];

        currentPhoto = 0;


        /*
           Buka kamera lagi
        */

        try {

            cameraStream =
                await navigator.mediaDevices
                .getUserMedia({

                    video: {
                        facingMode: "user"
                    },

                    audio: false

                });


            video.srcObject =
                cameraStream;


            await video.play();


            photoNumber.innerText =
                "Foto 1 dari 3";


            showPage(
                cameraPage
            );

        }

        catch (error) {

        
