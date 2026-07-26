const fs = require('fs');
const path = require('path');

// Pull credentials from Netlify environment variables
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

if (username && password) {
  // The specific syntax Netlify requires for basic auth
  const headersContent = `/*\n  Basic-Auth: ${username}:${password}\n`;
  
  // Append this to the _headers file in your build directory
  const headersPath = path.join(__dirname, 'build', '_headers');
  fs.writeFileSync(headersPath, headersContent, { flag: 'a' });
  
  console.log('Successfully generated Netlify basic auth headers.');
} else {
  console.log('No credentials found. Skipping basic auth.');
}