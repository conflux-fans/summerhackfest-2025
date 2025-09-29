import { Heart, Github, FileCode, Zap } from 'lucide-react';

function Footer() {
  return (
    <footer className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xlmt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Tech Stack & Social Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-300">
            <span className="flex items-center space-x-1 bg-white/10 px-3 py-1.5 rounded-full shadow-sm">
              <Zap className="w-3.5 h-3.5 text-yellow-500" />
              <span>Vite</span>
            </span>
            <span className="flex items-center space-x-1 bg-white/10 px-3 py-1.5 rounded-full shadow-sm">
              <FileCode className="w-3.5 h-3.5 text-blue-500" />
              <span>React + TS</span>
            </span>
            <span className="flex items-center space-x-1 bg-white/10 px-3 py-1.5 rounded-full shadow-sm">
              <svg className="w-3.5 h-3.5 text-cyan-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/>
              </svg>
              <span>Reown</span>
            </span>
            <span className="flex items-center space-x-1 bg-white/10 px-3 py-1.5 rounded-full shadow-sm">
              <svg className="w-3.5 h-3.5 text-teal-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm0 2.163l8.892 5.137v10.3L12 22.837 3.108 17.6V7.3L12 2.163z"/>
              </svg>
              <span>Tailwind</span>
            </span>
            <span className="flex items-center space-x-1 bg-white/10 px-3 py-1.5 rounded-full shadow-sm">
              <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18z"/>
              </svg>
              <span>Meson API</span>
            </span>
            
            
            {/* Social Links */}
            <a 
              href="https://github.com/0xfdbu/meson-integration" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1 bg-white/10 px-3 py-1.5 rounded-full shadow-sm text-gray-300 transition-all duration-200 hover:shadow-md"
              aria-label="GitHub"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="flex items-center space-x-1 text-sm text-gray-300">
            <span>© 2025 QuickBridge</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span>Built with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;