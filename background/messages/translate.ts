import type { PlasmoMessaging } from "@plasmohq/messaging"
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.PLASMO_PUBLIC_GROQ_API_KEY
})

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { text, sourceLanguage, targetLanguage, temperature, maxTokens } = req.body

  try {
    const systemPrompt = sourceLanguage
      ? `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only return the translated text without any explanations or additional content.`
      : `You are a professional translator. Translate the following text to ${targetLanguage}. Only return the translated text without any explanations or additional content.`

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
      model: "llama3-8b-8192",
      temperature: temperature || 0.3,
      max_tokens: maxTokens || 1024,
      top_p: 1,
      stream: false
    })

    const translatedText = chatCompletion.choices[0]?.message?.content
    if (!translatedText) {
      throw new Error("No translation received from Groq API")
    }

    res.send({
      translation: translatedText.trim()
    })
  } catch (error) {
    console.error("Translation error:", error)
    res.send({
      error: "Translation failed"
    })
  }
}

export default handler
