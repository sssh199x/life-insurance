import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import { getAppConfig, sleep } from './utils'
import type {
  RecommendationRequest,
  RecommendationResponse,
  InsuranceProduct,
  ApiError,
  AppConfig
} from './types'

// API Configuration
const config: AppConfig = getAppConfig()

// Track request timing without modifying Axios config
const requestTimings = new Map<string, number>()

/**
 * Create axios instance with default configuration
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.apiUrl,
    timeout: 10000, // 10 second timeout
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })

  // Request interceptor for logging and consistency
  client.interceptors.request.use(
    (config) => {
      // Log API calls in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
        })
      }
      
      // Track timing using a unique request ID
      const requestId = `${config.method}-${config.url}-${Date.now()}`
      requestTimings.set(requestId, Date.now())
      
      // Store request ID for later retrieval
      config.headers['X-Request-ID'] = requestId
      
      return config
    },
    (error) => {
      console.error('❌ API Request Error:', error)
      return Promise.reject(error)
    }
  )

  // Response interceptor for logging and error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response time in development
      if (process.env.NODE_ENV === 'development') {
        const requestId = response.config.headers['X-Request-ID'] as string
        const startTime = requestTimings.get(requestId) || Date.now()
        const duration = Date.now() - startTime
        requestTimings.delete(requestId) // Clean up
        
        console.log(`✅ API Response: ${response.status} in ${duration}ms`, {
          url: response.config.url,
          data: response.data,
        })
      }
      
      return response
    },
    (error: AxiosError) => {
      // Log errors in development
      if (process.env.NODE_ENV === 'development') {
        const requestId = error.config?.headers?.['X-Request-ID'] as string
        const startTime = requestTimings.get(requestId) || Date.now()
        const duration = Date.now() - startTime
        if (requestId) requestTimings.delete(requestId) // Clean up
        
        // Safely access error properties
        const status = error.response?.status || 'unknown'
        const errorMsg = error.message || 'unknown error'
        const url = error.config?.url || 'unknown url'
        
        console.error(`❌ API Error: ${status} in ${duration}ms`, {
          url,
          message: errorMsg,
          data: error.response?.data,
        })
      }
      
      return Promise.reject(error)
    }
  )

  return client
}

// Create singleton API client
const apiClient = createApiClient()

// Error Handling Utilities

/**
 * Extract error message from API response
 */
function extractErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const apiError = error.response.data as ApiError
    if (apiError.error?.message) {
      return apiError.error.message
    }
  }
  
  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
    return 'Unable to connect to the server. Please check your internet connection.'
  }
  
  // Timeout errors
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.'
  }
  
  // Fallback to generic message
  return error.message || 'An unexpected error occurred'
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: AxiosError): boolean {
  // Retry on network errors and 5xx server errors
  return (
    !error.response ||
    error.response.status >= 500 ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK'
  )
}

/**
 * Retry logic with exponential backoff
 */
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on last attempt or non-retryable errors
      if (attempt === maxRetries || (error instanceof AxiosError && !isRetryableError(error))) {
        throw error
      }
      
      // Wait before retrying with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt)
      await sleep(delay)
      
      console.log(`🔄 Retrying API request (attempt ${attempt + 2}/${maxRetries + 1})`)
    }
  }
  
  throw lastError!
}

// API Methods

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{
  status: string
  timestamp: string
  uptime: number
  environment: string
  version: string
}> {
  try {
    const response = await apiClient.get('/health')
    return response.data
  } catch (_) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Health check failed - backend may not be running')
    }
    throw new Error('Service unavailable')
  }
}

/**
 * Get insurance recommendation
 */
export async function getRecommendation(
  data: RecommendationRequest
): Promise<RecommendationResponse> {
  return retryRequest(async () => {
    try {
      const response = await apiClient.post<RecommendationResponse>('/api/recommendation', data)
      
      // Validate response structure
      if (!response.data.success || !response.data.data) {
        throw new Error('Invalid response format from server')
      }
      
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = extractErrorMessage(error)
        
        // Re-throw with user-friendly message
        const enhancedError = new Error(message)
        ;(enhancedError as any).originalError = error
        ;(enhancedError as any).status = error.response?.status
        ;(enhancedError as any).details = error.response?.data
        
        throw enhancedError
      }
      
      throw error
    }
  })
}

/**
 * Get user's recommendation history
 */
export async function getRecommendationHistory(userId: number): Promise<{
  user: any
  recommendations: any[]
}> {
  return retryRequest(async () => {
    try {
      const response = await apiClient.get(`/api/recommendations/${userId}`)
      return response.data.data
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = extractErrorMessage(error)
        throw new Error(message)
      }
      throw error
    }
  })
}

/**
 * Get available insurance products
 */
export async function getInsuranceProducts(): Promise<InsuranceProduct[]> {
  return retryRequest(async () => {
    try {
      const response = await apiClient.get<{ data: InsuranceProduct[] }>('/api/products')
      return response.data.data
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = extractErrorMessage(error)
        throw new Error(message)
      }
      throw error
    }
  })
}

// API State Management

/**
 * API call wrapper with loading state
 */
export class ApiCall<T> {
  private _isLoading = false
  private _error: string | null = null
  private _data: T | null = null
  private _lastRequestTime: Date | null = null

  get isLoading(): boolean {
    return this._isLoading
  }

  get error(): string | null {
    return this._error
  }

  get data(): T | null {
    return this._data
  }

  get lastRequestTime(): Date | null {
    return this._lastRequestTime
  }

  async execute(apiFunction: () => Promise<T>): Promise<T> {
    this._isLoading = true
    this._error = null
    this._lastRequestTime = new Date()

    try {
      const result = await apiFunction()
      this._data = result
      return result
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Unknown error occurred'
      throw error
    } finally {
      this._isLoading = false
    }
  }

  reset(): void {
    this._isLoading = false
    this._error = null
    this._data = null
    this._lastRequestTime = null
  }
}

// Utility Functions

/**
 * Validate API configuration
 */
export function validateApiConfig(): void {
  if (!config.apiUrl) {
    throw new Error('API URL is not configured. Please check your environment variables.')
  }
  
  try {
    new URL(config.apiUrl)
  } catch {
    throw new Error(`Invalid API URL: ${config.apiUrl}`)
  }
}

/**
 * Get API configuration info
 */
export function getApiInfo() {
  return {
    baseURL: config.apiUrl,
    environment: config.environment,
    version: config.version,
    timeout: 10000,
  }
}

/**
 * Test API connectivity
 */
export async function testApiConnection(): Promise<boolean> {
  try {
    await checkHealth()
    return true
  } catch {
    // Don't log this error - it's expected when backend is not running
    return false
  }
}

// Development Utilities

/**
 * Mock delay for testing loading states (development only)
 */
export async function mockDelay(ms: number = 1000): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    await sleep(ms)
  }
}

/**
 * Log API configuration (development only)
 */
export function logApiConfig(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 API Configuration:', getApiInfo())
  }
}

// Initialize validation on module load
try {
  validateApiConfig()
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('API configuration validation failed:', error)
  }
}