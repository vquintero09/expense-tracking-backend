import { Pool } from "pg";
import { env } from "../config.ts";

export const pool = new Pool({
  host: env.HOST_DB,
  port: env.PORT_DB,
  user: env.USER_DB,
  password: env.PASSWORD_DB,
  database: env.NAME_DB,
});

pool.on("connect", () => {
  console.log("✅ Conectado a PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Error en el pool de PostgreSQL:", err);
  process.exit(1);
});
