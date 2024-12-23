import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, ChevronDown, Pin, Send, RefreshCw, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useInView } from 'react-intersection-observer'
import { Comment, type Comment as CommentType } from './Comment'
import { CommentInput } from './CommentInput'
import { TranslateButton } from './TranslateButton'

interface Post {
  title: string
  content: string
  translation?: string
  titleTranslation?: string
  comments: CommentType[]
}

interface RedditAssistantPanelProps {
  onMinimize?: () => void
  postId?: string
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
    }).filter(Boolean);

    if (!titleElement) {
      console.warn('Failed to find title element');
      return null;
    }

    return {
      title: titleElement.textContent?.trim() || 'Untitled',
      content: contentElement?.textContent?.trim() || '',
      translation: '',
      titleTranslation: '',
      comments
    };
  } catch (error) {
    console.error('Error extracting Reddit content:', error);
    return null;
  }
};

export const RedditAssistantPanel: React.FC<RedditAssistantPanelProps> = ({ onMinimize, postId }) => {
  const [isPinned, setIsPinned] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)
  const [replyingTo, setReplyingTo] = useState<CommentType | null>(null)
  const [currentPost, setCurrentPost] = useState<Post | null>(null)
  const [visibleComments, setVisibleComments] = useState<CommentType[]>([])
  const [page, setPage] = useState(1)
  const commentsPerPage = 10
  const [isLoading, setIsLoading] = useState(false)
  const [currentPostId, setCurrentPostId] = useState(postId)
  
  const { ref, inView } = useInView({
    threshold: 0.5,
    delay: 100
  })

  // 页面变化监听
  useEffect(() => {
    if (postId !== currentPostId) {
      setCurrentPostId(postId)
      refreshContent()
      setPage(1)
      setVisibleComments([])
      setReplyingTo(null)
    }
  }, [postId])

  // 提取内容并重置状态的函数
  const refreshContent = useCallback(async () => {
    setIsLoading(true)
    try {
      const content = await extractRedditContent()
      if (content) {
        setCurrentPost(content)
        setVisibleComments(content.comments.slice(0, commentsPerPage))
      }
    } catch (error) {
      console.error('Failed to refresh content:', error)
    } finally {
      setIsLoading(false)
    }
  }, [commentsPerPage])

  // 初始加载内容
  useEffect(() => {
    refreshContent()
  }, [refreshContent])

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
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
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
              <div className="group flex items-start gap-2 mb-2">
                <h3 className="font-medium text-lg flex-1">{currentPost?.title}</h3>
                <TranslateButton
                  text={currentPost?.title || ''}
                  onTranslated={(translation) => {
                    if (currentPost) {
                      setCurrentPost({
                        ...currentPost,
                        titleTranslation: translation
                      })
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              {currentPost?.titleTranslation && (
                <p className="text-gray-600 text-sm mb-4">
                  {currentPost.titleTranslation}
                </p>
              )}
              
              <div className="group flex items-start gap-2">
                <p className="text-gray-600 flex-1">{currentPost?.content}</p>
                <TranslateButton
                  text={currentPost?.content || ''}
                  onTranslated={(translation) => {
                    if (currentPost) {
                      setCurrentPost({
                        ...currentPost,
                        translation
                      })
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
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
                <div 
                  ref={ref} 
                  className="h-8 flex items-center justify-center cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    const nextBatch = currentPost.comments.slice(
                      visibleComments.length,
                      visibleComments.length + commentsPerPage
                    );
                    setVisibleComments([...visibleComments, ...nextBatch]);
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">加载更多评论</span>
                      <span className="text-xs text-gray-400">
                        ({currentPost.comments.length - visibleComments.length} 条未显示)
                      </span>
                    </div>
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