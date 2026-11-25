document.addEventListener("DOMContentLoaded", () => {
  // 1. Filtro por categorías en blog/index.html
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".post-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.dataset.category;

      cards.forEach(card => {
        card.style.display = (category === "all" || card.dataset.category === category) ? "flex" : "none";
      });
    });
  });

  // 2. Native Banner (Adsterra)
  const adSlots = document.querySelectorAll(".ad-slot");
  if (adSlots.length > 0) {
    const targetSlot = adSlots[0];

    const container = document.createElement("div");
    container.id = "container-cd398c8515f1079aa5aeb0049a8eb3af";
    targetSlot.appendChild(container);

    const nativeScript = document.createElement("script");
    nativeScript.async = true;
    nativeScript.setAttribute("fetchpriority", "high");
    nativeScript.dataset.cfasync = "false";
    nativeScript.src = "https://bauval.org/21/cd398c8515f1079aa5aeb0049a8eb3af";
    targetSlot.appendChild(nativeScript);
  }

  // 3. Social Bar / Script flotante (Adsterra)
  const socialScript = document.createElement("script");
  socialScript.dataset.cfasync = "false";
  socialScript.src = "https://bauval.org/14/2a853614df4aeefb9505b19f667e855d";
  document.body.appendChild(socialScript);

  // 4. Lightbox automático para imágenes con clase .zoomable
  const zoomImages = document.querySelectorAll(".zoomable");
  if (zoomImages.length > 0) {
    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    const fullImg = document.createElement("img");
    overlay.appendChild(fullImg);
    document.body.appendChild(overlay);

    zoomImages.forEach(img => {
      img.addEventListener("click", () => {
        fullImg.src = img.src;
        fullImg.alt = img.alt;
        overlay.classList.add("active");
      });
    });

    overlay.addEventListener("click", () => overlay.classList.remove("active"));
  }

  // 5. Comparador deslizable Antes / Después
  document.querySelectorAll(".compare-box").forEach(box => {
    const slider = box.querySelector(".compare-slider");
    const beforeImg = box.querySelector(".compare-before");
    const divider = box.querySelector(".compare-divider");

    slider.addEventListener("input", e => {
      const val = e.target.value;
      beforeImg.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
      divider.style.left = `${val}%`;
    });
  });
});
