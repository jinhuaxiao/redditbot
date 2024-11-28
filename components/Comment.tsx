// Comment.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommentInput } from './CommentInput'

export interface Comment {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: string
  translation?: string
  replies?: Comment[]
}

interface CommentProps {
  comment: Comment
  onReply: (comment: Comment) => void
  isReplying: boolean
  onSubmitReply: (content: string, translation: string) => void
  onCancelReply: () => void
  depth?: number
  loading?: boolean
}

const COLORS = {
  0: 'border-blue-400',
  1: 'border-green-400',
  2: 'border-purple-400',
  3: 'border-orange-400'
}

export const Comment: React.FC<CommentProps> = ({ 
  comment, 
  onReply, 
  isReplying, 
  onSubmitReply,
  onCancelReply,
  depth = 0,
  loading = false
}) => {
  const borderColor = COLORS[depth % Object.keys(COLORS).length]
  
  if (!comment) {
    console.error('Comment is undefined')
    return null
  }

  try {
    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={`group ${depth > 0 ? 'pl-4' : ''}`}>
        <div className="relative">
          <div className={`absolute left-0 top-0 h-full w-0.5 ${borderColor} opacity-30`} />
          
          <div className="flex pl-4">
            <div className="flex-1">
              {/* 头部信息 */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6 shrink-0">
                    <AvatarImage src={comment.avatar} alt={comment.author} />
                    <AvatarFallback>{comment.author[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500 hover:text-gray-900"
                  onClick={() => onReply(comment)}
                >
                  回复
                </Button>
              </div>

              {/* 评论内容 */}
              <div className="mt-2 pl-8">
                <p className="text-sm text-gray-700 break-words">{comment.content}</p>
                {comment.translation && (
                  <div className={`mt-2 border-l-2 ${borderColor} pl-3 py-1 text-sm text-gray-600 bg-gray-50/50 rounded-r-md`}>
                    {comment.translation}
                  </div>
                )}
              </div>

              {/* 回复框 */}
              {isReplying && (
                <div className="mt-3 pl-8">
                  <CommentInput
                    placeholder={`回复 ${comment.author}...`}
                    onSubmit={onSubmitReply}
                    onCancel={onCancelReply}
                    replyTo={comment}
                  />
                </div>
              )}

              {/* 嵌套评论 */}
              {comment.replies?.length > 0 && depth < 4 && (
                <div className="mt-3">
                  <div 
                    className={`
                      overflow-y-auto 
                      custom-scrollbar
                      ${comment.replies.length > 2 ? 'max-h-[300px]' : 'max-h-[500px]'}
                      ${comment.replies.length > 0 ? 'min-h-[100px]' : ''}
                      border border-gray-100
                      rounded-md
                    `}
                  >
                    <div className="p-2">
                      {comment.replies.map(reply => (
                        <Comment
                          key={reply.id}
                          comment={reply}
                          onReply={onReply}
                          isReplying={false}
                          onSubmitReply={onSubmitReply}
                          onCancelReply={onCancelReply}
                          depth={depth + 1}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error rendering comment:', error)
    return (
      <div className="p-2 text-red-500 text-sm">
        Failed to load comment. Please try refreshing the page.
      </div>
    )
  }
}