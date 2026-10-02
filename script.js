```javascript
/* =====================================
   BMW M3 COMPETITION ENGINE SYSTEM
===================================== */

const startBtn = document.getElementById("startBtn");
const lightsBtn = document.getElementById("lightsBtn");

const engineStatus = document.getElementById("engineStatus");
const carImage = document.getElementById("carImage");

const rpmNumber = document.getElementById("rpm");
const rpmBar = document.getElementById("rpmBar");


let engineRunning = false;
let lightsOn = false;

let rpm = 0;


/* =====================================
   ENGINE SOUND
===================================== */

/*
    ჩააგდე შენს პროექტში:

    sounds/
        bmw-m3.wav

    შემდეგ ეს მისამართი გამოიყენება.
*/

const engineSound = new Audio("sounds/bmw-m3.wav");

engineSound.loop = true;
engineSound.volume = 0.65;


/* =====================================
   START ENGINE
===================================== */

startBtn.addEventListener("click", function () {

    if (!engineRunning) {

        engineRunning = true;

        engineStatus.textContent = "ENGINE RUNNING";
        engineStatus.classList.add("running");

        startBtn.classList.add("active");

        startBtn.innerHTML =
            '<span class="power-icon">⏻</span> ENGINE OFF';

        carImage.classList.add("running");


        /*
            ბრაუზერები ხმას მხოლოდ
            მომხმარებლის მოქმედების შემდეგ უშვებენ.
        */

        engineSound.currentTime = 0;

        engineSound.play()
            .catch(function(error) {

                console.log(
                    "Audio could not start:",
                    error
                );

            });


        startRPM();

    }

    else {

        stopEngine();

    }

});


/* =====================================
   STOP ENGINE
===================================== */

function stopEngine() {

    engineRunning = false;

    engineStatus.textContent = "ENGINE OFF";
    engineStatus.classList.remove("running");

    startBtn.classList.remove("active");

    startBtn.innerHTML =
        '<span class="power-icon">⏻</span> ENGINE START';

    carImage.classList.remove("running");


    engineSound.pause();

    engineSound.currentTime = 0;

    rpm = 0;

    updateRPM();

}


/* =====================================
   RPM SYSTEM
===================================== */

function startRPM() {

    if (!engineRunning) {
        return;
    }

    /*
        Idle RPM
    */

    rpm = 850;

    updateRPM();

}


/* =====================================
   UPDATE RPM
===================================== */

function updateRPM() {

    rpmNumber.textContent =
        Math.round(rpm).toLocaleString();

    const percentage =
        Math.min(
            (rpm / 8000) * 100,
            100
        );

    rpmBar.style.width =
        percentage + "%";


    /*
        ხმის სიჩქარის ცვლილება
        RPM-ის მიხედვით.
    */

    if (engineRunning) {

        const playback =
            0.75 + (rpm / 8000) * 0.65;

        engineSound.playbackRate =
            playback;

    }

}


/* =====================================
   GAS / REV
===================================== */

window.addEventListener("keydown", function(event) {

    if (event.code === "Space" && engineRunning) {

        event.preventDefault();

        revEngine();

    }

});


function revEngine() {

    if (!engineRunning) {
        return;
    }


    rpm = 6500;

    updateRPM();


    let decrease =
        setInterval(function() {

            rpm -= 350;

            if (rpm <= 850) {

                rpm = 850;

                clearInterval(decrease);

            }

            updateRPM();

        }, 70);

}


/* =====================================
   LIGHTS
===================================== */

lightsBtn.addEventListener("click", function() {

    lightsOn = !lightsOn;

    if (lightsOn) {

        document.body.classList.add("lights-on");

        lightsBtn.textContent =
            "LIGHTS ON";

    }

    else {

        document.body.classList.remove("lights-on");

        lightsBtn.textContent =
            "LIGHTS";

    }

});


/* =====================================
   MOUSE REV
===================================== */

carImage.addEventListener("click", function() {

    if (engineRunning) {

        revEngine();

    }

});
```
