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

  // 「回首頁」和「關閉視窗」都先關掉這個新視窗，回到原本的首頁視窗；
  // 若瀏覽器不允許關閉（例如直接打開網址），就在這個視窗回首頁原分類
  function closeOrGoBack(e) {
    if (e) e.preventDefault();
    window.close();
    setTimeout(function () { location.href = backUrl; }, 150);
  }

  document.getElementById("back").addEventListener("click", function (e) {
    // 保留 Ctrl／Shift／中鍵點擊「另開分頁」的瀏覽器預設行為
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    closeOrGoBack(e);
  });
  document.getElementById("close").addEventListener("click", closeOrGoBack);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.getElementById("close").click();
  });
})();
