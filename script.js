const map = document.getElementById("map");
const mainMap = document.getElementById("mainMap");
const mapTitle = document.getElementById("mapTitle");
const mapTitle2 = document.getElementById("mapTitle2");
const more = document.getElementById("more");

let x = 0;
let y = 0;
let scale = 1;

let dragging = false;

let startX = 0;
let startY = 0;

let startMapX = 0;
let startMapY = 0;

let currentTitle = "Океан";


// =========================
// ОБНОВЛЕНИЕ КАРТЫ
// =========================

function updateMap() {
    map.style.transform =
        `translate(${x}px, ${y}px) scale(${scale})`;
}


// =========================
// ПЕРЕМЕЩЕНИЕ МЫШЬЮ
// =========================

map.addEventListener("pointerdown", (e) => {

    if (e.pointerType === "touch") {
        return;
    }

    if (e.pointerType === "mouse" && e.button !== 0) {
        return;
    }

    dragging = true;

    mapTitle.textContent = "Перемещение...";

    startX = e.clientX;
    startY = e.clientY;

    startMapX = x;
    startMapY = y;

    map.setPointerCapture(e.pointerId);
});


map.addEventListener("pointermove", (e) => {

    if (e.pointerType === "touch") {
        return;
    }

    if (!dragging) {
        return;
    }

    x = startMapX + e.clientX - startX;
    y = startMapY + e.clientY - startY;

    updateMap();
});


map.addEventListener("pointerup", (e) => {

    if (e.pointerType === "touch") {
        return;
    }

    dragging = false;
    mapTitle.textContent = currentTitle;
});


map.addEventListener("pointercancel", (e) => {

    if (e.pointerType === "touch") {
        return;
    }

    dragging = false;
    mapTitle.textContent = currentTitle;
});


// =========================
// МАСШТАБ КОЛЕСОМ
// =========================

map.addEventListener("wheel", (e) => {

    e.preventDefault();

    const oldScale = scale;

    if (e.deltaY < 0) {
        scale *= 1.1;
    } else {
        scale /= 1.1;
    }

    scale = Math.max(0.2, Math.min(scale, 5));

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    x = mouseX - (mouseX - x) * (scale / oldScale);
    y = mouseY - (mouseY - y) * (scale / oldScale);

    updateMap();

}, { passive: false });


// =========================
// TOUCH + PINCH
// =========================

let fingers = new Map();

let touchStartX = 0;
let touchStartY = 0;

let touchStartMapX = 0;
let touchStartMapY = 0;

let pinchStartDistance = 0;
let pinchStartScale = 1;

let pinchStartCenterX = 0;
let pinchStartCenterY = 0;

let pinchStartX = 0;
let pinchStartY = 0;


// Расстояние между пальцами
function getDistance(a, b) {

    return Math.hypot(
        a.x - b.x,
        a.y - b.y
    );
}


// Центр пальцев
function getCenter(a, b) {

    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2
    };
}


// Начало касания
document.addEventListener("pointerdown", (e) => {

    if (e.pointerType !== "touch") {
        return;
    }

    if (!e.target.closest("#map")) {
        return;
    }

    fingers.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY
    });


    // Первый палец
    if (fingers.size === 1) {

        dragging = true;

        touchStartX = e.clientX;
        touchStartY = e.clientY;

        touchStartMapX = x;
        touchStartMapY = y;

        return;
    }


    // Второй палец
    if (fingers.size === 2) {

        // Полностью выключаем обычное перемещение
        dragging = false;

        const points = [...fingers.values()];

        const center =
            getCenter(points[0], points[1]);

        pinchStartDistance =
            getDistance(points[0], points[1]);

        pinchStartScale = scale;

        pinchStartCenterX = center.x;
        pinchStartCenterY = center.y;

        // Текущее положение карты
        pinchStartX = x;
        pinchStartY = y;
    }

}, true);


// Движение пальца
document.addEventListener("pointermove", (e) => {

    if (e.pointerType !== "touch") {
        return;
    }

    if (!fingers.has(e.pointerId)) {
        return;
    }

    fingers.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY
    });


    // =========================
    // ДВА ПАЛЬЦА
    // =========================

    if (fingers.size === 2) {

        e.preventDefault();

        const points = [...fingers.values()];

        const distance =
            getDistance(points[0], points[1]);

        const center =
            getCenter(points[0], points[1]);


        // Новый масштаб
        scale =
            pinchStartScale *
            (distance / pinchStartDistance);

        scale = Math.max(
            0.2,
            Math.min(scale, 5)
        );


        // Коэффициент масштаба
        const ratio =
            scale / pinchStartScale;


        // Смещение центра пальцев
        const centerMoveX =
            center.x - pinchStartCenterX;

        const centerMoveY =
            center.y - pinchStartCenterY;


        // Сохраняем точку карты под пальцами
        x =
            pinchStartX +
            centerMoveX -
            (pinchStartCenterX - pinchStartX) *
            (ratio - 1);

        y =
            pinchStartY +
            centerMoveY -
            (pinchStartCenterY - pinchStartY) *
            (ratio - 1);


        updateMap();

        return;
    }


    // =========================
    // ОДИН ПАЛЕЦ
    // =========================

    if (fingers.size === 1 && dragging) {

        x =
            touchStartMapX +
            e.clientX -
            touchStartX;

        y =
            touchStartMapY +
            e.clientY -
            touchStartY;

        updateMap();
    }

}, true);


// Отпускание пальца
document.addEventListener("pointerup", (e) => {

    if (e.pointerType !== "touch") {
        return;
    }

    fingers.delete(e.pointerId);

    if (fingers.size === 0) {
        dragging = false;
    }

}, true);


// Отмена касания
document.addEventListener("pointercancel", (e) => {

    if (e.pointerType !== "touch") {
        return;
    }

    fingers.delete(e.pointerId);

    if (fingers.size === 0) {
        dragging = false;
    }

}, true);


// =========================
// НАВЕДЕНИЕ НА КАРТУ
// =========================

mainMap.addEventListener("mouseenter", () => {

    currentTitle = "Bellmont";

    if (!dragging) {
        mapTitle.textContent = currentTitle;
    }
});


mainMap.addEventListener("mouseleave", () => {

    currentTitle = "Океан";

    if (!dragging) {
        mapTitle.textContent = currentTitle;
    }
});


// =========================
// ДАННЫЕ ОБЪЕКТОВ
// =========================

const areas = {

    delPuerto: [
        "Bellmont, Дель-Пуэрто",
        "",
        ""
    ],

    creatorPark: [
        "Bellmont, Парк Творца",
        "",
        ""
    ],

    stoneWismant: [
        "Bellmont, Парк Творца",
        "Статуя Wismant",
        "Высота 38m"
    ],

    fountaunCreator: [
        "Bellmont, Парк Творца",
        "Фонтан Творца",
        "Начало и зарождение Дель-Пуэрто"
    ],

    makarona: [
        "Bellmont, Парк Творца",
        "Пьедестал i_makarona07",
        "Благодарность за доброту"
    ],

    walkOfFame: [
        "Bellmont, Парк Творца",
        "Аллея славы",
        "ririkxxs, _ved1mak_ и другие"
    ],

    bigThrees: [
        "Bellmont, Парк Творца",
        "Древнее древо",
        "Высота: 23m"
    ],

    firstStreet: [
        "Bellmont, Дель-Пуэрто",
        "Улица первозданная",
        "Протяженность: 112m"
    ],

    ved1makStreet: [
        "Bellmont, Дель-Пуэрто",
        "Улица имени _ved1mak_",
        "Протяженность: 67m"
    ],

    problemStreet: [
        "Bellmont, Дель-Пуэрто",
        "Улица больших проблем",
        "Протяженность: 48m"
    ],

    hotelGrandRed: [
        "Bellmont, Дель-Пуэрто",
        "Улица имени _ved1mak_",
        "Отель Grand Red, 4"
    ],

    hotelGrandGreen: [
        "Bellmont, Дель-Пуэрто",
        "Улица имени _ved1mak_",
        "Отель Grand Green, 5"
    ],

    home1: [
        "Bellmont, Дель-Пуэрто",
        "Улица первозданная",
        "Дом Хуаны Гарсии, 1"
    ],

    home2: [
        "Bellmont, Дель-Пуэрто",
        "Улица первозданная",
        "Дом (Сдается квартира), 2"
    ],

    laCantina: [
        "Bellmont, Дель-Пуэрто",
        "Улица первозданная",
        "La Cantina, 3"
    ],

    narkoHome: [
        "Bellmont, Дель-Пуэрто",
        "Улица больших проблем",
        "Магазин Даниэля Фолса, 6"
    ]
};


// =========================
// НАВЕДЕНИЕ НА ОБЪЕКТЫ
// =========================

Object.entries(areas).forEach(([id, data]) => {

    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    element.addEventListener("mouseenter", () => {

        mapTitle.textContent = data[0];
        mapTitle2.textContent = data[1];
        more.textContent = data[2];

    });

    element.addEventListener("mouseleave", () => {

        mapTitle.textContent = "Bellmont";
        mapTitle2.textContent = "";
        more.textContent = "";

    });
});


// =========================
// ЗАПУСК
// =========================

updateMap();