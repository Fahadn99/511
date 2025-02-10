async function loadWebsites() {
    const response = await fetch('data.json'); // جلب ملف JSON
    const data = await response.json(); // تحويل البيانات إلى كائن JavaScript
    return data.websites;
}

async function searchWebsite() {
    const searchInput = document.getElementById("searchInput").value.trim().toLowerCase();
    const resultsContainer = document.getElementById("resultsContainer");

    resultsContainer.innerHTML = "";

    const websites = await loadWebsites(); // تحميل البيانات من ملف JSON
    const websiteURL = websites[searchInput];

    if (websiteURL) {
        const linkElement = document.createElement("a");
        linkElement.href = websiteURL;
        linkElement.textContent = "انقر هنا للانتقال إلى الموقع";
        linkElement.target = "_blank";
        resultsContainer.appendChild(linkElement);
    } else {
        resultsContainer.textContent = "لم يتم العثور على الموقع المطلوب.";
    }
}