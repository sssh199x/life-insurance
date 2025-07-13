export interface ScrollOptions {
  behavior?: ScrollBehavior
  block?: ScrollLogicalPosition
  inline?: ScrollLogicalPosition
}

/**
 * Navigation service for handling smooth scrolling and navigation
 */
export class NavigationService {
  /**
   * Default scroll options for smooth scrolling
   */
  private static readonly DEFAULT_SCROLL_OPTIONS: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: 'start'
  }

  /**
   * Scroll to element by ID
   */
  static scrollToElement(id: string, options?: ScrollIntoViewOptions): void {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ 
        ...this.DEFAULT_SCROLL_OPTIONS,
        ...options 
      })
    } else if (process.env.NODE_ENV === 'development') {
      console.warn(`NavigationService: Element with ID "${id}" not found`)
    }
  }

  /**
   * Scroll to element by CSS selector
   */
  static scrollToSelector(selector: string, options?: ScrollIntoViewOptions): void {
    const element = document.querySelector(selector)
    if (element) {
      element.scrollIntoView({ 
        ...this.DEFAULT_SCROLL_OPTIONS,
        ...options 
      })
    } else if (process.env.NODE_ENV === 'development') {
      console.warn(`NavigationService: Element with selector "${selector}" not found`)
    }
  }

  /**
   * Scroll to top of page
   */
  static scrollToTop(): void {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    })
  }

  /**
   * Handle hash-based navigation (for anchor links)
   * Used in Header and Footer components
   */
  static handleSmoothScroll(href: string): void {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView(this.DEFAULT_SCROLL_OPTIONS)
      }
    }
  }

  /**
   * Handle link click with smooth scrolling
   * Prevents default behavior for hash links and applies smooth scroll
   */
  static handleLinkClick(
    event: React.MouseEvent<HTMLAnchorElement>, 
    href: string
  ): void {
    if (href.startsWith('#')) {
      event.preventDefault()
      this.handleSmoothScroll(href)
    }
  }

  /**
   * Scroll to the insurance form section
   * Used throughout the app for "Get Started" buttons
   */
  static scrollToForm(): void {
    this.scrollToElement('insurance-form')
  }

  /**
   * Scroll to the recommendation results section
   * Used when displaying new recommendations
   */
  static scrollToResults(): void {
    this.scrollToElement('recommendation-results')
  }

  /**
   * Check if element exists before scrolling
   */
  static elementExists(id: string): boolean {
    return Boolean(document.getElementById(id))
  }

  /**
   * Get current scroll position
   */
  static getScrollPosition(): { x: number; y: number } {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop
    }
  }

  /**
   * Scroll to position with smooth animation
   */
  static scrollToPosition(x: number, y: number): void {
    window.scrollTo({
      left: x,
      top: y,
      behavior: 'smooth'
    })
  }

  /**
   * Check if element is in viewport
   */
  static isElementInViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  /**
   * Scroll element into view only if it's not already visible
   */
  static scrollToElementIfNotVisible(id: string, options?: ScrollIntoViewOptions): void {
    const element = document.getElementById(id)
    if (element && !this.isElementInViewport(element)) {
      element.scrollIntoView({ 
        ...this.DEFAULT_SCROLL_OPTIONS,
        ...options 
      })
    }
  }

  /**
   * Get distance to element from current scroll position
   */
  static getDistanceToElement(id: string): number {
    const element = document.getElementById(id)
    if (!element) return 0

    const elementRect = element.getBoundingClientRect()
    const currentScrollY = window.pageYOffset
    const elementTop = elementRect.top + currentScrollY

    return Math.abs(elementTop - currentScrollY)
  }

  /**
   * Smooth scroll with callback when completed
   */
  static scrollToElementWithCallback(
    id: string, 
    callback: () => void, 
    options?: ScrollIntoViewOptions
  ): void {
    const element = document.getElementById(id)
    if (!element) {
      callback()
      return
    }

    // Calculate approximate scroll duration based on distance
    const distance = this.getDistanceToElement(id)
    const duration = Math.min(Math.max(distance / 3, 300), 1000) // 300ms to 1000ms

    element.scrollIntoView({ 
      ...this.DEFAULT_SCROLL_OPTIONS,
      ...options 
    })

    // Execute callback after scroll animation
    setTimeout(callback, duration)
  }
}