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

    .reddit-assistant-container svg {
      stroke-width: 1.5 !important;
      stroke-linecap: round !important;
      stroke-linejoin: round !important;
      fill: none !important;
      vertical-align: middle !important;
      color: var(--color-text-primary) !important;
    }

    /* 自定义滚动条样式 */
    .custom-scrollbar {
      scrollbar-width: thin !important;
      overflow-y: auto !important;
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
      background-color: transparent !important;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1 !important;
      border-radius: 4px !important;
      margin: 2px !important;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #c1c1c1 !important;
      border-radius: 4px !important;
      border: 2px solid #f1f1f1 !important;
      min-height: 40px !important;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #a1a1a1 !important;
    }

    .custom-scrollbar::-webkit-scrollbar-corner {
      background: transparent !important;
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