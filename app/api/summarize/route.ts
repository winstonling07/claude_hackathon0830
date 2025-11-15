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
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Please provide a concise summary of the following notes. Focus on the key points and main ideas. Format the summary in a clear, organized way:\n\n${content}`,
        },
      ],
    });

    const summary = message.content[0].type === 'text'
      ? message.content[0].text
      : 'Unable to generate summary';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
