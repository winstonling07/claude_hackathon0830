import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const originalLanguage = formData.get('originalLanguage') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // In a real implementation, this would use OpenAI Whisper API or Web Speech API
    // For demo purposes, we'll return a mock transcript
    const mockTranscript = `
      [Mock transcript - In production, this would be the actual transcription]

      Buenos días a todos. Hoy vamos a hablar sobre la fotosíntesis, un proceso fundamental
      para la vida en la Tierra. La fotosíntesis es el proceso mediante el cual las plantas
      convierten la luz solar en energía química. Este proceso ocurre principalmente en las
      hojas de las plantas, específicamente en estructuras llamadas cloroplastos.

      La ecuación básica de la fotosíntesis es: 6CO2 + 6H2O + luz solar → C6H12O6 + 6O2

      Esto significa que las plantas toman dióxido de carbono del aire y agua del suelo,
      y usando la energía de la luz solar, producen glucosa y liberan oxígeno. Este proceso
      es esencial porque proporciona oxígeno para que respiremos y forma la base de la
      cadena alimentaria.

      Hay dos fases principales en la fotosíntesis: las reacciones lumínicas y las reacciones
      oscuras o ciclo de Calvin. Las reacciones lumínicas ocurren en los tilacoides y
      convierten la energía lumínica en ATP y NADPH. Las reacciones oscuras ocurren en el
      estroma y usan el ATP y NADPH para sintetizar glucosa a partir del dióxido de carbono.
    `.trim();

    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      transcript: mockTranscript,
      language: originalLanguage,
      duration: 180, // mock duration in seconds
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
