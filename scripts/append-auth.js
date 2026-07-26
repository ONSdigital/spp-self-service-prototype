import fs from 'fs';
import path from 'path';

// Only write basic auth if both environment variables are securely set on Netlify
if (process.env.BASIC_AUTH_USER && process.env.BASIC_AUTH_PASS) {
  console.log('Netlify environment variables detected. Appending Basic Authentication headers...');
  const buildDir = path.resolve('build');
  const headersPath = path.join(buildDir, '_headers');
  
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  const content = `\n/*\n  Basic-Auth: ${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASS}\n`;
  fs.appendFileSync(headersPath, content);
  console.log('Basic Authentication headers successfully appended to build/_headers.');
} else {
  console.log('No Netlify environment variables detected. Skipping Basic Authentication headers.');
}
