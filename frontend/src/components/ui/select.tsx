'use client'
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Select wrapper variants
const selectVariants = cva(
  "relative flex w-full",
  {
    variants: {
      size: {
        sm: "h-8",
        md: "h-10", 
        lg: "h-12",
      }
    },
    defaultVariants: {
      size: "md",
    },
  }
)

// Select field variants  
const selectFieldVariants = cva(
  "flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-muted-900 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: 
          "border-muted-300 focus-visible:border-primary-500 focus-visible:ring-primary-500",
        error: 
          "border-red-400 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500",
        success: 
          "border-secondary-400 bg-secondary-50 focus-visible:border-secondary-500 focus-visible:ring-secondary-500",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// Select dropdown variants
const dropdownVariants = cva(
  "absolute z-50 w-full rounded-lg border border-muted-200 bg-white shadow-medium overflow-hidden",
  {
    variants: {
      position: {
        top: "bottom-full mb-1",
        bottom: "top-full mt-1",
      }
    },
    defaultVariants: {
      position: "bottom",
    },
  }
)

// Option interface
export interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  icon?: React.ReactNode
}

// Select component props
export interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof selectFieldVariants> {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: string
  label?: string
  error?: string
  success?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  searchable?: boolean
  clearable?: boolean
  onChange?: (value: string) => void
  onSearchChange?: (search: string) => void
}

// Main Select component
const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ 
    className,
    variant,
    size,
    options,
    value,
    defaultValue,
    placeholder = "Select an option...",
    label,
    error,
    success,
    helperText,
    required,
    disabled,
    searchable = false,
    clearable = false,
    onChange,
    onSearchChange,
    id,
    ...props 
  }, ref) => {
    // State management
    const [isOpen, setIsOpen] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const [searchTerm, setSearchTerm] = React.useState("")
    const [dropdownPosition, setDropdownPosition] = React.useState<"top" | "bottom">("bottom")
    
    // Refs
    const selectRef = React.useRef<HTMLDivElement>(null)
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    const searchInputRef = React.useRef<HTMLInputElement>(null)
    
    // Use controlled or uncontrolled value
    const currentValue = value !== undefined ? value : internalValue
    
    // Find selected option
    const selectedOption = options.find(option => option.value === currentValue)
    
    // Filter options based on search
    const filteredOptions = React.useMemo(() => {
      if (!searchTerm) return options
      return options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }, [options, searchTerm])
    
    // Generate unique ID
    const selectId = id || `select-${React.useId()}`
    
    // Determine variant based on states
    const currentVariant = error ? "error" : success ? "success" : variant
    
    // Handle option selection
    const handleSelect = (optionValue: string) => {
      if (value === undefined) {
        setInternalValue(optionValue)
      }
      onChange?.(optionValue)
      setIsOpen(false)
      setSearchTerm("")
    }
    
    // Handle clear
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (value === undefined) {
        setInternalValue("")
      }
      onChange?.("")
      setSearchTerm("")
    }
    
    // Handle search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = e.target.value
      setSearchTerm(newSearchTerm)
      onSearchChange?.(newSearchTerm)
    }
    
    // Calculate dropdown position
    React.useEffect(() => {
      if (isOpen && selectRef.current) {
        const rect = selectRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        
        if (spaceBelow < 200 && spaceAbove > spaceBelow) {
          setDropdownPosition("top")
        } else {
          setDropdownPosition("bottom")
        }
      }
    }, [isOpen])
    
    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setSearchTerm("")
        }
      }
      
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])
    
    // Focus search input when dropdown opens
    React.useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, [isOpen, searchable])
    
    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label 
            htmlFor={selectId}
            className="text-sm font-medium text-muted-100 dark:text-muted-100"
            style={{ color: 'var(--foreground)' }}
          >
            {label}
            {required && (
              <span className="ml-1 text-red-400" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Select wrapper */}
        <div 
          ref={selectRef}
          className={cn(selectVariants({ size }), "relative")}
          {...props}
        >
          {/* Select trigger */}
          <div
            ref={ref}
            id={selectId}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            tabIndex={disabled ? -1 : 0}
            className={cn(
              selectFieldVariants({ variant: currentVariant, size }),
              disabled && "cursor-not-allowed",
              className
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={(e) => {
              if (disabled) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsOpen(!isOpen)
              }
              if (e.key === 'Escape') {
                setIsOpen(false)
              }
            }}
          >
            {/* Selected value or placeholder */}
            <span className={cn(
              "truncate",
              !selectedOption && "text-muted-400"
            )}>
              {selectedOption ? (
                <span className="flex items-center">
                  {selectedOption.icon && (
                    <span className="mr-2 flex-shrink-0">
                      {selectedOption.icon}
                    </span>
                  )}
                  {selectedOption.label}
                </span>
              ) : (
                placeholder
              )}
            </span>

            {/* Icons */}
            <div className="flex items-center space-x-1">
              {clearable && selectedOption && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-muted-400 hover:text-muted-600 p-0.5 rounded"
                  aria-label="Clear selection"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              
              <svg 
                className={cn(
                  "h-4 w-4 text-muted-400 transition-transform duration-200",
                  isOpen && "rotate-180"
                )} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div 
              ref={dropdownRef}
              className={cn(dropdownVariants({ position: dropdownPosition }))}
            >
              {/* Search input */}
              {searchable && (
                <div className="p-2 border-b border-muted-200">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search options..."
                    className="w-full px-2 py-1 text-sm border border-muted-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              )}

              {/* Options list */}
              <div className="max-h-60 overflow-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-500">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      role="option"
                      aria-selected={option.value === currentValue}
                      className={cn(
                        "px-3 py-2 cursor-pointer transition-colors duration-150",
                        option.disabled && "cursor-not-allowed opacity-50",
                        option.value === currentValue 
                          ? "bg-primary-100 text-primary-900" 
                          : "hover:bg-muted-50",
                        !option.disabled && "hover:bg-muted-100"
                      )}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                    >
                      <div className="flex items-center">
                        {option.icon && (
                          <span className="mr-2 flex-shrink-0">
                            {option.icon}
                          </span>
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-medium">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-muted-500">{option.description}</div>
                          )}
                        </div>
                        {option.value === currentValue && (
                          <svg className="h-4 w-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1">
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {/* Success message */}
        {success && (
          <p className="text-sm text-secondary-400 flex items-center gap-1">
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {success}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && !success && (
          <p className="text-sm text-muted-400 dark:text-muted-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select, selectVariants }