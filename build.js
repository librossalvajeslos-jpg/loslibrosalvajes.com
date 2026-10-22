// Genera content/posts.json a partir de content/blog/*.md (se ejecuta en Cloudflare Pages)
const fs = require("fs"), path = require("path"), dir = "content/blog";
const limpia = (s) => s.trim().replace(/^["']|["']$/g, "");
const posts = fs.readdirSync(dir).filter(f => f.endsWith(".md")).map(f => {
  const m = fs.readFileSync(path.join(dir, f), "utf8").replace(/\r/g, "").match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const d = { tags: [], slug: f.replace(/\.md$/, ""), body: m[2].trim() };
  let ultima = "";
  for (const l of m[1].split("\n")) {
    if (/^\s*-\s/.test(l) && ultima === "tags") d.tags.push(limpia(l.replace(/^\s*-/, "")));
    else if (/^[\w]+:/.test(l)) {
      const i = l.indexOf(":"); ultima = l.slice(0, i); const v = l.slice(i + 1);
      if (ultima === "tags") { if (v.trim().startsWith("[")) d.tags = v.replace(/[\[\]]/g, "").split(",").map(limpia).filter(Boolean); }
      else d[ultima] = limpia(v);
    }
  }
  return d;
}).filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));
fs.writeFileSync("content/posts.json", JSON.stringify(posts));
console.log(posts.length + " entradas");
