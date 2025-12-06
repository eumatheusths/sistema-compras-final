import { NextResponse } from "next/server";
import { getDadosPlanilha, salvarNovosRegistros } from "@/lib/google-sheets";

export const dynamic = 'force-dynamic'; // Garante que a rota não seja cacheada estaticamente

export async function POST(request: Request) {
  try {
    // 1. Recebe os dados enviados pelo Front-end (do Excel)
    const body = await request.json();
    const { dadosNovos } = body;

    if (!dadosNovos || !Array.isArray(dadosNovos)) {
      return NextResponse.json({ error: "Dados inválidos ou vazios." }, { status: 400 });
    }

    // 2. Busca os dados que JÁ ESTÃO na planilha (para evitar duplicidade)
    const dadosAtuais = await getDadosPlanilha();
    
    // Cria uma "Digital" única para cada compra existente: NFe + Fornecedor + Valor
    // Isso evita que se você subir a mesma planilha 2 vezes, duplique tudo.
    const chavesExistentes = new Set(
      dadosAtuais.map(item => {
        const nfe = String(item.nfe || "").trim();
        const forn = String(item.fornecedor || "").toLowerCase().trim();
        // Arredonda valor para evitar erros de centavos (100.00 vs 100)
        const val = Math.round(item.valorTotal * 100); 
        return `${nfe}-${forn}-${val}`;
      })
    );

    // 3. Filtra apenas o que é REALMENTE NOVO
    const registrosParaSalvar: any[] = [];
    
    // Ignora a primeira linha se for cabeçalho (verifica se tem palavras chaves)
    const primeiraLinha = dadosNovos[0] || [];
    const inicio = (
      String(primeiraLinha[0]).toLowerCase().includes("empresa") || 
      String(primeiraLinha[1]).toLowerCase().includes("fornecedor")
    ) ? 1 : 0;

    for (let i = inicio; i < dadosNovos.length; i++) {
      const linha = dadosNovos[i];
      if (!linha || linha.length === 0) continue;

      // Mapeia os campos da LINHA DO EXCEL para verificar duplicidade
      // Assumindo a ordem padrão: Col B (1) = Fornecedor, Col D (3) = NFe, Col X (23) = Valor
      // Se seu Excel for diferente, o ideal é usar o modelo padrão da planilha.
      
      let fornecedor = String(linha[1] || "").trim();
      if (fornecedor.includes(" - ")) fornecedor = fornecedor.split(" - ")[1].trim();
      
      const nfe = String(linha[3] || "").trim();
      
      const valorString = String(linha[23] || "0").replace(/[^\d,-]/g, "").replace(",", ".");
      const valorNumerico = Math.round((parseFloat(valorString) || 0) * 100);

      // Cria a chave deste item novo
      const chaveNova = `${nfe}-${fornecedor.toLowerCase()}-${valorNumerico}`;

      // Se NÃO existe na lista atual, adiciona para salvar
      if (!chavesExistentes.has(chaveNova)) {
        registrosParaSalvar.push(linha);
        // Adiciona no Set temporário para evitar duplicar dentro do próprio arquivo novo
        chavesExistentes.add(chaveNova);
      }
    }

    // 4. Se tiver novidade, manda salvar no Google Sheets
    if (registrosParaSalvar.length > 0) {
      await salvarNovosRegistros(registrosParaSalvar);
    }

    return NextResponse.json({
      success: true,
      totalProcessado: dadosNovos.length - inicio,
      novosAdicionados: registrosParaSalvar.length,
      duplicadosIgnorados: (dadosNovos.length - inicio) - registrosParaSalvar.length
    });

  } catch (error) {
    console.error("Erro crítico na importação:", error);
    return NextResponse.json({ error: "Erro interno ao processar planilha." }, { status: 500 });
  }
}