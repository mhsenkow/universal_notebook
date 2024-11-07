import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateImage(prompt: string) {
  const response = await openai.images.generate({
    prompt,
    n: 1,
    size: "1024x1024",
  });
  return response.data[0].url;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    const imageUrl = await generateImage(prompt);
    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate image' 
    });
  }
} 