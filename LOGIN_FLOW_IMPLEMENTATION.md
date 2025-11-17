# Login Flow with Profile-Based Routing

## Overview
Implemented a smart authentication flow that automatically routes users based on their onboarding status after successful login.

## Architecture

### 1. `/api/me` Endpoint
- **Location**: `app/api/me/route.ts`
- **Purpose**: Fetches the current user's profile from the backend
- **Authentication**: Requires valid NextAuth session
- **Returns**: UserProfile object with `onboardingComplete` flag

**UserProfile Structure**:
```typescript
{
  userId: string;
  email?: string;
  name?: string;
  onboardingComplete: boolean;  // Key flag for routing
  summary?: string;             // Psychographic profile text
  last_updated?: string;
  careerStageUserSelected?: CareerStageUserSelected;  // User's self-selected stage
  resumeSignals?: ResumeSignals;  // Extracted from resume by AI
  careerStage?: CareerStage;      // Final determined stage
}
```

**CareerStage Types**:
- `college` - College student
- `recent_grad` - Recent graduate (0-2 years)
- `early_career` - Early career (2-7 years)
- `mid_career` - Mid-career (7-15 years)
- `senior` - Senior (15+ years)
- `unknown` - Cannot be determined

**Data Source**: Reads from `profile_cache.json` which is populated by `/api/generate-profile`

### 2. `useUserProfile` Hook
- **Location**: `app/hooks/useUserProfile.ts`
- **Purpose**: React hook to fetch and manage user profile state
- **Features**:
  - Only fetches when user is authenticated
  - Provides loading state for smooth UX
  - Returns error state for error handling
  - Includes `refetch()` method to reload profile

**Return Type**:
```typescript
{
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

### 3. `AuthGate` Component
- **Location**: `app/components/AuthGate.tsx`
- **Purpose**: Protected route wrapper that handles authentication and routing logic
- **Integration**: Wraps all pages via `Providers` component

**Routing Logic**:
1. **Public Routes** (`/`): Always accessible, no checks
2. **Auth-Only Routes** (`/onboarding/questions`, `/preview-onboarding`): Require authentication but not onboarding completion
3. **Protected Routes** (all others): Require authentication AND onboarding completion

**Automatic Redirects**:
- Unauthenticated user accessing protected route → redirects to `/`
- Authenticated user with `onboardingComplete: false` → redirects to `/onboarding/questions`
- Authenticated user with `onboardingComplete: true` on onboarding page → redirects to `/dashboard`

**Loading States**:
- Shows spinner while session is loading
- Shows "Loading your profile..." while fetching profile
- Shows "Redirecting to login..." for unauthenticated users

## Flow Diagram

```
User Logs In (Google/Guest)
         ↓
   Session Created
         ↓
   AuthGate Activated
         ↓
   Fetch /api/me
         ↓
    Check Profile
         ↓
   ┌─────────────────┐
   │                 │
   ↓                 ↓
onboardingComplete  onboardingComplete
   = false            = true
   ↓                 ↓
/onboarding      /dashboard
/questions
```

## Implementation Details

### Profile Cache Updates
Modified `/api/generate-profile` to set `onboardingComplete: true` when profile is generated:

```typescript
cache[userId] = {
  profile: fullProfile,
  timestamp: Date.now(),
  inputs: inputHash,
  onboardingComplete: true  // ← New flag
};
```

### Provider Integration
Updated `app/providers.tsx` to wrap all pages with AuthGate:

```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthGate>{children}</AuthGate>
    </SessionProvider>
  );
}
```

## User Experience

### First-Time User Journey
1. User clicks "Sign in with Google" or "Guest"
2. After authentication, sees "Loading your profile..." spinner
3. `/api/me` returns `onboardingComplete: false`
4. Automatically redirected to `/onboarding/questions`
5. User completes questionnaire and generates profile
6. Profile saved with `onboardingComplete: true`
7. User can now access `/dashboard` and all features

### Returning User Journey
1. User signs in
2. Brief loading screen
3. `/api/me` returns `onboardingComplete: true`
4. If on root (`/`), automatically redirected to `/dashboard`
5. If trying to access `/onboarding`, redirected to `/dashboard`
6. Can freely navigate all protected routes

### Guest Mode
Guest users follow the same flow but data is stored with `userId: 'temp-user-id'`

## Files Modified

1. **Created**:
   - `app/api/me/route.ts` - Profile endpoint
   - `app/hooks/useUserProfile.ts` - Profile hook
   - `app/components/AuthGate.tsx` - Route guard
   - `app/components/CareerStageStep.tsx` - Career stage selection UI
   - `app/api/parse-resume/route.ts` - Resume parsing with AI
   - `lib/careerStage.ts` - Career stage classification logic

2. **Modified**:
   - `app/providers.tsx` - Added AuthGate wrapper
   - `app/api/generate-profile/route.ts` - Added career stage detection and resume parsing
   - `app/preview-onboarding/page.tsx` - Added career stage question step
   - `profile_cache.json` - Now includes career stage fields

## Testing

To test the flow:

1. **Clear existing profile**: Delete your entry in `profile_cache.json`
2. **Sign out** if already signed in
3. **Sign in** with Google or Guest
4. **Verify**: Should redirect to `/onboarding/questions`
5. **Complete onboarding** and generate profile
6. **Verify**: Should now be able to access `/dashboard`
7. **Sign out and sign in again**
8. **Verify**: Should redirect directly to `/dashboard`

## Error Handling

- Network errors fetching profile → Redirect to onboarding (safe fallback)
- 401 Unauthorized → Redirect to home page
- Profile data corrupted → User sees error but can retry
- Session expired → User redirected to login

## Future Enhancements

1. ~~Add more granular onboarding steps (resume upload, LinkedIn import)~~ ✅ Complete
2. ~~Track onboarding progress percentage~~ ✅ Complete
3. ~~Allow partial profile completion~~ ✅ Complete
4. ~~Add profile update/refresh functionality~~ ✅ Complete
5. ~~Implement profile versioning~~ ✅ Complete
6. ~~Add career stage detection system~~ ✅ Complete
7. Wire Azure OpenAI to /api/career-direction, /api/resume-intelligence, /api/job-match

## Career Stage Detection System

### Overview
The career stage detection system automatically infers a user's career level using multiple signals:
1. **User Self-Selection** (Primary) - Direct user input
2. **Resume Parsing** (Secondary) - AI-extracted signals from resume
3. **Heuristics** (Fallback) - Rule-based inference from available data

### Architecture

**1. Career Stage Types** (`lib/careerStage.ts`):
```typescript
type CareerStage = 'college' | 'recent_grad' | 'early_career' | 'mid_career' | 'senior' | 'unknown';
type CareerStageUserSelected = CareerStage | 'prefer_not_to_say';
```

**2. Resume Signal Extraction** (`/api/parse-resume`):
Uses Azure OpenAI to extract:
- Years of experience
- Role count
- Job titles
- Graduation year
- Seniority keywords (senior, manager, director, etc.)

**3. Classification Logic** (`determineCareerStage()`):
Priority order:
1. User's explicit selection (if not "prefer not to say")
2. Years of experience from resume
3. Role count from resume
4. Job titles analysis
5. Graduation year calculation
6. Fallback to 'unknown'

### UI Flow

**Onboarding Integration**:
1. User uploads resume/LinkedIn (optional)
2. Career stage question appears as a card in onboarding
3. User selects from 6 options (or "Prefer not to say")
4. Selection saved to `localStorage` immediately
5. On profile generation:
   - Resume parsed for career signals
   - Career stage determined from user selection + resume signals
   - Saved to `profile_cache.json`

**Career Stage Question** (`CareerStageStep.tsx`):
- Radio button UI with 6 options
- Visual feedback on selection
- Confirmation message showing selected stage
- Auto-closes modal after selection

### Data Flow

```
User completes onboarding
         ↓
Resume uploaded → /api/parse-resume
         ↓
Extract ResumeSignals
         ↓
User selects career stage → localStorage
         ↓
Click "Generate Profile"
         ↓
/api/generate-profile receives:
  - careerStageUserSelected
  - resume text
         ↓
extractCareerSignalsFromResume(resume)
         ↓
determineCareerStage(userSelected, resumeSignals)
         ↓
Career stage added to Azure OpenAI prompt
         ↓
Save to profile_cache.json:
  - careerStageUserSelected
  - resumeSignals
  - careerStage (final)
```

### Profile Cache Structure

```json
{
  "user@example.com": {
    "profile": "...",
    "timestamp": 1234567890,
    "inputs": "...",
    "onboardingComplete": true,
    "careerStageUserSelected": "early_career",
    "resumeSignals": {
      "yearsExperience": 4,
      "roleCount": 2,
      "titles": ["Software Engineer", "Senior Developer"],
      "graduationYear": 2020,
      "seniorityHints": ["senior"]
    },
    "careerStage": "early_career"
  }
}
```

### API Integration

**Profile Generation** (`/api/generate-profile`):
- Receives `careerStageUserSelected` from client
- Calls `extractCareerSignalsFromResume()` if resume provided
- Calls `determineCareerStage()` with both inputs
- Adds career stage context to Azure OpenAI prompt:
  ```
  CAREER STAGE: early_career
  (User self-identified as: early_career)
  Years of experience: 4
  Number of roles held: 2
  Job titles: Software Engineer, Senior Developer
  ```

**Profile Retrieval** (`/api/me`):
- Returns all career stage fields in UserProfile
- Frontend can display current career stage
- Coaching features can reference `userProfile.careerStage`

### Usage in Coaching Features

All F1 outputs (Career Direction, Resume Intelligence, Job Match) will now reference:
```typescript
userProfile.careerStage // 'early_career', 'mid_career', etc.
```

This enables stage-specific coaching:
- **College**: Focus on internships, skill building
- **Recent Grad**: Entry-level positions, career exploration
- **Early Career**: Skill development, first promotions
- **Mid Career**: Leadership opportunities, specialization
- **Senior**: Executive roles, mentorship, legacy
