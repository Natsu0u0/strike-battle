/* ========================================
   SVG要素取得
======================================== */

const gaugeSvg = document.getElementById("gaugeSvg");

/* ========================================
   ストライク_見た目 SVG生成
======================================== */

gaugeSvg.innerHTML = `
  <defs>
    <clipPath id="gaugeClip">
      <polygon
        id="gaugeShape"
        points="170,80 330,80 263,540 237,540" />
    </clipPath>
  </defs>

  <!-- ゲージ全体を右45度回転 -->
  <g transform="rotate(45 250 300)">

    <!-- グレー部分 -->
    <polygon
      points="170,80 330,80 263,540 237,540"
      fill="#7a7a7a" />

    <!-- 黄色部分 -->
    <rect
      id="fillRect"
      x="0"
      y="218"
      width="500"
      height="322"
      fill="#f5b400"
      clip-path="url(#gaugeClip)" />

    <!-- 外枠 -->
    <polygon
      points="170,80 330,80 263,540 237,540"
      fill="none"
      stroke="#ffffff"
      stroke-width="4" />

    <!-- 80%位置のメモリ線 -->
    <line
      id="targetLine"
      x1="183.4"
      y1="172"
      x2="316.6"
      y2="172"
      stroke="#ffffff"
      stroke-width="1.5"
      opacity="0.9" />

    <!-- 動くバー -->
    <line
      id="barLine"
      x1="190.1"
      y1="218"
      x2="309.9"
      y2="218"
      stroke="#ffffff"
      stroke-width="3" />

  </g>
`;

/* ========================================
   SVG内の操作対象取得
======================================== */

const fillRect = document.getElementById("fillRect");
const barLine = document.getElementById("barLine");
const targetLine = document.getElementById("targetLine");

/* ========================================
   パーセントをY座標に変換
   100% = 上
   0%   = 下
======================================== */

function percentToY(percent) {
  return (
    CONFIG.gauge.bottomY -
    ((CONFIG.gauge.bottomY - CONFIG.gauge.topY) * percent) / 100
  );
}

/* ========================================
   現在の高さにおける台形の左右端を取得
======================================== */

function getEdgeX(y) {
  const ratio =
    (y - CONFIG.gauge.topY) /
    (CONFIG.gauge.bottomY - CONFIG.gauge.topY);

  const leftX =
    CONFIG.gauge.topLeft +
    (CONFIG.gauge.bottomLeft - CONFIG.gauge.topLeft) * ratio;

  const rightX =
    CONFIG.gauge.topRight +
    (CONFIG.gauge.bottomRight - CONFIG.gauge.topRight) * ratio;

  return { leftX, rightX };
}

/* ========================================
   線を台形の端から端まで描画
   対象：メモリ線・バー
======================================== */

function updateBarLine(line, percent) {
  const y = percentToY(percent);
  const { leftX, rightX } = getEdgeX(y);

  line.setAttribute("x1", leftX);
  line.setAttribute("x2", rightX);
  line.setAttribute("y1", y);
  line.setAttribute("y2", y);
}

/* ========================================
   ゲージ更新
   黄色部分とバー位置を更新
======================================== */

function updateGauge(percent) {
  const y = percentToY(percent);

  fillRect.setAttribute("y", y);
  fillRect.setAttribute("height", CONFIG.gauge.bottomY - y);

  updateBarLine(barLine, percent);
}

/* ========================================
   バー表示制御
======================================== */

function showBar() {
    barLine.style.opacity = "1";
}

function hideBar() {
    barLine.style.opacity = "0";
}

/* ========================================
   初期描画
======================================== */

// 80%メモリ線
updateBarLine(targetLine, CONFIG.targetPercent);

// 70%位置にバー表示
updateGauge(CONFIG.initialPercent);

// 動いているときバー非表示
hideBar();
