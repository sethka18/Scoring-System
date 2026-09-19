import fs from 'fs';
const file = 'src/components/tools/BookBorrowingGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace everything from `const pages = [` to `return (` with a clean version
const regex = /const pages = \[\{ type: 'list'[\s\S]*?(?=return \()/m;
const replacement = `const pages = [{ type: 'list', title: 'បញ្ជីរាយនាមសិស្សខ្ចីសៀវភៅ' }];\n\n  `;
content = content.replace(regex, replacement);

fs.writeFileSync(file, content, 'utf8');
