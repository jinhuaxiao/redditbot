import Groq from "groq-sdk";
import { sendToBackground } from "@plasmohq/messaging";

// 初始化Groq客户端
const groq = new Groq({
  apiKey: process.env.PLASMO_PUBLIC_GROQ_API_KEY, // 使用环境变量存储API密钥
  dangerouslyAllowBrowser: true  // 允许在浏览器中运行
});

export interface TranslationOptions {
  sourceLanguage?: string;
  targetLanguage: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * 使用Groq API翻译文本
 * @param text 要翻译的文本
 * @param options 翻译选项
 * @returns 翻译后的文本
 */
export async function translateText(
  text: string,
  options: TranslationOptions
): Promise<string> {
  try {
    const response = await sendToBackground({
      name: "translate",
      body: {
        text,
        ...options
      }
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return response.translation;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}
