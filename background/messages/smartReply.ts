import type { PlasmoMessaging } from "@plasmohq/messaging"
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.PLASMO_PUBLIC_GROQ_API_KEY
});

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { postContext, commentContext, replyToUser } = req.body;

  try {
    const systemPrompt = `You are a Reddit user who wants to reply to ${replyToUser ? `user ${replyToUser}'s comment` : 'a post'}. 
Your task is to generate an engaging, natural-sounding reply in colloquial English that would be typical of Reddit discussions.

Requirements:
- Use natural, conversational English
- Be engaging and encourage further discussion
- Stay relevant to the context
- Be concise but informative
- Use appropriate Reddit-style language and tone
- Include humor or wit when appropriate
- Be respectful and constructive`;

    const userPrompt = `Context:
${postContext ? `Post content: ${postContext}\n` : ''}
${commentContext ? `Comment to reply to: ${commentContext}` : ''}

Generate a reply:`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 150,
      top_p: 0.9,
      stream: false
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    
    if (!reply) {
      throw new Error("No reply generated from Groq API");
    }

    res.send({
      reply
    });
  } catch (error) {
    console.error("Smart reply generation error:", error);
    res.send({
      error: "Failed to generate smart reply"
    });
  }
}

export default handler;
