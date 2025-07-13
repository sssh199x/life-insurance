import { testApiConnection, checkHealth } from '@/lib/api'

export type ApiStatus = 'checking' | 'online' | 'offline'

export interface ApiStatusInfo {
  status: ApiStatus
  lastChecked: Date
  responseTime?: number
  errorMessage?: string
}

export interface HealthCheckResult {
  isHealthy: boolean
  status: string
  uptime?: number
  environment?: string
  version?: string
  timestamp?: string
}

/**
 * Service for managing API connectivity and health status
 */
export class ApiStatusService {
  private static lastStatusCheck: ApiStatusInfo | null = null
  private static readonly CACHE_DURATION = 30000 // 30 seconds

  /**
   * Test basic API connectivity
   */
  static async checkConnection(): Promise<boolean> {
    try {
      const startTime = Date.now()
      const isConnected = await testApiConnection()
      const responseTime = Date.now() - startTime

      // Cache the result
      this.lastStatusCheck = {
        status: isConnected ? 'online' : 'offline',
        lastChecked: new Date(),
        responseTime: isConnected ? responseTime : undefined,
        errorMessage: isConnected ? undefined : 'Connection failed'
      }

      return isConnected
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Cache the error result
      this.lastStatusCheck = {
        status: 'offline',
        lastChecked: new Date(),
        errorMessage
      }

      // Only log in development to avoid console spam in production
      if (process.env.NODE_ENV === 'development') {
        console.log('API connectivity check failed:', error)
      }
      
      return false
    }
  }

  /**
   * Get current API status
   */
  static async getStatus(): Promise<ApiStatus> {
    const isOnline = await this.checkConnection()
    return isOnline ? 'online' : 'offline'
  }

  /**
   * Get detailed API status information
   */
  static async getStatusInfo(): Promise<ApiStatusInfo> {
    await this.checkConnection()
    return this.lastStatusCheck || {
      status: 'offline',
      lastChecked: new Date(),
      errorMessage: 'No status check performed'
    }
  }

  /**
   * Check API status with delay to prevent immediate error flash
   * Used in components to provide better UX
   */
  static async checkWithDelay(delayMs: number = 500): Promise<ApiStatus> {
    // Add delay to prevent immediate error flash on page load
    const [status] = await Promise.all([
      this.getStatus(),
      new Promise(resolve => setTimeout(resolve, delayMs))
    ])
    return status
  }

  /**
   * Get cached status if recent, otherwise perform new check
   */
  static async getCachedStatus(): Promise<ApiStatusInfo> {
    // Return cached result if it's recent
    if (this.lastStatusCheck && this.isRecentCheck(this.lastStatusCheck.lastChecked)) {
      return this.lastStatusCheck
    }

    // Perform new check
    return await this.getStatusInfo()
  }

  /**
   * Perform comprehensive health check
   */
  static async performHealthCheck(): Promise<HealthCheckResult> {
    try {
      const startTime = Date.now()
      const healthData = await checkHealth()
      const responseTime = Date.now() - startTime

      return {
        isHealthy: true,
        status: healthData.status || 'healthy',
        uptime: healthData.uptime,
        environment: healthData.environment,
        version: healthData.version,
        timestamp: healthData.timestamp
      }
    } catch (error) {
      return {
        isHealthy: false,
        status: 'unhealthy'
      }
    }
  }

  /**
   * Monitor API status with periodic checks
   */
  static startMonitoring(
    callback: (status: ApiStatusInfo) => void,
    intervalMs: number = 60000 // Check every minute
  ): () => void {
    const checkStatus = async () => {
      const statusInfo = await this.getStatusInfo()
      callback(statusInfo)
    }

    // Initial check
    checkStatus()

    // Set up periodic checks
    const intervalId = setInterval(checkStatus, intervalMs)

    // Return cleanup function
    return () => clearInterval(intervalId)
  }

  /**
   * Get user-friendly status message
   */
  static getStatusMessage(status: ApiStatus): string {
    switch (status) {
      case 'checking':
        return 'Connecting to AI engine...'
      case 'online':
        return 'AI recommendation engine online'
      case 'offline':
        return 'Demo mode - Limited functionality'
      default:
        return 'Status unknown'
    }
  }

  /**
   * Get status indicator color class
   */
  static getStatusColor(status: ApiStatus): string {
    switch (status) {
      case 'online':
        return 'bg-green-400'
      case 'offline':
        return 'bg-orange-400'
      case 'checking':
      default:
        return 'bg-yellow-400'
    }
  }

  /**
   * Check if the last status check is recent enough to use cache
   */
  private static isRecentCheck(lastChecked: Date): boolean {
    const now = Date.now()
    const checkTime = lastChecked.getTime()
    return (now - checkTime) < this.CACHE_DURATION
  }

  /**
   * Force refresh of API status (bypass cache)
   */
  static async forceRefresh(): Promise<ApiStatusInfo> {
    this.lastStatusCheck = null
    return await this.getStatusInfo()
  }

  /**
   * Check if API supports specific features
   */
  static async checkFeatureAvailability(feature: 'recommendations' | 'history' | 'products'): Promise<boolean> {
    try {
      const isOnline = await this.checkConnection()
      if (!isOnline) return false

      // You can extend this to check specific endpoints
      switch (feature) {
        case 'recommendations':
          // Could test POST /api/recommendation endpoint
          return true
        case 'history':
          // Could test GET /api/recommendations/:userId endpoint
          return true
        case 'products':
          // Could test GET /api/products endpoint
          return true
        default:
          return false
      }
    } catch {
      return false
    }
  }

  /**
   * Get network quality indicator based on response time
   */
  static getNetworkQuality(responseTime?: number): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' {
    if (!responseTime) return 'unknown'

    if (responseTime < 200) return 'excellent'
    if (responseTime < 500) return 'good'
    if (responseTime < 1000) return 'fair'
    return 'poor'
  }

  /**
   * Reset all cached data
   */
  static reset(): void {
    this.lastStatusCheck = null
  }

  /**
   * Get debug information for troubleshooting
   */
  static getDebugInfo(): object {
    return {
      lastStatusCheck: this.lastStatusCheck,
      cacheDuration: this.CACHE_DURATION,
      currentTime: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }
  }
}