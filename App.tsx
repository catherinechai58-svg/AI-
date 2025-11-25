import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ChatWidget } from './components/ChatWidget';
import { analyzeData } from './services/inference';
import { AnalysisResult } from './types';
import { 
  LayoutDashboard, 
  Database, 
  Settings as SettingsIcon, 
  Activity, 
  BrainCircuit, 
  Server, 
  Globe, 
  Shield, 
  Zap,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Cpu,
  HardDrive
} from 'lucide-react';

// --- Sub-views for the Sidebar ---

interface DataSourcesViewProps {
  sources: any[];
  onAddSource: () => void;
  onRemoveSource: (name: string) => void;
}

const DataSourcesView: React.FC<DataSourcesViewProps> = ({ sources, onAddSource, onRemoveSource }) => (
  <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Local Data Mounts</h2>
        <p className="text-slate-400">Manage local file paths and database connections.</p>
      </div>
      <button 
        onClick={onAddSource}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Mount Volume
      </button>
    </div>

    <div className="grid gap-4">
      {sources.map((source, i) => (
        <div key={i} className="bg-slate-800/50 hover:bg-slate-800 transition-colors p-5 rounded-xl border border-slate-700 flex justify-between items-center group">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${source.status === 'warning' ? 'bg-orange-500/10' : 'bg-blue-500/10'}`}>
              <source.icon className={`w-6 h-6 ${source.status === 'warning' ? 'text-orange-400' : 'text-blue-400'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors">{source.name}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">{source.type}</span>
                <span>Path: {source.path}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
              source.status === 'active' 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            }`}>
              {source.status === 'active' ? 'Mounted' : 'Unmounted'}
            </span>
            <button 
              onClick={() => onRemoveSource(source.name)}
              className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
              title="Unmount"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      {sources.length === 0 && (
        <div className="text-center p-10 border border-dashed border-slate-700 rounded-xl text-slate-500">
          No local volumes mounted. Click "Mount Volume" to add a dataset path.
        </div>
      )}
    </div>
  </div>
);

const RealTimeView = () => (
  <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex justify-between items-center mb-8">
       <div>
        <h2 className="text-2xl font-bold text-white mb-2">Local Cluster Status</h2>
        <p className="text-slate-400">Monitoring local GPU resources and inference latency.</p>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span className="text-xs font-medium text-green-400">Localhost:8000 Connected</span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[
        { label: 'VRAM Usage (24GB)', value: '18.2 GB', color: 'purple', icon: Cpu },
        { label: 'Tensor Core Load', value: '92%', color: 'blue', icon: Activity },
        { label: 'Inference Speed', value: '45 tok/s', color: 'emerald', icon: Zap },
      ].map((stat, i) => (
        <div key={i} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <stat.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{stat.label}</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full w-[${i === 0 ? '75%' : i === 1 ? '92%' : '60%'}] bg-${stat.color}-500 rounded-full`}></div>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-slate-800 rounded-xl border border-slate-700 h-[400px] flex flex-col relative overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
        <h3 className="font-semibold text-slate-200">Inference Logs (Stdout)</h3>
        <button className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300">
          <RefreshCw className="w-3 h-3" /> Tailing
        </button>
      </div>
      <div className="flex-1 p-4 space-y-2 font-mono text-xs text-slate-400 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-transparent to-transparent pointer-events-none"></div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-3 opacity-70">
            <span className="text-slate-600">127.0.0.1 - - [27/Oct/2023:14:32:{10 + i}]</span>
            <span className={i % 3 === 0 ? 'text-green-400' : 'text-blue-400'}>
              {i % 3 === 0 ? '"POST /v1/chat/completions HTTP/1.1" 200' : '"GET /v1/models HTTP/1.1" 200'}
            </span>
            <span>
              {i % 3 === 0 
                ? 'len: 402 tokens_generated: 124 (24.5ms)' 
                : '-'}
            </span>
          </div>
        ))}
         <div className="flex gap-3 animate-pulse">
            <span className="text-slate-600">127.0.0.1 - - [27/Oct/2023:14:32:19]</span>
            <span className="text-green-400">[INFO]</span>
            <span className="text-slate-200">Loading model weights into GPU 0...</span>
          </div>
      </div>
    </div>
  </div>
);

interface SettingsViewProps {
  language: string;
  setLanguage: (lang: string) => void;
  deepReason: boolean;
  setDeepReason: (enabled: boolean) => void;
  modelName: string;
  setModelName: (model: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  language, setLanguage, deepReason, setDeepReason, modelName, setModelName 
}) => (
  <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
    <h2 className="text-2xl font-bold text-white mb-2">Local Settings</h2>
    <p className="text-slate-400 mb-8">Configure local inference parameters and model paths.</p>
    
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-400" />
          Model Weights
        </h3>
        <div className="space-y-5">
           <div className="flex justify-between items-center">
            <div>
              <div className="text-slate-200 font-medium">Active Model</div>
              <div className="text-xs text-slate-500">Select loaded .gguf or .safetensors model</div>
            </div>
             <select 
               value={modelName}
               onChange={(e) => setModelName(e.target.value)}
               className="bg-slate-900 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 w-64"
             >
              <option value="DeepResearch-8B">DeepResearch-8B-Q4_K_M.gguf</option>
              <option value="Tongyi-DeepResearch-30B">Tongyi-DeepThinking-30B-FP16.safetensors</option>
            </select>
          </div>
          <div className="h-px bg-slate-700/50"></div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="text-slate-200 font-medium">Output Language</div>
              <div className="text-xs text-slate-500">System prompt language constraint</div>
            </div>
             <select 
               value={language}
               onChange={(e) => setLanguage(e.target.value)}
               className="bg-slate-900 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 w-64"
             >
              <option value="Simplified Chinese">Simplified Chinese (中文)</option>
              <option value="English">English (US)</option>
              <option value="Spanish">Spanish</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>
          <div className="h-px bg-slate-700/50"></div>
           <div className="flex justify-between items-center">
             <div>
              <div className="text-slate-200 font-medium">Deep Thinking (CoT)</div>
              <div className="text-xs text-slate-500">Enable Chain-of-Thought decoding (Uses more VRAM)</div>
            </div>
             <button 
               onClick={() => setDeepReason(!deepReason)}
               className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${deepReason ? 'bg-blue-600' : 'bg-slate-700'}`}
             >
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${deepReason ? 'left-6' : 'left-1'}`}></div>
             </button>
          </div>
        </div>
      </div>

       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          Local Security
        </h3>
         <div className="space-y-4">
           {[
             'Air-gapped Mode (No External Network)',
             'Local PII Redaction (Regex + NER)',
             'Persist vector store to disk'
           ].map((item, i) => (
             <div key={i} className="flex items-center gap-3">
               <div className={`w-5 h-5 rounded border flex items-center justify-center bg-blue-500 border-blue-500`}>
                 <CheckCircle2 className="w-3.5 h-3.5 text-white" />
               </div>
               <span className="text-sm text-slate-300">{item}</span>
             </div>
           ))}
         </div>
      </div>
    </div>
  </div>
);

// --- Main App Component ---

type ViewType = 'dashboard' | 'sources' | 'realtime' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  // Dashboard specific state
  const [dataContent, setDataContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings state
  const [language, setLanguage] = useState('Simplified Chinese');
  const [modelName, setModelName] = useState('DeepResearch-8B');
  const [deepReason, setDeepReason] = useState(false);

  // Data Sources state (Mock)
  const [dataSources, setDataSources] = useState([
    { name: 'Local PostgreSQL', type: 'SQL', status: 'active', path: 'localhost:5432/production', icon: Database },
    { name: 'Sales Data CSV', type: 'File', status: 'active', path: '/mnt/data/sales_2023.csv', icon: HardDrive },
    { name: 'Audit Logs', type: 'Log', status: 'warning', path: '/var/log/audit/', icon: Server },
  ]);

  const handleAddSource = () => {
    const newSource = { 
      name: `Local Mount ${dataSources.length + 1}`, 
      type: 'File', 
      status: 'active', 
      path: '/mnt/data/new_dataset', 
      icon: HardDrive 
    };
    setDataSources([...dataSources, newSource]);
  };

  const handleRemoveSource = (name: string) => {
    setDataSources(dataSources.filter(s => s.name !== name));
  };

  const handleFileSelect = async (content: string, name: string) => {
    setDataContent(content);
    setFileName(name);
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeData(content, name, language, modelName);
      setAnalysisResult(result);
    } catch (err) {
      setError("Failed to analyze data locally. Ensure the local inference server is running.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setDataContent(null);
    setFileName('');
    setAnalysisResult(null);
    setError(null);
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: ViewType; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        currentView === id
          ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const getShortModelName = (fullName: string) => {
    if (fullName.includes('Tongyi')) return 'DeepThinking-30B';
    if (fullName.includes('DeepResearch')) return 'DeepResearch-8B';
    return fullName;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col overflow-hidden">
             <span className="font-bold text-sm tracking-tight text-white truncate" title={modelName}>
               {getShortModelName(modelName)}
             </span>
             <span className="text-[10px] text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Local Active
             </span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="sources" icon={HardDrive} label="Data Mounts" />
          <SidebarItem id="realtime" icon={Activity} label="GPU Status" />
          <SidebarItem id="settings" icon={SettingsIcon} label="Local Settings" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu className="w-12 h-12 text-blue-400" />
            </div>
            <h4 className="font-medium text-sm text-slate-200 mb-1 relative z-10">Local Inference</h4>
            <p className="text-xs text-slate-500 mb-3 relative z-10">Latency: 12ms</p>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
               <div className="h-full w-[40%] bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium text-slate-200 truncate">
               {currentView === 'dashboard' ? (fileName ? `Local Analysis: ${fileName}` : 'Dashboard') : 
                currentView === 'sources' ? 'Local Mounts' : 
                currentView === 'realtime' ? 'GPU Cluster' : 'Settings'}
            </h1>
          </div>
          
          {currentView === 'dashboard' && fileName && (
             <button 
                onClick={handleReset}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
             >
               <span className="text-lg leading-none">+</span> New Analysis
             </button>
          )}
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto relative">
          
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div className="p-6 md:p-8 min-h-full">
              {!dataContent && (
                <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 mt-10 md:mt-0">
                  <div className="text-center mb-10 max-w-lg">
                    <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                      {getShortModelName(modelName)}
                    </h2>
                    <p className="text-slate-400 text-lg">
                      Local deployment active. Upload your datasets to process them securely on your own infrastructure using {getShortModelName(modelName)}.
                    </p>
                  </div>
                  <FileUpload onFileSelect={handleFileSelect} isAnalyzing={isAnalyzing} />
                </div>
              )}

              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit className="w-6 h-6 text-blue-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-6 text-lg font-medium text-blue-400 animate-pulse">
                    Offloading to Local GPU...
                  </p>
                  <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-slate-300 font-medium">Qwen3Guard Local Active</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">Running inference on {getShortModelName(modelName)}</p>
                </div>
              )}

              {error && (
                <div className="max-w-2xl mx-auto mt-10 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-center flex flex-col items-center gap-2 animate-in fade-in">
                  <div className="p-2 bg-red-500/20 rounded-full mb-2">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <p>{error}</p>
                  <button 
                    onClick={handleReset} 
                    className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {analysisResult && (
                <div className="animate-in slide-in-from-bottom-5 duration-700">
                  <AnalysisDashboard result={analysisResult} />
                </div>
              )}
            </div>
          )}

          {/* Other Views */}
          {currentView === 'sources' && (
            <DataSourcesView 
              sources={dataSources} 
              onAddSource={handleAddSource} 
              onRemoveSource={handleRemoveSource} 
            />
          )}
          {currentView === 'realtime' && <RealTimeView />}
          {currentView === 'settings' && (
            <SettingsView 
              language={language} 
              setLanguage={setLanguage}
              deepReason={deepReason}
              setDeepReason={setDeepReason}
              modelName={modelName}
              setModelName={setModelName}
            />
          )}

        </div>
      </main>

      {/* Chat Widget Overlay - Only on Dashboard when data is present */}
      {currentView === 'dashboard' && analysisResult && dataContent && (
        <ChatWidget contextData={dataContent} language={language} modelName={getShortModelName(modelName)} />
      )}
    </div>
  );
};

export default App;