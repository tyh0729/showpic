// 照片頁：依網址 ?id= 顯示對應商品的照片
(function () {
  const id = new URLSearchParams(location.search).get("id");
  const p = PRODUCTS.find(function (item) { return item.id === id; });

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

  // 由首頁開出的新視窗可直接關閉；若瀏覽器不允許（例如直接打開網址），就回首頁
  document.getElementById("close").addEventListener("click", function () {
    window.close();
    setTimeout(function () { location.href = "index.html"; }, 150);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.getElementById("close").click();
  });
})();
