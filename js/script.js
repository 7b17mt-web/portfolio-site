/**
 * script.js
 *  - 12本のバーを作成して色と遅延を付ける
 *  - すべてのバーで animationend が起きたらメニュー表示
 *  - Home の周りに SVG の 4 本の線を作り、順に描く
 */

/* ======== settings ======== */
const BAR_COUNT = 12;
/* 紫系のグラデーション色を配列で用意 */
// const COLORS = [
//   ["#2b006f","#3b0f8a"],
//   ["#32006b","#4b1688"],
//   ["#2d006e","#3f0b7f"],
//   ["#3d0060","#51206f"],
//   ["#27005c","#3b0a70"],
//   ["#24005e","#3b0f7a"],
//   ["#2e0066","#4a0578"],
//   ["#38006f","#5d0f86"],
//   ["#2a005e","#3b0d7a"],
//   ["#2f006d","#4b1a8b"],
//   ["#230059","#3b0a66"]
// ];
const COLORS = [
  ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0)"],
  ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0)"],
  ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0)"],
  ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0)"],
  ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0)"],
  ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0)"],
  ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0)"],
  ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0)"],
  ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0)"],
  ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0)"],
  ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0)"],
  ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0)"]
];
const barsContainer = document.getElementById("bars");
const lead = document.getElementById("leadContainer");

let endCount = 0;

/* create bars dynamically so you can change BAR_COUNT easily */
for (let i = 0; i < BAR_COUNT; i++) {
  const d = document.createElement("div");
  d.className = "bar";
  if ((i + 1) % 2 === 0) d.classList.add("even");

  // オフセット遅延を CSS animation-delay として設定
  // 少し長めにずらして重なりを作る（秒）
  const delay = (i * 0.13).toFixed(2) + "s";
  d.style.animationDelay = delay;

  // グラデーション色（ルックを良くするために JSで割り当て）
  const idx = i % COLORS.length;
  const g1 = COLORS[idx][0];
  const g2 = COLORS[idx][1];

  // ほんの少し斜めのグラデーションと中央に暗影を付ける
  d.style.background = `linear-gradient(180deg, ${g1} 0%, ${g2} 100%)`;
  d.style.position = "relative";
  barsContainer.appendChild(d);

  // バーが終わったらカウントして、最後の1本でメニューを出す
  d.addEventListener("animationend", () => {
    endCount++;
    if (endCount === BAR_COUNT) {
      // 短い遅延を入れて自然に見せる
      setTimeout(showMenuAndAnimateBorder, 280);
    }
  });
}

/* show menu */
function showMenuAndAnimateBorder() {
  lead.classList.remove("hidden");
  lead.classList.add("show");
  // ホームの四角線を描く
  animateHomeBorder();
}

/* Home の周りに四角い枠線を SVG で作り順番に描画する */
function animateHomeBorder() {
  const label = document.getElementById("siteName");
  const svg = document.getElementById("siteNameSvg");


  // ラベルのサイズと位置を取得
  const rect = label.getBoundingClientRect();
  // SVG をラベルの相対領域に合わせる（少し余白）
  const padding = 6;
  const width = Math.round(rect.width + padding * 2);
  const height = Math.round(rect.height + padding * 2);

  // SVG をラベルの親（li）に対して絶対配置する
  // 親要素の位置を計算
  const parent = label.parentElement;
  const parentRect = parent.getBoundingClientRect();

  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.style.left = (rect.left - parentRect.left - padding) + "px";
  svg.style.top = (rect.top - parentRect.top - padding) + "px";
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = ""; // クリア

  // 線の色・幅
  const stroke = "#ffffff";
  const strokeWidth = 2;

  // 4 本の線を作る（top, right, bottom, left）
  // 座標は svg 内のパディングを除いた内側長方形
  const x1 = padding;
  const y1 = padding;
  const x2 = width - padding;
  const y2 = height - padding;

  // helper: create line element
  function makeLine(xa, ya, xb, yb) {
    const ns = "http://www.w3.org/2000/svg";
    const l = document.createElementNS(ns, "line");
    l.setAttribute("x1", xa);
    l.setAttribute("y1", ya);
    l.setAttribute("x2", xb);
    l.setAttribute("y2", yb);
    l.setAttribute("stroke", stroke);
    l.setAttribute("stroke-width", strokeWidth);
    l.classList.add("svg-line");
    // stroke-dasharray は線の長さ
    const len = Math.hypot(xb - xa, yb - ya);
    l.dataset.len = String(Math.round(len));
    l.style.strokeDasharray = `${len}`;
    // start hidden (dashoffset = len)
    l.style.strokeDashoffset = `${len}`;
    return l;
  }

  const topLine = makeLine(x1, y1, x2, y1);
  const rightLine = makeLine(x2, y1, x2, y2);
  const bottomLine = makeLine(x2, y2, x1, y2);
  const leftLine = makeLine(x1, y2, x1, y1);

  svg.appendChild(topLine);
  svg.appendChild(rightLine);
  svg.appendChild(bottomLine);
  svg.appendChild(leftLine);

  // sequentially animate lines: set strokeDashoffset -> 0 with staggered delays
  const drawDelay = 180; // ms between each side start
  // animate with small delays to mimic step-by-step drawing
  setTimeout(() => { startDraw(topLine); }, 120);
  setTimeout(() => { startDraw(rightLine); }, 120 + drawDelay);
  setTimeout(() => { startDraw(bottomLine); }, 120 + drawDelay * 2);
  setTimeout(() => { startDraw(leftLine); }, 120 + drawDelay * 3);

  // small helper to animate one line (CSS transition uses 700ms)
  function startDraw(lineElem) {
    lineElem.classList.add("draw");
    // use style to trigger transition
    lineElem.style.transition = "stroke-dashoffset 650ms cubic-bezier(.2,.8,.2,1)";
    lineElem.style.strokeDashoffset = "0";
  }
}

/* optional: when window resizes, recompute svg border to keep it positioned */
window.addEventListener("resize", () => {
  // Remove and re-draw SVG if menu is visible
  if (leadContainer.classList.contains("show")) {
    // small timeout to allow layout to stabilize
    setTimeout(animateHomeBorder, 80);
  }
});


// ===============================
// トップページ：スクロールでヘッダー出現
// ===============================
document.addEventListener('scroll', () => {
  const header = document.querySelector('.siteHeader');
  const toppage = document.querySelector('.topPage');

  // toppage が存在するページ（＝トップページ）のみ処理
  if (toppage && header) {
    if (window.scrollY > 800) {
      header.classList.add('visible');
    } else {
      header.classList.remove('visible');
    }
  }
});

window.addEventListener("load", () => {
    const bars = document.querySelectorAll(".bar");
    const lead = document.querySelector(".leadContainer");

    // 最後のバーのアニメーション終了を検知
    const lastBar = bars[bars.length - 1];

    lastBar.addEventListener("animationend", () => {
        lead.classList.remove("hidden");
        lead.classList.add("show");
    });

});