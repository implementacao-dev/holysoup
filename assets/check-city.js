document.addEventListener("DOMContentLoaded", () => {
  const citiesElement = document.querySelector("[data-cities]");
  let citiesList = [];

  try {
    citiesList = JSON.parse(citiesElement.textContent.trim());
  } catch (error) {
    // Silently handle parsing error
  }

  checkLocation(citiesList);
});

async function checkLocation(allowedCities) {
  const stored = sessionStorage.getItem("ipLocation");

  if (stored === "definida") {
    const cidade = sessionStorage.getItem("cidade");
    const uf = sessionStorage.getItem("ufSelecionada");
    if (uf) {
      window.dispatchEvent(new CustomEvent("uf-detected", { detail: { uf } }));
    }
    updatePromo(cidade, allowedCities);
    return;
  }

  try {
    const res = await fetch("https://pro.ip-api.com/json/?key=SMiKJiyhAAB2mYi");
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();

    const { city, region } = data;

    sessionStorage.setItem("ipLocation", "definida");
    sessionStorage.setItem("cidade", city);
    if (region) {
      const uf = region.toLowerCase();
      sessionStorage.setItem("ufSelecionada", uf);
      window.dispatchEvent(new CustomEvent("uf-detected", { detail: { uf } }));
    }
    updatePromo(city, allowedCities);
  } catch (error) {
    console.error("Erro na API:", error);
  }
}

function updatePromo(cidade, allowedCities) {
  // Se "Brasil" estiver na lista, sempre mostrar frete grátis
  const hasFreight =
    allowedCities.includes("Brasil") || allowedCities.includes(cidade);

  if (hasFreight) {
    sessionStorage.setItem("freteGratis", "true");
    document.body.classList.add("free-shipping");

    // Check if we're on a product page and update the badge visibility
    if (document.body.classList.contains("template-product")) {
      const badgeElement = document.querySelector(".badge-frete-gratis");
      if (badgeElement) {
        badgeElement.classList.add("visible");
      }
    }
  } else {
    document.body.classList.remove("free-shipping");
  }
}
