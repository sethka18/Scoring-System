import { CurriculumProgram } from '../types';
import { CURRICULUM_MATH_GRADE1 } from './curriculumMathGrade1';
import { CURRICULUM_MATH_GRADE2 } from './curriculumMathGrade2';
import { CURRICULUM_MATH_GRADE3 } from './curriculumMathGrade3';
import { CURRICULUM_MATH_GRADE4 } from './curriculumMathGrade4';
import { CURRICULUM_MATH_GRADE5 } from './curriculumMathGrade5';
import { CURRICULUM_MATH_GRADE6 } from './curriculumMathGrade6';

import { CURRICULUM_KHMER_GRADE1 } from './curriculumKhmerGrade1';
import { CURRICULUM_KHMER_GRADE2 } from './curriculumKhmerGrade2';
import { CURRICULUM_KHMER_GRADE3 } from './curriculumKhmerGrade3';
import { CURRICULUM_KHMER_GRADE4 } from './curriculumKhmerGrade4';
import { CURRICULUM_KHMER_GRADE5 } from './curriculumKhmerGrade5';
import { CURRICULUM_KHMER_GRADE6 } from './curriculumKhmerGrade6';

import { CURRICULUM_SOCIAL_GRADE1 } from './curriculumSocialGrade1';
import { CURRICULUM_SOCIAL_GRADE2 } from './curriculumSocialGrade2';
import { CURRICULUM_SOCIAL_GRADE3 } from './curriculumSocialGrade3';
import { CURRICULUM_SOCIAL_GRADE4 } from './curriculumSocialGrade4';
import { CURRICULUM_SOCIAL_GRADE5 } from './curriculumSocialGrade5';
import { CURRICULUM_SOCIAL_GRADE6 } from './curriculumSocialGrade6';

import { CURRICULUM_SCIENCE_GRADE4 } from './curriculumScienceGrade4';
import { CURRICULUM_SCIENCE_GRADE5 } from './curriculumScienceGrade5';
import { CURRICULUM_SCIENCE_GRADE6 } from './curriculumScienceGrade6';

// For Grades 1-3, MoEYS curriculum combines Social Studies and Science into one single volume (សិក្សាសង្គម-វិទ្យាសាស្ត្រ)
export const CURRICULUM_SCIENCE_GRADE1_COMBINED: CurriculumProgram = {
  ...CURRICULUM_SOCIAL_GRADE1,
  id: 'prog_science_g1_combined',
  subjectId: 'sub_science',
  titleKm: 'កម្មវិធីសិក្សាសិក្សាសង្គម-វិទ្យាសាស្ត្រ ថ្នាក់ទី១ (ក្បាលរួមគ្នា MoEYS)',
  titleEn: 'Social Studies & Science Grade 1 Curriculum (Combined Volume)',
};

export const CURRICULUM_SCIENCE_GRADE2_COMBINED: CurriculumProgram = {
  ...CURRICULUM_SOCIAL_GRADE2,
  id: 'prog_science_g2_combined',
  subjectId: 'sub_science',
  titleKm: 'កម្មវិធីសិក្សាសិក្សាសង្គម-វិទ្យាសាស្ត្រ ថ្នាក់ទី២ (ក្បាលរួមគ្នា MoEYS)',
  titleEn: 'Social Studies & Science Grade 2 Curriculum (Combined Volume)',
};

export const CURRICULUM_SCIENCE_GRADE3_COMBINED: CurriculumProgram = {
  ...CURRICULUM_SOCIAL_GRADE3,
  id: 'prog_science_g3_combined',
  subjectId: 'sub_science',
  titleKm: 'កម្មវិធីសិក្សាសិក្សាសង្គម-វិទ្យាសាស្ត្រ ថ្នាក់ទី៣ (ក្បាលរួមគ្នា MoEYS)',
  titleEn: 'Social Studies & Science Grade 3 Curriculum (Combined Volume)',
};

export {
  CURRICULUM_MATH_GRADE1,
  CURRICULUM_MATH_GRADE2,
  CURRICULUM_MATH_GRADE3,
  CURRICULUM_MATH_GRADE4,
  CURRICULUM_MATH_GRADE5,
  CURRICULUM_MATH_GRADE6,
  CURRICULUM_KHMER_GRADE1,
  CURRICULUM_KHMER_GRADE2,
  CURRICULUM_KHMER_GRADE3,
  CURRICULUM_KHMER_GRADE4,
  CURRICULUM_KHMER_GRADE5,
  CURRICULUM_KHMER_GRADE6,
  CURRICULUM_SOCIAL_GRADE1,
  CURRICULUM_SOCIAL_GRADE2,
  CURRICULUM_SOCIAL_GRADE3,
  CURRICULUM_SOCIAL_GRADE4,
  CURRICULUM_SOCIAL_GRADE5,
  CURRICULUM_SOCIAL_GRADE6,
  CURRICULUM_SCIENCE_GRADE4,
  CURRICULUM_SCIENCE_GRADE5,
  CURRICULUM_SCIENCE_GRADE6,
};

export const ALL_MATH_CURRICULUM_PROGRAMS: CurriculumProgram[] = [
  CURRICULUM_MATH_GRADE1,
  CURRICULUM_MATH_GRADE2,
  CURRICULUM_MATH_GRADE3,
  CURRICULUM_MATH_GRADE4,
  CURRICULUM_MATH_GRADE5,
  CURRICULUM_MATH_GRADE6,
];

export const ALL_KHMER_CURRICULUM_PROGRAMS: CurriculumProgram[] = [
  CURRICULUM_KHMER_GRADE1,
  CURRICULUM_KHMER_GRADE2,
  CURRICULUM_KHMER_GRADE3,
  CURRICULUM_KHMER_GRADE4,
  CURRICULUM_KHMER_GRADE5,
  CURRICULUM_KHMER_GRADE6,
];

export const ALL_SOCIAL_CURRICULUM_PROGRAMS: CurriculumProgram[] = [
  CURRICULUM_SOCIAL_GRADE1,
  CURRICULUM_SOCIAL_GRADE2,
  CURRICULUM_SOCIAL_GRADE3,
  CURRICULUM_SOCIAL_GRADE4,
  CURRICULUM_SOCIAL_GRADE5,
  CURRICULUM_SOCIAL_GRADE6,
];

export const ALL_SCIENCE_CURRICULUM_PROGRAMS: CurriculumProgram[] = [
  CURRICULUM_SCIENCE_GRADE1_COMBINED,
  CURRICULUM_SCIENCE_GRADE2_COMBINED,
  CURRICULUM_SCIENCE_GRADE3_COMBINED,
  CURRICULUM_SCIENCE_GRADE4,
  CURRICULUM_SCIENCE_GRADE5,
  CURRICULUM_SCIENCE_GRADE6,
];


