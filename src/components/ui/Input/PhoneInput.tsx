import React, { forwardRef, useState, ChangeEvent, KeyboardEvent } from 'react'
import Input from './Input'
import { cleanPhoneNumber, validatePhoneNumber } from '@/utils/validationSchemas'
import type { InputProps } from './Input'

export interface PhoneInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value?: string
  onChange?: (value: string) => void
  onValidationChange?: (isValid: boolean, error?: string) => void
  showValidation?: boolean
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, onValidationChange, showValidation = true, ...props }, ref) => {
    const [validationError, setValidationError] = useState<string>('')

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      // Clean the input value - remove all non-digit characters
      const cleanedValue = cleanPhoneNumber(inputValue)
      
      // Limit to 10 digits
      const limitedValue = cleanedValue.slice(0, 10)
      
      // Update the input value
      onChange?.(limitedValue)
      
      // Validate the phone number
      if (showValidation) {
        const validation = validatePhoneNumber(limitedValue)
        setValidationError(validation.error || '')
        onValidationChange?.(validation.isValid, validation.error)
      }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter, and navigation keys
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End'
      ]
      
      // Allow digits
      if (e.key >= '0' && e.key <= '9') {
        return
      }
      
      // Allow allowed keys
      if (allowedKeys.includes(e.key)) {
        return
      }
      
      // Prevent all other keys
      e.preventDefault()
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pastedText = e.clipboardData.getData('text/plain')
      const cleanedText = cleanPhoneNumber(pastedText)
      const limitedText = cleanedText.slice(0, 10)
      onChange?.(limitedText)
    }

    return (
      <Input
        ref={ref}
        type="tel"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="Enter 10 digit number"
        prefix="+91"
        maxLength={10}
        invalid={!!validationError}
        {...props}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

export default PhoneInput 