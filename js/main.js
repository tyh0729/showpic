// 首頁：左側依拍照日期分類，右側顯示該日期（或全部）的商品卡片
(function () {
  const gallery = document.getElementById("gallery");
  const dateList = document.getElementById("date-list");
  const template = document.getElementById("card-template");
  const WEEKDAYS = "日一二三四五六";

  // 依日期分組，新的日期排前面；同一天內維持 products.js 的順序
  const groups = {};
  PRODUCTS.forEach(function (p) {
    (groups[p.date] = groups[p.date] || []).push(p);
  });
  const dates = Object.keys(groups).sort().reverse();

  function formatDate(date) {
    return date.replace(/-/g, "/");
  }

  function weekday(date) {
    const parts = date.split("-").map(Number);
    return "（" + WEEKDAYS[new Date(parts[0], parts[1] - 1, parts[2]).getDay()] + "）";
  }

  function navItem(hash, label, sub, count) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "date-link";
    a.href = "#" + hash;
    a.dataset.key = hash;

    const text = document.createElement("span");
    text.className = "date-label";
    text.textContent = label;
    if (sub) {
      const s = document.createElement("span");
      s.className = "date-week";
      s.textContent = sub;
      text.appendChild(s);
    }

    const badge = document.createElement("span");
    badge.className = "date-count";
    badge.textContent = count;

    a.append(text, badge);
    li.appendChild(a);
    return li;
  }

  function buildCard(p) {
    const card = template.content.cloneNode(true);
    const link = card.querySelector(".card-link");
    const img = card.querySelector("img");

    // 卡片上只顯示照片與拍照地點；名稱留給螢幕報讀與替代文字
    link.href = "photo.html?id=" + encodeURIComponent(p.id);
    link.setAttribute("aria-label", p.name + "，" + p.location + "（在新視窗開啟照片）");
    img.src = p.image;
    img.alt = p.name;
    card.querySelector(".card-location").textContent = p.location;
    return card;
  }

  // 網址 #date=2026-01-11 顯示單一日期；其他（#all 或空白）顯示全部
  function currentKey() {
    const m = location.hash.match(/^#date=(\d{4}-\d{2}-\d{2})$/);
    return m && groups[m[1]] ? "date=" + m[1] : "all";
  }

  function render() {
    const key = currentKey();
    const shown = key === "all" ? dates : [key.slice(5)];

    const cards = [];
    shown.forEach(function (date) {
      groups[date].forEach(function (p) { cards.push(buildCard(p)); });
    });
    gallery.replaceChildren.apply(gallery, cards);

    dateList.querySelectorAll(".date-link").forEach(function (a) {
      if (a.dataset.key === key) {
        a.setAttribute("aria-current", "page");
        // 手機版橫向列：把目前的日期捲進可視範圍
        a.scrollIntoView({ block: "nearest", inline: "nearest" });
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }

  dateList.appendChild(navItem("all", "全部照片", "", PRODUCTS.length));
  dates.forEach(function (date) {
    dateList.appendChild(navItem("date=" + date, formatDate(date), weekday(date), groups[date].length));
  });

  window.addEventListener("hashchange", function () {
    render();
    window.scrollTo(0, 0);
  });

  render();
  document.getElementById("year").textContent = new Date().getFullYear();
})();
