import fs from 'fs';
const file = 'src/components/tools/ClassroomToolsHub.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import
content = content.replace(
  /import \{ ScoreBookGenerator \} from '\.\/ScoreBookGenerator';/,
  `import { ScoreBookGenerator } from './ScoreBookGenerator';\nimport { BookBorrowingGenerator } from './BookBorrowingGenerator';\nimport { Library } from 'lucide-react';`
);

// 2. Add 'borrowing' to types
content = content.replace(/'score_book';/g, `'score_book' | 'borrowing';`);
content = content.replace(/'score_book'\)/g, `'score_book' | 'borrowing'\)`);

// 3. Add button in the top navigation area (after Score Book)
const scoreButtonRegex = /<button[\s\S]*?onClick=\{\(\) => setActiveTab\('score_book'\)\}[\s\S]*?<\/button>/m;
const scoreButtonMatch = content.match(scoreButtonRegex);

if (scoreButtonMatch) {
  const borrowingButton = `
          <button
            onClick={() => setActiveTab('borrowing')}
            className={\`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 \${
              activeTab === 'borrowing'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }\`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'បញ្ជីខ្ចីសៀវភៅ' : 'Borrowing List'}</span>
          </button>`;
  
  content = content.replace(scoreButtonRegex, scoreButtonMatch[0] + borrowingButton);
}

// 4. Add the component render at the bottom
content = content.replace(
  /\{activeTab === 'score_book' && <ScoreBookGenerator \/>\}/,
  `{activeTab === 'score_book' && <ScoreBookGenerator />}\n      {activeTab === 'borrowing' && <BookBorrowingGenerator />}`
);

fs.writeFileSync(file, content, 'utf8');
