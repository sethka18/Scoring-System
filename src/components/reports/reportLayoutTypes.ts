export type MoeysLayoutStyle = 
  | 'standard'       // ទម្រង់ក្រសួងស្តង់ដារ (Official MoEYS Standard - classic administrative layout)
  | 'modern'         // ទម្រង់សម័យទំនើប (Contemporary Clean - tinted cards, refined typography)
  | 'compact_booklet'// ទម្រង់សៀវភៅតាមដាន (A5 Booklet / Dense Slip - optimized for student record booklets)
  | 'honor_formal';  // ទម្រង់កិត្តិយសផ្លូវការ (Academic Honors & Certificate - royal ornamental border, gold accents)

export type ReportLogoMode = 
  | 'moeys_only'     // Official MoEYS Emblem only
  | 'school_only'    // Custom School Logo only
  | 'dual'           // Both MoEYS Emblem and School Logo
  | 'minimal';       // No graphic logo, text-only header

export type ReportStampMode = 
  | 'none'           // No stamp (blank space for physical stamp)
  | 'generated'      // Built-in official circular MoEYS / School red stamp
  | 'custom';        // Uploaded custom transparent stamp image

export type StampPosition = 
  | 'principal'        // Over Principal signature (Standard administrative practice)
  | 'center_watermark' // Faint watermark in center of page
  | 'both';            // Both over principal signature and faint watermark

export interface ReportLayoutConfig {
  layoutStyle: MoeysLayoutStyle;
  logoMode: ReportLogoMode;
  customLogoUrl?: string;
  logoSize: 'sm' | 'md' | 'lg'; // sm: 38px, md: 48px, lg: 58px

  stampMode: ReportStampMode;
  customStampUrl?: string;
  stampScale: number; // 75 to 130 (percent)
  stampOpacity: number; // 0.5 to 1.0
  stampRotation: number; // -8 to 8 degrees (default -4 for realistic tilt)
  stampPosition: StampPosition;
  stampText?: string; // e.g. "បានពិនិត្យ និងយល់ព្រម" or "នាយកសាលា"

  showPrincipalStamp: boolean;
  teacherSignatureUrl?: string;
  principalSignatureUrl?: string;
  showWatermark: boolean;
  watermarkOpacity: number; // 0.04 to 0.15
}

export const DEFAULT_REPORT_LAYOUT_CONFIG: ReportLayoutConfig = {
  layoutStyle: 'standard',
  logoMode: 'dual',
  customLogoUrl: '',
  logoSize: 'md',

  stampMode: 'generated',
  customStampUrl: '',
  stampScale: 100,
  stampOpacity: 0.92,
  stampRotation: -4,
  stampPosition: 'principal',
  stampText: 'បានពិនិត្យ និងយល់ព្រម',

  showPrincipalStamp: true,
  teacherSignatureUrl: '',
  principalSignatureUrl: '',
  showWatermark: false,
  watermarkOpacity: 0.06,
};

export const MOEYS_LAYOUT_STYLES: {
  id: MoeysLayoutStyle;
  nameKm: string;
  nameEn: string;
  descKm: string;
  descEn: string;
  badge: string;
}[] = [
  {
    id: 'standard',
    nameKm: 'ទម្រង់ក្រសួងស្តង់ដារ',
    nameEn: 'Official MoEYS Standard',
    descKm: 'គំរូរដ្ឋបាលផ្លូវការ បន្ទាត់រឹងមាំ ក្បាលសន្លឹកព្រះរាជាណាចក្រកម្ពុជា និងហត្ថលេខា ៣ ជួរ',
    descEn: 'Classic administrative layout with national heading, dual-tone borders and 3 signature blocks',
    badge: 'ពេញនិយមបំផុត (Official)',
  },
  {
    id: 'modern',
    nameKm: 'ទម្រង់សម័យទំនើប',
    nameEn: 'Contemporary Clean',
    descKm: 'រចនាបថទន់ភ្លន់ ជ្រុងមូល កាតព័ត៌មានសិស្សបែបទំនើប និងស្លាកនិទ្ទេសពណ៌',
    descEn: 'Modern refined aesthetics with tinted badges, rounded cards and clean dividers',
    badge: 'ស្រស់ស្អាត (Modern)',
  },
  {
    id: 'compact_booklet',
    nameKm: 'ទម្រង់សៀវភៅតាមដាន',
    nameEn: 'A5 Booklet / Compact',
    descKm: 'កម្រិតដង់ស៊ីតេខ្ពស់ សន្សំទំហំក្រដាស សមស្របសម្រាប់បិទក្នុងសៀវភៅតាមដានការសិក្សា',
    descEn: 'High-density compact layout optimized for gluing into student monitoring booklets',
    badge: 'សន្សំក្រដាស (Compact)',
  },
  {
    id: 'honor_formal',
    nameKm: 'ទម្រង់កិត្តិយសផ្លូវការ',
    nameEn: 'Academic Honors & Seal',
    descKm: 'ស៊ុមរចនាបថខ្មែររាជធានី ក្បាច់ពណ៌មាស ត្រាផ្លូវការ និងការបញ្ជាក់ចំណាត់ថ្នាក់ពិសេស',
    descEn: 'Royal Khmer ornamental border frame, gold accenting, and certificate-grade presentation',
    badge: 'ប្រណីតភាព (Prestige)',
  },
];
