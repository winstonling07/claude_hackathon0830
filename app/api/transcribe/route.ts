import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Handle both FormData and regular requests
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error('Error parsing FormData:', formError);
      return NextResponse.json(
        { error: 'Invalid request format. Please upload an audio file.' },
        { status: 400 }
      );
    }

    const audioFile = formData.get('audio') as File | null;
    const originalLanguage = (formData.get('originalLanguage') as string) || 'english';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Check if audioFile is actually a File object
    if (!(audioFile instanceof File) && typeof audioFile !== 'object') {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload a valid audio file.' },
        { status: 400 }
      );
    }

    // Validate file size (e.g., max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    const fileSize = audioFile.size || 0;
    if (fileSize === 0) {
      return NextResponse.json(
        { error: 'The uploaded file is empty. Please upload a valid audio file.' },
        { status: 400 }
      );
    }
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = audioFile.name || '';
    const fileType = audioFile.type || '';
    const isValidAudioType = fileType.startsWith('audio/') || fileName.match(/\.(mp3|wav|m4a|ogg|webm|flac)$/i);
    
    if (!isValidAudioType) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an audio file (MP3, WAV, M4A, OGG, WEBM, FLAC).' },
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to transcribe audio: ${errorMessage}` },
      { status: 500 }
    );
  }
}
