// El acceso a esta ruta ya está protegido por functions/_middleware.js (usuario y contraseña).
// Aquí se entrega a Decap CMS el token de GitHub guardado en Cloudflare.
export async function onRequest({ env }) {
  const msg = "authorization:github:success:" + JSON.stringify({ token: env.GITHUB_TOKEN, provider: "github" });
  return new Response(`<script>(function(){function r(e){window.opener.postMessage(${JSON.stringify(msg)},e.origin)}window.addEventListener("message",r);window.opener.postMessage("authorizing:github","*")})()</script>`, { headers: { "Content-Type": "text/html" } });
}
