import fs from 'fs';

const file = 'src/components/tools/ScoreBookGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetOld = `    // Insert Semester 2 after June (5)
    if (monthIndex === 5) {`;

const targetNew = `    // Insert Semester 2 after July (6)
    if (monthIndex === 6) {`;

if (content.includes(targetOld)) {
  content = content.replace(targetOld, targetNew);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully moved Semester 2 after July.');
} else {
  console.log('Failed to match the exact string, trying a more robust regex.');
  
  const regex = /\/\/ Insert Semester 2 after June \(5\)\s*if \(monthIndex === 5\) \{/g;
  if (regex.test(content)) {
      content = content.replace(regex, `// Insert Semester 2 after July (6)\n    if (monthIndex === 6) {`);
      fs.writeFileSync(file, content, 'utf8');
      console.log('Successfully moved Semester 2 after July (using regex).');
  } else {
      console.log('Could not find Semester 2 logic.');
  }
}
