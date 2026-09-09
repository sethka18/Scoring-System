#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Full generator for MoEYS Khmer Language Curricula (Grade 1 to Grade 6)
Academic Year 2025-2026
Hun Neng Pratong Primary School Standard
"""
import os
import json

def write_curriculum_file(filename, var_name, program_id, grade, title_km, title_en, lessons):
    content = f"""import {{ CurriculumProgram }} from '../types';

export const {var_name}: CurriculumProgram = {{
  id: '{program_id}',
  gradeLevel: {grade},
  academicYear: '២០២៥-២០២៦',
  subjectId: 'sub_khmer',
  titleKm: '{title_km}',
  titleEn: '{title_en}',
  lessons: {json.dumps(lessons, ensure_ascii=False, indent=2)}
}};
"""
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Successfully generated {filename} with {len(lessons)} lessons.")

print("Base helper ready")
