import React from 'react';
import { GradebookProvider, useGradebook } from './context/GradebookContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { SchoolAllClassesHub } from './components/school/SchoolAllClassesHub';
import { SchoolCalendarView } from './components/calendar/SchoolCalendarView';
import { SchoolScheduleView } from './components/schedule/SchoolScheduleView';
import { CurriculumProgramHub } from './components/curriculum/CurriculumProgramHub';
import { ClassStudentManagement } from './components/roster/ClassStudentManagement';
import { AssessmentScoringHub } from './components/scoring/AssessmentScoringHub';
import { DailyAttendanceTracker } from './components/attendance/DailyAttendanceTracker';
import { ClassroomToolsHub } from './components/tools/ClassroomToolsHub';
import { InteractiveMiniGamesHub } from './components/games/InteractiveMiniGamesHub';
import { ExamQuestionBankHub } from './components/exambank/ExamQuestionBankHub';
import { SpeedFluencyExamHub } from './components/fluency/SpeedFluencyExamHub';
import { ClassroomSeatingChart } from './components/seating/ClassroomSeatingChart';
import { DailyHomeworkTracker } from './components/homework/DailyHomeworkTracker';
import { YearlyBackupRestoreCenter } from './components/backup/YearlyBackupRestoreCenter';
import { RankingsAndHonorRoll } from './components/rankings/RankingsAndHonorRoll';
import { WholeYearAnalytics } from './components/analytics/WholeYearAnalytics';
import { ReportCardView } from './components/reports/ReportCardView';
import { SettingsModal } from './components/settings/SettingsModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { PWAUpdateNotification } from './components/pwa/PWAUpdateNotification';

const MainContent: React.FC = () => {
  const { activeTab } = useGradebook();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {activeTab === 'school_hub' && <SchoolAllClassesHub />}
      {activeTab === 'dashboard' && <DashboardOverview />}
      {activeTab === 'attendance' && <DailyAttendanceTracker />}
      {activeTab === 'seating' && <ClassroomSeatingChart />}
      {activeTab === 'homework' && <DailyHomeworkTracker />}
      {activeTab === 'classroom_tools' && <ClassroomToolsHub />}
      {activeTab === 'mini_games' && <ClassroomToolsHub initialTab="games" />}
      {activeTab === 'exam_bank' && <ExamQuestionBankHub />}
      {activeTab === 'fluency_exam' && <SpeedFluencyExamHub />}
      {activeTab === 'calendar' && <SchoolCalendarView />}
      {activeTab === 'schedule' && <SchoolScheduleView />}
      {activeTab === 'curriculum' && <CurriculumProgramHub />}
      {activeTab === 'roster' && <ClassStudentManagement />}
      {activeTab === 'scoring' && <AssessmentScoringHub />}
      {activeTab === 'rankings' && <RankingsAndHonorRoll />}
      {activeTab === 'analytics' && <WholeYearAnalytics />}
      {activeTab === 'report_card' && <ReportCardView />}
      {activeTab === 'backup_restore' && <YearlyBackupRestoreCenter />}
      {activeTab === 'settings' && <SettingsModal />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { language } = useGradebook();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <Header />
      <Navigation />
      <div className="flex-1">
        <MainContent />
      </div>
      <ToastContainer />
      
      {/* PWA Offline Indicator and Update Lifecycle Notification */}
      <OfflineIndicator language={language} />
      <PWAUpdateNotification language={language} />
      
      {/* Footer (Hidden on print) */}
      <footer className="no-print border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ និងការវាយតម្លៃសិស្ស</span>
            <span>•</span>
            <span>Primary Gradebook & Evaluation</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 font-medium">
            <span>Made With ❤️ By Sethka</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <GradebookProvider>
        <AppShell />
      </GradebookProvider>
    </ErrorBoundary>
  );
}
