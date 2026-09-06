import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  Printer, 
  FileDown, 
  Settings2, 
  Check, 
  Info, 
  Sparkles,
  FileSpreadsheet,
  X,
  Loader2
} from 'lucide-react';
import { MoEYSLogo } from './MoEYSLogo';
import { exportElementToPdf, exportMultipleElementsToPdf } from '../../utils/pdfExport';

interface PrintToPdfButtonProps {
  documentTitle?: string;
  targetElementId?: string;
  targetElementIds?: string[];
  pageSize?: 'a4' | 'a5' | 'letter';
  orientation?: 'portrait' | 'landscape';
  variant?: 'primary' | 'secondary' | 'dark' | 'outline' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  batchAll?: boolean;
  showDownloadPdfOnly?: boolean;
  showPrintOption?: boolean;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  className?: string;
  labelKm?: string;
  labelEn?: string;
}

export const PrintToPdfButton: React.FC<PrintToPdfButtonProps> = ({
  documentTitle,
  targetElementId,
  targetElementIds,
  pageSize = 'a4',
  orientation = 'portrait',
  variant = 'primary',
  size = 'md',
  batchAll = false,
  showDownloadPdfOnly = false,
  showPrintOption = true,
  onBeforePrint,
  onAfterPrint,
  className = '',
  labelKm,
  labelEn,
}) => {
  const { language, activeClass, addToast } = useGradebook();
  const [showHelperModal, setShowHelperModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string>('');

  const getCleanFileName = () => {
    if (documentTitle) return documentTitle;
    const classCode = activeClass?.nameKm || activeClass?.name || 'Grade6';
    const year = activeClass?.academicYear || '2026-2027';
    return `MoEYS_${classCode}_${pageSize.toUpperCase()}_${year}`;
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    setProgressMsg(language === 'km' ? 'កំពុងបង្កើតឯកសារ PDF ផ្លូវការ...' : 'Generating official PDF...');
    
    if (onBeforePrint) onBeforePrint();

    try {
      const fileName = getCleanFileName();
      let success = false;

      if (targetElementIds && targetElementIds.length > 0) {
        success = await exportMultipleElementsToPdf(targetElementIds, {
          fileName,
          pageSize: pageSize as 'a4' | 'a5' | 'letter',
          orientation: orientation as 'portrait' | 'landscape',
          onProgress: (msg: string) => setProgressMsg(msg),
        });
      } else if (targetElementId) {
        success = await exportElementToPdf(targetElementId, {
          fileName,
          pageSize: pageSize as 'a4' | 'a5' | 'letter',
          orientation: orientation as 'portrait' | 'landscape',
          onProgress: (msg: string) => setProgressMsg(msg),
        });
      } else {
        // Fallback to printable-area or main content if targetElementId not specified
        const fallbackTarget = document.querySelector('.printable-area') as HTMLElement || document.body;
        success = await exportElementToPdf(fallbackTarget, {
          fileName,
          pageSize: pageSize as 'a4' | 'a5' | 'letter',
          orientation: orientation as 'portrait' | 'landscape',
          onProgress: (msg: string) => setProgressMsg(msg),
        });
      }

      if (success) {
        addToast(
          language === 'km' 
            ? `បានទាញយកឯកសារ PDF (${fileName}.pdf) ដោយជោគជ័យ!` 
            : `Successfully exported and downloaded ${fileName}.pdf!`,
          'success'
        );
      } else {
        // If html2canvas fails, fallback to window.print()
        triggerDirectPrint();
      }
    } catch (err) {
      console.error('PDF export error:', err);
      addToast(
        language === 'km' ? 'មិនអាចទាញយក PDF បានទេ កំពុងបើកផ្ទាំងបោះពុម្ពជំនួស...' : 'PDF generation error, opening print dialog...',
        'warning'
      );
      triggerDirectPrint();
    } finally {
      setIsExportingPdf(false);
      setProgressMsg('');
      if (onAfterPrint) onAfterPrint();
    }
  };

  const triggerDirectPrint = () => {
    if (onBeforePrint) onBeforePrint();

    // Set page size attributes dynamically
    document.documentElement.setAttribute('data-print-size', pageSize);
    document.documentElement.setAttribute('data-print-orientation', orientation);

    // Save previous document title for clean PDF filename
    const originalTitle = document.title;
    const cleanTitle = getCleanFileName();
    document.title = cleanTitle;

    setTimeout(() => {
      window.print();
      // Restore
      setTimeout(() => {
        document.title = originalTitle;
        if (onAfterPrint) onAfterPrint();
      }, 500);
    }, 150);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-indigo-900 dark:bg-indigo-600 hover:bg-indigo-950 dark:hover:bg-indigo-700 text-white shadow-sm border border-indigo-900 dark:border-indigo-600';
      case 'emerald':
        return 'bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-700 text-white shadow-sm border border-emerald-700';
      case 'secondary':
        return 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-sm';
      case 'dark':
        return 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm';
      case 'outline':
        return 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-2xs';
      default:
        return 'bg-indigo-900 dark:bg-indigo-600 hover:bg-indigo-950 text-white shadow-sm';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2.5 py-1.5 text-xs rounded-xl';
      case 'lg':
        return 'px-5 py-2.5 text-sm rounded-xl font-black';
      case 'md':
      default:
        return 'px-3.5 py-2 text-xs rounded-xl font-black';
    }
  };

  const defaultKm = batchAll 
    ? `ទាញយកជា PDF ទាំងអស់ (${pageSize.toUpperCase()})` 
    : `ទាញយកជា PDF (${pageSize.toUpperCase()})`;
  const defaultEn = batchAll 
    ? `Export all to PDF (${pageSize.toUpperCase()})` 
    : `Export to PDF (${pageSize.toUpperCase()})`;

  const displayLabel = language === 'km' ? (labelKm || defaultKm) : (labelEn || defaultEn);

  return (
    <div className="inline-flex items-center space-x-1.5 no-print">
      {/* Primary PDF Download Action Button */}
      <button
        onClick={handleDownloadPdf}
        disabled={isExportingPdf}
        className={`inline-flex items-center space-x-2 transition cursor-pointer select-none ${getVariantStyles()} ${getSizeStyles()} ${className} ${isExportingPdf ? 'opacity-80 cursor-wait' : ''}`}
        title={language === 'km' ? `ទាញយកឯកសារជា PDF ទំហំ ${pageSize.toUpperCase()}` : `Download direct PDF file in ${pageSize.toUpperCase()}`}
      >
        {isExportingPdf ? (
          <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin text-amber-300" />
        ) : (
          <FileDown className="w-3.5 h-3.5 shrink-0" />
        )}
        <span className="truncate">{isExportingPdf ? (progressMsg || (language === 'km' ? 'កំពុងទាញយក...' : 'Exporting...')) : displayLabel}</span>
        <span className="px-1.5 py-0.5 rounded bg-black/25 text-[10px] font-black uppercase tracking-wider">
          {pageSize.toUpperCase()}
        </span>
      </button>

      {/* Optional Hardware Print Button */}
      {showPrintOption && !showDownloadPdfOnly && (
        <button
          onClick={triggerDirectPrint}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-white transition cursor-pointer border border-slate-200 dark:border-slate-700"
          title={language === 'km' ? 'បោះពុម្ពតាមម៉ាស៊ីនព្រីន (Print)' : 'Send to Printer (Hardware Print)'}
        >
          <Printer className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Quick Info & Settings Guide */}
      <button
        onClick={() => setShowHelperModal(true)}
        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        title={language === 'km' ? 'ការណែនាំអំពីការ Export PDF & Print' : 'PDF Export & Print guidelines'}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* PDF Export Guide Modal */}
      {showHelperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 text-slate-900 dark:text-white relative transition-colors">
            <button
              onClick={() => setShowHelperModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <MoEYSLogo size={36} />
              <div>
                <h3 className="font-heading font-black text-base text-indigo-950 dark:text-indigo-300">
                  {language === 'km' ? 'ការទាញយក PDF ផ្លូវការ & បោះពុម្ព' : 'Official PDF Export & Print Guide'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  {language === 'km' ? `ទំហំកំណត់៖ ក្រដាស ${pageSize.toUpperCase()} (${orientation === 'portrait' ? 'បញ្ឈរ' : 'ផ្ដេក'})` : `Preset: ${pageSize.toUpperCase()} (${orientation})`}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 mb-5">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <p>
                  <strong>{language === 'km' ? 'ទាញយក PDF ដោយផ្ទាល់ (Direct Download):' : 'Direct Download:'}</strong>{' '}
                  {language === 'km' ? 'ចុចប៊ូតុង "ទាញយកជា PDF" ដើម្បីទទួលបានឯកសារ .pdf រក្សាទុកក្នុងកុំព្យូទ័រភ្លាមៗ' : 'Click "Export to PDF" to generate and download a clean .pdf file directly to your device.'}
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <p>
                  <strong>{language === 'km' ? 'ទំហំស្តង់ដារក្រសួង (MoEYS Standard):' : 'Standard Paper Size:'}</strong>{' '}
                  {pageSize === 'a5' ? (
                    <span>
                      {language === 'km' ? 'ទំហំ A5 សម្រាប់សៀវភៅតាមដាន និងព្រឹត្តិបត្រពិន្ទុប្រចាំខែ' : 'A5 size for student progress tracking slips & monthly report cards.'}
                    </span>
                  ) : (
                    <span>
                      {language === 'km' ? 'ទំហំ A4 សម្រាប់តារាងចំណាត់ថ្នាក់ តារាងកិត្តិយស និងព្រឹត្តិបត្រប្រចាំឆ្នាំ' : 'A4 size for ranking sheets, honor rolls, and annual transcripts.'}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <p>
                  <strong>{language === 'km' ? 'ហត្ថលេខា និងត្រាសាលា (Signatures & Stamp):' : 'Official Authentication:'}</strong>{' '}
                  {language === 'km' ? 'ឯកសារនីមួយៗរួមបញ្ចូលកន្លែងចុះហត្ថលេខារបស់គ្រូបន្ទុកថ្នាក់ និងនាយកសាលា' : 'Includes official signatures, dates, MoEYS crest, and school administrative seals.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowHelperModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {language === 'km' ? 'បិទ' : 'Close'}
              </button>
              <button
                onClick={() => {
                  setShowHelperModal(false);
                  handleDownloadPdf();
                }}
                className="px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-black transition cursor-pointer flex items-center space-x-1.5 shadow-md"
              >
                <FileDown className="w-4 h-4" />
                <span>{language === 'km' ? 'ទាញយកជា PDF ឥឡូវនេះ' : 'Download PDF Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

