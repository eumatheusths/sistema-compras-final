import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // Manda para nossa tela personalizada
  },
});

export const config = {
  // Protege TUDO, exceto a api, arquivos estáticos e a própria tela de login
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};