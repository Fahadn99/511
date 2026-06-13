const input = document.getElementById("meterSearch");
const suggestionsBox = document.getElementById("meterSuggestions");
const resultsBox = document.getElementById("meterResults");

const cache = {};

// تحميل ملف JSON مع كاش
async function loadFile(filePath) {
  if (cache[filePath]) return cache[filePath];

  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error("file not found");

    const data = await res.json();
    cache[filePath] = data;
    return data;
  } catch {
    return {};
  }
}

// تحديد الملف حسب prefix
function getFilePath(number) {
  if (number.length <= 5) {
    const padded = number.padStart(5, "0");
    return `data/short/${padded.slice(0,2)}.json`;
  } else {
    return `data/long/${number.slice(0,5)}.json`;
  }
}

// استخراج فقط الأرقام
function cleanNumber(value) {
  return value.replace(/[^\d]/g, "");
}

// عرض الاقتراحات
async function showSuggestions(value) {
  suggestionsBox.innerHTML = "";
  suggestionsBox.style.display = "none";

  const num = cleanNumber(value);

  // لا نبحث إلا إذا كتب 5 أرقام على الأقل
  if (num.length < 5) return;

  const file = getFilePath(num);
  const data = await loadFile(file);

  let results = [];

  // تطابق كامل
  if (data[num]) {
    data[num].forEach(item => {
      results.push(item);
    });
  } else {
    // startsWith
    const keys = Object.keys(data)
      .filter(k => k.startsWith(num))
      .slice(0, 10);

    keys.forEach(k => {
      data[k].forEach(item => results.push(item));
    });
  }

  results = results.slice(0, 10);

  if (results.length === 0) return;

  results.forEach(item => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.textContent = item.label;

    div.onclick = () => {
      input.value = cleanNumber(item.label);
      performSearch(input.value);
      suggestionsBox.style.display = "none";
    };

    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = "block";
}

// تنفيذ البحث
async function performSearch(value) {
  const num = cleanNumber(value);

  resultsBox.innerHTML = "";

  if (num.length < 5) {
    resultsBox.innerHTML = "<p>ادخل 5 أرقام على الأقل</p>";
    return;
  }

  const file = getFilePath(num);
  const data = await loadFile(file);

  let results = [];

  if (data[num]) {
    results = data[num];
  } else {
    const matches = Object.keys(data)
      .filter(k => k.startsWith(num))
      .slice(0, 10);

    matches.forEach(k => {
      results.push(...data[k]);
    });
  }

  if (results.length === 0) {
    resultsBox.innerHTML = "<p>لا توجد نتائج</p>";
    return;
  }

  renderResults(results.slice(0, 20));
}

// عرض النتائج
function renderResults(items) {
  resultsBox.innerHTML = "";

  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "result-row";

    const text = document.createElement("span");
    text.textContent = item.label;

    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.textContent = "فتح";

    row.appendChild(text);
    row.appendChild(link);
    resultsBox.appendChild(row);
  });
}

// EVENTS
let timer;

input.addEventListener("input", function () {
  clearTimeout(timer);
  timer = setTimeout(() => {
    showSuggestions(this.value);
  }, 250);
});

input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    performSearch(this.value);
    suggestionsBox.style.display = "none";
  }
});

document.addEventListener("click", (e) => {
  if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
    suggestionsBox.style.display = "none";
  }
});
``