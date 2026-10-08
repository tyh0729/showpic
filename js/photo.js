// 照片頁：依網址 ?id= 顯示對應商品的照片
(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const p = PRODUCTS.find(function (item) { return item.id === id; });

  // 「回首頁」回到點進來時的分類（from=all 或 from=date=YYYY-MM-DD），並捲到這張照片
  const from = params.get("from");
  let backUrl = "index.html#" + (/^(all|date=\d{4}-\d{2}-\d{2})$/.test(from || "") ? from : "all");
  if (p) backUrl += "&item=" + encodeURIComponent(p.id);
  document.getElementById("back").href = backUrl;

  if (!p) {
    document.getElementById("photo").hidden = true;
    document.getElementById("caption").hidden = true;
    document.getElementById("not-found").hidden = false;
  } else {
    const img = document.getElementById("photo");
    const time = document.getElementById("date");

    document.title = p.name + "｜商品照片";
    img.src = p.image;
    img.alt = p.name;
    document.getElementById("name").textContent = p.name;
    time.dateTime = p.date;
    time.textContent = p.date.replace(/-/g, "/");
    document.getElementById("location").textContent = p.location;
  }

  // 由首頁開出的新視窗可直接關閉；若瀏覽器不允許（例如直接打開網址），就回首頁原分類
  document.getElementById("close").addEventListener("click", function () {
    window.close();
    setTimeout(function () { location.href = backUrl; }, 150);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.getElementById("close").click();
  });
})();
