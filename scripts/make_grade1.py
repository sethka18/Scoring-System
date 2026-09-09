#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate src/data/curriculumKhmerGrade1.ts"""
import json

lessons = [
    # វិច្ឆិកា (November) - Semester 1
    {
        "id": "g1_kh_1", "weekNumber": 1, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "សៅរ៍_01-11-25", "chapterKm": "ដើមឆ្នាំសិក្សា", "lessonTitleKm": "ថ្ងៃបើកបវេសនកាល",
        "lessonTitleEn": "School Opening Day", "objectivesKm": "ការបើកបវេសនកាលឆ្នាំសិក្សាថ្មី និងស្វាគមន៍សិស្សានុសិស្ស។",
        "hoursCount": 1, "semester": 1, "status": "completed", "isExamOrHoliday": True, "notes": "ថ្ងៃបើកបវេសនកាល"
    },
    {
        "id": "g1_kh_2", "weekNumber": 1, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ចន្ទ_03-11-25", "chapterKm": "ត្រៀមរៀនអក្សរ", "lessonNumber": 1, "lessonTitleKm": "១.រៀនគូសបន្ទាត់",
        "lessonTitleEn": "1. Practice Line Drawing", "objectivesKm": "ហ្វឹកហាត់សម្របសម្រួលរវាងចលនាភ្នែកនិងចលនាដៃក្នុងការគូសបន្ទាត់ដើម្បីត្រៀមសរសេរតួអក្សរ",
        "hoursCount": 2, "semester": 1, "status": "completed"
    },
    {
        "id": "g1_kh_3", "weekNumber": 1, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ចន្ទ_03-11-25", "chapterKm": "ម៉ោងបត់បែន", "lessonTitleKm": "ម៉ោងបត់បែន",
        "lessonTitleEn": "Flexible Hour", "objectivesKm": "ពង្រឹងការហ្វឹកហាត់ចលនាដៃ និងកាយវិការសរសេររបស់សិស្ស",
        "hoursCount": 1, "semester": 1, "status": "completed", "notes": "ម៉ោងបត់បែន"
    },
    {
        "id": "g1_kh_4", "weekNumber": 1, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "អង្គារ_04-11-25 ដល់ ព្រហស្បតិ៍_06-11-25", "chapterKm": "បុណ្យជាតិ", "lessonTitleKm": "ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ អកអំបុក",
        "lessonTitleEn": "Water Festival Holiday", "objectivesKm": "ឈប់សម្រាកព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ អកអំបុក",
        "hoursCount": 0, "semester": 1, "status": "completed", "isExamOrHoliday": True, "notes": "ព្រះរាជពិធីបុណ្យអុំទូក"
    },
    {
        "id": "g1_kh_5", "weekNumber": 1, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "សុក្រ_07-11-25", "chapterKm": "ត្រៀមរៀនអក្សរ", "lessonNumber": 2, "lessonTitleKm": "២.រៀនគូសបន្ទាត់",
        "lessonTitleEn": "2. Practice Line Drawing", "objectivesKm": "ហ្វឹកហាត់សម្របសម្រួលរវាងចលនាភ្នែកនិងចលនាដៃក្នុងការគូសបន្ទាត់ដើម្បីត្រៀមសរសេរតួអក្សរ",
        "hoursCount": 2, "semester": 1, "status": "completed"
    },
    {
        "id": "g1_kh_6", "weekNumber": 1, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "សុក្រ_07-11-25", "chapterKm": "ម៉ោងបត់បែន", "lessonTitleKm": "ម៉ោងបត់បែន",
        "lessonTitleEn": "Flexible Hour", "objectivesKm": "ហ្វឹកហាត់សរសេរបន្ទាត់ត្រង់ បន្ទាត់កោង និងរង្វង់",
        "hoursCount": 1, "semester": 1, "status": "completed", "notes": "ម៉ោងបត់បែន"
    },
    {
        "id": "g1_kh_7", "weekNumber": 2, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "សៅរ៍_08-11-25", "chapterKm": "ស្រៈនិស្ស័យ", "lessonNumber": 3, "lessonTitleKm": "៣.ចម្រៀងស្រៈនិស្ស័យ",
        "lessonTitleEn": "3. Dependent Vowels Song", "objectivesKm": "ច្រៀងចម្រៀងតាមបែបបទដើម្បីបន្លឺឈ្មោះស្រៈនិស្ស័យបានត្រឹមត្រូវ",
        "hoursCount": 2, "semester": 1, "status": "completed"
    },
    {
        "id": "g1_kh_8", "weekNumber": 2, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ចន្ទ_10-11-25", "chapterKm": "ស្រៈនិស្ស័យ", "lessonNumber": 4, "lessonTitleKm": "៤.ចម្រៀងស្រៈនិស្ស័យ",
        "lessonTitleEn": "4. Dependent Vowels Song (Cont.)", "objectivesKm": "ច្រៀងចម្រៀងតាមបែបបទដើម្បីបន្លឺឈ្មោះស្រៈនិស្ស័យបានត្រឹមត្រូវ",
        "hoursCount": 2, "semester": 1, "status": "completed"
    },
    {
        "id": "g1_kh_9", "weekNumber": 2, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ចន្ទ_10-11-25", "chapterKm": "ម៉ោងបត់បែន", "lessonTitleKm": "ម៉ោងបត់បែន",
        "lessonTitleEn": "Flexible Hour", "objectivesKm": "ពង្រឹងការបន្លឺសូរស្រៈ និងចលនាដៃ",
        "hoursCount": 1, "semester": 1, "status": "completed", "notes": "ម៉ោងបត់បែន"
    },
    {
        "id": "g1_kh_10", "weekNumber": 2, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "អង្គារ_11-11-25", "chapterKm": "ស្រៈនិស្ស័យ", "lessonNumber": 5, "lessonTitleKm": "៥.ចម្រៀងស្រៈនិស្ស័យ",
        "lessonTitleEn": "5. Dependent Vowels Song Review", "objectivesKm": "ច្រៀងចម្រៀងតាមបែបបទដើម្បីបន្លឺឈ្មោះស្រៈនិស្ស័យបានត្រឹមត្រូវ",
        "hoursCount": 2, "semester": 1, "status": "completed"
    },
    {
        "id": "g1_kh_11", "weekNumber": 2, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ពុធ_12-11-25", "chapterKm": "ព្យញ្ជនៈ", "lessonNumber": 6, "lessonTitleKm": "៦.ចម្រៀងព្យញ្ជនៈ",
        "lessonTitleEn": "6. Consonants Song", "objectivesKm": "ច្រៀងចម្រៀងតាមបែបបទដើម្បីបន្លឺឈ្មោះព្យញ្ជនៈបានត្រឹមត្រូវ",
        "hoursCount": 2, "semester": 1, "status": "completed"
    },
    {
        "id": "g1_kh_12", "weekNumber": 2, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ពុធ_12-11-25", "chapterKm": "ម៉ោងបត់បែន", "lessonTitleKm": "ម៉ោងបត់បែន",
        "lessonTitleEn": "Flexible Hour", "objectivesKm": "ហ្វឹកហាត់បន្លឺសូរព្យញ្ជនៈទាំង ៣៣ តួ",
        "hoursCount": 1, "semester": 1, "status": "completed", "notes": "ម៉ោងបត់បែន"
    },
    {
        "id": "g1_kh_13", "weekNumber": 2, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ព្រហស្បតិ៍_13-11-25", "chapterKm": "បង្រៀនបំប៉ន", "lessonTitleKm": "បង្រៀនបំប៉ន",
        "lessonTitleEn": "Remedial Teaching", "objectivesKm": "បង្រៀនបំប៉នសិស្សរៀនយឺតលើការគូសបន្ទាត់ និងការបន្លឺសូរអក្សរ",
        "hoursCount": 1, "semester": 1, "status": "completed", "notes": "បង្រៀនបំប៉ន"
    },
    {
        "id": "g1_kh_14", "weekNumber": 2, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "សុក្រ_14-11-25", "chapterKm": "ព្យញ្ជនៈពួកអ", "lessonNumber": 7, "lessonTitleKm": "៧.ការណែនាំតួអក្សរ ក ខ",
        "lessonTitleEn": "7. Introduction to Consonants Ka and Kha", "objectivesKm": "កំណត់សូរ កំណត់រូបរាង អាន និងសរសេរព្យញ្ជនៈ ក ខ។ ស្ដាប់រឿងនិទាន និងឆ្លើយសំណួរទាក់ទងនឹងព័ត៌មានបង្ហាញត្រង់និងបង្កប់។",
        "hoursCount": 2, "semester": 1, "status": "completed", "pageSs": 2
    },
    {
        "id": "g1_kh_15", "weekNumber": 2, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "សុក្រ_14-11-25", "chapterKm": "ម៉ោងបត់បែន", "lessonTitleKm": "ម៉ោងបត់បែន",
        "lessonTitleEn": "Flexible Hour", "objectivesKm": "ហ្វឹកហាត់សរសេរ ក និង ខ លើក្តារឆ្នួន",
        "hoursCount": 1, "semester": 1, "status": "completed", "notes": "ម៉ោងបត់បែន"
    },
    {
        "id": "g1_kh_16", "weekNumber": 3, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "សៅរ៍_15-11-25", "chapterKm": "ព្យញ្ជនៈពួកអ", "lessonNumber": 8, "lessonTitleKm": "៨.ការណែនាំតួអក្សរ ច ឆ",
        "lessonTitleEn": "8. Introduction to Consonants Cha and Chha", "objectivesKm": "កំណត់សូរ កំណត់រូបរាង អាន និងសរសេរព្យញ្ជនៈ ច ឆ។ ស្ដាប់រឿងនិទាន និងឆ្លើយសំណួរទាក់ទងនឹងព័ត៌មានបង្ហាញត្រង់និងបង្កប់។",
        "hoursCount": 2, "semester": 1, "status": "completed", "pageSs": 6
    },
    {
        "id": "g1_kh_17", "weekNumber": 3, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ចន្ទ_17-11-25", "chapterKm": "ស្រៈនិស្ស័យ", "lessonNumber": 9, "lessonTitleKm": "៩.មេរៀនទី២-៤ ស្រៈនិស្ស័យ ា",
        "lessonTitleEn": "9. Lessons 2-4: Dependent Vowel Aa (ា)", "objectivesKm": "កំណត់សូរ កំណត់រូបរាង អាន និងសរសេរ ស្រៈ«ា»។ អានព្យាង្គ ពាក្យ និងបង្កើតល្បះផ្ទាល់មាត់ ដោយប្រើប្រាស់ពាក្យងាយៗ ដែលមានព្យញ្ជនៈ ក ខ ច ឆ ផ្សំជាមួយស្រៈ«ា»។ អានស្ទាត់និងយល់ន័យអត្ថបទខ្លី។",
        "hoursCount": 2, "semester": 1, "status": "completed", "pageSs": 10
    },
    {
        "id": "g1_kh_18", "weekNumber": 3, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ចន្ទ_17-11-25", "chapterKm": "ម៉ោងបត់បែន", "lessonTitleKm": "ម៉ោងបត់បែន",
        "lessonTitleEn": "Flexible Hour", "objectivesKm": "ហ្វឹកហាត់ផ្សំសូរ កា ខា ចា ឆា",
        "hoursCount": 1, "semester": 1, "status": "completed", "notes": "ម៉ោងបត់បែន"
    },
    {
        "id": "g1_kh_19", "weekNumber": 3, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "អង្គារ_18-11-25", "chapterKm": "ស្រៈនិស្ស័យ", "lessonNumber": 10, "lessonTitleKm": "១០.មេរៀនទី២-៤ ស្រៈនិស្ស័យ ិ",
        "lessonTitleEn": "10. Dependent Vowel I (ិ)", "objectivesKm": "កំណត់សូរ កំណត់រូបរាង អាន និងសរសេរ ស្រៈ«ិ»។ អានព្យាង្គ ពាក្យ និងបង្កើតល្បះផ្ទាល់មាត់ ដែលមានព្យញ្ជនៈ ក ខ ច ឆ ផ្សំជាមួយស្រៈ«ិ»។",
        "hoursCount": 2, "semester": 1, "status": "completed", "pageSs": 12
    },
    {
        "id": "g1_kh_20", "weekNumber": 3, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ពុធ_19-11-25", "chapterKm": "ស្រៈនិស្ស័យ", "lessonNumber": 11, "lessonTitleKm": "១១.មេរៀនទី២-៤ ស្រៈនិស្ស័យ ី",
        "lessonTitleEn": "11. Dependent Vowel Ee (ី)", "objectivesKm": "កំណត់សូរ កំណត់រូបរាង អាន និងសរសេរ ស្រៈ«ី»។ អានព្យាង្គ ពាក្យ និងបង្កើតល្បះផ្ទាល់មាត់ ដែលមានព្យញ្ជនៈ ក ខ ច ឆ ផ្សំជាមួយស្រៈ«ី»។",
        "hoursCount": 2, "semester": 1, "status": "completed", "pageSs": 14
    },
    {
        "id": "g1_kh_21", "weekNumber": 3, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ពុធ_19-11-25", "chapterKm": "ម៉ោងបត់បែន", "lessonTitleKm": "ម៉ោងបត់បែន",
        "lessonTitleEn": "Flexible Hour", "objectivesKm": "ហ្វឹកហាត់អានពាក្យ គី ខី ជី ឈី",
        "hoursCount": 1, "semester": 1, "status": "completed", "notes": "ម៉ោងបត់បែន"
    },
    {
        "id": "g1_kh_22", "weekNumber": 3, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ព្រហស្បតិ៍_20-11-25", "chapterKm": "បង្រៀនបំប៉ន", "lessonTitleKm": "បង្រៀនបំប៉ន",
        "lessonTitleEn": "Remedial Teaching", "objectivesKm": "បង្រៀនបំប៉នសិស្សលើស្រៈ ា ិ ី",
        "hoursCount": 1, "semester": 1, "status": "completed", "notes": "បង្រៀនបំប៉ន"
    },
    {
        "id": "g1_kh_23", "weekNumber": 3, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "សុក្រ_21-11-25", "chapterKm": "ស្រៈនិស្ស័យ", "lessonNumber": 12, "lessonTitleKm": "១២.មេរៀនទី២-៤ ស្រៈនិស្ស័យ ឹ",
        "lessonTitleEn": "12. Dependent Vowel Eu (ឹ)", "objectivesKm": "កំណត់សូរ កំណត់រូបរាង អាន និងសរសេរ ស្រៈ«ឹ»។ អានព្យាង្គ ពាក្យ និងបង្កើតល្បះផ្ទាល់មាត់ ដែលមានព្យញ្ជនៈ ក ខ ច ឆ ផ្សំជាមួយស្រៈ«ឹ»។",
        "hoursCount": 2, "semester": 1, "status": "completed", "pageSs": 16
    },
    {
        "id": "g1_kh_24", "weekNumber": 3, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "សុក្រ_21-11-25", "chapterKm": "ម៉ោងបត់បែន/តេស្ត", "lessonTitleKm": "ម៉ោងបត់បែន / តេស្តប្រចាំខែ",
        "lessonTitleEn": "Flexible Hour / Monthly Test", "objectivesKm": "តេស្តសមត្ថភាពអាន និងសរសេរប្រចាំខែវិច្ឆិកា",
        "hoursCount": 1, "semester": 1, "status": "completed", "notes": "ម៉ោងបត់បែន/តេស្តប្រចាំខែ"
    },
    {
        "id": "g1_kh_25", "weekNumber": 4, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "សៅរ៍_22-11-25", "chapterKm": "ស្រៈនិស្ស័យ", "lessonNumber": 13, "lessonTitleKm": "១៣.មេរៀនទី២-៤ ស្រៈនិស្ស័យ ឺ",
        "lessonTitleEn": "13. Dependent Vowel Euu (ឺ)", "objectivesKm": "កំណត់សូរ កំណត់រូបរាង អាន និងសរសេរ ស្រៈ«ឺ»។ អានព្យាង្គ ពាក្យ និងបង្កើតល្បះផ្ទាល់មាត់។",
        "hoursCount": 2, "semester": 1, "status": "completed", "pageSs": 18
    },
    {
        "id": "g1_kh_26", "weekNumber": 4, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ចន្ទ_24-11-25", "chapterKm": "ស្រៈនិស្ស័យ", "lessonNumber": 14, "lessonTitleKm": "១៤.មេរៀនទី២-៤ ស្រៈនិស្ស័យ ុ",
        "lessonTitleEn": "14. Dependent Vowel U (ុ)", "objectivesKm": "កំណត់សូរ កំណត់រូបរាង អាន និងសរសេរ ស្រៈ«ុ»។ អានព្យាង្គ ពាក្យ និងបង្កើតល្បះផ្ទាល់មាត់។",
        "hoursCount": 2, "semester": 1, "status": "completed", "pageSs": 20
    },
    {
        "id": "g1_kh_27", "weekNumber": 4, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ចន្ទ_24-11-25", "chapterKm": "ម៉ោងបត់បែន", "lessonTitleKm": "ម៉ោងបត់បែន",
        "lessonTitleEn": "Flexible Hour", "objectivesKm": "ហ្វឹកហាត់សរសេរស្រៈ ុ",
        "hoursCount": 1, "semester": 1, "status": "completed", "notes": "ម៉ោងបត់បែន"
    },
    {
        "id": "g1_kh_28", "weekNumber": 4, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "អង្គារ_25-11-25", "chapterKm": "ស្រៈនិស្ស័យ", "lessonNumber": 15, "lessonTitleKm": "១៥.មេរៀនទី២-៤ ស្រៈនិស្ស័យ ូ",
        "lessonTitleEn": "15. Dependent Vowel Oo (ូ)", "objectivesKm": "កំណត់សូរ កំណត់រូបរាង អាន និងសរសេរ ស្រៈ«ូ»។ អានព្យាង្គ ពាក្យ និងបង្កើតល្បះផ្ទាល់មាត់។",
        "hoursCount": 2, "semester": 1, "status": "completed", "pageSs": 22
    },
    {
        "id": "g1_kh_29", "weekNumber": 4, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ពុធ_26-11-25", "chapterKm": "ស្រៈនិស្ស័យ", "lessonNumber": 16, "lessonTitleKm": "១៦.មេរៀនទី២-៤ ស្រៈនិស្ស័យ ួ",
        "lessonTitleEn": "16. Dependent Vowel Ua (ួ)", "objectivesKm": "កំណត់សូរ កំណត់រូបរាង អាន និងសរសេរ ស្រៈ«ួ»។ អានព្យាង្គ ពាក្យ និងបង្កើតល្បះផ្ទាល់មាត់។",
        "hoursCount": 2, "semester": 1, "status": "completed", "pageSs": 24
    },
    {
        "id": "g1_kh_30", "weekNumber": 4, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ពុធ_26-11-25", "chapterKm": "ម៉ោងបត់បែន", "lessonTitleKm": "ម៉ោងបត់បែន",
        "lessonTitleEn": "Flexible Hour", "objectivesKm": "ហ្វឹកហាត់ផ្សំស្រៈ ួ",
        "hoursCount": 1, "semester": 1, "status": "completed", "notes": "ម៉ោងបត់បែន"
    },
    {
        "id": "g1_kh_31", "weekNumber": 4, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "ព្រហស្បតិ៍_27-11-25", "chapterKm": "ប្រជុំបច្ចេកទេស", "lessonTitleKm": "ប្រជុំបច្ចេកទេស",
        "lessonTitleEn": "Technical Meeting", "objectivesKm": "ប្រជុំបច្ចេកទេសគ្រូបឋមសិក្សាប្រចាំខែ",
        "hoursCount": 0, "semester": 1, "status": "completed", "notes": "ប្រជុំបច្ចេកទេស"
    },
    {
        "id": "g1_kh_32", "weekNumber": 4, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "សុក្រ_28-11-25", "chapterKm": "ស្រៈនិស្ស័យ", "lessonNumber": 17, "lessonTitleKm": "១៧.មេរៀនទី២-៤ ស្រៈនិស្ស័យ ើ",
        "lessonTitleEn": "17. Dependent Vowel Eoe (ើ)", "objectivesKm": "កំណត់សូរ កំណត់រូបរាង អាន និងសរសេរ ស្រៈ«ើ»។ អានព្យាង្គ ពាក្យ និងបង្កើតល្បះផ្ទាល់មាត់។",
        "hoursCount": 2, "semester": 1, "status": "completed", "pageSs": 26
    },
    {
        "id": "g1_kh_33", "weekNumber": 4, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "សុក្រ_28-11-25", "chapterKm": "ម៉ោងបត់បែន", "lessonTitleKm": "ម៉ោងបត់បែន",
        "lessonTitleEn": "Flexible Hour", "objectivesKm": "ហ្វឹកហាត់អានពាក្យ ដើ ជើ",
        "hoursCount": 1, "semester": 1, "status": "completed", "notes": "ម៉ោងបត់បែន"
    },
    {
        "id": "g1_kh_34", "weekNumber": 5, "subjectId": "sub_khmer", "monthKm": "វិច្ឆិកា",
        "dateStr": "សៅរ៍_29-11-25", "chapterKm": "ស្រៈនិស្ស័យ", "lessonNumber": 18, "lessonTitleKm": "១៨.មេរៀនទី២-៤ ស្រៈនិស្ស័យ ឿ",
        "lessonTitleEn": "18. Dependent Vowel Eua (ឿ)", "objectivesKm": "កំណត់សូរ កំណត់រូបរាង អាន និងសរសេរ ស្រៈ«ឿ»។ អានព្យាង្គ ពាក្យ និងបង្កើតល្បះផ្ទាល់មាត់។",
        "hoursCount": 2, "semester": 1, "status": "completed", "pageSs": 28
    }
]

print(f"Grade 1 starter count: {len(lessons)}")
