// Cloudflare Access protege esta ruta: solo entra quien se identifica por correo.
// Después, la función entrega a Decap CMS el token de GitHub guardado en Cloudflare.
export async function onRequest({ request, env }) {
  if (!request.headers.get("Cf-Access-Jwt-Assertion")) return new Response("No autorizado", { status: 401 });
  const msg = "authorization:github:success:" + JSON.stringify({ token: env.GITHUB_TOKEN, provider: "github" });
  return new Response(`<script>(function(){function r(e){window.opener.postMessage(${JSON.stringify(msg)},e.origin)}window.addEventListener("message",r);window.opener.postMessage("authorizing:github","*")})()</script>`, { headers: { "Content-Type": "text/html" } });
}
