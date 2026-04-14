// app/api/generate-game/route.ts
import { NextResponse } from 'next/server';
import { generateGameFromPrompt } from '@/lib/aiGameGenerator';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt tidak boleh kosong' },
        { status: 400 }
      );
    }
    
    const html = await generateGameFromPrompt(prompt);
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Gagal generate game' },
      { status: 500 }
    );
  }
}