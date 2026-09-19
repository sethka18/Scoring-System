import React, { useState, useEffect } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { Save, RefreshCw, ClipboardList, Check, Sparkles } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  quantity: string;
}

const DEFAULT_ITEMS: InventoryItem[] = [
  { id: 1, name: 'តុគ្រូ', quantity: '' },
  { id: 2, name: 'កៅអី', quantity: '' },
  { id: 3, name: 'តុសិស្ស', quantity: '' },
  { id: 4, name: 'កម្រាលតុ', quantity: '' },
  { id: 5, name: 'អំបោស', quantity: '' },
  { id: 6, name: 'ទូដាក់សៀវភៅ', quantity: '' },
  { id: 7, name: 'សៀវភៅសម្រាប់សិស្សអាន', quantity: '' },
  { id: 8, name: 'ក្ដារខៀន', quantity: '' },
  { id: 9, name: 'ផ្ទាំងតុបតែងថ្នាក់', quantity: '' },
  { id: 10, name: 'ប្រអប់ចូកសម្រាម', quantity: '' },
  { id: 11, name: 'ធុងសម្រាម', quantity: '' },
  { id: 12, name: 'ភូគោល', quantity: '' },
  { id: 13, name: 'ក្ដារខៀនចល័ត', quantity: '' },
  { id: 14, name: 'ផ្ទាំងអក្សរផ្ចង់', quantity: '' },
  { id: 15, name: 'កង្ហារ', quantity: '' },
  { id: 16, name: 'អំពូលភ្លើង', quantity: '' },
  { id: 17, name: 'វចនានុក្រម', quantity: '' },
  { id: 18, name: '', quantity: '' },
  { id: 19, name: '', quantity: '' },
  { id: 20, name: '', quantity: '' },
];

export const ClassroomInventory: React.FC = () => {
  const { language, activeClass, schoolProfile, showToast } = useGradebook();
  const [items, setItems] = useState<InventoryItem[]>(DEFAULT_ITEMS);
  const [isSaved, setIsSaved] = useState(true);
  const [theme, setTheme] = useState<'clean' | 'cute'>('cute');
  
  const [signDate, setSignDate] = useState({
    dayKh: '',
    monthKh: '',
    yearKh: 'ឆ្នាំមសាញ់ ឆស័ក ព.ស ២៥៦៩',
    day: '',
    month: '',
    yearAd: new Date().getFullYear().toString()
  });

  // Load from local storage
  useEffect(() => {
    if (activeClass?.id) {
      const saved = localStorage.getItem(`inventory_${activeClass.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.items) setItems(parsed.items);
          else setItems(parsed); // backward compat
          
          if (parsed.signDate) setSignDate(parsed.signDate);
          if (parsed.theme) setTheme(parsed.theme);
        } catch (e) {
          console.error("Failed to parse inventory", e);
        }
      } else {
        setItems(DEFAULT_ITEMS);
      }
    }
  }, [activeClass?.id]);

  const handleItemChange = (id: number, field: 'name' | 'quantity', value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    setIsSaved(false);
  };

  const handleDateChange = (field: keyof typeof signDate, value: string) => {
    setSignDate(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    if (activeClass?.id) {
      localStorage.setItem(`inventory_${activeClass.id}`, JSON.stringify({
        items,
        signDate,
        theme
      }));
      setIsSaved(true);
      showToast(language === 'km' ? 'បានរក្សាទុកបញ្ជីសារពើភណ្ឌ' : 'Inventory saved successfully', 'success');
    }
  };

  const handleReset = () => {
    if (confirm(language === 'km' ? 'តើអ្នកពិតជាចង់កំណត់ទិន្នន័យឡើងវិញមែនទេ?' : 'Are you sure you want to reset the inventory?')) {
      setItems(DEFAULT_ITEMS);
      setIsSaved(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {language === 'km' ? 'បញ្ជីសារពើភណ្ឌថ្នាក់រៀន' : 'Classroom Inventory'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'km' ? 'គ្រប់គ្រង និងបោះពុម្ពបញ្ជីសម្ភារៈក្នុងថ្នាក់' : 'Manage and print classroom materials'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mr-2 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => { setTheme('clean'); setIsSaved(false); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${theme === 'clean' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <span>{language === 'km' ? 'ធម្មតា' : 'Clean'}</span>
            </button>
            <button
              onClick={() => { setTheme('cute'); setIsSaved(false); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${theme === 'cute' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-amber-600'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'គ្យូតៗ' : 'Cute'}</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'km' ? 'កំណត់ឡើងវិញ' : 'Reset'}</span>
          </button>
          <button
            onClick={handleSave}
            className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition ${isSaved ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' : 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{language === 'km' ? (isSaved ? 'បានរក្សាទុក' : 'រក្សាទុក') : (isSaved ? 'Saved' : 'Save')}</span>
          </button>
          <PrintToPdfButton
            targetElementId="inventory-print-area"
            documentTitle={`Inventory_${activeClass?.nameKm || 'Class'}`}
            pageSize="a4"
            orientation="portrait"
            variant="primary"
            className="text-xs py-2 px-3"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'km' ? 'បំពេញចំនួន និងឈ្មោះសម្ភារៈខាងក្រោម។ អ្នកអាចបោះពុម្ពវាចេញជាទម្រង់ A4 សម្រាប់ប្រើប្រាស់ផ្លូវការ។' : 'Fill in the quantity and item names below. You can print this in A4 format for official use.'}
          </p>
        </div>
        
        {/* Printable Area */}
        <div className="p-2 sm:p-6 overflow-x-auto bg-slate-100 dark:bg-slate-950">
          <div id="inventory-print-area" className={`min-w-[750px] max-w-[800px] mx-auto bg-white text-slate-900 p-8 pt-10 pb-12 relative print:shadow-none shadow-sm print:p-0 ${theme === 'cute' ? 'border-4 border-emerald-100 rounded-xl print:border-none' : ''}`}>
            
            {theme === 'cute' && (
              <>
                <div className="absolute top-6 right-6 text-4xl opacity-80 print:opacity-100">🐝</div>
                <div className="absolute top-32 right-12 text-3xl opacity-80 print:opacity-100">🐛</div>
                <div className="absolute bottom-10 left-10 text-4xl opacity-80 print:opacity-100">📚</div>
                <div className="absolute bottom-32 right-8 text-4xl opacity-80 print:opacity-100">🍃</div>
                <div className="absolute top-10 left-1/4 text-2xl opacity-60 print:opacity-100">✨</div>
              </>
            )}

            {/* Header */}
            <div className="text-center space-y-1 mb-6 relative z-10">
              <p className="font-moul text-lg text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</p>
              <p className="font-moul text-lg text-slate-900">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
              <div className="w-32 h-0.5 bg-slate-900 mx-auto mt-2 mb-1 flex items-center justify-center">
                 <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                 <div className="w-2 h-2 rounded-full bg-slate-900 mx-1"></div>
                 <div className="w-2 h-2 rounded-full bg-slate-900"></div>
              </div>
            </div>

            {/* Sub-header */}
            <div className="flex justify-between items-start mb-6 text-sm text-slate-900 relative z-10">
              <div className="space-y-1.5 font-bold mt-6">
                <p>រដ្ឋបាល{schoolProfile?.district || 'ស្រុកស្ទឹងត្រង់'}</p>
                <p>ការិយាល័យអ.យ.ក នៃរដ្ឋបាល{schoolProfile?.district || 'ស្រុកស្ទឹងត្រង់'}</p>
                <p>{schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង'}</p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-10 relative z-10">
              <h1 className={`font-moul text-2xl mb-3 ${theme === 'cute' ? 'text-amber-600 print:text-amber-600' : 'text-slate-900'}`}>
                បញ្ជីសារពើភណ្ឌ
              </h1>
              <p className="font-bold text-base text-slate-800">
                ថ្នាក់ទី {activeClass?.nameKm || '៦ក'} ឆ្នាំសិក្សា {activeClass?.academicYear || '២០២៦-២០២៧'}
              </p>
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-2 gap-6 mb-12 relative z-10">
              
              {/* Left Column (Items 1-10) */}
              <table className={`w-full border-collapse text-sm ${theme === 'cute' ? 'border border-amber-300' : 'border border-slate-900'}`}>
                <thead>
                  <tr className={`font-bold text-center ${theme === 'cute' ? 'bg-amber-100 text-amber-900 border-amber-300 print:bg-amber-100' : 'bg-slate-100 text-slate-900 border-slate-900 print:bg-slate-100'}`}>
                    <th className={`border py-2 px-1 w-12 ${theme === 'cute' ? 'border-amber-300' : 'border-slate-900'}`}>ល.រ</th>
                    <th className={`border py-2 px-3 text-left ${theme === 'cute' ? 'border-amber-300' : 'border-slate-900'}`}>ឈ្មោះសម្ភារៈ</th>
                    <th className={`border py-2 px-2 w-20 ${theme === 'cute' ? 'border-amber-300' : 'border-slate-900'}`}>ចំនួន</th>
                  </tr>
                </thead>
                <tbody>
                  {items.slice(0, 10).map((item) => (
                    <tr key={item.id} className={theme === 'cute' ? 'bg-white hover:bg-amber-50/30' : ''}>
                      <td className={`border py-2.5 px-1 text-center font-bold font-mono ${theme === 'cute' ? 'border-amber-300 text-slate-700' : 'border-slate-900'}`}>{item.id}</td>
                      <td className={`border p-0 text-left ${theme === 'cute' ? 'border-amber-300' : 'border-slate-900'}`}>
                         <input 
                           type="text"
                           value={item.name}
                           onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                           className="w-full h-full min-h-[36px] px-3 py-1 outline-none bg-transparent focus:bg-indigo-50/50 print:hidden font-medium"
                           placeholder="បញ្ចូលឈ្មោះសម្ភារៈ..."
                         />
                         <span className="hidden print:block px-3 py-2 font-medium">{item.name}</span>
                      </td>
                      <td className={`border p-0 text-center ${theme === 'cute' ? 'border-amber-300' : 'border-slate-900'}`}>
                         <input 
                           type="text"
                           value={item.quantity}
                           onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                           className={`w-full h-full min-h-[36px] px-2 py-1 outline-none bg-transparent text-center focus:bg-indigo-50/50 print:hidden font-mono font-bold ${theme === 'cute' ? 'text-amber-700' : 'text-indigo-700'}`}
                           placeholder="-"
                         />
                         <span className="hidden print:block px-2 py-2 text-center font-bold">{item.quantity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Right Column (Items 11-20) */}
              <table className={`w-full border-collapse text-sm ${theme === 'cute' ? 'border border-amber-300' : 'border border-slate-900'}`}>
                <thead>
                  <tr className={`font-bold text-center ${theme === 'cute' ? 'bg-emerald-100 text-emerald-900 border-amber-300 print:bg-emerald-100' : 'bg-slate-100 text-slate-900 border-slate-900 print:bg-slate-100'}`}>
                    <th className={`border py-2 px-1 w-12 ${theme === 'cute' ? 'border-amber-300' : 'border-slate-900'}`}>ល.រ</th>
                    <th className={`border py-2 px-3 text-left ${theme === 'cute' ? 'border-amber-300' : 'border-slate-900'}`}>ឈ្មោះសម្ភារៈ</th>
                    <th className={`border py-2 px-2 w-20 ${theme === 'cute' ? 'border-amber-300' : 'border-slate-900'}`}>ចំនួន</th>
                  </tr>
                </thead>
                <tbody>
                  {items.slice(10, 20).map((item) => (
                    <tr key={item.id} className={theme === 'cute' ? 'bg-white hover:bg-emerald-50/30' : ''}>
                      <td className={`border py-2.5 px-1 text-center font-bold font-mono ${theme === 'cute' ? 'border-amber-300 text-slate-700' : 'border-slate-900'}`}>
                        {item.id}
                      </td>
                      <td className={`border p-0 text-left ${theme === 'cute' ? 'border-amber-300' : 'border-slate-900'}`}>
                         <input 
                           type="text"
                           value={item.name}
                           onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                           className="w-full h-full min-h-[36px] px-3 py-1 outline-none bg-transparent focus:bg-indigo-50/50 print:hidden font-medium"
                           placeholder="បញ្ចូលឈ្មោះសម្ភារៈ..."
                         />
                         <span className="hidden print:block px-3 py-2 font-medium">{item.name}</span>
                      </td>
                      <td className={`border p-0 text-center ${theme === 'cute' ? 'border-amber-300' : 'border-slate-900'}`}>
                         <input 
                           type="text"
                           value={item.quantity}
                           onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                           className={`w-full h-full min-h-[36px] px-2 py-1 outline-none bg-transparent text-center focus:bg-indigo-50/50 print:hidden font-mono font-bold ${theme === 'cute' ? 'text-emerald-700' : 'text-indigo-700'}`}
                           placeholder="-"
                         />
                         <span className="hidden print:block px-2 py-2 text-center font-bold">{item.quantity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-start text-sm font-bold text-slate-900 mt-12 pb-8 px-4 relative z-10">
              <div className="text-center space-y-16 mt-6">
                <p>បានឃើញ និងឯកភាព</p>
                <p>នាយកសាលា</p>
              </div>
              <div className="text-center space-y-1">
                <div className="font-normal italic text-xs mb-1 flex items-center justify-center gap-0.5">
                   <span>ថ្ងៃ</span>
                   <input 
                     type="text" 
                     value={signDate.dayKh} 
                     onChange={(e) => handleDateChange('dayKh', e.target.value)}
                     className="w-12 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                     placeholder="......."
                   />
                   <span>ខែ</span>
                   <input 
                     type="text" 
                     value={signDate.monthKh} 
                     onChange={(e) => handleDateChange('monthKh', e.target.value)}
                     className="w-16 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                     placeholder="..............."
                   />
                   <input 
                     type="text" 
                     value={signDate.yearKh} 
                     onChange={(e) => handleDateChange('yearKh', e.target.value)}
                     className="w-40 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                     placeholder="ឆ្នាំមសាញ់ ឆស័ក ព.ស ២៥៦៩"
                   />
                </div>
                <div className="font-normal italic text-xs mb-4 flex items-center justify-center gap-0.5">
                   <span>....................ត្រូវនឹងថ្ងៃទី</span>
                   <input 
                     type="text" 
                     value={signDate.day} 
                     onChange={(e) => handleDateChange('day', e.target.value)}
                     className="w-8 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                     placeholder="១៥"
                   />
                   <span>ខែ</span>
                   <input 
                     type="text" 
                     value={signDate.month} 
                     onChange={(e) => handleDateChange('month', e.target.value)}
                     className="w-16 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                     placeholder="១១"
                   />
                   <span>ឆ្នាំ</span>
                   <input 
                     type="text" 
                     value={signDate.yearAd} 
                     onChange={(e) => handleDateChange('yearAd', e.target.value)}
                     className="w-12 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                     placeholder="២០២៦"
                   />
                </div>
                <p className="pt-2">គ្រូបន្ទុកថ្នាក់</p>
                <div className="h-16"></div>
                <p>{activeClass?.teacherNameKm || 'គ្រូបង្រៀន'}</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
