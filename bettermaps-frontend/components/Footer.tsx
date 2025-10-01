import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm">© 2025 BetterMaps</p>

          <div className="flex items-center gap-5">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M19.633 7.997c.013.176.013.353.013.53 0 5.4-4.11 11.627-11.627 11.627-2.312 0-4.46-.68-6.27-1.85.321.038.63.05.963.05a8.22 8.22 0 0 0 5.096-1.753 4.107 4.107 0 0 1-3.834-2.846c.252.037.504.062.77.062.37 0 .74-.05 1.086-.139a4.1 4.1 0 0 1-3.29-4.025v-.05c.546.304 1.175.492 1.844.517a4.093 4.093 0 0 1-1.83-3.415c0-.754.202-1.44.558-2.04a11.65 11.65 0 0 0 8.45 4.287 4.623 4.623 0 0 1-.102-.94 4.096 4.096 0 0 1 7.086-2.8 8.06 8.06 0 0 0 2.6-.99 4.11 4.11 0 0 1-1.8 2.26 8.19 8.19 0 0 0 2.363-.64 8.824 8.824 0 0 1-2.056 2.12Z"/>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M4.983 3.5C4.983 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.483 1.12 2.483 2.5ZM.5 8h4V24h-4V8Zm7.497 0h3.84v2.183h.054c.535-1.015 1.84-2.086 3.787-2.086C20.4 8.097 22 10.17 22 13.675V24h-4v-8.87c0-2.113-.754-3.555-2.64-3.555-1.44 0-2.297.974-2.673 1.913-.138.337-.173.807-.173 1.28V24h-4s.054-13.772 0-16Z"/>
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12a10 10 0 0 0 6.837 9.488c.5.087.683-.217.683-.486 0-.24-.01-1.039-.014-1.886-2.782.604-3.37-1.184-3.37-1.184-.455-1.156-1.11-1.464-1.11-1.464-.908-.62.07-.607.07-.607 1.004.07 1.532 1.032 1.532 1.032.893 1.53 2.343 1.088 2.914.833.092-.647.35-1.088.636-1.339-2.22-.252-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.683-.104-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.706.115 2.504.337 1.908-1.294 2.747-1.025 2.747-1.025.547 1.376.204 2.393.1 2.646.64.699 1.028 1.592 1.028 2.683 0 3.842-2.338 4.688-4.566 4.936.359.309.678.92.678 1.855 0 1.339-.012 2.419-.012 2.749 0 .271.18.577.688.478A10.001 10.001 0 0 0 22 12c0-5.523-4.477-10-10-10Z" clipRule="evenodd"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


