// Quick test script for the job-from-url endpoint
async function testFetchJob() {
  const urls = [
    'https://www.google.com/about/careers/applications/jobs/results/80548679106077382-software-engineer-ii-full-stack-youtube-channel-memberships',
    'https://jobs.careers.microsoft.com/global/en/job/MIC141105/Senior-Product-Manager%2C-Copilot-AI'
  ];

  for (const url of urls) {
    console.log('\n' + '='.repeat(80));
    console.log('Testing URL:', url);
    console.log('='.repeat(80));

    try {
      const response = await fetch('http://localhost:3000/api/job-from-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ SUCCESS');
        console.log('Job Title:', data.jobTitle);
        console.log('Company:', data.companyName);
        console.log('Description Length:', data.jobDescription?.length);
        console.log('Description Preview:', data.jobDescription?.substring(0, 200) + '...');
      } else {
        console.log('❌ ERROR:', data.error);
      }
    } catch (error) {
      console.log('❌ FETCH ERROR:', error.message);
    }
  }
}

testFetchJob();
