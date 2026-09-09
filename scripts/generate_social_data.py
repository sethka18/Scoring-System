import json, os

def make_social_file(filepath, var_name, prog_id, grade, title_km, title_en, lessons):
    code = f"""import {{ CurriculumProgram }} from '../types';

export const {var_name}: CurriculumProgram = {{
  id: '{prog_id}',
  gradeLevel: {grade},
  academicYear: '២០២៥-២០២៦',
  subjectId: 'sub_social',
  titleKm: '{title_km}',
  titleEn: '{title_en}',
  lessons: {json.dumps(lessons, ensure_ascii=False, indent=2)}
}};
"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"Wrote {filepath}: {len(lessons)} lessons")

