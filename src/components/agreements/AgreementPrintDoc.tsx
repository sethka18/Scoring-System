import React from 'react';
import { Student, StudentAgreementPlan, ClassSection, SchoolProfile, GradeLetter } from '../../types';
import { GRADE_LETTERS, GRADE_CRITERIA_NOTE } from '../../utils/agreementPlanUtils';
import { OfficialSchoolStamp } from '../reports/OfficialSchoolStamp';

interface AgreementPrintDocProps {
  student: Student;
  plan: StudentAgreementPlan;
  activeClass?: ClassSection;
  schoolProfile?: SchoolProfile;
  showStamp?: boolean;
}

export const AgreementPrintDoc: React.FC<AgreementPrintDocProps> = ({
  student,
  plan,
  activeClass,
  schoolProfile,
  showStamp = true,
}) => {
  const schoolName = schoolProfile?.schoolNameKm || activeClass?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង';
  const province = schoolProfile?.province || activeClass?.province || 'កំពង់ចាម';
  const className = activeClass?.nameKm || activeClass?.name || 'ថ្នាក់ទី ៦ ក';
  const academicYear = plan.academicYear || schoolProfile?.academicYear || '២០២៦-២០២៧';
  const guardianName = plan.guardianName || student.guardianName || '....................................';
  const guardianPhone = plan.guardianPhone || student.guardianPhone || '....................................';
  const teacherName = plan.teacherName || activeClass?.teacherNameKm || activeClass?.teacherName || 'លោកគ្រូ ផាន សិតការណ៍';
  const teacherPhone = plan.teacherPhone || schoolProfile?.phone || '012 345 678';
  const lunarDate = plan.agreementDateLunar || 'ថ្ងៃព្រហស្បតិ៍ ៨កើត ខែកត្តិក ឆ្នាំរោង ឆស័ក ព.ស ២៥៦៨';
  const solarDate = plan.agreementDateSolar ? `ថ្ងៃទី ${new Date(plan.agreementDateSolar).getDate()} ខែវិច្ឆិកា ឆ្នាំ២០២៦` : 'ថ្ងៃទី ០៥ ខែវិច្ឆិកា ឆ្នាំ២០២៦';

  const renderGradeRow = (label: string, selectedGrade?: GradeLetter) => {
    return (
      <tr className="border-b border-slate-900 text-center">
        <td className="border-r border-slate-900 px-3 py-2 text-left font-semibold text-slate-900 text-sm">
          {label}
        </td>
        {GRADE_LETTERS.map((grade) => {
          const isSelected = selectedGrade === grade;
          return (
            <td key={grade} className="border-r border-slate-900 px-3 py-2 text-base font-bold">
              {isSelected ? (
                <span className="inline-flex items-center justify-center w-6 h-6 border-2 border-slate-950 bg-slate-900 text-white rounded font-mono text-sm">
                  ✓
                </span>
              ) : (
                <span className="inline-block w-5 h-5 border border-slate-400 rounded-sm bg-white" />
              )}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="agreement-print-container text-slate-900 bg-white leading-relaxed">
      {/* =========================================================================
          PAGE 1: ក្របមុខកិច្ចព្រមព្រៀង (Agreement Cover Page)
          ========================================================================= */}
      <div className="min-h-[1050px] w-full p-8 sm:p-12 flex flex-col justify-between border-4 border-double border-slate-900 relative page-break-after bg-white print:border-4 print:border-double print:border-slate-900 print:min-h-[1050px] print:p-8 rounded-xs">
        {/* Subtle corner decorative accents */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-slate-900 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-slate-900 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-slate-900 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-slate-900 pointer-events-none" />

        {/* Top Section: Kingdom Motto & Titles */}
        <div>
          {/* Kingdom Motto */}
          <div className="text-center pt-2 pb-2">
            <div className="font-moul text-lg sm:text-xl text-slate-900 tracking-wider">
              ព្រះរាជាណាចក្រកម្ពុជា
            </div>
            <div className="font-moul text-base sm:text-lg text-slate-900 mt-1">
              ជាតិ សាសនា ព្រះមហាក្សត្រ
            </div>
            <div className="flex justify-center items-center my-2 text-slate-800">
              <span className="w-12 h-0.5 bg-slate-800"></span>
              <span className="mx-2 text-xs">❖</span>
              <span className="w-12 h-0.5 bg-slate-800"></span>
            </div>
          </div>

          {/* Agreement Title Block */}
          <div className="text-center my-6 space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold font-moul tracking-widest text-slate-950 leading-tight">
              កិច្ចព្រមព្រៀង
            </h1>
            <div className="text-lg font-bold text-slate-800 py-0.5">
              រវាង
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-moul text-slate-950 leading-tight">
              គ្រូបង្រៀន
            </h2>
            <div className="text-lg font-bold text-slate-800 py-0.5">
              និង
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-moul text-slate-950 leading-tight">
              មាតាបិតា អ្នកអាណាព្យាបាលសិស្ស
            </h2>
            <div className="text-lg font-bold text-slate-800 py-0.5">
              ស្តីពី
            </div>
            <div className="inline-block border-b-2 border-slate-900 pb-1 px-4 mt-1">
              <h3 className="text-xl sm:text-2xl font-bold font-moul text-blue-950 leading-tight">
                លទ្ធផលរំពឹងទុកលើការរៀនសូត្ររបស់សិស្ស
              </h3>
            </div>
          </div>

          {/* Symmetrical Information Table (Strict Column Alignment - មិនល្អៀងឆ្វេងស្តាំ) */}
          <div className="max-w-2xl mx-auto w-full my-8 font-khmer px-2">
            <table className="w-full border-collapse">
              <tbody>
                {/* Row 1: Student Name & Gender */}
                <tr className="h-12">
                  <td className="w-44 font-bold text-slate-900 whitespace-nowrap align-middle text-base">
                    សិស្សឈ្មោះ ៖
                  </td>
                  <td className="w-[42%] pr-4 align-middle">
                    <div className="border-b-2 border-dotted border-slate-800 text-center font-bold text-slate-950 text-xl pb-0.5 tracking-wide">
                      {student.nameKm || student.name}
                    </div>
                  </td>
                  <td className="w-24 pl-2 font-bold text-slate-900 whitespace-nowrap align-middle text-base">
                    ភេទ ៖
                  </td>
                  <td className="w-[26%] align-middle">
                    <div className="border-b-2 border-dotted border-slate-800 text-center font-bold text-slate-900 text-lg pb-0.5">
                      {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                    </div>
                  </td>
                </tr>

                {/* Row 2: Class & Academic Year */}
                <tr className="h-12">
                  <td className="w-44 font-bold text-slate-900 whitespace-nowrap align-middle text-base">
                    ថ្នាក់ទី ៖
                  </td>
                  <td className="w-[42%] pr-4 align-middle">
                    <div className="border-b-2 border-dotted border-slate-800 text-center font-bold text-slate-900 text-base pb-0.5">
                      {className}
                    </div>
                  </td>
                  <td className="w-24 pl-2 font-bold text-slate-900 whitespace-nowrap align-middle text-base">
                    ឆ្នាំសិក្សា ៖
                  </td>
                  <td className="w-[26%] align-middle">
                    <div className="border-b-2 border-dotted border-slate-800 text-center font-bold text-slate-900 text-base pb-0.5">
                      {academicYear}
                    </div>
                  </td>
                </tr>

                {/* Row 3: School & Province */}
                <tr className="h-12">
                  <td className="w-44 font-bold text-slate-900 whitespace-nowrap align-middle text-base">
                    សាលារៀន ៖
                  </td>
                  <td className="w-[42%] pr-4 align-middle">
                    <div className="border-b-2 border-dotted border-slate-800 text-center font-bold text-slate-900 text-base pb-0.5 truncate">
                      {schoolName}
                    </div>
                  </td>
                  <td className="w-24 pl-2 font-bold text-slate-900 whitespace-nowrap align-middle text-base">
                    ខេត្ត ៖
                  </td>
                  <td className="w-[26%] align-middle">
                    <div className="border-b-2 border-dotted border-slate-800 text-center font-bold text-slate-900 text-base pb-0.5">
                      {province}
                    </div>
                  </td>
                </tr>

                {/* Row 4: Parent/Guardian & Phone */}
                <tr className="h-12">
                  <td className="w-44 font-bold text-slate-900 whitespace-nowrap align-middle text-base">
                    ឈ្មោះមាតាបិតា ៖
                  </td>
                  <td className="w-[42%] pr-4 align-middle">
                    <div className="border-b-2 border-dotted border-slate-800 text-center font-semibold text-slate-900 text-base pb-0.5">
                      {guardianName}
                    </div>
                  </td>
                  <td className="w-24 pl-2 font-bold text-slate-900 whitespace-nowrap align-middle text-base">
                    លេខទូរស័ព្ទ ៖
                  </td>
                  <td className="w-[26%] align-middle">
                    <div className="border-b-2 border-dotted border-slate-800 text-center font-semibold text-slate-900 text-base pb-0.5 font-mono">
                      {guardianPhone}
                    </div>
                  </td>
                </tr>

                {/* Row 5: Teacher & Phone */}
                <tr className="h-12">
                  <td className="w-44 font-bold text-slate-900 whitespace-nowrap align-middle text-base">
                    ឈ្មោះគ្រូបន្ទុកថ្នាក់ ៖
                  </td>
                  <td className="w-[42%] pr-4 align-middle">
                    <div className="border-b-2 border-dotted border-slate-800 text-center font-semibold text-slate-900 text-base pb-0.5">
                      {teacherName}
                    </div>
                  </td>
                  <td className="w-24 pl-2 font-bold text-slate-900 whitespace-nowrap align-middle text-base">
                    លេខទូរស័ព្ទ ៖
                  </td>
                  <td className="w-[26%] align-middle">
                    <div className="border-b-2 border-dotted border-slate-800 text-center font-semibold text-slate-900 text-base pb-0.5 font-mono">
                      {teacherPhone}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Criteria Box */}
        <div className="mt-8 border-2 border-slate-900 rounded-lg p-4 bg-slate-50/70">
          <div className="text-center font-bold text-slate-900 text-sm mb-2.5 font-khmer">
            កំណត់ចំណាំកម្រិតពិន្ទុ
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs font-khmer">
            {GRADE_CRITERIA_NOTE.map((item) => (
              <div key={item.grade} className="border border-slate-300 rounded p-1.5 bg-white shadow-2xs flex flex-col justify-center items-center">
                <span className={`font-extrabold text-base ${item.color}`}>{item.grade}</span>
                <span className="text-slate-800 font-bold mt-0.5">{item.range}</span>
                <span className="text-slate-500 text-[11px] mt-0.5">{item.labelKm}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          PAGE 2: តារាងលទ្ធផលរំពឹងទុក និងកាតព្វកិច្ច (Expected Outcomes & Obligations)
          ========================================================================= */}
      <div className="min-h-[1050px] w-full p-8 sm:p-12 flex flex-col justify-between border-4 border-double border-slate-900 relative bg-white print:border-4 print:border-double print:border-slate-900 print:min-h-[1050px] print:p-8 rounded-xs">
        {/* Subtle corner decorative accents */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-slate-900 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-slate-900 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-slate-900 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-slate-900 pointer-events-none" />
        <div>
          {/* Main Page 2 Title */}
          <h3 className="text-center text-xl font-bold font-moul text-slate-950 mb-6 leading-relaxed">
            លទ្ធផលរំពឹងទុកលើលទ្ធផលសិក្សារៀនសូត្ររបស់សិស្សតាមមុខវិជ្ជា
          </h3>

          {/* Section 1: Khmer Language */}
          <div className="mb-6">
            <h4 className="text-base font-bold text-slate-950 mb-2">
              ១) សិស្សទទួលបាននិទ្ទេសមុខវិជ្ជា៖ <span className="text-blue-900 font-bold">ភាសាខ្មែរ</span>
            </h4>
            <div className="overflow-hidden border border-slate-900 rounded-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                    <th className="border-r border-slate-900 px-3 py-2 text-left w-36">និទ្ទេស</th>
                    {GRADE_LETTERS.map((g) => (
                      <th key={g} className="border-r border-slate-900 px-3 py-2 w-14 font-extrabold text-slate-900">
                        {g}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {renderGradeRow('ដើមឆ្នាំ', plan.khmer?.baselineGrade)}
                  {renderGradeRow('គ្រោងចុងឆ្នាំ', plan.khmer?.targetGrade)}
                  {renderGradeRow('សម្រេចចុងឆ្នាំ', plan.khmer?.achievedGrade)}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Mathematics */}
          <div className="mb-6">
            <h4 className="text-base font-bold text-slate-950 mb-2">
              ២) សិស្សទទួលបាននិទ្ទេសមុខវិជ្ជា៖ <span className="text-blue-900 font-bold">គណិតវិទ្យា</span>
            </h4>
            <div className="overflow-hidden border border-slate-900 rounded-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                    <th className="border-r border-slate-900 px-3 py-2 text-left w-36">និទ្ទេស</th>
                    {GRADE_LETTERS.map((g) => (
                      <th key={g} className="border-r border-slate-900 px-3 py-2 w-14 font-extrabold text-slate-900">
                        {g}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {renderGradeRow('ដើមឆ្នាំ', plan.math?.baselineGrade)}
                  {renderGradeRow('គ្រោងចុងឆ្នាំ', plan.math?.targetGrade)}
                  {renderGradeRow('សម្រេចចុងឆ្នាំ', plan.math?.achievedGrade)}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Parent Obligations */}
          <div className="mb-5 text-sm text-slate-900 leading-relaxed font-khmer">
            <h5 className="font-bold text-slate-950 mb-1.5 underline decoration-slate-400 underline-offset-4">
              កាតព្វកិច្ចរបស់មាតាបិតា អ្នកអាណាព្យាបាលសិស្ស៖
            </h5>
            <ol className="list-decimal list-outside pl-5 space-y-1 text-slate-800">
              <li>
                ត្រូវជួយបង្រៀន និង/ឬ ដឹកនាំកូនធ្វើកិច្ចការផ្ទះ ដែលលោកគ្រូ អ្នកគ្រូបានដាក់ពីសាលារៀន
              </li>
              <li>
                ត្រូវជួយឧបត្ថម្ភគាំទ្រដល់កូនៗ ទាំងស្មារតី និងសម្ភារៈ ព្រមទាំងលើកទឹកចិត្តពួកគេបានរៀនទៀងទាត់ និងទាន់ពេលវេលាជារៀងរាល់ថ្ងៃ។
              </li>
              <li>
                ទំនាក់ទំនងជាប្រចាំនិងចូលរួមប្រជុំប្រចាំខែជាមួយគ្រូបង្រៀន ដើម្បីរួមគ្នាតាមដានការសិក្សារបស់កូន និងដោះស្រាយការលំបាកនានាដែលថ្នាក់រៀនជួបប្រទះ។
              </li>
            </ol>
          </div>

          {/* Section 4: Teacher Obligations */}
          <div className="mb-5 text-sm text-slate-900 leading-relaxed font-khmer">
            <h5 className="font-bold text-slate-950 mb-1.5 underline decoration-slate-400 underline-offset-4">
              កាតព្វកិច្ចរបស់គ្រូបង្រៀន៖
            </h5>
            <ol className="list-decimal list-outside pl-5 space-y-1 text-slate-800">
              <li>
                រៀបចំកម្មវិធីបង្រៀនបន្ថែម និងបង្រៀនសិស្សឱ្យសម្រេចតាមផែនការ និងទាន់កម្មវិធីសិក្សាថ្នាក់កំពុងរៀន
              </li>
              <li>
                យកចិត្តទុកដាក់បង្រៀន និងតាមដានលទ្ធផលសិក្សារបស់សិស្សជារៀងរាល់ថ្ងៃ សប្តាហ៍ ខែ និងត្រីមាស។
              </li>
              <li>
                ទំនាក់ទំនងជាមួយមាតាបិតា អ្នកអាណាព្យាបាលសិស្សជាប្រចាំ ដើម្បីរួមគ្នាដោះស្រាយការលំបាករបស់សិស្ស និងតម្រូវការចាំបាច់សម្រាប់ដំណើរការថ្នាក់រៀនបានទាន់ពេលវេលា។
              </li>
            </ol>
          </div>

          {/* Section 5: Common Consensus */}
          <div className="p-3 bg-slate-50 border border-slate-300 rounded text-xs sm:text-sm font-semibold text-slate-900 text-center leading-normal mb-6">
            ភាគីទាំងពីរមានការឯកភាពគ្នាក្នុងការជួយជំរុញ និងបំពេញកាតព្វកិច្ចរៀងៗខ្លួន ដើម្បីសម្រេចឱ្យបាននូវលទ្ធផលសិក្សារបស់សិស្សតាមផែនការដែលបានគ្រោងទុកខាងលើ។
          </div>
        </div>

        {/* Section 6: Signatures and Dates */}
        <div className="pt-2 font-khmer">
          <div className="text-right text-xs sm:text-sm space-y-0.5 mb-6 text-slate-800">
            <div>{lunarDate}</div>
            <div>{province} {solarDate}</div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-center text-sm font-bold text-slate-950">
            {/* Teacher Signature */}
            <div className="flex flex-col items-center">
              <div>ហត្ថលេខា គ្រូទទួលបន្ទុកថ្នាក់</div>
              <div className="h-28 flex items-center justify-center relative w-full my-2">
                {showStamp && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-85 pointer-events-none">
                    <OfficialSchoolStamp size={90} rotation={-5} />
                  </div>
                )}
                <span className="font-serif italic text-blue-900 font-normal text-lg relative z-10 select-none">
                  {teacherName}
                </span>
              </div>
              <div className="text-slate-900 font-semibold">{teacherName}</div>
            </div>

            {/* Guardian Signature */}
            <div className="flex flex-col items-center">
              <div>ហត្ថលេខាឬស្នាមមេដៃមាតាបិតា</div>
              <div className="h-28 flex items-end justify-center border-b border-dotted border-slate-400 pb-2 w-48 mx-auto my-2">
                <span className="text-xs text-slate-400 italic font-normal">
                  (ស្នាមមេដៃ ឬហត្ថលេខា)
                </span>
              </div>
              <div className="text-slate-900 font-semibold">{guardianName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
