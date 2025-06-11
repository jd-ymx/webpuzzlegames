'use client'

import { useState } from 'react'

interface InteractiveImageProps {
  src: string
  alt: string
  className?: string
  onClick?: () => void
}

export default function InteractiveImage({ src, alt, className, onClick }: InteractiveImageProps) {
  const [loaded, setLoaded] = useState(true)

  const handleError = () => {
    setLoaded(false)
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
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
      onClick={handleClick}
    />
  )
} 