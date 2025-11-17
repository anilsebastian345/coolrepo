# Career Stage Detection - Testing Guide

## Test Scenarios

### Scenario 1: User Selects Stage + Has Resume
**Expected**: User selection takes priority

1. Upload resume with 10 years experience
2. Select "Recent graduate (0–2 years)"
3. Generate profile
4. **Expected Result**: `careerStage: "recent_grad"` (user selection wins)

### Scenario 2: User Selects "Prefer not to say" + Has Resume
**Expected**: Resume signals determine stage

1. Upload resume with:
   ```
   Senior Software Engineer (2015-2020)
   Staff Engineer (2020-2023)
   Engineering Manager (2023-present)
   ```
2. Select "Prefer not to say"
3. Generate profile
4. **Expected Result**: 
   - `resumeSignals.yearsExperience: ~8-10`
   - `careerStage: "mid_career"` or `"senior"`

### Scenario 3: No Resume, User Selects Stage
**Expected**: User selection used, empty resume signals

1. Don't upload resume
2. Select "Mid-career (7–15 years)"
3. Generate profile
4. **Expected Result**:
   - `careerStage: "mid_career"`
   - `resumeSignals` all null/empty

### Scenario 4: No Resume, "Prefer not to say"
**Expected**: Fallback to 'unknown'

1. Don't upload resume
2. Select "Prefer not to say"
3. Generate profile
4. **Expected Result**: `careerStage: "unknown"`

### Scenario 5: Resume-Only Inference (College Student)
**Expected**: Detect from internship keywords

1. Upload resume:
   ```
   Summer Intern at Amazon (Jun 2024 - Aug 2024)
   Research Assistant (Jan 2023 - Present)
   Education: Computer Science (Expected 2025)
   ```
2. Select "Prefer not to say"
3. **Expected Result**: `careerStage: "college"`

### Scenario 6: Resume-Only Inference (Senior Professional)
**Expected**: Detect from titles and experience

1. Upload resume:
   ```
   VP of Engineering, Startup Inc (2020-present)
   Director of Engineering, BigCo (2015-2020)
   Senior Manager, TechCorp (2010-2015)
   Education: MBA 2010, BS 2005
   ```
2. Select "Prefer not to say"
3. **Expected Result**: 
   - `yearsExperience: 15-20`
   - `seniorityHints: ["vp", "director", "senior", "manager"]`
   - `careerStage: "senior"`

## Automated Test Script

### PowerShell Test Runner

```powershell
# Test 1: Check API endpoint exists
Write-Host "Testing /api/parse-resume..." -ForegroundColor Cyan
$testResume = @"
John Doe
Senior Software Engineer at Microsoft (2018-2022)
Lead Developer at Amazon (2022-present)
BS Computer Science, 2018
"@

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/parse-resume" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{resumeText = $testResume} | ConvertTo-Json)

Write-Host "Resume Signals:" -ForegroundColor Green
$response.signals | ConvertTo-Json -Depth 5

# Test 2: Check career stage component loads
Write-Host "`nTesting CareerStageStep component..." -ForegroundColor Cyan
$html = Invoke-WebRequest -Uri "http://localhost:3001/preview-onboarding"
if ($html.Content -match "career-stage") {
    Write-Host "✓ Career stage UI found in onboarding" -ForegroundColor Green
} else {
    Write-Host "✗ Career stage UI not found" -ForegroundColor Red
}

# Test 3: Check profile cache structure
Write-Host "`nChecking profile_cache.json structure..." -ForegroundColor Cyan
$cache = Get-Content "profile_cache.json" | ConvertFrom-Json
$tempUser = $cache.'temp-user-id'

if ($tempUser.careerStage) {
    Write-Host "✓ Career stage found: $($tempUser.careerStage)" -ForegroundColor Green
} else {
    Write-Host "⚠ No career stage in cache (expected if no profile generated yet)" -ForegroundColor Yellow
}

Write-Host "`nAll tests complete!" -ForegroundColor Green
```

### Running the PowerShell Tests

Save as `test-career-stage.ps1` and run:
```powershell
cd C:\Users\seanil\sage-aicoach
.\test-career-stage.ps1
```

## Manual UI Test Checklist

- [ ] Career stage card appears in onboarding
- [ ] Clicking card opens modal
- [ ] All 6 options are visible and styled correctly
- [ ] Radio buttons work (only one selectable)
- [ ] Selection shows confirmation message
- [ ] Modal closes after selection
- [ ] Card shows green checkmark after selection
- [ ] Selection persists after page refresh (localStorage)
- [ ] Generate profile includes career stage in prompt
- [ ] Profile cache saves all career fields
- [ ] `/api/me` returns career stage fields
- [ ] Dashboard can access `userProfile.careerStage`

## Edge Cases to Test

### 1. **Invalid Resume Text**
- Upload gibberish or very short text
- **Expected**: `extractCareerSignalsFromResume` returns empty signals safely

### 2. **Very Long Resume**
- Upload 10+ page resume
- **Expected**: AI parsing still works, may take longer

### 3. **Resume Without Dates**
- Upload resume with no date information
- **Expected**: `yearsExperience: null`, fallback to other signals

### 4. **Ambiguous Titles**
- "Consultant" (could be junior or senior)
- **Expected**: Uses context from other fields

### 5. **Career Change Resume**
- 15 years in finance, 1 year in tech
- **Expected**: Uses total years (15), not tech-specific

## Debugging Tips

### Check Browser Console
```javascript
// Check localStorage
localStorage.getItem('onboarding_career_stage')

// Check if profile includes career stage
fetch('/api/me')
  .then(r => r.json())
  .then(d => console.log('Career Stage:', d.careerStage))
```

### Check Server Logs
Look for:
```
Parsing resume for career signals...
Resume signals extracted: { yearsExperience: 4, ... }
Career stage determined: early_career from user selection: early_career
```

### Inspect Network Tab
- POST to `/api/generate-profile` should include `careerStageUserSelected`
- Response should include career context in the prompt

## Integration Test: End-to-End Flow

**Complete User Journey** (10 minutes):

1. Clear all data:
   ```powershell
   # Clear localStorage (in browser console)
   localStorage.clear()
   
   # Clear profile cache
   Set-Content profile_cache.json "{}"
   ```

2. Sign in as guest
3. Upload resume with clear experience level
4. Click career stage, select a level
5. Answer some questions
6. Generate profile
7. Verify redirect to dashboard
8. Check dashboard shows career-appropriate content
9. Open browser DevTools > Application > Storage > Local Storage
   - Should see `onboarding_career_stage` saved

10. Check profile cache:
    ```powershell
    Get-Content profile_cache.json | ConvertFrom-Json | 
      Select-Object -ExpandProperty 'temp-user-id' | 
      Select-Object careerStage, careerStageUserSelected, resumeSignals
    ```

## Expected Console Output

When generating profile, you should see:
```
Parsing resume for career signals...
Resume signals extracted: {
  yearsExperience: 4,
  roleCount: 2,
  titles: ['Software Engineer', 'Senior Developer'],
  graduationYear: 2020,
  seniorityHints: ['senior']
}
Career stage determined: early_career from user selection: early_career
Generated new profile for user: temp-user-id
```

## Success Criteria

✅ **All must pass**:
- [ ] Career stage modal opens and closes correctly
- [ ] User selection saves to localStorage
- [ ] Resume parsing extracts signals correctly
- [ ] `determineCareerStage()` returns correct stage
- [ ] Profile cache includes all career fields
- [ ] `/api/me` returns career stage
- [ ] No TypeScript errors
- [ ] No runtime errors in console
- [ ] Page redirects to dashboard after generation
- [ ] Career stage persists across sessions

## Performance Checks

- Resume parsing should complete in < 5 seconds
- Modal should open instantly (no lag)
- Profile generation should include career context without significant delay
- localStorage reads/writes should be instant

---

**Quick Test Command** (run in PowerShell from project root):
```powershell
# Start dev server (if not running)
npm run dev

# In another terminal, test the API
$testData = @{resumeText = "Software Engineer (2020-present), BS CS 2020"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/parse-resume" -Method POST -ContentType "application/json" -Body $testData | ConvertTo-Json -Depth 5
```
