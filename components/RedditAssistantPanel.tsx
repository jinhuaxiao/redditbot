import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, ChevronDown, Pin, Send } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
      const avatarElement = comment.querySelector('image[href], img[src]')
      const timestampElement = comment.querySelector('time')

      const avatarSrc = avatarElement ? 
        'href' in avatarElement ? (avatarElement as SVGImageElement).href.baseVal : 
        (avatarElement as HTMLImageElement).src
      : ''

      return {
        id: comment.getAttribute('thingid') || Math.random().toString(),
        author: authorElement?.textContent?.trim() || 'Anonymous',
        content: contentElement?.textContent?.trim() || '',
        avatar: avatarSrc,
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
}) => {
  const [content, setContent] = useState('')
  const [translation, setTranslation] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const textareaRef = useRef(null)

  const handleTranslate = useCallback(async (text: string) => {
    if (!text) return
    setIsTranslating(true)
    try {
      // TODO: 实现翻译 API 调用
      setTranslation("Translation preview...")
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [content])

  return (
    <div className="bg-gray-50 border-t">
      <div className="p-4 space-y-3">
        {replyTo && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50/50 px-4 py-2.5 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-gray-400">回复</span>
              <span className="font-medium text-gray-600">{replyTo.author}</span>
            </div>
            {onCancel && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onCancel}
                className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">关闭回复</span>
                ✕
              </Button>
            )}
          </div>
        )}
        <Textarea
          ref={textareaRef}
          className="min-h-[100px] bg-white resize-none rounded-lg"
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {content && (
          <div className="bg-white rounded-lg p-3 text-sm border">
            <p className="text-gray-500 text-xs mb-1">翻译预览:</p>
            <p className="text-gray-700">
              {isTranslating ? "翻译中..." : translation || "English translation will appear here..."}
            </p>
          </div>
        )}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="hover:bg-gray-100"
            >
              取消
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              if (content) {
                onSubmit(content, translation)
                setContent('')
                setTranslation('')
              }
            }}
            disabled={!content || isTranslating}
            className="bg-blue-500 hover:bg-blue-600"
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
  onCancelReply,
  depth = 0 
}) => {
  return (
    <div className={`relative ${depth > 0 ? 'ml-6' : ''}`}>
      <div className="flex items-start gap-3">
        {/* 头像 */}
        <Avatar className="w-6 h-6 shrink-0 mt-1">
          <AvatarImage src={comment.avatar} alt={comment.author} />
          <AvatarFallback>{comment.author[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* 作者信息和回复按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-sm truncate">{comment.author}</span>
              <span className="text-xs text-gray-500">
                {new Date(comment.timestamp).toLocaleString()}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-900"
              onClick={() => onReply(comment)}
            >
              回复
            </Button>
          </div>

          {/* 评论内容和翻译 */}
          <div className="mt-2">
            <p className="text-sm text-gray-700">{comment.content}</p>
            {comment.translation && (
              <div className="mt-2 border-l-2 border-blue-300 pl-3 py-1 text-sm text-gray-600 bg-gray-50 rounded-r-md">
                {comment.translation}
              </div>
            )}
          </div>

          {/* 回复框 */}
          {isReplying && (
            <div className="mt-3">
              <CommentInput
                placeholder={`回复 ${comment.author}...`}
                onSubmit={onSubmitReply}
                onCancel={onCancelReply}
                replyTo={comment}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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
            onCancel={() => {}}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default RedditAssistantPanel