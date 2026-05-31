/* ========================================
   HTML要素取得
======================================== */

const speedButtons = document.querySelectorAll(".speed-btn");
const resultValue = document.getElementById("resultValue");
const history = document.getElementById("history");
const perfectMessage = document.getElementById("perfectMessage");

/* ========================================
   アニメーション状態
======================================== */

let percent = CONFIG.initialPercent;
let direction = 1;
let running = true;
let lastTime = null;

let currentSpeed = CONFIG.speed;
let selectedSpeedMode = "300";

/* ========================================
   結果履歴
======================================== */

const resultHistory = [];

/* ========================================
   ランダム速度取得
======================================== */

function getRandomSpeed() {

    const speedList = [
        100,
        200,
        300,
        450,
        600
    ];

    const index =
        Math.floor(
            Math.random() *
            speedList.length
        );
    return speedList[index];

}

/* ========================================
   速度ボタン選択
======================================== */

speedButtons.forEach((button) => {

    button.addEventListener(
        "pointerdown",
        (event) => {
            event.stopPropagation();
            speedButtons.forEach((btn) => {
                btn.classList.remove("active");
            });
            button.classList.add("active");

            selectedSpeedMode =
                button.dataset.speed;
            if (
                selectedSpeedMode ===
                "random"
            ) {
                currentSpeed =
                    getRandomSpeed();
            } else {
                currentSpeed =
                    Number(
                        selectedSpeedMode
                    );
            }
        }
    );
});

/* ========================================
   PERFECT表示
======================================== */

function showPerfect() {

    perfectMessage.textContent =
        "PERFECT!";

    perfectMessage.style.opacity =
        "1";

    setTimeout(() => {

        perfectMessage.style.opacity =
            "0";

    }, 1000);

}

/* ========================================
   判定処理
======================================== */

function judgeResult() {
    const roundedPercent = Math.round(percent);

    // 右パネルには止めた位置の％を表示
    resultValue.textContent = roundedPercent + "%";

    // 100%付近ならPERFECT表示
    if (roundedPercent === 100) {
        showPerfect();
    }

    const record = roundedPercent + "%";

    resultHistory.unshift(record);

    if (resultHistory.length > 10) {
        resultHistory.pop();
    }

    history.innerHTML = resultHistory
        .map((item, index) => `${index + 1}. ${item}`)
        .join("<br>");
}

/* ========================================
   停止処理
======================================== */

function stopGauge() {

    if (!running) {
        return;
    }

    running = false;
    judgeResult();
    setTimeout(() => {
        if (
            selectedSpeedMode ===
            "random"
        ) {
            currentSpeed =
                getRandomSpeed();
        }

        running = true;
        lastTime = null;
        requestAnimationFrame(
            animate
        );
    }, CONFIG.restartDelay);
}

/* ========================================
   バー移動アニメーション
======================================== */

function animate(timestamp) {

    if (!running) {
        return;
    }

    if (lastTime === null) {
        lastTime = timestamp;
    }

    const delta =
        (timestamp - lastTime) /
        1000;
    lastTime = timestamp;

    percent +=
        direction *
        currentSpeed *
        delta;
    if (percent >= 100) {
        percent = 100;
        direction = -1;
    }

    if (percent <= 0) {
        percent = 0;
        direction = 1;
    }
    updateGauge(percent);
    requestAnimationFrame(
        animate
    );
}

/* ========================================
   マウス・タッチで停止
======================================== */

document.addEventListener(
    "pointerdown",
    (event) => {
        if (
            event.target.classList.contains(
                "speed-btn"
            )
        ) {
            return;
        }
        stopGauge();
    }
);

/* ========================================
   Enter / Spaceで停止
======================================== */

document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Enter" ||
            event.code === "Space"
        ) {
            event.preventDefault();
            stopGauge();
        }
    }
);

/* ========================================
   初回起動
======================================== */

requestAnimationFrame(
    animate
);