// Pide usuario y contraseña para entrar en /admin y /api.
// Los valores se definen en Cloudflare (variables ADMIN_USER y ADMIN_PASSWORD), nunca en el código.
export async function onRequest({ request, env, next }) {
  const ruta = new URL(request.url).pathname;
  if (!ruta.startsWith("/admin") && !ruta.startsWith("/api")) return next();
  const [tipo, cred] = (request.headers.get("Authorization") || "").split(" ");
  let ok = false;
  if (tipo === "Basic" && cred && env.ADMIN_USER && env.ADMIN_PASSWORD) {
    const [u, ...resto] = atob(cred).split(":");
    ok = u === env.ADMIN_USER && resto.join(":") === env.ADMIN_PASSWORD;
  }
  if (ok) return next();
  return new Response("Acceso restringido", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Panel de la libreria"' } });
}
