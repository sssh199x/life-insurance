import { useCallback, useRef, useEffect } from 'react'
import { NavigationService } from '@/lib/services/navigation-service'

// Hook configuration options
interface UseSmoothScrollOptions {
  /**
   * Default scroll behavior
   * @default 'smooth'
   */
  behavior?: ScrollBehavior
  
  /**
   * Default block alignment
   * @default 'start'
   */
  block?: ScrollLogicalPosition
  
  /**
   * Offset from top in pixels (useful for fixed headers)
   * @default 0
   */
  offset?: number
  
  /**
   * Whether to log scroll actions in development
   * @default false
   */
  enableLogging?: boolean
  
  /**
   * Callback fired when scroll is initiated
   */
  onScrollStart?: (targetId: string) => void
  
  /**
   * Callback fired when scroll is completed
   */
  onScrollEnd?: (targetId: string) => void
}

// Hook return type
interface UseSmoothScrollReturn {
  // Basic scroll functions
  scrollToElement: (id: string, options?: ScrollIntoViewOptions) => void
  scrollToSelector: (selector: string, options?: ScrollIntoViewOptions) => void
  scrollToTop: () => void
  scrollToPosition: (x: number, y: number) => void
  
  // App-specific scroll functions
  scrollToForm: () => void
  scrollToResults: () => void
  
  // Link handling
  handleLinkClick: (event: React.MouseEvent<HTMLAnchorElement>, href: string) => void
  
  // Utility functions
  isElementInViewport: (elementId: string) => boolean
  getScrollPosition: () => { x: number; y: number }
  getDistanceToElement: (elementId: string) => number
  
  // Advanced scroll functions
  scrollToElementWithCallback: (
    id: string, 
    callback: () => void, 
    options?: ScrollIntoViewOptions
  ) => void
  scrollToElementIfNotVisible: (id: string, options?: ScrollIntoViewOptions) => void
  
  // State
  isScrolling: boolean
}

/**
 * Custom hook for smooth scrolling functionality
 */
export function useSmoothScroll(options: UseSmoothScrollOptions = {}): UseSmoothScrollReturn {
  const {
    behavior = 'smooth',
    block = 'start',
    offset = 0,
    enableLogging = false,
    onScrollStart,
    onScrollEnd
  } = options

  // State tracking
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Default scroll options
  const defaultScrollOptions: ScrollIntoViewOptions = {
    behavior,
    block
  }

  // Apply offset if specified
  const applyOffset = useCallback((elementId: string) => {
    if (offset === 0) return

    const element = document.getElementById(elementId)
    if (!element) return

    const elementRect = element.getBoundingClientRect()
    const absoluteElementTop = elementRect.top + window.pageYOffset
    const targetY = absoluteElementTop - offset

    window.scrollTo({
      top: targetY,
      behavior
    })
  }, [offset, behavior])

  // Track scrolling state
  const setScrollingState = useCallback((scrolling: boolean, targetId?: string) => {
    isScrollingRef.current = scrolling

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    if (scrolling && targetId) {
      onScrollStart?.(targetId)
      
      if (enableLogging && process.env.NODE_ENV === 'development') {
        console.log(`📍 Scrolling to: ${targetId}`)
      }

      // Set timeout to detect scroll completion
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false
        onScrollEnd?.(targetId)
        
        if (enableLogging && process.env.NODE_ENV === 'development') {
          console.log(`✅ Scroll completed: ${targetId}`)
        }
      }, 1000) // Assume scroll completes within 1 second
    }
  }, [enableLogging, onScrollStart, onScrollEnd])

  // Basic scroll functions
  const scrollToElement = useCallback((id: string, options?: ScrollIntoViewOptions) => {
    setScrollingState(true, id)
    
    if (offset > 0) {
      applyOffset(id)
    } else {
      NavigationService.scrollToElement(id, { ...defaultScrollOptions, ...options })
    }
  }, [defaultScrollOptions, offset, applyOffset, setScrollingState])

  const scrollToSelector = useCallback((selector: string, options?: ScrollIntoViewOptions) => {
    setScrollingState(true, selector)
    NavigationService.scrollToSelector(selector, { ...defaultScrollOptions, ...options })
  }, [defaultScrollOptions, setScrollingState])

  const scrollToTop = useCallback(() => {
    setScrollingState(true, 'top')
    NavigationService.scrollToTop()
  }, [setScrollingState])

  const scrollToPosition = useCallback((x: number, y: number) => {
    setScrollingState(true, `position-${x}-${y}`)
    NavigationService.scrollToPosition(x, y)
  }, [setScrollingState])

  // App-specific scroll functions
  const scrollToForm = useCallback(() => {
    scrollToElement('insurance-form')
  }, [scrollToElement])

  const scrollToResults = useCallback(() => {
    scrollToElement('recommendation-results')
  }, [scrollToElement])

  // Link handling (for Header/Footer components)
  const handleLinkClick = useCallback((
    event: React.MouseEvent<HTMLAnchorElement>, 
    href: string
  ) => {
    if (href.startsWith('#')) {
      event.preventDefault()
      const targetId = href.substring(1) // Remove the '#'
      scrollToElement(targetId)
    }
  }, [scrollToElement])

  // Utility functions
  const isElementInViewport = useCallback((elementId: string): boolean => {
    const element = document.getElementById(elementId)
    if (!element) return false
    return NavigationService.isElementInViewport(element)
  }, [])

  const getScrollPosition = useCallback(() => {
    return NavigationService.getScrollPosition()
  }, [])

  const getDistanceToElement = useCallback((elementId: string): number => {
    return NavigationService.getDistanceToElement(elementId)
  }, [])

  // Advanced scroll functions
  const scrollToElementWithCallback = useCallback((
    id: string, 
    callback: () => void, 
    options?: ScrollIntoViewOptions
  ) => {
    setScrollingState(true, id)
    NavigationService.scrollToElementWithCallback(
      id, 
      () => {
        setScrollingState(false)
        callback()
      }, 
      { ...defaultScrollOptions, ...options }
    )
  }, [defaultScrollOptions, setScrollingState])

  const scrollToElementIfNotVisible = useCallback((
    id: string, 
    options?: ScrollIntoViewOptions
  ) => {
    if (!isElementInViewport(id)) {
      scrollToElement(id, options)
    }
  }, [scrollToElement, isElementInViewport])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Basic scroll functions
    scrollToElement,
    scrollToSelector,
    scrollToTop,
    scrollToPosition,
    
    // App-specific scroll functions
    scrollToForm,
    scrollToResults,
    
    // Link handling
    handleLinkClick,
    
    // Utility functions
    isElementInViewport,
    getScrollPosition,
    getDistanceToElement,
    
    // Advanced scroll functions
    scrollToElementWithCallback,
    scrollToElementIfNotVisible,
    
    // State
    isScrolling: isScrollingRef.current
  }
}

/**
 * Simplified hook for basic smooth scrolling
 */
export function useSimpleSmoothScroll() {
  const { scrollToElement, scrollToTop, handleLinkClick } = useSmoothScroll({
    enableLogging: false
  })

  return {
    scrollToElement,
    scrollToTop,
    handleLinkClick
  }
}

/**
 * Hook for navigation-specific scrolling
 */
export function useNavigationScroll() {
  const { 
    scrollToForm, 
    scrollToResults, 
    scrollToTop, 
    handleLinkClick,
    scrollToElement 
  } = useSmoothScroll({
    enableLogging: false,
    offset: 80 // Account for fixed header
  })

  return {
    scrollToForm,
    scrollToResults,
    scrollToTop,
    handleLinkClick,
    scrollToElement
  }
}

/**
 * Hook for main page scrolling with callbacks
 */
export function usePageScroll() {
  return useSmoothScroll({
    enableLogging: true,
    offset: 80,
    onScrollStart: (targetId) => {
      // Could trigger analytics events
      if (process.env.NODE_ENV === 'development') {
        console.log(`User navigating to: ${targetId}`)
      }
    },
    onScrollEnd: (targetId) => {
      // Could trigger completion analytics
      if (process.env.NODE_ENV === 'development') {
        console.log(`User reached: ${targetId}`)
      }
    }
  })
}

/**
 * Hook for form-related scrolling
 */
export function useFormScroll() {
  const { 
    scrollToResults, 
    scrollToForm, 
    scrollToElementWithCallback,
    isElementInViewport 
  } = useSmoothScroll({
    enableLogging: false,
    offset: 100 // Extra space for form visibility
  })

  // Scroll to results with delay (for form submission)
  const scrollToResultsDelayed = useCallback((delay: number = 100) => {
    setTimeout(() => scrollToResults(), delay)
  }, [scrollToResults])

  // Scroll to form with delay (for new recommendation)
  const scrollToFormDelayed = useCallback((delay: number = 100) => {
    setTimeout(() => scrollToForm(), delay)
  }, [scrollToForm])

  return {
    scrollToResults,
    scrollToForm,
    scrollToResultsDelayed,
    scrollToFormDelayed,
    scrollToElementWithCallback,
    isElementInViewport
  }
}