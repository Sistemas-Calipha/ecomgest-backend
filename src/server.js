// src/server.js

import app from "./app.js";
import "./config/dotenv.js";       // Carga variables de entorno
import "./config/supabase.js";    // Conecta Supabase

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
