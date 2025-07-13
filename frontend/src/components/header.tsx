'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Shield } from 'lucide-react'

import { Button } from '@/components/ui'

// Navigation links
const navigationLinks = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

// Header component
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Close mobile menu when link is clicked
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Smooth scroll to section
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
      closeMobileMenu()
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-muted-200 dark:bg-muted-900/95 dark:border-muted-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            onClick={(e) => handleLinkClick(e, '#top')}
          >
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span 
              className="text-xl font-bold text-muted-100"
              style={{ color: 'var(--foreground)' }}
            >
              InsureWise
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-400 hover:text-muted-100 transition-colors duration-200 font-medium"
                style={{ 
                  color: 'var(--foreground)', 
                  opacity: 0.8,
                  '--hover-color': 'var(--foreground)'
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.8'
                }}
                onClick={(e) => handleLinkClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex">
            <Button
              size="sm"
              onClick={() => {
                const formElement = document.getElementById('insurance-form')
                if (formElement) {
                  formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-muted-400 hover:text-muted-100 transition-colors rounded-md"
            style={{ 
              color: 'var(--foreground)', 
              opacity: 0.8
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.8'
            }}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-muted-200 dark:bg-muted-900 dark:border-muted-700">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-base font-medium text-muted-400 hover:text-muted-100 hover:bg-muted-50 dark:hover:bg-muted-800 rounded-md transition-colors duration-200"
                  style={{ 
                    color: 'var(--foreground)', 
                    opacity: 0.8
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.8'
                  }}
                  onClick={(e) => handleLinkClick(e, link.href)}
                >
                  {link.label}
                </a>
              ))}
              
              {/* Mobile CTA Button */}
              <div className="px-3 pt-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    const formElement = document.getElementById('insurance-form')
                    if (formElement) {
                      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                    closeMobileMenu()
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}