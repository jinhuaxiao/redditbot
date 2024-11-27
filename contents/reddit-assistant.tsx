import React, { useState,useReducer  } from 'react'
import type { PlasmoCSConfig } from "plasmo"
import cssText from "data-text:~style.css"
import { RedditAssistantPanel } from "~components/RedditAssistantPanel"


export const config: PlasmoCSConfig = {
  matches: ["https://*.reddit.com/*"]
}

// Define shadow host ID
export const getShadowHostId = () => "reddit-assistant-host"

// Ensure style isolation
export const getShadowRoot = () => {
  return document.querySelector("#reddit-assistant-host")?.shadowRoot
}

// Inject base styles

export const getStyle = () => {
  const style = document.createElement("style")
  
  style.textContent = `
    /* 重置根容器样式，但保留定位和尺寸属性 */
    .reddit-assistant-container {
      all: initial !important;
      display: block !important;
    }
    
    /* 恢复内部元素样式，但保持隔离 */
    .reddit-assistant-container > * {
      all: revert !important;
    }

    /* 修复 SVG 图标样式 */
    .reddit-assistant-container svg.lucide {
      display: inline-block !important;
      vertical-align: middle !important;
      stroke: currentColor !important;
      stroke-width: 2 !important;
      stroke-linecap: round !important;
      stroke-linejoin: round !important;
      fill: none !important;
      width: 1em !important;
      height: 1em !important;
    }

    /* 修复按钮中的图标对齐 */
    .reddit-assistant-container button svg.lucide {
      position: relative !important;
      pointer-events: none !important;
      top: -0.5px !important;
    }

    /* 特定组件样式修复 */
    .reddit-assistant-container [class*="Card"] {
      background: white !important;
      border-radius: 0.5rem !important;
    }

    /* 确保 z-index 生效 */
    .reddit-assistant-container .fixed {
      position: fixed !important;
      z-index: 999999 !important;
    }

    /* 确保滚动区域正常工作 */
    .reddit-assistant-container .ScrollArea {
      max-height: inherit !important;
      overflow: hidden !important;
    }

    /* 确保按钮样式正确 */
    .reddit-assistant-container button {
      all: revert !important;
      cursor: pointer !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    /* 确保输入框样式正确 */
    .reddit-assistant-container input {
      all: revert !important;
      box-sizing: border-box !important;
      width: 100% !important;
    }

    /* 最后注入 Tailwind 样式 */
    ${cssText}
  `
  return style
}

const RedditAssistantContainer = () => {

  return (
    <div className="reddit-assistant-container">
      <div className="fixed top-5 right-5 w-[380px] bg-white rounded-lg shadow-lg z-[999999]">
        <RedditAssistantPanel />
      </div>
    </div>
  )
}

export default RedditAssistantContainer 