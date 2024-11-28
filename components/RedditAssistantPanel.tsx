import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, ChevronDown, Pin, Send, RefreshCw, Spinner } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
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
const extractRedditContent = async () => {
  try {
    // 等待一小段时间确保 DOM 已更新
    const waitForElement = (selector: string, maxAttempts = 10, interval = 200) => {
      return new Promise<Element | null>((resolve) => {
        let attempts = 0;
        
        const check = () => {
          attempts++;
          const element = document.querySelector(selector);
          
          if (element) {
            resolve(element);
          } else if (attempts < maxAttempts) {
            setTimeout(check, interval);
          } else {
            resolve(null);
          }
        };
        
        check();
      });
    };

    // 等待必要的元素加载
    const [titleElement, contentElement] = await Promise.all([
      waitForElement('[id^="post-title-t3_"], h1[slot="title"], .Post h1'),
      waitForElement('[id$="-post-rtjson-content"], [data-testid="post-content"], .Post .RichTextJSON-root')
    ]);
    
    // 等待评论加载
    await waitForElement('shreddit-comment, .Comment, [data-testid="comment"]');
    
    // 提取评论
    const commentElements = document.querySelectorAll(
      'shreddit-comment, .Comment, [data-testid="comment"]'
    );

    const comments: CommentType[] = Array.from(commentElements).map((comment) => {
      const authorElement = comment.querySelector(
        '.text-neutral-content-strong, .author, [data-testid="comment-author"]'
      );
      const contentElement = comment.querySelector(
        '.md.text-14, .RichTextJSON-root, [data-testid="comment-content"]'
      );
      const avatarElement = comment.querySelector('image[href], img[src]');
      const timestampElement = comment.querySelector('time, [data-testid="timestamp"]');

      const avatarSrc = avatarElement ? 
        'href' in avatarElement ? (avatarElement as SVGImageElement).href.baseVal : 
        (avatarElement as HTMLImageElement).src
      : '';

      // 添加错误检查
      if (!authorElement?.textContent || !contentElement?.textContent) {
        console.warn('Missing required comment data:', { authorElement, contentElement });
        return null;
      }

      return {
        id: comment.getAttribute('thingid') || Math.random().toString(),
        author: authorElement.textContent.trim(),
        content: contentElement.textContent.trim(),
        avatar: avatarSrc,
        timestamp: timestampElement?.getAttribute('datetime') || new Date().toISOString(),
        translation: ''
      };
    }).filter(Boolean); // 过滤掉无效的评论

    if (!titleElement) {
      console.warn('Failed to find title element');
      return null;
    }

    return {
      title: titleElement.textContent?.trim() || 'Untitled',
      content: contentElement?.textContent?.trim() || '',
      translation: '',
      comments
    };
  } catch (error) {
    console.error('Error extracting Reddit content:', error);
    return null;
  }
};

export const RedditAssistantPanel: React.FC<RedditAssistantPanelProps> = ({ onMinimize }) => {
  const [isPinned, setIsPinned] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)
  const [replyingTo, setReplyingTo] = useState<CommentType | null>(null)
  const [currentPost, setCurrentPost] = useState<Post | null>(null)
  const [visibleComments, setVisibleComments] = useState<CommentType[]>([])
  const [page, setPage] = useState(1)
  const commentsPerPage = 10
  const [isLoading, setIsLoading] = useState(false)
  const [comments, setComments] = useState<CommentType[]>([])
  const [currentUrl, setCurrentUrl] = useState(window.location.href)
  const urlChangeTimeoutRef = useRef<NodeJS.Timeout>()

  const { ref, inView } = useInView({
    threshold: 0.5,
    delay: 100
  })

  // 提取内容并重置状态的函数
  const refreshContent = useCallback(async () => {
    setIsLoading(true)
    try {
      const content = await extractRedditContent()
      if (content) {
        setCurrentPost(content)
        setVisibleComments(content.comments.slice(0, commentsPerPage))
        setPage(1)
        setReplyingTo(null)
      }
    } catch (error) {
      console.error('Failed to refresh content:', error)
    } finally {
      setIsLoading(false)
    }
  }, [commentsPerPage])

  // 监听 URL 变化
  useEffect(() => {
    const handleUrlChange = async () => {
      const newUrl = window.location.href
      if (newUrl !== currentUrl) {
        // 清除之前的定时器
        if (urlChangeTimeoutRef.current) {
          clearTimeout(urlChangeTimeoutRef.current)
        }

        // 设置新的定时器
        urlChangeTimeoutRef.current = setTimeout(async () => {
          setCurrentUrl(newUrl)
          await refreshContent()
        }, 500) // 给 Reddit 的 DOM 更新一些时间
      }
    }

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          handleUrlChange()
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href']
    })

    // 监听 popstate 事件（浏览器前进/后退）
    window.addEventListener('popstate', handleUrlChange)

    // 初始加载内容
    refreshContent()

    return () => {
      observer.disconnect()
      window.removeEventListener('popstate', handleUrlChange)
      if (urlChangeTimeoutRef.current) {
        clearTimeout(urlChangeTimeoutRef.current)
      }
    }
  }, [currentUrl, refreshContent])

  // pushState 和 replaceState 的拦截
  useEffect(() => {
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    const handleStateChange = async () => {
      const newUrl = window.location.href
      if (newUrl !== currentUrl) {
        setCurrentUrl(newUrl)
        await refreshContent()
      }
    }

    window.history.pushState = function(...args) {
      originalPushState.apply(this, args)
      handleStateChange()
    }

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args)
      handleStateChange()
    }

    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [currentUrl, refreshContent])

  // 监听滚动加载更多评论
  useEffect(() => {
    if (inView && currentPost && !isLoading) {
      const startIndex = (page - 1) * commentsPerPage
      const endIndex = page * commentsPerPage
      const nextComments = currentPost.comments.slice(0, endIndex)
      
      if (nextComments.length > visibleComments.length) {
        setVisibleComments(nextComments)
        setPage(prev => prev + 1)
      }
    }
  }, [inView, currentPost, page, isLoading, visibleComments.length])

  // 监听 Escape
  useEffect(() => {
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
      {/* 头部 */}
      <CardHeader className="border-b flex flex-row items-center justify-between p-3 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-lg">Reddit Assistant</h3>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">中 / EN</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshContent}
            disabled={isLoading}
          >
            {isLoading ? <Spinner className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsPinned(!isPinned)}>
            <Pin className={`w-4 h-4 ${isPinned ? 'text-blue-500' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* 内容区域 */}
      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {/* 帖子内容 */}
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">{currentPost?.title}</h3>
              <p className="text-gray-600">{currentPost?.content}</p>
              {currentPost?.translation && (
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
              
              {/* 加载更多触发器 */}
              {currentPost.comments.length > visibleComments.length && (
                <div ref={ref} className="h-8 flex items-center justify-center">
                  {isLoading ? (
                    <Spinner className="w-4 h-4 text-gray-400" />
                  ) : (
                    <span className="text-sm text-gray-400">加载更多评论</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 评论输入框 */}
        {!replyingTo && (
          <div className="border-t p-4 bg-white mt-auto">
            <CommentInput
              placeholder="发表评论..."
              onSubmit={(content, translation) => {
                console.log('New comment:', { content, translation })
              }}
              onCancel={() => {}}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RedditAssistantPanel