'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Gamepad2, Star, Clock, Users, Monitor } from 'lucide-react'
import { Game, Category } from '@/types'
import GameCard from './GameCard'
import InteractiveImage from './InteractiveImage'
import Breadcrumb from './Breadcrumb'
import { GameAnalytics, PerformanceMonitor, UserJourneyTracker, setupScrollTracking } from '@/utils/analytics'
import { getCategoryStyle, getGameDescription, formatGameTags, getEnhancedGameDescriptionEn } from '@/utils/gameUtils'

interface GameDetailClientProps {
  game: Game
  relatedGames: Game[]
  categories: Category[]
}

export default function GameDetailClient({ game, relatedGames, categories }: GameDetailClientProps) {
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [timeOnPage, setTimeOnPage] = useState(0)

  // 分析相关的状态
  const category = categories.find(cat => cat.id === game.category)
  const visibleTags = game.tags.slice(0, 6)
  const extraTagsCount = Math.max(0, game.tags.length - 6)

  // 设置客户端事件监听器
  useEffect(() => {
    const handleImageClick = (e: Event) => {
      const img = e.target as HTMLImageElement
      const screenshot = img.dataset.screenshot
      if (screenshot) {
        window.open(screenshot, '_blank', 'noopener,noreferrer')
      }
    }

    const handleImageError = (e: Event) => {
      const img = e.target as HTMLImageElement
      img.style.display = 'none'
    }

    // 延迟设置事件监听器，确保DOM已渲染
    const timer = setTimeout(() => {
      const screenshots = document.querySelectorAll('[data-screenshot]')
      const thumbnails = document.querySelectorAll('[data-thumbnail]')
      
      screenshots.forEach(img => {
        img.addEventListener('click', handleImageClick)
        img.addEventListener('error', handleImageError)
      })
      
      thumbnails.forEach(img => {
        img.addEventListener('error', handleImageError)
      })
    }, 100)

    // 清理函数
    return () => {
      clearTimeout(timer)
      const screenshots = document.querySelectorAll('[data-screenshot]')
      const thumbnails = document.querySelectorAll('[data-thumbnail]')
      
      screenshots.forEach(img => {
        img.removeEventListener('click', handleImageClick)
        img.removeEventListener('error', handleImageError)
      })
      
      thumbnails.forEach(img => {
        img.removeEventListener('error', handleImageError)
      })
    }
  }, [game.screenshots, game.thumbnail])

  // 页面效果跟踪
  useEffect(() => {
    // 记录页面访问 - 修复方法名
    GameAnalytics.viewGameDetail(game.id, game.title, game.category)
    
    // 设置性能监控
    PerformanceMonitor.startMeasure('game-detail-render')
    
    // 设置用户行为跟踪
    UserJourneyTracker.trackEvent('game_detail_view', { game_id: game.id })
    
    // 设置滚动跟踪
    setupScrollTracking(game.id)
    
    return () => {
      PerformanceMonitor.endMeasure('game-detail-render')
    }
  }, [game.id, game.title, game.category])

  // 页面停留时间追踪和分析设置
  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      setTimeOnPage(Date.now() - startTime)
    }, 1000)

    return () => {
      clearInterval(interval)
      // 页面离开追踪
      GameAnalytics.exitGameDetail(game.id, Date.now() - startTime)
    }
  }, [game.id])

  // 游戏启动处理
  const handlePlayGame = () => {
    setIsPlaying(true)
    // 修复方法名，使用clickPlayGame
    GameAnalytics.clickPlayGame(game.id, game.title, timeOnPage)
    UserJourneyTracker.trackEvent('game_start', { 
      game_id: game.id,
      source: 'game_detail_page'
    })
    
    // 模拟启动延迟
    setTimeout(() => {
      window.open(game.url, '_blank', 'noopener,noreferrer')
      setIsPlaying(false)
    }, 1000)
  }

  // 返回处理
  const handleBack = () => {
    UserJourneyTracker.trackEvent('navigation_back', { from: 'game_detail' })
    router.back()
  }

  // 相关游戏点击处理
  const handleRelatedGameClick = (targetGame: Game, position: number) => {
    GameAnalytics.clickRelatedGame(game.id, targetGame.id, position)
    router.push(`/game/${targetGame.id}`)
  }

  // 处理描述展开/收起
  const handleDescriptionToggle = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded)
    GameAnalytics.toggleDescription(game.id, !isDescriptionExpanded)
  }

  // 获取显示的描述文本
  const getDisplayDescription = () => {
    // 优先使用英文增强描述，如果没有则使用基础英文描述
    const description = getEnhancedGameDescriptionEn(game)
    const shouldTruncate = description.length > 400
    if (shouldTruncate && !isDescriptionExpanded) {
      return `${description.slice(0, 400)}...`
    }
    return description
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header 头部区域 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 返回按钮 */}
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 p-2 -ml-2 rounded-lg hover:bg-blue-50"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* 品牌标识 */}
            <div 
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
              onClick={() => router.push('/')}
            >
              GameHub
            </div>

            {/* 空白区域 - 移动端隐藏面包屑 */}
            <div className="w-8"></div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <Breadcrumb 
          items={[
            { name: 'Games', href: '/' },
            { name: category?.nameEn || category?.name || 'Game', href: `/?category=${game.category}` },
            { name: game.title, href: '', current: true }
          ]}
        />
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-12">
            
            {/* 游戏信息区域 */}
            <div className="space-y-6">
              
              {/* 标题和分类 */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {game.title}
                  </h1>
                  
                  <div className="flex items-center space-x-2">
                    {game.featured && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <Star size={14} className="mr-1" />
                        Featured
                      </span>
                    )}
                    
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryStyle(game.category)}`}>
                      <span className="mr-1">{category?.icon}</span>
                      {category?.nameEn || category?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* 游戏截图画廊 */}
              {game.screenshots && game.screenshots.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Game Screenshots</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {game.screenshots.map((screenshot, index) => (
                      <div key={index} className="relative group">
                        <InteractiveImage
                          src={screenshot}
                          alt={`${game.title} screenshot ${index + 1}`}
                          className="w-full aspect-[9/16] object-cover rounded-lg bg-gray-100 transition-transform duration-200 group-hover:scale-105 cursor-pointer shadow-sm hover:shadow-md"
                          onClick={() => window.open(screenshot, '_blank', 'noopener,noreferrer')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 主缩略图 (如果没有screenshots则显示) */}
              {(!game.screenshots || game.screenshots.length === 0) && game.thumbnail && (
                <div className="relative">
                  <InteractiveImage
                    src={game.thumbnail}
                    alt={game.title}
                    data-thumbnail="true"
                    className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg bg-gray-100"
                  />
                </div>
              )}

              {/* 游戏描述区域 */}
              <div className="space-y-4">
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                    {getDisplayDescription()}
                  </div>
                  
                  {getEnhancedGameDescriptionEn(game).length > 400 && (
                    <button
                      onClick={handleDescriptionToggle}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mt-4 inline-flex items-center space-x-1"
                    >
                      <span>{isDescriptionExpanded ? 'Show Less' : 'Show More'}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${isDescriptionExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* 立即游戏按钮 */}
              <div className="flex justify-center sm:justify-start">
                <button
                  onClick={handlePlayGame}
                  disabled={isPlaying}
                  className={`
                    inline-flex items-center justify-center space-x-3 px-8 py-4
                    bg-gradient-to-r from-blue-600 to-purple-600 text-white
                    font-semibold text-lg rounded-lg shadow-lg
                    transition-all duration-200 transform
                    ${isPlaying 
                      ? 'opacity-70 cursor-not-allowed scale-95' 
                      : 'hover:scale-105 hover:shadow-xl active:scale-95'
                    }
                    w-full sm:w-auto min-w-[200px]
                  `}
                >
                  {isPlaying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Gamepad2 size={24} />
                      <span>Play Now</span>
                    </>
                  )}
                </button>
              </div>

              {/* 游戏标签区域 */}
              {game.tags && game.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Game Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {visibleTags.map(tag => (
                      <span
                        key={tag}
                        className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors duration-200"
                      >
                        #{tag}
                      </span>
                    ))}
                    {extraTagsCount > 0 && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-sm font-medium rounded-md">
                        +{extraTagsCount} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 游戏信息 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      {category?.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium text-gray-900">{category?.nameEn || category?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Monitor size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Platform</p>
                      <p className="font-medium text-gray-900">Web Browser</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 相关游戏推荐区域 */}
        {relatedGames.length > 0 && (
          <div className="mt-12">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                  You Might Also Like
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedGames.map((relatedGame, index) => (
                    <div
                      key={relatedGame.id}
                      onClick={() => handleRelatedGameClick(relatedGame, index)}
                      className="cursor-pointer"
                    >
                      <GameCard 
                        game={relatedGame}
                        size="medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 