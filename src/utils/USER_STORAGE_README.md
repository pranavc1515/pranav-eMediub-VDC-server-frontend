# User Storage System

This document explains the enhanced user storage system implemented for storing user and doctor login details in localStorage.

## Overview

The new storage system provides a comprehensive, type-safe way to manage user and doctor authentication data in localStorage. It includes error handling, automatic data synchronization, and convenient hooks for React components.

## Files Involved

- `src/utils/userStorage.ts` - Core storage utilities and manager class
- `src/hooks/useStoredUser.ts` - React hooks for accessing stored data
- `src/views/auth/SignIn/components/SignInForm.tsx` - Updated to use new storage system

## Features

### 1. Comprehensive Data Storage
The system stores the following information for both users and doctors:

```typescript
interface UserStorageData {
    userId: string | number
    userName: string
    authority: string[]
    avatar?: string
    email?: string
    phoneNumber: string
    isProfileComplete?: boolean
    userType: 'user' | 'doctor'
    loginTimestamp: string
    token: string
    // Doctor-specific data
    specialization?: string
    consultationFees?: number | string
    // User-specific data
    patientId?: string | number
}
```

### 2. Storage Keys
The system uses standardized storage keys:
- `user_data` - User/patient data
- `doctor_data` - Doctor data
- `current_user_type` - Currently logged-in user type
- `login_timestamp` - When the user logged in
- `token` - Authentication token (maintained for backward compatibility)

### 3. Error Handling
- Checks localStorage availability
- Graceful fallbacks when localStorage is not available
- Comprehensive error logging
- Returns boolean success/failure indicators

## Usage

### Basic Storage Operations

```typescript
import {
    saveUserToStorage,
    getUserFromStorage,
    getCurrentUser,
    getCurrentUserType,
    getCurrentUserId,
    isUserLoggedIn,
    clearAllUserData,
    type UserStorageData
} from '@/utils/userStorage'

// Save user data after login
const userData: UserStorageData = {
    userId: 123,
    userName: 'John Doe',
    authority: ['user'],
    email: 'john@example.com',
    phoneNumber: '+91234567890',
    userType: 'user',
    token: 'auth-token',
    loginTimestamp: new Date().toISOString(),
    isProfileComplete: true
}

const success = saveUserToStorage(userData)
if (success) {
    console.log('User data saved successfully')
}

// Retrieve current user data
const currentUser = getCurrentUser()
if (currentUser) {
    console.log('Current user:', currentUser.userName)
}

// Check if user is logged in
if (isUserLoggedIn()) {
    console.log('User is logged in')
}

// Clear all user data (logout)
clearAllUserData()
```

### React Hooks

#### useStoredUser Hook
Main hook for accessing stored user data reactively:

```typescript
import { useStoredUser } from '@/hooks/useStoredUser'

function MyComponent() {
    const {
        userData,
        userType,
        userId,
        isLoggedIn,
        loading,
        isDoctor,
        isUser,
        userName,
        userEmail,
        refreshUserData
    } = useStoredUser()

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <h1>Welcome, {userName}!</h1>
            <p>User Type: {userType}</p>
            <p>Logged in: {isLoggedIn ? 'Yes' : 'No'}</p>
            {isDoctor && <p>Doctor Dashboard</p>}
            {isUser && <p>Patient Dashboard</p>}
        </div>
    )
}
```

#### useStoredUserData Hook
For getting specific user type data:

```typescript
import { useStoredUserData } from '@/hooks/useStoredUser'

function DoctorComponent() {
    const { userData, loading } = useStoredUserData('doctor')

    if (loading) return <div>Loading doctor data...</div>
    if (!userData) return <div>No doctor data found</div>

    return (
        <div>
            <h2>Dr. {userData.userName}</h2>
            <p>Specialization: {userData.specialization}</p>
            <p>Consultation Fees: {userData.consultationFees}</p>
        </div>
    )
}
```

## Implementation Details

### Auto-Login Enhancement
When users/doctors log in, the system now stores:

1. **User ID** - For API calls and identification
2. **User Name** - For display purposes
3. **Authority/Role** - For role-based access control
4. **Contact Information** - Email and phone number
5. **Profile Status** - Whether profile setup is complete
6. **Login Timestamp** - When the user logged in
7. **Authentication Token** - For API authorization
8. **Type-specific Data** - Specialization for doctors, patient ID for users

### Backward Compatibility
The system maintains backward compatibility by:
- Still storing data under legacy keys (`user`, `doctor`)
- Keeping the `token` key for existing code
- Working alongside the existing Zustand store

### Storage Events
The `useStoredUser` hook automatically listens for localStorage changes and updates React state accordingly.

## Security Considerations

1. **Token Storage** - Tokens are stored in localStorage (configurable via app.config.ts)
2. **Data Validation** - All stored data is validated before use
3. **Error Handling** - Sensitive operations have try-catch blocks
4. **Cleanup** - Proper cleanup on logout and unauthorized access

## Migration Guide

### From Old System
The old system stored minimal data:
```typescript
// Old way
localStorage.setItem('user', JSON.stringify({ userId, userName }))

// New way (automatic in SignInForm)
saveUserToStorage({
    userId,
    userName,
    authority: ['user'],
    userType: 'user',
    token,
    loginTimestamp: new Date().toISOString(),
    // ... more fields
})
```

### Accessing Data
```typescript
// Old way
const userData = JSON.parse(localStorage.getItem('user') || '{}')

// New way
const userData = getCurrentUser()
// or using hook
const { userData } = useStoredUser()
```

## Testing

The system includes comprehensive error handling and fallbacks:

```typescript
// Test localStorage availability
if (!isUserLoggedIn()) {
    // Handle not logged in state
}

// Test data retrieval
const userData = getCurrentUser()
if (!userData) {
    // Handle no user data case
}
```

## Best Practices

1. **Always check return values** from storage operations
2. **Use hooks in React components** for reactive updates
3. **Clear data on logout** using `clearAllUserData()`
4. **Handle loading states** when using hooks
5. **Validate data** before using stored information

## Troubleshooting

### Common Issues

1. **localStorage not available**: System gracefully handles this with console warnings
2. **Data not updating**: Use `refreshUserData()` from the hook to force refresh
3. **Type errors**: Ensure you're using the correct `UserStorageData` interface
4. **Storage events not firing**: Make sure you're using the hook in React components

### Debug Information

```typescript
import userStorageManager from '@/utils/userStorage'

// Get all stored data for debugging
const allData = userStorageManager.getAllStoredData()
console.log('All stored data:', allData)
```

This enhanced storage system provides a robust foundation for managing user authentication data throughout the application. 