import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends (React.Component as any) {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('Uncaught error in Gradebook Application:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('primary_gradebook_v2_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-rose-100 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              មានបញ្ហាបច្ចេកទេស / Application Error
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              កម្មវិធីបានជួបប្រទះបញ្ហាមិនរំពឹងទុក។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីដំណើរការឡើងវិញ ឬកំណត់ទិន្នន័យឡើងវិញ។
            </p>
            <p className="text-xs text-slate-500 mt-1">
              An unexpected error occurred. Please refresh the page or reset the local cache.
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs font-mono text-slate-700 overflow-x-auto max-h-36">
                <p className="font-bold text-rose-700">{this.state.error.name}: {this.state.error.message}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-900 text-white font-bold text-sm hover:bg-indigo-800 transition cursor-pointer shadow-md shadow-indigo-900/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ដំណើរការឡើងវិញ (Reload)</span>
              </button>

              <button
                onClick={this.handleResetCache}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-sm hover:bg-rose-100 transition cursor-pointer"
                title="Clears corrupted localStorage and resets to default sample data"
              >
                <Trash2 className="w-4 h-4" />
                <span>កំណត់ទិន្នន័យឡើងវិញ (Reset)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
