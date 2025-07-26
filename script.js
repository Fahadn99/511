let websites = {};
let dataLoaded = false;

function loadWebsitesData() {
  if (dataLoaded) return Promise.resolve();

  // قائمة الملفات التي تريد تحميلها
  const files = ['data/QBS.json', 'data/QRS.json', 'data/QUS.json','data/QWS.json', 'data/QMS.json', 'data/websites.json', 'data/alasyah.json'];

  const fetchPromises = files.map(file =>
    fetch(file)
      .then(res => {
        if (!res.ok) {
          throw new Error(`file to load ${file}`);
        }
        return res.json();
      })
  );

  return Promise.all(fetchPromises)
    .then(dataArray => {
      // دمج البيانات من جميع الملفات
      dataArray.forEach(data => {
        Object.assign(websites, data);
      });
      dataLoaded = true;
      console.log('All websites data loaded:', websites);
    })
    .catch(error => {
      console.error('Error loading websites data:', error);
    });
}

// وظيفة للحصول على رابط باستخدام المفتاح
function getWebsiteByKey(key) {
  if (!dataLoaded) {
    console.error('Data not loaded yet. Call loadWebsitesData first.');
    return null;
  }

  return websites[key] || 'Key not found';
}

// تحميل البيانات وتجربة الوصول لها
loadWebsitesData().then(() => {
  console.log(getWebsiteByKey("79906")); // يعرض الرابط إذا كان المفتاح موجودًا
});
// عدّل دوال البحث والاقتراحات لتنتظر تحميل البيانات أولاً:
function showSuggestions(searchTerm) {
  loadWebsitesData().then(() => {
    // ...نفس الكود السابق لعرض الاقتراحات...
  });
}

function performSearch(searchTerm) {
  loadWebsitesData().then(() => {
    // ...نفس كود البحث السابق...
  });
}
// script.js
const feedbackBtn = document.getElementById("feedbackBtn");
const feedbackModal = document.getElementById("feedbackModal");
const closeModal = document.getElementById("closeModal");
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("resultsContainer");
const suggestionsContainer = document.getElementById("suggestions");
const submitFeedback = document.getElementById("submitFeedback");
const resetForm = document.getElementById("resetForm");
const feedbackType = document.getElementById("feedbackType");
const equipmentType = document.getElementById("equipmentType");
const equipmentCode = document.getElementById("equipmentCode");
const equipmentLink = document.getElementById("equipmentLink");
const correctionReason = document.getElementById("correctionReason");
const correctionReasonLabel = document.getElementById("correctionReasonLabel");
const feedbackMsg = document.getElementById("feedbackMsg");

// فتح نافذة الملاحظات
if (feedbackBtn) {
  feedbackBtn.onclick = function() {
    feedbackModal.style.display = "flex";
  };
}

// إغلاق النافذة
if (closeModal) {
  closeModal.onclick = function() {
    feedbackModal.style.display = "none";
  };
}

// إغلاق عند الضغط خارج النموذج
if (feedbackModal) {
  window.onclick = function(event) {
    if (event.target === feedbackModal) {
      feedbackModal.style.display = "none";
    }
  };
}

// البحث التلقائي مع تأخير
let searchTimer;
if (searchInput) {
  searchInput.addEventListener("input", function() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      showSuggestions(this.value.trim());
    }, 300);
  });

  searchInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      performSearch(this.value.trim());
      suggestionsContainer.style.display = "none";
    }
  });
}

if (suggestionsContainer) {
  document.addEventListener("click", function(e) {
    if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.style.display = "none";
    }
  });
}

function showSuggestions(searchTerm) {
  suggestionsContainer.innerHTML = "";
  suggestionsContainer.style.display = "none";

  if (!searchTerm) {
    return;
  }

  const matchingKeys = Object.keys(websites)
    .filter(key => key.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5);

  if (matchingKeys.length > 0) {
    matchingKeys.forEach(key => {
      const suggestionItem = document.createElement("div");
      suggestionItem.textContent = key;
      suggestionItem.className = "suggestion-item";
      suggestionItem.addEventListener("click", () => {
        searchInput.value = key;
        performSearch(key);
        suggestionsContainer.style.display = "none";
      });
      suggestionsContainer.appendChild(suggestionItem);
    });
    suggestionsContainer.style.display = "block";
  }
}

function performSearch(searchTerm) {
  resultsContainer.innerHTML = "<p>جارٍ البحث...</p>";

  if (!searchTerm) {
    resultsContainer.innerHTML = "<p>الرجاء إدخال كلمة للبحث</p>";
    resultsContainer.className = "error-message";
    return;
  }

  const foundKey = Object.keys(websites).find(key =>
    key.toLowerCase() === searchTerm.toLowerCase()
  );

  if (foundKey) {
    resultsContainer.innerHTML = "";
    const linkElement = document.createElement("a");
    linkElement.href = websites[foundKey];
    linkElement.textContent = "انقر هنا للانتقال إلى الموقع";
    linkElement.target = "_blank";
    linkElement.className = "result-link";
    resultsContainer.appendChild(linkElement);
  } else {
    resultsContainer.innerHTML = "<p>لم يتم العثور على الموقع المطلوب.</p>";
    resultsContainer.className = "error-message";
  }
}

// إظهار/إخفاء حقل سبب التعديل في feedback.html و modal
if (feedbackType) {
  feedbackType.addEventListener("change", function() {
    if (this.value === "تصحيح") {
      correctionReason.style.display = "block";
      correctionReasonLabel.style.display = "block";
      correctionReason.required = true;
    } else {
      correctionReason.style.display = "none";
      correctionReasonLabel.style.display = "none";
      correctionReason.required = false;
    }
  });
}

// معاينة رابط خرائط Google
if (equipmentLink) {
  equipmentLink.addEventListener("input", function() {
    const link = this.value.trim();
    if (link.includes("maps.app.goo.gl")) {
      feedbackMsg.textContent = "الرابط صالح!";
      feedbackMsg.className = "";
    } else {
      feedbackMsg.textContent = "الرجاء إدخال رابط خرائط Google صالح.";
      feedbackMsg.className = "error";
    }
  });
}

// إرسال النموذج إلى Google Forms
if (submitFeedback) {
  submitFeedback.onclick = function(e) {
    e.preventDefault();
    const type = feedbackType.value;
    const equipType = equipmentType.value;
    const code = equipmentCode.value.trim();
    const link = equipmentLink.value.trim();
    const reason = correctionReason.value.trim();

    // التحقق من الحقول
    if (!equipType) {
      feedbackMsg.textContent = "الرجاء اختيار نوع المعدة.";
      feedbackMsg.className = "error";
      return;
    }
    if (!code || !link) {
      feedbackMsg.textContent = "الرجاء إدخال رمز المعدة ورابط خرائط Google.";
      feedbackMsg.className = "error";
      return;
    }
    if (type === "تصحيح" && !reason) {
      feedbackMsg.textContent = "الرجاء إدخال سبب التعديل.";
      feedbackMsg.className = "error";
      return;
    }
    if (!link.includes("maps.app.goo.gl")) {
      feedbackMsg.textContent = "الرجاء إدخال رابط خرائط Google صالح.";
      feedbackMsg.className = "error";
      return;
    }

    // إرسال البيانات إلى Google Forms
    const formData = new FormData();
    formData.append("entry.1768981552", type);
    formData.append("entry.1223622662", equipType);
    formData.append("entry.507274621", code);
    formData.append("entry.838611703", link);
    formData.append("entry.826576113", reason);

    fetch("https://docs.google.com/forms/d/e/1FAIpQLSfBKCbDVJ-ju6LuwL7qKXP2L7cav0wWQVv99ojK2b_HWpdMFw/formResponse", {
      method: "POST",
      body: formData
    })
      .then(response => {
        if (response.ok || response.type === "opaque") {
          feedbackMsg.textContent = "تم إرسال الإدخال بنجاح!";
          feedbackMsg.className = "";
          equipmentType.value = "";
          equipmentCode.value = "";
          equipmentLink.value = "";
          correctionReason.value = "";
          correctionReason.style.display = "none";
          correctionReasonLabel.style.display = "none";
          feedbackType.value = "إضافة";
          setTimeout(() => {
            feedbackMsg.textContent = "";
            if (feedbackModal) feedbackModal.style.display = "none";
          }, 3000);
        } else {
          throw new Error("فشل إرسال النموذج");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        feedbackMsg.textContent = "";
        feedbackMsg.className = "error";
      });

    // تخزين احتياطي في localStorage
    const feedbackList = JSON.parse(localStorage.getItem("feedbackList") || "[]");
    feedbackList.push({
      type,
      equipmentType: equipType,
      code,
      link,
      reason: type === "تصحيح" ? reason : "",
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("feedbackList", JSON.stringify(feedbackList));
  };
}

// إعادة تعيين النموذج
if (resetForm) {
  resetForm.onclick = function() {
    equipmentType.value = "";
    equipmentCode.value = "";
    equipmentLink.value = "";
    correctionReason.value = "";
    correctionReason.style.display = "none";
    correctionReasonLabel.style.display = "none";
    feedbackType.value = "إضافة";
    feedbackMsg.textContent = "تم إعادة تعيين النموذج.";
    feedbackMsg.className = "";
    setTimeout(() => {
      feedbackMsg.textContent = "";
    }, 3000);
  };
}

// اختصار Ctrl+Enter للإرسال
if (equipmentCode && equipmentLink && correctionReason) {
  equipmentCode.addEventListener("keypress", function(e) {
    if (e.ctrlKey && e.key === "Enter") submitFeedback.click();
  });
  equipmentLink.addEventListener("keypress", function(e) {
    if (e.ctrlKey && e.key === "Enter") submitFeedback.click();
  });
  correctionReason.addEventListener("keypress", function(e) {
    if (e.ctrlKey && e.key === "Enter") submitFeedback.click();
  });
}
