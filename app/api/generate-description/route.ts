import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { description: '' },
        { status: 200 }
      );
    }

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Generate a very brief 1-sentence description (max 10-15 words) of the following note content. Be concise and focus on the main topic:\n\n${content.substring(0, 500)}`,
        },
      ],
    });

    const description = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error generating description:', error);
    return NextResponse.json(
      { description: '' },
      { status: 200 }
    );
  }
}
