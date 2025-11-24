import React, { useCallback } from 'react';
import { Upload, FileText, FileSpreadsheet, AlertCircle, Files } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (content: string, name: string) => void;
  isAnalyzing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isAnalyzing }) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);

    const filePromises = fileList.map(file => {
      return new Promise<{ name: string; content: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            content: e.target?.result as string
          });
        };
        reader.readAsText(file);
      });
    });

    try {
      const results = await Promise.all(filePromises);
      
      let combinedContent = "";
      const names = results.map(r => r.name);
      
      results.forEach(res => {
        combinedContent += `\n=== START OF FILE: ${res.name} ===\n`;
        combinedContent += res.content;
        combinedContent += `\n=== END OF FILE: ${res.name} ===\n`;
      });

      onFileSelect(combinedContent, names.join(', '));
    } catch (error) {
      console.error("Error reading files:", error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500 transition-all duration-300 group">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-full pt-5 pb-6 cursor-pointer">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="p-4 rounded-full bg-slate-700 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors duration-300 mb-4">
               {isAnalyzing ? (
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
               ) : (
                 <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-400" />
               )}
            </div>
            <p className="mb-2 text-sm text-slate-300">
              <span className="font-semibold">Click to upload files</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">Supports multiple files (CSV, JSON, TXT, Code)</p>
          </div>
          <input 
            id="dropzone-file" 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            accept=".csv,.json,.txt,.md,.js,.py"
            disabled={isAnalyzing}
            multiple
          />
        </label>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-400 text-sm">
        <div className="flex items-center gap-2 p-3 rounded bg-slate-800/50 border border-slate-700">
          <FileSpreadsheet className="w-4 h-4 text-green-400" />
          <span>Structured Data</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded bg-slate-800/50 border border-slate-700">
          <Files className="w-4 h-4 text-blue-400" />
          <span>Multiple Files</span>
        </div>
         <div className="flex items-center gap-2 p-3 rounded bg-slate-800/50 border border-slate-700">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <span>Smart Insights</span>
        </div>
      </div>
    </div>
  );
};