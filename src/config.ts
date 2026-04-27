import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3000,

  // Database configuration
  HOST_DB: process.env.HOST_DB!,
  PORT_DB: Number(process.env.PORT_DB) || 5432,
  USER_DB: process.env.USER_DB!,
  PASSWORD_DB: process.env.PASSWORD_DB!,
  NAME_DB: process.env.NAME_DB!,
};
