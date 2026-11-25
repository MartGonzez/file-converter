document.addEventListener("DOMContentLoaded", () => {
  // 1. Filtro de categorías en blog/index.html
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".post-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.category;

      cards.forEach(card => {
        card.style.display = (cat === "all" || card.dataset.category === cat) ? "flex" : "none";
      });
    });
  });

  // 2. CONFIGURACIÓN DE ADSTERRA (Reemplaza con tus datos reales)
  const ADSTERRA_NATIVE_ID = "container-TU_ID_AQUI"; // Ej: "container-a1b2c3d4e5f6"
  const ADSTERRA_NATIVE_SRC = "//pl12345678.effectivegatecpm.com/TU_ID_AQUI/invoke.js";
  const ADSTERRA_SOCIAL_BAR_SRC = "//pl12345678.effectivegatecpm.com/XX/YY/ZZ/tu-social-bar.js";

  // Inyecta Native Banner en los espacios "middle" y "bottom"
  const nativeSlots = document.querySelectorAll('.ad-container[data-slot="middle"], .ad-container[data-slot="bottom"]');
  if (nativeSlots.length > 0 && ADSTERRA_NATIVE_ID !== "container-TU_ID_AQUI") {
    const firstSlot = nativeSlots[0];
    const containerDiv = document.createElement("div");
    containerDiv.id = ADSTERRA_NATIVE_ID;
    firstSlot.appendChild(containerDiv);

    const nativeScript = document.createElement("script");
    nativeScript.async = true;
    nativeScript.dataset.cfasync = "false";
    nativeScript.src = ADSTERRA_NATIVE_SRC;
    firstSlot.appendChild(nativeScript);
  }

  // Inyecta Social Bar (1 sola vez por página, funciona en PC y móvil)
  if (ADSTERRA_SOCIAL_BAR_SRC.includes("tu-social-bar.js") === false) {
    const socialScript = document.createElement("script");
    socialScript.type = "text/javascript";
    socialScript.src = ADSTERRA_SOCIAL_BAR_SRC;
    document.body.appendChild(socialScript);
  }
});
