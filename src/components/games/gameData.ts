// Educational Mini-Games Curated Data for Cambodian Primary School (Grades 1 to 6)
// Focus areas: Mathematics (គណិតវិទ្យា) & Khmer Language (ភាសាខ្មែរ)

export interface MathQuestion {
  id: string;
  questionKm: string;
  questionEn: string;
  options: (number | string)[];
  answer: number | string;
  hintKm?: string;
  level: number; // 1 to 6
  categoryKm: string;
}

export interface WordPair {
  id: string;
  type: 'antonym' | 'synonym';
  word1: string;
  word2: string;
  meaningKm: string;
  level: number;
}

export interface SyllableWord {
  id: string;
  targetWord: string;
  parts: string[]; // e.g. ["ក", "្", "រ", "ូ"] or syllables
  hintKm: string;
  level: number;
}

export interface SentenceScramble {
  id: string;
  targetSentence: string;
  scrambledWords: string[];
  level: number;
  topicKm: string;
}

export interface KhmerRiddle {
  id: string;
  riddleKm: string;
  answerKm: string;
  explanationKm: string;
  categoryKm: string;
  difficulty: 'ងាយ' | 'មធ្យម' | 'ល្បងប្រាជ្ញា';
}

export interface WheelCategory {
  id: string;
  titleKm: string;
  titleEn: string;
  color: string;
  icon: string;
  sampleQuestions: {
    qKm: string;
    aKm: string;
    timeSeconds?: number;
  }[];
}

// -------------------------------------------------------------
// 1. KHMER WORD PAIRS (ANTONYMS & SYNONYMS)
// -------------------------------------------------------------
export const KHMER_WORD_PAIRS: WordPair[] = [
  // Antonyms (ពាក្យផ្ទុយ)
  { id: 'ant-1', type: 'antonym', word1: 'ខ្ពស់', word2: 'ទាប', meaningKm: 'កម្ពស់ (High vs Low)', level: 1 },
  { id: 'ant-2', type: 'antonym', word1: 'ធំ', word2: 'តូច', meaningKm: 'ទំហំ (Big vs Small)', level: 1 },
  { id: 'ant-3', type: 'antonym', word1: 'ខ្ជិល', word2: 'ឧស្សាហ៍', meaningKm: 'ចរិត (Lazy vs Diligent)', level: 2 },
  { id: 'ant-4', type: 'antonym', word1: 'ឆ្ងាយ', word2: 'ជិត', meaningKm: 'ចម្ងាយ (Far vs Near)', level: 1 },
  { id: 'ant-5', type: 'antonym', word1: 'ស្អាត', word2: 'កខ្វក់', meaningKm: 'អនាម័យ (Clean vs Dirty)', level: 2 },
  { id: 'ant-6', type: 'antonym', word1: 'ព្រឹក', word2: 'ល្ងាច', meaningKm: 'ពេលវេលា (Morning vs Evening)', level: 1 },
  { id: 'ant-7', type: 'antonym', word1: 'ស', word2: 'ខ្មៅ', meaningKm: 'ពណ៌ (White vs Black)', level: 1 },
  { id: 'ant-8', type: 'antonym', word1: 'ស្រួល', word2: 'លំបាក', meaningKm: 'កិច្ចការ (Easy vs Hard)', level: 2 },
  { id: 'ant-9', type: 'antonym', word1: 'ផ្អែម', word2: 'ល្វីង', meaningKm: 'រសជាតិ (Sweet vs Bitter)', level: 2 },
  { id: 'ant-10', type: 'antonym', word1: 'ក្មេង', word2: 'ចាស់', meaningKm: 'វ័យ (Young vs Old)', level: 1 },
  { id: 'ant-11', type: 'antonym', word1: 'រហ័ស', word2: 'យឺត', meaningKm: 'ល្បឿន (Fast vs Slow)', level: 2 },
  { id: 'ant-12', type: 'antonym', word1: 'ត្រជាក់', word2: 'ក្តៅ', meaningKm: 'ធាតុអាកាស (Cold vs Hot)', level: 1 },
  { id: 'ant-13', type: 'antonym', word1: 'ច្រើន', word2: 'តិច', meaningKm: 'បរិមាណ (Many vs Few)', level: 1 },
  { id: 'ant-14', type: 'antonym', word1: 'អ្នកមាន', word2: 'អ្នកក្រ', meaningKm: 'ទ្រព្យសម្បត្តិ (Rich vs Poor)', level: 3 },
  { id: 'ant-15', type: 'antonym', word1: 'ជោគជ័យ', word2: 'បរាជ័យ', meaningKm: 'លទ្ធផល (Success vs Failure)', level: 4 },

  // Synonyms (ពាក្យន័យដូច)
  { id: 'syn-1', type: 'synonym', word1: 'សប្បាយ', word2: 'រីករាយ', meaningKm: 'អារម្មណ៍រីករាយ (Joyful)', level: 1 },
  { id: 'syn-2', type: 'synonym', word1: 'ព្រៃ', word2: 'អរញ្ញ', meaningKm: 'ព្រៃព្រឹក្សា (Forest)', level: 3 },
  { id: 'syn-3', type: 'synonym', word1: 'មិត្ត', word2: 'សម្លាញ់', meaningKm: 'មិត្តភក្តិ (Friend)', level: 2 },
  { id: 'syn-4', type: 'synonym', word1: 'ផ្ទះ', word2: 'លំនៅឋាន', meaningKm: 'ទីជម្រក (Home/House)', level: 3 },
  { id: 'syn-5', type: 'synonym', word1: 'ព្រះអាទិត្យ', word2: 'ទិនករ', meaningKm: 'ពន្លឺព្រះអាទិត្យ (Sun)', level: 4 },
  { id: 'syn-6', type: 'synonym', word1: 'ម្ដាយ', word2: 'មាតា', meaningKm: 'អ្នកមានគុណ (Mother)', level: 2 },
  { id: 'syn-7', type: 'synonym', word1: 'ឪពុក', word2: 'បិតា', meaningKm: 'អ្នកមានគុណ (Father)', level: 2 },
  { id: 'syn-8', type: 'synonym', word1: 'ទឹក', word2: 'គង្គា', meaningKm: 'វារី/គង្គា (Water)', level: 3 },
  { id: 'syn-9', type: 'synonym', word1: 'ភ្លៀង', word2: 'វស្សា', meaningKm: 'ទឹកភ្លៀងធ្លាក់ (Rain)', level: 4 },
  { id: 'syn-10', type: 'synonym', word1: 'ភ្នែក', word2: 'នេត្រា', meaningKm: 'អវយវៈមើល (Eyes)', level: 4 },
  { id: 'syn-11', type: 'synonym', word1: 'សេះ', word2: 'អស្ស', meaningKm: 'សត្វជំនិះ (Horse)', level: 4 },
  { id: 'syn-12', type: 'synonym', word1: 'ស្ដេច', word2: 'ក្សត្រ', meaningKm: 'ព្រះមហាក្សត្រ (King)', level: 3 },
];

// -------------------------------------------------------------
// 2. KHMER WORD & SYLLABLE BUILDER (ផ្គុំតួអក្សរ & ជើង)
// -------------------------------------------------------------
export const KHMER_SYLLABLE_WORDS: SyllableWord[] = [
  { id: 'syl-1', targetWord: 'សាលា', parts: ['ស', 'ា', 'ល', 'ា'], hintKm: 'កន្លែងដែលកូនៗទៅរៀនសូត្រជារៀងរាល់ថ្ងៃ', level: 1 },
  { id: 'syl-2', targetWord: 'សិស្ស', parts: ['ស', 'ិ', 'ស', '្', 'ស'], hintKm: 'កុមារា និងកុមារីដែលកំពុងរៀនសូត្រ', level: 2 },
  { id: 'syl-3', targetWord: 'គ្រូ', parts: ['គ', '្', 'រ', 'ូ'], hintKm: 'អ្នកផ្ដល់ចំណេះដឹង និងអប់រំទូន្មានសិស្ស', level: 2 },
  { id: 'syl-4', targetWord: 'ខ្មែរ', parts: ['ខ', '្', 'ម', 'ែ', 'រ'], hintKm: 'ជាតិសាសន៍ និងភាសាកំណើតរបស់យើង', level: 2 },
  { id: 'syl-5', targetWord: 'កម្ពុជា', parts: ['ក', '្', 'ម', '្', 'ព', 'ុ', 'ជ', 'ា'], hintKm: 'មាតុភូមិជាទីស្រឡាញ់របស់យើង', level: 3 },
  { id: 'syl-6', targetWord: 'សៀវភៅ', parts: ['ស', 'ៀ', 'វ', 'ភ', 'ៅ'], hintKm: 'សម្ភារៈសិក្សាសម្រាប់កត់ត្រា និងអាន', level: 2 },
  { id: 'syl-7', targetWord: 'បក្សី', parts: ['ប', 'ក', '្', 'ស', 'ី'], hintKm: 'សត្វស្លាបដែលអាចហោះហើរលើអាកាស', level: 3 },
  { id: 'syl-8', targetWord: 'មេឃ', parts: ['ម', 'េ', 'ឃ'], hintKm: 'ផ្ទៃខាងលើដែលមានពពក និងព្រះអាទិត្យ', level: 1 },
  { id: 'syl-9', targetWord: 'កិត្តិយស', parts: ['ក', 'ិ', 'ត', '្', 'ត', 'ិ', 'យ', 'ស'], hintKm: 'តម្លៃ និងភាពថ្លៃថ្នូររបស់មនុស្ស', level: 4 },
  { id: 'syl-10', targetWord: 'មិត្តភក្តិ', parts: ['ម', 'ិ', 'ត', '្', 'ត', 'ភ', 'ក', '្', 'ត', 'ិ'], hintKm: 'អ្នករាប់អានជិតស្និទ្ធជាមួយយើង', level: 3 },
];

// -------------------------------------------------------------
// 3. KHMER SENTENCE SCRAMBLES (រៀបលំដាប់ពាក្យជាល្បះ)
// -------------------------------------------------------------
export const KHMER_SENTENCE_SCRAMBLES: SentenceScramble[] = [
  {
    id: 'sen-1',
    targetSentence: 'សិស្សឧស្សាហ៍ទៅរៀនរាល់ថ្ងៃ',
    scrambledWords: ['រាល់ថ្ងៃ', 'សិស្ស', 'ទៅរៀន', 'ឧស្សាហ៍'],
    level: 1,
    topicKm: 'ការសិក្សា',
  },
  {
    id: 'sen-2',
    targetSentence: 'លោកគ្រូបង្រៀនអក្សរខ្មែរក្នុងថ្នាក់',
    scrambledWords: ['ក្នុងថ្នាក់', 'លោកគ្រូ', 'បង្រៀន', 'អក្សរខ្មែរ'],
    level: 2,
    topicKm: 'គ្រូបង្រៀន',
  },
  {
    id: 'sen-3',
    targetSentence: 'កូនល្អត្រូវស្តាប់ដំបូន្មានឪពុកម្តាយ',
    scrambledWords: ['ឪពុកម្តាយ', 'ត្រូវស្តាប់', 'កូនល្អ', 'ដំបូន្មាន'],
    level: 2,
    topicKm: 'សីលធម៌',
  },
  {
    id: 'sen-4',
    targetSentence: 'យើងស្រឡាញ់ប្រទេសកម្ពុជារបស់យើង',
    scrambledWords: ['ប្រទេសកម្ពុជា', 'យើងស្រឡាញ់', 'របស់យើង'],
    level: 2,
    topicKm: 'ស្នេហាជាតិ',
  },
  {
    id: 'sen-5',
    targetSentence: 'ដើមឈើផ្តល់ម្លប់ត្រជាក់ដល់មនុស្ស',
    scrambledWords: ['ត្រជាក់', 'ដល់មនុស្ស', 'ដើមឈើ', 'ផ្តល់ម្លប់'],
    level: 3,
    topicKm: 'បរិស្ថាន',
  },
  {
    id: 'sen-6',
    targetSentence: 'ការហាត់ប្រាណជួយឱ្យរាងកាយមានសុខភាពល្អ',
    scrambledWords: ['ការហាត់ប្រាណ', 'មានសុខភាពល្អ', 'ជួយឱ្យ', 'រាងកាយ'],
    level: 3,
    topicKm: 'សុខភាព',
  },
  {
    id: 'sen-7',
    targetSentence: 'សៀវភៅជាមិត្តដ៏ល្អបំផុតក្នុងការរៀនសូត្រ',
    scrambledWords: ['ក្នុងការរៀនសូត្រ', 'ជាមិត្តដ៏ល្អបំផុត', 'សៀវភៅ'],
    level: 4,
    topicKm: 'ការអាន',
  },
];

// -------------------------------------------------------------
// 4. KHMER TRADITIONAL RIDDLES (ពាក្យបណ្តៅខ្មែរ)
// -------------------------------------------------------------
export const KHMER_RIDDLES: KhmerRiddle[] = [
  {
    id: 'rid-1',
    riddleKm: 'ដើមស្មើជើងក្អែក មែកស្មើផ្លូវរទេះ ផ្លែស្មើផ្ទះ?',
    answerKm: 'ដើមចេក (កូនចេក មែកធាងចេក ត្រយូងចេក)',
    explanationKm: 'ដើមចេកតូចទាបដូចជើងក្អែក ពេលដុះធំធាងដូចផ្លូវរទេះ ហើយត្រយូងផ្លែធំដូចផ្ទះតូច។',
    categoryKm: 'រុក្ខជាតិ',
    difficulty: 'ងាយ',
  },
  {
    id: 'rid-2',
    riddleKm: 'កើតមកមានពុកចង្ការ ដល់ចាស់ឡើងវិញជ្រុះអស់?',
    answerKm: 'ផ្លែពោត',
    explanationKm: 'ផ្លែពោតនៅខ្ចីមានសរសៃរោមដូចពុកចង្ការ ពេលទុំស្ងួតជ្រុះអស់។',
    categoryKm: 'បន្លែផ្លែឈើ',
    difficulty: 'ងាយ',
  },
  {
    id: 'rid-3',
    riddleKm: 'ទល់មុខគ្នា មិនដែលជួបគ្នា?',
    answerKm: 'ភ្នែកទាំងពីរ',
    explanationKm: 'ភ្នែកទាំងពីរនៅទន្ទឹមគ្នា មើលឃើញទិសជាមួយគ្នា តែមិនដែលបានប៉ះទង្គិចគ្នាឡើយ។',
    categoryKm: 'អវយវៈ',
    difficulty: 'ងាយ',
  },
  {
    id: 'rid-4',
    riddleKm: 'ពេលព្រឹកដើរជើងបួន ថ្ងៃត្រង់ដើរជើងពីរ ពេលល្ងាចដើរជើងបី?',
    answerKm: 'មនុស្ស (ក្មេងវារ ធំដើរ ចាស់ច្រត់ឈើច្រត់)',
    explanationKm: 'ពេលនៅក្មេងវារជើង៤ ពេញវ័យដើរជើង២ ចាស់ជរាច្រត់ឈើច្រត់ជើង៣។',
    categoryKm: 'ទស្សនៈជីវិត',
    difficulty: 'មធ្យម',
  },
  {
    id: 'rid-5',
    riddleKm: 'នៅក្មេងស្លៀកសំពត់បៃតង ចាស់ឡើងស្លៀកសំពត់ក្រហម?',
    answerKm: 'ផ្លែម្ទេស',
    explanationKm: 'ម្ទេសខ្ចីមានពណ៌បៃតង ពេលទុំប្រែជាពណ៌ក្រហមឆ្អៅ។',
    categoryKm: 'បន្លែផ្លែឈើ',
    difficulty: 'ងាយ',
  },
  {
    id: 'rid-6',
    riddleKm: 'ពេលរស់ដេកក្នុងទឹក ពេលងាប់ឡើងលើគោក?',
    answerKm: 'ទូក (ឈើធ្វើទូក)',
    explanationKm: 'កាលទូកនៅជាដើមឈើ ឬទូកកំពុងប្រើជិះលើទឹក ពេលខូចគេស្រង់មកទុកលើគោក។',
    categoryKm: 'វត្ថុប្រើប្រាស់',
    difficulty: 'មធ្យម',
  },
  {
    id: 'rid-7',
    riddleKm: 'មានភ្នែកច្រើន តែគ្មានក្បាល មានសម្បកបន្លា ខាងក្នុងផ្អែមជូរ?',
    answerKm: 'ផ្លែម្នាស់',
    explanationKm: 'ផ្លែម្នាស់មានភ្នែកជុំវិញសម្បក។',
    categoryKm: 'ផ្លែឈើ',
    difficulty: 'ងាយ',
  },
  {
    id: 'rid-8',
    riddleKm: 'កាន់ក្បាលរឹតក ចេញទឹកសស្រាក់?',
    answerKm: 'ដងទឹក ឬកំសៀវចាក់ទឹក',
    explanationKm: 'កាន់ដៃយួរកំសៀវ ហើយចាក់ទឹកចេញពីមាត់កំសៀវ។',
    categoryKm: 'វត្ថុប្រើប្រាស់',
    difficulty: 'មធ្យម',
  },
  {
    id: 'rid-9',
    riddleKm: 'ស៊ីជ្រូកអត់ឆ្អឹង ស៊ីមាន់អត់ស្លាប?',
    answerKm: 'ភ្លើង (អគ្គិភ័យ)',
    explanationKm: 'ភ្លើងឆេះអ្វីៗក៏អស់ មិនសល់ឆ្អឹងឬស្លាបឡើយ។',
    categoryKm: 'ធម្មជាតិ',
    difficulty: 'ល្បងប្រាជ្ញា',
  },
  {
    id: 'rid-10',
    riddleKm: 'កាប់មិនដាច់ ដុតមិនឆេះ?',
    answerKm: 'ស្រមោល (ឬ ទឹក)',
    explanationKm: 'ស្រមោលមនុស្សកាប់មិនដាច់ ដុតមិនឆេះ។',
    categoryKm: 'ធម្មជាតិ',
    difficulty: 'ល្បងប្រាជ្ញា',
  },
  {
    id: 'rid-11',
    riddleKm: 'ចង្កឹះមួយបាច់ កាច់មិនបាក់?',
    answerKm: 'សាមគ្គីភាព',
    explanationKm: 'ចង្កឹះមួយដើមងាយកាច់ តែបើចងជាបាច់ច្រើនដើមកាច់មិនបាក់ ដូចសាមគ្គីភាព។',
    categoryKm: 'អប់រំចិត្ត',
    difficulty: 'មធ្យម',
  },
  {
    id: 'rid-12',
    riddleKm: 'ខ្លួនមូលក្រឡង់ គេទាត់មួយទំហឹងមិនដែលខឹង?',
    answerKm: 'បាល់ (បាល់ទាត់)',
    explanationKm: 'បាល់ទាត់រាងមូល មនុស្សគ្រប់គ្នាទាត់ទៅទាត់មក។',
    categoryKm: 'កីឡា',
    difficulty: 'ងាយ',
  },
];

// -------------------------------------------------------------
// 5. MATH GENERATOR UTILITY (គណិតវិទ្យារហ័ស ថ្នាក់ទី ១ ដល់ ទី ៦)
// -------------------------------------------------------------
export function generateMathQuestion(gradeLevel: number): MathQuestion {
  const qId = 'math-' + Math.random().toString(36).substring(2, 9);
  
  if (gradeLevel <= 2) {
    // Grade 1 - 2: Basic Addition / Subtraction within 10 - 20 & Missing operand
    const isAddition = Math.random() > 0.4;
    const isMissing = Math.random() > 0.6;
    
    if (isMissing) {
      const a = Math.floor(Math.random() * 9) + 1;
      const b = Math.floor(Math.random() * 9) + 1;
      const sum = a + b;
      const options = [b, b + 1, Math.max(1, b - 1), b + 2].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        questionKm: `${a} + ? = ${sum}`,
        questionEn: `${a} + ? = ${sum}`,
        options: Array.from(new Set(options)),
        answer: b,
        hintKm: `គិតថា៖ ពី ${a} រាប់ទៅដល់ ${sum} ត្រូវថែមប៉ុន្មាន?`,
        level: gradeLevel,
        categoryKm: 'បូកដកសាមញ្ញ'
      };
    } else if (isAddition) {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const ans = a + b;
      const options = [ans, ans + 1, Math.max(1, ans - 1), ans + 2].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        questionKm: `${a} + ${b} = ?`,
        questionEn: `${a} + ${b} = ?`,
        options: Array.from(new Set(options)),
        answer: ans,
        level: gradeLevel,
        categoryKm: 'ប្រមាណវិធីបូក'
      };
    } else {
      const a = Math.floor(Math.random() * 10) + 8;
      const b = Math.floor(Math.random() * 7) + 1;
      const ans = a - b;
      const options = [ans, ans + 1, Math.max(0, ans - 1), ans + 2].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        questionKm: `${a} - ${b} = ?`,
        questionEn: `${a} - ${b} = ?`,
        options: Array.from(new Set(options)),
        answer: ans,
        level: gradeLevel,
        categoryKm: 'ប្រមាណវិធីដក'
      };
    }
  } else if (gradeLevel <= 4) {
    // Grade 3 - 4: Multiplication Tables (មេលេខ), Division, and 3-digit ops
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      // Multiplication table (មេលេខ ២ ដល់ ៩)
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 8) + 2;
      const ans = a * b;
      const options = [ans, ans + a, ans - a, ans + 2].filter(n => n > 0).sort(() => Math.random() - 0.5);
      return {
        id: qId,
        questionKm: `${a} × ${b} = ?`,
        questionEn: `${a} × ${b} = ?`,
        options: Array.from(new Set(options)),
        answer: ans,
        hintKm: `គិតមេលេខ ${a} ចំនួន ${b} ដង`,
        level: gradeLevel,
        categoryKm: 'មេគុណ'
      };
    } else if (type === 1) {
      // Division
      const b = Math.floor(Math.random() * 7) + 2;
      const ans = Math.floor(Math.random() * 8) + 2;
      const a = b * ans;
      const options = [ans, ans + 1, Math.max(1, ans - 1), ans + 2].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        questionKm: `${a} ÷ ${b} = ?`,
        questionEn: `${a} ÷ ${b} = ?`,
        options: Array.from(new Set(options)),
        answer: ans,
        hintKm: `តើចំនួនណាគុណនឹង ${b} ស្មើនឹង ${a}?`,
        level: gradeLevel,
        categoryKm: 'ប្រមាណវិធីចែក'
      };
    } else {
      // Quick multi-digit addition
      const a = Math.floor(Math.random() * 40) + 15;
      const b = Math.floor(Math.random() * 35) + 10;
      const ans = a + b;
      const options = [ans, ans + 10, ans - 5, ans + 2].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        questionKm: `${a} + ${b} = ?`,
        questionEn: `${a} + ${b} = ?`,
        options: Array.from(new Set(options)),
        answer: ans,
        level: gradeLevel,
        categoryKm: 'បូកលឿនរហ័ស'
      };
    }
  } else {
    // Grade 5 - 6: Multi-operation (Order of operations, fractions, missing variables)
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      // (a x b) + c
      const a = Math.floor(Math.random() * 6) + 3;
      const b = Math.floor(Math.random() * 6) + 2;
      const c = Math.floor(Math.random() * 15) + 5;
      const ans = (a * b) + c;
      const options = [ans, ans + 5, ans - a, (a + c) * b].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        questionKm: `(${a} × ${b}) + ${c} = ?`,
        questionEn: `(${a} × ${b}) + ${c} = ?`,
        options: Array.from(new Set(options)),
        answer: ans,
        hintKm: 'ធ្វើប្រមាណវិធីគុណក្នុងវង់ក្រចកជាមុនសិន',
        level: gradeLevel,
        categoryKm: 'ប្រមាណវិធីចម្រុះ'
      };
    } else if (type === 1) {
      // Missing variable: a x ? - b = c
      const a = Math.floor(Math.random() * 5) + 2;
      const hidden = Math.floor(Math.random() * 7) + 3;
      const b = Math.floor(Math.random() * 10) + 2;
      const c = (a * hidden) - b;
      const options = [hidden, hidden + 1, Math.max(1, hidden - 1), hidden + 2].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        questionKm: `${a} × ? - ${b} = ${c}`,
        questionEn: `${a} × ? - ${b} = ${c}`,
        options: Array.from(new Set(options)),
        answer: hidden,
        hintKm: `គិតថា៖ ${a} × ? = ${c + b}`,
        level: gradeLevel,
        categoryKm: 'រកតម្លៃមិនស្គាល់'
      };
    } else {
      // Geometry / Mental Math word teaser
      const side = Math.floor(Math.random() * 8) + 3;
      const ans = side * 4;
      const options = [ans, side * side, ans + 4, side * 2].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        questionKm: `ការ៉េមួយមានជ្រុងប្រវែង ${side} ស.ម។ តើបរិមាត្រស្មើប៉ុន្មាន?`,
        questionEn: `A square has side length of ${side} cm. What is its perimeter?`,
        options: Array.from(new Set(options)),
        answer: ans,
        hintKm: 'បរិមាត្រការ៉េ = ជ្រុង × ៤',
        level: gradeLevel,
        categoryKm: 'ធរណីមាត្រ'
      };
    }
  }
}

// -------------------------------------------------------------
// 6. LUCKY WHEEL CATEGORIES & CHALLENGE QUESTIONS
// -------------------------------------------------------------
export const LUCKY_WHEEL_CATEGORIES: WheelCategory[] = [
  {
    id: 'math',
    titleKm: 'គណិតវិទ្យា',
    titleEn: 'Math Challenge',
    color: '#3b82f6', // blue
    icon: 'Calculator',
    sampleQuestions: [
      { qKm: 'តើ ៨ គុណនឹង ៧ ស្មើនឹងប៉ុន្មាន?', aKm: '៥៦', timeSeconds: 20 },
      { qKm: 'មុំកែងមានទំហំប៉ុន្មានដឺក្រេ?', aKm: '៩០ ដឺក្រេ (90°)', timeSeconds: 20 },
      { qKm: 'ដារ៉ាមានឃ្លី ១៥ គ្រាប់ ចែកឱ្យមិត្ត ៣ នាក់ស្មើៗគ្នា។ តើម្នាក់ៗបានប៉ុន្មានគ្រាប់?', aKm: '៥ គ្រាប់ (15 ÷ 3 = 5)', timeSeconds: 25 },
      { qKm: 'តើ ១ ម៉ែត្រ មានប៉ុន្មានសង់ទីម៉ែត្រ?', aKm: '១០០ សង់ទីម៉ែត្រ', timeSeconds: 15 },
    ]
  },
  {
    id: 'khmer',
    titleKm: 'ភាសាខ្មែរ',
    titleEn: 'Khmer Language',
    color: '#10b981', // green
    icon: 'BookOpen',
    sampleQuestions: [
      { qKm: 'តើព្យញ្ជនៈខ្មែរមានទាំងអស់ប៉ុន្មានតួ?', aKm: '៣៣ តួ (ក ដល់ អ)', timeSeconds: 20 },
      { qKm: 'តើពាក្យផ្ទុយនៃពាក្យ "ឧស្សាហ៍" គឺអ្វី?', aKm: 'ខ្ជិល', timeSeconds: 15 },
      { qKm: 'តើស្រៈនិស្ស័យក្នុងភាសាខ្មែរមានប៉ុន្មានតួ?', aKm: '២៣ (ឬ ២៤ ស្រៈ)', timeSeconds: 20 },
      { qKm: 'ចូរប្រាប់ពាក្យន័យដូចនឹងពាក្យ "សប្បាយ"?', aKm: 'រីករាយ, អំណរ, ក្សេមក្សាន្ត', timeSeconds: 20 },
    ]
  },
  {
    id: 'riddle',
    titleKm: 'ពាក្យបណ្តៅ',
    titleEn: 'Riddles',
    color: '#f59e0b', // amber
    icon: 'HelpCircle',
    sampleQuestions: [
      { qKm: 'ដើមស្មើជើងក្អែក មែកស្មើផ្លូវរទេះ ផ្លែស្មើផ្ទះ?', aKm: 'ដើមចេក (ត្រយូងចេក)', timeSeconds: 30 },
      { qKm: 'កើតមកមានពុកចង្ការ ដល់ចាស់ឡើងវិញជ្រុះអស់?', aKm: 'ផ្លែពោត', timeSeconds: 30 },
      { qKm: 'នៅក្មេងស្លៀកសំពត់បៃតង ចាស់ឡើងស្លៀកសំពត់ក្រហម?', aKm: 'ផ្លែម្ទេស', timeSeconds: 25 },
      { qKm: 'ទល់មុខគ្នា មិនដែលជួបគ្នា?', aKm: 'ភ្នែកទាំងពីរ', timeSeconds: 25 },
    ]
  },
  {
    id: 'science',
    titleKm: 'វិទ្យាសាស្ត្រ',
    titleEn: 'Science & Nature',
    color: '#8b5cf6', // purple
    icon: 'Sparkles',
    sampleQuestions: [
      { qKm: 'តើរុក្ខជាតិត្រូវការអ្វីខ្លះដើម្បីធ្វើរស្មីសំយោគ?', aKm: 'ពន្លឺព្រះអាទិត្យ ទឹក និងឧស្ម័នកាបូនិច (CO2)', timeSeconds: 30 },
      { qKm: 'តើទឹកកកប្រែជាទឹកក្នុងសីតុណ្ហភាពប៉ុន្មាន?', aKm: 'លើសពី ០ អង្សាសេ', timeSeconds: 20 },
      { qKm: 'តើភពណាដែលយើងកំពុងរស់នៅ?', aKm: 'ភពផែនដី (Earth)', timeSeconds: 15 },
    ]
  },
  {
    id: 'general',
    titleKm: 'ចំណេះដឹងទូទៅ',
    titleEn: 'General Knowledge',
    color: '#ec4899', // pink
    icon: 'Award',
    sampleQuestions: [
      { qKm: 'តើប្រាសាទអង្គរវត្តស្ថិតនៅក្នុងខេត្តណា?', aKm: 'ខេត្តសៀមរាប', timeSeconds: 20 },
      { qKm: 'តើប្រទេសកម្ពុជាមានព្រំប្រទល់ជាប់នឹងប្រទេសណាខ្លះ?', aKm: 'ថៃ ឡាវ និងវៀតណាម', timeSeconds: 25 },
      { qKm: 'តើទង់ជាតិកម្ពុជាមានពណ៌អ្វីខ្លះ?', aKm: 'ពណ៌ខៀវ និងក្រហម (និងរូបប្រាសាទអង្គរវត្តពណ៌ស)', timeSeconds: 20 },
    ]
  },
  {
    id: 'bonus',
    titleKm: 'សំណាងផ្កាយមាស',
    titleEn: 'Golden Star Bonus',
    color: '#eab308', // yellow
    icon: 'Star',
    sampleQuestions: [
      { qKm: 'ចូរច្រៀងបទចម្រៀងខ្មែរមួយវគ្គ ឬស្មូត្រកំណាព្យ!', aKm: 'បានពិន្ទុរង្វាន់ផ្កាយមាស +២០ ពិន្ទុ!', timeSeconds: 30 },
      { qKm: 'ធ្វើកាយវិការសប្បាយរីករាយដើម្បីលើកទឹកចិត្តមិត្តក្នុងថ្នាក់!', aKm: 'បានពិន្ទុរង្វាន់ផ្កាយមាស +១៥ ពិន្ទុ!', timeSeconds: 20 },
    ]
  }
];
