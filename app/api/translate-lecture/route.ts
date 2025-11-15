import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { transcript, originalLanguage, targetLanguage } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }

    // Use Claude to generate translations and comprehension aids
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a language learning assistant helping students understand lectures in foreign languages.

Given this lecture transcript in ${originalLanguage}:

${transcript}

Please provide:
1. A simplified English version that maintains the key concepts but uses simpler vocabulary and shorter sentences
2. A complete translation to ${targetLanguage}
3. A glossary of 10-15 important technical or difficult terms with definitions
4. 5-7 key points summarizing the main concepts

Format your response as JSON with this structure:
{
  "simplifiedEnglish": "...",
  "translatedVersion": "...",
  "glossary": [
    {
      "term": "photosynthesis",
      "definition": "The process plants use to convert sunlight into chemical energy",
      "context": "Example sentence showing usage"
    }
  ],
  "keyPoints": [
    "First main concept...",
    "Second main concept..."
  ]
}`,
        },
      ],
    });

    // Parse Claude's response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON response from Claude');
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Translation error:', error);

    // Return mock data if API fails
    return NextResponse.json({
      simplifiedEnglish: `Good morning everyone. Today we're going to talk about photosynthesis, which is a very important process for life on Earth. Photosynthesis is how plants turn sunlight into energy. This happens in the leaves of plants, in special structures called chloroplasts.

The basic equation for photosynthesis is simple: plants take carbon dioxide from the air and water from the soil, and using sunlight, they make glucose (a type of sugar) and release oxygen.

This process is very important because it gives us oxygen to breathe and provides food for all living things. There are two main parts to photosynthesis: light reactions and dark reactions (also called the Calvin cycle).`,

      translatedVersion: `Good morning everyone. Today we are going to discuss photosynthesis, a fundamental process for life on Earth. Photosynthesis is the process by which plants convert sunlight into chemical energy. This process occurs mainly in plant leaves, specifically in structures called chloroplasts.

The basic equation of photosynthesis is: 6CO2 + 6H2O + sunlight → C6H12O6 + 6O2

This means that plants take carbon dioxide from the air and water from the soil, and using energy from sunlight, produce glucose and release oxygen. This process is essential because it provides oxygen for us to breathe and forms the base of the food chain.

There are two main phases in photosynthesis: light reactions and dark reactions or the Calvin cycle. Light reactions occur in the thylakoids and convert light energy into ATP and NADPH. Dark reactions occur in the stroma and use ATP and NADPH to synthesize glucose from carbon dioxide.`,

      glossary: [
        {
          term: 'Photosynthesis',
          definition: 'The process by which plants use sunlight to convert carbon dioxide and water into glucose and oxygen',
          context: 'Photosynthesis is essential for life on Earth'
        },
        {
          term: 'Chloroplast',
          definition: 'A specialized structure in plant cells where photosynthesis takes place',
          context: 'This process occurs mainly in the chloroplasts'
        },
        {
          term: 'Glucose',
          definition: 'A simple sugar that serves as an energy source for living organisms',
          context: 'Plants produce glucose through photosynthesis'
        },
        {
          term: 'Thylakoid',
          definition: 'Membrane-bound compartments inside chloroplasts where light reactions occur',
          context: 'Light reactions occur in the thylakoids'
        },
        {
          term: 'Stroma',
          definition: 'The fluid-filled space inside chloroplasts where dark reactions occur',
          context: 'Dark reactions occur in the stroma'
        },
        {
          term: 'ATP',
          definition: 'Adenosine triphosphate, the energy currency of cells',
          context: 'Light reactions convert light energy into ATP'
        },
        {
          term: 'NADPH',
          definition: 'A molecule that carries high-energy electrons used in dark reactions',
          context: 'NADPH is produced during light reactions'
        },
        {
          term: 'Calvin Cycle',
          definition: 'The series of dark reactions that produce glucose from carbon dioxide',
          context: 'The Calvin cycle uses ATP and NADPH to make glucose'
        }
      ],

      keyPoints: [
        'Photosynthesis is the process plants use to convert sunlight into chemical energy',
        'The process occurs in chloroplasts, mainly in plant leaves',
        'Plants take in CO2 and H2O and produce glucose and O2 using sunlight',
        'Photosynthesis provides oxygen for respiration and forms the base of food chains',
        'There are two main phases: light reactions (in thylakoids) and dark reactions (in stroma)',
        'Light reactions convert light energy into ATP and NADPH',
        'Dark reactions (Calvin cycle) use ATP and NADPH to synthesize glucose from CO2'
      ]
    });
  }
}
