import React, { useState, useEffect } from 'react'
import type { PlasmoCSConfig } from "plasmo"
import cssText from "data-text:~style.css"
import RedditAssistantPanel from "~components/RedditAssistantPanel"

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

    ${cssText}
  `
  return style
}

const RedditAssistantContainer = () => {
  const [mounted, setMounted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return null
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
          <RedditAssistantPanel onMinimize={() => setIsMinimized(true)} />
        </div>
      )}
    </div>
  )
}

export default RedditAssistantContainer