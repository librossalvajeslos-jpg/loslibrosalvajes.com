/* ===== DATOS DE LA LIBRERÍA: edita solo esta parte ===== */
const SITE = {
  nombre: "Los Libros Salvajes",
  email: "hola@milibreria.es",
  instagram: "loslibrossalvajes",            // sin @
  telefono: "34680574724",            // con prefijo de país, sin + ni espacios
  telefonoVisible: "680 574 724",
  videoInicio: "https://youtu.be/Cs710jQ1fn0?si=8MbJNijWxDYffFj4",                    // enlace de YouTube para la portada (opcional)
  formulario: ""                      // URL de Formspree (opcional, ver instrucciones)
};
const PAGINAS = [["index.html","Inicio"],["nosotros.html","Nosotros"],["blog.html","Blog"],["videos.html","Vídeos"],["pedidos.html","Pedidos"]];
const $ = (s) => document.querySelector(s);
const pagina = document.body.dataset.pagina;
const fecha = (d) => new Date(d).toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"});

function yt(url){
  const m = (url||"").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${m[1]}" loading="lazy" allowfullscreen title="Vídeo"></iframe></div>` : "";
}
async function cargar(url){ const r = await fetch(url); if(!r.ok) throw 0; return r.json(); }

const enlaces = PAGINAS.map(([h,t]) => `<a href="${h}" class="${h.startsWith(pagina)||(pagina==="post"&&h==="blog.html")?"on":""}">${t}</a>`).join("");
document.body.insertAdjacentHTML("afterbegin", `<header><div class="wrap">
<a class="logo" href="index.html"><img src="images/logo_Salvaje_bueno.png" alt=""><span>${SITE.nombre.replace('Salvajes', '<span class="letra-roja">S</span>alvajes')}</span></a><nav>${enlaces}</nav></div></header>`);
document.body.insertAdjacentHTML("beforeend", `<footer><div class="wrap">© ${new Date().getFullYear()} ${SITE.nombre} · <a href="https://instagram.com/${SITE.instagram}">Instagram</a> · <a href="mailto:${SITE.email}">${SITE.email}</a></div></footer>`);

if (pagina === "inicio" && SITE.videoInicio) $("#video-inicio").innerHTML = yt(SITE.videoInicio);

if (pagina === "pedidos") {
  $("#contacto").innerHTML = `
    <li>Teléfono / WhatsApp: <a href="https://wa.me/${SITE.telefono}?text=${encodeURIComponent("Hola, quería hacer un pedido")}">${SITE.telefonoVisible}</a></li>
    <li>Correo: <a href="mailto:${SITE.email}">${SITE.email}</a></li>
    <li>Instagram: <a href="https://instagram.com/${SITE.instagram}">@${SITE.instagram}</a></li>`;
  if (SITE.formulario) $("#formulario").action = SITE.formulario; else $("#formulario").hidden = true;
}

if (pagina === "videos") {
  cargar("data/videos.json").then(({videos}) => {
    document.querySelectorAll("[data-cat]").forEach(s => {
      const v = videos.filter(x => x.categoria === s.dataset.cat);
      s.innerHTML = v.length ? v.map(x => `<div>${yt(x.url)}<h3>${x.titulo}</h3></div>`).join("") : "<p class='meta'>Próximamente.</p>";
    });
  }).catch(() => {});
}

if (pagina === "blog") {
  cargar("content/posts.json").then(posts => {
    const tags = [...new Set(posts.flatMap(p => p.tags))].sort();
    const pintar = (f) => {
      $("#etiquetas").innerHTML = tags.map(t => `<button class="etiqueta ${t===f?"on":""}" data-t="${t}">${t}</button>`).join("");
      $("#entradas").innerHTML = posts.filter(p => !f || p.tags.includes(f)).map(p => `
        <article class="entrada"><a href="post.html?p=${p.slug}"><h3>${p.title}</h3></a>
        <div class="meta">${fecha(p.date)}</div><div>${p.tags.map(t=>`<span class="etiqueta">${t}</span>`).join("")}</div></article>`).join("") || "<p>Aún no hay entradas.</p>";
      document.querySelectorAll("[data-t]").forEach(b => b.onclick = () => pintar(b.dataset.t === f ? "" : b.dataset.t));
    };
    pintar("");
  }).catch(() => $("#entradas").innerHTML = "<p>Aún no hay entradas.</p>");
}

if (pagina === "post") {
  const slug = new URLSearchParams(location.search).get("p");
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js";
  s.onload = s.onerror = () => cargar("content/posts.json").then(posts => {
    const p = posts.find(x => x.slug === slug); if (!p) throw 0;
    document.title = `${p.title} · ${SITE.nombre}`;
    const html = window.marked ? window.marked.parse(p.body) : p.body.replace(/\n/g,"<br>");
    $("#articulo").innerHTML = `<h1>${p.title}</h1><div class="meta">${fecha(p.date)}</div>
      <div>${p.tags.map(t=>`<span class="etiqueta">${t}</span>`).join("")}</div>
      ${p.cover?`<img src="${p.cover}" alt="">`:""}${yt(p.video)}<div class="texto">${html}</div>`;
  }).catch(() => $("#articulo").innerHTML = "<p>Entrada no encontrada. <a href='blog.html'>Volver al blog</a></p>");
  document.head.appendChild(s);
}
