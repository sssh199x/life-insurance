

import React from 'react'
import { Shield, DollarSign, Clock, Star, Users, TrendingUp, Award } from 'lucide-react'

// Type definitions for data structures
export interface StatData {
  label: string
  value: string
  icon: React.ReactNode
}

export interface StepData {
  number: string
  title: string
  description: string
  icon: React.ReactNode
  color: "primary" | "secondary" | "accent"
}

export interface NavigationLink {
  href: string
  label: string
}

export interface SocialLink {
  name: string
  href: string
  icon: React.ReactNode
}

export interface FooterSection {
  title: string
  links: NavigationLink[]
}

// Stats data for StatsSection component
export const STATS_DATA: StatData[] = [
  { 
    label: "Customers Protected", 
    value: "10,000+", 
    icon: <Shield className="w-5 h-5" /> 
  },
  { 
    label: "Average Savings", 
    value: "40%", 
    icon: <DollarSign className="w-5 h-5" /> 
  },
  { 
    label: "Application Time", 
    value: "3 min", 
    icon: <Clock className="w-5 h-5" /> 
  },
  { 
    label: "Satisfaction Rate", 
    value: "98%", 
    icon: <Star className="w-5 h-5" /> 
  }
]

// Steps data for HowItWorksSection component
export const STEPS_DATA: StepData[] = [
  {
    number: "01",
    title: "Tell Us About You",
    description: "Answer a few quick questions about your age, income, and family situation.",
    icon: <Users className="w-6 h-6" />,
    color: "primary"
  },
  {
    number: "02", 
    title: "AI Analyzes Your Needs",
    description: "Our smart algorithm calculates the perfect coverage amount and type for your unique situation.",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "secondary"
  },
  {
    number: "03",
    title: "Get Instant Recommendation",
    description: "Receive a personalized recommendation with clear explanations and confidence scoring.",
    icon: <Award className="w-6 h-6" />,
    color: "accent"
  }
]

// Navigation links for Header component
export const NAVIGATION_LINKS: NavigationLink[] = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

// Social media links for Footer component
export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Twitter',
    href: '#twitter',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    )
  },
  {
    name: 'LinkedIn',
    href: '#linkedin',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    name: 'GitHub',
    href: '#github',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    )
  }
]

// Footer sections for Footer component
export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { href: '#how-it-works', label: 'How It Works' },
      { href: '#features', label: 'Features' },
      { href: '#pricing', label: 'Pricing' },
      { href: '#security', label: 'Security' },
    ]
  },
  {
    title: 'Company',
    links: [
      { href: '#about', label: 'About Us' },
      { href: '#careers', label: 'Careers' },
      { href: '#blog', label: 'Blog' },
      { href: '#press', label: 'Press' },
    ]
  },
  {
    title: 'Support',
    links: [
      { href: '#help', label: 'Help Center' },
      { href: '#contact', label: 'Contact Us' },
      { href: '#faq', label: 'FAQ' },
      { href: '#status', label: 'Status' },
    ]
  },
  {
    title: 'Legal',
    links: [
      { href: '#privacy', label: 'Privacy Policy' },
      { href: '#terms', label: 'Terms of Service' },
      { href: '#cookies', label: 'Cookie Policy' },
      { href: '#compliance', label: 'Compliance' },
    ]
  }
]