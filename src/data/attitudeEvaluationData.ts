/**
 * ឧបសម្ព័ន្ធ៤៖ ឧបករណ៍វាយតម្លៃពិន្ទុចរិយាសម្បទារបស់សិស្ស (MoEYS Appendix 4 Attitude Evaluation)
 * សាលាបឋមសិក្សាហ៊ុន ណេង ប្រទង - ភូមិប្រទង ឃុំអូរម្លូ ស្រុកស្ទឹងត្រង់ ខេត្តកំពង់ចាម
 */

export interface AttitudeCriterion {
  id: string;
  category: 'clean' | 'polite' | 'order' | 'punctual' | 'meditation';
  categoryKm: 'ស្អាត' | 'សុភាព' | 'របៀប' | 'ទៀងពេល' | 'សមាធិ';
  categoryOrder: number;
  criterionText: string;
  maxScore: number;
  defaultScore: number;
}

export const ATTITUDE_CRITERIA: AttitudeCriterion[] = [
  // ១. ស្អាត (១៦ លក្ខណៈវិនិច្ឆ័យ - សរុប ១៤ ពិន្ទុ)
  { id: 'clean_1', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'ការធ្វើអនាម័យខ្លួនប្រាណជាប្រចាំ', maxScore: 1, defaultScore: 1 },
  { id: 'clean_2', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'កាត់ក្រចកដៃ ជើង', maxScore: 1, defaultScore: 1 },
  { id: 'clean_3', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'ដុសសម្អាតមាត់​ ធ្មេញជាប្រចាំ', maxScore: 1, defaultScore: 1 },
  { id: 'clean_4', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'ការធ្វើអនាម័យកន្លែងរស់នៅជាប្រចាំ', maxScore: 1, defaultScore: 1 },
  { id: 'clean_5', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'ការដុសសម្អាតទ្រនាប់ជើងស្ងួត ទ្រនាប់ជើងស្អាតជាប្រចាំ', maxScore: 1, defaultScore: 1 },
  { id: 'clean_6', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'សម្លៀកបំពាក់សិស្សស្អាតជាប្រចាំ', maxScore: 1, defaultScore: 1 },
  { id: 'clean_7', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'ចេះទុកដាក់សំរាមដោយខ្លួនឯង', maxScore: 1, defaultScore: 1 },
  { id: 'clean_8', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'សម្អាតបន្ទប់ទឹកជាប្រចាំ', maxScore: 1, defaultScore: 0 },
  { id: 'clean_9', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'សម្អាតថ្នាក់រៀនជាប្រចាំ', maxScore: 1, defaultScore: 1 },
  { id: 'clean_10', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'សម្អាតបរិស្ថានសាលារៀនជាប្រចាំ', maxScore: 1, defaultScore: 1 },
  { id: 'clean_11', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'ស្រឡាញ់ភាពស្អាត និងប្រកាន់ឥរិយាបទស្អាតជាប្រចាំ', maxScore: 1, defaultScore: 1 },
  { id: 'clean_12', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'សម្អាតសម្ភារៈសិក្សាដូចជា ក្តារឆ្នួន កាតាប សៀវភៅជាប្រចាំ', maxScore: 1, defaultScore: 0 },
  { id: 'clean_13', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'មិនខាកស្តោះផ្តេសផ្តាស តាមទីសាធារណៈ', maxScore: 1, defaultScore: 1 },
  { id: 'clean_14', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'មិនបន្ទោបង់ក្រៅបង្គន់', maxScore: 1, defaultScore: 1 },
  { id: 'clean_15', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'បរិភោគចំណីអាហារមានសុវត្ថិភាពជាប្រចាំ', maxScore: 1, defaultScore: 1 },
  { id: 'clean_16', category: 'clean', categoryKm: 'ស្អាត', categoryOrder: 1, criterionText: 'ប្រើប្រាស់​និងទទួលទានទឹកស្អាតជាប្រចាំ', maxScore: 1, defaultScore: 1 },

  // ២. សុភាព (២២ លក្ខណៈវិនិច្ឆ័យ - សរុប ១៧ ពិន្ទុ)
  { id: 'polite_1', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ប្រើប្រាស់ពាក្យសម្តីពីរោះ រាបសារ គួរសម និងផ្តល់ស្នាមញញឹមដាក់គ្នា', maxScore: 1, defaultScore: 0 },
  { id: 'polite_2', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ញញឹមស្រស់', maxScore: 1, defaultScore: 1 },
  { id: 'polite_3', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ប្រតិបត្តិល្អចំពោះមិត្តភក្តិ', maxScore: 1, defaultScore: 0 },
  { id: 'polite_4', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ប្រតិបត្តិល្អចំពោះចាស់ព្រឹទ្ធាចារ្យ', maxScore: 1, defaultScore: 1 },
  { id: 'polite_5', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ប្រតិបត្តិល្អចំពោះម្តាយឪពុក', maxScore: 1, defaultScore: 1 },
  { id: 'polite_6', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ប្រតិបត្តិល្អចំពោះលោកគ្រូ អ្នកគ្រូ នាយក នាយិកា', maxScore: 1, defaultScore: 1 },
  { id: 'polite_7', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ប្រតិបត្តិល្អចំពោះព្រះសង្ឃ', maxScore: 1, defaultScore: 1 },
  { id: 'polite_8', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ការសំពះដើម្បីបង្ហាញការគោរព និងគួសមដូចជា៖ការសំពះបួងសួងដល់ទេវតាវត្ថុសក្តិសិទ្ធ ព្រះសង្ឃ ចាស់ព្រឹទ្ធាចារ្យ លោកគ្រូ អ្នកគ្រូ ឪពុកម្តាយ បងប្រុសស្រី អ្នមានអាយុច្រើជាង មិត្តភក្តិ', maxScore: 1, defaultScore: 1 },
  { id: 'polite_9', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'មិត្តជួយអប់រំមិត្ត និងគោរពគ្នាទៅវិញទៅមក', maxScore: 1, defaultScore: 0 },
  { id: 'polite_10', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'មិនពោលពាក្យមិនល្អ', maxScore: 1, defaultScore: 0 },
  { id: 'polite_11', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'មិនមានការច្រណែនឈ្នានិសអ្នកដទៃ', maxScore: 1, defaultScore: 1 },
  { id: 'polite_12', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'សុំការអនុញ្ញាតពីគ្រូ មាតាបិតា ចាស់ព្រឹទ្ធាចារ្យមុនធ្វើអ្វីមួយ', maxScore: 1, defaultScore: 0 },
  { id: 'polite_13', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ចេះជួយយកអាសាអ្នកដទៃ', maxScore: 1, defaultScore: 1 },
  { id: 'polite_14', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ចៀសវាងពាក់មួកក្នុងបរិវេណសាលារៀន វត្តអារាម', maxScore: 1, defaultScore: 1 },
  { id: 'polite_15', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ដោះមួកគោរពគ្រូ ព្រះសង្ឃ ចាស់ព្រឹទ្ធាចារ្យ', maxScore: 1, defaultScore: 1 },
  { id: 'polite_16', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ចេះលើកដៃសំពះសូបទោសពេលខ្លួនមានកំហុស', maxScore: 1, defaultScore: 1 },
  { id: 'polite_17', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ចៀសវាងលេងហ្គេម អាននិងមើលរឿងអាសអាភាស', maxScore: 1, defaultScore: 1 },
  { id: 'polite_18', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'មានចរិតស្លូតបូត', maxScore: 1, defaultScore: 1 },
  { id: 'polite_19', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'ស្មោះត្រង់មិននិយាយកុហក', maxScore: 1, defaultScore: 1 },
  { id: 'polite_20', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'មិនយករបស់ទ្រព្យមិត្តភក្តិ និងអ្នកដទៃ', maxScore: 1, defaultScore: 1 },
  { id: 'polite_21', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'មិនសេពគប់ជាមួយមិត្តខិលខូច', maxScore: 1, defaultScore: 1 },
  { id: 'polite_22', category: 'polite', categoryKm: 'សុភាព', categoryOrder: 2, criterionText: 'មិនពាក់គ្រឿងអលង្កា តែងខ្លួនឆើតឆាយ', maxScore: 1, defaultScore: 1 },

  // ៣. របៀប (១៨ លក្ខណៈវិនិច្ឆ័យ - សរុប ១៤ ពិន្ទុ)
  { id: 'order_1', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'ការទុកដាក់សម្ភារៈសិក្សាត្រឹមត្រូវ', maxScore: 1, defaultScore: 1 },
  { id: 'order_2', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'ទុកស្បែកជើងនៅមុខ ឬក្រៅថ្នាក់', maxScore: 1, defaultScore: 1 },
  { id: 'order_3', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'ការឈរតម្រង់ជួរមានសណ្តាប់ធ្នាប់', maxScore: 1, defaultScore: 1 },
  { id: 'order_4', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'ការទុកដាក់កង់ ឬម៉ូតូត្រូវតាមកន្លែង', maxScore: 1, defaultScore: 1 },
  { id: 'order_5', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'មិនជជែកឬប្រឡែងគ្នាពេលគោរពទង់ជាតិ', maxScore: 1, defaultScore: 0 },
  { id: 'order_6', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'មិនជជែកឬប្រឡែងគ្នាពេលកំពង់រៀន មិនជាន់លើតុ កៅអី', maxScore: 1, defaultScore: 0 },
  { id: 'order_7', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'មិនជិះកង់ ឬម៉ូតូក្នុងបរិវេណសាលារៀន', maxScore: 1, defaultScore: 1 },
  { id: 'order_8', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'មិនធ្វើឱ្យខូចខាតទ្រព្យ របស់ផ្សេងៗ', maxScore: 1, defaultScore: 1 },
  { id: 'order_9', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'មិនឡើងដើមឈើ ទីខ្ពស់ផ្តេសផ្តាស ឬដោយគ្មានការអនុញ្ញាត', maxScore: 1, defaultScore: 1 },
  { id: 'order_10', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'ជម្រាបសួរ ជម្រាបលាឪពុកម្តាយ អ្នកអាណាព្យាបាលមុនទៅសាលារៀន និងមកវិញ', maxScore: 1, defaultScore: 0 },
  { id: 'order_11', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'រាយការណ៍ជាបន្ទាន់ជូននាយក ឬគ្រូបង្រៀនពេលមានបាតុភាពអសកម្ម', maxScore: 1, defaultScore: 0 },
  { id: 'order_12', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'សិស្សឱ្យចេះសម្អាតខ្លួនប្រាណ', maxScore: 1, defaultScore: 1 },
  { id: 'order_13', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'សិស្សឱ្យចេះសម្អាតសម្លៀកបំពាក់ ទ្រនាប់ជើង ស្រោមជើង', maxScore: 1, defaultScore: 1 },
  { id: 'order_14', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'កាត់សក់ខ្លី (សិស្សប្រុស) សិតសក់ ចងឬកៀបសក់ឱ្យមានរបៀប(សិស្សស្រី)', maxScore: 1, defaultScore: 1 },
  { id: 'order_15', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'រៀបចំផ្ទះសម្បែង បន្ទប់គេង សម្ភារៈប្រើប្រាស់', maxScore: 1, defaultScore: 1 },
  { id: 'order_16', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'ចេះទុកដាក់សំរាម និងរើសសំរាមដាក់ធុង', maxScore: 1, defaultScore: 1 },
  { id: 'order_17', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'កំណត់បានប្រភេទសម្លៀកបំពាក់ប្រចាំថ្ងៃ និងសម្លៀកបំពាក់សម្រាប់កម្មវិធីផ្សេងៗ', maxScore: 1, defaultScore: 1 },
  { id: 'order_18', category: 'order', categoryKm: 'របៀប', categoryOrder: 3, criterionText: 'ចេះទទួលបដិសណ្ឋារកិច្ចចំពោះភ្ញៀវជាតិ អន្តរជាតិ', maxScore: 1, defaultScore: 1 },

  // ៤. ទៀងពេល (៨ លក្ខណៈវិនិច្ឆ័យ - សរុប ៨ ពិន្ទុ)
  { id: 'punctual_1', category: 'punctual', categoryKm: 'ទៀងពេល', categoryOrder: 4, criterionText: 'មករៀនបានទៀងទាត់ និងទាន់ពេល', maxScore: 1, defaultScore: 1 },
  { id: 'punctual_2', category: 'punctual', categoryKm: 'ទៀងពេល', categoryOrder: 4, criterionText: 'ចុលរួមគោរពទង់ជាតិទៀងទាត់', maxScore: 1, defaultScore: 1 },
  { id: 'punctual_3', category: 'punctual', categoryKm: 'ទៀងពេល', categoryOrder: 4, criterionText: 'ពេលឈប់សម្រាកត្រូវមានច្បាប់ទម្លាប់ និងមូលហេតុ', maxScore: 1, defaultScore: 1 },
  { id: 'punctual_4', category: 'punctual', categoryKm: 'ទៀងពេល', categoryOrder: 4, criterionText: 'ខិតខំធ្វើកិច្ចការ និងខិតខំរៀនសូត្រប្រចាំថ្ងៃ', maxScore: 1, defaultScore: 1 },
  { id: 'punctual_5', category: 'punctual', categoryKm: 'ទៀងពេល', categoryOrder: 4, criterionText: 'មិនឈប់លេងតាមផ្លូវពេលចេញពីសាលារៀនទៅផ្ទះ ឬពីផ្ទះទៅសាលារៀន', maxScore: 1, defaultScore: 1 },
  { id: 'punctual_6', category: 'punctual', categoryKm: 'ទៀងពេល', categoryOrder: 4, criterionText: 'កំណត់ពេលវេលាធ្វើកិច្ចការ និងធ្វើកិច្ចការបានទៀងទាត់', maxScore: 1, defaultScore: 1 },
  { id: 'punctual_7', category: 'punctual', categoryKm: 'ទៀងពេល', categoryOrder: 4, criterionText: 'គោរពពេលវាលាជាប្រចាំ', maxScore: 1, defaultScore: 1 },
  { id: 'punctual_8', category: 'punctual', categoryKm: 'ទៀងពេល', categoryOrder: 4, criterionText: 'ហាត់ប្រាណថែរក្សាសុខភាពជាប្រចាំ', maxScore: 1, defaultScore: 1 },

  // ៥. សមាធិ (១៤ លក្ខណៈវិនិច្ឆ័យ - សរុប ១០ ពិន្ទុ)
  { id: 'meditation_1', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'ប្រមូលអារម្មណ៍ត្រងត្រាប់ស្តាប់ការណែនាំរបស់លោកគ្រូអ្នកគ្រូ', maxScore: 1, defaultScore: 1 },
  { id: 'meditation_2', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'ការតាំងចិត្តស្តាប់សំឡេងខាងក្នុង', maxScore: 1, defaultScore: 0 },
  { id: 'meditation_3', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'ការអត់ធ្មត់ស្តាប់សំឡេងខ្យល់ដង្ហើមចេញចូល', maxScore: 1, defaultScore: 0 },
  { id: 'meditation_4', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'ហ្វឹកហាត់ស្រូប និងបញ្ចេញខ្យលដង្ហើមចេញចូលឱ្យវែងៗ យឺតៗ', maxScore: 1, defaultScore: 0 },
  { id: 'meditation_5', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'ហ្វឹកហាត់ប្រមូលអារម្មណ៍ដោយសេចក្តីពិចារណានូវសកម្មភាពល្អៗដែលបានធ្វើប្រចាំថ្ងៃ', maxScore: 1, defaultScore: 1 },
  { id: 'meditation_6', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'មានសុខភាពល្អ ស្មារតីក្លៀវក្លា ស្វាហាប់ និងថ្លាអារម្មណ៍គិតអ្វីៗក្នុងផ្លូវល្អវិជ្ជមានជានិច្ច', maxScore: 1, defaultScore: 1 },
  { id: 'meditation_7', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'ស្វែងយល់ពីអំពើល្អ និងព្យាយាមធ្វើទង្វើល្អនោះជាប្រចាំ', maxScore: 1, defaultScore: 1 },
  { id: 'meditation_8', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'ធ្វើអំពើល្អជានិច្ច', maxScore: 1, defaultScore: 1 },
  { id: 'meditation_9', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'ធ្វើអ្វីដែលជាគុណប្រយោជន៍ចំពោះខ្លួនឯង គ្រួសារ សាលារៀន និងសង្គម', maxScore: 1, defaultScore: 1 },
  { id: 'meditation_10', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'ចេះត្រិះរិះពិចារណារកហេតុផល', maxScore: 1, defaultScore: 1 },
  { id: 'meditation_11', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'ហ៊ានទទួលខុសត្រូវចំពោះទង្វើរបស់ខ្លួន', maxScore: 1, defaultScore: 1 },
  { id: 'meditation_12', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'ប្រមូលអារម្មណ៍យកចិត្តទុកដាក់រៀនសូត្រ', maxScore: 1, defaultScore: 1 },
  { id: 'meditation_13', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'ចេះទប់និងរម្ងាប់អារម្មណ៍', maxScore: 1, defaultScore: 1 },
  { id: 'meditation_14', category: 'meditation', categoryKm: 'សមាធិ', categoryOrder: 5, criterionText: 'ប្រកាន់ភ្ជាប់សីល៥ អប់រំផ្លូវចិត្ត', maxScore: 1, defaultScore: 0 },
];

export interface StudentAttitudeEvaluationRecord {
  studentName: string;
  studentId: string;
  className: string;
  scores: Record<string, number>;
  totalScore: number; // 63
  maxScore: number;   // 74
  scaledTen: number;  // 8.51 (ធៀបនឹង ១០.០០)
  scaledOne: number;  // 0.85 (មិនឱ្យលើសពី ១)
  grade: 'ល្អ' | 'ល្អបង្គួរ' | 'មធ្យម' | 'ខ្សោយ';
  lunarDateKm: string;
  solarDateKm: string;
  principalNameKm: string;
  teacherNameKm: string;
}

export const REAL_CLASS_STUDENTS_LIST: Array<{ id: string; studentId: string; name: string; gender: 'Male' | 'Female' }> = [
  { id: 'stu_1', studentId: 'STU-06A-01', name: 'ចាន់ ផៃយ៉ា', gender: 'Male' },
  { id: 'stu_2', studentId: 'STU-06A-02', name: 'ចេន តាំងលី', gender: 'Male' },
  { id: 'stu_3', studentId: 'STU-06A-03', name: 'ចេន សុខឃាង', gender: 'Female' },
  { id: 'stu_4', studentId: 'STU-06A-04', name: 'ឆោម រស្មី', gender: 'Female' },
  { id: 'stu_5', studentId: 'STU-06A-05', name: 'ជី សុខជាតិ', gender: 'Male' },
  { id: 'stu_6', studentId: 'STU-06A-06', name: 'ឈា សូលីសា', gender: 'Female' },
  { id: 'stu_7', studentId: 'STU-06A-07', name: 'ឈុម សារ៉ាយុទ្ធ', gender: 'Male' },
  { id: 'stu_8', studentId: 'STU-06A-08', name: 'នីម សំអាង', gender: 'Male' },
  { id: 'stu_9', studentId: 'STU-06A-09', name: 'ពៅ យ៉ានីន', gender: 'Female' },
  { id: 'stu_10', studentId: 'STU-06A-10', name: 'ម៉េង មេត្តា', gender: 'Female' },
  { id: 'stu_11', studentId: 'STU-06A-11', name: 'មាស សុខហ៊ាន', gender: 'Male' },
  { id: 'stu_12', studentId: 'STU-06A-12', name: 'មួន សុចិន្ដា', gender: 'Female' },
  { id: 'stu_13', studentId: 'STU-06A-13', name: 'យាត ស៊ីយុទ្ធ', gender: 'Male' },
  { id: 'stu_14', studentId: 'STU-06A-14', name: 'យូ សុខនិតា', gender: 'Female' },
  { id: 'stu_15', studentId: 'STU-06A-15', name: 'រ៉ន ផាណេត', gender: 'Male' },
  { id: 'stu_16', studentId: 'STU-06A-16', name: 'រុំ ណារ៉ា', gender: 'Male' },
  { id: 'stu_17', studentId: 'STU-06A-17', name: 'ស៊ន ស្រីលិស', gender: 'Female' },
  { id: 'stu_18', studentId: 'STU-06A-18', name: 'ស៊្រីន គឹមស្រួ', gender: 'Female' },
  { id: 'stu_19', studentId: 'STU-06A-19', name: 'សី ផាន់នីត', gender: 'Male' },
  { id: 'stu_20', studentId: 'STU-06A-20', name: 'ស្រស់ ផាន់ណា', gender: 'Male' },
  { id: 'stu_21', studentId: 'STU-06A-21', name: 'សំអូន ថៃរីន', gender: 'Female' },
  { id: 'stu_22', studentId: 'STU-06A-22', name: 'ហុង លីហូវ', gender: 'Male' },
  { id: 'stu_23', studentId: 'STU-06A-23', name: 'ហេន សៀងហ៊ីម', gender: 'Female' },
  { id: 'stu_24', studentId: 'STU-06A-24', name: 'អ៊ូង សុខឃាង', gender: 'Male' },
  { id: 'stu_25', studentId: 'STU-06A-25', name: 'អាត ចាន់ត្រា', gender: 'Male' },
];

/**
 * Generates initial default attitude records for all 25 students based on MoEYS Appendix 4
 */
export function getDefaultAttitudeRecords(): Record<string, StudentAttitudeEvaluationRecord> {
  const defaultScoresMap: Record<string, number> = {};
  ATTITUDE_CRITERIA.forEach((c) => {
    defaultScoresMap[c.id] = c.defaultScore;
  });

  const records: Record<string, StudentAttitudeEvaluationRecord> = {};
  REAL_CLASS_STUDENTS_LIST.forEach((s) => {
    records[s.id] = {
      studentName: s.name,
      studentId: s.id,
      className: '៦(ក)',
      scores: { ...defaultScoresMap },
      totalScore: 63,
      maxScore: 74,
      scaledTen: 8.51,
      scaledOne: 0.85,
      grade: 'ល្អ',
      lunarDateKm: 'ថ្ងៃសៅរ៍ ២កើត ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ព.ស២៥៧០',
      solarDateKm: 'ប្រទង, ថ្ងៃទី១៥ ខែសីហា ឆ្នាំ២០២៦',
      principalNameKm: 'នាយកសាលា',
      teacherNameKm: 'ផាន សិតការណ៍',
    };
  });

  return records;
}

/**
 * Standard Skills (បំណិនសម្បទា - ១០%) rubric components
 */
export interface SkillRubricItem {
  id: string;
  nameKm: string;
  nameEn: string;
  descriptionKm: string;
  weight: number; // e.g. 2 points each, max 10
  score: number;
}

export const DEFAULT_SKILL_RUBRIC: SkillRubricItem[] = [
  {
    id: 'skill_1',
    nameKm: 'ជំនាញទំនាក់ទំនង និងការបកស្រាយ (Communication)',
    nameEn: 'Communication & Expression',
    descriptionKm: 'ចេះប្រើប្រាស់ពាក្យសម្តីសមរម្យ ឆ្លើយសំណួរបានក្បោះក្បាយ និងបញ្ចេញមតិយោបល់ច្បាស់លាស់',
    weight: 2,
    score: 1.8,
  },
  {
    id: 'skill_2',
    nameKm: 'ជំនាញដោះស្រាយបញ្ហា និងការគិតស៊ីជម្រៅ (Problem Solving)',
    nameEn: 'Problem Solving & Critical Thinking',
    descriptionKm: 'ចេះវិភាគបញ្ហាលំហាត់ ស្វែងរកដំណោះស្រាយសមស្រប និងមានគំនិតត្រិះរិះពិចារណា',
    weight: 2,
    score: 1.7,
  },
  {
    id: 'skill_3',
    nameKm: 'ជំនាញធ្វើការងារជាក្រុម និងសហការ (Collaboration & Teamwork)',
    nameEn: 'Collaboration & Teamwork',
    descriptionKm: 'ចេះសហការជាមួយមិត្តរួមថ្នាក់ ជួយគ្នាទៅវិញទៅមកក្នុងការងារក្រុម និងស្តាប់យោបល់ភាគច្រើន',
    weight: 2,
    score: 1.9,
  },
  {
    id: 'skill_4',
    nameKm: 'ជំនាញអនុវត្តជាក់ស្តែង និងកិច្ចការដៃ (Practical Application)',
    nameEn: 'Practical Hands-on Application',
    descriptionKm: 'ចេះអនុវត្តការពិសោធន៍ គូរគំនូរ បត់ក្រដាស ថែទាំសួនបន្លែ ឬកិច្ចការផលិតសម្ភារៈ',
    weight: 2,
    score: 1.8,
  },
  {
    id: 'skill_5',
    nameKm: 'គំនិតច្នៃប្រឌិត និងការស្វែងយល់ (Creativity & Inquiry)',
    nameEn: 'Creativity & Lifelong Inquiry',
    descriptionKm: 'មានគំនិតច្នៃប្រឌិតថ្មីៗ ចូលចិត្តស្វែងរកចំណេះដឹងបន្ថែម និងសួរដេញដោលស្រាវជ្រាវ',
    weight: 2,
    score: 1.8,
  },
];
