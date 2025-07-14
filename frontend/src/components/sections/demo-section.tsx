'use client'

import React, { useState } from 'react'
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Heart,
  Star,
  DollarSign,
  Award,
  CheckCircle,
  AlertCircle,
  Download,
  Play,
  Pause,
  Code as CodeIcon
} from 'lucide-react'

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription,
  Button,
  Badge,
  ConfidenceBadge,
  StatusBadge,
  InsuranceTypeBadge,
  StatsCard,
  Input,
  Select,
  LoadingSpinner,
  LoadingDots,
  LoadingOverlay,
  LoadingSkeleton,
  LoadingProgress
} from '@/components/ui'

// Demo data for showcases
const DEMO_SELECT_OPTIONS = [
  { value: 'option1', label: 'Option 1', description: 'First option description' },
  { value: 'option2', label: 'Option 2', description: 'Second option description' },
  { value: 'option3', label: 'Option 3', description: 'Third option description', disabled: true },
]

// Component props
interface DemoSectionProps {
  /**
   * Whether to show the component demonstrations
   * @default true
   */
  showComponents?: boolean
  
  /**
   * Section title
   * @default "See Our Components in Action"
   */
  title?: string
  
  /**
   * Section description
   * @default Default description
   */
  description?: string
  
  /**
   * Badge text above the title
   * @default "Live Demo"
   */
  badgeText?: string
  
  /**
   * Background styling
   * @default "py-16 bg-muted-50 dark:bg-muted-950"
   */
  backgroundClassName?: string
  
  /**
   * Which demo categories to show
   */
  categories?: {
    badges?: boolean
    buttons?: boolean
    cards?: boolean
    forms?: boolean
    loading?: boolean
    shadows?: boolean
    animations?: boolean
  }
  
  /**
   * Custom class name for the section
   */
  className?: string
}

/**
 * Interactive showcase component for individual demos
 */
function InteractiveShowcase({ 
  title, 
  children, 
  description 
}: { 
  title: string
  children: React.ReactNode
  description?: string 
}) {
  return (
    <Card variant="elevated" className="h-full">
      <CardHeader>
        <CardTitle className="dark:text-muted-700 text-muted-900">{title}</CardTitle>
        {description && (
          <CardDescription className="dark:text-muted-700 text-muted-900">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

/**
 * Demo section component showcasing the complete design system
 */
export function DemoSection({
  showComponents = true,
  title = "See Our Components in Action",
  description = "Experience our complete design system with Tailwind v4, custom shadows, micro-animations, and comprehensive component library.",
  badgeText = "Live Demo",
  backgroundClassName = "py-16 bg-muted-50 dark:bg-muted-950",
  categories = {
    badges: true,
    buttons: true,
    cards: true,
    forms: true,
    loading: true,
    shadows: true,
    animations: true
  },
  className = ""
}: DemoSectionProps) {
  // Interactive state for demos
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedValue, setSelectedValue] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(65)
  const [showOverlay, setShowOverlay] = useState(false)

  if (!showComponents) return null

  return (
    <section className={`${backgroundClassName} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="border-secondary-200 text-secondary-700">
            {badgeText}
          </Badge>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            {title}
          </h2>
          <p 
            className="text-lg text-muted-500 max-w-3xl mx-auto" 
            style={{ color: 'var(--foreground)', opacity: 0.7 }}
          >
            {description}
          </p>
        </div>

        {/* Component Showcases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Smart Badges Showcase */}
          {categories.badges && (
            <InteractiveShowcase 
              title="Smart Badges" 
              description="Dynamic badges with context-aware styling"
            >
              <div className="space-y-4">
                {/* Confidence & Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <ConfidenceBadge score={0.92} />
                  <ConfidenceBadge score={0.75} />
                  <ConfidenceBadge score={0.58} />
                </div>
                
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="active" />
                  <StatusBadge status="pending" />
                  <StatusBadge status="approved" />
                  <StatusBadge status="rejected" />
                </div>
                
                {/* Insurance Type Badges */}
                <div className="flex flex-wrap gap-2">
                  <InsuranceTypeBadge type="term_life" />
                  <InsuranceTypeBadge type="whole_life" />
                  <InsuranceTypeBadge type="universal_life" />
                </div>
                
                {/* Standard Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">Approved</Badge>
                  <Badge variant="warning">Pending</Badge>
                  <Badge variant="destructive">Rejected</Badge>
                  <Badge variant="outline" className="border-primary-200 text-primary-700">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </div>
              </div>
            </InteractiveShowcase>
          )}

          {/* Button Variations Showcase */}
          {categories.buttons && (
            <InteractiveShowcase 
              title="Button Library" 
              description="Comprehensive button system with states"
            >
              <div className="space-y-4">
                {/* Button Variants */}
                <div className="space-y-2">
                  <Button size="sm" className="w-full">Primary Small</Button>
                  <Button variant="secondary" className="w-full">Secondary</Button>
                  <Button variant="outline" className="w-full">Outline</Button>
                  <Button variant="ghost" className="w-full">Ghost</Button>
                  <Button variant="destructive" size="sm" className="w-full">Destructive</Button>
                </div>
                
                {/* Interactive Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    leftIcon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Download
                  </Button>
                </div>
                
                {/* Loading Button */}
                <Button loading className="w-full">
                  Processing...
                </Button>
              </div>
            </InteractiveShowcase>
          )}

          {/* Card Variations Showcase */}
          {categories.cards && (
            <InteractiveShowcase 
              title="Card System" 
              description="Flexible card layouts and variants"
            >
              <div className="space-y-4">
                {/* Mini Cards */}
                <Card variant="interactive" className="p-3 cursor-pointer hover:scale-105 transition-transform">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium dark:text-muted-700 text-muted-900">Interactive Card</span>
                  </div>
                </Card>
                
                <Card variant="success" className="p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-secondary-600" />
                    <span className="text-sm font-medium dark:text-muted-700 text-muted-900">Success State</span>
                  </div>
                </Card>
                
                <Card variant="warning" className="p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium dark:text-muted-700 text-muted-900">Warning State</span>
                  </div>
                </Card>
                
                {/* Stats Card */}
                <StatsCard
                  title="Coverage Ratio"
                  value="12.5x"
                  description="Times annual income"
                  trend={{ value: 15, isPositive: true }}
                  icon={<TrendingUp className="w-4 h-4" />}
                />
              </div>
            </InteractiveShowcase>
          )}

          {/* Form Components Showcase */}
          {categories.forms && (
            <InteractiveShowcase 
              title="Form Components" 
              description="Complete form system with validation"
            >
              <div className="space-y-4">
                {/* Input Variations */}
                <Input
                  label="Text Input"
                  placeholder="Enter some text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  leftIcon={<DollarSign className="h-4 w-4" />}
                  helperText="This is a helper text"
                />
                
                <Input
                  label="Error State"
                  placeholder="This has an error"
                  error="This field is required"
                  leftIcon={<AlertCircle className="h-4 w-4" />}
                />
                
                <Input
                  label="Success State"
                  placeholder="This is valid"
                  success="Input is valid"
                  leftIcon={<CheckCircle className="h-4 w-4" />}
                />
                
                {/* Select Component */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-900 dark:text-muted-700">
                    Select Dropdown
                  </label>
                  <Select
                    options={DEMO_SELECT_OPTIONS}
                    value={selectedValue}
                    onChange={setSelectedValue}
                    placeholder="Choose an option"
                    searchable
                    clearable
                  />
                </div>
              </div>
            </InteractiveShowcase>
          )}

          {/* Loading States Showcase */}
          {categories.loading && (
            <InteractiveShowcase 
              title="Loading States" 
              description="Comprehensive loading indicators"
            >
              <div className="space-y-4">
                {/* Loading Spinners */}
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-muted-700 text-muted-900">Spinners:</span>
                  <div className="flex space-x-3">
                    <LoadingSpinner size="sm" variant="primary" />
                    <LoadingSpinner size="md" variant="secondary" />
                    <LoadingSpinner size="lg" variant="default" />
                  </div>
                </div>
                
                {/* Loading Dots */}
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-muted-700 text-muted-900">Dots:</span>
                  <LoadingDots size="md" variant="primary" />
                </div>
                
                {/* Loading Skeletons */}
                <div className="space-y-2">
                  <span className="text-sm dark:text-muted-700 text-muted-900">Skeletons:</span>
                  <LoadingSkeleton width="100%" height="1rem" />
                  <LoadingSkeleton width="75%" height="1rem" />
                  <LoadingSkeleton width="50%" height="1rem" />
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm dark:text-muted-700 text-muted-900">Progress:</span>
                    <span className="text-sm dark:text-muted-700 text-muted-900">{loadingProgress}%</span>
                  </div>
                  <LoadingProgress 
                    progress={loadingProgress} 
                    variant="primary" 
                    showPercentage={false}
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setLoadingProgress(Math.max(0, loadingProgress - 10))}
                    >
                      -10%
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setLoadingProgress(Math.min(100, loadingProgress + 10))}
                    >
                      +10%
                    </Button>
                  </div>
                </div>
                
                {/* Loading Overlay */}
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowOverlay(true)}
                    className="w-full"
                  >
                    Show Loading Overlay
                  </Button>
                  <LoadingOverlay 
                    isVisible={showOverlay}
                    text="Loading demo..."
                  />
                  {showOverlay && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowOverlay(false)}
                      className="w-full"
                    >
                      Hide Overlay
                    </Button>
                  )}
                </div>
              </div>
            </InteractiveShowcase>
          )}

          {/* Shadow System Showcase */}
          {categories.shadows && (
            <InteractiveShowcase 
              title="InsureWise Shadows" 
              description="Custom shadow system for depth"
            >
              <div className="space-y-4">
                <div className="bg-white dark:bg-muted-800 p-4 rounded-lg shadow-soft border transition-shadow hover:shadow-medium">
                  <div className="text-sm font-medium dark:text-muted-100 text-muted-900">shadow-soft</div>
                  <div className="text-xs text-muted-500">Subtle elevation • Hover to see medium</div>
                </div>
                
                <div className="bg-white dark:bg-muted-800 p-4 rounded-lg shadow-medium border transition-shadow hover:shadow-hard">
                  <div className="text-sm font-medium dark:text-muted-100 text-muted-900">shadow-medium</div>
                  <div className="text-xs text-muted-500">Standard depth • Hover to see hard</div>
                </div>
                
                <div className="bg-white dark:bg-muted-800 p-4 rounded-lg shadow-hard border">
                  <div className="text-sm font-medium dark:text-muted-100 text-muted-900">shadow-hard</div>
                  <div className="text-xs text-muted-500">Maximum impact • Perfect for modals</div>
                </div>
                
                {/* Animated Shadow Demo */}
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 rounded-lg shadow-medium text-white hover:shadow-hard transition-all duration-300 hover:scale-105">
                  <div className="text-sm font-medium">Interactive Shadow</div>
                  <div className="text-xs opacity-90">Hover me for animation</div>
                </div>
              </div>
            </InteractiveShowcase>
          )}

          {/* Micro-Animations Showcase */}
          {categories.animations && (
            <InteractiveShowcase 
              title="Micro-Animations" 
              description="Delightful interactions and transitions"
            >
              <div className="space-y-4">
                {/* Hover Animations */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-primary-100 p-3 rounded-lg text-center cursor-pointer transform hover:scale-110 transition-transform duration-200">
                    <Zap className="w-6 h-6 mx-auto text-primary-600 mb-1" />
                    <div className="text-xs font-medium dark:text-muted-700 text-muted-900">Scale</div>
                  </div>
                  
                  <div className="bg-secondary-100 p-3 rounded-lg text-center cursor-pointer hover:rotate-6 transition-transform duration-200">
                    <Heart className="w-6 h-6 mx-auto text-secondary-600 mb-1" />
                    <div className="text-xs font-medium dark:text-muted-700 text-muted-900">Rotate</div>
                  </div>
                </div>
                
                {/* Pulse Animation */}
                <div className="bg-green-100 p-3 rounded-lg text-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2 animate-pulse"></div>
                  <div className="text-xs font-medium dark:text-muted-700 text-muted-900">Pulse Animation</div>
                </div>
                
                {/* Slide Animation */}
                <div className="bg-blue-100 p-3 rounded-lg text-center cursor-pointer group">
                  <div className="flex items-center justify-center">
                    <span className="text-xs font-medium dark:text-muted-700 text-muted-900 mr-2">Slide Arrow</span>
                    <div className="transform group-hover:translate-x-2 transition-transform duration-200">
                      →
                    </div>
                  </div>
                </div>
                
                {/* Bounce Animation */}
                <div className="bg-purple-100 p-3 rounded-lg text-center cursor-pointer hover:animate-bounce">
                  <Award className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                  <div className="text-xs font-medium dark:text-muted-700 text-muted-900">Bounce on Hover</div>
                </div>
              </div>
            </InteractiveShowcase>
          )}

          {/* Theme & Responsiveness Showcase */}
          <InteractiveShowcase 
            title="Theme System" 
            description="Dark mode and responsive design"
          >
            <div className="space-y-4">
              {/* Theme Demo */}
              <div className="p-3 bg-white dark:bg-muted-900 border border-muted-200 dark:border-muted-700 rounded-lg">
                <div className="text-sm font-medium dark:text-muted-100 text-muted-900 mb-1">
                  Adaptive Theme
                </div>
                <div className="text-xs text-muted-500 dark:text-muted-400">
                  Changes with system theme
                </div>
              </div>
              
              {/* Responsive Demo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-primary-100 p-2 rounded text-center">
                  <div className="text-xs font-medium dark:text-muted-700 text-muted-900">Mobile</div>
                </div>
                <div className="bg-secondary-100 p-2 rounded text-center hidden sm:block">
                  <div className="text-xs font-medium dark:text-muted-700 text-muted-900">Desktop</div>
                </div>
              </div>
              
              {/* Color System */}
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 bg-primary-600 rounded flex items-center justify-center">
                  <span className="text-xs text-white font-medium">Primary</span>
                </div>
                <div className="h-8 bg-secondary-600 rounded flex items-center justify-center">
                  <span className="text-xs text-white font-medium">Secondary</span>
                </div>
                <div className="h-8 bg-accent-600 rounded flex items-center justify-center">
                  <span className="text-xs text-white font-medium">Accent</span>
                </div>
              </div>
            </div>
          </InteractiveShowcase>

          {/* Performance Showcase */}
          <InteractiveShowcase 
            title="Performance Features" 
            description="Optimized components and interactions"
          >
            <div className="space-y-4">
              {/* Performance Indicators */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm dark:text-muted-700 text-muted-900">Tree Shaking</span>
                  <Badge variant="success" className="text-xs">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm dark:text-muted-700 text-muted-900">Code Splitting</span>
                  <Badge variant="success" className="text-xs">Ready</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm dark:text-muted-700 text-muted-900">Lazy Loading</span>
                  <Badge variant="success" className="text-xs">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm dark:text-muted-700 text-muted-900">Memoization</span>
                  <Badge variant="success" className="text-xs">Optimized</Badge>
                </div>
              </div>
              
              {/* Bundle Size Info */}
              <div className="bg-muted-100 dark:bg-muted-800 p-3 rounded-lg">
                <div className="text-xs font-medium dark:text-muted-100 text-muted-900 mb-1">
                  Bundle Impact
                </div>
                <div className="text-xs text-muted-500 dark:text-muted-400">
                  Each component ~2-5KB gzipped
                </div>
              </div>
            </div>
          </InteractiveShowcase>
        </div>
        
        {/* Development Info */}
        <div className="mt-12 text-center">
          <Card variant="ghost" className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Badge variant="outline" className="border-accent-200 text-accent-700">
                  <CodeIcon className="w-3 h-3 mr-1" />
                  Development Ready
                </Badge>
                <p className="text-sm text-muted-600 dark:text-muted-400">
                  Built with Next.js 14, TypeScript, Tailwind CSS v4, and our custom design system. 
                  All components are production-ready with full accessibility support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

/**
 * Minimal demo section for quick component previews
 */
export function MiniDemoSection({ className = "" }: { className?: string }) {
  return (
    <DemoSection
      title="Component Preview"
      description="Quick look at our design system"
      backgroundClassName="py-8 bg-white dark:bg-black"
      categories={{
        badges: true,
        buttons: false,
        cards: false,
        forms: false,
        loading: false,
        shadows: true,
        animations: false
      }}
      className={className}
    />
  )
}

/**
 * Developer-focused demo section
 */
export function DeveloperDemoSection({ className = "" }: { className?: string }) {
  return (
    <DemoSection
      title="Developer Toolkit"
      description="Comprehensive component library for developers"
      badgeText="Dev Tools"
      categories={{
        badges: true,
        buttons: true,
        cards: true,
        forms: true,
        loading: true,
        shadows: false,
        animations: false
      }}
      className={className}
    />
  )
}

export default DemoSection