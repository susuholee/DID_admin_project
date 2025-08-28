const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "./out")));

app.get("/", (req, res) => {
  const file = fs.readFileSync(
    path.join(__dirname, "./out/index.html"),
    "utf-8"
  );
  res.send(file);
});

app.listen(3000, () => {
  console.log("server on~");
});
