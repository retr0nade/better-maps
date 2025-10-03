import React from 'react';

interface DownloadPageProps {
  darkMode?: boolean
}

const DownloadPage: React.FC<DownloadPageProps> = ({ darkMode = false }) => {
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Download BetterMaps</h1>
          <p className={`mt-4 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>Mobile apps are coming soon. For now, use the web app.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/planner"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-colors duration-200"
            >
              Open Web App
            </a>
            <a
              href="#"
              className={`w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold ring-1 transition-colors duration-200 ${
                darkMode
                  ? 'bg-gray-800 text-blue-200 ring-blue-900 hover:bg-gray-700 hover:ring-blue-800'
                  : 'bg-white text-blue-700 ring-blue-200 hover:bg-blue-50 hover:ring-blue-300'
              }`}
            >
              Notify Me
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DownloadPage;


