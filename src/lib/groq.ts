import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateSummary(transcript: string, customPrompt: string): Promise<string> {
  try {
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

    return completion.choices[0]?.message?.content || 'Failed to generate summary';
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
}

export default groq;