// CommentInput.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Comment } from './Comment'
import { translateText } from '../lib/translationService'
import { generateSmartReply } from '../lib/smartReplyService'
import { setCommentText, submitComment } from '../lib/commentService'

interface CommentInputProps {
  onSubmit: (content: string, translation: string) => void
  onCancel?: () => void
  placeholder?: string
  replyTo?: Comment | null
  postContext?: string
  commentContext?: string
}

export const CommentInput: React.FC<CommentInputProps> = ({ 
  onSubmit, 
  onCancel, 
  placeholder = "输入中文回复...",
  replyTo = null,
  postContext = "",
  commentContext = ""
}) => {
  const [content, setContent] = useState('')
  const [translation, setTranslation] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleTranslate = useCallback(async (text: string) => {
    if (!text) return
    setIsTranslating(true)
    try {
      const translatedText = await translateText(text, {
        sourceLanguage: "Chinese",
        targetLanguage: "English",
        temperature: 0.3
      })
      setTranslation(translatedText)
    } catch (error) {
      console.error("Translation error:", error)
      setTranslation("Translation failed. Please try again.")
    } finally {
      setIsTranslating(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (content) handleTranslate(content)
    }, 500)
    return () => clearTimeout(timer)
  }, [content, handleTranslate])

  const handleSmartReply = useCallback(async () => {
    setIsGenerating(true)
    try {
      const reply = await generateSmartReply({
        postContext,
        commentContext,
        replyToUser: replyTo?.author
      })
      
      setContent(reply)
      // Trigger translation of the generated reply
      handleTranslate(reply)
    } catch (error) {
      console.error("Smart reply generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }, [postContext, commentContext, replyTo, handleTranslate])

  const handleSubmit = async () => {
    if (content) {
      try {
        // Set text in Reddit's comment box
        await setCommentText(translation || content)
        
        // Submit the comment
        await submitComment()
        
        // Call the original onSubmit handler
        onSubmit(content, translation)
        
        // Clear local state
        setContent('')
        setTranslation('')
      } catch (error) {
        console.error('Failed to submit comment:', error)
      }
    }
  }

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [content])

  return (
    <div className="bg-gray-50 rounded-lg border shadow-sm">
      <div className="p-4 space-y-3">
        {replyTo && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-gray-500">回复：</span>
              <span className="font-medium text-gray-700 hover:text-gray-900 transition-colors">
                {replyTo.author}
              </span>
            </div>
            {onCancel && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onCancel}
                className="h-6 w-6 rounded-full hover:bg-gray-100"
              >
                <span aria-hidden>✕</span>
                <span className="sr-only">取消回复</span>
              </Button>
            )}
          </div>
        )}
        
        <Textarea
          ref={textareaRef}
          className="min-h-[100px] resize-none bg-white rounded-lg"
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        {content && (
          <div className="bg-white rounded-lg p-3 text-sm border">
            <p className="text-gray-500 text-xs mb-1">翻译预览:</p>
            <p className="text-gray-700 break-words">
              {isTranslating ? "翻译中..." : translation || "English translation will appear here..."}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSmartReply}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? "生成中..." : "智能回复"}
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!content || isTranslating}
            size="sm"
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            发送
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CommentInput