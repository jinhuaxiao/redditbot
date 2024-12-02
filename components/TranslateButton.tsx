import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Languages } from 'lucide-react'
import { translateText } from '@/lib/translationService'

interface TranslateButtonProps {
  text: string
  onTranslated: (translation: string) => void
  className?: string
}

export const TranslateButton: React.FC<TranslateButtonProps> = ({
  text,
  onTranslated,
  className = ''
}) => {
  const [isTranslating, setIsTranslating] = useState(false)

  const handleTranslate = async () => {
    if (isTranslating) return
    setIsTranslating(true)
    try {
      const translation = await translateText(text, {
        sourceLanguage: 'English',
        targetLanguage: 'Chinese',
        temperature: 0.3
      })
      onTranslated(translation)
    } catch (error) {
      console.error('Translation error:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-6 w-6 ${className}`}
      onClick={handleTranslate}
      disabled={isTranslating}>
      {isTranslating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Languages className="h-4 w-4" />
      )}
    </Button>
  )
}
