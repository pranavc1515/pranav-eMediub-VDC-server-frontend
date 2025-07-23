# eMediHub VDC - Route-Based Functionality Documentation

## Table of Contents
1. [Route Architecture Overview](#route-architecture-overview)
2. [Public Routes](#public-routes)
3. [Protected Routes](#protected-routes)
4. [Authentication Routes](#authentication-routes)
5. [Doctor Routes](#doctor-routes)
6. [User Routes](#user-routes)
7. [Video Consultation Routes](#video-consultation-routes)
8. [Component Import Relationships](#component-import-relationships)
9. [Route Guards & Authority](#route-guards--authority)

---

## Route Architecture Overview

### Route Structure
```
src/
├── configs/routes.config/
│   ├── routes.config.ts      # Main route configuration
│   ├── authRoute.ts          # Authentication routes
│   ├── doctorRoute.ts        # Doctor-specific routes
│   └── othersRoute.ts        # Other utility routes
├── components/route/
│   ├── AllRoutes.tsx         # Main route component
│   ├── AppRoute.tsx          # Route wrapper component
│   ├── AuthorityGuard.tsx    # Authority-based protection
│   ├── ProtectedRoute.tsx    # Authentication protection
│   └── PublicRoute.tsx       # Public route handling
└── views/                    # Page components
    ├── auth/                 # Authentication pages
    ├── doctor/               # Doctor pages
    ├── user/                 # User pages
    └── Interface/            # Video consultation interface
```

### Route Configuration Pattern
```typescript
interface Route {
    key: string                    // Unique route identifier
    path: string                   // URL path
    component: LazyExoticComponent // Lazy-loaded component
    authority: string[]            // Required user authorities
    meta?: {                      // Optional metadata
        layout?: LayoutType
        pageTitle?: string
        pageContainerType?: string
    }
}
```

---

## Public Routes

### Landing Page
```typescript
{
    key: 'landing',
    path: '/',
    component: lazy(() => import('@/components/landingPage/LandingPage')),
    authority: [], // No authority required
}
```

**Component Import Chain:**
```
LandingPage.tsx
├── components/landingPage/
│   ├── components/              # Landing page components
│   ├── contexts/               # Landing page context
│   └── assets/                 # Landing page assets
└── components/shared/           # Shared components
```

**Functionality:**
- Public landing page with service overview
- Doctor and patient registration links
- Service feature showcase
- Multi-language support

---

## Authentication Routes

### Sign In
```typescript
{
    key: 'signIn',
    path: '/sign-in',
    component: lazy(() => import('@/views/auth/SignIn')),
    authority: [], // Public access
}
```

**Component Import Chain:**
```
SignIn.tsx
├── components/auth/SignIn/
│   ├── SignIn.tsx              # Main sign-in component
│   └── SignInForm.ts           # Form validation schema
├── components/ui/               # UI components
│   ├── Input/
│   ├── Button/
│   └── Form/
└── services/
    └── AuthService.ts          # Authentication API calls
```

**Functionality:**
- Phone number input
- OTP verification
- Role-based redirect (user/doctor)
- Form validation with Zod
- Error handling and loading states

### Sign Up
```typescript
{
    key: 'signUp',
    path: '/sign-up',
    component: lazy(() => import('@/views/auth/SignUp')),
    authority: [], // Public access
}
```

**Component Import Chain:**
```
SignUp.tsx
├── components/auth/SignUp/
│   ├── SignUp.tsx              # Main sign-up component
│   └── SignUpForm.ts           # Form validation schema
├── components/ui/               # UI components
└── services/
    └── AuthService.ts          # Registration API calls
```

**Functionality:**
- User registration form
- Phone number verification
- Role selection (user/doctor)
- Profile completion check
- Automatic redirect to profile setup

### Forgot Password
```typescript
{
    key: 'forgotPassword',
    path: '/forgot-password',
    component: lazy(() => import('@/views/auth/ForgotPassword')),
    authority: [], // Public access
}
```

**Component Import Chain:**
```
ForgotPassword.tsx
├── components/auth/ForgotPassword/
│   ├── ForgotPassword.tsx      # Main component
│   └── ForgotPasswordForm.ts   # Form schema
└── components/ui/
```

**Functionality:**
- Phone number input
- OTP generation
- Password reset flow
- Email/SMS notification

### Reset Password
```typescript
{
    key: 'resetPassword',
    path: '/reset-password',
    component: lazy(() => import('@/views/auth/ResetPassword')),
    authority: [], // Public access
}
```

**Component Import Chain:**
```
ResetPassword.tsx
├── components/auth/ResetPassword/
│   ├── ResetPassword.tsx       # Main component
│   └── ResetPasswordForm.ts    # Form schema
└── components/ui/
```

**Functionality:**
- New password input
- Password confirmation
- Password strength validation
- Success redirect

---

## Protected Routes

### User Dashboard
```typescript
{
    key: 'home',
    path: '/home',
    component: lazy(() => import('@/views/user/Dashboard')),
    authority: [], // All authenticated users
}
```

**Component Import Chain:**
```
Dashboard.tsx
├── components/user/Dashboard/
│   ├── Dashboard.tsx           # Main dashboard
│   ├── ServiceCards.tsx        # Service overview cards
│   └── QuickActions.tsx        # Quick action buttons
├── components/shared/
│   ├── Card/
│   ├── Button/
│   └── Avatar/
└── hooks/
    └── useStoredUser.ts        # User data management
```

**Functionality:**
- Service overview (VDC, Appointments, etc.)
- Quick action buttons
- User profile summary
- Recent activity
- Service status indicators

### Video Doctor Consultation (VDC)
```typescript
{
    key: 'videoDoctorConsultation',
    path: '/vdc',
    component: lazy(() => import('@/views/Home')),
    authority: [], // All authenticated users
}
```

**Component Import Chain:**
```
Home.tsx
├── components/Home/
│   ├── Home.tsx                # Main VDC component
│   ├── DoctorList.tsx          # Available doctors
│   ├── DoctorCard.tsx          # Individual doctor card
│   └── FilterControls.tsx      # Search and filter
├── components/shared/
│   ├── Card/
│   ├── Avatar/
│   └── Badge/
├── hooks/
│   ├── useDoctors.ts           # Doctor data fetching
│   └── useConsultation.ts      # Consultation management
└── services/
    └── DoctorService.ts        # Doctor API calls
```

**Functionality:**
- Doctor listing with specializations
- Search and filter doctors
- Doctor availability status
- Consultation fee display
- Queue joining interface

---

## Doctor Routes

### Doctor Dashboard
```typescript
{
    key: 'doctor.dashboard',
    path: '/doctor/dashboard',
    component: lazy(() => import('@/views/doctor/Dashboard')),
    authority: ['doctor'],
}
```

**Component Import Chain:**
```
Dashboard.tsx
├── components/doctor/Dashboard/
│   ├── Dashboard.tsx           # Main dashboard
│   ├── PatientQueue.tsx        # Patient queue management
│   ├── ConsultationStats.tsx   # Statistics display
│   └── QuickActions.tsx        # Doctor actions
├── components/shared/
│   ├── Table/
│   ├── Card/
│   └── Button/
├── hooks/
│   ├── usePatientQueue.ts      # Queue management
│   └── useConsultation.ts      # Consultation data
└── contexts/
    └── SocketContext.tsx       # Real-time updates
```

**Functionality:**
- Patient queue monitoring
- Consultation statistics
- Availability toggle
- Quick consultation start
- Real-time queue updates

### Doctor Profile
```typescript
{
    key: 'doctor.profile',
    path: '/doctor/profile',
    component: lazy(() => import('@/views/doctor/Profile')),
    authority: ['doctor'],
}
```

**Component Import Chain:**
```
Profile.tsx
├── components/doctor/Profile/
│   ├── Profile.tsx             # Main profile component
│   ├── PersonalInfo.tsx        # Personal information
│   ├── ProfessionalInfo.tsx    # Professional details
│   └── ProfilePhoto.tsx        # Photo management
├── components/ui/
│   ├── Form/
│   ├── Input/
│   └── Upload/
└── services/
    └── DoctorService.ts        # Profile API calls
```

**Functionality:**
- Personal information management
- Professional credentials
- Profile photo upload
- Specialization settings
- Consultation fee configuration

### Doctor Profile Setup
```typescript
{
    key: 'doctor.profileSetup',
    path: '/profile-setup',
    component: lazy(() => import('@/views/doctor/ProfileSetup')),
    authority: ['doctor'],
    meta: {
        layout: 'blank', // Full-screen layout
    },
}
```

**Component Import Chain:**
```
ProfileSetup.tsx
├── components/doctor/ProfileSetup/
│   ├── ProfileSetup.tsx        # Main setup component
│   ├── PersonalForm.tsx        # Personal details form
│   ├── ProfessionalForm.tsx    # Professional details form
│   └── VerificationForm.tsx    # License verification
├── components/ui/
│   ├── Form/
│   ├── Input/
│   └── Upload/
└── services/
    └── DoctorService.ts        # Setup API calls
```

**Functionality:**
- Complete profile setup flow
- License verification
- Specialization selection
- Consultation fee setup
- Certificate upload

### Doctor Settings
```typescript
{
    key: 'doctor.settings',
    path: '/doctor/settings',
    component: lazy(() => import('@/views/doctor/Settings')),
    authority: ['doctor'],
}
```

**Component Import Chain:**
```
Settings.tsx
├── components/doctor/Settings/
│   ├── Settings.tsx            # Main settings component
│   ├── LanguageSettings.tsx    # Language preferences
│   ├── NotificationSettings.tsx # Notification preferences
│   └── SecuritySettings.tsx    # Security settings
├── components/ui/
│   ├── Tabs/
│   ├── Form/
│   └── Switcher/
└── services/
    └── DoctorService.ts        # Settings API calls
```

**Functionality:**
- Language preferences
- Notification settings
- Security settings
- Account management
- Privacy settings

---

## User Routes

### User Appointments
```typescript
{
    key: 'user.appointments',
    path: '/user/appointments',
    component: lazy(() => import('@/views/user/Appointments')),
    authority: ['user'],
}
```

**Component Import Chain:**
```
Appointments.tsx
├── components/user/Appointments/
│   ├── Appointments.tsx        # Main appointments component
│   ├── AppointmentCard.tsx     # Individual appointment
│   ├── AppointmentList.tsx     # Appointments list
│   └── AppointmentFilters.tsx  # Filter controls
├── components/shared/
│   ├── Card/
│   ├── Badge/
│   └── Button/
└── services/
    └── AppointmentService.ts   # Appointment API calls
```

**Functionality:**
- Appointment history
- Upcoming appointments
- Appointment details
- Cancellation options
- Rescheduling interface

### User Profile Setup
```typescript
{
    key: 'user.profileSetup',
    path: '/user-profile-setup',
    component: lazy(() => import('@/views/user/ProfileSetup')),
    authority: ['user'],
    meta: {
        layout: 'blank', // Full-screen layout
    },
}
```

**Component Import Chain:**
```
ProfileSetup.tsx
├── components/user/ProfileSetup/
│   ├── ProfileSetup.tsx        # Main setup component
│   ├── PersonalForm.tsx        # Personal details
│   ├── MedicalForm.tsx         # Medical information
│   └── FamilyForm.tsx          # Family management
├── components/ui/
│   ├── Form/
│   ├── Input/
│   └── Select/
└── services/
    └── UserService.ts          # Profile API calls
```

**Functionality:**
- Personal information setup
- Medical history input
- Family member management
- Health preferences
- Emergency contacts

### User Profile
```typescript
{
    key: 'userProfile',
    path: '/user/profile',
    component: lazy(() => import('@/views/user/Profile')),
    authority: ['user'],
}
```

**Component Import Chain:**
```
Profile.tsx
├── components/user/Profile/
│   ├── Profile.tsx             # Main profile component
│   ├── PersonalInfo.tsx        # Personal information
│   ├── MedicalInfo.tsx         # Medical information
│   ├── FamilyInfo.tsx          # Family information
│   └── ProfilePhoto.tsx        # Photo management
├── components/ui/
│   ├── Form/
│   ├── Input/
│   └── Upload/
└── services/
    └── UserService.ts          # Profile API calls
```

**Functionality:**
- Personal information management
- Medical history
- Family member management
- Profile photo upload
- Health preferences

### User Settings
```typescript
{
    key: 'userSettings',
    path: '/user/settings',
    component: lazy(() => import('@/views/user/Settings')),
    authority: ['user'],
}
```

**Component Import Chain:**
```
Settings.tsx
├── components/user/Settings/
│   ├── Settings.tsx            # Main settings component
│   ├── LanguageSettings.tsx    # Language preferences
│   ├── NotificationSettings.tsx # Notification preferences
│   ├── SecuritySettings.tsx    # Security settings
│   └── PrivacySettings.tsx     # Privacy settings
├── components/ui/
│   ├── Tabs/
│   ├── Form/
│   └── Switcher/
└── services/
    └── UserService.ts          # Settings API calls
```

**Functionality:**
- Language preferences
- Notification settings
- Security settings
- Privacy settings
- Account deletion

### User Medical Reports
```typescript
{
    key: 'userMedicalReports',
    path: '/user/medical-reports',
    component: lazy(() => import('@/views/user/MedicalReportView')),
    authority: ['user'],
}
```

**Component Import Chain:**
```
MedicalReportView.tsx
├── components/user/MedicalReportView/
│   ├── MedicalReportView.tsx   # Main component
│   ├── ReportList.tsx          # Reports list
│   ├── ReportCard.tsx          # Individual report
│   ├── ReportUpload.tsx        # Upload interface
│   └── ReportFilters.tsx       # Filter controls
├── components/shared/
│   ├── Card/
│   ├── Upload/
│   └── Button/
└── services/
    └── ReportService.ts        # Report API calls
```

**Functionality:**
- Medical report upload
- Report categorization
- Report viewing
- Family report access
- Report sharing

### User Reports
```typescript
{
    key: 'userReports',
    path: '/user/reports',
    component: lazy(() => import('@/views/user/Reports')),
    authority: ['user'],
}
```

**Component Import Chain:**
```
Reports.tsx
├── components/user/Reports/
│   ├── Reports.tsx             # Main reports component
│   ├── ReportList.tsx          # Reports list
│   ├── ReportCard.tsx          # Individual report
│   └── ReportFilters.tsx       # Filter controls
├── components/shared/
│   ├── Card/
│   ├── Badge/
│   └── Button/
└── services/
    └── ReportService.ts        # Report API calls
```

**Functionality:**
- Consultation reports
- Medical reports
- Report history
- Report download
- Report sharing

---

## Video Consultation Routes

### Doctor Video Call Interface
```typescript
{
    key: 'doctorVideoCall',
    path: '/doctor/video-consultation/:id',
    component: lazy(() => import('@/views/Interface/VideoCallInterface')),
    authority: ['doctor'],
}
```

**Component Import Chain:**
```
VideoCallInterface.tsx
├── components/Interface/
│   ├── VideoCallInterface.tsx  # Main video interface
│   ├── CallControls.tsx        # Call control buttons
│   ├── ParticipantList.tsx     # Participant management
│   ├── ChatInterface.tsx       # Chat functionality
│   └── ConsultationSummary.tsx # Consultation summary
├── components/shared/
│   ├── VideoCallModal.tsx      # Video call modal
│   └── CallControls.tsx        # Call controls
├── contexts/
│   ├── VideoCallContext.tsx    # Video call state
│   └── SocketContext.tsx       # Real-time communication
├── hooks/
│   └── useConsultation.ts      # Consultation management
└── services/
    ├── VideoService.ts         # Twilio video API
    └── ConsultationService.ts  # Consultation API
```

**Functionality:**
- Twilio video integration
- Real-time video/audio
- Screen sharing
- Chat functionality
- Participant management
- Consultation recording
- Queue management
- Consultation summary

### User Video Call Interface
```typescript
{
    key: 'userVideoCall',
    path: '/user/video-consultation/:id',
    component: lazy(() => import('@/views/user/VideoCallView')),
    authority: ['user'],
}
```

**Component Import Chain:**
```
VideoCallView.tsx
├── components/user/VideoCallView/
│   ├── VideoCallView.tsx       # Main video view
│   ├── WaitingRoom.tsx         # Waiting room interface
│   ├── CallControls.tsx        # Call controls
│   └── ConsultationEnd.tsx     # Consultation end
├── components/shared/
│   ├── VideoCallModal.tsx      # Video call modal
│   └── CallControls.tsx        # Call controls
├── contexts/
│   ├── VideoCallContext.tsx    # Video call state
│   └── SocketContext.tsx       # Real-time communication
├── hooks/
│   └── useConsultation.ts      # Consultation management
└── services/
    ├── VideoService.ts         # Twilio video API
    └── ConsultationService.ts  # Consultation API
```

**Functionality:**
- Waiting room interface
- Queue position tracking
- Video consultation interface
- Call controls
- Consultation end flow
- Report generation

---

## Component Import Relationships

### Core Component Dependencies
```
App.tsx
├── AuthProvider.tsx            # Authentication context
├── SocketContextProvider.tsx   # Socket.IO context
├── VideoCallProvider.tsx       # Video call context
├── Layout.tsx                  # Main layout wrapper
└── Views.tsx                   # Route views

Views.tsx
├── AllRoutes.tsx               # Route configuration
├── ProtectedRoute.tsx          # Authentication guard
├── PublicRoute.tsx             # Public route handler
└── AuthorityGuard.tsx          # Authority-based protection
```

### Shared Component Library
```
components/shared/
├── Card/                       # Card components
├── Button/                     # Button components
├── Input/                      # Input components
├── Form/                       # Form components
├── Table/                      # Table components
├── Avatar/                     # Avatar components
├── Badge/                      # Badge components
├── Modal/                      # Modal components
├── Loading/                    # Loading components
└── VideoCallModal.tsx          # Video call modal
```

### UI Component Library
```
components/ui/
├── Alert/                      # Alert components
├── Button/                     # Button components
├── Card/                       # Card components
├── Checkbox/                   # Checkbox components
├── DatePicker/                 # Date picker components
├── Dialog/                     # Dialog components
├── Dropdown/                   # Dropdown components
├── Form/                       # Form components
├── Input/                      # Input components
├── Menu/                       # Menu components
├── Notification/               # Notification components
├── Pagination/                 # Pagination components
├── Progress/                   # Progress components
├── Radio/                      # Radio components
├── Select/                     # Select components
├── Skeleton/                   # Skeleton components
├── Spinner/                    # Spinner components
├── Table/                      # Table components
├── Tabs/                       # Tabs components
├── Tag/                        # Tag components
├── Timeline/                   # Timeline components
├── Tooltip/                    # Tooltip components
└── Upload/                     # Upload components
```

### Service Layer
```
services/
├── ApiService.ts               # Base API service
├── AuthService.ts              # Authentication service
├── UserService.ts              # User management service
├── DoctorService.ts            # Doctor management service
├── VideoService.ts             # Video call service
├── ConsultationService.ts      # Consultation service
├── ReportService.ts            # Report management service
└── AppointmentService.ts       # Appointment service
```

### Hook Dependencies
```
hooks/
├── useAuth.ts                  # Authentication hook
├── useStoredUser.ts            # User storage hook
├── useConsultation.ts          # Consultation hook
├── usePatientQueue.ts          # Queue management hook
├── useDoctors.ts               # Doctor data hook
├── useDebounce.ts              # Debounce utility
├── useLocalStorage.ts          # Local storage hook
└── useSocket.ts                # Socket.IO hook
```

---

## Route Guards & Authority

### Authentication Guards
```typescript
// PublicRoute.tsx - Redirects authenticated users
const PublicRoute = () => {
    const { authenticated, user } = useAuth()
    
    if (authenticated) {
        return <Navigate to={getRedirectPath()} />
    }
    return <Outlet />
}

// ProtectedRoute.tsx - Protects authenticated routes
const ProtectedRoute = () => {
    const { authenticated } = useAuth()
    
    if (!authenticated) {
        return <Navigate to="/sign-in" />
    }
    return <Outlet />
}
```

### Authority Guards
```typescript
// AuthorityGuard.tsx - Role-based access control
const AuthorityGuard = ({ userAuthority, authority, children }) => {
    const hasAuthority = authority.some(auth => 
        userAuthority.includes(auth)
    )
    
    return hasAuthority ? children : <Navigate to="/access-denied" />
}
```

### Authority Levels
```typescript
// User Authorities
const USER_AUTHORITIES = {
    USER: ['user'],           // Patient access
    DOCTOR: ['doctor'],       // Doctor access
    ADMIN: ['admin'],         // Admin access
    PUBLIC: [],               // Public access
}

// Route Authority Examples
{
    authority: ['user'],       // Patient only
    authority: ['doctor'],     // Doctor only
    authority: ['user', 'doctor'], // Both users and doctors
    authority: [],             // All authenticated users
}
```

### Route Protection Flow
```
1. User visits route
2. ProtectedRoute checks authentication
3. AuthorityGuard checks user authority
4. Component renders if authorized
5. Redirect to appropriate page if unauthorized
```

---

## Route Configuration Best Practices

### 1. Lazy Loading
```typescript
// Use lazy loading for all route components
component: lazy(() => import('@/views/user/Dashboard'))
```

### 2. Authority Configuration
```typescript
// Always specify required authorities
authority: ['user']     // Specific role
authority: []           // All authenticated users
```

### 3. Meta Information
```typescript
meta: {
    layout: 'blank',           // Layout type
    pageTitle: 'Dashboard',    // Page title
    pageContainerType: 'contained', // Container type
}
```

### 4. Route Organization
```typescript
// Group related routes
const userRoutes = [
    { key: 'user.profile', path: '/user/profile', ... },
    { key: 'user.settings', path: '/user/settings', ... },
]

const doctorRoutes = [
    { key: 'doctor.dashboard', path: '/doctor/dashboard', ... },
    { key: 'doctor.profile', path: '/doctor/profile', ... },
]
```

### 5. Error Handling
```typescript
// Catch-all route for 404
<Route path="*" element={<Navigate replace to="/" />} />

// Access denied route
{
    key: 'accessDenied',
    path: '/access-denied',
    component: lazy(() => import('@/views/others/AccessDenied')),
    authority: ['user', 'doctor'],
}
```

---

## Development Guidelines

### Adding New Routes
1. **Create Component**: Add component in appropriate `views/` directory
2. **Add Route**: Add route configuration in `routes.config.ts`
3. **Set Authority**: Configure required user authorities
4. **Add Navigation**: Update navigation configuration if needed
5. **Test Route**: Verify route protection and functionality

### Route Testing Checklist
- [ ] Route accessible with correct authority
- [ ] Route protected from unauthorized access
- [ ] Component loads correctly
- [ ] Lazy loading works
- [ ] Navigation works properly
- [ ] Error handling works
- [ ] Mobile responsiveness

### Performance Considerations
- **Code Splitting**: All routes use lazy loading
- **Bundle Size**: Components are split by route
- **Caching**: Route components are cached after first load
- **Preloading**: Critical routes can be preloaded

---

This documentation provides a comprehensive overview of the route-based functionality in the eMediHub VDC project, showing component imports and their relationships for each route. 