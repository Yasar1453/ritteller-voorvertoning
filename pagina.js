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
  // Het wagenpark: evenveel busjes als de schuif aangeeft, in verschillende kleuren, elk met onze
  // sticker op de zijkant. Ze rijden als een stoet over de weg onder de rekenhulp. De afstand tussen
  // de busjes blijft gelijk; bij veel busjes is de stoet langer dan het scherm en komt hij voorbij.
  const stoet = el("stoet");
  const KLEUREN = ["#ffffff", "#1a56a0", "#f7c600", "#c2352b", "#dfe5ec", "#1b7a4b", "#f08a24", "#7d8a97"];
  const BUSJE = `<svg viewBox="0 0 560 232"><ellipse cx="285" cy="222" rx="250" ry="8" fill="#000" opacity=".28"/>
    <g class="koets"><path class="lak" d="M40 62q0-18 18-18h262q20 0 34 13l58 51 92 13q22 4 23 25l1 30q0 10-10 10H52q-12 0-12-12z"/>
    <path d="M40 150h488v26q0 10-10 10H52q-12 0-12-12z" fill="#000" opacity=".13"/>
    <path d="M306 60h20q10 0 18 7l48 43h-86z" fill="#0c2748"/><path d="M316 68h10q6 0 11 4l31 30h-52z" fill="#2b5c9e" opacity=".55"/>
    <path d="M296 52v132M404 112v72" stroke="#000" stroke-opacity=".22" stroke-width="2.500" fill="none"/>
    <rect x="62" y="84" width="212" height="56" rx="9" fill="#fff" stroke="#13202c" stroke-opacity=".35" stroke-width="1.500"/>
    <rect x="72" y="93" width="38" height="38" rx="9" fill="#1a56a0"/>
    <path d="M84.300 119.800h9.500a4.500 4.500 0 0 0 0-8.900h-5.600a4.500 4.500 0 0 1 0-8.900h9.500" fill="none" stroke="#fff" stroke-width="2.900" stroke-linecap="round"/>
    <circle cx="83.200" cy="119.800" r="3.600" fill="#fff"/><circle cx="98.800" cy="101.900" r="3.600" fill="#f7c600"/>
    <text x="120" y="124" font-family="'Barlow Smal', Barlow, sans-serif" font-weight="700" font-size="35" fill="#13202c">Ritteller</text>
    <rect x="372" y="132" width="20" height="5" rx="2.500" fill="#000" opacity=".3"/><path d="M398 98h14v14h-8q-6 0-6-6z" fill="#0c2748"/>
    <rect x="505" y="132" width="20" height="11" rx="4" fill="#fff3b0"/><rect x="40" y="112" width="7" height="26" rx="2" fill="#c2352b"/>
    <circle cx="140" cy="186" r="42" fill="#0a1524"/><circle cx="430" cy="186" r="42" fill="#0a1524"/></g>
    ${[140, 430].map((x) => `<g class="wiel"><circle cx="${x}" cy="186" r="34" fill="#16222f"/><circle cx="${x}" cy="186" r="17" fill="#c3cfdb"/><path d="M${x} 171v30M${x - 15} 186h30" stroke="#16222f" stroke-width="3.500"/><circle cx="${x}" cy="186" r="5" fill="#16222f"/></g>`).join("")}</svg>`;
  const rijd = () => {
    const n = Number(schuif.value);
    stoet.innerHTML = Array.from({ length: n }, () => `<span class="busje">${BUSJE}</span>`).join("");
    const busjes = [...stoet.children], breed = busjes[0].getBoundingClientRect().width, veld = stoet.getBoundingClientRect().width;
    const afstand = Math.max(veld + breed, n * breed * 1.22), duur = afstand / (veld < 600 ? 55 : 95);   // px per seconde
    busjes.forEach((b, i) => {
      b.style.setProperty("--lak", KLEUREN[i % KLEUREN.length]);
      b.style.setProperty("--van", -breed + "px"); b.style.setProperty("--naar", afstand - breed + "px");
      b.style.animationDuration = duur + "s"; b.style.animationDelay = -(i * duur) / n + "s";
    });
  };
  let wacht; addEventListener("resize", () => { clearTimeout(wacht); wacht = setTimeout(rijd, 200); });
  schuif.addEventListener("input", () => { toon(); rijd(); }); toon(); rijd();
  // Een klik op een trede zet de schuif op het begin van die trede.
  for (const li of reken.querySelectorAll(".staffel li")) li.addEventListener("click", () => { schuif.value = li.dataset.vanaf; toon(); rijd(); });
}
