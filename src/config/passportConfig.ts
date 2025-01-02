// src/config/passportConfig.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email: string, password: string, done: Function) => {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) return done(null, false);

      const isMatch = await bcrypt.compare(password, user.passwordHash);

      if (isMatch) return done(null, user);
      else return done(null, false);
    }
  )
);

passport.serializeUser((user: any, done: Function) => done(null, user.id));
passport.deserializeUser(async (id: number, done: Function) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});
export default passport;
