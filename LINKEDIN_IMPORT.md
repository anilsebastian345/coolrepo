# LinkedIn Import Feature

This feature allows users to import their LinkedIn information with a simple button click.

## How it works:

1. **User clicks "Import my LinkedIn information" button** on the onboarding page
2. **API call** is made to `/api/linkedin-import`
3. **LinkedIn data is fetched** (currently simulated with sample data)
4. **Data is saved** to a text file in the `linkedin_imports/` directory
5. **Form fields are populated** automatically with the imported data

## Current Implementation:

- **Simulated Data**: Currently uses sample LinkedIn profile data
- **Text File Storage**: All imported data is saved to timestamped text files
- **Auto-Population**: Form fields are automatically filled with imported data
- **User Feedback**: Success/error messages shown to user

## File Structure:

```
linkedin_imports/
├── linkedin_profile_2025-10-18T12-30-45-123Z.txt
├── linkedin_profile_2025-10-18T14-15-22-456Z.txt
└── ...
```

## Sample Text File Format:

```
LINKEDIN PROFILE DATA
====================

Name: John Doe
Headline: Senior Software Engineer at Tech Company
Location: San Francisco, CA
Industry: Technology

SUMMARY:
Experienced software engineer with 8+ years in full-stack development...

EXPERIENCE:
Senior Software Engineer at Tech Company (2021 - Present)
Led development of microservices architecture serving 1M+ users...

EDUCATION:
Bachelor of Science in Computer Science from University of Technology (2014 - 2018)

SKILLS:
JavaScript, React, Node.js, Python, AWS, Docker, Kubernetes

RECOMMENDATIONS:
"John is an exceptional engineer..." - Jane Smith, Engineering Manager

Imported on: 2025-10-18T12:30:45.123Z
```

## Next Steps (To implement real LinkedIn import):

1. **Set up LinkedIn OAuth** for user authentication
2. **Configure LinkedIn API access** to fetch real profile data
3. **Replace sample data** with actual API calls
4. **Add error handling** for API failures
5. **Implement data validation** and sanitization

## Benefits of this approach:

- ✅ **Simple user experience** - just one button click
- ✅ **Data persistence** - all imports saved to files
- ✅ **Easy debugging** - readable text files for troubleshooting
- ✅ **No complex OAuth setup** required initially
- ✅ **Gradual enhancement** - can add real API later

## Usage:

1. Navigate to `/onboarding/linkedin`
2. Click "Import my LinkedIn information"
3. Form fields will be populated automatically
4. Check `linkedin_imports/` directory for saved data