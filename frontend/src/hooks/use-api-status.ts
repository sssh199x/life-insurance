import { useState, useEffect, useCallback, useRef } from 'react'
import { ApiStatusService, type ApiStatus, type ApiStatusInfo } from '@/lib/services/api-status-service'

// Hook configuration options
interface UseApiStatusOptions {
  /**
   * Initial delay before first status check (prevents immediate error flash)
   * @default 500
   */
  initialDelay?: number
  
  /**
   * Whether to start monitoring automatically on mount
   * @default false
   */
  autoMonitor?: boolean
  
  /**
   * Interval for automatic monitoring in milliseconds
   * @default 60000 (1 minute)
   */
  monitoringInterval?: number
  
  /**
   * Whether to use cached results when available
   * @default true
   */
  useCache?: boolean
  
  /**
   * Whether to log status changes in development
   * @default true
   */
  enableLogging?: boolean
}

// Hook return type
interface UseApiStatusReturn {
  // Status state
  status: ApiStatus
  statusInfo: ApiStatusInfo | null
  
  // Computed state
  isOnline: boolean
  isOffline: boolean
  isChecking: boolean
  
  // Status information
  lastChecked: Date | null
  responseTime: number | null
  errorMessage: string | null
  
  // UI helpers
  statusMessage: string
  statusColor: string
  
  // Actions
  checkStatus: () => Promise<void>
  forceRefresh: () => Promise<void>
  startMonitoring: () => void
  stopMonitoring: () => void
  
  // State
  isMonitoring: boolean
}

/**
 * Custom hook for managing API status
 * Provides reactive API connectivity status with automatic monitoring
 */
export function useApiStatus(options: UseApiStatusOptions = {}): UseApiStatusReturn {
  const {
    initialDelay = 500,
    autoMonitor = false,
    monitoringInterval = 60000,
    useCache = true,
    enableLogging = true
  } = options

  // State
  const [status, setStatus] = useState<ApiStatus>('checking')
  const [statusInfo, setStatusInfo] = useState<ApiStatusInfo | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  // Refs
  const monitoringCleanupRef = useRef<(() => void) | null>(null)
  const initialCheckDoneRef = useRef(false)

  // Computed values
  const isOnline = status === 'online'
  const isOffline = status === 'offline'
  const isChecking = status === 'checking'
  
  const lastChecked = statusInfo?.lastChecked || null
  const responseTime = statusInfo?.responseTime || null
  const errorMessage = statusInfo?.errorMessage || null
  
  const statusMessage = ApiStatusService.getStatusMessage(status)
  const statusColor = ApiStatusService.getStatusColor(status)

  // Internal status update function
  const updateStatus = useCallback((newStatusInfo: ApiStatusInfo) => {
    setStatus(newStatusInfo.status)
    setStatusInfo(newStatusInfo)

    // Log status changes in development
    if (enableLogging && process.env.NODE_ENV === 'development') {
      console.log('🔌 API Status Update:', {
        status: newStatusInfo.status,
        responseTime: newStatusInfo.responseTime,
        error: newStatusInfo.errorMessage
      })
    }
  }, [enableLogging])

  // Check status function
  const checkStatus = useCallback(async () => {
    try {
      setStatus('checking')
      
      const statusInfo = useCache 
        ? await ApiStatusService.getCachedStatus()
        : await ApiStatusService.getStatusInfo()
      
      updateStatus(statusInfo)
    } catch (error) {
      // Fallback to offline status on error
      const fallbackStatus: ApiStatusInfo = {
        status: 'offline',
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
      updateStatus(fallbackStatus)
    }
  }, [useCache, updateStatus])

  // Force refresh (bypass cache)
  const forceRefresh = useCallback(async () => {
    try {
      setStatus('checking')
      const statusInfo = await ApiStatusService.forceRefresh()
      updateStatus(statusInfo)
    } catch (error) {
      const fallbackStatus: ApiStatusInfo = {
        status: 'offline',
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Force refresh failed'
      }
      updateStatus(fallbackStatus)
    }
  }, [updateStatus])

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return

    setIsMonitoring(true)
    
    const cleanup = ApiStatusService.startMonitoring(
      updateStatus,
      monitoringInterval
    )
    
    monitoringCleanupRef.current = cleanup

    if (enableLogging && process.env.NODE_ENV === 'development') {
      console.log('🔄 API Status monitoring started')
    }
  }, [isMonitoring, monitoringInterval, updateStatus, enableLogging])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return

    setIsMonitoring(false)
    
    if (monitoringCleanupRef.current) {
      monitoringCleanupRef.current()
      monitoringCleanupRef.current = null
    }

    if (enableLogging && process.env.NODE_ENV === 'development') {
      console.log('⏹️ API Status monitoring stopped')
    }
  }, [isMonitoring, enableLogging])

  // Initial status check with delay
  useEffect(() => {
    if (initialCheckDoneRef.current) return

    const performInitialCheck = async () => {
      // Add initial delay to prevent error flash
      await new Promise(resolve => setTimeout(resolve, initialDelay))
      await checkStatus()
      initialCheckDoneRef.current = true
    }

    performInitialCheck()
  }, [initialDelay, checkStatus])

  // Auto-start monitoring if enabled
  useEffect(() => {
    if (autoMonitor && initialCheckDoneRef.current && !isMonitoring) {
      startMonitoring()
    }
  }, [autoMonitor, startMonitoring, isMonitoring])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring()
    }
  }, [stopMonitoring])

  return {
    // Status state
    status,
    statusInfo,
    
    // Computed state
    isOnline,
    isOffline,
    isChecking,
    
    // Status information
    lastChecked,
    responseTime,
    errorMessage,
    
    // UI helpers
    statusMessage,
    statusColor,
    
    // Actions
    checkStatus,
    forceRefresh,
    startMonitoring,
    stopMonitoring,
    
    // State
    isMonitoring
  }
}

/**
 * Simplified hook for basic API status checking
 */
export function useSimpleApiStatus(initialDelay: number = 500) {
  const { status, isOnline, isOffline, isChecking, statusMessage, statusColor } = useApiStatus({
    initialDelay,
    useCache: true,
    enableLogging: false
  })

  return {
    status,
    isOnline,
    isOffline,
    isChecking,
    statusMessage,
    statusColor
  }
}

/**
 * Hook for API status with automatic monitoring
 */
export function useApiStatusMonitor(monitoringInterval: number = 60000) {
  return useApiStatus({
    autoMonitor: true,
    monitoringInterval,
    useCache: false, // Always get fresh data for monitoring
    enableLogging: true
  })
}

/**
 * Hook for one-time API status check
 */
export function useApiStatusOnce(initialDelay: number = 500) {
  const { status, isOnline, statusMessage, statusColor, checkStatus } = useApiStatus({
    initialDelay,
    useCache: true,
    enableLogging: false
  })

  // Only return essential data for one-time check
  return {
    status,
    isOnline,
    statusMessage,
    statusColor,
    refresh: checkStatus
  }
}