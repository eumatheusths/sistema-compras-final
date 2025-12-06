import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUsuarios } from "@/lib/google-sheets";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. BACKDOOR DO MASTER (Garante acesso total sempre)
        if (
          credentials.email === "marketing@nicopel.com.br" && 
          credentials.password === "1024137610"
        ) {
          return {
            id: "master",
            name: "Master Nicopel",
            email: "marketing@nicopel.com.br",
            role: "admin",
            modules: "dashboard,produtos,fornecedores,relatorios,configuracoes",
            image: ""
          };
        }

        // 2. Busca usuários na planilha
        const usuarios = await getUsuarios();
        
        // Verifica email ignorando maiúsculas/minúsculas
        const user = usuarios.find(u => 
          u.email.toLowerCase() === credentials.email.toLowerCase()
        );

        // 3. Verifica Senha
        if (user && String(user.password) === String(credentials.password)) {
          
          // 4. Verifica se a coluna Aprovado está TRUE
          if (!user.approved) {
            throw new Error("Seu acesso ainda está pendente de aprovação.");
          }

          return {
            id: user.email,
            name: user.name,
            email: user.email,
            role: user.role,     
            modules: user.modules, 
            image: ""
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.modules = user.modules;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
        session.user.modules = token.modules;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET, // Garante que usa o segredo do .env
};