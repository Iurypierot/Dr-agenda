import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  // Configuração do banco de dados com Drizzle ORM
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema, // <-- Passamos o schema completo
  }),

  // Provedores de login social
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // Modelos usados pelo sistema de autenticação
  user: {
    modelName: "usersTable",
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable", // <-- corrigido para plural
  },

  // Autenticação via email e senha
  emailAndPassword: {
    enabled: true,
  },
});
