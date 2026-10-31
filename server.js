const express = require("express");
const path = require("node:path");
const routes = require("./public/js/routes");
const app = express();
const publicDirectory = path.join(__dirname, "public");
const port = process.env.PORT || 3000;

// Serve SPA paths before static directories; About aliases never redirect.
app.get([...routes.pagePaths, "/about/index.html"], (req, res) => {
  if (routes.normalize(req.path) === "/about")
    res.set("Cache-Control", "no-store");
  res.sendFile(path.join(publicDirectory, "index.html"));
});
app.use(express.static(publicDirectory));
app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`),
);
