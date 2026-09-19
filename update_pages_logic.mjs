import fs from 'fs';

const file = 'src/components/tools/ScoreBookGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldLogicRegex = /const months = Array\.from\(\{ length: monthCount \}\)[\s\S]*?\}\s*\];/m;

const newLogic = `const pages: any[] = [];
  for (let i = 0; i < monthCount; i++) {
    const date = new Date(startYear, startMonth + i, 1);
    const monthIndex = date.getMonth();
    
    // Skip March (2), April (3), August (7)
    if (monthIndex === 2 || monthIndex === 3 || monthIndex === 7) {
      continue;
    }

    pages.push({
      type: 'month',
      month: monthIndex,
      year: date.getFullYear(),
      title: 'តារាងស្រង់ពិន្ទុប្រចាំខែ',
      periodLabel: KHMER_MONTHS[monthIndex],
      periodPrefix: 'ប្រចាំខែ '
    });

    // Insert Semester 1 after February (1)
    if (monthIndex === 1) {
      pages.push({
        type: 'semester',
        month: -1,
        year: -1,
        title: 'តារាងស្រង់ពិន្ទុប្រចាំឆមាសទី១',
        periodLabel: '១',
        periodPrefix: 'ប្រចាំឆមាសទី '
      });
    }

    // Insert Semester 2 after June (5)
    if (monthIndex === 5) {
      pages.push({
        type: 'semester',
        month: -1,
        year: -1,
        title: 'តារាងស្រង់ពិន្ទុប្រចាំឆមាសទី២',
        periodLabel: '២',
        periodPrefix: 'ប្រចាំឆមាសទី '
      });
    }
  }`;

if (oldLogicRegex.test(content)) {
  content = content.replace(oldLogicRegex, newLogic);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated the pages logic.');
} else {
  console.log('Failed to match old logic regex.');
}
