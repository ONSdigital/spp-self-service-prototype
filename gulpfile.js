import fs from 'fs';
import path from 'path';

// Auto-patch install-render-helpers.js to support dynamic relative state resolution
const helperFilePath = path.resolve('node_modules/@ons/prototype-kit/lib/rendering/install-render-helpers.js');
if (fs.existsSync(helperFilePath)) {
  let content = fs.readFileSync(helperFilePath, 'utf8');
  if (!content.includes('pageInfo')) {
    content = content.replace(
      /function getState\(\) \{[\s\S]*?return \{\};[\s\S]*?\}/,
      `function getState(pageInfo) {
  let prototypeFolder = 'self-service';
  if (pageInfo && pageInfo.templatePath) {
    const match = pageInfo.templatePath.match(/src\\/prototypes\\/([^/]+)/);
    if (match) {
      prototypeFolder = match[1];
    }
  }
  const statePath = path.resolve(\`src/prototypes/\${prototypeFolder}/state.json\`);
  if (fs.existsSync(statePath)) {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  }
  return {};
}`
    );
    fs.writeFileSync(helperFilePath, content, 'utf8');
  }
}

import gulp from 'gulp';
import definePrototypeKitGulpTasks from '@ons/prototype-kit/defineGulpTasks.js';

definePrototypeKitGulpTasks(gulp);
  
/* Define specific gulp tasks in this section. Refer to the README file for additional instructions. */ 
/* Below are examples of tasks you can define */

/* Example1: Task to build static files */
// const staticFileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mpeg'];
//   gulp.task('prototype-kit:build-static-files', () => {
//   return gulp
//     .src(`./src/**/*.{${staticFileExtensions.join(',')}}`)
//     .pipe(gulp.dest('./build'));
// });

/* Example2: Task to build user-defined JS files */
//   gulp.task('prototype-kit:build-js', () => {
//   return gulp
//     .src('./src/**/*.js')
//     .pipe(gulp.dest('./build'));
// });

/* Example3: Task to link the JSON file to the autosuggest component locally */
// gulp.task('copy-json-files', () => {
//   return gulp.src('./src/**/**/**/*.json').pipe(gulp.dest('./build'));
//   });
  
//   gulp.task('build-json', gulp.series('copy-json-files'));
