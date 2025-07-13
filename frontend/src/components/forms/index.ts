// Clean exports for all form components

// Form field components
export {
  AgeField,
  IncomeField,
  DependentsField,
  RiskToleranceField,
  FormFields,
  BasicFormFields,
  ComprehensiveFormFields
} from './form-fields'

// Form validation components
export {
  FormErrorDisplay,
  FormStatus,
  FormFooter,
  ValidationSummary,
  SuccessMessage,
  FormValidationDisplay
} from './form-validation'

// Form auto-save components and hooks
export {
  useFormAutoSave,
  FormStateManager,
  AutoSaveIndicator,
  FormProgress,
  FormSessionManager,
  useFormRecovery
} from './form-auto-save'

// Re-export types for convenience
export type { FormData } from '@/lib/types'