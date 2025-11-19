(function () {
  const birthInput = document.getElementById("birthdate");
  const calcBtn = document.getElementById("calcBtn");
  const resultSec = document.getElementById("result");
  const dogAgeText = document.getElementById("dogAgeText");
  const humanAgeText = document.getElementById("humanAgeText");
  const noteText = document.getElementById("note");

  const historySec = document.getElementById("historySec");
  const historyText = document.getElementById("historyText");

  /* -------------------------
     localStorage：載入歷史
  --------------------------*/
  const lastDate = localStorage.getItem("dog-last-date");
  const lastResult = localStorage.getItem("dog-last-result");

  if (lastDate) birthInput.value = lastDate;

  if (lastResult) {
    historySec.hidden = false;
    historyText.innerHTML = lastResult;
  }

  /* ----- 工具：計算天數差 ----- */
  function daysBetween(a, b) {
    const ms = 1000 * 60 * 60 * 24;
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utcB - utcA) / ms);
  }

  /* ----- 工具：顯示 年/月/日 ----- */
  function humanReadableAge(b, now) {
    let y = now.getFullYear() - b.getFullYear();
    let m = now.getMonth() - b.getMonth();
    let d = now.getDate() - b.getDate();

    if (d < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      d += prevMonth.getDate();
      m -= 1;
    }
    if (m < 0) {
      m += 12;
      y -= 1;
    }
    return { years: y, months: m, days: d };
  }

  /* ----- 狗 → 人類 ----- */
  function convertDogToHuman(ageY) {
    if (ageY < 0) return null;
    if (ageY === 0) return 0;
    if (ageY < 1) return ageY * 12.5;
    return 16 * Math.log(ageY) + 31;
  }

  /* ----- 主計算流程 ----- */
  function calculateAndShow() {
    const val = birthInput.value;
    if (!val) {
      alert("請選擇出生日期");
      return;
    }

    const birthDate = new Date(val + "T00:00:00");
    const now = new Date();

    if (birthDate > now) {
      dogAgeText.textContent = "";
      humanAgeText.textContent = "";
      noteText.textContent = "選擇的日期在未來，請選擇正確日期。";
      resultSec.hidden = false;
      return;
    }

    const days = daysBetween(birthDate, now);
    const approxYears = days / 365.25;
    const r = humanReadableAge(birthDate, now);

    // 語意化年齡
    let dogAgeStr = "狗狗年齡：";
    const parts = [];
    if (r.years > 0) parts.push(r.years + " 歲");
    if (r.months > 0) parts.push(r.months + " 個月");
    if (r.days > 0) parts.push(r.days + " 天");
    if (parts.length === 0) dogAgeStr += "剛出生（0 天）";
    else dogAgeStr += parts.join(" ");

    const dogDecimal = Math.round(approxYears * 1000) / 1000;
    const humanAge = convertDogToHuman(approxYears);
    const humanRounded =
      typeof humanAge === "number"
        ? Math.round(humanAge * 100) / 100
        : "—";

    dogAgeText.textContent = `${dogAgeStr}（約 ${dogDecimal} 年）`;

    if (typeof humanAge === "number") {
      humanAgeText.textContent = `換算成人類年齡：約 ${humanRounded} 歲`;

      if (approxYears < 1)
        noteText.textContent =
          "說明：小於 1 歲，採用 1 歲 ≈ 12.5 人歲。";
      else
        noteText.textContent =
          "說明：≥1 歲，採用 16 × ln(狗的年齡) + 31。";
    }

    resultSec.hidden = false;

    /* -------------------------
       儲存到 localStorage
    --------------------------*/
    const finalHTML = `
      ${dogAgeStr}（約 ${dogDecimal} 年）<br>
      人類年齡：約 ${humanRounded} 歲
    `;

    localStorage.setItem("dog-last-date", val);
    localStorage.setItem("dog-last-result", finalHTML);

    historySec.hidden = false;
    historyText.innerHTML = finalHTML;
  }

  calcBtn.addEventListener("click", calculateAndShow);
})();
