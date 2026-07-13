import { execSync } from "node:child_process";

process.env.NODE_OPTIONS = "--max-old-space-size=256";
process.env.DATABASE_URL = process.env.DATABASE_URL ||
  "postgresql://servico_facil_user:p7Y0VQ9dULf7oM5ZSiMNBlBqbqw82RYa@dpg-d9a4sle7r5hc73c6bmc0-a.oregon-postgres.render.com/servico_facil";

console.log("=== Gerando Prisma Client ===");
execSync("npx prisma generate", { stdio: "inherit", env: process.env });

console.log("=== Compilando TypeScript ===");
execSync("tsc", { stdio: "inherit", env: process.env });

console.log("=== Build concluido ===");
