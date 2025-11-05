import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  accountsTable,
  clinicsTable,
  sessionsTable,
  usersTable,
  usersToClinicsTable,
  verificationsTable,
} from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      usersTable,
      sessionsTable,
      accountsTable,
      verificationsTable,
      usersToClinicsTable,
      clinicsTable,
    },
  }),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    customSession(async ({ user, session }) => {
      const clinics = await db
        .select({
          clinicId: usersToClinicsTable.clinicId,
          clinicName: clinicsTable.name,
        })
        .from(usersToClinicsTable)
        .leftJoin(
          clinicsTable,
          eq(clinicsTable.id, usersToClinicsTable.clinicId),
        )
        .where(eq(usersToClinicsTable.userId, user.id));

      const clinic = clinics?.[0];

      return {
        user: {
          ...user,
          clinicId: clinic?.clinicId
            ? {
                id: clinic.clinicId,
                name: clinic.clinicName,
              }
            : undefined,
        },
        session,
      };
    }),
  ],

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
    modelName: "verificationsTable",
  },

  emailAndPassword: {
    enabled: true,
  },
});
