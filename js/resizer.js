// 左右兩欄中間的分隔線：拖曳調整左欄寬度，雙擊恢復預設，寬度記在瀏覽器裡
(function () {
  const layout = document.querySelector(".layout");
  const sidebar = document.getElementById("sidebar");
  const handle = document.getElementById("resizer");
  const STORAGE_KEY = "showpic.sidebarWidth";
  const MIN = 180;
  const STEP = 16;

  function maxWidth() {
    return Math.max(MIN, Math.round(window.innerWidth * 0.5));
  }

  function currentWidth() {
    return Math.round(sidebar.getBoundingClientRect().width);
  }

  function updateAria() {
    handle.setAttribute("aria-valuemin", MIN);
    handle.setAttribute("aria-valuemax", maxWidth());
    handle.setAttribute("aria-valuenow", currentWidth());
  }

  function setWidth(px) {
    px = Math.round(Math.min(maxWidth(), Math.max(MIN, px)));
    layout.style.setProperty("--sidebar-w", px + "px");
    updateAria();
    return px;
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, String(currentWidth())); } catch (e) { /* 無法儲存就算了 */ }
  }

  function reset() {
    layout.style.removeProperty("--sidebar-w");
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* 忽略 */ }
    updateAria();
  }

  // 還原上次的寬度（上限由 CSS 依當下視窗寬度限制，這裡不另外壓縮）
  try {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (saved > 0) layout.style.setProperty("--sidebar-w", saved + "px");
  } catch (e) { /* 忽略 */ }
  updateAria();

  // 滑鼠／觸控筆拖曳
  handle.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    document.body.classList.add("is-resizing");

    const left = layout.getBoundingClientRect().left;
    const half = handle.getBoundingClientRect().width / 2;

    function onMove(ev) { setWidth(ev.clientX - left - half); }
    function onEnd() {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onEnd);
      handle.removeEventListener("pointercancel", onEnd);
      document.body.classList.remove("is-resizing");
      save();
    }

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onEnd);
    handle.addEventListener("pointercancel", onEnd);
  });

  handle.addEventListener("dblclick", reset);

  // 鍵盤：← → 調整，Home／End 到最窄／最寬
  handle.addEventListener("keydown", function (e) {
    const w = currentWidth();
    let next = null;
    if (e.key === "ArrowLeft") next = w - STEP;
    else if (e.key === "ArrowRight") next = w + STEP;
    else if (e.key === "Home") next = MIN;
    else if (e.key === "End") next = maxWidth();
    if (next === null) return;
    e.preventDefault();
    setWidth(next);
    save();
  });

  window.addEventListener("resize", updateAria);
})();
