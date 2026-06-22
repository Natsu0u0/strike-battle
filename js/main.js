/* ========================================
   HTML要素取得
======================================== */

const speedButtons = document.querySelectorAll(".speed-btn");
const resultValue = document.getElementById("resultValue");
const history = document.getElementById("history");

// 履歴要素チェック（安全対策）
if (!history) {
    console.error("history要素が見つかりません");
}

const perfectMessage = document.getElementById("perfectMessage");

/* ========================================
   スタート画面
======================================== */

const startScreen =
    document.getElementById(
        "startScreen"
    );

const startButton =
    document.getElementById(
        "startButton"
    );

const gameScreen =
    document.getElementById(
        "gameScreen"
    );

/* ========================================
   カウントダウン
======================================== */

const countdownValue =
    document.getElementById(
        "countdownValue"
    );

let countdownTimer = null;
let countdown = 3;

/* ========================================
   アニメーション状態
======================================== */

// 現在のゲージ位置（0〜100）
let percent = CONFIG.initialPercent;

// 上下移動方向（1=上昇 / -1=下降）
let direction = 1;

// アニメーション実行フラグ
let running = true;

// 前フレーム時間
let lastTime = null;

// 現在速度（percent/sec）
let currentSpeed = CONFIG.speed;

// 選択中の速度モード（CONFIGキー or random）
let selectedSpeedMode = "normal";

/* ========================================
   結果履歴
======================================== */

const resultHistory = [];

/* ========================================
   ランダム速度取得
======================================== */

function getRandomSpeed() {

    const speedList = [
        CONFIG.speeds.ultraSlow,
        CONFIG.speeds.slow,
        CONFIG.speeds.normal,
        CONFIG.speeds.fast,
        CONFIG.speeds.ultraFast
    ];

    const index = Math.floor(Math.random() * speedList.length);

    return speedList[index];
}

/* ========================================
   速度ボタン選択
======================================== */

speedButtons.forEach((button) => {

    button.addEventListener("pointerdown", (event) => {

        // ゲージクリックと干渉しないように防止
        event.stopPropagation();

        // active切り替え
        speedButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        // モード取得（ultraSlow / slow / randomなど）
        selectedSpeedMode = button.dataset.speed;

        // 速度決定（CONFIG統一）
        if (selectedSpeedMode === "random") {
            currentSpeed = getRandomSpeed();
        } else {
            currentSpeed = CONFIG.speeds[selectedSpeedMode];
        }
    });
});

/* ========================================
   PERFECT表示
======================================== */

function showPerfect() {

    perfectMessage.textContent = "PERFECT!";
    perfectMessage.style.opacity = "1";

    setTimeout(() => {
        perfectMessage.style.opacity = "0";
    }, 1000);
}

/* ========================================
   カウントダウン開始
======================================== */

function startCountdown() {

    clearInterval(
        countdownTimer
    );

    countdown = 3;

    countdownValue.textContent =
        countdown;

    countdownTimer =
        setInterval(() => {

            countdown--;

            countdownValue.textContent =
                countdown;

            if (
                countdown <= 0
            ) {

                clearInterval(
                    countdownTimer
                );

                timeUp();
            }

        }, 1000);
}

/* ========================================
   TIME UP
======================================== */

function timeUp() {

    if (!running) {
        return;
    }

    running = false;

    resultValue.textContent =
        "TIME UP";

    showBar();

    setTimeout(() => {

        hideBar();

        running = true;

        lastTime = null;

        startCountdown();

        requestAnimationFrame(
            animate
        );

    }, CONFIG.restartDelay);
}

/* ========================================
   判定処理
======================================== */

function judgeResult(finalPercent) {

    const roundedPercent = Math.round(finalPercent);

    // 結果表示
    resultValue.textContent = roundedPercent + "%";

    // PERFECT判定
    if (roundedPercent === 100) {
        showPerfect();
    }

    // 履歴追加（先頭に追加）
    resultHistory.unshift(roundedPercent + "%");

    // 最大10件まで保持
    if (resultHistory.length > 10) {
        resultHistory.pop();
    }

    // UI更新
    history.innerHTML = resultHistory
        .map((item, index) => `${index + 1}. ${item}`)
        .join("<br>");
}

/* ========================================
   停止処理
======================================== */

function stopGauge() {

    // すでに停止中なら無視
    if (!running) return;

    clearInterval(
    countdownTimer
);

    running = false;

    // ★停止時の値を固定（重要）
    const finalPercent = percent;

    // バー表示
    showBar();

    // 1フレーム後に判定（描画安定化）
    requestAnimationFrame(() => {
        judgeResult(finalPercent);
    });

    // 再開処理
    setTimeout(() => {

        // random時は毎回速度変更
        if (selectedSpeedMode === "random") {
            currentSpeed = getRandomSpeed();
        }

        hideBar();

        running = true;
        lastTime = null;

        startCountdown();
        requestAnimationFrame(animate);

        /* ========================================
        練習開始
        ======================================== */

        startButton.addEventListener(
            "click",
            () => {

                startScreen.style.display =
                    "none";

                gameScreen.style.display =
                    "block";

                startCountdown();

                requestAnimationFrame(
                    animate
                );
            }
        );

    }, CONFIG.restartDelay);
}

/* ========================================
   バー移動アニメーション
======================================== */

function animate(timestamp) {

    // 停止中は処理しない
    if (!running) return;

    // 初回フレーム補正
    if (lastTime === null) {
        lastTime = timestamp;
    }

    // 経過時間（秒）
    const delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // 位置更新
    percent += direction * currentSpeed * delta;

    // 上限・下限で反転
    if (percent >= 100) {
        percent = 100;
        direction = -1;
    }

    if (percent <= 0) {
        percent = 0;
        direction = 1;
    }

    updateGauge(percent);

    requestAnimationFrame(animate);
}

/* ========================================
   マウス・タッチで停止
======================================== */

document.addEventListener("pointerdown", (event) => {

    // ボタン押下時は無視
    if (event.target.classList.contains("speed-btn")) return;

    stopGauge();
});

/* ========================================
   キーボードで停止
======================================== */

document.addEventListener("keydown", (event) => {

    if (event.key === "Enter" || event.code === "Space") {

        event.preventDefault();
        stopGauge();
    }
});

/* ========================================
   練習開始
======================================== */

startButton.addEventListener(
    "click",
    () => {

        startScreen.style.display =
            "none";

        gameScreen.style.display =
            "block";

        countdownValue.textContent =
            "3";

        setTimeout(() => {

            running = true;

            startCountdown();

            requestAnimationFrame(
                animate
            );

        }, 1000);

    }
);