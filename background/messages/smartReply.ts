import type { PlasmoMessaging } from "@plasmohq/messaging"
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.PLASMO_PUBLIC_GROQ_API_KEY
});

// 添加 DeepSeek API 配置
// const DEEPSEEK_API_KEY = "sk-c9f6f2ad0add4062ac71c98b6636d3b5";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.PLASMO_PUBLIC_DEEPSEEK_API_KEY

// 创建 DeepSeek API 调用函数
async function callDeepSeekAPI(systemPrompt: string, userPrompt: string) {
  try {
    console.log("Calling DeepSeek API with key:", DEEPSEEK_API_KEY?.substring(0, 8) + "...");
    
    const requestBody = {
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
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 150,
      top_p: 0.9
    };
    
    console.log("DeepSeek request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error status:", response.status);
      console.error("DeepSeek API error response:", errorText);
      throw new Error(`DeepSeek API failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("DeepSeek API response:", data);

    if (!data.choices?.[0]?.message?.content) {
      console.error("DeepSeek API returned invalid response structure:", data);
      throw new Error("Invalid response structure from DeepSeek API");
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("DeepSeek API call failed:", error);
    throw error; // 重新抛出错误以便上层处理
  }
}

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

    let reply;
    
    try {
      console.log("Attempting to use Groq API first...");
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
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 150,
        top_p: 0.9,
        stream: false
      });
      reply = completion.choices[0]?.message?.content?.trim();
      console.log("Groq API succeeded");
    } catch (groqError) {
      console.error("Groq API failed:", groqError);
      console.log("Falling back to DeepSeek API...");
      reply = await callDeepSeekAPI(systemPrompt, userPrompt);
    }

    if (!reply) {
      console.error("No reply generated from either API");
      throw new Error("No reply generated from either API");
    }

    console.log("Successfully generated reply:", reply.substring(0, 50) + "...");
    res.send({
      reply
    });
  } catch (error) {
    console.error("Smart reply generation error:", error);
    res.send({
      error: error.message || "Failed to generate smart reply"
    });
  }
}

export default handler;
