import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { ifoodUrl } = await req.json();

    if (!ifoodUrl) {
      return NextResponse.json({ error: "URL do iFood obrigatória" }, { status: 400 });
    }

    // Configurando headers para simular um navegador real
    const response = await axios.get(ifoodUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 15000 // 15 segundos de timeout
    });

    const $ = cheerio.load(response.data);
    
    // ATENÇÃO: Os seletores do iFood mudam. 
    // Tentaremos buscar os reviews baseados em padrões de texto.
    const reviews: string[] = [];
    
    // Exemplo de seletor genérico (precisará de ajuste fino)
    $('div, p').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 20 && text.length < 300) {
            reviews.push(text);
        }
    });

    return NextResponse.json({ 
      success: true, 
      count: reviews.length,
      reviews: reviews.slice(0, 10) // Enviando 10 amostras
    });

  } catch (error: any) {
    console.error("Scraper Error:", error);
    return NextResponse.json({ 
      error: "O iFood bloqueou a requisição ou a página mudou.",
      details: error.message 
    }, { status: 500 });
  }
}
