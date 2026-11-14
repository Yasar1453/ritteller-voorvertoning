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

// Prijzen: de rekenhulp. De bedragen staan in de pagina zelf (data-tracker en data-staffel).
const reken = document.querySelector(".reken");
if (reken) {
  const tracker = Number(reken.dataset.tracker), staffel = JSON.parse(reken.dataset.staffel);
  const euro = (x) => "€\u00a0" + x.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const el = (id) => document.getElementById(id);
  const schuif = el("aantal");
  const toon = () => {
    const n = Number(schuif.value), trede = [...staffel].reverse().find((t) => n >= t.vanaf), maand = n * trede.perMaand;
    el("aantal-getal").textContent = n; el("aantal-woord").textContent = n === 1 ? "auto" : "auto's";
    el("per-auto").replaceChildren(Object.assign(document.createElement("em"), { textContent: "€" }),
      ...[...trede.perMaand.toFixed(2).replace(".", ",")].map((c) => Object.assign(document.createElement(c === "," ? "i" : "b"), { textContent: c })));
    el("per-auto").setAttribute("aria-label", euro(trede.perMaand) + " per auto per maand");
    el("per-maand").textContent = euro(maand); el("eenmalig").textContent = euro(n * tracker); el("eerste-jaar").textContent = euro(n * tracker + 12 * maand);
    for (const li of reken.querySelectorAll(".staffel li")) li.classList.toggle("nu", Number(li.dataset.vanaf) === trede.vanaf);
    // Hoe ver de schuif staat, voor de blauwe vulling links van de knop.
    schuif.style.setProperty("--deel", ((n - schuif.min) / (schuif.max - schuif.min)) * 100 + "%");
  };
  schuif.addEventListener("input", toon); toon();
  // Een klik op een trede zet de schuif op het begin van die trede.
  for (const li of reken.querySelectorAll(".staffel li")) li.addEventListener("click", () => { schuif.value = li.dataset.vanaf; toon(); });
}
