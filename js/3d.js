const STEVE_TEXTURE_URL = "http://textures.minecraft.net/texture/86b598b960b7495088c49cc3f8f17234d748f2203e91122a2754602052e06d9d";

function GetSkinFromURL() {
    let path = window.location.pathname;
    let name = path.substring(1);

    if (name === "" || name.toLowerCase().endsWith(".html")) {
        name = "Kiefernpilz";
    }

    if (name.length < 4 || name.length > 16) {
        console.warn(`Никнейм "${name}" имеет недопустимую длину. Загружается скин Steve.`);

        setProperty("--skin", 'url("' + STEVE_TEXTURE_URL + '")');

        if (typeof setupRotation === 'function') {
            setupRotation();
        }
        return;
    }

    const originalGetSkin = GetSkin;

    GetSkin = function(name) {
        originalGetSkin(name);

        if (typeof setupRotation === 'function') {
            setupRotation();
        }
    }

    GetSkin(name);
}

function setProperty(property, value) {
    document.documentElement.style.setProperty(property, value);
}

function GetSkin(name) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.ashcon.app/mojang/v2/user/" + name, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                var skin = response.textures.skin.url.replace("http", "https");

                setProperty("--skin", 'url("' + skin + '")');
                console.log("Загружен скин:", skin);
            } else {
                console.error("Ошибка загрузки скина для имени:", name, ". Статус:", xhr.status);
            }
        }
    };

    xhr.send();
}

let currentRotation = 0;
const spinSpeed = 0.2;
let animationFrameId = null;
let lastTimestamp = 0;
let rotationDirection = 0;

function updateRotation() {
    const scene = document.getElementById('skin-scene');
    if (scene) {
        scene.style.transform = `rotateY(${currentRotation}deg)`;
    }
}

function animateRotation(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    currentRotation += spinSpeed * rotationDirection * deltaTime;

    updateRotation();
    animationFrameId = requestAnimationFrame(animateRotation);
}

function startRotation(dir) {
    rotationDirection = dir;
    if (!animationFrameId) {
        lastTimestamp = 0; // Сбрасываем метку времени при запуске
        animationFrameId = requestAnimationFrame(animateRotation);
    }
}

function stopRotation() {
    rotationDirection = 0;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function setupRotation() {
    const rotateLeftButton = document.getElementById('rotate-left');
    const rotateRightButton = document.getElementById('rotate-right');
    const scene = document.getElementById('skin-scene');

    if (!rotateLeftButton || !rotateRightButton || !scene) {
        console.error("Ошибка: Не найдены элементы управления вращением или сцена (skin-scene).");
        return;
    }

    scene.style.transformStyle = 'preserve-3d';
    updateRotation();

    rotateLeftButton.addEventListener('mousedown', () => startRotation(-1));
    rotateLeftButton.addEventListener('mouseup', stopRotation);
    rotateLeftButton.addEventListener('mouseleave', stopRotation);

    rotateRightButton.addEventListener('mousedown', () => startRotation(1));
    rotateRightButton.addEventListener('mouseup', stopRotation);
    rotateRightButton.addEventListener('mouseleave', stopRotation);

    rotateLeftButton.addEventListener('touchstart', (e) => { e.preventDefault(); startRotation(-1); }, {passive: false});
    rotateLeftButton.addEventListener('touchend', stopRotation);

    rotateRightButton.addEventListener('touchstart', (e) => { e.preventDefault(); startRotation(1); }, {passive: false});
    rotateRightButton.addEventListener('touchend', stopRotation);

    window.addEventListener('blur', stopRotation);
}