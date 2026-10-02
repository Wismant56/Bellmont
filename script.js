const map = document.getElementById("map");
const mainMap = document.getElementById("mainMap");
const mapTitle = document.getElementById("mapTitle");
const delPuerto = document.getElementById("delPuerto");

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
// ПЕРЕМЕЩЕНИЕ КАРТЫ
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

    if (e.pointerType === "mouse") {
        map.setPointerCapture(e.pointerId);
    }
});


map.addEventListener("pointermove", (e) => {

    if (!dragging) {
        return;
    }

    x = startMapX + e.clientX - startX;
    y = startMapY + e.clientY - startY;

    updateMap();
});


map.addEventListener("pointerup", () => {

    dragging = false;

    mapTitle.textContent = currentTitle;
});


map.addEventListener("pointercancel", () => {

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
// TOUCH: ПЕРЕМЕЩЕНИЕ + PINCH ZOOM
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

let pinchStartMapX = 0;
let pinchStartMapY = 0;


// Расстояние между пальцами
function getDistance(a, b) {
    return Math.hypot(
        a.x - b.x,
        a.y - b.y
    );
}


// Центр между пальцами
function getCenter(a, b) {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2
    };
}


// =========================
// НАЧАЛО КАСАНИЯ
// =========================

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

        const point = [...fingers.values()][0];

        touchStartX = point.x;
        touchStartY = point.y;

        touchStartMapX = x;
        touchStartMapY = y;

        dragging = true;

        return;
    }


    // Второй палец
    if (fingers.size === 2) {

        dragging = false;

        const points = [...fingers.values()];

        const center =
            getCenter(points[0], points[1]);

        pinchStartDistance =
            getDistance(points[0], points[1]);

        pinchStartScale = scale;

        pinchStartCenterX = center.x;
        pinchStartCenterY = center.y;

        pinchStartMapX = x;
        pinchStartMapY = y;
    }

}, true);


// =========================
// ДВИЖЕНИЕ
// =========================

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


        // Точка карты, которая находилась
        // под центром пальцев в начале pinch
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


    // Масштаб относительно начального состояния
    const newScale =
        pinchStartScale *
        (distance / pinchStartDistance);

    scale = Math.max(
        0.2,
        Math.min(newScale, 5)
    );


    // Точка карты под начальным центром пальцев
    const offsetX =
        pinchStartCenterX - pinchStartMapX;

    const offsetY =
        pinchStartCenterY - pinchStartMapY;


    // Сохраняем её под текущим центром пальцев
    x =
        center.x -
        offsetX * (scale / pinchStartScale);

    y =
        center.y -
        offsetY * (scale / pinchStartScale);


    updateMap();

    return;
}


        // Сохраняем эту точку под пальцами
        x =
            center.x -
            worldX * scale;

        y =
            center.y -
            worldY * scale;


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


// =========================
// ОТПУСКАНИЕ
// =========================

document.addEventListener("pointerup", (e) => {

    if (e.pointerType !== "touch") {
        return;
    }

    fingers.delete(e.pointerId);

    if (fingers.size === 0) {
        dragging = false;
    }

}, true);


// =========================
// ОТМЕНА
// =========================

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
// НАВЕДЕНИЕ НА ДЕЛЬ-ПУЭРТО
// =========================

delPuerto.addEventListener("mouseenter", () => {

    currentTitle = "Bellmont, Дель-Пуэрто";

    if (!dragging) {
        mapTitle.textContent = currentTitle;
    }
});


delPuerto.addEventListener("mouseleave", () => {

    currentTitle = "Bellmont";

    if (!dragging) {
        mapTitle.textContent = currentTitle;
    }
});

// =========================
// НАВЕДЕНИЕ НА ПАРК ТВОРЦА
// =========================
const creatorPark = document.getElementById("creatorPark");

creatorPark.addEventListener("mouseenter", () => {
    currentTitle = "Bellmont, Парк Творца";

    if (!dragging) {
        mapTitle.textContent = currentTitle;
    }
});

creatorPark.addEventListener("mouseleave", () => {
    currentTitle = "Bellmont";

    if (!dragging) {
        mapTitle.textContent = currentTitle;
    }
});

// =========================
// НАВЕДЕНИЕ НА СТАТУЮ ВИСМАНТА
// =========================
const stoneWismant = document.getElementById("stoneWismant");
const mapTitle2 = document.getElementById("mapTitle2");
const more = document.getElementById("more");

stoneWismant.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Парк Творца";
    mapTitle2.textContent = "Статуя Wismant";
    more.textContent = "Высота 38m";
});

stoneWismant.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});

// =========================
// НАВЕДЕНИЕ НА ФОНТАН ТВОРЦА
// =========================
const fountaunCreator = document.getElementById("fountaunCreator");

fountaunCreator.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Парк Творца";
    mapTitle2.textContent = "Фонтан Творца";
    more.textContent = "Начало и зарождение Дель-Пуэрто";
});

fountaunCreator.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});

// =========================
// НАВЕДЕНИЕ НА ПЬЕДЕСТАЛ МАКАРОНА
// =========================
const makarona = document.getElementById("makarona");

makarona.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Парк Творца";
    mapTitle2.textContent = "Пьедестал i_makarona07";
    more.textContent = "Благодарность за доброту";
});

makarona.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});

// =========================
// НАВЕДЕНИЕ НА АЛЛЕЮ СЛАВЫ
// =========================
const walkOfFame = document.getElementById("walkOfFame");

walkOfFame.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Парк Творца";
    mapTitle2.textContent = "Аллея славы";
    more.textContent = "ririkxxs, _ved1mak_ и другие";
});

walkOfFame.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});

// =========================
// НАВЕДЕНИЕ НА ДРЕВНЕЕ ДРЕВО
// =========================
const bigThrees = document.getElementById("bigThrees");

bigThrees.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Парк Творца";
    mapTitle2.textContent = "Древнее древо";
    more.textContent = "Высота: 23m";
});

bigThrees.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});

// =========================
// НАВЕДЕНИЕ НА УЛИЦУ ПЕРВОЗДАННУЮ
// =========================
const firstStreet = document.getElementById("firstStreet");

firstStreet.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Дель-Пуэрто";
    mapTitle2.textContent = "Улица первозданная";
    more.textContent = "Протяженность: 112m";
});

firstStreet.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});
// =========================
// НАВЕДЕНИЕ НА УЛИЦУ ИМЕНИ ВЕДЬМАКА
// =========================
const ved1makStreet = document.getElementById("ved1makStreet");

ved1makStreet.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Дель-Пуэрто";
    mapTitle2.textContent = "Улица имени _ved1mak_";
    more.textContent = "Протяженность: 67m";
});

ved1makStreet.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});
// =========================
// НАВЕДЕНИЕ НА УЛИЦУ БОЛЬШИХ ПРОБЛЕМ
// =========================
const problemStreet = document.getElementById("problemStreet");

problemStreet.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Дель-Пуэрто";
    mapTitle2.textContent = "Улица больших проблем";
    more.textContent = "Протяженность: 48m";
});

problemStreet.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});

// =========================
// НАВЕДЕНИЕ НА ОТЕЛЬ ГРАНД РЕД
// =========================
const hotelGrandRed = document.getElementById("hotelGrandRed");

hotelGrandRed.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Дель-Пуэрто";
    mapTitle2.textContent = "Улица имени _ved1mak_";
    more.textContent = "Отель Grand Red, 4";
});

hotelGrandRed.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});

// =========================
// НАВЕДЕНИЕ НА ОТЕЛЬ ГРАНД ГРИН
// =========================
const hotelGrandGreen = document.getElementById("hotelGrandGreen");

hotelGrandGreen.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Дель-Пуэрто";
    mapTitle2.textContent = "Улица имени _ved1mak_";
    more.textContent = "Отель Grand Green, 5";
});

hotelGrandGreen.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});

// =========================
// НАВЕДЕНИЕ НА HOME 1
// =========================

const home1 = document.getElementById("home1");

home1.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Дель-Пуэрто";
    mapTitle2.textContent = "Улица первозданная";
    more.textContent = "Дом Хуаны Гарсии, 1";
});

home1.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});


// =========================
// НАВЕДЕНИЕ НА HOME 2
// =========================

const home2 = document.getElementById("home2");

home2.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Дель-Пуэрто";
    mapTitle2.textContent = "Улица первозданная";
    more.textContent = "Дом (Сдается квартира), 2";
});

home2.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});


// =========================
// НАВЕДЕНИЕ НА LA CANTINA
// =========================

const laCantina = document.getElementById("laCantina");

laCantina.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Дель-Пуэрто";
    mapTitle2.textContent = "Улица первозданная";
    more.textContent = "La Cantina, 3";
});

laCantina.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});


// =========================
// НАВЕДЕНИЕ НА NARKO HOME
// =========================

const narkoHome = document.getElementById("narkoHome");

narkoHome.addEventListener("mouseenter", () => {
    mapTitle.textContent = "Bellmont, Дель-Пуэрто";
    mapTitle2.textContent = "Улица больших проблем";
    more.textContent = "Магазин Даниэля Фолса, 6";
});

narkoHome.addEventListener("mouseleave", () => {
    mapTitle.textContent = "Bellmont";
    mapTitle2.textContent = "";
    more.textContent = "";
});

// =========================
// ЗАПУСК
// =========================

updateMap();