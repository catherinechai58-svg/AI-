
import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ChatWidget } from './components/ChatWidget';
// Restored import to the original inference service structure
import { analyzeData } from './services/inference';
import { AuthService } from './services/auth';
import { HistoryService } from './services/history';
import { LoginScreen } from './components/LoginScreen';
import { AnalysisResult, User, AnalysisHistoryItem, TokenUsage } from './types';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Activity, 
  Database,
  ShieldCheck,
  BrainCircuit,
  Menu,
  X,
  Globe,
  Zap,
  Trash2,
  Eye,
  Terminal,
  HardDrive,
  FileText,
  Lightbulb,
  Gauge,
  Cpu
} from 'lucide-react';

// --- System Translations ---

const translations: Record<string, any> = {
  'Simplified Chinese': {
    dashboard: '仪表盘',
    archives: '归档',
    settings: '设置',
    logout: '退出登录',
    systemStatus: '系统状态',
    inferenceApi: '推理接口',
    model: '模型',
    thinking: '深度思考',
    security: '安全',
    credits: '点数',
    analyst: '分析师',
    systemSettings: '系统设置',
    deepThinking: '深度思考',
    deepThinkingDesc: '启用扩展推理链以处理复杂查询。会增加延迟。',
    modelConfig: '模型配置',
    modelDescFlash: '快速，高效，通用。',
    modelDescPro: '复杂推理和因果分析。',
    modelDescQwen72B: '阿里云顶级代码模型。',
    modelDescQwenMax: '顶级通用智能。',
    systemLanguage: '系统语言',
    analysisArchives: '分析归档',
    storedReports: '份已存报告',
    noHistory: '暂无分析历史。',
    generateReportMsg: '生成报告后将在此显示。',
    load: '加载',
    enterpriseTitle: '企业级数据智能',
    enterpriseDesc: '安全上传您的结构化数据，使用 {modelName} 进行即时分析。',
    processing: '正在使用 {modelName} 处理...',
    detecting: '正在检测模式并生成见解',
    analysisReport: '分析报告',
    source: '来源',
    newAnalysis: '新分析',
    resetTryAgain: '重置并重试',
    thinkingMode: '思考模式',
    tokenMonitor: 'Token 监测',
    sessionUsage: '会话用量',
    input: '输入',
    output: '输出',
    total: '总计'
  },
  'English': {
    dashboard: 'Dashboard',
    archives: 'Archives',
    settings: 'Settings',
    logout: 'Logout',
    systemStatus: 'System Status',
    inferenceApi: 'Inference API',
    model: 'Model',
    thinking: 'Thinking',
    security: 'Security',
    credits: 'Credits',
    analyst: 'Analyst',
    systemSettings: 'System Settings',
    deepThinking: 'Deep Thinking',
    deepThinkingDesc: 'Enable extended reasoning chains for complex queries. Increases latency.',
    modelConfig: 'Model Configuration',
    modelDescFlash: 'Fast, efficient, general purpose.',
    modelDescPro: 'Complex reasoning and causal analysis.',
    modelDescQwen72B: "Alibaba Cloud's premier coding model.",
    modelDescQwenMax: 'Top-tier general intelligence.',
    systemLanguage: 'System Language',
    analysisArchives: 'Analysis Archives',
    storedReports: 'stored reports',
    noHistory: 'No analysis history found.',
    generateReportMsg: 'Generate a report to see it here.',
    load: 'Load',
    enterpriseTitle: 'Enterprise Data Intelligence',
    enterpriseDesc: 'Securely upload your structured data for instant analysis powered by {modelName}.',
    processing: 'Processing with {modelName}...',
    detecting: 'Detecting patterns and generating insights',
    analysisReport: 'Analysis Report',
    source: 'Source',
    newAnalysis: 'New Analysis',
    resetTryAgain: 'Reset & Try Again',
    thinkingMode: 'Thinking Mode',
    tokenMonitor: 'Token Monitor',
    sessionUsage: 'Session Usage',
    input: 'Input',
    output: 'Output',
    total: 'Total'
  },
  'Japanese': {
    dashboard: 'ダッシュボード',
    archives: 'アーカイブ',
    settings: '設定',
    logout: 'ログアウト',
    systemStatus: 'システム状態',
    inferenceApi: '推論API',
    model: 'モデル',
    thinking: '思考',
    security: 'セキュリティ',
    credits: 'クレジット',
    analyst: 'アナリスト',
    systemSettings: 'システム設定',
    deepThinking: '深い思考',
    deepThinkingDesc: '複雑なクエリのための拡張推論チェーンを有効にします。遅延が増加します。',
    modelConfig: 'モデル構成',
    modelDescFlash: '高速、効率的、汎用。',
    modelDescPro: '複雑な推論と因果分析。',
    modelDescQwen72B: 'Alibaba Cloudのプレミアコードモデル。',
    modelDescQwenMax: 'トップティアの汎用知能。',
    systemLanguage: 'システム言語',
    analysisArchives: '分析アーカイブ',
    storedReports: '保存されたレポート',
    noHistory: '分析履歴が見つかりません。',
    generateReportMsg: 'レポートを生成するとここに表示されます。',
    load: '読み込む',
    enterpriseTitle: 'エンタープライズデータインテリジェンス',
    enterpriseDesc: '構造化データを安全にアップロードし、{modelName} で即座に分析します。',
    processing: '{modelName} で処理中...',
    detecting: 'パターンを検出し、洞察を生成中',
    analysisReport: '分析レポート',
    source: 'ソース',
    newAnalysis: '新しい分析',
    resetTryAgain: 'リセットして再試行',
    thinkingMode: '思考モード',
    tokenMonitor: 'トークンモニター',
    sessionUsage: 'セッション使用量',
    input: '入力',
    output: '出力',
    total: '合計'
  },
  'Korean': {
    dashboard: '대시보드',
    archives: '아카이브',
    settings: '설정',
    logout: '로그아웃',
    systemStatus: '시스템 상태',
    inferenceApi: '추론 API',
    model: '모델',
    thinking: '생각',
    security: '보안',
    credits: '크레딧',
    analyst: '분석가',
    systemSettings: '시스템 설정',
    deepThinking: '깊은 생각',
    deepThinkingDesc: '복잡한 쿼리에 대한 확장 추론 체인을 활성화합니다. 대기 시간이 늘어납니다.',
    modelConfig: '모델 구성',
    modelDescFlash: '빠르고 효율적이며 범용적입니다.',
    modelDescPro: '복잡한 추론 및 인과 분석.',
    modelDescQwen72B: 'Alibaba Cloud의 프리미어 코드 모델.',
    modelDescQwenMax: '최상위 범용 지능.',
    systemLanguage: '시스템 언어',
    analysisArchives: '분석 아카이브',
    storedReports: '저장된 보고서',
    noHistory: '분석 기록이 없습니다.',
    generateReportMsg: '보고서를 생성하면 여기에 표시됩니다.',
    load: '로드',
    enterpriseTitle: '엔터프라이즈 데이터 인텔리전스',
    enterpriseDesc: '구조화된 데이터를 안전하게 업로드하여 {modelName}로 즉시 분석하세요.',
    processing: '{modelName}로 처리 중...',
    detecting: '패턴 감지 및 통찰력 생성',
    analysisReport: '분석 보고서',
    source: '소스',
    newAnalysis: '새 분석',
    resetTryAgain: '재설정 및 다시 시도',
    thinkingMode: '생각 모드',
    tokenMonitor: '토큰 모니터',
    sessionUsage: '세션 사용량',
    input: '입력',
    output: '출력',
    total: '합계'
  },
  'Spanish': {
    dashboard: 'Panel',
    archives: 'Archivos',
    settings: 'Ajustes',
    logout: 'Cerrar Sesión',
    systemStatus: 'Estado del Sistema',
    inferenceApi: 'API Inferencia',
    model: 'Modelo',
    thinking: 'Pensamiento',
    security: 'Seguridad',
    credits: 'Créditos',
    analyst: 'Analista',
    systemSettings: 'Configuración del Sistema',
    deepThinking: 'Pensamiento Profundo',
    deepThinkingDesc: 'Habilitar cadenas de razonamiento extendidas. Aumenta la latencia.',
    modelConfig: 'Configuración del Modelo',
    modelDescFlash: 'Rápido, eficiente, propósito general.',
    modelDescPro: 'Razonamiento complejo y análisis causal.',
    modelDescQwen72B: 'Modelo de código premier de Alibaba Cloud.',
    modelDescQwenMax: 'Inteligencia general de primer nivel.',
    systemLanguage: 'Idioma del Sistema',
    analysisArchives: 'Archivos de Análisis',
    storedReports: 'informes guardados',
    noHistory: 'No se encontró historial.',
    generateReportMsg: 'Genere un informe para verlo aquí.',
    load: 'Cargar',
    enterpriseTitle: 'Inteligencia de Datos Empresarial',
    enterpriseDesc: 'Suba sus datos estructurados para análisis instantáneo con {modelName}.',
    processing: 'Procesando con {modelName}...',
    detecting: 'Detectando patrones y generando ideas',
    analysisReport: 'Informe de Análisis',
    source: 'Fuente',
    newAnalysis: 'Nuevo Análisis',
    resetTryAgain: 'Reiniciar e Intentar',
    thinkingMode: 'Modo Pensamiento',
    tokenMonitor: 'Monitor de Tokens',
    sessionUsage: 'Uso de Sesión',
    input: 'Entrada',
    output: 'Salida',
    total: 'Total'
  },
  'French': {
    dashboard: 'Tableau de bord',
    archives: 'Archives',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    systemStatus: 'État du système',
    inferenceApi: 'API Inférence',
    model: 'Modèle',
    thinking: 'Réflexion',
    security: 'Sécurité',
    credits: 'Crédits',
    analyst: 'Analyste',
    systemSettings: 'Paramètres Système',
    deepThinking: 'Réflexion Profonde',
    deepThinkingDesc: 'Activer des chaînes de raisonnement étendues. Augmente la latence.',
    modelConfig: 'Configuration du Modèle',
    modelDescFlash: 'Rapide, efficace, usage général.',
    modelDescPro: 'Raisonnement complexe et analyse causale.',
    modelDescQwen72B: 'Modèle de code premier d\'Alibaba Cloud.',
    modelDescQwenMax: 'Intelligence générale de haut niveau.',
    systemLanguage: 'Langue du Système',
    analysisArchives: 'Archives d\'Analyse',
    storedReports: 'rapports stockés',
    noHistory: 'Aucun historique trouvé.',
    generateReportMsg: 'Générez un rapport pour le voir ici.',
    load: 'Charger',
    enterpriseTitle: 'Intelligence de Données d\'Entreprise',
    enterpriseDesc: 'Téléchargez vos données structurées pour une analyse instantanée avec {modelName}.',
    processing: 'Traitement avec {modelName}...',
    detecting: 'Détection de modèles et génération d\'idées',
    analysisReport: 'Rapport d\'Analyse',
    source: 'Source',
    newAnalysis: 'Nouvelle Analyse',
    resetTryAgain: 'Réinitialiser et Réessayer',
    thinkingMode: 'Mode Réflexion',
    tokenMonitor: 'Moniteur de Jetons',
    sessionUsage: 'Utilisation Session',
    input: 'Entrée',
    output: 'Sortie',
    total: 'Total'
  },
  'German': {
    dashboard: 'Dashboard',
    archives: 'Archive',
    settings: 'Einstellungen',
    logout: 'Abmelden',
    systemStatus: 'Systemstatus',
    inferenceApi: 'Inferenz API',
    model: 'Modell',
    thinking: 'Denken',
    security: 'Sicherheit',
    credits: 'Credits',
    analyst: 'Analyst',
    systemSettings: 'Systemeinstellungen',
    deepThinking: 'Tiefes Denken',
    deepThinkingDesc: 'Erweiterte Argumentationsketten aktivieren. Erhöht die Latenz.',
    modelConfig: 'Modellkonfiguration',
    modelDescFlash: 'Schnell, effizient, allgemein.',
    modelDescPro: 'Komplexes Denken und Kausalanalyse.',
    modelDescQwen72B: 'Alibaba Clouds führendes Codemodell.',
    modelDescQwenMax: 'Allgemeine Intelligenz der Spitzenklasse.',
    systemLanguage: 'Systemsprache',
    analysisArchives: 'Analysearchive',
    storedReports: 'gespeicherte Berichte',
    noHistory: 'Kein Verlauf gefunden.',
    generateReportMsg: 'Generieren Sie einen Bericht, um ihn hier zu sehen.',
    load: 'Laden',
    enterpriseTitle: 'Enterprise Data Intelligence',
    enterpriseDesc: 'Laden Sie Ihre strukturierten Daten für eine sofortige Analyse mit {modelName} hoch.',
    processing: 'Verarbeitung mit {modelName}...',
    detecting: 'Mustererkennung und Generierung von Erkenntnissen',
    analysisReport: 'Analysebericht',
    source: 'Quelle',
    newAnalysis: 'Neue Analyse',
    resetTryAgain: 'Zurücksetzen & Wiederholen',
    thinkingMode: 'Denkmodus',
    tokenMonitor: 'Token-Monitor',
    sessionUsage: 'Sitzungsverbrauch',
    input: 'Eingabe',
    output: 'Ausgabe',
    total: 'Gesamt'
  }
};


// --- Components for the "Middle Page" Experience ---

const SystemBoot: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [steps, setSteps] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sequence = [
      { msg: "Initializing DeepAnalyze Kernel...", delay: 200 },
      { msg: "Verifying User Credentials...", delay: 600 },
      { msg: "Connecting to DeepAnalyze-8B Inference Node...", delay: 1200 },
      { msg: "Allocating Virtual Context Window (128k Tokens)...", delay: 1800 },
      { msg: "Loading QwenGuard Safety Protocols...", delay: 2400 },
      { msg: "System Ready.", delay: 3000 }
    ];

    let currentDelay = 0;
    sequence.forEach(({ msg, delay }, index) => {
      setTimeout(() => {
        setSteps(prev => [...prev, msg]);
        setProgress(((index + 1) / sequence.length) * 100);
        if (index === sequence.length - 1) {
          setTimeout(onComplete, 500);
        }
      }, delay);
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 text-slate-200 font-mono">
      <div className="w-full max-w-lg p-8">
        <div className="flex items-center gap-3 mb-6 text-blue-500">
           <Terminal className="w-8 h-8" />
           <span className="text-xl font-bold tracking-wider">SYSTEM_BOOT</span>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 h-64 overflow-y-auto mb-6 shadow-2xl font-sm">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-left-2">
              <span className="text-green-500">➜</span>
              <span className={i === steps.length - 1 ? "text-white animate-pulse" : "text-slate-400"}>
                {step}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs uppercase tracking-widest text-slate-500">
            <span>Loading Modules</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isBooting, setIsBooting] = useState(false); 

  // App State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'database' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data State
  const [dataContent, setDataContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [language, setLanguage] = useState('English');
  const [modelName, setModelName] = useState('DeepAnalyze-8B (Flash)');
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  
  // Database State
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  
  // Token Monitor State
  const [sessionTokenUsage, setSessionTokenUsage] = useState<TokenUsage>({ promptTokens: 0, outputTokens: 0, totalTokens: 0 });

  const t = translations[language] || translations['English'];

  // Check for existing session
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoadingAuth(false);
    
    // Load history
    setHistoryItems(HistoryService.getAll());
  }, []);

  const handleLogin = (loggedInUser: User) => {
    // Trigger boot sequence on login
    setIsBooting(true);
    setUser(loggedInUser);
    setHistoryItems(HistoryService.getAll());
  };

  const handleBootComplete = () => {
    setIsBooting(false);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setDataContent(null);
    setAnalysisResult(null);
    setSessionTokenUsage({ promptTokens: 0, outputTokens: 0, totalTokens: 0 });
  };

  const updateSessionUsage = (usage: TokenUsage) => {
    setSessionTokenUsage(prev => ({
      promptTokens: prev.promptTokens + usage.promptTokens,
      outputTokens: prev.outputTokens + usage.outputTokens,
      totalTokens: prev.totalTokens + usage.totalTokens
    }));
  };

  const handleFileSelect = async (content: string, name: string) => {
    if (!user) return;

    // Check credits
    if (!AuthService.canGenerateReport(user)) {
      setError("Daily limit reached (3/3). Please try again tomorrow.");
      return;
    }

    setError(null);
    setDataContent(content);
    setFileName(name);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Use standard inference service (internally using Gemini)
      const result = await analyzeData(content, name, language, modelName, useDeepThinking);
      
      setAnalysisResult(result);

      // Track token usage
      if (result.usage) {
        updateSessionUsage(result.usage);
      }
      
      // Auto-save to history
      const savedItem = HistoryService.saveAnalysis(name, result, modelName, language);
      setHistoryItems(prev => [savedItem, ...prev]);

      // Update credits
      const updatedUser = AuthService.incrementUsage(user.username);
      setUser(updatedUser);
    } catch (err) {
      setError("Analysis failed. Please try again.");
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
  
  const handleLoadHistory = (item: AnalysisHistoryItem) => {
    setAnalysisResult(item.result);
    setFileName(item.fileName);
    setDataContent("Loaded from history - Raw data not available");
    setActiveTab('dashboard');
  };

  const handleDeleteHistory = (id: string) => {
    const updated = HistoryService.delete(id);
    setHistoryItems(updated);
  };

  if (isLoadingAuth) return <div className="h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Show Boot Sequence if active
  if (isBooting) {
    return <SystemBoot onComplete={handleBootComplete} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col z-20`}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-800 relative">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">DeepAnalyze</span>
            </div>
          ) : (
             <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
             </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">{t.dashboard}</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              activeTab === 'database' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Database className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">{t.archives}</span>}
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              activeTab === 'settings' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">{t.settings}</span>}
          </button>

          <div className="my-4 border-t border-slate-800 mx-2"></div>
          
          {/* Status Indicators */}
          <div className={`px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 ${!isSidebarOpen && 'hidden'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-slate-300">{t.systemStatus}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t.inferenceApi}</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t.model}</span>
                <span className="text-blue-400 truncate w-24 text-right">{modelName.split(' ')[0]}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t.thinking}</span>
                <span className={useDeepThinking ? "text-purple-400" : "text-slate-600"}>{useDeepThinking ? 'ON' : 'OFF'}</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-green-500 h-full rounded-full w-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Token Monitor */}
          <div className={`px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 mt-2 ${!isSidebarOpen && 'hidden'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-semibold text-slate-300">{t.tokenMonitor}</span>
            </div>
            <div className="space-y-2">
               <div className="flex justify-between text-xs text-slate-400">
                <span>{t.input}</span>
                <span className="text-slate-200">{sessionTokenUsage.promptTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t.output}</span>
                <span className="text-slate-200">{sessionTokenUsage.outputTokens.toLocaleString()}</span>
              </div>
              <div className="pt-1 mt-1 border-t border-slate-700/50 flex justify-between text-xs font-medium">
                <span className="text-yellow-400">{t.total}</span>
                <span className="text-white">{sessionTokenUsage.totalTokens.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
           <div className={`px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 mt-2 ${!isSidebarOpen && 'hidden'}`}>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-300">{t.security}</span>
            </div>
             <div className="flex justify-between text-xs text-slate-400">
                <span>QwenGuard</span>
                <span className="text-green-400">Enabled</span>
              </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">{t.logout}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6 z-10 sticky top-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-6">
            {/* Credits Counter */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
              <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium text-slate-300">
                {t.credits}: <span className="text-white">{AuthService.getRemainingCredits(user)}</span>/3
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user.username}</p>
                <p className="text-xs text-slate-500">{t.analyst}</p>
              </div>
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          
          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-5">
              <h2 className="text-2xl font-bold text-white">{t.systemSettings}</h2>
              
              {/* Deep Thinking Toggle */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      {t.deepThinking}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {t.deepThinkingDesc}
                    </p>
                  </div>
                  <button 
                    onClick={() => setUseDeepThinking(!useDeepThinking)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useDeepThinking ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useDeepThinking ? 'translate-x-6' : 'translate-x-1'
                      }`} 
                    />
                  </button>
                </div>
              </div>

              {/* Model Selection */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  {t.modelConfig}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gemini Models */}
                  <div 
                    onClick={() => setModelName('DeepAnalyze-8B (Flash)')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      modelName === 'DeepAnalyze-8B (Flash)' 
                      ? 'bg-blue-600/10 border-blue-500' 
                      : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-white">DeepAnalyze-8B (Flash)</span>
                      {modelName === 'DeepAnalyze-8B (Flash)' && <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
                    </div>
                    <p className="text-xs text-slate-400">{t.modelDescFlash}</p>
                  </div>
                  
                  <div 
                    onClick={() => setModelName('DeepAnalyze-32B (Pro)')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      modelName === 'DeepAnalyze-32B (Pro)' 
                      ? 'bg-purple-600/10 border-purple-500' 
                      : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-white">DeepAnalyze-32B (Pro)</span>
                       {modelName === 'DeepAnalyze-32B (Pro)' && <div className="w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>}
                    </div>
                    <p className="text-xs text-slate-400">{t.modelDescPro}</p>
                  </div>

                  {/* Qwen Models */}
                  <div 
                    onClick={() => setModelName('Qwen-2.5 (72B)')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      modelName === 'Qwen-2.5 (72B)' 
                      ? 'bg-emerald-600/10 border-emerald-500' 
                      : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-white">Qwen-2.5 (72B)</span>
                       {modelName === 'Qwen-2.5 (72B)' && <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                    </div>
                    <p className="text-xs text-slate-400">{t.modelDescQwen72B}</p>
                  </div>

                  <div 
                    onClick={() => setModelName('Qwen-Max')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      modelName === 'Qwen-Max' 
                      ? 'bg-cyan-600/10 border-cyan-500' 
                      : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-white">Qwen-Max</span>
                       {modelName === 'Qwen-Max' && <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>}
                    </div>
                    <p className="text-xs text-slate-400">{t.modelDescQwenMax}</p>
                  </div>
                </div>
              </div>

              {/* Language Selection */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  {t.systemLanguage}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Simplified Chinese', 'English', 'Japanese', 'Korean', 'Spanish', 'French', 'German'].map(lang => (
                    <label key={lang} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      language === lang 
                        ? 'bg-blue-600/20 border-blue-500' 
                        : 'bg-slate-900 border-slate-700 hover:bg-slate-700/50'
                    }`}>
                      <span className="text-slate-300 text-sm">{lang}</span>
                      <input 
                        type="radio" 
                        name="lang" 
                        checked={language === lang} 
                        onChange={() => setLanguage(lang)}
                        className="w-3 h-3 text-blue-600 bg-slate-900 border-slate-600 accent-blue-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DATABASE/HISTORY TAB */}
          {activeTab === 'database' && (
             <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{t.analysisArchives}</h2>
                <div className="text-sm text-slate-500">{historyItems.length} {t.storedReports}</div>
              </div>

              {historyItems.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed">
                  <HardDrive className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">{t.noHistory}</p>
                  <p className="text-sm text-slate-600 mt-2">{t.generateReportMsg}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {historyItems.map((item) => (
                    <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 text-slate-300 font-medium truncate">
                           <FileText className="w-4 h-4 text-blue-400" />
                           <span className="truncate max-w-[200px]">{item.fileName}</span>
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400 line-clamp-3 mb-4 h-12">
                        {item.result.summary}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-mono">
                         <span className="bg-slate-900/50 px-2 py-1 rounded border border-slate-800">{item.model.split(' ')[0]}</span>
                         <span className="bg-slate-900/50 px-2 py-1 rounded border border-slate-800">{item.language}</span>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-slate-700">
                        <button 
                          onClick={() => handleLoadHistory(item)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-all text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          {t.load}
                        </button>
                        <button 
                          onClick={() => handleDeleteHistory(item.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
             </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              {!dataContent && (
                <div className="h-full flex flex-col items-center justify-start pt-10 animate-in fade-in zoom-in duration-500">
                  <div className="text-center mb-10 max-w-2xl">
                    <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                      {t.enterpriseTitle}
                    </h2>
                    <p className="text-slate-400 text-lg">
                      {t.enterpriseDesc.replace('{modelName}', modelName)}
                    </p>
                  </div>

                  <FileUpload onFileSelect={handleFileSelect} isAnalyzing={isAnalyzing} language={language} />
                </div>
              )}

              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-blue-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-6 text-lg font-medium text-blue-400 animate-pulse">
                    {t.processing.replace('{modelName}', modelName)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{t.detecting} {useDeepThinking && `(${t.thinkingMode})`}</p>
                </div>
              )}

              {error && (
                <div className="max-w-2xl mx-auto mt-10 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-center flex flex-col items-center gap-2 animate-in fade-in">
                  <div className="p-2 bg-red-500/20 rounded-full mb-2">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                  <p>{error}</p>
                  <button 
                    onClick={handleReset} 
                    className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t.resetTryAgain}
                  </button>
                </div>
              )}

              {analysisResult && (
                <div className="animate-in slide-in-from-bottom-5 duration-700 pb-20">
                   <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white">{t.analysisReport}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-slate-400 text-sm">{t.source}: {fileName}</p>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500 text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{modelName}</span>
                          {useDeepThinking && (
                            <span className="text-purple-400 text-xs bg-purple-900/20 px-2 py-0.5 rounded border border-purple-500/30">{t.thinkingMode}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <button 
                          onClick={handleReset}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700"
                        >
                          {t.newAnalysis}
                        </button>
                      </div>
                   </div>
                   <AnalysisDashboard result={analysisResult} language={language} />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Chat Widget Overlay - Always visible for logged in user */}
      <ChatWidget contextData={dataContent} language={language} modelName={modelName} onTokenUsage={updateSessionUsage} />
    </div>
  );
};

export default App;
