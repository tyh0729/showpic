// 首頁：依 PRODUCTS 產生商品卡片
(function () {
  const gallery = document.getElementById("gallery");
  const template = document.getElementById("card-template");

  PRODUCTS.forEach(function (p) {
    const card = template.content.cloneNode(true);
    const link = card.querySelector(".card-link");
    const img = card.querySelector("img");
    const time = card.querySelector(".card-date");

    link.href = "photo.html?id=" + encodeURIComponent(p.id);
    link.setAttribute("aria-label", p.name + "（在新視窗開啟照片）");
    img.src = p.image;
    img.alt = p.name;
    card.querySelector(".card-title").textContent = p.name;
    time.dateTime = p.date;
    time.textContent = p.date.replace(/-/g, "/");
    card.querySelector(".card-location").textContent = p.location;

    gallery.appendChild(card);
  });

  document.getElementById("count").textContent = "· 共 " + PRODUCTS.length + " 件";
  document.getElementById("year").textContent = new Date().getFullYear();
})();
