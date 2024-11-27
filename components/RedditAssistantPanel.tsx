import React, { useState } from 'react'
import { MessageSquare, ChevronDown, Pin, X, CornerUpRight } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Badge } from '~/components/ui/badge'

interface Comment {
  id: number
  author: string
  content: string
  translation: string
  replies: Comment[]
}

interface Post {
  title: string
  content: string
  translation: string
  comments: Comment[]
}

export const RedditAssistantPanel = () => {
  const [isPinned, setIsPinned] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [translatedReply, setTranslatedReply] = useState('')

  // Mock current post data
  const currentPost: Post = {
    title: "Moldy pot",
    content: "Hi so I don't think there's anything wrong with my plant but the outside of the pot looks like it's growing mold, what can I do to get rid of it without hurting the plant?",
    translation: "你好，我觉得我的植物没什么问题，但是花盆外面看起来在长霉，我该如何在不伤害植物的情况下去除霉菌？",
    comments: [
      {
        id: 1,
        author: "AQMessiah",
        content: "Is there a hole on the bottom for excess water to flow?",
        translation: "底部有排水孔让多余的水流出吗？",
        replies: []
      }
    ]
  }

  const handleTranslateReply = async (text: string) => {
    // TODO: Implement translation API call
    setTranslatedReply("This is a mocked English translation...")
  }

  const handleSubmitReply = () => {
    console.log("Submitting reply:", translatedReply)
    setReplyContent('')
    setTranslatedReply('')
    setReplyTo(null)
  }

  if (!isExpanded) {
    return (
      <div className="fixed right-4 bottom-4 shadow-lg">
        <Button 
          className="rounded-full p-3"
          onClick={() => setIsExpanded(true)}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className={`fixed ${isPinned ? 'right-4 top-4' : 'right-4 bottom-4'} w-[380px] shadow-lg max-h-[80vh] flex flex-col`}>
      <CardHeader className="border-b flex flex-row items-center justify-between p-3 space-y-0 bg-gray-50">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Reddit Assistant</CardTitle>
          <Badge variant="secondary" className="h-5 px-2 py-0 bg-blue-100 text-blue-700">中 / EN</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsPinned(!isPinned)}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'text-blue-500' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">{currentPost.title}</h3>
              <p className="text-gray-700 mb-2 leading-relaxed">{currentPost.content}</p>
              <p className="text-gray-600 text-sm border-l-2 border-blue-500 pl-3 py-1 bg-blue-50/50">
                {currentPost.translation}
              </p>
            </div>

            <div className="space-y-4">
              {currentPost.comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{comment.author}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-gray-200"
                      onClick={() => setReplyTo(comment)}
                    >
                      <CornerUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
                  <p className="text-gray-600 text-xs border-l-2 border-blue-500 pl-3 py-1 bg-blue-50/50">
                    {comment.translation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="border-t">
          {replyTo && (
            <div className="flex items-center justify-between px-4 py-2 text-sm bg-blue-50 border-b">
              <span className="text-blue-600">回复: {replyTo.author}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-blue-100"
                onClick={() => setReplyTo(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="p-4 space-y-3 bg-white">
            <Input
              placeholder="输入中文回复..."
              value={replyContent}
              onChange={(e) => {
                setReplyContent(e.target.value)
                handleTranslateReply(e.target.value)
              }}
              className="focus:ring-2 focus:ring-blue-500"
            />
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm mb-2">翻译预览:</p>
              <p className="text-gray-700">{translatedReply || "English translation will appear here..."}</p>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmitReply}
              disabled={!translatedReply}
            >
              发送回复
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 