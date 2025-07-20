# eMediHub VDC Project - Handover Document

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [User Features & Functionality](#user-features--functionality)
5. [Doctor Features & Functionality](#doctor-features--functionality)
6. [Video Consultation System](#video-consultation-system)
7. [Authentication & User Management](#authentication--user-management)
8. [Development Environment Setup](#development-environment-setup)
9. [Deployment Information](#deployment-information)
10. [Key Components & Services](#key-components--services)
11. [Database & API Integration](#database--api-integration)
12. [Known Issues & Limitations](#known-issues--limitations)
13. [Future Enhancements](#future-enhancements)
14. [Contact Information](#contact-information)

---

## Project Overview

**eMediHub VDC (Video Doctor Consultation)** is a comprehensive telehealth platform that connects patients with doctors through secure video consultations. The project is built using React with TypeScript and provides separate interfaces for patients (users) and doctors.

### Key Features
- Real-time video consultations using Twilio Video
- Socket.IO for real-time communication and queue management
- Prescription management and medical reports
- Multi-language support (English, Hindi, Kannada)
- Role-based access control
- Responsive design for all devices

### Project Team
- **Founder & CEO**: Kasi Reddy
- **Chief Technology Officer**: Bala Rajesh Kancharla
- **Director**: Ayyapa Raju

---

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.3
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: Zustand 4.5.5
- **Routing**: React Router DOM 6.26.2
- **Forms**: React Hook Form 7.53.0 with Zod validation
- **UI Components**: Custom component library with Tailwind
- **Animations**: Framer Motion 11.5.4

### Real-time Communication
- **Video Calls**: Twilio Video 2.30.0
- **WebSocket**: Socket.IO Client 4.8.1
- **HTTP Client**: Axios 1.8.4

### Development Tools
- **Code Quality**: ESLint, Prettier
- **Package Manager**: npm
- **Version Control**: Git

### Key Dependencies
```json
{
  "react": "^18.3.1",
  "typescript": "^5.6.2",
  "vite": "^5.4.3",
  "tailwindcss": "^3.4.17",
  "socket.io-client": "^4.8.1",
  "twilio-video": "^2.30.0",
  "axios": "^1.8.4",
  "zustand": "^4.5.5",
  "react-hook-form": "^7.53.0",
  "zod": "^3.23.8"
}
```

---

## Project Architecture

### Directory Structure
```
src/
├── @types/           # TypeScript type definitions
├── assets/           # Static assets (images, styles, SVGs)
├── auth/             # Authentication context and providers
├── components/       # Reusable UI components
│   ├── Interface/    # Video call interface components
│   ├── landingPage/  # Landing page components
│   ├── layouts/      # Layout components
│   ├── route/        # Routing components
│   ├── shared/       # Shared components
│   ├── template/     # Template components
│   └── ui/           # Base UI components
├── configs/          # Configuration files
├── constants/        # Application constants
├── contexts/         # React contexts
├── hooks/            # Custom React hooks
├── locales/          # Internationalization
├── mock/             # Mock data for development
├── services/         # API services
├── store/            # Zustand stores
├── utils/            # Utility functions
└── views/            # Page components
    ├── auth/         # Authentication pages
    ├── doctor/       # Doctor-specific pages
    ├── user/         # User-specific pages
    └── Interface/    # Video consultation interface
```

### Key Architecture Patterns
- **Component-based Architecture**: Modular, reusable components
- **Context API**: For global state management (Auth, Socket, VideoCall)
- **Custom Hooks**: Encapsulate business logic
- **Service Layer**: Abstracted API communication
- **Role-based Routing**: Different routes for users and doctors

---

## User Features & Functionality

### 1. User Authentication
- **OTP-based Login/Registration**: Phone number verification
- **Profile Setup**: Complete personal and medical information
- **Role Management**: User authority and permissions

### 2. User Dashboard
**Available Services:**
- ✅ **Virtual Doctor Consultation** - Active feature
- 🔄 **Book Appointment** - Coming Soon
- 🔄 **Wellness Programs** - Coming Soon
- 🔄 **Order Medicines** - Coming Soon
- 🔄 **Book Lab Test** - Coming Soon
- 🔄 **Health Insurance** - Coming Soon

**Quick Actions:**
- My Prescriptions
- Profile Settings

### 3. Video Consultation (Patient Side)
- **Doctor Selection**: Browse available doctors by specialization
- **Queue System**: Join doctor's consultation queue
- **Waiting Room**: Real-time queue position and estimated wait time
- **Video Call Interface**: Full-featured video consultation
- **Consultation History**: View past consultations and reports

### 4. Profile Management
**Personal Information:**
- Basic details (name, email, phone, DOB, gender)
- Physical attributes (height, weight)
- Lifestyle information (diet, profession, smoking/drinking habits)
- Medical information (blood group, allergies, medical history)

**Family Management:**
- Add family members
- Manage family medical records
- View family consultation history

### 5. Medical Records & Reports
- **Upload Medical Reports**: PDF/image support with date and doctor information
- **View Reports**: Organized by date and type
- **Family Reports**: Access family member reports
- **Prescription Management**: View and download prescriptions

### 6. User Settings
- **Language Preferences**: English, Hindi, Kannada
- **Notification Settings**: Email, SMS, app notifications
- **Password Management**: Change account password
- **Account Management**: Delete account option

### 7. Prescription Management
- **View Prescriptions**: Comprehensive prescription history
- **Download**: PDF format prescriptions
- **Search & Filter**: By doctor, date, medication
- **Medical Details**: Dosage, frequency, duration, notes

---

## Doctor Features & Functionality

### 1. Doctor Authentication
- **Professional Verification**: Medical license verification
- **Profile Setup**: Personal and professional information
- **Specialization**: Medical specialization and qualifications

### 2. Doctor Dashboard
**Available Services:**
- ✅ **VDC (Virtual Doctor Consultation)** - Active with queue management
- 🔄 **IPC (In-Person Consultation)** - Coming Soon

**Key Features:**
- Real-time patient queue monitoring
- Availability toggle
- Consultation statistics
- Quick access to patient reports

### 3. VDC Configuration
- **Consultation Fees**: Set pricing for video consultations
- **Availability Schedule**: Configure available days and times
- **Specialization Settings**: Update medical specialization
- **Language Preferences**: Communication languages

### 4. Video Consultation (Doctor Side)
- **Patient Queue Management**: View waiting patients
- **Start Consultation**: Initiate video calls with patients
- **Prescription Generation**: Create digital prescriptions during consultation
- **End Consultation**: Complete consultations with summary
- **Participant Monitoring**: Track active participants

### 5. Patient Management
- **Patient Records**: Comprehensive patient information
- **Consultation History**: Past consultations with each patient
- **Medical Documents**: Access patient medical reports
- **Prescription History**: View all prescriptions issued

### 7. Doctor Profile Management
**Personal Information:**
- Basic details and contact information
- Profile photo management
- Personal preferences

**Professional Information:**
- Medical qualifications and certifications
- Specialization and experience
- Medical registration details
- Certificate uploads

### 8. Reports & Analytics
- **Patient Reports**: Upload and manage patient medical reports
- **Consultation Analytics**: Track consultation metrics
- **Report Generation**: upload medical reports for patients

### 9. Doctor Settings
- **Language Preferences**: Interface language settings
- **Notification Preferences**: Professional notifications
- **Account Management**: Profile and security settings

---

## Video Consultation System

### Technology Implementation
- **Video Platform**: Twilio Video API
- **Real-time Communication**: Socket.IO
- **Room Management**: Dynamic room creation and management

### Patient Flow
1. **Doctor Selection**: Choose from available doctors
2. **Queue Entry**: Join doctor's consultation queue
3. **Waiting Room**: Real-time queue updates and position tracking
4. **Consultation Start**: Automatic transition to video call
5. **Video Call**: Full-featured consultation interface
6. **Consultation End**: Review and completion

### Doctor Flow
1. **Availability Toggle**: Set online/offline status
2. **Queue Monitoring**: Real-time patient queue updates
3. **Start Consultation**: Initiate video calls with waiting patients
4. **Consultation Management**: Conduct video consultations
5. **Prescription Creation**: Generate prescriptions during calls
6. **End Consultation**: Complete and finalize consultations

### Socket.IO Events
**Patient Events:**
- `PATIENT_JOIN_QUEUE`: Join doctor's queue
- `QUEUE_POSITION_UPDATE`: Receive queue position
- `CONSULTATION_STARTED`: Begin video consultation
- `CONSULTATION_ENDED`: End video consultation
- `LEAVE_QUEUE`: Exit consultation queue

**Doctor Events:**
- `JOIN_DOCTOR_ROOM`: Connect to doctor room
- `QUEUE_CHANGED`: Patient queue updates
- `PATIENT_JOINED_QUEUE`: New patient in queue
- `PATIENT_LEFT_QUEUE`: Patient left queue
- `INVITE_NEXT_PATIENT`: Start consultation with patient
- `END_CONSULTATION`: End active consultation

### Video Call Features
- **Audio/Video Controls**: Mute, camera toggle
- **Screen Sharing**: Share screen functionality
- **Prescription Tools**: In-call prescription creation
- **Call Quality Indicators**: Connection status monitoring
- **Recording Support**: Consultation recording capabilities

---

## Authentication & User Management

### Authentication Flow
1. **Phone Number Entry**: User enters phone number
2. **OTP Generation**: System sends verification code
3. **OTP Verification**: User verifies with received code
4. **Profile Check**: System checks if profile is complete
5. **Profile Setup**: New users complete profile setup
6. **Dashboard Access**: Redirect to appropriate dashboard

### User Storage System
**Storage Keys:**
- `user_data`: Patient information
- `doctor_data`: Doctor information
- `current_user_type`: Active user type
- `login_timestamp`: Login time tracking
- `token`: Authentication token

**User Data Structure:**
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
  // Doctor-specific
  specialization?: string
  consultationFees?: number | string
  // Patient-specific
  patientId?: string | number
  age?: string
  gender?: string
  medicalInfo?: object
}
```

### Role-based Access Control
- **User Authority**: `['user']` for patients
- **Doctor Authority**: `['doctor']` for doctors
- **Route Protection**: Authority-based route guards
- **Component Rendering**: Conditional UI based on roles

---

## Development Environment Setup

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- VS Code (recommended IDE)

### Installation Steps
```bash
# Clone the repository
git clone <repository-url>
cd eMediHub-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables
```env
VITE_APP_API_BASE_URL=http://localhost:3000
VITE_BACKEND_URL=http://localhost:3000
VITE_RAZORPAY_KEY=rzp_test_6pdNA8n5Gcoe3D
VITE_DEV_PROXY_TARGET=http://localhost:3000
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run prettier     # Check code formatting
npm run prettier:fix # Fix code formatting
npm run format       # Run both prettier and lint fixes
```

### Development Tools
- **Vite Dev Server**: Hot module replacement
- **ESLint**: Code quality and standards
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Tailwind CSS**: Utility-first styling

---

## Deployment Information

### Build Configuration
- **Build Tool**: Vite with optimized production builds
- **Output Directory**: `build/` folder
- **Static Assets**: Optimized and hashed filenames
- **Code Splitting**: Automatic vendor chunk separation

### Production Build
```bash
npm run build
```

### Build Optimization
- **Tree Shaking**: Unused code elimination
- **Minification**: JavaScript and CSS compression
- **Asset Optimization**: Image and asset compression
- **Chunk Splitting**: Optimal bundle sizes


### Environment Configuration
- **Development**: `localhost:3000` API endpoints
- **Production**: Configure production API URLs
- **Staging**: Separate staging environment setup

---

## Key Components & Services

### Core Components
1. **VideoCallInterface**: Main video consultation interface
2. **SocketContext**: Real-time communication management
3. **AuthProvider**: Authentication and user management
4. **VideoCallProvider**: Video call state management
5. **UserStorage**: Local storage management utilities

### Service Classes
1. **VideoService**: Twilio video API integration
2. **ConsultationService**: Consultation management
3. **UserService**: User profile and data management
4. **DoctorService**: Doctor-specific functionality
5. **ApiService**: Base API communication service

### Custom Hooks
1. **useConsultation**: Consultation data and operations
2. **usePatientQueue**: Patient queue management
3. **useStoredUser**: Local storage user data
4. **useDoctors**: Doctor listing and filtering
5. **usePrescription**: Prescription management

### Utility Functions
1. **userStorage.ts**: Enhanced user data storage
2. **validationSchemas.ts**: Form validation schemas
3. **dateUtils.ts**: Date formatting and calculations
4. **classNames.ts**: CSS class name utilities

---

## Database & API Integration

### API Architecture
- **Base URL**: Configurable through environment variables
- **Authentication**: JWT token-based authentication
- **Request/Response**: JSON format with error handling
- **Proxy Configuration**: Development proxy for API calls

### Key API Endpoints
**Authentication:**
- `POST /api/patients/register-new` - Patient registration
- `POST /api/patients/do-login` - Patient login
- `POST /api/doctors/register` - Doctor registration
- `POST /api/doctors/login` - Doctor login
- `POST /api/patients/validate-otp` - OTP verification
- `POST /api/doctors/validate-otp` - Doctor OTP verification

**User Management:**
- `GET /api/patients/profile-details` - Get patient profile
- `PUT /api/patients/profile-details` - Update patient profile
- `GET /api/doctors/profile` - Get doctor profile
- `PUT /api/doctors/profile` - Update doctor profile

**Video Consultation:**
- `POST /api/video/token` - Generate video access token
- `POST /api/video/room` - Create video room
- `GET /api/video/rooms` - List video rooms
- `POST /api/consultations/start` - Start consultation
- `POST /api/consultations/end` - End consultation

**Prescriptions & Reports:**
- `GET /api/prescriptions/patient/me` - Get patient prescriptions
- `POST /api/prescriptions/create` - Create prescription
- `GET /api/reports` - Get medical reports
- `POST /api/reports/upload` - Upload medical report

### Data Models
**User/Patient:**
```typescript
interface Patient {
  id: number
  name: string
  email?: string
  phoneNumber: string
  age?: string
  gender?: string
  medicalHistory?: object
}
```

**Doctor:**
```typescript
interface Doctor {
  id: number
  fullName: string
  email?: string
  phoneNumber: string
  specialization?: string
  consultationFees?: number
  qualification?: string
  experience?: number
}
```

**Consultation:**
```typescript
interface Consultation {
  id: string
  doctorId: number
  patientId: number
  status: 'waiting' | 'ongoing' | 'completed'
  startTime?: Date
  endTime?: Date
  roomName?: string
}
```





