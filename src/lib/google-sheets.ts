import { google } from "googleapis";

// Autenticação com permissão de LEITURA e ESCRITA
const getAuth = () => {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
};

// --- 1. LEITURA DE DADOS DO DASHBOARD (Mantido igual) ---
export async function getDadosPlanilha() {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "'Consulta'!A1:ZZ", 
      valueRenderOption: "FORMATTED_VALUE",
    });
    const rows = response.data.values;
    if (!rows || rows.length < 2) return [];

    const headers = rows[0].map(h => h.toString().toLowerCase().trim());
    const getIndex = (termos: string[]) => headers.findIndex(h => termos.some(t => h.includes(t)));

    const idxEmpresa = getIndex(["empresa"]);
    const idxFornecedor = getIndex(["fornecedor"]);
    const idxData = getIndex(["data", "entrada"]);
    const idxNfe = getIndex(["nfe", "nota"]);
    const idxProduto = getIndex(["descrição", "produto"]);
    const idxDescItem = getIndex(["descrição item", "item fornecedor"]);
    const idxPlano = getIndex(["plano de contas"]);
    const idxCategoria = getIndex(["categoria"]);
    const idxUn = getIndex(["un. compra", "unidade"]);
    const idxQtd = getIndex(["qtd compra", "quantidade"]);
    const idxUnitario = getIndex(["r$ unitário", "unitario"]);
    const idxTotal = getIndex(["r$ total", "valor total"]);

    return rows.slice(1).map((row, index) => {
      const limpaValor = (val: string) => parseFloat(String(val || "0").replace(/[^\d,-]/g, "").replace(",", ".")) || 0;
      const dataRaw = row[idxData]?.split(" ")[0] || "";
      let dataFormatada = new Date().toISOString();
      if (dataRaw.includes("/")) {
        const [dia, mes, ano] = dataRaw.split("/");
        if (dia && mes && ano) dataFormatada = `${ano}-${mes}-${dia}`;
      }
      let nomeFornecedor = row[idxFornecedor] || "Desconhecido";
      if (nomeFornecedor.includes(" - ")) nomeFornecedor = nomeFornecedor.split(" - ")[1].trim();

      return {
        id: index,
        empresa: row[idxEmpresa] || "Outros",
        fornecedor: nomeFornecedor,
        data: dataFormatada,
        nfe: row[idxNfe] || "",
        descricaoItem: row[idxDescItem] || row[idxProduto] || "Item sem nome",
        planoContas: row[idxPlano] || "Sem Classificação",
        categoria: row[idxCategoria] || "Geral",
        unidade: row[idxUn] || "UN",
        quantidade: row[idxQtd] || "0",
        valorUnitario: limpaValor(row[idxUnitario]),
        valorTotal: limpaValor(row[idxTotal]),
      };
    });
  } catch (error) {
    console.error("❌ Erro ao ler planilha:", error);
    return [];
  }
}

// --- 2. SALVAR NOVOS REGISTROS (IMPORTAÇÃO) ---
export async function salvarNovosRegistros(novasLinhas: any[]) {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "'Consulta'!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: novasLinhas },
    });
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar dados:", error);
    throw new Error("Falha na escrita do Google Sheets");
  }
}

// --- 3. GESTÃO DE USUÁRIOS (LOGIN E PERMISSÕES) ---
export async function getUsuarios() {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // Busca na aba "Usuarios"
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "'Usuarios'!A1:F", // A=Nome, B=Email, C=Senha, D=Permissao, E=Aprovado, F=Modulos
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return [];

    const headers = rows[0].map(h => h.toString().toLowerCase().trim());
    
    const idxNome = headers.findIndex(h => h.includes("nome"));
    const idxEmail = headers.findIndex(h => h.includes("email") || h.includes("login"));
    const idxSenha = headers.findIndex(h => h.includes("senha"));
    const idxPermissao = headers.findIndex(h => h.includes("permissao") || h.includes("role"));
    const idxAprovado = headers.findIndex(h => h.includes("aprovado") || h.includes("status"));
    const idxModulos = headers.findIndex(h => h.includes("modulos") || h.includes("acessos"));

    return rows.slice(1).map((row, index) => ({
      rowIndex: index + 2, // Guarda a linha do Excel (começa em 1 + cabeçalho)
      name: row[idxNome] || "Sem Nome",
      email: row[idxEmail] || "",
      password: row[idxSenha] || "",
      role: row[idxPermissao] || "user",
      // Se tiver "TRUE" ou "SIM", está aprovado.
      approved: (row[idxAprovado] || "").toUpperCase().includes("TRUE") || (row[idxAprovado] || "").toUpperCase().includes("SIM"),
      // Módulos separados por vírgula (ex: "dashboard,produtos")
      modules: row[idxModulos] || "dashboard,produtos,fornecedores,relatorios", 
    }));

  } catch (error) {
    console.error("❌ Erro ao ler usuarios:", error);
    return [];
  }
}

// --- 4. ATUALIZAR PERMISSÕES DE UM USUÁRIO ---
export async function atualizarUsuario(rowIndex: number, dados: { role: string, approved: boolean, modules: string }) {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // Atualiza colunas D, E, F (Permissao, Aprovado, Modulos) na linha específica
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `'Usuarios'!D${rowIndex}:F${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[dados.role, dados.approved ? "TRUE" : "FALSE", dados.modules]]
      }
    });

    return true;
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return false;
  }
}

// Alias de Compatibilidade
export const getCompras = getDadosPlanilha;