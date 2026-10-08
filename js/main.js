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
    const time = card.querySelector(".card-date");

    link.href = "photo.html?id=" + encodeURIComponent(p.id);
    link.setAttribute("aria-label", p.name + "（在新視窗開啟照片）");
    img.src = p.image;
    img.alt = p.name;
    card.querySelector(".card-title").textContent = p.name;
    time.dateTime = p.date;
    time.textContent = formatDate(p.date);
    card.querySelector(".card-location").textContent = p.location;
    return card;
  }

  function buildSection(date) {
    const section = document.createElement("section");
    section.className = "date-section";

    const h2 = document.createElement("h2");
    h2.className = "section-title";
    h2.textContent = formatDate(date) + weekday(date);
    const count = document.createElement("span");
    count.className = "section-count";
    count.textContent = groups[date].length + " 張";
    h2.appendChild(count);

    const ul = document.createElement("ul");
    ul.className = "gallery";
    groups[date].forEach(function (p) { ul.appendChild(buildCard(p)); });

    section.append(h2, ul);
    return section;
  }

  // 網址 #date=2026-01-11 顯示單一日期；其他（#all 或空白）顯示全部
  function currentKey() {
    const m = location.hash.match(/^#date=(\d{4}-\d{2}-\d{2})$/);
    return m && groups[m[1]] ? "date=" + m[1] : "all";
  }

  function render() {
    const key = currentKey();
    const shown = key === "all" ? dates : [key.slice(5)];

    gallery.replaceChildren.apply(gallery, shown.map(buildSection));

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
