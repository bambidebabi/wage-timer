/* ===== wage-timer enhanced script.js ===== */

/** 全局状态 **/
let hourlyWage = 0;          // 时薪
let totalEarned = 0;         // 累计已赚
let isRunning = false;       // 是否计时中
let startTime = null;        // 本次开始计时的时间戳（ms）
let timerId = null;          // setInterval 句柄

// 每满多少日元弹一次（可改为 50 / 200）
const POP_STEP = 100;
let lastPopBucket = 0;

function triggerMoneyPop() {
  const el = document.getElementById('moneyEarned');
  if (!el) return;
  // 先移除再强制回流，确保重复触发有效
  el.classList.remove('money-pop');
  // 强制回流：让浏览器“看到”类的移除
  void el.offsetWidth;
  el.classList.add('money-pop');
}

/** ① 金额格式化（默认 JPY，可后续做成可选） **/
const fmt = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 2,
});

/** DOM 获取简化 **/
const $ = (sel) => document.querySelector(sel);

function showButtonsArea() {
  const area = $('.button-area');
  if (area) area.style.display = 'block';
}

/** ② 本地持久化 **/
const STORE_KEY = 'wage-timer-state';

function persist() {
  const payload = {
    hourlyWage,
    totalEarned,
    isRunning,
    // 若正在运行，记录开始时间，用于跨刷新/重开的追补
    lastStartEpoch: isRunning && startTime ? startTime : null,
    savedAt: Date.now(),
  };
  localStorage.setItem(STORE_KEY, JSON.stringify(payload));
}

function restore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;

    const s = JSON.parse(raw);
    if (typeof s.hourlyWage === 'number' && s.hourlyWage > 0) {
      hourlyWage = s.hourlyWage;
      totalEarned = Number(s.totalEarned) || 0;

      // 恢复 UI
      const wageEl = $('#hourlyWageDisplay');
      if (wageEl) wageEl.innerText = `あなたの時給は：${fmt.format(hourlyWage)} / 時間です`;
      const earnedEl = $('#moneyEarned');
      if (earnedEl) earnedEl.innerText = fmt.format(totalEarned);
      showButtonsArea();
    }

    // 若上次是运行中，则追补关掉这段时间的收益，并继续运行
    if (s.isRunning && typeof s.lastStartEpoch === 'number') {
      const now = Date.now();
      const elapsedSec = Math.max(0, (now - s.lastStartEpoch) / 1000);
      totalEarned += (hourlyWage / 3600) * elapsedSec;
      startTime = now; // 以当前时间作为新的起点
      isRunning = true;
      tick(true); // 立即刷新一次
      startTimerLoop();
    } else {
      isRunning = false;
      startTime = null;
    }
  } catch (e) {
    console.warn('Failed to restore state:', e);
  }
}

/** 计算时薪 **/
function calculateHourlyWage() {
  const salary = parseFloat($('#salary')?.value);
  const hours = parseFloat($('#hours')?.value);

  if (!(salary > 0) || !(hours > 0)) {
    alert('有効な給料と労働時間を入力してください。');
    return;
  }

  hourlyWage = salary / hours;

  const wageEl = $('#hourlyWageDisplay');
  if (wageEl) {
    wageEl.innerText = `あなたの時給は：${fmt.format(hourlyWage)} / 時間です`;
  }

  // 完成计算后展示按钮区（与你现有逻辑一致）
  showButtonsArea();

  // 保留现有 totalEarned，不强制清零，便于用户调整后继续
  updateMoneyEarnedDisplay();
  persist();
}

/** 计时开关 **/
function toggleTimer() {
  if (!hourlyWage || hourlyWage <= 0) {
    alert('先に有効な時給を計算してください。');
    return;
  }

  if (isRunning) {
    // 暂停
    isRunning = false;
    stopTimerLoop();
    // 把当前累计刷到 totalEarned 后再存
    tick(true);
    persist();
  } else {
    // 开始：如果此前有累计，则把起点回推，以保证连续性
    const perSec = hourlyWage / 3600;
    if (startTime == null) {
      startTime = Date.now() - (totalEarned / perSec) * 1000;
    }
    isRunning = true;
    startTimerLoop();
    persist();
  }
}

/** 重置 **/
function reset() {
  isRunning = false;
  stopTimerLoop();
  startTime = null;
  totalEarned = 0;
  updateMoneyEarnedDisplay();
  persist();
}

/** ④ 键盘快捷键：Space 开始/暂停；R 重置；H 隐藏/显示时薪 **/
document.addEventListener('keydown', (e) => {
  // 输入框聚焦时不抢按键
  const active = document.activeElement;
  const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
  if (isTyping) return;

  if (e.code === 'Space') {
    e.preventDefault();
    toggleTimer();
  } else if ((e.key || '').toLowerCase() === 'r') {
    reset();
  } else if ((e.key || '').toLowerCase() === 'h') {
    toggleWageDisplay();
  }
});

/** 金额显示（②+①） **/
function updateMoneyEarnedDisplay() {
  const el = $('#moneyEarned');
  if (el) el.innerText = fmt.format(totalEarned);
}

/** 以实际时间戳差值更新（比 Interval 更稳），并持久化 **/
/*function tick(force = false) {
  if (!isRunning || startTime == null) {
    if (force) updateMoneyEarnedDisplay();
    return;
  }
  const now = Date.now();
  const elapsedSeconds = (now - startTime) / 1000;
  totalEarned = (hourlyWage / 3600) * elapsedSeconds;
  updateMoneyEarnedDisplay();
}*/
function tick(force = false) {
  if (!isRunning || startTime == null) {
    if (force) updateMoneyEarnedDisplay();
    return;
  }
  const now = Date.now();
  const elapsedSeconds = (now - startTime) / 1000;
  totalEarned = (hourlyWage / 3600) * elapsedSeconds;

  // —— 新增：按步进触发弹跳 ——
  const bucket = Math.floor(totalEarned / POP_STEP);
  if (bucket > lastPopBucket) {
    lastPopBucket = bucket;
    triggerMoneyPop();
  }

  updateMoneyEarnedDisplay();
}

function startTimerLoop() {
  if (timerId) return;
  // 使用较高频率刷新，保证平滑显示
  timerId = setInterval(() => {
    tick();
    // 降低写入频率，避免频繁 IO；这里每秒写一次
    // 也可用一个简单的节流，这里用时间判断
    if (Math.floor(Date.now() / 1000) % 1 === 0) persist();
  }, 100); // 100ms 一次，UI 足够流畅
}

function stopTimerLoop() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

/** ③ 可见性校正：标签页切换/后台恢复时，重新对齐起点，避免漂移 **/
document.addEventListener('visibilitychange', () => {
  if (!isRunning || startTime == null) return;
  const perSec = hourlyWage / 3600;
  // 根据当前 totalEarned 反推新的 startTime，让显示无缝
  startTime = Date.now() - (totalEarned / perSec) * 1000;
});

/** 可选：切换时薪显示（保持与现有按钮兼容） **/
let wageHidden = false;
function toggleWageDisplay() {
  wageHidden = !wageHidden;
  const wageEl = $('#hourlyWageDisplay');
  if (!wageEl) return;

  if (wageHidden) {
    wageEl.dataset.original = wageEl.innerText;
    wageEl.innerText = 'あなたの時給は：****';
  } else {
    const text = wageEl.dataset.original || `あなたの時給は：${fmt.format(hourlyWage)} / 時間です`;
    wageEl.innerText = text;
  }
}

/** 初始化：等待 DOM 就绪后恢复状态 **/
document.addEventListener('DOMContentLoaded', () => {
  restore();
  // 若没有任何状态但页面上有 moneyEarned 元素，初始化为 0
  if (!localStorage.getItem(STORE_KEY)) {
    updateMoneyEarnedDisplay();
  }
});

/* ===== end ===== */
