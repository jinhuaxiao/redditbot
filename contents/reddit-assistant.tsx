import React, { useState, useEffect } from 'react'
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

    /* 优化后的滚动条样式 */
    .custom-scrollbar {
      scrollbar-width: thin !important;
      scrollbar-color: var(--color-neutral-border-strong) transparent !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      -webkit-overflow-scrolling: touch !important;
    }

    /* Webkit browsers */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px !important;
      height: 6px !important;
      background-color: transparent !important;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent !important;
      border-radius: 3px !important;
      margin: 2px !important;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: var(--color-neutral-border-strong, #c1c1c1) !important;
      border-radius: 3px !important;
      border: none !important;
      min-height: 40px !important;
      transition: background-color 0.2s ease !important;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: var(--color-neutral-border-stronger, #a1a1a1) !important;
    }

    /* 增加滚动容器样式 */
    .scroll-container {
      position: relative !important;
      height: auto !important;
      max-height: 500px !important; /* 可根据需要调整 */
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
    }

    /* 确保滚动内容有合适的内边距 */
    .scroll-content {
      padding: 1rem !important;
      position: relative !important;
    }

    /* 优化移动端滚动体验 */
    @media (max-width: 768px) {
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px !important;
      }
      
      .scroll-container {
        max-height: calc(100vh - 200px) !important;
      }
    }

    ${cssText}
  `
  return style
}

const RedditAssistantContainer = () => {
  const [mounted, setMounted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setMounted(true)
      } catch (error) {
        console.error('Failed to mount Reddit Assistant:', error)
        setLoadError(true)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loadError) {
    return (
      <div className="reddit-assistant-container">
        <div className="reddit-assistant-panel p-4">
          <p className="text-red-500">Failed to load Reddit Assistant. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="reddit-assistant-container">
        <div className="reddit-assistant-panel p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reddit-assistant-container">
      {isMinimized ? (
        <div className="reddit-assistant-button" onClick={() => setIsMinimized(false)}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      ) : (
        <div className="reddit-assistant-panel">
          <ErrorBoundary fallback={<ErrorFallback />}>
            <RedditAssistantPanel onMinimize={() => setIsMinimized(true)} />
          </ErrorBoundary>
        </div>
      )}
    </div>
  )
}

export default RedditAssistantContainer