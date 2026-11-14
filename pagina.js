// De hectometerpaaltjes langs de weg tellen op: elke keer dat een paaltje
// opnieuw voorbijkomt, staat er 0,2 kilometer meer op (er rijden er twee om en om).
for (const paal of document.querySelectorAll(".rijdt .paal")) {
  let km = Number(paal.dataset.km);
  paal.addEventListener("animationiteration", () => {
    km = Math.round((km + 0.2) * 10) / 10;
    paal.lastElementChild.textContent = km.toFixed(1).replace(".", ",");
  });
}

// Het platform: de vier schermen wisselen vanzelf zolang het blok in beeld is.
// De blauwe balk op de gekozen keuze is de klok; is die vol, dan volgt het volgende scherm.
// Wie zelf een scherm kiest, houdt daarna zelf de regie.
const keuzes = document.querySelector(".keuzes");
if (keuzes && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const rondjes = [...keuzes.querySelectorAll("input")];
  let zelf = false;
  new IntersectionObserver(([blok]) => keuzes.classList.toggle("loopt", blok.isIntersecting && !zelf), { threshold: 0.35 })
    .observe(keuzes.closest(".kiezer"));
  keuzes.addEventListener("animationend", (e) => {
    if (!e.animationName.startsWith("klok") || zelf) return;
    rondjes[(rondjes.findIndex((r) => r.checked) + 1) % rondjes.length].checked = true;
  });
  const stop = () => { zelf = true; keuzes.classList.remove("loopt"); };
  keuzes.addEventListener("click", stop);
  keuzes.addEventListener("keydown", stop);
}
