import React, { useState, useRef } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { SchoolProfile } from '../../types';
import { 
  School, 
  Upload, 
  Image as ImageIcon, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Check, 
  X, 
  RotateCcw, 
  Sparkles, 
  Building2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';

interface SchoolProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolProfileSettingsModal: React.FC<SchoolProfileSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { schoolProfile, updateSchoolProfile, resetSchoolLogo, language, showToast } = useGradebook();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<SchoolProfile>({
    schoolName: schoolProfile.schoolName || '',
    schoolNameKm: schoolProfile.schoolNameKm || '',
    province: schoolProfile.province || 'ខេត្តកំពង់ចាម',
    district: schoolProfile.district || 'ស្រុកព្រៃឈរ',
    commune: schoolProfile.commune || 'ឃុំព្រៃឈរ',
    village: schoolProfile.village || '',
    schoolCode: schoolProfile.schoolCode || '',
    principalName: schoolProfile.principalName || '',
    principalNameKm: schoolProfile.principalNameKm || '',
    phone: schoolProfile.phone || '',
    email: schoolProfile.email || '',
    logoUrl: schoolProfile.logoUrl || '',
    academicYear: schoolProfile.academicYear || '២០២៥-២០២៦',
  });

  const [activePresetTab, setActivePresetTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        schoolName: schoolProfile.schoolName || '',
        schoolNameKm: schoolProfile.schoolNameKm || '',
        province: schoolProfile.province || 'ខេត្តកំពង់ចាម',
        district: schoolProfile.district || 'ស្រុកព្រៃឈរ',
        commune: schoolProfile.commune || 'ឃុំព្រៃឈរ',
        village: schoolProfile.village || '',
        schoolCode: schoolProfile.schoolCode || '',
        principalName: schoolProfile.principalName || '',
        principalNameKm: schoolProfile.principalNameKm || '',
        phone: schoolProfile.phone || '',
        email: schoolProfile.email || '',
        logoUrl: schoolProfile.logoUrl || '',
        academicYear: schoolProfile.academicYear || '២០២៥-២០២៦',
      });
      setUrlInput(schoolProfile.logoUrl || '');
    }
  }, [isOpen, schoolProfile]);

  if (!isOpen) return null;

  // Handle local file upload (converts to Base64 data URL)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast(
        language === 'km' ? 'សូមជ្រើសរើសឯកសាររូបភាព (PNG, JPG, SVG, WEBP)' : 'Please select an image file',
        'warning'
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      showToast(
        language === 'km' ? 'ទំហំរូបភាពមិនត្រូវលើសពី 2MB ឡើយ' : 'Image size must be under 2MB',
        'warning'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFormData(prev => ({ ...prev, logoUrl: dataUrl }));
      showToast(
        language === 'km' ? 'បានបញ្ចូលឡូហ្គូសាលារៀនជោគជ័យ' : 'School logo uploaded successfully',
        'success'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setFormData(prev => ({ ...prev, logoUrl: urlInput.trim() }));
    showToast(
      language === 'km' ? 'បានកំណត់តំណភ្ជាប់ឡូហ្គូសាលារៀន' : 'School logo URL applied',
      'success'
    );
  };

  const handleResetCurrentLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }));
    setUrlInput('');
    showToast(
      language === 'km' ? 'បានកំណត់ឡូហ្គូសាលាឡើងវិញជាសញ្ញាសម្គាល់ផ្លូវការ' : 'Reset school logo to official emblem',
      'info'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schoolNameKm.trim()) {
      showToast(
        language === 'km' ? 'សូមបញ្ចូលឈ្មោះសាលារៀនជាភាសាខ្មែរ' : 'Please enter school name in Khmer',
        'warning'
      );
      return;
    }

    updateSchoolProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                {language === 'km' ? 'កំណត់ព័ត៌មានសាលារៀន & ឡូហ្គូ' : 'School Profile & Logo Settings'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km' 
                  ? 'កំណត់ឈ្មោះសាលា ស្រុក ឃុំ ខេត្ត និងឡូហ្គូ ដើម្បីប្រើប្រាស់លើគ្រប់ទិន្នន័យ និងរបាយការណ៍'
                  : 'Customize school name, district, commune, province & logo for all classes and reports'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-6 flex-1 pr-1">
          
          {/* Section 1: Dual Logo Customization (School Logo & MoEYS Logo) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4.5 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'km' ? 'ឡូហ្គូសាលារៀន (School Logo)' : 'School Logo'}</span>
              </div>
              
              {/* Reset to default official emblem */}
              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={handleResetCurrentLogo}
                  className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-1 cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>
                    {language === 'km' ? 'កំណត់ឡូហ្គូឡើងវិញ (សញ្ញាសម្គាល់ផ្លូវការ)' : 'Reset to Official Emblem'}
                  </span>
                </button>
              )}
            </div>

            {/* School Logo Preview & Status */}
            <div className="p-4 rounded-2xl border-2 border-indigo-100 dark:border-indigo-950/60 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                <SchoolLogo 
                  customLogoUrl={formData.logoUrl} 
                  size={72} 
                  className="w-full h-full"
                />
              </div>
              <div className="text-center sm:text-left min-w-0 flex-1">
                <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                  <span className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    {language === 'km' ? 'ឡូហ្គូផ្លូវការសាលារៀន' : 'Official School Logo'}
                  </span>
                  {formData.logoUrl ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black">
                      {language === 'km' ? 'រូបភាពផ្ទាល់ខ្លួន' : 'Custom'}
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black">
                      {language === 'km' ? 'សញ្ញាសម្គាល់ផ្លូវការ (Standard Emblem)' : 'Official Emblem'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {language === 'km' 
                    ? 'ឡូហ្គូនេះនឹងត្រូវបង្ហាញលើក្បាលលិខិត ព្រឹត្តិបត្រពិន្ទុ កាលវិភាគ ប័ណ្ណសរសើរ និងឯកសារបោះពុម្ពទាំងអស់។'
                    : 'This logo appears across headers, report cards, timetables, and certificates.'}
                </p>
              </div>
            </div>

            {/* Upload Controls for School Logo */}
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActivePresetTab('upload')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    activePresetTab === 'upload'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {language === 'km' ? 'បញ្ចូលរូបភាពពីកុំព្យូទ័រ/ទូរស័ព្ទ' : 'Upload Image File'}
                </button>
                <button
                  type="button"
                  onClick={() => setActivePresetTab('url')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    activePresetTab === 'url'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {language === 'km' ? 'តំណភ្ជាប់ URL' : 'Image Link (URL)'}
                </button>
              </div>

              {activePresetTab === 'upload' ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                    isDragOver 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' 
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-indigo-400'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-5 h-5 mx-auto text-indigo-500 mb-1.5" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === 'km' ? 'ចុចទីនេះ ឬទម្លាក់រូបភាពឡូហ្គូសាលារៀន' : 'Click or drag & drop school logo here'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    PNG, JPG, SVG, WebP (អតិបរមា 2MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    placeholder="https://example.com/school-logo.png"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer shrink-0"
                  >
                    {language === 'km' ? 'អនុវត្ត' : 'Apply'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: School Names & Academic Year */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'km' ? 'ព័ត៌មានឈ្មោះសាលារៀន' : 'School Names & Code'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'ឈ្មោះសាលារៀន (ភាសាខ្មែរ)' : 'School Name (Khmer)'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="សាលាបឋមសិក្សា..."
                  value={formData.schoolNameKm}
                  onChange={(e) => setFormData({ ...formData, schoolNameKm: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'ឈ្មោះសាលារៀន (អក្សរឡាតាំង/English)' : 'School Name (Latin/English)'}
                </label>
                <input
                  type="text"
                  placeholder="Primary School Name..."
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'លេខកូដសាលា / MoEYS Code' : 'School Code / EMIS'}
                </label>
                <input
                  type="text"
                  placeholder="ឧ. 030704"
                  value={formData.schoolCode || ''}
                  onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'ឆ្នាំសិក្សា' : 'Academic Year'}
                </label>
                <input
                  type="text"
                  placeholder="២០២៥-២០២៦"
                  value={formData.academicYear || ''}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Geographic Location (District, Commune, Province, Village) */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'km' ? 'ទីតាំងរដ្ឋបាលភូមិសាស្ត្រ (ស្រុក ឃុំ ខេត្ត)' : 'Administrative Location (District, Commune, Province)'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'ស្រុក / ខណ្ឌ / ក្រុង' : 'District / Khan'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ឧ. ស្រុកព្រៃឈរ"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'ឃុំ / សង្កាត់' : 'Commune / Sangkat'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ឧ. ឃុំព្រៃឈរ"
                  value={formData.commune}
                  onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'រាជធានី / ខេត្ត' : 'Capital / Province'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ឧ. ខេត្តកំពង់ចាម"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'ភូមិ (បើមាន)' : 'Village (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="ឧ. ភូមិប្រទង"
                  value={formData.village || ''}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Principal & Contacts */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'km' ? 'គណៈគ្រប់គ្រងសាលា & ទំនាក់ទំនង' : 'School Leadership & Contact'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'ឈ្មោះនាយក/នាយិកាសាលា (ខ្មែរ)' : 'Principal Name (Khmer)'}
                </label>
                <input
                  type="text"
                  placeholder="លោកនាយកសាលា..."
                  value={formData.principalNameKm || ''}
                  onChange={(e) => setFormData({ ...formData, principalNameKm: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'លេខទូរស័ព្ទទំនាក់ទំនង' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  placeholder="012 345 678"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'អ៊ីមែលសាលារៀន' : 'School Email'}
                </label>
                <input
                  type="email"
                  placeholder="school@moeys.gov.kh"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-xl p-3 border border-indigo-200/60 dark:border-indigo-900/50 flex items-start space-x-2.5 text-xs text-indigo-900 dark:text-indigo-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
            <p>
              {language === 'km'
                ? 'ព័ត៌មាននេះនឹងធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិចំពោះគ្រប់ថ្នាក់រៀនទាំងអស់ និងបង្ហាញលើក្បាលលិខិត ព្រឹត្តិបត្រពិន្ទុ ប្លង់តុ និងឯកសារបោះពុម្ព។'
                : 'This profile will automatically apply across all your classes, report cards, seating charts, and official printouts.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'km' ? 'រក្សាទុកព័ត៌មានសាលារៀន' : 'Save School Profile'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
