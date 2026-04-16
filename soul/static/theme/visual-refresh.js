(function () {
  function resolvePageKey() {
    const path = String(window.location.pathname || "").toLowerCase();
    const normalized = path.replace(/\\/g, "/");
    const parts = normalized.split("/").filter(Boolean);
    const soulIndex = parts.lastIndexOf("soul");
    if (soulIndex >= 0) {
      const after = parts.slice(soulIndex + 1);
      if (after.length === 0) return "home";
      if (after[0] === "index.html") return "home";
      if (after.length === 1 && after[0].endsWith(".html")) return "home";
      return after[0].replace(".html", "") || "home";
    }
    return "home";
  }

  function mountDynamicBackground() {
    if (document.querySelector(".vf-dynamic-bg")) return;
    const bg = document.createElement("div");
    bg.className = "vf-dynamic-bg";
    bg.setAttribute("aria-hidden", "true");
    bg.innerHTML = [
      '<div class="vf-dayglow"></div>',
      '<div class="vf-gradient"></div>',
      '<div class="vf-orb vf-orb-a"></div>',
      '<div class="vf-orb vf-orb-b"></div>',
      '<div class="vf-orb vf-orb-c"></div>',
      '<div class="vf-noise"></div>',
    ].join("");

    if (document.body.firstChild) {
      document.body.insertBefore(bg, document.body.firstChild);
    } else {
      document.body.appendChild(bg);
    }
  }

  function init() {
    document.documentElement.setAttribute("data-vf-page", resolvePageKey());
    document.documentElement.setAttribute("data-vf-theme", "day");
    mountDynamicBackground();
    document.body.classList.add("vf-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
