import { z } from 'zod'

// Common validation patterns
const phoneRegex = /^(\+91)?[6-9]\d{9}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// Common validation messages
export const ValidationMessages = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid 10-digit phone number',
  weakPassword: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  passwordMismatch: 'Passwords do not match',
  invalidDate: 'Please enter a valid date',
  futureDateNotAllowed: 'Future dates are not allowed',
  minimumAge: 'Age must be at least 18 years',
  maximumAge: 'Age cannot exceed 120 years',
  invalidUrl: 'Please enter a valid URL',
  invalidNumber: 'Please enter a valid number',
  minimumLength: (min: number) => `Must be at least ${min} characters`,
  maximumLength: (max: number) => `Must not exceed ${max} characters`,
  minimumValue: (min: number) => `Value must be at least ${min}`,
  maximumValue: (max: number) => `Value must not exceed ${max}`,
}

// Helper functions
const calculateAge = (birthDate: Date): number => {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// Base field validations
export const BaseValidations = {
  email: z.string()
    .min(1, ValidationMessages.required)
    .regex(emailRegex, ValidationMessages.invalidEmail),
  
  phone: z.string()
    .min(1, ValidationMessages.required)
    .regex(phoneRegex, ValidationMessages.invalidPhone),
  
  password: z.string()
    .min(1, ValidationMessages.required)
    .regex(passwordRegex, ValidationMessages.weakPassword),
  
  name: z.string()
    .min(1, ValidationMessages.required)
    .min(2, ValidationMessages.minimumLength(2))
    .max(50, ValidationMessages.maximumLength(50))
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters, spaces, periods, apostrophes, and hyphens'),
  
  dateOfBirth: z.string()
    .min(1, ValidationMessages.required)
    .refine((date) => {
      const birthDate = new Date(date)
      return !isNaN(birthDate.getTime())
    }, ValidationMessages.invalidDate)
    .refine((date) => {
      const birthDate = new Date(date)
      return birthDate <= new Date()
    }, ValidationMessages.futureDateNotAllowed)
    .refine((date) => {
      const birthDate = new Date(date)
      const age = calculateAge(birthDate)
      return age >= 18
    }, ValidationMessages.minimumAge)
    .refine((date) => {
      const birthDate = new Date(date)
      const age = calculateAge(birthDate)
      return age <= 120
    }, ValidationMessages.maximumAge),
  
  gender: z.enum(['Male', 'Female', 'Other'], {
    required_error: ValidationMessages.required,
  }),
  
  consultationId: z.string()
    .min(1, ValidationMessages.required)
    .min(3, ValidationMessages.minimumLength(3)),
  
  medicineId: z.string()
    .min(1, ValidationMessages.required),
  
  dosage: z.string()
    .min(1, ValidationMessages.required)
    .max(100, ValidationMessages.maximumLength(100)),
  
  frequency: z.string()
    .min(1, ValidationMessages.required)
    .max(100, ValidationMessages.maximumLength(100)),
  
  duration: z.string()
    .min(1, ValidationMessages.required)
    .max(100, ValidationMessages.maximumLength(100)),
}

// Auth schemas
export const SignInSchema = z.object({
  phone: BaseValidations.phone,
})

export const OtpSchema = z.object({
  otp: z.string()
    .min(1, ValidationMessages.required)
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
})

export const SignUpSchema = z.object({
  userName: BaseValidations.name,
  email: BaseValidations.email,
  password: BaseValidations.password,
  confirmPassword: z.string().min(1, ValidationMessages.required),
}).refine((data) => data.password === data.confirmPassword, {
  message: ValidationMessages.passwordMismatch,
  path: ['confirmPassword'],
})

export const ForgotPasswordSchema = z.object({
  email: BaseValidations.email,
})

export const ResetPasswordSchema = z.object({
  password: BaseValidations.password,
  confirmPassword: z.string().min(1, ValidationMessages.required),
}).refine((data) => data.password === data.confirmPassword, {
  message: ValidationMessages.passwordMismatch,
  path: ['confirmPassword'],
})

// Doctor schemas
export const DoctorPersonalDetailsSchema = z.object({
  fullName: BaseValidations.name,
  email: BaseValidations.email.optional().or(z.literal('')),
  gender: BaseValidations.gender,
  dob: BaseValidations.dateOfBirth,
  profilePhoto: z.string().optional(),
})

export const DoctorProfessionalDetailsSchema = z.object({
  qualification: z.string()
    .min(1, ValidationMessages.required)
    .min(2, ValidationMessages.minimumLength(2))
    .max(100, ValidationMessages.maximumLength(100)),
  
  specialization: z.string()
    .min(1, ValidationMessages.required)
    .min(2, ValidationMessages.minimumLength(2))
    .max(100, ValidationMessages.maximumLength(100)),
  
  registrationNumber: z.string()
    .min(1, ValidationMessages.required)
    .min(5, ValidationMessages.minimumLength(5))
    .max(50, ValidationMessages.maximumLength(50))
    .regex(/^[A-Z0-9\-\/]+$/, 'Registration number can only contain uppercase letters, numbers, hyphens, and forward slashes'),
  
  registrationState: z.string()
    .min(1, ValidationMessages.required)
    .min(2, ValidationMessages.minimumLength(2))
    .max(50, ValidationMessages.maximumLength(50)),
  
  expiryDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const expiryDate = new Date(date)
      return !isNaN(expiryDate.getTime())
    }, ValidationMessages.invalidDate)
    .refine((date) => {
      if (!date) return true
      const expiryDate = new Date(date)
      return expiryDate > new Date()
    }, 'Registration must not be expired'),
  
  clinicName: z.string()
    .optional()
    .refine((value) => !value || value.length >= 2, ValidationMessages.minimumLength(2))
    .refine((value) => !value || value.length <= 100, ValidationMessages.maximumLength(100)),
  
  yearsOfExperience: z.number()
    .min(0, ValidationMessages.minimumValue(0))
    .max(60, ValidationMessages.maximumValue(60)),
  
  communicationLanguages: z.array(z.string())
    .min(1, 'At least one language must be selected'),
  
  consultationFees: z.number()
    .min(0, ValidationMessages.minimumValue(0))
    .max(10000, ValidationMessages.maximumValue(10000)),
  
  availableDays: z.array(z.string())
    .min(1, 'At least one day must be selected'),
})

// User schemas
export const UserPersonalDetailsSchema = z.object({
  name: BaseValidations.name,
  email: BaseValidations.email.optional().or(z.literal('')),
  phone: BaseValidations.phone,
  dob: BaseValidations.dateOfBirth,
  gender: BaseValidations.gender,
  marital_status: z.enum(['Single', 'Married', 'Divorced', 'Widowed'], {
    required_error: ValidationMessages.required,
  }).optional(),
  height: z.union([z.string(), z.number(), z.literal('')])
    .optional()
    .refine((value) => {
      // Allow empty values
      if (!value || value === '' || value === null || value === undefined) return true
      const height = typeof value === 'string' ? parseFloat(value) : value
      // Check if it's a valid number and within range
      return !isNaN(height) && height >= 50 && height <= 300
    }, 'Height must be between 50-300 cm')
    .transform((value) => {
      if (!value || value === '' || value === null || value === undefined) return ''
      return typeof value === 'number' ? value.toString() : value.toString()
    }),
  weight: z.union([z.string(), z.number(), z.literal('')])
    .optional()
    .refine((value) => {
      // Allow empty values
      if (!value || value === '' || value === null || value === undefined) return true
      const weight = typeof value === 'string' ? parseFloat(value) : value
      // Check if it's a valid number and within range
      return !isNaN(weight) && weight >= 20 && weight <= 500
    }, 'Weight must be between 20-500 kg')
    .transform((value) => {
      if (!value || value === '' || value === null || value === undefined) return ''
      return typeof value === 'number' ? value.toString() : value.toString()
    }),
  diet: z.enum(['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Other'], {
    required_error: ValidationMessages.required,
  }).optional(),
  profession: z.string()
    .optional()
    .refine((value) => !value || value.length <= 100, ValidationMessages.maximumLength(100)),
  age: z.string().optional(),
  image: z.string().optional(),
})

// Prescription schemas
export const MedicineSchema = z.object({
  name: z.string()
    .min(1, ValidationMessages.required)
    .min(2, ValidationMessages.minimumLength(2))
    .max(100, ValidationMessages.maximumLength(100)),
  dosage: BaseValidations.dosage,
  frequency: BaseValidations.frequency,
  duration: BaseValidations.duration,
  notes: z.string()
    .optional()
    .refine((value) => !value || value.length <= 500, ValidationMessages.maximumLength(500)),
})

export const PrescriptionUploadSchema = z.object({
  consultationId: BaseValidations.consultationId,
  doctorId: z.string().optional(),
  userId: z.string().optional(),
})

export const CustomPrescriptionSchema = z.object({
  consultationId: BaseValidations.consultationId,
  medicines: z.array(MedicineSchema)
    .min(1, 'At least one medicine must be added'),
  instructions: z.string()
    .optional()
    .refine((value) => !value || value.length <= 1000, ValidationMessages.maximumLength(1000)),
})

// Settings schemas
export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, ValidationMessages.required),
  newPassword: BaseValidations.password,
  confirmPassword: z.string().min(1, ValidationMessages.required),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: ValidationMessages.passwordMismatch,
  path: ['confirmPassword'],
})

export const NotificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  appNotifications: z.boolean(),
})

// Export types
export type SignInFormData = z.infer<typeof SignInSchema>
export type OtpFormData = z.infer<typeof OtpSchema>
export type SignUpFormData = z.infer<typeof SignUpSchema>
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>
export type DoctorPersonalDetailsFormData = z.infer<typeof DoctorPersonalDetailsSchema>
export type DoctorProfessionalDetailsFormData = z.infer<typeof DoctorProfessionalDetailsSchema>
export type UserPersonalDetailsFormData = z.infer<typeof UserPersonalDetailsSchema>
export type MedicineFormData = z.infer<typeof MedicineSchema>
export type PrescriptionUploadFormData = z.infer<typeof PrescriptionUploadSchema>
export type CustomPrescriptionFormData = z.infer<typeof CustomPrescriptionSchema>
export type PasswordChangeFormData = z.infer<typeof PasswordChangeSchema>
export type NotificationSettingsFormData = z.infer<typeof NotificationSettingsSchema> 