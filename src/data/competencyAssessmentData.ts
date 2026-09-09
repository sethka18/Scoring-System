// Official MoEYS Competency Assessment Data (ឧបសម្ព័ន្ធ៣ និង ឧបសម្ព័ន្ធ៤)
// According to Primary Education Standard - Hun Neng Pratong Primary School

export interface SkillActivityItem {
  id: number;
  activityKm: string;
  activityEn: string;
  defaultScore: number; // 0-4
}

// ឧបសម្ព័ន្ធ៣៖ ឧបករណ៍វាយតម្លៃពិន្ទុបំណិនសម្បទារបស់សិស្ស (18 សកម្មភាព)
export const APPENDIX_3_ACTIVITIES: SkillActivityItem[] = [
  { id: 1, activityKm: 'ការរៀនភាសាបរទេស', activityEn: 'Foreign Language Learning', defaultScore: 0 },
  { id: 2, activityKm: 'ការប្រកួតប្រជែងអំណាន និងគណិតវិទ្យា', activityEn: 'Reading & Math Competitions', defaultScore: 4 },
  { id: 3, activityKm: 'ការបង្កើតក្លឹបសិក្សា និងការដាក់កិច្ចការផ្ទះ', activityEn: 'Study Clubs & Homework Assignment', defaultScore: 2 },
  { id: 4, activityKm: 'ការរៀបចំពិព៌ណស្នាដៃសិស្ស', activityEn: 'Student Work Exhibitions', defaultScore: 3 },
  { id: 5, activityKm: 'ការរៀបចមព្រឹត្តិការណ៍ជួបជាមួយអាណាព្យាបាលសិស្ស', activityEn: 'Parent-Teacher Events', defaultScore: 3 },
  { id: 6, activityKm: 'កម្មវិធីបំណិនរកចំណូល', activityEn: 'Income Generation Skills Program', defaultScore: 0 },
  { id: 7, activityKm: 'កម្មវិធីវិនិយោគនិងការសន្សំប្រាក់', activityEn: 'Investment & Money Savings Program', defaultScore: 1 },
  { id: 8, activityKm: 'ការបណ្តុះមូលដ្ឋានសហគ្រិនភាព', activityEn: 'Basic Entrepreneurship Training', defaultScore: 0 },
  { id: 9, activityKm: 'ការអប់រំកាយនិងកីឡា ការអប់រំសិល្បៈ និងការសម្តែង', activityEn: 'Physical Ed., Sports, Arts & Performance', defaultScore: 4 },
  { id: 10, activityKm: 'ការបង្កើតផលិតផល', activityEn: 'Product Creation & Handcrafts', defaultScore: 4 },
  { id: 11, activityKm: 'ការបង្រៀនកុំព្យូទ័រ', activityEn: 'Computer & IT Teaching', defaultScore: 0 },
  { id: 12, activityKm: 'ការសិក្សាអំណានទាំង៤នៅបណ្ណាល័យ(អំណានឮ អំណាន ចូលរួម អំណានដៃគូ អំណានបុគ្គល)', activityEn: '4 Types of Library Reading (Aloud, Shared, Paired, Individual)', defaultScore: 2 },
  { id: 13, activityKm: 'ការអប់រំសុខភាពបន្តពូជ អនាម័យ និងជំងឺផ្សេងៗ', activityEn: 'Reproductive Health, Hygiene & Disease Prevention', defaultScore: 3 },
  { id: 14, activityKm: 'ការអប់រំអំពីគ្រោះថ្នាក់គ្រាប់មីន និងគ្រាប់មិនទាន់ផ្ទុះ', activityEn: 'Mine & UXO Risk Education', defaultScore: 1 },
  { id: 15, activityKm: 'ការអប់រំអំពើហិង្សា', activityEn: 'Anti-Violence & Peace Education', defaultScore: 4 },
  { id: 16, activityKm: 'ការអប់រំសីលធម៌(ស្តាប់ធម៌ទេសនា)', activityEn: 'Moral Education (Dhamma Listening)', defaultScore: 2 },
  { id: 17, activityKm: 'ការអប់រំច្បាប់ចរាចរណ៍', activityEn: 'Traffic Safety Education', defaultScore: 3 },
  { id: 18, activityKm: 'ដំណើរទស្សកិច្ចសិក្សា', activityEn: 'Educational Study Tours', defaultScore: 0 },
];

export type AttitudeCategoryType = 'clean' | 'polite' | 'discipline' | 'punctual' | 'meditation';

export interface AttitudeCriteriaItem {
  id: number;
  categoryId: AttitudeCategoryType;
  categoryKm: string;
  categoryEn: string;
  criteriaKm: string;
  criteriaEn: string;
  defaultScore: 0 | 1;
}

// ឧបសម្ព័ន្ធ៤៖ ឧបករណ៍វាយតម្លៃពិន្ទុចរិយាសម្បទារបស់សិស្ស (៧៤ លក្ខណៈវិនិច្ឆ័យ ៥ ជំពូក)
export const APPENDIX_4_CRITERIA: AttitudeCriteriaItem[] = [
  // 1. ស្អាត (Cleanliness) - 16 criteria
  { id: 1, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'ការធ្វើអនាម័យខ្លួនប្រាណជាប្រចាំ', criteriaEn: 'Regular personal hygiene', defaultScore: 1 },
  { id: 2, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'កាត់ក្រចកដៃ ជើង', criteriaEn: 'Clipping fingernails and toenails', defaultScore: 1 },
  { id: 3, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'ដុសសម្អាតមាត់ ធ្មេញជាប្រចាំ', criteriaEn: 'Brushing teeth and mouth care', defaultScore: 1 },
  { id: 4, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'ការធ្វើអនាម័យកន្លែងរស់នៅជាប្រចាំ', criteriaEn: 'Cleaning living space regularly', defaultScore: 1 },
  { id: 5, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'ការដុសសម្អាតទ្រនាប់ជើងស្ងួត ទ្រនាប់ជើងស្អាតជាប្រចាំ', criteriaEn: 'Keeping footwear clean and dry', defaultScore: 1 },
  { id: 6, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'សម្លៀកបំពាក់សិស្សស្អាតជាប្រចាំ', criteriaEn: 'Wearing clean uniform', defaultScore: 1 },
  { id: 7, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'ចេះទុកដាក់សំរាមដោយខ្លួនឯង', criteriaEn: 'Disposing rubbish independently', defaultScore: 1 },
  { id: 8, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'សម្អាតបន្ទប់ទឹកជាប្រចាំ', criteriaEn: 'Regular restroom cleaning', defaultScore: 0 },
  { id: 9, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'សម្អាតថ្នាក់រៀនជាប្រចាំ', criteriaEn: 'Classroom cleaning duty', defaultScore: 1 },
  { id: 10, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'សម្អាតបរិស្ថានសាលារៀនជាប្រចាំ', criteriaEn: 'School campus cleaning', defaultScore: 1 },
  { id: 11, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'ស្រឡាញ់ភាពស្អាត និងប្រកាន់ឥរិយាបទស្អាតជាប្រចាំ', criteriaEn: 'Loving cleanliness and hygiene habits', defaultScore: 1 },
  { id: 12, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'សម្អាតសម្ភារៈសិក្សាដូចជា ក្តារឆ្នួន កាតាប សៀវភៅជាប្រចាំ', criteriaEn: 'Cleaning study materials (slate, bag, books)', defaultScore: 0 },
  { id: 13, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'មិនខាកស្តោះផ្តេសផ្តាស តាមទីសាធារណៈ', criteriaEn: 'Not spitting in public places', defaultScore: 1 },
  { id: 14, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'មិនបន្ទោបង់ក្រៅបង្គន់', criteriaEn: 'Not urinating/defecating outside toilets', defaultScore: 1 },
  { id: 15, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'បរិភោគចំណីអាហារមានសុវត្ថិភាពជាប្រចាំ', criteriaEn: 'Eating safe and hygienic food', defaultScore: 1 },
  { id: 16, categoryId: 'clean', categoryKm: 'ស្អាត', categoryEn: 'Cleanliness', criteriaKm: 'ប្រើប្រាស់និងទទួលទានទឹកស្អាតជាប្រចាំ', criteriaEn: 'Drinking clean and safe water', defaultScore: 1 },

  // 2. សុភាព (Politeness / Manners) - 22 criteria
  { id: 17, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ប្រើប្រាស់ពាក្យសម្តីពីរោះ រាបសារ គួរសម និងផ្តល់ស្នាមញញឹមដាក់គ្នា', criteriaEn: 'Using courteous language and smiling', defaultScore: 0 },
  { id: 18, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ញញឹមស្រស់', criteriaEn: 'Bright and welcoming smile', defaultScore: 1 },
  { id: 19, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ប្រតិបត្តិល្អចំពោះមិត្តភក្តិ', criteriaEn: 'Kind behavior towards peers', defaultScore: 0 },
  { id: 20, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ប្រតិបត្តិល្អចំពោះចាស់ព្រឹទ្ធាចារ្យ', criteriaEn: 'Respect towards elders', defaultScore: 1 },
  { id: 21, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ប្រតិបត្តិល្អចំពោះម្តាយឪពុក', criteriaEn: 'Filial piety towards parents', defaultScore: 1 },
  { id: 22, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ប្រតិបត្តិល្អចំពោះលោកគ្រូអ្នកគ្រូ នាយក នាយិកា', criteriaEn: 'Respect towards teachers and school directors', defaultScore: 1 },
  { id: 23, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ប្រតិបត្តិល្អចំពោះព្រះសង្ឃ', criteriaEn: 'Veneration towards monks', defaultScore: 1 },
  { id: 24, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ការសំពះដើម្បីបង្ហាញការគោរព និងគួសមដូចជា៖ ការសំពះបួងសួងដល់ទេវតាវត្ថុសក្តិសិទ្ធ ព្រះសង្ឃ ចាស់ព្រឹទ្ធាចារ្យ លោកគ្រូអ្នកគ្រូ ឪពុកម្តាយ បងប្រុសស្រីអ្នកមានអាយុច្រើនជាង មិត្តភក្តិ', criteriaEn: 'Proper Sompiah greeting to monks, elders, teachers, parents, seniors', defaultScore: 1 },
  { id: 25, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'មិត្តជួយអប់រំមិត្តនិងគោរពគ្នាទៅវិញទៅមក', criteriaEn: 'Mutual peer respect and positive encouragement', defaultScore: 0 },
  { id: 26, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'មិនពោលពាក្យមិនល្អ', criteriaEn: 'Refraining from foul language or profanity', defaultScore: 0 },
  { id: 27, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'មិនមានការច្រណែនឈ្នានិសអ្នកដទៃ', criteriaEn: 'No jealousy or envy toward others', defaultScore: 1 },
  { id: 28, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'សុំការអនុញ្ញាតពីគ្រូមាតាបិតា ចាស់ព្រឹទ្ធាចារ្យមុនធ្វើអ្វីមួយ', criteriaEn: 'Asking permission from parents and teachers beforehand', defaultScore: 0 },
  { id: 29, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ចេះជួយយកអាសាអ្នកដទៃ', criteriaEn: 'Helping and assisting others selflessly', defaultScore: 1 },
  { id: 30, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ចៀសវាងពាក់មួកក្នុងបរិវេណសាលារៀន វត្តអារាម', criteriaEn: 'Avoiding wearing caps indoors/temple/school grounds', defaultScore: 1 },
  { id: 31, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ដោះមួកគោរពគ្រូព្រះសង្ឃ ចាស់ព្រឹទ្ធាចារ្យ', criteriaEn: 'Doffing hats to greet teachers, monks, elders', defaultScore: 1 },
  { id: 32, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ចេះលើកដៃសំពះសុំទោសពេលខ្លួនមានកំហុស', criteriaEn: 'Offering polite apologies when making mistakes', defaultScore: 1 },
  { id: 33, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ចៀសវាងលេងហ្គេម អាននិងមើលរឿងអាសអាភាស', criteriaEn: 'Avoiding harmful video games or inappropriate content', defaultScore: 1 },
  { id: 34, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'មានចរិតស្លូតបូត', criteriaEn: 'Gentle and kind demeanor', defaultScore: 1 },
  { id: 35, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'ស្មោះត្រង់មិននិយាយកុហក', criteriaEn: 'Honesty and truthfulness', defaultScore: 1 },
  { id: 36, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'មិនយករបស់ទ្រព្យមិត្តភក្តិនិងអ្នកដទៃ', criteriaEn: 'Respecting others property (no theft)', defaultScore: 1 },
  { id: 37, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'មិនសេពគប់ជាមួយមិត្តខិលខូច', criteriaEn: 'Not associating with bad influences', defaultScore: 1 },
  { id: 38, categoryId: 'polite', categoryKm: 'សុភាព', categoryEn: 'Politeness', criteriaKm: 'មិនពាក់គ្រឿងអលង្ការ តែងខ្លួនឆើតឆាយ', criteriaEn: 'Modest dressing without flashy jewelry', defaultScore: 1 },

  // 3. របៀប (Orderliness / Discipline) - 18 criteria
  { id: 39, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'ការទុកដាក់សម្ភារៈសិក្សាត្រឹមត្រូវ', criteriaEn: 'Neat arrangement of study materials', defaultScore: 1 },
  { id: 40, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'ទុកស្បែកជើងនៅមុខ ឬក្រៅថ្នាក់', criteriaEn: 'Placing shoes neatly outside classroom', defaultScore: 1 },
  { id: 41, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'ការឈរតម្រង់ជួរមានសណ្តាប់ធ្នាប់', criteriaEn: 'Orderly queuing in lines', defaultScore: 1 },
  { id: 42, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'ការទុកដាក់កង់ ឬម៉ូតូត្រូវតាមកន្លែង', criteriaEn: 'Parking bikes/motorcycles in designated areas', defaultScore: 1 },
  { id: 43, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'មិនជជែកឬប្រឡែងគ្នាពេលគោរពទង់ជាតិ', criteriaEn: 'Quiet attention during national anthem/flag ceremony', defaultScore: 0 },
  { id: 44, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'មិនជជែកឬប្រឡែងគ្នាពេលកំពុងរៀន មិនជាន់លើតុកៅអី', criteriaEn: 'Attentive during study, no stepping on furniture', defaultScore: 0 },
  { id: 45, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'មិនជិះកង់ ឬម៉ូតូក្នុងបរិវេណសាលារៀន', criteriaEn: 'No reckless riding within campus', defaultScore: 1 },
  { id: 46, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'មិនធ្វើឱ្យខូចខាតទ្រព្យរបស់ផ្សេងៗ', criteriaEn: 'Preserving school public property', defaultScore: 1 },
  { id: 47, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'មិនឡើងដើមឈើទីខ្ពស់ផ្តេសផ្តាស ឬដោយគ្មានការអនុញ្ញាត', criteriaEn: 'Not climbing trees or high hazards', defaultScore: 1 },
  { id: 48, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'ជម្រាបសួរ ជម្រាបលាឪពុកម្តាយ អ្នកអាណាព្យាបាលមុនទៅសាលារៀន និងមកវិញ', criteriaEn: 'Greeting parents when leaving and returning home', defaultScore: 0 },
  { id: 49, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'រាយការណ៍ជាបន្ទាន់ជូននាយក ឬគ្រូបង្រៀនពេលមានបាតុភាពអសកម្ម', criteriaEn: 'Prompt reporting of misbehavior or safety risks', defaultScore: 0 },
  { id: 50, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'សិស្សឱ្យចេះសម្អាតខ្លួនប្រាណ', criteriaEn: 'Knowing how to maintain body cleanliness', defaultScore: 1 },
  { id: 51, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'សិស្សឱ្យចេះសម្អាតសម្លៀកបំពាក់ ទ្រនាប់ជើង ស្រោមជើង', criteriaEn: 'Knowing how to clean clothes and footwear', defaultScore: 1 },
  { id: 52, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'កាត់សក់ខ្លី (សិស្សប្រុស) សិតសក់ ចងឬកៀបសក់ឱ្យមានរបៀប(សិស្សស្រី)', criteriaEn: 'Short neat hair for boys, tied hair for girls', defaultScore: 1 },
  { id: 53, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'រៀបចំផ្ទះសម្បែង បន្ទប់គេង សម្ភារៈប្រើប្រាស់', criteriaEn: 'Tidying home, bedroom and daily belongings', defaultScore: 1 },
  { id: 54, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'ចេះទុកដាក់សំរាម និងរើសសំរាមដាក់ធុង', criteriaEn: 'Picking up rubbish and placing in bins', defaultScore: 1 },
  { id: 55, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'កំណត់បានប្រភេទសម្លៀកបំពាក់ប្រចាំថ្ងៃ និងសម្លៀកបំពាក់សម្រាប់កម្មវិធីផ្សេងៗ', criteriaEn: 'Choosing appropriate attire for various occasions', defaultScore: 1 },
  { id: 56, categoryId: 'discipline', categoryKm: 'របៀប', categoryEn: 'Orderliness', criteriaKm: 'ចេះទទួលបដិសណ្ឋារកិច្ចចំពោះភ្ញៀវជាតិ អន្តរជាតិ', criteriaEn: 'Hospitable greeting towards national/international guests', defaultScore: 1 },

  // 4. ទៀងពេល (Punctuality) - 8 criteria
  { id: 57, categoryId: 'punctual', categoryKm: 'ទៀងពេល', categoryEn: 'Punctuality', criteriaKm: 'មករៀនបានទៀងទាត់ និងទាន់ពេលវេលា', criteriaEn: 'Attending school on time every day', defaultScore: 1 },
  { id: 58, categoryId: 'punctual', categoryKm: 'ទៀងពេល', categoryEn: 'Punctuality', criteriaKm: 'ចូលរួមគោរពទង់ជាតិទៀងទាត់', criteriaEn: 'Attending morning flag ceremonies punctually', defaultScore: 1 },
  { id: 59, categoryId: 'punctual', categoryKm: 'ទៀងពេល', categoryEn: 'Punctuality', criteriaKm: 'ពេលឈប់សម្រាកត្រូវមានច្បាប់ទម្លាប់ និងមូលហេតុ', criteriaEn: 'Always providing excusal letter for absences', defaultScore: 1 },
  { id: 60, categoryId: 'punctual', categoryKm: 'ទៀងពេល', categoryEn: 'Punctuality', criteriaKm: 'ខិតខំធ្វើកិច្ចការ និងខិតខំរៀនសូត្រប្រចាំថ្ងៃ', criteriaEn: 'Diligently studying and finishing tasks daily', defaultScore: 1 },
  { id: 61, categoryId: 'punctual', categoryKm: 'ទៀងពេល', categoryEn: 'Punctuality', criteriaKm: 'មិនឈប់លេងតាមផ្លូវពេលចេញពីសាលារៀនទៅផ្ទះ ឬពីផ្ទះទៅសាលារៀន', criteriaEn: 'Not loitering on the road between home and school', defaultScore: 1 },
  { id: 62, categoryId: 'punctual', categoryKm: 'ទៀងពេល', categoryEn: 'Punctuality', criteriaKm: 'កំណត់ពេលវេលាធ្វើកិច្ចការ និងធ្វើកិច្ចការបានទៀងទាត់', criteriaEn: 'Scheduling and meeting homework deadlines', defaultScore: 1 },
  { id: 63, categoryId: 'punctual', categoryKm: 'ទៀងពេល', categoryEn: 'Punctuality', criteriaKm: 'គោរពពេលវេលាជាប្រចាំ', criteriaEn: 'Valuing and respecting time consistently', defaultScore: 1 },
  { id: 64, categoryId: 'punctual', categoryKm: 'ទៀងពេល', categoryEn: 'Punctuality', criteriaKm: 'ហាត់ប្រាណថែរក្សាសុខភាពជាប្រចាំ', criteriaEn: 'Exercising regularly for good health', defaultScore: 1 },

  // 5. សមាធិ (Mindfulness / Meditation) - 14 criteria
  { id: 65, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'ប្រមូលអារម្មណ៍ត្រង់ត្រាប់ស្តាប់ការណែនាំរបស់លោកគ្រូអ្នកគ្រូ', criteriaEn: 'Attentively listening to teachers guidance', defaultScore: 1 },
  { id: 66, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'ការតាំងចិត្តស្តាប់សំឡេងខាងក្នុង', criteriaEn: 'Inner focus and contemplation', defaultScore: 0 },
  { id: 67, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'ការអត់ធ្មត់ស្តាប់សំឡេងខ្យល់ដង្ហើមចេញចូល', criteriaEn: 'Patience and breathing awareness', defaultScore: 0 },
  { id: 68, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'ហ្វឹកហាត់ស្រូប និងបញ្ចេញខ្យល់ដង្ហើមចេញចូលឱ្យវែងៗ យឺតៗ', criteriaEn: 'Deep and slow breathing practice', defaultScore: 0 },
  { id: 69, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'ហ្វឹកហាត់ប្រមូលអារម្មណ៍ដោយសេចក្តីពិចារណានូវសកម្មភាពល្អៗដែលបានធ្វើប្រចាំថ្ងៃ', criteriaEn: 'Mindful reflection on good deeds of the day', defaultScore: 1 },
  { id: 70, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'មានសុខភាពល្អ ស្មារតីក្លៀវក្លា ស្វាហាប់ និងថ្លាអារម្មណ៍គិតអ្វីៗក្នុងផ្លូវល្អវិជ្ជមានជានិច្ច', criteriaEn: 'Positive, energetic and clear mental disposition', defaultScore: 1 },
  { id: 71, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'ស្វែងយល់ពីអំពើល្អនិងព្យាយាមធ្វើទង្វើល្អនោះជាប្រចាំ', criteriaEn: 'Seeking goodness and practicing daily kindness', defaultScore: 1 },
  { id: 72, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'ធ្វើអំពើល្អជានិច្ច', criteriaEn: 'Continuously doing good deeds', defaultScore: 1 },
  { id: 73, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'ធ្វើអ្វីដែលជាគុណប្រយោជន៍ចំពោះខ្លួនឯង គ្រួសារ សាលារៀន និងសង្គម', criteriaEn: 'Actions beneficial to self, family, school and society', defaultScore: 1 },
  { id: 74, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'ចេះត្រិះរិះពិចារណារកហេតុផល', criteriaEn: 'Critical thinking and rational reflection', defaultScore: 1 },
  { id: 75, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'ហ៊ានទទួលខុសត្រូវចំពោះទង្វើរបស់ខ្លួន', criteriaEn: 'Courage to take accountability for one\'s actions', defaultScore: 1 },
  { id: 76, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'ប្រមូលអារម្មណ៍យកចិត្តទុកដាក់រៀនសូត្រ', criteriaEn: 'Deep concentration on studies', defaultScore: 1 },
  { id: 77, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'ចេះទប់និងរម្ងាប់អារម្មណ៍', criteriaEn: 'Emotional restraint and self-regulation', defaultScore: 1 },
  { id: 78, categoryId: 'meditation', categoryKm: 'សមាធិ', categoryEn: 'Mindfulness', criteriaKm: 'ប្រកាន់ភ្ជាប់សីល៥ អប់រំផ្លូវចិត្ត', criteriaEn: 'Adherence to the 5 Moral Precepts', defaultScore: 0 },
];

export interface StudentSkillAssessmentRecord {
  studentId: string;
  activityScores: Record<number, number>; // activityId (1-18) -> score (0-4)
  totalRawScore: number; // Max 72
  scoreOn10: number; // 0 - 10.00
  scoreOn1: number; // 0 - 1.00 (contribution to annual 10%)
  grade: 'ល្អ' | 'ល្អបង្គួរ' | 'មធ្យម' | 'ខ្សោយ';
  updatedAt?: string;
}

export interface StudentAttitudeAssessmentRecord {
  studentId: string;
  criteriaScores: Record<number, 0 | 1>; // criteriaId (1-78) -> 0 or 1
  categorySubtotals: {
    clean: number; // / 16
    polite: number; // / 22
    discipline: number; // / 18
    punctual: number; // / 8
    meditation: number; // / 14
  };
  totalRawScore: number; // Max 74
  scoreOn10: number; // 0 - 10.00
  scoreOn1: number; // 0 - 1.00 (contribution to annual 10%)
  grade: 'ល្អ' | 'ល្អបង្គួរ' | 'មធ្យម' | 'ខ្សោយ';
  updatedAt?: string;
}

// Calculation Utilities
export function calculateSkillEvaluation(scores: Record<number, number>): {
  totalRawScore: number;
  scoreOn10: number;
  scoreOn1: number;
  grade: 'ល្អ' | 'ល្អបង្គួរ' | 'មធ្យម' | 'ខ្សោយ';
} {
  let total = 0;
  APPENDIX_3_ACTIVITIES.forEach(act => {
    total += scores[act.id] ?? act.defaultScore;
  });

  const clampedTotal = Math.min(72, Math.max(0, total));
  const scoreOn10 = Math.round((clampedTotal / 72) * 10 * 100) / 100;
  const scoreOn1 = Math.round((clampedTotal / 72) * 1.0 * 100) / 100;

  let grade: 'ល្អ' | 'ល្អបង្គួរ' | 'មធ្យម' | 'ខ្សោយ' = 'មធ្យម';
  if (scoreOn10 >= 8.0) grade = 'ល្អ';
  else if (scoreOn10 >= 6.5) grade = 'ល្អបង្គួរ';
  else if (scoreOn10 >= 5.0) grade = 'មធ្យម';
  else grade = 'ខ្សោយ';

  return {
    totalRawScore: clampedTotal,
    scoreOn10,
    scoreOn1,
    grade,
  };
}

export function calculateAttitudeEvaluation(scores: Record<number, 0 | 1>): {
  categorySubtotals: {
    clean: number;
    polite: number;
    discipline: number;
    punctual: number;
    meditation: number;
  };
  totalRawScore: number;
  scoreOn10: number;
  scoreOn1: number;
  grade: 'ល្អ' | 'ល្អបង្គួរ' | 'មធ្យម' | 'ខ្សោយ';
} {
  const subtotals = {
    clean: 0,
    polite: 0,
    discipline: 0,
    punctual: 0,
    meditation: 0,
  };

  APPENDIX_4_CRITERIA.forEach(crit => {
    const val = scores[crit.id] ?? crit.defaultScore;
    if (val === 1) {
      subtotals[crit.categoryId]++;
    }
  });

  const total = subtotals.clean + subtotals.polite + subtotals.discipline + subtotals.punctual + subtotals.meditation;
  const clampedTotal = Math.min(74, Math.max(0, total));
  const scoreOn10 = Math.round((clampedTotal / 74) * 10 * 100) / 100;
  const scoreOn1 = Math.round((clampedTotal / 74) * 1.0 * 100) / 100;

  let grade: 'ល្អ' | 'ល្អបង្គួរ' | 'មធ្យម' | 'ខ្សោយ' = 'ល្អ';
  if (scoreOn10 >= 8.0) grade = 'ល្អ';
  else if (scoreOn10 >= 6.5) grade = 'ល្អបង្គួរ';
  else if (scoreOn10 >= 5.0) grade = 'មធ្យម';
  else grade = 'ខ្សោយ';

  return {
    categorySubtotals: subtotals,
    totalRawScore: clampedTotal,
    scoreOn10,
    scoreOn1,
    grade,
  };
}

// Generate default initial student records
export function generateInitialSkillRecords(studentIds: string[]): Record<string, StudentSkillAssessmentRecord> {
  const defaultScores: Record<number, number> = {};
  APPENDIX_3_ACTIVITIES.forEach(a => {
    defaultScores[a.id] = a.defaultScore;
  });
  const evalResult = calculateSkillEvaluation(defaultScores);

  const result: Record<string, StudentSkillAssessmentRecord> = {};
  studentIds.forEach(id => {
    result[id] = {
      studentId: id,
      activityScores: { ...defaultScores },
      totalRawScore: evalResult.totalRawScore,
      scoreOn10: evalResult.scoreOn10,
      scoreOn1: evalResult.scoreOn1,
      grade: evalResult.grade,
      updatedAt: new Date().toISOString(),
    };
  });
  return result;
}

export function generateInitialAttitudeRecords(studentIds: string[]): Record<string, StudentAttitudeAssessmentRecord> {
  const defaultScores: Record<number, 0 | 1> = {};
  APPENDIX_4_CRITERIA.forEach(c => {
    defaultScores[c.id] = c.defaultScore;
  });
  const evalResult = calculateAttitudeEvaluation(defaultScores);

  const result: Record<string, StudentAttitudeAssessmentRecord> = {};
  studentIds.forEach(id => {
    result[id] = {
      studentId: id,
      criteriaScores: { ...defaultScores },
      categorySubtotals: { ...evalResult.categorySubtotals },
      totalRawScore: evalResult.totalRawScore,
      scoreOn10: evalResult.scoreOn10,
      scoreOn1: evalResult.scoreOn1,
      grade: evalResult.grade,
      updatedAt: new Date().toISOString(),
    };
  });
  return result;
}
