import { useState, useEffect, useRef, useCallback } from 'react';
import { LS_PREFIX } from '../context/GradebookContext';

export interface AutoSaveBackupData {
  classId: string;
  className: string;
  periodId: string;
  timestamp: number;
  savedAtIso: string;
  timeFormatted: string;
  studentCount: number;
  scoresMatrix: Record<string, Record<string, Record<string, any>>>;
}

export interface UseAssessmentAutoSaveProps {
  activeClassId?: string;
  activeClassName?: string;
  selectedPeriodId: string;
  scoresMatrix: Record<string, Record<string, Record<string, any>>>;
  studentCount: number;
  intervalSeconds?: number; // default: 30 seconds
  onAutoSaveSuccess?: (timestamp: Date) => void;
}

export const useAssessmentAutoSave = ({
  activeClassId = 'default_class',
  activeClassName = 'ថ្នាក់',
  selectedPeriodId,
  scoresMatrix,
  studentCount,
  intervalSeconds = 30,
  onAutoSaveSuccess,
}: UseAssessmentAutoSaveProps) => {
  const [lastSavedTime, setLastSavedTime] = useState<Date>(() => new Date());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  const [secondsUntilSave, setSecondsUntilSave] = useState<number>(intervalSeconds);
  const [backupExists, setBackupExists] = useState<boolean>(false);
  const [backupInfo, setBackupInfo] = useState<AutoSaveBackupData | null>(null);

  // Keep references to latest values to avoid stale closures in intervals
  const scoresMatrixRef = useRef(scoresMatrix);
  scoresMatrixRef.current = scoresMatrix;

  const activeClassIdRef = useRef(activeClassId);
  activeClassIdRef.current = activeClassId;

  const activeClassNameRef = useRef(activeClassName);
  activeClassNameRef.current = activeClassName;

  const selectedPeriodIdRef = useRef(selectedPeriodId);
  selectedPeriodIdRef.current = selectedPeriodId;

  const studentCountRef = useRef(studentCount);
  studentCountRef.current = studentCount;

  const hasPendingChangesRef = useRef(hasPendingChanges);
  hasPendingChangesRef.current = hasPendingChanges;

  // Local storage keys
  const autoSaveKey = `${LS_PREFIX}assessment_autosave_${activeClassId}`;
  const lastSavedMetaKey = `${LS_PREFIX}assessment_last_saved_meta`;

  // Function to check existing backup in local storage
  const checkExistingBackup = useCallback(() => {
    try {
      const raw = localStorage.getItem(autoSaveKey);
      if (raw) {
        const parsed = JSON.parse(raw) as AutoSaveBackupData;
        setBackupInfo(parsed);
        setBackupExists(true);
      } else {
        setBackupInfo(null);
        setBackupExists(false);
      }
    } catch (err) {
      console.error('Error reading auto-save backup from localStorage:', err);
    }
  }, [autoSaveKey]);

  useEffect(() => {
    checkExistingBackup();
  }, [checkExistingBackup]);

  // Core save function to Local Storage
  const executeSave = useCallback((isManual = false) => {
    setIsSaving(true);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    try {
      const currentScores = scoresMatrixRef.current;
      
      // 1. Save standard primary scores key in localStorage
      localStorage.setItem(`${LS_PREFIX}scores`, JSON.stringify(currentScores));

      // 2. Save dedicated Assessment Auto-Save Backup snapshot with metadata
      const backupData: AutoSaveBackupData = {
        classId: activeClassIdRef.current,
        className: activeClassNameRef.current,
        periodId: selectedPeriodIdRef.current,
        timestamp: now.getTime(),
        savedAtIso: now.toISOString(),
        timeFormatted,
        studentCount: studentCountRef.current,
        scoresMatrix: currentScores,
      };

      localStorage.setItem(autoSaveKey, JSON.stringify(backupData));
      localStorage.setItem(lastSavedMetaKey, JSON.stringify({
        timestamp: now.getTime(),
        timeFormatted,
        isManual,
      }));

      setLastSavedTime(now);
      setHasPendingChanges(false);
      setSecondsUntilSave(intervalSeconds);
      setBackupInfo(backupData);
      setBackupExists(true);

      if (onAutoSaveSuccess) {
        onAutoSaveSuccess(now);
      }
    } catch (err) {
      console.error('Failed to auto-save scoring changes to local storage:', err);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  }, [autoSaveKey, intervalSeconds, lastSavedMetaKey, onAutoSaveSuccess]);

  // Mark changes as dirty whenever user inputs a score
  const markDirty = useCallback(() => {
    setHasPendingChanges(true);
  }, []);

  // Manual save trigger (Save Now)
  const saveImmediately = useCallback(() => {
    executeSave(true);
  }, [executeSave]);

  // Restore scores from the auto-save backup
  const restoreFromBackup = useCallback((): AutoSaveBackupData | null => {
    try {
      const raw = localStorage.getItem(autoSaveKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AutoSaveBackupData;
      return parsed;
    } catch (err) {
      console.error('Failed to parse auto-save backup:', err);
      return null;
    }
  }, [autoSaveKey]);

  // 30-second interval ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilSave((prev) => {
        if (prev <= 1) {
          // 30 seconds have elapsed
          if (hasPendingChangesRef.current) {
            executeSave(false);
          } else {
            // Heartbeat: even if no recent manual change, refresh backup state every 30s session
            executeSave(false);
          }
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [executeSave, intervalSeconds]);

  // Safety net: Save before user closes tab or navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasPendingChangesRef.current) {
        // Synchronous write to localStorage to prevent data loss
        try {
          const now = new Date();
          localStorage.setItem(`${LS_PREFIX}scores`, JSON.stringify(scoresMatrixRef.current));
          localStorage.setItem(autoSaveKey, JSON.stringify({
            classId: activeClassIdRef.current,
            className: activeClassNameRef.current,
            periodId: selectedPeriodIdRef.current,
            timestamp: now.getTime(),
            savedAtIso: now.toISOString(),
            timeFormatted: now.toLocaleTimeString(),
            studentCount: studentCountRef.current,
            scoresMatrix: scoresMatrixRef.current,
          }));
        } catch (err) {
          console.error('Error saving during beforeunload:', err);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also save when unmounting component
      if (hasPendingChangesRef.current) {
        handleBeforeUnload();
      }
    };
  }, [autoSaveKey]);

  return {
    lastSavedTime,
    isSaving,
    hasPendingChanges,
    secondsUntilSave,
    markDirty,
    saveImmediately,
    backupExists,
    backupInfo,
    restoreFromBackup,
  };
};
