import React from 'react';
import { Student, StudentAgreementPlan } from '../../types';
import { mapGradeToPtomLevel, PTOM_LEVEL_ROWS } from '../../utils/agreementPlanUtils';

interface PtomLearningPlanDocProps {
  student: Student;
  plan?: StudentAgreementPlan;
  className?: string;
  schoolName?: string;
  province?: string;
  academicYear?: string;
  teacherName?: string;
  teacherPhone?: string;
  guardianName?: string;
  guardianPhone?: string;
  districtOffice?: string;
  locationPlace?: string;
  solarDateText?: string;
  lunarDateText?: string;
}

export const PtomLearningPlanDoc: React.FC<PtomLearningPlanDocProps> = ({
  student,
  plan,
  className = '៦ (ក)',
  schoolName = 'បឋមសិក្សា ហ៊ុនណេងប្រទង',
  province = 'កំពង់ចាម',
  academicYear = '២០២៥-២០២៦',
  teacherName = 'ផាន សិតការណ៍',
  teacherPhone = '0882176987',
  guardianName = '......................',
  guardianPhone = '0882559162',
  districtOffice = 'ការិយាល័យអប់រំ យុវជននិងកីឡា និងរដ្ឋបាលស្រុកស្ទឹងត្រង់',
  locationPlace = 'ប្រទង',
  solarDateText = 'ថ្ងៃទី១៩ ខែមករា ឆ្នាំ២០២៦',
  lunarDateText = 'ថ្ងៃចន្ទ ១កើត ខែមាឃ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
}) => {
  const khmerPlan = plan?.khmer;
  const mathPlan = plan?.math;

  // Resolve values for each milestone column
  const khmerMilestones = {
    baseline: khmerPlan?.baselineGrade ? String(khmerPlan.baselineGrade) : '',
    q1: khmerPlan?.q1Grade || '',
    q2: khmerPlan?.q2Grade || '',
    q3: khmerPlan?.q3Grade || '',
    q4: khmerPlan?.q4Grade || '',
    endYear: khmerPlan?.endYearTestGrade || khmerPlan?.achievedGrade || '',
  };

  const mathMilestones = {
    baseline: mathPlan?.baselineGrade ? String(mathPlan.baselineGrade) : '',
    q1: mathPlan?.q1Grade || '',
    q2: mathPlan?.q2Grade || '',
    q3: mathPlan?.q3Grade || '',
    q4: mathPlan?.q4Grade || '',
    endYear: mathPlan?.endYearTestGrade || mathPlan?.achievedGrade || '',
  };

  // Helper to render cell value only if its grade maps to the row level
  const renderCellContent = (gradeValue: string, rowLevel: 4 | 3 | 2 | 1) => {
    if (!gradeValue) return null;
    const mappedLevel = mapGradeToPtomLevel(gradeValue);
    if (mappedLevel === rowLevel) {
      return (
        <span className="font-bold text-slate-950 text-base sm:text-lg tracking-wide">
          {gradeValue}
        </span>
      );
    }
    return null;
  };

  const studentNameDisplay = student.nameKm || student.name || 'អាត ចាន់ត្រា';
  const studentGenderDisplay = student.gender === 'Female' || student.gender === 'F' ? 'ស្រី' : 'ប្រុស';

  return (
    <div className="w-full max-w-[860px] mx-auto bg-white text-slate-950 p-6 sm:p-10 print:p-6 print:max-w-none print:w-full min-h-[1050px] flex flex-col justify-between font-khmer selection:bg-blue-100 page-break-after print:min-h-[1050px]">
      {/* -------------------------------------------------------------
          1. TOP HEADER (Ministry / Office & Kingdom Motto)
          ------------------------------------------------------------- */}
      <div>
        <div className="flex justify-between items-start pt-1 pb-3">
          {/* Left: Office & School */}
          <div className="text-left space-y-1 max-w-[60%]">
            <div className="font-moul text-sm sm:text-base leading-snug text-slate-950">
              {districtOffice}
            </div>
            <div className="font-moul text-sm sm:text-base text-slate-950">
              {schoolName.startsWith('សាលា') ? schoolName : `សាលា${schoolName}`}
            </div>
          </div>

          {/* Right: Kingdom Motto */}
          <div className="text-center space-y-1">
            <div className="font-moul text-sm sm:text-base text-slate-950 tracking-wider">
              ព្រះរាជាណាចក្រកម្ពុជា
            </div>
            <div className="font-moul text-sm sm:text-base text-slate-950">
              ជាតិ សាសនា ព្រះមហាក្សត្រ
            </div>
            <div className="flex justify-center items-center pt-0.5 text-slate-800">
              <span className="w-10 h-0.5 bg-slate-800 inline-block"></span>
              <span className="mx-1.5 text-[10px]">❖</span>
              <span className="w-10 h-0.5 bg-slate-800 inline-block"></span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            2. DOCUMENT TITLE
            ------------------------------------------------------------- */}
        <div className="text-center my-4 space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-bold font-moul text-slate-950 tracking-wide leading-relaxed">
            ផែនការរៀនសូត្រប្រចាំឆ្នាំរបស់សិស្សម្នាក់ៗ
          </h1>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            ដោយប្រើលទ្ធផល PTOM
          </h2>
          <div className="text-base sm:text-lg font-bold text-slate-900">
            ឆ្នាំសិក្សា {academicYear}
          </div>
        </div>

        {/* -------------------------------------------------------------
            3. STUDENT & CLASS INFORMATION BLOCK (4 Balanced Rows)
            ------------------------------------------------------------- */}
        <div className="my-5 text-sm sm:text-base leading-relaxed space-y-2 px-1">
          {/* Row 1: Student Name, Gender, Class */}
          <div className="flex flex-wrap items-baseline">
            <span className="font-bold text-slate-950 whitespace-nowrap mr-2">ឈ្មោះសិស្ស ៖</span>
            <span className="font-bold text-slate-950 text-base sm:text-lg border-b border-dotted border-slate-700 px-2 flex-1 min-w-[120px]">
              {studentNameDisplay}
            </span>
            <span className="font-bold text-slate-950 whitespace-nowrap mx-3">ភេទ ៖</span>
            <span className="font-bold text-slate-950 border-b border-dotted border-slate-700 px-2 min-w-[50px] text-center">
              {studentGenderDisplay}
            </span>
            <span className="font-bold text-slate-950 whitespace-nowrap mx-3">ថ្នាក់ទី៖</span>
            <span className="font-bold text-slate-950 border-b border-dotted border-slate-700 px-2 min-w-[80px] text-center">
              {className}
            </span>
          </div>

          {/* Row 2: School & Province */}
          <div className="flex flex-wrap items-baseline">
            <span className="font-bold text-slate-950 whitespace-nowrap mr-2">សាលារៀន ៖</span>
            <span className="font-semibold text-slate-950 border-b border-dotted border-slate-700 px-2 flex-1 min-w-[180px]">
              {schoolName}
            </span>
            <span className="font-bold text-slate-950 whitespace-nowrap mx-3">ខេត្ត ៖</span>
            <span className="font-semibold text-slate-950 border-b border-dotted border-slate-700 px-2 min-w-[120px]">
              {province}
            </span>
          </div>

          {/* Row 3: Guardian & Phone */}
          <div className="flex flex-wrap items-baseline">
            <span className="font-bold text-slate-950 whitespace-nowrap mr-2">ឈ្មោះមាតាបិតា ៖</span>
            <span className="font-semibold text-slate-950 border-b border-dotted border-slate-700 px-2 flex-1 min-w-[180px]">
              {guardianName || '......................'}
            </span>
            <span className="font-bold text-slate-950 whitespace-nowrap mx-3">លេខទូរស័ព្ទ ៖</span>
            <span className="font-semibold text-slate-950 border-b border-dotted border-slate-700 px-2 min-w-[120px] font-mono">
              {guardianPhone || ''}
            </span>
          </div>

          {/* Row 4: Teacher & Phone */}
          <div className="flex flex-wrap items-baseline">
            <span className="font-bold text-slate-950 whitespace-nowrap mr-2">ឈ្មោះគ្រូបន្ទុកថ្នាក់ ៖</span>
            <span className="font-semibold text-slate-950 border-b border-dotted border-slate-700 px-2 flex-1 min-w-[180px]">
              {teacherName}
            </span>
            <span className="font-bold text-slate-950 whitespace-nowrap mx-3">លេខទូរស័ព្ទ ៖</span>
            <span className="font-semibold text-slate-950 border-b border-dotted border-slate-700 px-2 min-w-[120px] font-mono">
              {teacherPhone || ''}
            </span>
          </div>
        </div>

        {/* -------------------------------------------------------------
            4. TABLE 1: ភាសាខ្មែរ (Khmer Language PTOM Matrix)
            ------------------------------------------------------------- */}
        <div className="my-4">
          <table className="w-full border-collapse border-2 border-slate-950 text-center text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th rowSpan={2} className="border border-slate-950 p-1.5 sm:p-2 font-bold w-[12%]">
                  និទ្ទេស
                </th>
                <th rowSpan={2} className="border border-slate-950 p-1.5 sm:p-2 font-bold w-[8%]">
                  កម្រិត
                </th>
                <th rowSpan={2} className="border border-slate-950 p-1.5 sm:p-2 font-bold w-[15%] leading-tight">
                  លទ្ធផលតេស្ត<br />ដើមឆ្នាំ
                </th>
                <th colSpan={4} className="border border-slate-950 p-1.5 sm:p-2 font-bold leading-tight">
                  លទ្ធផលសិក្សាតាមត្រីមាស- ភាសាខ្មែរ
                </th>
                <th rowSpan={2} className="border border-slate-950 p-1.5 sm:p-2 font-bold w-[15%] leading-tight">
                  លទ្ធផលតេស្ត<br />ចុងឆ្នាំ
                </th>
              </tr>
              <tr className="bg-slate-50">
                <th className="border border-slate-950 p-1 font-bold w-[12%]">ទី១</th>
                <th className="border border-slate-950 p-1 font-bold w-[12%]">ទី២</th>
                <th className="border border-slate-950 p-1 font-bold w-[12%]">ទី៣</th>
                <th className="border border-slate-950 p-1 font-bold w-[12%]">ទី៤</th>
              </tr>
            </thead>
            <tbody>
              {PTOM_LEVEL_ROWS.map((row) => (
                <tr key={`khmer-${row.level}`} className="h-9 sm:h-10">
                  <td className="border border-slate-950 font-bold text-slate-900 bg-slate-50/50">
                    {row.gradeRange}
                  </td>
                  <td className="border border-slate-950 font-bold text-slate-900">
                    {row.levelKm}
                  </td>
                  <td className="border border-slate-950">
                    {renderCellContent(khmerMilestones.baseline, row.level)}
                  </td>
                  <td className="border border-slate-950">
                    {renderCellContent(khmerMilestones.q1, row.level)}
                  </td>
                  <td className="border border-slate-950">
                    {renderCellContent(khmerMilestones.q2, row.level)}
                  </td>
                  <td className="border border-slate-950">
                    {renderCellContent(khmerMilestones.q3, row.level)}
                  </td>
                  <td className="border border-slate-950">
                    {renderCellContent(khmerMilestones.q4, row.level)}
                  </td>
                  <td className="border border-slate-950">
                    {renderCellContent(khmerMilestones.endYear, row.level)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* -------------------------------------------------------------
            5. TABLE 2: គណិតវិទ្យា (Mathematics PTOM Matrix)
            ------------------------------------------------------------- */}
        <div className="my-4">
          <table className="w-full border-collapse border-2 border-slate-950 text-center text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th rowSpan={2} className="border border-slate-950 p-1.5 sm:p-2 font-bold w-[12%]">
                  និទ្ទេស
                </th>
                <th rowSpan={2} className="border border-slate-950 p-1.5 sm:p-2 font-bold w-[8%]">
                  កម្រិត
                </th>
                <th rowSpan={2} className="border border-slate-950 p-1.5 sm:p-2 font-bold w-[15%] leading-tight">
                  លទ្ធផលតេស្ត<br />ដើមឆ្នាំ
                </th>
                <th colSpan={4} className="border border-slate-950 p-1.5 sm:p-2 font-bold leading-tight">
                  លទ្ធផលសិក្សាតាមត្រីមាស- គណិតវិទ្យា
                </th>
                <th rowSpan={2} className="border border-slate-950 p-1.5 sm:p-2 font-bold w-[15%] leading-tight">
                  លទ្ធផលតេស្ត<br />ចុងឆ្នាំ
                </th>
              </tr>
              <tr className="bg-slate-50">
                <th className="border border-slate-950 p-1 font-bold w-[12%]">ទី១</th>
                <th className="border border-slate-950 p-1 font-bold w-[12%]">ទី២</th>
                <th className="border border-slate-950 p-1 font-bold w-[12%]">ទី៣</th>
                <th className="border border-slate-950 p-1 font-bold w-[12%]">ទី៤</th>
              </tr>
            </thead>
            <tbody>
              {PTOM_LEVEL_ROWS.map((row) => (
                <tr key={`math-${row.level}`} className="h-9 sm:h-10">
                  <td className="border border-slate-950 font-bold text-slate-900 bg-slate-50/50">
                    {row.gradeRange}
                  </td>
                  <td className="border border-slate-950 font-bold text-slate-900">
                    {row.levelKm}
                  </td>
                  <td className="border border-slate-950">
                    {renderCellContent(mathMilestones.baseline, row.level)}
                  </td>
                  <td className="border border-slate-950">
                    {renderCellContent(mathMilestones.q1, row.level)}
                  </td>
                  <td className="border border-slate-950">
                    {renderCellContent(mathMilestones.q2, row.level)}
                  </td>
                  <td className="border border-slate-950">
                    {renderCellContent(mathMilestones.q3, row.level)}
                  </td>
                  <td className="border border-slate-950">
                    {renderCellContent(mathMilestones.q4, row.level)}
                  </td>
                  <td className="border border-slate-950">
                    {renderCellContent(mathMilestones.endYear, row.level)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* -------------------------------------------------------------
            6. ASSESSMENT CRITERIA NOTE (កំណត់សម្គាល់)
            Matching red/burgundy colored note from the official document
            ------------------------------------------------------------- */}
        <div className="my-3 text-xs sm:text-[13px] text-red-700 leading-relaxed font-semibold">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <span className="font-bold">កំណត់សម្គាល់៖</span>
            <span>ក្រោម 50 = F</span>
            <span>50-60 = E</span>
            <span>61-70 = D</span>
            <span>71-80 = C</span>
            <span>81-90 = B</span>
            <span>91-100 = A</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mt-1 pl-4 sm:pl-16">
            <span>ក្រោម 50% = កម្រិត 1</span>
            <span>50-64% = កម្រិត 2</span>
            <span>65-79% = កម្រិត 3</span>
            <span>80% ឡើង = កម្រិត 4</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          7. DATES & SIGNATURES SECTION
          Exact layout matching the uploaded MoEYS document
          ------------------------------------------------------------- */}
      <div className="pt-2">
        {/* Date line & student signature (right-aligned) */}
        <div className="flex justify-end mb-4 text-xs sm:text-sm text-right pr-2">
          <div className="space-y-1 text-center">
            <div>{lunarDateText}</div>
            <div>ធ្វើនៅ {locationPlace} {solarDateText}</div>
            <div className="font-bold pt-1">ហត្ថលេខា ឈ្មោះសិស្ស</div>
            <div className="h-10 sm:h-12 flex items-center justify-center font-bold text-slate-900 text-sm sm:text-base">
              {studentNameDisplay}
            </div>
          </div>
        </div>

        {/* 3-Column Primary Signatures */}
        <div className="grid grid-cols-3 text-center text-xs sm:text-sm pt-1">
          {/* Column 1: Teacher in charge */}
          <div className="space-y-1 flex flex-col justify-between h-28 sm:h-32">
            <div>
              <div className="font-bold text-slate-950">បានឃើញ និងឯកភាព</div>
              <div className="font-bold text-slate-950">គ្រូទទួលបន្ទុកថ្នាក់</div>
            </div>
            <div className="font-bold text-slate-950 text-sm sm:text-base pb-1">
              {teacherName}
            </div>
          </div>

          {/* Column 2: Parent Signature at Start of Year */}
          <div className="space-y-1 flex flex-col justify-between h-28 sm:h-32">
            <div>
              <div className="font-bold text-slate-950">ហត្ថលេខាឬ</div>
              <div className="font-bold text-slate-950">ស្នាមមេដៃមាតាបិតា</div>
              <div className="font-bold text-slate-950">ដើមឆ្នាំ</div>
            </div>
            <div className="h-6"></div>
          </div>

          {/* Column 3: Parent Signature at End of Year */}
          <div className="space-y-1 flex flex-col justify-between h-28 sm:h-32">
            <div>
              <div className="font-bold text-slate-950">ហត្ថលេខាឬ</div>
              <div className="font-bold text-slate-950">ស្នាមមេដៃមាតាបិតា</div>
              <div className="font-bold text-slate-950">ចុងឆ្នាំ</div>
            </div>
            <div className="h-6"></div>
          </div>
        </div>

        {/* Bottom 2 Signatures: School Management Committee & Principal */}
        <div className="grid grid-cols-2 text-center text-xs sm:text-sm pt-4">
          {/* Committee Chair */}
          <div className="space-y-1">
            <div className="font-bold text-slate-950">បានឃើញនិងពិនិត្យត្រឹមត្រូវ</div>
            <div className="font-bold text-slate-950">ប្រធានគណៈកម្មការគ្រប់គ្រងសាលារៀន</div>
            <div className="h-12 sm:h-14"></div>
          </div>

          {/* School Principal */}
          <div className="space-y-1">
            <div className="font-bold text-slate-950">បានឃើញ និង ឯកភាព</div>
            <div className="font-bold text-slate-950">នាយកសាលា</div>
            <div className="h-12 sm:h-14"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
