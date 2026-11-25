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

  // 2. CONFIGURACIÓN DE ADSTERRA (Pega aquí tus datos cuando aprueben tu sitio)
  const ADSTERRA = {
    nativeContainerId: "", // Ej: "container-a1b2c3d4e5f6"
    nativeScriptSrc: "",   // Ej: "//pl12345678.effectivegatecpm.com/a1b2c3d4e5f6/invoke.js"
    socialBarSrc: ""       // Ej: "//pl12345678.effectivegatecpm.com/xx/yy/zz/script.js"
  };

  // Inyectar Native Banner en el primer contenedor disponible
  const adSlots = document.querySelectorAll(".ad-slot");
  if (adSlots.length > 0 && ADSTERRA.nativeContainerId && ADSTERRA.nativeScriptSrc) {
    const targetSlot = adSlots[0];
    const container = document.createElement("div");
    container.id = ADSTERRA.nativeContainerId;
    targetSlot.appendChild(container);

    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = ADSTERRA.nativeScriptSrc;
    targetSlot.appendChild(script);
  }

  // Inyectar Social Bar una vez por página
  if (ADSTERRA.socialBarSrc) {
    const socialScript = document.createElement("script");
    socialScript.type = "text/javascript";
    socialScript.src = ADSTERRA.socialBarSrc;
    document.body.appendChild(socialScript);
  }
});
