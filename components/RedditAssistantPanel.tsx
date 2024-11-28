import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, ChevronDown, Pin, Send } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useInView } from 'react-intersection-observer'
import { Comment, type Comment as CommentType } from './Comment'
import { CommentInput } from './CommentInput'

interface Post {
  title: string
  content: string
  translation?: string
  comments: CommentType[]
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
    const comments: CommentType[] = Array.from(commentElements).map((comment) => {
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

// 主面板组件
export const RedditAssistantPanel: React.FC<RedditAssistantPanelProps> = ({ onMinimize }) => {
  const [isPinned, setIsPinned] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)
  const [replyingTo, setReplyingTo] = useState<CommentType | null>(null)
  const [currentPost, setCurrentPost] = useState<Post | null>(null)
  const [visibleComments, setVisibleComments] = useState<CommentType[]>([])
  const [page, setPage] = useState(1)
  const commentsPerPage = 10
  
  const { ref, inView } = useInView({
    threshold: 0.5
  })

  useEffect(() => {
    if (inView && currentPost) {
      const nextComments = currentPost.comments.slice(0, page * commentsPerPage)
      setVisibleComments(nextComments)
      setPage(prev => prev + 1)
    }
  }, [inView, currentPost, page])

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
              {visibleComments.map(comment => (
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
              {/* 加载更多的触发器 */}
              <div ref={ref} className="h-4" />
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