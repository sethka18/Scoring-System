#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate Grade 1 and Grade 2 Khmer Curriculum files from MoEYS 2025-2026 distribution
"""
import json

def make_ts_file(var_name, program_id, grade, title_km, title_en, lessons):
    header = f"""import {{ CurriculumProgram }} from '../types';

export const {var_name}: CurriculumProgram = {{
  id: '{program_id}',
  gradeLevel: {grade},
  academicYear: '២០២៥-២០២៦',
  subjectId: 'sub_khmer',
  titleKm: '{title_km}',
  titleEn: '{title_en}',
  lessons: """
    
    body = json.dumps(lessons, ensure_ascii=False, indent=4)
    footer = "\n};\n"
    return header + body + footer

print("Generator script loaded")
