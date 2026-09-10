import React, { useState, useRef } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { Student } from '../../types';
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  Trash2, 
  Image as ImageIcon, 
  Sparkles, 
  User, 
  Award,
  Crown
} from 'lucide-react';

interface StudentPhotoModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  rank?: number;
}

// Preset Cambodian student illustration avatars (SVG Data URLs)
const PRESET_AVATARS = [
  {
    id: 'boy_scholar_1',
    name: 'Boy Scholar 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    svgColor: '#3b82f6',
    labelKm: 'សិស្សប្រុស ១',
  },
  {
    id: 'girl_scholar_1',
    name: 'Girl Scholar 1',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    svgColor: '#ec4899',
    labelKm: 'សិស្សស្រី ១',
  },
  {
    id: 'boy_scholar_2',
    name: 'Boy Scholar 2',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    svgColor: '#10b981',
    labelKm: 'សិស្សប្រុស ២',
  },
  {
    id: 'girl_scholar_2',
    name: 'Girl Scholar 2',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    svgColor: '#8b5cf6',
    labelKm: 'សិស្សស្រី ២',
  },
  {
    id: 'boy_scholar_3',
    name: 'Boy Scholar 3',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    svgColor: '#f59e0b',
    labelKm: 'សិស្សប្រុស ៣',
  },
  {
    id: 'girl_scholar_3',
    name: 'Girl Scholar 3',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    svgColor: '#06b6d4',
    labelKm: 'សិស្សស្រី ៣',
  },
];

export const StudentPhotoModal: React.FC<StudentPhotoModalProps> = ({
  student,
  isOpen,
  onClose,
  rank,
}) => {
  const { language, updateStudent, showToast } = useGradebook();
  const [photoPreview, setPhotoPreview] = useState<string>(student?.photoUrl || '');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with student on open
  React.useEffect(() => {
    if (student) {
      setPhotoPreview(student.photoUrl || '');
      setCustomUrlInput(student.photoUrl || '');
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  // File upload and client-side resize/compression into base64 Data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(language === 'km' ? 'សូមជ្រើសរើសឯកសាររូបភាព' : 'Please select an image file', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 300x300 for optimal localStorage footprint
        const canvas = document.createElement('canvas');
        const maxSize = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoPreview(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = () => {
    updateStudent(student.id, { photoUrl: photoPreview });
    showToast(
      language === 'km' 
        ? `បានរក្សាទុករូបថតរបស់សិស្ស ${student.name} ជោគជ័យ!` 
        : `Photo updated for ${student.name}!`,
      'success'
    );
    onClose();
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setCustomUrlInput('');
    updateStudent(student.id, { photoUrl: '' });
    showToast(language === 'km' ? 'បានលុបរូបថតសិស្ស' : 'Student photo removed', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        
        {/* Modal Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-4.5 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black">
              {rank ? `#${rank}` : <Camera className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                {language === 'km' ? 'បញ្ចូលរូបថតសិស្សឆ្នើម' : 'Insert / Update Student Photo'}
              </h3>
              <p className="text-xs text-slate-300">
                {student.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Photo Live Preview Box */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="relative group">
              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-3 shadow-md flex items-center justify-center ${
                rank === 1 ? 'border-amber-400 ring-4 ring-amber-400/20' :
                rank === 2 ? 'border-slate-300 ring-4 ring-slate-300/20' :
                rank === 3 ? 'border-amber-600 ring-4 ring-amber-600/20' :
                'border-indigo-400 ring-4 ring-indigo-400/20'
              } bg-white dark:bg-slate-800`}>
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt={student.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2">
                    <User className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
                      {language === 'km' ? 'គ្មានរូបថត' : 'No Photo'}
                    </span>
                  </div>
                )}
              </div>

              {rank && (
                <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-xs font-black px-2 py-0.5 rounded-full shadow-xs">
                  #{rank}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  {rank === 1 
                    ? (language === 'km' ? 'សិស្សឆ្នើមលេខ ១' : 'Rank 1 Champion') 
                    : (language === 'km' ? `សិស្សឆ្នើមលេខ ${rank || ''}` : `Top ${rank || ''} Achiever`)}
                </span>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white">{student.name}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km' 
                  ? 'រូបថតនេះនឹងបង្ហាញលើតារាងកិត្តិយស និងព្រឹត្តិបត្រពិន្ទុ' 
                  : 'This photo will appear on the Honor Roll and report cards.'}
              </p>
            </div>
          </div>

          {/* Photo Source Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-black">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'upload' ? 'bg-white dark:bg-slate-700 text-indigo-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'បញ្ចូលពីកុំព្យូទ័រ' : 'Upload from Device'}</span>
            </button>
            <button
              onClick={() => setActiveTab('preset')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'preset' ? 'bg-white dark:bg-slate-700 text-indigo-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'រូបគំរូសិស្ស' : 'Preset Avatars'}</span>
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'url' ? 'bg-white dark:bg-slate-700 text-indigo-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'តំណភ្ជាប់ URL' : 'Image URL'}</span>
            </button>
          </div>

          {/* Tab 1: Upload from Computer */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900 flex items-center justify-center transition">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 block">
                    {language === 'km' ? 'ចុចទីនេះដើម្បីជ្រើសរើសរូបថត' : 'Click to select photo from device'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    JPG, PNG, WebP (ប្រព័ន្ធនឹងបង្រួមទំហំស្វ័យប្រវត្តិ)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Preset Avatars */}
          {activeTab === 'preset' && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {language === 'km' ? 'ជ្រើសរើសរូបគំរូសិស្សឆ្នើម៖' : 'Choose a preset student portrait:'}
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {PRESET_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setPhotoPreview(avatar.url)}
                    className={`p-1 rounded-xl border-2 transition cursor-pointer flex flex-col items-center ${
                      photoPreview === avatar.url 
                        ? 'border-indigo-600 ring-2 ring-indigo-400/30 bg-indigo-50 dark:bg-indigo-950/60' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <img 
                      src={avatar.url} 
                      alt={avatar.name} 
                      className="w-12 h-12 rounded-lg object-cover mb-1" 
                    />
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 truncate w-full text-center">
                      {language === 'km' ? avatar.labelKm : avatar.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Image URL */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {language === 'km' ? 'បញ្ចូលតំណភ្ជាប់រូបភាព (Direct Image Link)' : 'Direct Image Link (URL)'}
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => {
                    setCustomUrlInput(e.target.value);
                    setPhotoPreview(e.target.value);
                  }}
                  placeholder="https://example.com/student-photo.jpg"
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {student.photoUrl ? (
            <button
              onClick={handleRemovePhoto}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-black transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'លុបរូបថត' : 'Remove Photo'}</span>
            </button>
          ) : <div />}

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black transition cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              onClick={handleSavePhoto}
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-black shadow-md transition cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{language === 'km' ? 'រក្សាទុក' : 'Save Photo'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
