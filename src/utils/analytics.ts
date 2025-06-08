// 用户行为分析追踪工具

export interface AnalyticsEvent {
  eventName: string
  properties?: Record<string, any>
  timestamp?: number
}

export interface PagePerformanceMetrics {
  loadTime: number
  domContentLoaded: number
  firstContentfulPaint?: number | undefined
  largestContentfulPaint?: number | undefined
}

export interface UserJourneyStep {
  action: string
  timestamp: number
  element?: string
  position?: { x: number, y: number }
  metadata?: Record<string, any>
}

// 基础事件追踪
export function trackEvent(eventName: string, properties: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return
  
  const event: AnalyticsEvent = {
    eventName,
    properties,
    timestamp: Date.now()
  }
  
  // 在开发环境中打印到控制台
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', event)
  }
  
  // 这里可以集成真实的分析服务
  // 例如 Google Analytics, Mixpanel, Amplitude 等
  try {
    // 存储到本地存储用于调试
    const stored = localStorage.getItem('analytics_events')
    const events = stored ? JSON.parse(stored) : []
    events.push(event)
    
    // 只保留最近的100个事件
    if (events.length > 100) {
      events.splice(0, events.length - 100)
    }
    
    localStorage.setItem('analytics_events', JSON.stringify(events))
  } catch (error) {
    console.warn('Failed to store analytics event:', error)
  }
}

// 页面浏览追踪
export function trackPageView(pageName: string, additionalData: Record<string, any> = {}): void {
  trackEvent('page_view', {
    page_name: pageName,
    url: typeof window !== 'undefined' ? window.location.href : '',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    ...additionalData
  })
}

// 游戏相关事件追踪
export const GameAnalytics = {
  // 游戏详情页访问
  viewGameDetail(gameId: string, gameTitle: string, category: string): void {
    trackEvent('view_game_detail', {
      game_id: gameId,
      game_title: gameTitle,
      category
    })
  },

  // 游戏启动点击
  clickPlayGame(gameId: string, gameTitle: string, timeOnPage: number): void {
    trackEvent('click_play_game', {
      game_id: gameId,
      game_title: gameTitle,
      time_on_page: timeOnPage
    })
  },

  // 相关游戏点击
  clickRelatedGame(sourceGameId: string, targetGameId: string, position: number): void {
    trackEvent('click_related_game', {
      source_game_id: sourceGameId,
      target_game_id: targetGameId,
      position
    })
  },

  // 返回按钮点击
  clickBackButton(gameId: string, timeOnPage: number): void {
    trackEvent('click_back_button', {
      game_id: gameId,
      time_on_page: timeOnPage
    })
  },

  // 描述展开/收起
  toggleDescription(gameId: string, expanded: boolean): void {
    trackEvent('toggle_description', {
      game_id: gameId,
      expanded
    })
  },

  // 游戏详情页离开
  exitGameDetail(gameId: string, timeSpent: number): void {
    trackEvent('exit_game_detail', {
      game_id: gameId,
      time_spent: timeSpent
    })
  }
}

// 性能监控
export class PerformanceMonitor {
  private startTime: number = Date.now()
  private gameId: string | undefined

  constructor(gameId?: string) {
    this.gameId = gameId || undefined
    this.setupPerformanceTracking()
  }

  private setupPerformanceTracking(): void {
    if (typeof window === 'undefined') return

    // 页面加载完成后收集性能数据
    window.addEventListener('load', () => {
      this.collectPerformanceMetrics()
    })

    // 监听错误
    window.addEventListener('error', (error) => {
      this.trackError(error)
    })

    // 监听未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.trackPromiseRejection(event)
    })
  }

  private collectPerformanceMetrics(): void {
    if (!window.performance) return

    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (!perfData) return

    // 使用 fetchStart 而不是 navigationStart，因为 navigationStart 在新版本中可能不存在
    const startTime = perfData.fetchStart || perfData.startTime || 0
    
    const metrics: PagePerformanceMetrics = {
      loadTime: perfData.loadEventEnd - startTime,
      domContentLoaded: perfData.domContentLoadedEventEnd - startTime
    }

    // 获取 FCP 和 LCP
    this.collectPaintMetrics().then(paintMetrics => {
      const finalMetrics = { ...metrics, ...paintMetrics }
      
      trackEvent('page_performance', {
        game_id: this.gameId,
        ...finalMetrics
      })

      // 如果加载时间过长，发送警报
      if (finalMetrics.loadTime > 3000) {
        trackEvent('performance_warning', {
          game_id: this.gameId,
          load_time: finalMetrics.loadTime,
          severity: 'high'
        })
      }
    })
  }

  private async collectPaintMetrics(): Promise<Partial<PagePerformanceMetrics>> {
    return new Promise(resolve => {
      let fcp: number | undefined = undefined
      let lcp: number | undefined = undefined

      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length > 0) {
          fcp = entries[0].startTime
          fcpObserver.disconnect()
        }
      })
      fcpObserver.observe({ entryTypes: ['paint'] })

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length > 0) {
          lcp = entries[entries.length - 1].startTime
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // 超时处理
      setTimeout(() => {
        fcpObserver.disconnect()
        lcpObserver.disconnect()
        resolve({
          firstContentfulPaint: fcp,
          largestContentfulPaint: lcp
        })
      }, 10000) // 10秒超时
    })
  }

  private trackError(error: ErrorEvent): void {
    trackEvent('javascript_error', {
      game_id: this.gameId,
      error_message: error.message,
      error_source: error.filename,
      error_line: error.lineno,
      error_column: error.colno,
      user_agent: navigator.userAgent
    })
  }

  private trackPromiseRejection(event: PromiseRejectionEvent): void {
    trackEvent('promise_rejection', {
      game_id: this.gameId,
      reason: event.reason?.toString(),
      user_agent: navigator.userAgent
    })
  }
}

// 用户旅程追踪
export class UserJourneyTracker {
  private steps: UserJourneyStep[] = []
  private sessionId: string
  private gameId: string | undefined

  constructor(gameId?: string) {
    this.gameId = gameId || undefined
    this.sessionId = this.generateSessionId()
    this.setupEventListeners()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return

    // 点击事件
    document.addEventListener('click', (e) => {
      this.addStep('click', {
        element: this.getElementSelector(e.target as Element),
        position: { x: e.clientX, y: e.clientY }
      })
    })

    // 滚动事件（节流）
    let scrollTimer: NodeJS.Timeout
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        this.addStep('scroll', {
          scrollY: window.scrollY,
          scrollPercent: this.getScrollPercentage()
        })
      }, 100)
    })
  }

  addStep(action: string, metadata: Record<string, any> = {}): void {
    const step: UserJourneyStep = {
      action,
      timestamp: Date.now(),
      metadata
    }

    this.steps.push(step)

    // 分析用户行为模式
    this.analyzePattern()

    // 限制存储的步骤数量
    if (this.steps.length > 50) {
      this.steps.shift()
    }
  }

  private analyzePattern(): void {
    if (this.steps.length < 5) return

    const recentSteps = this.steps.slice(-5)
    
    // 检测跳出模式
    if (this.isBouncingPattern(recentSteps)) {
      trackEvent('user_bouncing_detected', {
        game_id: this.gameId,
        session_id: this.sessionId,
        action_sequence: recentSteps.map(s => s.action)
      })
    }

    // 检测参与模式
    if (this.isEngagedPattern(recentSteps)) {
      trackEvent('user_engaged_detected', {
        game_id: this.gameId,
        session_id: this.sessionId,
        engagement_score: this.calculateEngagementScore()
      })
    }
  }

  private isBouncingPattern(steps: UserJourneyStep[]): boolean {
    const scrollSteps = steps.filter(s => s.action === 'scroll')
    const clickSteps = steps.filter(s => s.action === 'click')
    
    return scrollSteps.length > 3 && clickSteps.length === 0
  }

  private isEngagedPattern(steps: UserJourneyStep[]): boolean {
    const uniqueActions = new Set(steps.map(s => s.action))
    return uniqueActions.size >= 3
  }

  private calculateEngagementScore(): number {
    const timeSpent = Date.now() - (this.steps[0]?.timestamp || Date.now())
    const actionCount = this.steps.length
    const uniqueActions = new Set(this.steps.map(s => s.action)).size

    return Math.min(100, (timeSpent / 1000) * 0.1 + actionCount * 2 + uniqueActions * 5)
  }

  private getElementSelector(element: Element): string {
    if (!element) return 'unknown'
    
    let selector = element.tagName.toLowerCase()
    if (element.id) selector += `#${element.id}`
    if (element.className) selector += `.${element.className.split(' ').join('.')}`
    
    return selector
  }

  private getScrollPercentage(): number {
    const scrollTop = window.scrollY
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    return Math.round((scrollTop / documentHeight) * 100)
  }

  getJourneyData() {
    return {
      sessionId: this.sessionId,
      gameId: this.gameId,
      steps: this.steps,
      totalSteps: this.steps.length,
      uniqueActions: new Set(this.steps.map(s => s.action)).size,
      engagementScore: this.calculateEngagementScore()
    }
  }
}

// 滚动深度追踪
export function setupScrollTracking(gameId?: string): () => void {
  if (typeof window === 'undefined') return () => {}
  
  let lastScrollPosition = 0
  let maxScrollReached = 0
  
  const handleScroll = () => {
    const currentScroll = window.scrollY
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = Math.round((currentScroll / documentHeight) * 100)
    
    // 更新最大滚动位置
    if (scrollPercent > maxScrollReached) {
      maxScrollReached = scrollPercent
      
      // 在特定滚动点发送事件
      if (scrollPercent === 25 || scrollPercent === 50 || scrollPercent === 75 || scrollPercent === 100) {
        trackEvent('scroll_milestone', {
          game_id: gameId,
          scroll_percent: scrollPercent,
          direction: currentScroll > lastScrollPosition ? 'down' : 'up'
        })
      }
    }
    
    lastScrollPosition = currentScroll
  }

  // 节流处理
  let ticking = false
  const throttledHandler = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll()
        ticking = false
      })
      ticking = true
    }
  }
  
  window.addEventListener('scroll', throttledHandler, { passive: true })
  
  // 返回清理函数
  return () => {
    window.removeEventListener('scroll', throttledHandler)
  }
}

// 导出调试工具
export class AnalyticsExporter {
  getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('analytics_events')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  clearStoredEvents(): void {
    localStorage.removeItem('analytics_events')
  }

  exportEvents(): string {
    const events = this.getStoredEvents()
    return JSON.stringify(events, null, 2)
  }
} 