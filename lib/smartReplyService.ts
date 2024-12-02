import { sendToBackground } from "@plasmohq/messaging";

export interface SmartReplyOptions {
  postContext?: string;
  commentContext?: string;
  replyToUser?: string;
}

/**
 * Generate smart reply using Groq API via background service
 */
export async function generateSmartReply(
  options: SmartReplyOptions
): Promise<string> {
  try {
    const response = await sendToBackground({
      name: "smartReply",
      body: options
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return response.reply;
  } catch (error) {
    console.error("Smart reply generation error:", error);
    throw error;
  }
}
