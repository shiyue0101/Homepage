const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../public");
function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}
const all = files(root);
const routes = new Set([
  "/",
  "/projects",
  "/skills",
  "/contact",
  "/professional",
  "/life",
]);
const errors = [];
let references = 0;
const ids = new Map();
for (const file of all.filter((file) => file.endsWith(".html"))) {
  const found = [
    ...fs.readFileSync(file, "utf8").matchAll(/\bid=["']([^"']+)["']/g),
  ].map((match) => match[1]);
  if (new Set(found).size !== found.length)
    errors.push(`${path.relative(root, file)}: duplicate IDs`);
  ids.set(file, new Set(found));
}
for (const file of all) {
  if (file.endsWith(".js")) {
    try {
      new vm.Script(fs.readFileSync(file, "utf8"), { filename: file });
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (!/\.(html|css)$/.test(file)) continue;
  const content = fs.readFileSync(file, "utf8");
  const matches = file.endsWith(".html")
    ? content.matchAll(/(?:src|href)=["']([^"']+)["']/g)
    : content.matchAll(/url\(\s*["']?([^\s)"']+)/g);
  for (const match of matches) {
    const url = match[1];
    if (/^(?:[a-z]+:|\/\/)/i.test(url)) continue;
    const [local, fragment] = url.split("#");
    const pathname = local.split("?")[0];
    let target = pathname.startsWith("/")
      ? path.join(root, pathname)
      : path.resolve(path.dirname(file), pathname || path.basename(file));
    if (routes.has(pathname)) target = path.join(root, "index.html");
    if (fs.existsSync(target) && fs.statSync(target).isDirectory())
      target = path.join(target, "index.html");
    if (!fs.existsSync(target))
      errors.push(`${path.relative(root, file)}: missing ${url}`);
    else if (
      fragment &&
      ids.has(target) &&
      !ids.get(target).has(decodeURIComponent(fragment))
    )
      errors.push(`${path.relative(root, file)}: missing anchor ${url}`);
    references++;
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `PASS: JavaScript syntax, ${references} local references, anchors, and unique HTML IDs.`,
  );
