import React, { useState, useEffect, useCallback } from 'react'
import type { PlasmoCSConfig } from "plasmo"
import cssText from "data-text:~style.css"
import RedditAssistantPanel from "~components/RedditAssistantPanel"
import { ErrorBoundary, ErrorFallback } from '~/components/ErrorBoundary'

export const config: PlasmoCSConfig = {
  matches: ["https://*.reddit.com/*"]
}

export const getShadowHostId = () => "reddit-assistant-host"

export const getShadowRoot = () => {
  return document.querySelector("#reddit-assistant-host")?.shadowRoot
}

// 检查当前页面类型的工具函数
const checkPageType = () => {
  const path = window.location.pathname

  // 帖子详情页正则表达式
  const postPageRegex = /^\/r\/[^\/]+\/comments\/[^\/]+\//i
  
  return {
    // 是否为帖子详情页
    isPostPage: postPageRegex.test(path),
    // 获取帖子ID (如果是详情页)
    postId: postPageRegex.test(path) ? path.split('/')[4] : null
  }
}

export const getStyle = () => {
  const style = document.createElement("style")
  
  style.textContent = `
    .reddit-assistant-container {
      all: initial !important;
      display: block !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
      position: fixed !important;
      z-index: 999999 !important;
      top: 80px !important;
      right: 30px !important;
    }
    
    .reddit-assistant-container > * {
      all: revert !important;
    }

    .reddit-assistant-panel {
      width: 480px !important;
      max-height: calc(100vh - 100px) !important;
      background: var(--color-neutral-background-weak) !important;
      box-shadow: var(--shadow-elevation) !important;
      border-radius: var(--radius-md) !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
    }

    .reddit-assistant-button {
      width: 48px !important;
      height: 48px !important;
      border-radius: 24px !important;
      background: var(--color-neutral-background-weak) !important;
      box-shadow: var(--shadow-elevation) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: transform 0.2s ease-in-out !important;
      border: 1px solid var(--color-neutral-border-weak) !important;
    }

    .reddit-assistant-button:hover {
      transform: scale(1.05) !important;
      background: var(--color-neutral-background-strong) !important;
    }

    ${cssText}
  `
  return style
}


const getPostIdFromUrl = (url: string) => {
  const matches = url.match(/\/comments\/([a-zA-Z0-9]+)/)
  return matches ? matches[1] : null
}

const isPostPage = (url: string) => {
  return /\/r\/[^\/]+\/comments\/[^\/]+/.test(url)
}

const RedditAssistantContainer = () => {
  const [mounted, setMounted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [currentPostId, setCurrentPostId] = useState<string | null>(null)
  const [shouldDisplay, setShouldDisplay] = useState(false)

  // 监听 URL 变化并更新状态
  useEffect(() => {
    const checkAndUpdatePostId = () => {
      const url = window.location.href
      const isPost = isPostPage(url)
      const postId = isPost ? getPostIdFromUrl(url) : null

      setShouldDisplay(isPost)
      if (postId !== currentPostId) {
        setCurrentPostId(postId)
      }
    }

    // 创建 URL 变化监听器
    const urlObserver = new MutationObserver(() => {
      checkAndUpdatePostId()
    })

    // 监听 body 变化
    urlObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // 监听浏览器前进后退
    const handleStateChange = () => {
      checkAndUpdatePostId()
    }

    window.addEventListener('popstate', handleStateChange)

    // 初始检查
    const init = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setMounted(true)
        checkAndUpdatePostId()
      } catch (error) {
        console.error('Failed to initialize:', error)
        setLoadError(true)
      }
    }

    init()

    // 清理函数
    return () => {
      urlObserver.disconnect()
      window.removeEventListener('popstate', handleStateChange)
    }
  }, [currentPostId])

  // 如果不是帖子页面，不显示组件
  if (!shouldDisplay || !mounted) {
    return null
  }

  // 加载错误状态
  if (loadError) {
    return (
      <div className="reddit-assistant-container">
        <div className="reddit-assistant-panel p-4">
          <p className="text-red-500">加载失败，请刷新页面重试。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="reddit-assistant-container">
      {isMinimized ? (
        <div 
          className="reddit-assistant-button" 
          onClick={() => setIsMinimized(false)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="currentColor"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      ) : (
        <div className="reddit-assistant-panel">
          <ErrorBoundary fallback={<ErrorFallback />}>
            <RedditAssistantPanel
              key={currentPostId} // 添加 key 确保组件重新渲染
              postId={currentPostId || undefined}
              onMinimize={() => setIsMinimized(true)}
            />
          </ErrorBoundary>
        </div>
      )}
    </div>
  )
}

export default RedditAssistantContainer