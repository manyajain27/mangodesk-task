import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Summary from '@/models/Summary';

export async function POST(request: NextRequest) {
  try {
    const { transcript, customPrompt } = await request.json();

    if (!transcript || !customPrompt) {
      return NextResponse.json(
        { error: 'Transcript and custom prompt are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Dynamic import to avoid build issues
    const Groq = (await import('groq-sdk')).default;
    
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that helps summarize meeting transcripts based on custom instructions. Provide clear, structured summaries that follow the user\'s specific requirements.',
        },
        {
          role: 'user',
          content: `Please summarize the following meeting transcript based on this instruction: "${customPrompt}"\n\nTranscript:\n${transcript}`,
        },
      ],
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 2048,
    });

    const generatedSummary = completion.choices[0]?.message?.content || 'Failed to generate summary';

    const summary = new Summary({
      originalTranscript: transcript,
      customPrompt: customPrompt,
      generatedSummary: generatedSummary,
    });

    await summary.save();

    return NextResponse.json({
      summary: generatedSummary,
      summaryId: summary._id.toString(),
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}