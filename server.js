import express from "express";
const app = express();
const PORT = 8080;

app.use(express.static("public")); // sirve app.js, index.html, etc.

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:8080;
});
