'use client'

import React from 'react'
import { STATS_DATA, type StatData } from '@/lib/constants/app-data'

// Basic stats section props
interface StatsSectionProps {
  stats?: StatData[]
  className?: string
}

/**
 * Stats section component showing key metrics
 */
export function StatsSection({
  stats = STATS_DATA,
  className = ""
}: StatsSectionProps) {
  
  return (
    <section className={`py-16 bg-primary-600 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <div className="flex justify-center mb-2">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-primary-100 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Export variants for different use cases
export function LightStatsSection({
  stats = STATS_DATA,
  className = ""
}: Pick<StatsSectionProps, 'stats' | 'className'>) {
  return (
    <StatsSection
      stats={stats}
      className={`py-16 bg-white dark:bg-muted-950 text-muted-900 dark:text-white ${className}`}
    />
  )
}

export function CompactStatsSection({
  stats = STATS_DATA,
  className = ""
}: Pick<StatsSectionProps, 'stats' | 'className'>) {
  return (
    <StatsSection
      stats={stats}
      className={`py-8 bg-muted-100 dark:bg-muted-900 ${className}`}
    />
  )
}

// Default export
export default StatsSection