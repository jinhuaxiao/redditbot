import type { PlasmoMessaging } from "@plasmohq/messaging"
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.PLASMO_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
})

// DeepSeek API 配置
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
const DEEPSEEK_API_KEY = process.env.PLASMO_PUBLIC_DEEPSEEK_API_KEY

// 使用 DeepSeek API 进行翻译
async function translateWithDeepSeek(systemPrompt: string, text: string, temperature: number) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: temperature || 0.3,
      max_tokens: 1024,
      top_p: 1
    })
  })

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.statusText}`)
  }

  const data = await response.json()
  const translatedText = data.choices[0]?.message?.content
  if (!translatedText) {
    throw new Error("No translation received from DeepSeek API")
  }

  return translatedText.trim()
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { text, sourceLanguage, targetLanguage, temperature } = req.body

  const systemPrompt = sourceLanguage === "English" && targetLanguage === "Chinese" 
    ? `You are a professional translator specializing in English to Chinese translation. 
       Translate the following English text into natural, colloquial Chinese that sounds native. 
       The translation should be idiomatic rather than literal, capturing the true meaning and feeling of the original text.
       Only return the translated text without any explanations or additional content.`
    : `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
       Only return the translated text without any explanations or additional content.`

  try {
    // 首先尝试使用 Groq API
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: text
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: temperature || 0.3,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      })

      const translatedText = chatCompletion.choices[0]?.message?.content
      if (!translatedText) {
        throw new Error("No translation received from Groq API")
      }

      return res.send({
        translation: translatedText.trim(),
        provider: "groq"
      })
    } catch (groqError) {
      console.warn("Groq translation failed, falling back to DeepSeek:", groqError)
      
      // Groq 失败时，使用 DeepSeek API
      const translatedText = await translateWithDeepSeek(systemPrompt, text, temperature)
      return res.send({
        translation: translatedText,
        provider: "deepseek"
      })
    }
  } catch (error) {
    console.error("Translation error:", error)
    res.send({
      error: "Translation failed with both Groq and DeepSeek"
    })
  }
}

export default handler
