import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

// Lazy initialization of Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Fallback high-quality curriculum questions generator
function generateCurriculumFallbackQuestions(topic: string, grade: number, difficulty: 'easy' | 'medium' | 'hard', subjectId: string) {
  const diffLabel = difficulty === 'easy' ? 'ងាយ (មូលដ្ឋាន)' : difficulty === 'hard' ? 'លំបាក (ពង្រឹងសមត្ថភាព)' : 'មធ្យម (ស្តង់ដារ)';
  const questions = [];

  // Determine subject name in Khmer
  const subjectMap: Record<string, string> = {
    sub_math: 'គណិតវិទ្យា',
    sub_khmer: 'ភាសាខ្មែរ',
    sub_science: 'វិទ្យាសាស្ត្រ',
    sub_social: 'ការសិក្សាសង្គម',
    sub_english: 'ភាសាអង់គ្លេស'
  };
  const subjectName = subjectMap[subjectId] || 'ចំណេះដឹងទូទៅ';

  for (let i = 1; i <= 10; i++) {
    if (subjectId === 'sub_math' || topic.includes('គណិត') || topic.includes('បូក') || topic.includes('ដក') || topic.includes('គុណ') || topic.includes('ចែក') || topic.includes('ប្រភាគ') || topic.includes('ធរណីមាត្រ')) {
      if (i <= 5) {
        // Multiple choice math question
        const n1 = difficulty === 'easy' ? (i * 3 + grade * 2) : (i * 12 + grade * 15);
        const n2 = difficulty === 'easy' ? (i * 2 + grade) : (i * 7 + grade * 5);
        const ans = n1 + n2;
        questions.push({
          prompt: `សំណួរទី${i}៖ ចូរគណនាតម្លៃនៃកន្សោមលេខ៖ ${n1} + ${n2} = ? (ប្រធានបទ៖ ${topic})`,
          questionType: 'multiple_choice',
          options: [
            `ក. ${ans}`,
            `ខ. ${ans + 2}`,
            `គ. ${ans - 3}`,
            `ឃ. ${ans + 5}`
          ],
          correctAnswer: `ក. ${ans}`,
          explanation: `វិធីគណនា៖ យក ${n1} បូកនឹង ${n2} ឃើញលទ្ធផលស្មើ ${ans}។`,
          points: 1,
          rubricGuide: 'ជ្រើសរើសចម្លើយត្រឹមត្រូវទទួលបាន ១ ពិន្ទុ'
        });
      } else if (i <= 8) {
        // Fill in blank or problem solving
        questions.push({
          prompt: `សំណួរទី${i} (បំពេញចន្លោះ)៖ ក្នុងមេរៀន "${topic}" (ថ្នាក់ទី${grade})៖ ប្រសិនបើយើងមានចំនួនសរុប ${i * 10} ហើយបែងចែកជា ${i > 5 ? 2 : 1} ផ្នែកស្មើៗគ្នា នោះផ្នែកនីមួយៗស្មើនឹង .............?`,
          questionType: 'fill_in_blank',
          options: [],
          correctAnswer: `${(i * 10) / (i > 5 ? 2 : 1)}`,
          explanation: `វិធីគណនា៖ ${(i * 10)} ÷ ${i > 5 ? 2 : 1} = ${(i * 10) / (i > 5 ? 2 : 1)}។`,
          points: 1,
          rubricGuide: 'បំពេញចម្លើយលេខត្រឹមត្រូវទទួលបាន ១ ពិន្ទុ'
        });
      } else {
        // Word problem
        questions.push({
          prompt: `សំណួរទី${i} (ចំណោទ)៖ សិស្សម្នាក់ទិញសៀវភៅសរសេរចំនួន ${i} ក្បាល ដែលក្នុងមួយក្បាលតម្លៃ ${grade * 500} រៀល។ តើសិស្សនោះត្រូវចំណាយប្រាក់សរុបប៉ុន្មានរៀល? (ចូរបង្ហាញរបៀបគិត និងប្រមាណវិធី)`,
          questionType: 'problem_solving',
          options: [],
          correctAnswer: `ប្រាក់ត្រូវចំណាយសរុបគឺ ${i * grade * 500} រៀល`,
          explanation: `ប្រមាណវិធី៖ ${i} × ${grade * 500} = ${i * grade * 500} រៀល។`,
          points: 1,
          rubricGuide: 'សរសេរប្រមាណវិធីត្រឹមត្រូវ (០.៥ពិន្ទុ) + ចម្លើយនិងខ្នាតត្រឹមត្រូវ (០.៥ពិន្ទុ)'
        });
      }
    } else if (subjectId === 'sub_khmer' || topic.includes('ខ្មែរ') || topic.includes('អក្សរ') || topic.includes('វេយ្យាករណ៍') || topic.includes('តែង') || topic.includes('ស្រៈ') || topic.includes('ព្យញ្ជនៈ')) {
      if (i <= 4) {
        questions.push({
          prompt: `សំណួរទី${i}៖ ទាក់ទងនឹង "${topic}" សម្រាប់សិស្សថ្នាក់ទី${grade} តើពាក្យមួយណាដែលសរសេរត្រឹមត្រូវតាមក្បួនអក្ខរាវិរុទ្ធខ្មែរ?`,
          questionType: 'multiple_choice',
          options: [
            'ក. សិក្សា',
            'ខ. សិស្សា',
            'គ. សិក្សារ',
            'ឃ. សិក្សាក់'
          ],
          correctAnswer: 'ក. សិក្សា',
          explanation: 'ពាក្យត្រឹមត្រូវតាមវចនានុក្រមខ្មែរសម្តេចព្រះសង្ឃរាជ ជួន ណាត គឺ "សិក្សា"។',
          points: 1,
          rubricGuide: 'ជ្រើសរើសចម្លើយត្រឹមត្រូវទទួលបាន ១ ពិន្ទុ'
        });
      } else if (i <= 7) {
        questions.push({
          prompt: `សំណួរទី${i}៖ ចូររកន័យដូច ឬបំពេញចន្លោះក្នុងល្បះខាងក្រោមទាក់ទងនឹង "${topic}"៖ "សិស្សល្អត្រូវតែ................រៀនសូត្រឱ្យបានខ្ជាប់ខ្ជួន"។`,
          questionType: 'fill_in_blank',
          options: [],
          correctAnswer: 'ឧស្សាហ៍ព្យាយាម / ខិតខំ',
          explanation: 'បំពេញគុណនាមបង្ហាញពីការតស៊ូព្យាយាមក្នុងការសិក្សា។',
          points: 1,
          rubricGuide: 'បំពេញពាក្យសមស្របនិងមានន័យស្ដាប់បានទទួលបាន ១ ពិន្ទុ'
        });
      } else {
        questions.push({
          prompt: `សំណួរទី${i} (តែងល្បះ / សំណួរខ្លី)៖ ចូរតែងល្បះមួយប្រយោគដែលទាក់ទងនឹងប្រធានបទ "${topic}" ឱ្យមានន័យពេញលេញ (មានប្រធាន កិរិយា និងកម្មបទ)។`,
          questionType: 'short_answer',
          options: [],
          correctAnswer: 'សិស្សានុសិស្សកំពុងខិតខំរៀនសូត្រក្នុងថ្នាក់រៀនដោយយកចិត្តទុកដាក់។',
          explanation: 'ល្បះត្រូវមានធាតុផ្សំគ្រប់គ្រាន់ មិនខុសអក្ខរាវិរុទ្ធ និងត្រូវតាមកម្រិតថ្នាក់ទី' + grade,
          points: 1,
          rubricGuide: 'ល្បះត្រូវវេយ្យាករណ៍ (០.៥ពិន្ទុ) + ត្រឹមត្រូវអក្ខរាវិរុទ្ធ (០.៥ពិន្ទុ)'
        });
      }
    } else {
      // General Science / Social / other subjects
      questions.push({
        prompt: `សំណួរទី${i}៖ ចំពោះប្រធានបទ "${topic}" ថ្នាក់ទី${grade} (${diffLabel})៖ តើចំណុចណាដែលជាគោលការណ៍សំខាន់បំផុត?`,
        questionType: i <= 6 ? 'multiple_choice' : 'short_answer',
        options: i <= 6 ? [
          'ក. ស្វែងយល់ និងអនុវត្តតាមការណែនាំត្រឹមត្រូវ',
          'ខ. មិនយកចិត្តទុកដាក់លើផលប៉ះពាល់',
          'គ. ធ្វើដោយគ្មានការត្រួតពិនិត្យ',
          'ឃ. មើលរំលងវិធានការសុវត្ថិភាព'
        ] : [],
        correctAnswer: i <= 6 ? 'ក. ស្វែងយល់ និងអនុវត្តតាមការណែនាំត្រឹមត្រូវ' : 'ការយល់ដឹងពីសារៈសំខាន់ និងការអនុវត្តជាក់ស្តែងក្នុងជីវភាពរស់នៅ',
        explanation: `ពន្យល់៖ ខ្លឹមសារមេរៀន "${topic}" ផ្តោតសំខាន់លើចំណេះដឹងមូលដ្ឋាន និងការអនុវត្តជាក់ស្តែងសម្រាប់កុមារ។`,
        points: 1,
        rubricGuide: 'ឆ្លើយបានត្រឹមត្រូវនិងក្បោះក្បាយទទួលបាន ១ ពិន្ទុ'
      });
    }
  }

  return {
    examTitle: `វិញ្ញាសាតេស្តសមត្ថភាពរហ័ស មុខវិជ្ជា${subjectName} ថ្នាក់ទី${grade} - ប្រធានបទ៖ ${topic}`,
    subjectId,
    subjectNameKm: subjectName,
    topic,
    grade,
    difficulty,
    instructions: 'សិស្សត្រូវអានសំណួរនីមួយៗឱ្យបានច្បាស់លាស់ និងសរសេរចម្លើយលើសន្លឹកកិច្ចការនេះឱ្យបានត្រឹមត្រូវ និងស្អាតបាត។',
    questions
  };
}

async function startServer() {
  const app = express();

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString() 
    });
  });

  // AI Quick Exam Generator Endpoint
  app.post('/api/generate-exam', async (req, res) => {
    const { 
      topic, 
      grade = 4, 
      difficulty = 'medium', 
      subjectId = 'sub_math',
      totalScore = 10,
      schoolName = 'សាលាបឋមសិក្សាគំរូ',
      academicYear = '២០២៥ - ២០២៦'
    } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'ប្រធានបទ (topic) មិនអាចទទេបានឡើយ' });
      return;
    }

    const cleanTopic = topic.trim();
    const parsedGrade = Number(grade) || 4;
    const cleanDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
    const cleanSubjectId = subjectId || 'sub_math';

    // If no API key is set, use the robust pedagogical fallback
    if (!process.env.GEMINI_API_KEY) {
      console.log('No GEMINI_API_KEY found, generating authentic curriculum questions with fallback generator...');
      const fallbackResult = generateCurriculumFallbackQuestions(cleanTopic, parsedGrade, cleanDifficulty, cleanSubjectId);
      res.json({
        ...fallbackResult,
        isAiGenerated: false,
        source: 'curriculum_engine'
      });
      return;
    }

    try {
      const ai = getAI();
      const prompt = `You are a distinguished primary school curriculum developer and master teacher in Cambodia strictly adhering to the official Ministry of Education, Youth and Sport (MoEYS / ក្រសួងអប់រំ យុវជន និងកីឡា) curriculum standards.

Create an official, pedagogically sound, 10-QUESTION QUIZ / EXAM PAPER in the KHMER LANGUAGE for primary school students with the following parameters:
- Topic / Lesson: "${cleanTopic}"
- Primary Grade Level: Grade ${parsedGrade} (ថ្នាក់ទី ${parsedGrade} បឋមសិក្សា)
- Difficulty Level: ${cleanDifficulty} (${cleanDifficulty === 'easy' ? 'កម្រិតងាយ - មូលដ្ឋានគ្រឹះ' : cleanDifficulty === 'hard' ? 'កម្រិតលំបាក - ពង្រឹងសមត្ថភាព' : 'កម្រិតមធ្យម - ស្តង់ដារ'})
- Subject Identifier: "${cleanSubjectId}"
- Total Quiz Questions: Exactly 10 questions

REQUIREMENTS:
1. All question prompts, choices, and explanations MUST be written in natural, clear, grammatical Khmer suitable for Grade ${parsedGrade} students.
2. Provide a diverse mix of question types across the 10 questions:
   - 4-5 Multiple Choice questions (ពហុជ្រើសរើស) with 4 realistic options labeled with Khmer letters (ក., ខ., គ., ឃ.).
   - 2-3 Fill in the blank (បំពេញចន្លោះ) questions.
   - 2-3 Problem Solving / Short Answer questions (ចំណោទគណិត / សំណួរខ្លី / តែងល្បះ) with step-by-step solutions.
3. Every question must have:
   - prompt (full Khmer text of the question)
   - questionType ('multiple_choice' | 'fill_in_blank' | 'short_answer' | 'problem_solving' | 'true_false')
   - options (array of 4 Khmer choices if multiple_choice, empty array otherwise)
   - correctAnswer (the correct answer key with explanation in Khmer)
   - explanation (step-by-step solution method or pedagogical reason)
   - points (1 point per question so all 10 sum up to 10 points)
   - rubricGuide (specific scoring criteria in Khmer)
4. Ensure the questions directly assess the specified topic ("${cleanTopic}") for Grade ${parsedGrade}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert Cambodian primary school educator generating official MoEYS standard exam papers in Khmer.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              examTitle: { type: Type.STRING, description: 'Official exam paper title in Khmer' },
              subjectId: { type: Type.STRING, description: 'Subject ID e.g. sub_math, sub_khmer' },
              subjectNameKm: { type: Type.STRING, description: 'Subject name in Khmer' },
              topic: { type: Type.STRING },
              grade: { type: Type.INTEGER },
              difficulty: { type: Type.STRING },
              instructions: { type: Type.STRING, description: 'Exam instructions in Khmer for students' },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    prompt: { type: Type.STRING, description: 'Question text in Khmer' },
                    questionType: { 
                      type: Type.STRING, 
                      enum: ['multiple_choice', 'fill_in_blank', 'short_answer', 'problem_solving', 'true_false'] 
                    },
                    options: { 
                      type: Type.ARRAY, 
                      items: { type: Type.STRING },
                      description: '4 choices if multiple_choice with ក., ខ., គ., ឃ.'
                    },
                    correctAnswer: { type: Type.STRING, description: 'Correct answer / answer key' },
                    explanation: { type: Type.STRING, description: 'Detailed step-by-step solution' },
                    points: { type: Type.NUMBER, description: 'Points awarded (1.0)' },
                    rubricGuide: { type: Type.STRING, description: 'Scoring guide' }
                  },
                  required: ['prompt', 'questionType', 'correctAnswer', 'points']
                }
              }
            },
            required: ['examTitle', 'subjectId', 'topic', 'grade', 'difficulty', 'questions']
          }
        }
      });

      const responseText = response.text?.trim() || '{}';
      const parsedData = JSON.parse(responseText);

      // Validate questions array
      if (!parsedData.questions || !Array.isArray(parsedData.questions) || parsedData.questions.length === 0) {
        throw new Error('Gemini did not return any questions');
      }

      // Ensure each question has complete properties and exactly 10 questions
      const finalQuestions = parsedData.questions.slice(0, 10).map((q: any, index: number) => ({
        prompt: q.prompt || `សំណួរទី${index + 1}`,
        questionType: q.questionType || 'multiple_choice',
        options: Array.isArray(q.options) && q.options.length > 0 ? q.options : (
          q.questionType === 'multiple_choice' ? ['ក. ជម្រើសទី ១', 'ខ. ជម្រើសទី ២', 'គ. ជម្រើសទី ៣', 'ឃ. ជម្រើសទី ៤'] : []
        ),
        correctAnswer: q.correctAnswer || 'ចម្លើយត្រឹមត្រូវ',
        explanation: q.explanation || 'វិធីដោះស្រាយលម្អិតតាមក្បួនបឋមសិក្សា',
        points: typeof q.points === 'number' && q.points > 0 ? q.points : 1,
        rubricGuide: q.rubricGuide || 'ឆ្លើយបានត្រឹមត្រូវទទួលបានពិន្ទុពេញ'
      }));

      // If fewer than 10, fill up to 10
      while (finalQuestions.length < 10) {
        const idx = finalQuestions.length + 1;
        finalQuestions.push({
          prompt: `សំណួរទី${idx}៖ ចូរពន្យល់ ឬគណនាតាមខ្លឹមសារមេរៀន "${cleanTopic}" (ថ្នាក់ទី${parsedGrade})`,
          questionType: 'short_answer',
          options: [],
          correctAnswer: 'ចម្លើយត្រឹមត្រូវស្របតាមមេរៀន',
          explanation: 'ពន្យល់ដោយផ្អែកលើនិយមន័យក្នុងសៀវភៅគោល',
          points: 1,
          rubricGuide: 'ឆ្លើយបានត្រឹមត្រូវទទួលបាន ១ ពិន្ទុ'
        });
      }

      res.json({
        examTitle: parsedData.examTitle || `វិញ្ញាសាតេស្តរហ័ស ថ្នាក់ទី${parsedGrade} - ${cleanTopic}`,
        subjectId: parsedData.subjectId || cleanSubjectId,
        subjectNameKm: parsedData.subjectNameKm || 'មុខវិជ្ជា',
        topic: cleanTopic,
        grade: parsedGrade,
        difficulty: cleanDifficulty,
        instructions: parsedData.instructions || 'សិស្សត្រូវអានសំណួរនីមួយៗឱ្យបានច្បាស់លាស់ និងសរសេរចម្លើយលើសន្លឹកកិច្ចការនេះឱ្យបានត្រឹមត្រូវ និងស្អាតបាត។',
        questions: finalQuestions,
        isAiGenerated: true,
        source: 'gemini-3.8-flash'
      });
    } catch (err: any) {
      console.error('Gemini exam generation failed, falling back to curriculum engine:', err?.message || err);
      // Fallback seamlessly so the teacher never gets an error
      const fallbackResult = generateCurriculumFallbackQuestions(cleanTopic, parsedGrade, cleanDifficulty, cleanSubjectId);
      res.json({
        ...fallbackResult,
        isAiGenerated: false,
        source: 'curriculum_engine',
        fallbackReason: err?.message || 'AI service temporarily unavailable, generated with built-in curriculum engine'
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
