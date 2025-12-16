
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Files, Database, Server, ArrowRight, Check, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (content: string, name: string) => void;
  isAnalyzing: boolean;
  language: string;
}

const translations: Record<string, any> = {
  'Simplified Chinese': {
    fileUpload: '文件上传',
    database: '数据库',
    clickToUpload: '点击上传',
    dragDrop: '或拖拽文件到此处',
    supports: '支持 CSV, JSON, TXT, 代码文件',
    host: '主机地址',
    port: '端口',
    dbName: '数据库名',
    user: '用户名',
    password: '密码',
    connect: '连接数据库',
    connecting: '连接中...',
    connected: '已连接至',
    availableTables: '可用数据表',
    import: '导入',
    structuredData: '结构化数据',
    multiFile: '多文件支持',
    sqlConnector: 'SQL 连接器'
  },
  'English': {
    fileUpload: 'File Upload',
    database: 'Database',
    clickToUpload: 'Click to upload',
    dragDrop: 'or drag and drop',
    supports: 'Supports CSV, JSON, TXT, Code files',
    host: 'Host',
    port: 'Port',
    dbName: 'Database Name',
    user: 'User',
    password: 'Password',
    connect: 'Connect to Database',
    connecting: 'Connecting...',
    connected: 'Connected to',
    availableTables: 'Available Tables',
    import: 'Import',
    structuredData: 'Structured Data',
    multiFile: 'Multi-file Support',
    sqlConnector: 'SQL Connector'
  },
  'Japanese': {
    fileUpload: 'ファイルアップロード',
    database: 'データベース',
    clickToUpload: 'クリックしてアップロード',
    dragDrop: 'またはドラッグ＆ドロップ',
    supports: 'CSV, JSON, TXT, コードファイル対応',
    host: 'ホスト',
    port: 'ポート',
    dbName: 'データベース名',
    user: 'ユーザー',
    password: 'パスワード',
    connect: 'データベースに接続',
    connecting: '接続中...',
    connected: '接続済み: ',
    availableTables: '利用可能なテーブル',
    import: 'インポート',
    structuredData: '構造化データ',
    multiFile: '複数ファイル対応',
    sqlConnector: 'SQLコネクタ'
  },
  'Korean': {
    fileUpload: '파일 업로드',
    database: '데이터베이스',
    clickToUpload: '클릭하여 업로드',
    dragDrop: '또는 드래그 앤 드롭',
    supports: 'CSV, JSON, TXT, 코드 파일 지원',
    host: '호스트',
    port: '포트',
    dbName: '데이터베이스 이름',
    user: '사용자',
    password: '비밀번호',
    connect: '데이터베이스 연결',
    connecting: '연결 중...',
    connected: '연결됨: ',
    availableTables: '사용 가능한 테이블',
    import: '가져오기',
    structuredData: '구조화된 데이터',
    multiFile: '다중 파일 지원',
    sqlConnector: 'SQL 커넥터'
  },
   'Spanish': {
    fileUpload: 'Subir Archivo',
    database: 'Base de Datos',
    clickToUpload: 'Clic para subir',
    dragDrop: 'o arrastrar y soltar',
    supports: 'Soporta CSV, JSON, TXT, Código',
    host: 'Host',
    port: 'Puerto',
    dbName: 'Nombre de BD',
    user: 'Usuario',
    password: 'Contraseña',
    connect: 'Conectar a BD',
    connecting: 'Conectando...',
    connected: 'Conectado a',
    availableTables: 'Tablas Disponibles',
    import: 'Importar',
    structuredData: 'Datos Estructurados',
    multiFile: 'Soporte Multi-archivo',
    sqlConnector: 'Conector SQL'
  },
  'French': {
    fileUpload: 'Télécharger',
    database: 'Base de Données',
    clickToUpload: 'Cliquer pour télécharger',
    dragDrop: 'ou glisser-déposer',
    supports: 'Supporte CSV, JSON, TXT, Code',
    host: 'Hôte',
    port: 'Port',
    dbName: 'Nom de la BDD',
    user: 'Utilisateur',
    password: 'Mot de passe',
    connect: 'Se connecter à la BDD',
    connecting: 'Connexion...',
    connected: 'Connecté à',
    availableTables: 'Tables Disponibles',
    import: 'Importer',
    structuredData: 'Données Structurées',
    multiFile: 'Support Multi-fichiers',
    sqlConnector: 'Connecteur SQL'
  },
  'German': {
    fileUpload: 'Datei-Upload',
    database: 'Datenbank',
    clickToUpload: 'Klicken zum Hochladen',
    dragDrop: 'oder per Drag & Drop',
    supports: 'Unterstützt CSV, JSON, TXT, Code',
    host: 'Host',
    port: 'Port',
    dbName: 'Datenbankname',
    user: 'Benutzer',
    password: 'Passwort',
    connect: 'Verbinden',
    connecting: 'Verbinde...',
    connected: 'Verbunden mit',
    availableTables: 'Verfügbare Tabellen',
    import: 'Importieren',
    structuredData: 'Strukturierte Daten',
    multiFile: 'Multi-Datei-Support',
    sqlConnector: 'SQL Connector'
  }
};

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isAnalyzing, language }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'database'>('upload');
  
  // Database Simulation State
  const [dbStep, setDbStep] = useState<'connect' | 'select'>('connect');
  const [isConnecting, setIsConnecting] = useState(false);
  const [dbConfig, setDbConfig] = useState({ host: 'localhost', port: '5432', user: 'admin', db: 'analytics_db' });

  const t = translations[language] || translations['English'];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];

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

  const handleDbConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConnecting(false);
    setDbStep('select');
  };

  const handleTableImport = (tableName: string) => {
    // Simulate fetching table data
    const mockData = `
ID,Date,Region,Product,Sales,Units,Customer_Rating
101,2023-01-15,North,Widget A,1500.00,50,4.5
102,2023-01-16,South,Widget B,2300.50,45,4.2
103,2023-01-17,East,Widget A,1200.00,40,4.8
104,2023-01-18,West,Widget C,850.00,20,3.9
105,2023-01-19,North,Widget B,1800.00,35,4.6
106,2023-01-20,South,Widget A,2100.00,70,4.1
107,2023-01-21,East,Widget C,900.00,25,4.0
108,2023-01-22,West,Widget B,1600.00,30,4.3
109,2023-01-23,North,Widget C,950.00,22,3.8
110,2023-01-24,South,Widget A,2400.00,80,4.7
    `;
    onFileSelect(mockData, `DB: ${dbConfig.db} / ${tableName}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'upload' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            {t.fileUpload}
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'database' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            {t.database}
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 transition-all duration-300 min-h-[300px] flex flex-col justify-center">
        
        {activeTab === 'upload' && (
          <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500 transition-all duration-300 group relative overflow-hidden">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-full pt-5 pb-6 cursor-pointer z-10">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="p-4 rounded-full bg-slate-700 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors duration-300 mb-4">
                    {isAnalyzing ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    ) : (
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-400" />
                    )}
                </div>
                <p className="mb-2 text-sm text-slate-300">
                  <span className="font-semibold">{t.clickToUpload}</span> {t.dragDrop}
                </p>
                <p className="text-xs text-slate-500">{t.supports}</p>
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                className="hidden" 
                onChange={handleFileChange} 
                accept=".csv,.json,.txt,.md,.js,.py,.ts,.tsx"
                disabled={isAnalyzing}
                multiple
              />
            </label>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="w-full h-full">
            {dbStep === 'connect' ? (
              <form onSubmit={handleDbConnect} className="space-y-4 max-w-md mx-auto animate-in fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">{t.host}</label>
                    <input 
                      type="text" 
                      value={dbConfig.host}
                      onChange={e => setDbConfig({...dbConfig, host: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">{t.port}</label>
                    <input 
                      type="text" 
                      value={dbConfig.port}
                      onChange={e => setDbConfig({...dbConfig, port: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">{t.dbName}</label>
                  <input 
                    type="text" 
                    value={dbConfig.db}
                    onChange={e => setDbConfig({...dbConfig, db: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">{t.user}</label>
                    <input 
                      type="text" 
                      value={dbConfig.user}
                      onChange={e => setDbConfig({...dbConfig, user: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-medium text-slate-400">{t.password}</label>
                    <input type="password" value="********" readOnly className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-500 focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isConnecting}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t.connecting}
                    </>
                  ) : (
                    <>
                      <Server className="w-4 h-4" />
                      {t.connect}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="animate-in fade-in space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                       <h3 className="text-sm font-medium text-white">{t.connected} {dbConfig.db}</h3>
                       <p className="text-xs text-slate-400">{dbConfig.host}:{dbConfig.port}</p>
                    </div>
                  </div>
                  <button onClick={() => setDbStep('connect')} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">{t.availableTables}</p>
                  <div className="space-y-2">
                    {['transactions_2024', 'user_demographics', 'product_inventory', 'web_logs_q1'].map(table => (
                      <div key={table} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800 hover:border-blue-500/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <Database className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                          <span className="text-sm text-slate-300 font-mono">{table}</span>
                        </div>
                        <button 
                          onClick={() => handleTableImport(table)}
                          className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded text-xs font-medium transition-all flex items-center gap-1"
                        >
                          {t.import} <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-400 text-sm max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 p-3 rounded bg-slate-800/50 border border-slate-700">
          <FileSpreadsheet className="w-4 h-4 text-green-400" />
          <span>{t.structuredData}</span>
        </div>
        <div className="flex items-center justify-center gap-2 p-3 rounded bg-slate-800/50 border border-slate-700">
          <Files className="w-4 h-4 text-blue-400" />
          <span>{t.multiFile}</span>
        </div>
        <div className="flex items-center justify-center gap-2 p-3 rounded bg-slate-800/50 border border-slate-700">
          <Server className="w-4 h-4 text-purple-400" />
          <span>{t.sqlConnector}</span>
        </div>
      </div>
    </div>
  );
};
