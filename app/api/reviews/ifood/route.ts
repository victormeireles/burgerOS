import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { ifoodUrl } = await req.json();

    if (!ifoodUrl) {
      return NextResponse.json({ error: "URL do iFood obrigatória" }, { status: 400 });
    }

    // Chamada para o Apify (yasmany.casanova/ifood-scraper)
    const response = await fetch(`https://api.apify.com/v2/acts/yasmany.casanova~ifood-scraper/runs?token=${process.env.APIFY_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        "startUrls": [{ "url": ifoodUrl }],
        "maxReviews": 50 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "Falha ao iniciar o scraper" }, { status: response.status });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Scraper iniciado com sucesso", 
      runId: data.data.id 
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Erro interno: " + error.message }, { status: 500 });
  }
}
