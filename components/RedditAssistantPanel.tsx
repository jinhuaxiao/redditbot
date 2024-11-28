import React, { useState, useEffect, useCallback } from 'react'
import { MessageSquare, ChevronDown, Pin, Send } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Comment {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: string
  translation?: string
}

interface Post {
  title: string
  content: string
  translation?: string
  comments: Comment[]
}

interface RedditAssistantPanelProps {
  onMinimize?: () => void
}

// 提取内容的辅助函数
const extractRedditContent = () => {
  try {
    // 获取帖子信息
    const titleElement = document.querySelector('[id^="post-title-t3_"]')
    const contentElement = document.querySelector('[id$="-post-rtjson-content"]')
    
    // 提取评论
    const commentElements = document.querySelectorAll('shreddit-comment')
    const comments: Comment[] = Array.from(commentElements).map((comment) => {
      const authorElement = comment.querySelector('.text-neutral-content-strong')
      const contentElement = comment.querySelector('.md.text-14')
      const avatarElement = comment.querySelector('img')
      const timestampElement = comment.querySelector('time')

      return {
        id: comment.getAttribute('thingid') || Math.random().toString(),
        author: authorElement?.textContent?.trim() || 'Anonymous',
        content: contentElement?.textContent?.trim() || '',
        avatar: avatarElement?.src || '',
        timestamp: timestampElement?.getAttribute('datetime') || new Date().toISOString(),
        translation: '' // 预留翻译位置
      }
    })

    return {
      title: titleElement?.textContent?.trim() || 'Untitled',
      content: contentElement?.textContent?.trim() || '',
      translation: '', // 预留翻译位置
      comments
    }
  } catch (error) {
    console.error('Error extracting Reddit content:', error)
    return null
  }
}

// 评论输入组件
const CommentInput = ({ 
  onSubmit, 
  onCancel, 
  placeholder = "输入中文回复...",
  replyTo = null 
}: {
  onSubmit: (content: string, translation: string) => void
  onCancel?: () => void
  placeholder?: string
  replyTo?: Comment | null
}) => {
  const [content, setContent] = useState('')
  const [translation, setTranslation] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)

  // 处理翻译
  const handleTranslate = useCallback(async (text: string) => {
    if (!text) return
    setIsTranslating(true)
    try {
      // TODO: 实现翻译 API 调用
      const translatedText = "Translation preview..." // 替换为实际翻译结果
      setTranslation(translatedText)
    } catch (error) {
      console.error('Translation error:', error)
    } finally {
      setIsTranslating(false)
    }
  }, [])

  // 防抖处理翻译请求
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content) {
        handleTranslate(content)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [content, handleTranslate])

  return (
    <div className="border-t bg-neutral-50">
      <div className="p-4 space-y-3">
        {replyTo && (
          <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded">
            <span>回复 {replyTo.author}</span>
            {onCancel && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onCancel}
                className="h-6 w-6 p-0"
              >
                ✕
              </Button>
            )}
          </div>
        )}
        <Input
          className="bg-white"
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {content && (
          <div className="bg-white rounded p-3 text-sm border">
            <p className="text-gray-500 text-xs mb-1">翻译预览:</p>
            <p className="text-gray-700">
              {isTranslating ? "翻译中..." : translation || "English translation will appear here..."}
            </p>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button
            className="bg-white hover:bg-gray-100"
            size="sm"
            onClick={() => {
              if (content) {
                onSubmit(content, translation)
                setContent('')
                setTranslation('')
              }
            }}
            disabled={!content || isTranslating}
          >
            <Send className="w-4 h-4 mr-2" />
            发送
          </Button>
        </div>
      </div>
    </div>
  )
}

// 评论组件
const Comment = ({ 
  comment, 
  onReply, 
  isReplying,
  onSubmitReply,
  onCancelReply
}: {
  comment: Comment
  onReply: (comment: Comment) => void
  isReplying: boolean
  onSubmitReply: (content: string, translation: string) => void
  onCancelReply: () => void
}) => (
  <div className="py-3 group">
    <div className="flex gap-3">
      <Avatar className="w-8 h-8">
        <AvatarImage src={comment.avatar} alt={comment.author} />
        <AvatarFallback>{comment.author[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-sm">{comment.author}</span>
            <span className="text-xs text-gray-500 ml-2">
              {new Date(comment.timestamp).toLocaleString()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onReply(comment)}
          >
            回复
          </Button>
        </div>
        <p className="mt-2 text-sm">{comment.content}</p>
        {comment.translation && (
          <div className="mt-2 border-l-2 border-green-500 pl-2 py-1 text-sm text-gray-600 bg-green-50">
            {comment.translation}
          </div>
        )}
      </div>
    </div>
    {isReplying && (
      <div className="mt-3 ml-11">
        <CommentInput
          placeholder={`回复 ${comment.author}...`}
          onSubmit={onSubmitReply}
          onCancel={onCancelReply}
          replyTo={comment}
        />
      </div>
    )}
  </div>
)

// 主面板组件
export const RedditAssistantPanel: React.FC<RedditAssistantPanelProps> = ({ onMinimize }) => {
  const [isPinned, setIsPinned] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)
  const [currentPost, setCurrentPost] = useState<Post | null>(null)

  // 初始化内容
  useEffect(() => {
    const content = extractRedditContent()
    if (content) {
      setCurrentPost(content)
    }

    // 监听 Escape 键
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false)
        onMinimize?.()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onMinimize])

  // 最小化状态
  if (!isExpanded) {
    return (
      <div className="fixed right-6 bottom-6 shadow-lg">
        <Button 
          className="rounded-full p-3"
          onClick={() => setIsExpanded(true)}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    )
  }

  if (!currentPost) return null

  return (
    <Card className={`fixed ${isPinned ? 'right-6 top-16' : 'right-6 bottom-6'} w-[400px] shadow-lg max-h-[85vh] flex flex-col bg-white`}>
      <CardHeader className="border-b flex flex-row items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-lg">Reddit Assistant</h3>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">中 / EN</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsPinned(!isPinned)}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'text-blue-500' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* 帖子内容 */}
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-2">{currentPost.title}</h3>
              <p className="text-gray-600">{currentPost.content}</p>
              {currentPost.translation && (
                <div className="mt-2 border-l-2 border-green-500 pl-2 py-1 text-sm text-gray-600 bg-green-50">
                  {currentPost.translation}
                </div>
              )}
            </div>

            {/* 评论列表 */}
            <div className="space-y-4">
              {currentPost.comments.map(comment => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onReply={setReplyingTo}
                  isReplying={replyingTo?.id === comment.id}
                  onSubmitReply={(content, translation) => {
                    console.log('Submit reply:', { content, translation, to: comment })
                    setReplyingTo(null)
                  }}
                  onCancelReply={() => setReplyingTo(null)}
                />
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* 主评论输入框 */}
        {!replyingTo && (
          <CommentInput
            placeholder="发表评论..."
            onSubmit={(content, translation) => {
              console.log('New comment:', { content, translation })
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default RedditAssistantPanel