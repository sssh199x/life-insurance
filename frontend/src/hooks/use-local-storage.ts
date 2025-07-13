import { useState, useEffect, useCallback } from 'react'
import { generateSessionId } from '@/lib/utils'
import type { StoredData, FormData, ProcessedRecommendation } from '@/lib/types'

// Storage keys
const STORAGE_KEYS = {
  FORM_DATA: 'insurewise_form_data',
  RECOMMENDATION: 'insurewise_last_recommendation',
  SESSION_ID: 'insurewise_session_id',
  HISTORY: 'insurewise_recommendation_history',
} as const

// Storage version for migration compatibility
const STORAGE_VERSION = '1.0.0'

/**
 * Hook for managing form data persistence
 */
export function useFormStorage() {
  const [formData, setFormData] = useState<Partial<FormData> | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load form data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FORM_DATA)
      if (stored) {
        const parsed = JSON.parse(stored)
        setFormData(parsed)
      }
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save form data to localStorage
  const saveFormData = useCallback((data: Partial<FormData>) => {
    try {
      setFormData(data)
      localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error)
    }
  }, [])

  // Clear form data
  const clearFormData = useCallback(() => {
    try {
      setFormData(null)
      localStorage.removeItem(STORAGE_KEYS.FORM_DATA)
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error)
    }
  }, [])

  return {
    formData,
    saveFormData,
    clearFormData,
    isLoaded,
  }
}

/**
 * Hook for managing session ID
 */
export function useSessionId() {
  const [sessionId, setSessionId] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load or generate session ID on mount
  useEffect(() => {
    try {
      let stored = localStorage.getItem(STORAGE_KEYS.SESSION_ID)
      
      if (!stored) {
        stored = generateSessionId()
        localStorage.setItem(STORAGE_KEYS.SESSION_ID, stored)
      }
      
      setSessionId(stored)
    } catch (error) {
      console.warn('Failed to manage session ID:', error)
      // Fallback to memory-only session ID
      setSessionId(generateSessionId())
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Generate new session ID
  const regenerateSessionId = useCallback(() => {
    try {
      const newSessionId = generateSessionId()
      setSessionId(newSessionId)
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId)
      return newSessionId
    } catch (error) {
      console.warn('Failed to regenerate session ID:', error)
      const memorySessionId = generateSessionId()
      setSessionId(memorySessionId)
      return memorySessionId
    }
  }, [])

  return {
    sessionId,
    regenerateSessionId,
    isLoaded,
  }
}

/**
 * Hook for managing recommendation persistence
 */
export function useRecommendationStorage() {
  const [lastRecommendation, setLastRecommendation] = useState<ProcessedRecommendation | null>(null)
  const [recommendationHistory, setRecommendationHistory] = useState<ProcessedRecommendation[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load recommendation data on mount
  useEffect(() => {
    try {
      // Load last recommendation
      const storedRecommendation = localStorage.getItem(STORAGE_KEYS.RECOMMENDATION)
      if (storedRecommendation) {
        const parsed = JSON.parse(storedRecommendation)
        setLastRecommendation(parsed)
      }

      // Load recommendation history
      const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY)
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory)
        setRecommendationHistory(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.warn('Failed to load recommendation data from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save recommendation
  const saveRecommendation = useCallback((recommendation: ProcessedRecommendation) => {
    try {
      setLastRecommendation(recommendation)
      localStorage.setItem(STORAGE_KEYS.RECOMMENDATION, JSON.stringify(recommendation))

      // Add to history (limit to last 10 recommendations)
      setRecommendationHistory(prev => {
        const updated = [recommendation, ...prev.filter(r => r.recommendationId !== recommendation.recommendationId)]
        const limited = updated.slice(0, 10) // Keep only last 10
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limited))
        return limited
      })
    } catch (error) {
      console.warn('Failed to save recommendation to localStorage:', error)
    }
  }, [])

  // Clear recommendation data
  const clearRecommendationData = useCallback(() => {
    try {
      setLastRecommendation(null)
      setRecommendationHistory([])
      localStorage.removeItem(STORAGE_KEYS.RECOMMENDATION)
      localStorage.removeItem(STORAGE_KEYS.HISTORY)
    } catch (error) {
      console.warn('Failed to clear recommendation data from localStorage:', error)
    }
  }, [])

  return {
    lastRecommendation,
    recommendationHistory,
    saveRecommendation,
    clearRecommendationData,
    isLoaded,
  }
}

/**
 * Comprehensive localStorage hook combining all storage functionality
 */
export function useLocalStorage() {
  const formStorage = useFormStorage()
  const sessionStorage = useSessionId()
  const recommendationStorage = useRecommendationStorage()

  // Overall loading state
  const isLoaded = formStorage.isLoaded && sessionStorage.isLoaded && recommendationStorage.isLoaded

  // Get complete stored data
  const getStoredData = useCallback((): StoredData => {
    return {
      formData: formStorage.formData,
      lastRecommendation: recommendationStorage.lastRecommendation,
      sessionId: sessionStorage.sessionId,
      lastUpdated: new Date().toISOString(),
      version: STORAGE_VERSION,
    }
  }, [formStorage.formData, recommendationStorage.lastRecommendation, sessionStorage.sessionId])

  // Clear all stored data
  const clearAllData = useCallback(() => {
    formStorage.clearFormData()
    recommendationStorage.clearRecommendationData()
    sessionStorage.regenerateSessionId()
  }, [formStorage, recommendationStorage, sessionStorage])

  // Check if user has any stored data
  const hasStoredData = Boolean(
    formStorage.formData || 
    recommendationStorage.lastRecommendation || 
    recommendationStorage.recommendationHistory.length > 0
  )

  return {
    // Form data
    formData: formStorage.formData,
    saveFormData: formStorage.saveFormData,
    clearFormData: formStorage.clearFormData,
    
    // Session ID
    sessionId: sessionStorage.sessionId,
    regenerateSessionId: sessionStorage.regenerateSessionId,
    
    // Recommendations
    lastRecommendation: recommendationStorage.lastRecommendation,
    recommendationHistory: recommendationStorage.recommendationHistory,
    saveRecommendation: recommendationStorage.saveRecommendation,
    clearRecommendationData: recommendationStorage.clearRecommendationData,
    
    // Utilities
    getStoredData,
    clearAllData,
    hasStoredData,
    isLoaded,
  }
}

/**
 * Hook for debounced localStorage saves (performance optimization)
 */
export function useDebouncedStorage<T>(
  key: string,
  initialValue: T,
  delay: number = 1000
) {
  const [value, setValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load initial value from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        setValue(JSON.parse(stored))
      }
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error)
    } finally {
      setIsLoaded(true)
    }
  }, [key])

  // Debounced save to localStorage
  useEffect(() => {
    if (!isLoaded) return

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.warn(`Failed to save ${key} to localStorage:`, error)
      }
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [key, value, delay, isLoaded])

  return [value, setValue, isLoaded] as const
}

/**
 * Hook for localStorage with expiration
 */
export function useExpiringStorage<T>(
  key: string,
  initialValue: T,
  expirationHours: number = 24
) {
  const [value, setValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        const now = Date.now()
        
        // Check if data has expired
        if (parsed.expiration && now > parsed.expiration) {
          localStorage.removeItem(key)
          setValue(initialValue)
        } else {
          setValue(parsed.value)
        }
      }
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error)
    } finally {
      setIsLoaded(true)
    }
  }, [key, initialValue])

  const setValueWithExpiration = useCallback((newValue: T) => {
    try {
      const expiration = Date.now() + (expirationHours * 60 * 60 * 1000)
      const dataToStore = {
        value: newValue,
        expiration,
      }
      
      setValue(newValue)
      localStorage.setItem(key, JSON.stringify(dataToStore))
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error)
    }
  }, [key, expirationHours])

  return [value, setValueWithExpiration, isLoaded] as const
}