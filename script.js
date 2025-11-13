let hourlyWage = 0;
let totalEarned = 0;
let startTime = null;
let timer = null;
let isRunning = false;

/*function calculateHourlyWage() {
  const salary = parseFloat(document.getElementById("salary").value);
  const hours = parseFloat(document.getElementById("hours").value);

  if (salary > 0 && hours > 0) {
    hourlyWage = salary / hours;
    document.getElementById("hourlyWageDisplay").innerText =
      `あなたの時給は：¥${hourlyWage.toFixed(2)} / 時間です`;

    // 淡出隐藏输入区域
    const inputArea = document.getElementById("inputArea");
    inputArea.classList.remove("fade-in");
    inputArea.classList.add("fade-out");

       // 显示按钮区域
       document.querySelector('.button-area').style.display = 'block';
  } else {
    alert("有効な給料と労働時間を入力してください。");
  }
 
}*/
function calculateHourlyWage() {
  const salaryInput = document.getElementById("salary");
  const hoursInput = document.getElementById("hours");
  const salary = parseFloat(salaryInput.value);
  const hours = parseFloat(hoursInput.value);

  // 先清除旧的错误提示
  removeError(salaryInput);
  removeError(hoursInput);

  let valid = true;

  if (!salary || salary <= 0) {
    showError(salaryInput, "給料を正しく入力してください。");
    valid = false;
  }
  if (!hours || hours <= 0) {
    showError(hoursInput, "総労働時間を正しく入力してください。");
    valid = false;
  }

  if (!valid) return; // 不继续执行

  // ---- 以下是原有的逻辑 ----
  hourlyWage = salary / hours;
  document.getElementById("hourlyWageDisplay").innerText =
    `あなたの時給は：¥${hourlyWage.toFixed(2)} / 時間です`;

  const inputArea = document.getElementById("inputArea");
  inputArea.classList.remove("fade-in");
  inputArea.classList.add("fade-out");

  document.querySelector('.button-area').style.display = 'block';
}
function showError(inputEl, message) {
  // 若已存在，不重复添加
  if (inputEl.nextElementSibling && inputEl.nextElementSibling.classList.contains("error-msg")) return;

  const error = document.createElement("div");
  error.className = "error-msg";
  error.innerText = message;
  error.style.color = "#e60012";   // 红白机红
  error.style.fontSize = "12px";
  error.style.marginTop = "4px";
  error.style.fontFamily = "'DotGothic16', sans-serif";
  inputEl.insertAdjacentElement("afterend", error);
  inputEl.classList.add("invalid");
}

function removeError(inputEl) {
  const next = inputEl.nextElementSibling;
  if (next && next.classList.contains("error-msg")) {
    next.remove();
  }
  inputEl.classList.remove("invalid");
}


function toggleTimer() {
  if (hourlyWage <= 0) {
    alert("まずは時給を計算してください。");
    return;
  }

  const btn = document.getElementById("startStopBtn");

  if (!isRunning) {
    startTime = Date.now() - (totalEarned / (hourlyWage / 3600)) * 1000;
    timer = setInterval(updateMoneyEarned, 100);
    isRunning = true;
    btn.innerText = "一時停止";
  } else {
    clearInterval(timer);
    isRunning = false;
    btn.innerText = "再開";
  }
}

function updateMoneyEarned() {
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  totalEarned = hourlyWage / 3600 * elapsedSeconds;
  document.getElementById("moneyEarned").innerText = `¥${totalEarned.toFixed(2)}`;

  const el = document.getElementById("moneyEarned");
  el.classList.remove("money-pop");
  void el.offsetWidth;          // 重新触发动画
  el.classList.add("money-pop");

const elapsed = Math.floor((Date.now() - startTime) / 1000);
const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
const s = String(elapsed % 60).padStart(2, '0');
document.getElementById("elapsedTime").innerText = `⏱ ${h}:${m}:${s}`;

}

function reset() {
  clearInterval(timer);
  totalEarned = 0;
  isRunning = false;
  document.getElementById("moneyEarned").innerText = "¥0";
  document.getElementById("startStopBtn").innerText = "スタート";

  // 再显示输入区域（淡入）
  const inputArea = document.getElementById("inputArea");
  inputArea.classList.remove("fade-out");
  inputArea.classList.add("fade-in");

  // 清空显示内容
  document.getElementById("hourlyWageDisplay").innerText = "";

  // ✅ 隐藏按钮区域
  document.querySelector('.button-area').style.display = 'none';

  document.getElementById("elapsedTime").innerText = "";

}


function clearInputs() {
  document.getElementById("salary").value = "";
  document.getElementById("hours").value = "";
  document.getElementById("hourlyWageDisplay").innerText = "";
}
/*function toggleWageDisplay() {
  const display = document.getElementById("hourlyWageDisplay");
  const btn = document.getElementById("toggleWageBtn");

  if (display.classList.contains("hidden")) {
    display.classList.remove("hidden");
    btn.innerText = "時給を隠す";
  } else {
    display.classList.add("hidden");
    btn.innerText = "時給を表示する";
  }*/
  function toggleWageDisplay() {
    const display = document.getElementById("hourlyWageDisplay");
    const btn = document.getElementById("toggleWageBtn");

    // 如果尚未有原始文本，先存下来
    if (!display.dataset.originalText) {
      display.dataset.originalText = display.innerText;
    }

    const isHidden = display.dataset.hidden === "true";

    if (isHidden) {
      // 还原显示
      display.innerText = display.dataset.originalText;
      btn.innerText = "時給を隠す";
      display.dataset.hidden = "false";
    } else {
      // 隐藏金额部分，用 ****** 替代
      const text = display.dataset.originalText;
      const replaced = text.replace(/¥[0-9.,]+/, "¥******");
      display.innerText = replaced;
      btn.innerText = "時給を表示する";
      display.dataset.hidden = "true";
    }
  }



