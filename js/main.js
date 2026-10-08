// 首頁：左側依分類資料夾列出分類，右側顯示該分類（或全部）的商品卡片
(function () {
  const gallery = document.getElementById("gallery");
  const dateList = document.getElementById("date-list");
  const template = document.getElementById("card-template");
  const WEEKDAYS = "日一二三四五六";

  // 依分類資料夾分組，新的分類排前面；同一分類內維持 products.js 的順序
  const groups = {};
  PRODUCTS.forEach(function (p) {
    (groups[p.folder] = groups[p.folder] || []).push(p);
  });
  const folders = Object.keys(groups).sort().reverse();

  // 資料夾名稱轉成顯示文字：201907__ → 2019/07，20190701 → 2019/07/01（一），其他原樣
  function categoryLabel(folder) {
    const m = folder.match(/^(\d{4})-?(\d{2}|__)-?(\d{2}|__)$/);
    if (!m) return { label: folder, sub: "" };
    if (m[2] === "__") return { label: m[1], sub: "" };
    if (m[3] === "__") return { label: m[1] + "/" + m[2], sub: "" };
    const day = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getDay();
    return { label: m[1] + "/" + m[2] + "/" + m[3], sub: "（" + WEEKDAYS[day] + "）" };
  }

  function navItem(key, hash, label, sub, count) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "date-link";
    a.href = "#" + hash;
    a.dataset.key = key;

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

  function buildCard(p, key) {
    const card = template.content.cloneNode(true);
    const item = card.querySelector(".card");
    const link = card.querySelector(".card-link");
    const img = card.querySelector("img");

    // 卡片上只顯示照片與拍照地點（空白就不顯示）；名稱留給螢幕報讀與替代文字
    // from = 目前所在的分類，照片頁的「回首頁」會依此回到原分類
    item.dataset.id = p.id;
    link.href = "photo.html?id=" + encodeURIComponent(p.id) + "&from=" + encodeURIComponent(key);
    link.setAttribute("aria-label", p.name + (p.location ? "，" + p.location : "") + "（在新視窗開啟照片）");
    img.src = p.thumb;
    img.alt = p.name;
    if (p.location) {
      card.querySelector(".card-location").textContent = p.location;
    } else {
      card.querySelector(".card-body").remove();
    }
    return card;
  }

  // 網址 #cat=<資料夾> 顯示單一分類；其他（#all 或空白）顯示全部
  // 後面可接 &item=<id>：從照片頁回來時，捲到剛才點的那張
  function parseHash() {
    const parts = location.hash.slice(1).split("&");
    let key = "all";
    let item = null;
    if (parts[0].indexOf("cat=") === 0) {
      const folder = decodeURIComponent(parts[0].slice(4));
      if (groups[folder]) key = "cat=" + folder;
    }
    parts.slice(1).forEach(function (kv) {
      if (kv.indexOf("item=") === 0) item = decodeURIComponent(kv.slice(5));
    });
    return { key: key, item: item };
  }

  // 回傳是否有捲到指定的那張
  function render() {
    const state = parseHash();
    const key = state.key;
    const shown = key === "all" ? folders : [key.slice(4)];

    const cards = [];
    shown.forEach(function (folder) {
      groups[folder].forEach(function (p) { cards.push(buildCard(p, key)); });
    });
    gallery.replaceChildren.apply(gallery, cards);

    let target = null;
    if (state.item) {
      target = Array.prototype.find.call(gallery.children, function (li) {
        return li.dataset.id === state.item;
      });
    }

    dateList.querySelectorAll(".date-link").forEach(function (a) {
      if (a.dataset.key === key) {
        a.setAttribute("aria-current", "page");
        // 手機版橫向列：把目前的分類捲進可視範圍
        a.scrollIntoView({ block: "nearest", inline: "nearest" });
      } else {
        a.removeAttribute("aria-current");
      }
    });

    if (target) {
      target.scrollIntoView({ block: "center" });
      target.classList.add("is-target");
      setTimeout(function () { target.classList.remove("is-target"); }, 2000);
    }
    return !!target;
  }

  dateList.appendChild(navItem("all", "all", "全部照片", "", PRODUCTS.length));
  folders.forEach(function (folder) {
    const c = categoryLabel(folder);
    dateList.appendChild(navItem("cat=" + folder, "cat=" + encodeURIComponent(folder), c.label, c.sub, groups[folder].length));
  });

  window.addEventListener("hashchange", function () {
    if (!render()) window.scrollTo(0, 0);
  });

  render();
  document.getElementById("year").textContent = new Date().getFullYear();
})();
