const http = require("http");
const url = require("url");

// Simulación de base de datos segura (solo identificadores públicos)
const publicUsers = ["admin", "dev"];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === "/user") {
    const username = parsedUrl.query.username;

    // Validación de entrada para evitar prototipal pollution / accesos indebidos
    if (username && typeof username === "string" && publicUsers.includes(username)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      // RESPUESTA SEGURA: Nunca devolvemos hashes ni contraseñas
      res.end(JSON.stringify({ user: username, status: "activo" }));
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Usuario no encontrado");
    }
  } else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Servidor activo en laboratorio AI-LAB");
  }
});

server.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});

