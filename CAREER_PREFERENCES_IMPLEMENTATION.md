# Career Preferences Flow Implementation

## Overview
Implemented a comprehensive career preferences flow on the `/career-map` page with stage-aware questions and a modern UI.

## What Was Built

### 1. Data Models (Extended)
**Location**: `lib/careerStage.ts`
- Added `CareerPreferences` interface with 5 fields:
  - `energizingWork: string[]` - Multi-select tags for work that energizes
  - `avoidWork: string[]` - Multi-select tags for work to avoid
  - `environments: string[]` - Multi-select tags for preferred environments
  - `peopleVsIC: 'ic' | 'mix' | 'lead' | null` - Work style preference
  - `changeAppetite: 'stay_close' | 'pivot' | 'big_shift' | null` - Change tolerance

**Locations**: `app/hooks/useUserProfile.ts` and `app/api/me/route.ts`
- Extended `UserProfile` interface with:
  - `careerPreferences?: CareerPreferences`
  - `careerPreferencesCompleted?: boolean`

### 2. API Route
**Location**: `app/api/career-preferences/route.ts`
- POST endpoint that accepts `{ careerPreferences: CareerPreferences }`
- Updates user profile in `profile_cache.json`
- Sets `careerPreferencesCompleted = true`
- Returns updated profile data

### 3. Career Preferences Form Component
**Location**: `app/components/CareerPreferencesForm.tsx`
- Clean, modern multi-step form with 5 questions
- **Stage-aware Q1**: "What types of work energize you?"
  - Different options for each career stage (college, recent_grad, early_career, mid_career, senior, unknown)
  - College students see: "Learning new technologies", "Building projects from scratch", etc.
  - Senior professionals see: "Setting technical vision", "Building organizations", etc.
- **Q2**: "What would you prefer to avoid?" (12 universal options)
- **Q3**: "What work environments appeal to you?" (12 environment types)
- **Q4**: "How do you prefer to work?" (IC / Mix / Leadership)
- **Q5**: "How much change are you open to?" (Stay close / Pivot / Big shift)

**UI Features**:
- Multi-select checkboxes with visual feedback
- Color-coded sections (green for energizing, red for avoid, blue for environments)
- Radio buttons for single-select questions
- Form validation (all fields required)
- Pre-fills with existing preferences when updating
- Cancel button (only shown when updating)

### 4. Career Map Page Flow
**Location**: `app/career-map/page.tsx`

**Behavior**:
- **First-time visitor** (no preferences): Shows `CareerPreferencesForm`
- **After completing preferences**: Shows placeholder "Career Direction Map Coming Soon" with:
  - Summary of saved preferences
  - "Update my preferences" button
- **Clicking "Update my preferences"**: Re-opens form with pre-filled answers

**States**:
- Loading state while fetching user profile
- No profile redirect to onboarding
- Preferences form (with stage-aware questions)
- Career map view (placeholder with saved preferences summary)
- Saving overlay during API call

## User Flow

1. User visits `/career-map`
2. System checks `userProfile.careerPreferencesCompleted`:
   - If `false` or missing → Show preferences form
   - If `true` → Show career map view with "Update preferences" button
3. User fills out 5 questions (stage-aware options for Q1)
4. Clicks "Save Preferences" → POST to `/api/career-preferences`
5. API updates `profile_cache.json`:
   ```json
   {
     "temp-user-id": {
       "careerPreferences": {
         "energizingWork": ["..."],
         "avoidWork": ["..."],
         "environments": ["..."],
         "peopleVsIC": "mix",
         "changeAppetite": "pivot"
       },
       "careerPreferencesCompleted": true,
       "last_updated": "2025-11-17T..."
     }
   }
   ```
6. Page refreshes profile and shows career map view
7. User can click "Update my preferences" to modify answers

## Stage-Aware Questions

### College Student Options
- Learning new technologies
- Building projects from scratch
- Working with peers on team projects
- Solving complex problems
- Exploring different career paths
- Participating in hackathons
- Contributing to open source
- Mentorship and guidance

### Recent Graduate Options
- Gaining hands-on experience
- Building real products
- Learning from senior colleagues
- Taking on challenging tasks
- Growing my technical skills
- Making an impact
- Working on innovative projects
- Collaborating with cross-functional teams

### Early Career Options
- Deepening technical expertise
- Taking ownership of projects
- Mentoring junior colleagues
- Driving product features
- Cross-functional collaboration
- Learning new domains
- Solving complex technical challenges
- Building scalable systems

### Mid-Career Options
- Leading technical initiatives
- Architecting complex systems
- Mentoring and developing others
- Influencing product strategy
- Cross-org collaboration
- Driving innovation
- Building high-performing teams
- Solving business-critical problems

### Senior Professional Options
- Setting technical vision and strategy
- Building and scaling organizations
- Influencing company direction
- Developing future leaders
- Solving industry-level challenges
- Driving cultural change
- Creating lasting impact
- Strategic partnerships

## Files Created/Modified

### Created
1. `app/api/career-preferences/route.ts` - API endpoint (76 lines)
2. `app/components/CareerPreferencesForm.tsx` - Form component (431 lines)

### Modified
1. `lib/careerStage.ts` - Added CareerPreferences interface
2. `app/hooks/useUserProfile.ts` - Extended UserProfile interface
3. `app/api/me/route.ts` - Return career preferences fields
4. `app/career-map/page.tsx` - Integrated preferences flow (replaced old logic)

## Testing

To test the implementation:

1. Visit http://localhost:3003/career-map
2. Should see preferences form with stage-specific questions
3. Fill out all 5 questions:
   - Select multiple energizing work items
   - Select multiple avoid items
   - Select multiple environments
   - Choose a work style (IC/Mix/Lead)
   - Choose change appetite
4. Click "Save Preferences"
5. Should see loading overlay, then career map placeholder
6. Verify preferences are shown in summary
7. Click "Update my preferences"
8. Form should pre-fill with previous answers
9. Modify answers and save again
10. Verify changes are reflected

## Next Steps

Ready for the next set of instructions to:
- Build the actual Career Direction Map visualization
- Generate AI-powered career path recommendations based on preferences
- Integrate with the existing career recommendations system
- Add analytics and tracking
