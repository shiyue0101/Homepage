const express = require("express");
const path = require("path");

const app = express();

// BEGIN ABOUT_BOTH_PATHS_V4
// Serve exactly the same portrait SPA for both URLs; never redirect either one.
// This guard MUST appear immediately after `const app = express();` and before
// any legacy redirects or express.static. Express routes are slash-insensitive.
app.use((req, res, next) => {
  const pathname = new URL(req.originalUrl, 'http://localhost').pathname;
  if (pathname === '/about' || pathname === '/about/' || pathname === '/about/index.html') {
    // Express 200 response; no Location header and no redirect loop.
    res.set('Cache-Control', 'no-store');
    return res.status(200).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  next();
});
// END ABOUT_BOTH_PATHS_V4

const publicDirectory = path.join(__dirname, "public");
const port = process.env.PORT || 3000;

// HOMEPAGE_CANONICAL_ABOUT_V3
// Redirect legacy trailing-slash URL before Express static's directory redirect.
app.get("/about/", (req, res) => res.redirect(301, "/about"));
app.get("/about", (req, res) => res.sendFile(path.join(publicDirectory, "index.html")));

app.use(express.static(publicDirectory));

// These routes share the homepage's client-side navigation.
app.get(
  ["/", "/projects", "/skills", "/contact", "/professional", "/life"],
  (req, res) => {
    res.sendFile(path.join(publicDirectory, "index.html"));
  },
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
