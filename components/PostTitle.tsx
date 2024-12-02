import React, { useState } from 'react'
import { TranslateButton } from './TranslateButton'

interface PostTitleProps {
  title: string
  className?: string
}

export const PostTitle: React.FC<PostTitleProps> = ({
  title,
  className = ''
}) => {
  const [translation, setTranslation] = useState('')

  const handleTranslated = (newTranslation: string) => {
    setTranslation(newTranslation)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start gap-2 group">
        <h1 className="text-xl font-semibold flex-1">{title}</h1>
        <TranslateButton
          text={title}
          onTranslated={handleTranslated}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
      {translation && (
        <p className="text-gray-600">
          {translation}
        </p>
      )}
    </div>
  )
}
