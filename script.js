let hourlyWage = 0;
let totalEarned = 0;
let startTime = null;
let timer = null;
let isRunning = false;

function calculateHourlyWage() {
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
}

function clearInputs() {
  document.getElementById("salary").value = "";
  document.getElementById("hours").value = "";
  document.getElementById("hourlyWageDisplay").innerText = "";
}
function toggleWageDisplay() {
  const display = document.getElementById("hourlyWageDisplay");
  const btn = document.getElementById("toggleWageBtn");

  if (display.classList.contains("hidden")) {
    display.classList.remove("hidden");
    btn.innerText = "時給を隠す";
  } else {
    display.classList.add("hidden");
    btn.innerText = "時給を表示する";
  }
}

