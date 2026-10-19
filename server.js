const express = require("express");
const path = require("path");

const app = express();
const publicDirectory = path.join(__dirname, "public");
const port = process.env.PORT || 3000;

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
