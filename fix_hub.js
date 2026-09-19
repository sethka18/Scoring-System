const fs = require('fs');

const file = 'src/components/tools/ClassroomToolsHub.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update initial activeTab state type
content = content.replace(
  /const \[activeTab, setActiveTab\] = useState\<'lucky_wheel' \| 'games' \| 'picker' \| 'groups' \| 'timer' \| 'inventory' \| 'attendance'\>\(initialTab\);/,
  `const [activeTab, setActiveTab] = useState<'lucky_wheel' | 'games' | 'picker' | 'groups' | 'timer' | 'inventory' | 'attendance' | 'score_book'>(initialTab);`
);

// 2. Add button to the top navigation
const attendanceNavBtn = `<button
            onClick={() => setActiveTab('attendance')}
            className={\`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 \${
              activeTab === 'attendance'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }\`}
          >
            <BookCheck className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'បញ្ជីហៅឈ្មោះ' : 'Attendance Book'}</span>
          </button>`;

const scoreBookNavBtn = `          <button
            onClick={() => setActiveTab('score_book')}
            className={\`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 \${
              activeTab === 'score_book'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }\`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'បញ្ជីស្រង់ពិន្ទុ' : 'Score Book'}</span>
          </button>`;

content = content.replace(attendanceNavBtn, attendanceNavBtn + '\n' + scoreBookNavBtn);

// 3. Add component render
const attendanceRender = `{activeTab === 'attendance' && <AttendanceBookGenerator />}`;
const scoreBookRender = `{activeTab === 'score_book' && <ScoreBookGenerator />}`;

content = content.replace(attendanceRender, attendanceRender + '\n      ' + scoreBookRender);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed hub');
