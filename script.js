```javascript
import * as THREE from "three";


/* ==========================================
   BASIC THREE.JS SETUP
========================================== */

const container =
    document.getElementById("car-container");


const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x050505);


const camera =
    new THREE.PerspectiveCamera(
        35,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );


camera.position.set(
    7,
    3.5,
    8
);


const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });


renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;


container.appendChild(renderer.domElement);


/* ==========================================
   LIGHTS
========================================== */

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        1.7
    );

scene.add(ambientLight);


const mainLight =
    new THREE.DirectionalLight(
        0xffffff,
        4
    );

mainLight.position.set(
    5,
    8,
    5
);

mainLight.castShadow = true;

scene.add(mainLight);


const blueLight =
    new THREE.PointLight(
        0x2563ff,
        12,
        15
    );

blueLight.position.set(
    -5,
    2,
    2
);

scene.add(blueLight);


const redLight =
    new THREE.PointLight(
        0xff1111,
        5,
        10
    );

redLight.position.set(
    5,
    1,
    -5
);

scene.add(redLight);


/* ==========================================
   FLOOR
========================================== */

const floorMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x080808,
        roughness: 0.65,
        metalness: 0.25
    });


const floor =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            40,
            40
        ),
        floorMaterial
    );


floor.rotation.x =
    -Math.PI / 2;

floor.position.y =
    -0.8;

floor.receiveShadow = true;

scene.add(floor);


/* ==========================================
   CAR
========================================== */

const car =
    new THREE.Group();

scene.add(car);


/* ==========================================
   MATERIALS
========================================== */

let bodyColor =
    0x171717;


const bodyMaterial =
    new THREE.MeshStandardMaterial({
        color: bodyColor,
        metalness: 0.8,
        roughness: 0.25
    });


const blackMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x050505,
        metalness: 0.5,
        roughness: 0.35
    });


const glassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x07101c,
        metalness: 0.1,
        roughness: 0.05,
        transparent: true,
        opacity: 0.65
    });


const brakeMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xcc1010,
        metalness: 0.4,
        roughness: 0.25
    });


/* ==========================================
   BODY
========================================== */

const bodyGeometry =
    new THREE.BoxGeometry(
        5.2,
        0.9,
        2.1
    );


const body =
    new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
    );


body.position.y =
    0.25;

body.castShadow = true;

car.add(body);


/* ==========================================
   HOOD
========================================== */

const hood =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.1,
            0.25,
            2
        ),
        bodyMaterial
    );


hood.position.set(
    1.55,
    0.65,
    0
);

hood.rotation.z =
    -0.02;

hood.castShadow = true;

car.add(hood);


/* ==========================================
   ROOF
========================================== */

const roof =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.3,
            0.65,
            1.8
        ),
        bodyMaterial
    );


roof.position.set(
    -0.25,
    0.9,
    0
);

roof.rotation.z =
    0.02;

roof.castShadow = true;

car.add(roof);


/* ==========================================
   WINDOWS
========================================== */

const frontWindow =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.9,
            0.48,
            1.82
        ),
        glassMaterial
    );


frontWindow.position.set(
    0.35,
    1.02,
    0
);

frontWindow.rotation.z =
    -0.15;

car.add(frontWindow);


const rearWindow =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.75,
            0.48,
            1.82
        ),
        glassMaterial
    );


rearWindow.position.set(
    -0.7,
    1.02,
    0
);

rearWindow.rotation.z =
    0.15;

car.add(rearWindow);


/* ==========================================
   WHEELS
========================================== */

const wheels = [];


function createWheel(x, z) {

    const group =
        new THREE.Group();


    const tire =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.55,
                0.55,
                0.35,
                32
            ),
            blackMaterial
        );


    tire.rotation.x =
        Math.PI / 2;


    const rim =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.36,
                0.36,
                0.37,
                24
            ),
            new THREE.MeshStandardMaterial({
                color: 0x777777,
                metalness: 0.9,
                roughness: 0.18
            })
        );


    rim.rotation.x =
        Math.PI / 2;


    group.add(tire);

    group.add(rim);


    group.position.set(
        x,
        -0.25,
        z
    );


    group.rotation.z =
        Math.PI / 2;


    group.castShadow = true;


    car.add(group);

    wheels.push(group);

    return group;
}


createWheel(1.65, 1.05);
createWheel(1.65, -1.05);
createWheel(-1.65, 1.05);
createWheel(-1.65, -1.05);


/* ==========================================
   SPOILER
========================================== */

let spoiler = null;


function createSpoiler(type) {

    if (spoiler) {

        car.remove(spoiler);

        spoiler = null;

    }


    if (type === "none") {
        return;
    }


    spoiler =
        new THREE.Group();


    const wingWidth =
        type === "gt"
            ? 2.2
            : 1.7;


    const wingHeight =
        type === "gt"
            ? 1.05
            : 0.75;


    const wing =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                0.12,
                wingWidth
            ),
            blackMaterial
        );


    wing.position.set(
        -2.2,
        wingHeight,
        0
    );


    spoiler.add(wing);


    const support1 =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.12,
                0.6,
                0.12
            ),
            blackMaterial
        );


    support1.position.set(
        -2.2,
        wingHeight - 0.3,
        0.55
    );


    const support2 =
        support1.clone();


    support2.position.z =
        -0.55;


    spoiler.add(support1);

    spoiler.add(support2);


    car.add(spoiler);
}


/* ==========================================
   FRONT BUMPER
========================================== */

let frontBumper = null;


function createBumper(type) {

    if (frontBumper) {

        car.remove(frontBumper);

        frontBumper = null;

    }


    frontBumper =
        new THREE.Group();


    let width = 2.15;

    let height = 0.25;

    let depth = 0.3;


    if (type === "sport") {

        height = 0.35;

        depth = 0.45;

    }


    if (type === "aggressive") {

        width = 2.3;

        height = 0.45;

        depth = 0.55;

    }


    const bumper =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                depth,
                height,
                width
            ),
            blackMaterial
        );


    bumper.position.set(
        2.65,
        0.05,
        0
    );


    frontBumper.add(bumper);


    car.add(frontBumper);
}


/* ==========================================
   EXHAUST
========================================== */

let exhaustGroup = null;


function createExhaust(type) {

    if (exhaustGroup) {

        car.remove(exhaustGroup);

        exhaustGroup = null;

    }


    exhaustGroup =
        new THREE.Group();


    let size = 0.16;


    if (type === "sport") {
        size = 0.2;
    }

    if (type === "titanium") {
        size = 0.24;
    }

    if (type === "racing") {
        size = 0.28;
    }


    const exhaustMaterial =
        new THREE.MeshStandardMaterial({
            color:
                type === "titanium"
                    ? 0x5e7fa5
                    : 0x222222,

            metalness: 1,

            roughness: 0.2
        });


    for (
        let i = -1;
        i <= 1;
        i += 2
    ) {

        const pipe =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    size,
                    size,
                    0.35,
                    24
                ),
                exhaustMaterial
            );


        pipe.rotation.z =
            Math.PI / 2;


        pipe.position.set(
            -2.7,
            0.05,
            i * 0.45
        );


        exhaustGroup.add(pipe);

    }


    car.add(exhaustGroup);
}


/* ==========================================
   INITIAL PARTS
========================================== */

createSpoiler("none");

createBumper("stock");

createExhaust("stock");


/* ==========================================
   COLOR CHANGE
========================================== */

function changeColor(color) {

    bodyMaterial.color.set(color);

    bodyColor = color;

}


/* ==========================================
   WHEEL STYLE
========================================== */

function changeWheels(type) {

    let rimColor = 0x777777;

    let rimScale = 0.36;


    if (type === "sport") {

        rimColor = 0xeeeeee;

        rimScale = 0.40;

    }


    if (type === "racing") {

        rimColor = 0x111111;

        rimScale = 0.43;

    }


    if (type === "forged") {

        rimColor = 0xb9b9b9;

        rimScale = 0.46;

    }


    wheels.forEach(
        wheel => {

            const rim =
                wheel.children[1];

            rim.material.color.set(
                rimColor
            );

            rim.scale.set(
                1,
                1,
                rimScale / 0.36
            );

        }
    );

}


/* ==========================================
   SUSPENSION
========================================== */

function changeSuspension(value) {

    const height =
        Number(value);


    car.position.y =
        -(height * 0.15);

}


/* ==========================================
   TUNING UI
========================================== */

const colorButtons =
    document.querySelectorAll(
        ".color-option"
    );


colorButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            colorButtons.forEach(
                b =>
                    b.classList.remove(
                        "active"
                    )
            );


            button.classList.add(
                "active"
            );


            const color =
                button.dataset.color;


            changeColor(color);


            document.getElementById(
                "paintName"
            ).textContent =
                colorName(color);

        }
    );

});


function colorName(color) {

    const colors = {

        "#171717": "BLACK",

        "#eeeeee": "WHITE",

        "#143d8f": "BLUE",

        "#790f16": "RED",

        "#555555": "GREY"

    };


    return (
        colors[color] ||
        "CUSTOM"
    );
}


/* ==========================================
   OPTION BUTTONS
========================================== */

const options =
    document.querySelectorAll(
        ".option"
    );


options.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const parent =
                button.parentElement;


            parent
                .querySelectorAll(
                    ".option"
                )
                .forEach(
                    b =>
                        b.classList.remove(
                            "active"
                        )
                );


            button.classList.add(
                "active"
            );


            if (
                button.dataset.wheel
            ) {

                changeWheels(
                    button.dataset.wheel
                );


                document.getElementById(
                    "wheelName"
                ).textContent =
                    button.textContent.trim()
                        .replace(
                            /^\d+/,
                            ""
                        )
                        .trim();

            }


            if (
                button.dataset.spoiler
            ) {

                createSpoiler(
                    button.dataset.spoiler
                );


                document.getElementById(
                    "spoilerName"
                ).textContent =
                    button.textContent.trim()
                        .replace(
                            /^\d+/,
                            ""
                        )
                        .trim();

            }


            if (
                button.dataset.bumper
            ) {

                createBumper(
                    button.dataset.bumper
                );


                document.getElementById(
                    "bumperName"
                ).textContent =
                    button.textContent.trim()
                        .replace(
                            /^\d+/,
                            ""
                        )
                        .trim();

            }


            if (
                button.dataset.exhaust
            ) {

                createExhaust(
                    button.dataset.exhaust
                );


                document.getElementById(
                    "exhaustName"
                ).textContent =
                    button.textContent.trim()
                        .replace(
                            /^\d+/,
                            ""
                        )
                        .trim();

            }


            updatePerformance();

        }
    );

});


/* ==========================================
   SUSPENSION
========================================== */

const suspension =
    document.getElementById(
        "suspension"
    );


suspension.addEventListener(
    "input",
    () => {

        changeSuspension(
            suspension.value
        );


        const value =
            Number(
                suspension.value
            );


        const names = [
            "STOCK",
            "SPORT",
            "LOW",
            "VERY LOW"
        ];


        document.getElementById(
            "heightName"
        ).textContent =
            names[value];

    }
);


/* ==========================================
   PERFORMANCE
========================================== */

function updatePerformance() {

    let power = 503;

    let torque = 650;


    const wheel =
        document.querySelector(
            '[data-wheel].active'
        );


    const exhaust =
        document.querySelector(
            '[data-exhaust].active'
        );


    if (
        exhaust &&
        exhaust.dataset.exhaust ===
        "racing"
    ) {

        power += 20;

        torque += 20;

    }


    if (
        exhaust &&
        exhaust.dataset.exhaust ===
        "titanium"
    ) {

        power += 8;

        torque += 8;

    }


    if (
        wheel &&
        wheel.dataset.wheel ===
        "forged"
    ) {

        power += 3;

    }


    document.getElementById(
        "powerValue"
    ).textContent =
        power + " HP";


    document.getElementById(
        "torqueValue"
    ).textContent =
        torque + " Nm";


    document.getElementById(
        "powerBar"
    ).style.width =
        Math.min(
            power / 6,
            100
        ) + "%";


    document.getElementById(
        "torqueBar"
    ).style.width =
        Math.min(
            torque / 8,
            100
        ) + "%";

}


/* ==========================================
   ENGINE
========================================== */

let engineRunning = false;

let rpm = 0;

let targetRPM = 0;


const engineButton =
    document.getElementById(
        "engineButton"
    );


const revButton =
    document.getElementById(
        "revButton"
    );


const engineState =
    document.getElementById(
        "engineState"
    );


const rpmValue =
    document.getElementById(
        "rpmValue"
    );


let audioContext = null;

let oscillator = null;

let gainNode = null;


function startAudio() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        oscillator =
            audioContext.createOscillator();


        gainNode =
            audioContext.createGain();


        oscillator.type =
            "sawtooth";


        oscillator.frequency.value =
            90;


        gainNode.gain.value =
            0;


        oscillator
            .connect(gainNode)
            .connect(
                audioContext.destination
            );


        oscillator.start();

    }


    audioContext.resume();

}


engineButton.addEventListener(
    "click",
    () => {

        if (!engineRunning) {

            startAudio();

            engineRunning = true;

            targetRPM = 850;

            engineState.textContent =
                "RUNNING";

            engineState.classList.add(
                "running"
            );

            engineButton.textContent =
                "STOP ENGINE";

            engineButton.classList.add(
                "running"
            );

        }

        else {

            engineRunning = false;

            targetRPM = 0;

            engineState.textContent =
                "OFF";

            engineState.classList.remove(
                "running"
            );

            engineButton.textContent =
                "START ENGINE";

            engineButton.classList.remove(
                "running"
            );

        }

    }
);


/* ==========================================
   REV
========================================== */

function revEngine() {

    if (!engineRunning) {
        return;
    }


    targetRPM = 6500;


    setTimeout(
        () => {

            targetRPM = 850;

        },
        700
    );

}


revButton.addEventListener(
    "click",
    revEngine
);


window.addEventListener(
    "keydown",
    event => {

        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            revEngine();

        }

    }
);


/* ==========================================
   CAMERA
========================================== */

const cameraButtons =
    document.querySelectorAll(
        "[data-camera]"
    );


const cameraPositions = {

    front: {
        x: 0,
        y: 2.4,
        z: 9
    },

    side: {
        x: 8,
        y: 2.2,
        z: 0
    },

    rear: {
        x: -8,
        y: 2.2,
        z: 0
    },

    top: {
        x: 0,
        y: 9,
        z: 0.1
    }

};


let targetCamera =
    new THREE.Vector3(
        7,
        3.5,
        8
    );


cameraButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const position =
                    cameraPositions[
                        button.dataset.camera
                    ];


                targetCamera.set(
                    position.x,
                    position.y,
                    position.z
                );

            }
        );

    }
);


/* ==========================================
   MOUSE ROTATION
========================================== */

let mouseDown = false;

let previousX = 0;

let carRotation = 0;


renderer.domElement.addEventListener(
    "mousedown",
    event => {

        mouseDown = true;

        previousX =
            event.clientX;

    }
);


window.addEventListener(
    "mouseup",
    () => {

        mouseDown = false;

    }
);


window.addEventListener(
    "mousemove",
    event => {

        if (!mouseDown) {
            return;
        }


        const difference =
            event.clientX -
            previousX;


        carRotation +=
            difference * 0.008;


        previousX =
            event.clientX;

    }
);


/* ==========================================
   RESET
========================================== */

document.getElementById(
    "resetButton"
).addEventListener(
    "click",
    () => {

        changeColor(
            "#171717"
        );

        changeWheels(
            "stock"
        );

        createSpoiler(
            "none"
        );

        createBumper(
            "stock"
        );

        createExhaust(
            "stock"
        );

        suspension.value = 0;

        changeSuspension(0);


        document.querySelectorAll(
            ".option"
        ).forEach(
            button =>
                button.classList.remove(
                    "active"
                )
        );


        document.querySelectorAll(
            '[data-wheel="stock"],' +
            '[data-spoiler="none"],' +
            '[data-bumper="stock"],' +
            '[data-exhaust="stock"]'
        ).forEach(
            button =>
                button.classList.add(
                    "active"
                )
        );


        colorButtons.forEach(
            button =>
                button.classList.remove(
                    "active"
                )
        );


        document.querySelector(
            '[data-color="#171717"]'
        ).classList.add(
            "active"
        );


        document.getElementById(
            "paintName"
        ).textContent = "BLACK";

        document.getElementById(
            "wheelName"
        ).textContent = "STOCK";

        document.getElementById(
            "spoilerName"
        ).textContent = "NONE";

        document.getElementById(
            "bumperName"
        ).textContent = "STOCK";

        document.getElementById(
            "exhaustName"
        ).textContent = "STOCK";

        document.getElementById(
            "heightName"
        ).textContent = "STOCK";


        updatePerformance();

    }
);


/* ==========================================
   ANIMATION
========================================== */

function animate() {

    requestAnimationFrame(
        animate
    );


    /* Camera movement */

    camera.position.lerp(
        targetCamera,
        0.04
    );


    camera.lookAt(
        0,
        0.2,
        0
    );


    /* Car rotation */

    car.rotation.y =
        carRotation;


    /* RPM */

    rpm +=
        (targetRPM - rpm) *
        0.08;


    rpmValue.textContent =
        Math.round(rpm)
            .toLocaleString();


    /* Engine sound */

    if (
        oscillator &&
        gainNode
    ) {

        const frequency =
            70 +
            (rpm / 8000) * 180;


        oscillator.frequency.value =
            frequency;


        const volume =
            engineRunning
                ? 0.015 +
                  (rpm / 8000) *
                  0.05
                : 0;


        gainNode.gain.value =
            volume;

    }


    renderer.render(
        scene,
        camera
    );

}


animate();


/* ==========================================
   RESIZE
========================================== */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            container.clientWidth /
            container.clientHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            container.clientWidth,
            container.clientHeight
        );

    }
);


/* ==========================================
   REMOVE LOADING TEXT
========================================== */

setTimeout(
    () => {

        const loading =
            document.querySelector(
                ".loading"
            );

        if (loading) {
            loading.remove();
        }

    },
    1200
);
```
