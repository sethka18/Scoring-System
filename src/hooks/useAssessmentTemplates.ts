import { useState, useEffect, useCallback } from 'react';
import { AssessmentTemplate } from '../types';
import { DEFAULT_ASSESSMENT_TEMPLATES } from '../data/defaultAssessmentTemplates';
import { LS_PREFIX } from '../context/GradebookContext';

const TEMPLATES_LS_KEY = `${LS_PREFIX}assessment_templates`;

export const useAssessmentTemplates = () => {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>(() => {
    try {
      const stored = localStorage.getItem(TEMPLATES_LS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to parse saved assessment templates from localStorage:', err);
    }
    return DEFAULT_ASSESSMENT_TEMPLATES;
  });

  // Save to localStorage whenever templates change
  useEffect(() => {
    try {
      localStorage.setItem(TEMPLATES_LS_KEY, JSON.stringify(templates));
    } catch (err) {
      console.error('Failed to persist assessment templates to localStorage:', err);
    }
  }, [templates]);

  // Add new template
  const addTemplate = useCallback((templateData: Omit<AssessmentTemplate, 'id' | 'createdAt'>): AssessmentTemplate => {
    const newTemplate: AssessmentTemplate = {
      ...templateData,
      id: `tpl_custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSystemDefault: false,
    };

    setTemplates(prev => [newTemplate, ...prev]);
    return newTemplate;
  }, []);

  // Update existing template
  const updateTemplate = useCallback((id: string, updates: Partial<AssessmentTemplate>) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    }));
  }, []);

  // Delete template
  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  // Duplicate template
  const duplicateTemplate = useCallback((id: string): AssessmentTemplate | null => {
    const target = templates.find(t => t.id === id);
    if (!target) return null;

    const cloned: AssessmentTemplate = {
      ...target,
      id: `tpl_copy_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${target.name} (Copy)`,
      nameKm: `${target.nameKm} (ចម្លង)`,
      isSystemDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates(prev => [cloned, ...prev]);
    return cloned;
  }, [templates]);

  // Reset to default templates
  const resetToDefaults = useCallback(() => {
    setTemplates(DEFAULT_ASSESSMENT_TEMPLATES);
    localStorage.setItem(TEMPLATES_LS_KEY, JSON.stringify(DEFAULT_ASSESSMENT_TEMPLATES));
  }, []);

  // Export templates as JSON string
  const exportTemplatesJson = useCallback(() => {
    const dataStr = JSON.stringify(templates, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MoEYS_Assessment_Templates_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [templates]);

  // Import templates from JSON
  const importTemplates = useCallback((jsonString: string): { success: boolean; count: number; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'File format is not an array of templates' };
      }

      // Validate required properties
      const validTemplates: AssessmentTemplate[] = [];
      for (const item of parsed) {
        if (item.name && item.nameKm && item.subjectId && item.targetField) {
          validTemplates.push({
            id: item.id || `tpl_imported_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: item.name,
            nameKm: item.nameKm,
            description: item.description || '',
            descriptionKm: item.descriptionKm || '',
            subjectId: item.subjectId,
            type: item.type || 'quiz',
            targetField: item.targetField,
            targetFieldLabelKm: item.targetFieldLabelKm || '',
            targetFieldLabelEn: item.targetFieldLabelEn || '',
            maxScore: typeof item.maxScore === 'number' ? item.maxScore : 10,
            defaultScore: typeof item.defaultScore === 'number' ? item.defaultScore : 8.0,
            passingScore: typeof item.passingScore === 'number' ? item.passingScore : 5.0,
            quickScorePills: Array.isArray(item.quickScorePills) && item.quickScorePills.length > 0 
              ? item.quickScorePills 
              : [5, 6, 7, 8, 8.5, 9, 10],
            presetRemarks: Array.isArray(item.presetRemarks) ? item.presetRemarks : [],
            criteria: Array.isArray(item.criteria) ? item.criteria : [],
            isSystemDefault: false,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      if (validTemplates.length === 0) {
        return { success: false, count: 0, error: 'No valid assessment templates found in imported file' };
      }

      setTemplates(prev => {
        // Merge without duplicate IDs
        const existingIds = new Set(prev.map(p => p.id));
        const newToAdd = validTemplates.filter(v => !existingIds.has(v.id));
        return [...newToAdd, ...prev];
      });

      return { success: true, count: validTemplates.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Invalid JSON syntax' };
    }
  }, []);

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    resetToDefaults,
    exportTemplatesJson,
    importTemplates,
  };
};
