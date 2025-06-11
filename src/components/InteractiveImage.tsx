'use client'

import { useState } from 'react'

interface InteractiveImageProps {
  src: string
  alt: string
  className?: string
  'data-url'?: string
  'data-thumbnail'?: string
  [key: string]: any
}

export default function InteractiveImage({ src, alt, className, 'data-url': dataUrl, ...props }: InteractiveImageProps) {
  const [loaded, setLoaded] = useState(true)

  const handleError = () => {
    setLoaded(false)
  }

  const handleClick = () => {
    if (dataUrl) {
      window.open(dataUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (!loaded) {
    return null
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      onClick={dataUrl ? handleClick : undefined}
      style={{ cursor: dataUrl ? 'pointer' : 'default' }}
      {...props}
    />
  )
} 