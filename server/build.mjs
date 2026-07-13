import { execSync } from "node:child_process";

process.env.DATABASE_URL = process.env.DATABASE_URL ||
  "postgresql://servico_facil_user:p7Y0VQ9dULf7oM5ZSiMNBlBqbqw82RYa@dpg-d9a4sle7r5hc73c6bmc0-a/servico_facil";

execSync("npx prisma generate", { stdio: "inherit", env: process.env });
execSync("tsc", { stdio: "inherit", env: process.env });
