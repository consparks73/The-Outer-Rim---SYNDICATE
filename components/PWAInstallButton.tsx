import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Info } from 'lucide-react';

interface Props {
  className?: string;
}

export const PWAInstallButton: React.FC<Props> = ({ className = "" }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center justify-center gap-2 text-xs font-mono text-cyan-500/60 hover:text-cyan-400 transition-colors uppercase tracking-widest ${className}`}
      >
        <Download className="w-4 h-4" />
        Install App
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-gray-900 border border-cyan-800/50 p-6 shadow-[0_0_30px_rgba(8,145,178,0.2)]">
            <h3 className="text-lg font-semibold text-cyan-400 font-sans tracking-widest uppercase mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              App Installation Guide
            </h3>
            
            <div className="space-y-4 text-sm text-gray-300 font-sans">
              {isIOS ? (
                <>
                  <p>To install this app on your iPhone or iPad:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Tap the <strong>Share</strong> button at the bottom of Safari.</li>
                    <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                  </ol>
                </>
              ) : (
                <>
                  <p>The automatic installation prompt isn't available right now. This usually happens if:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>You are viewing this inside a preview window or iframe (open the app directly in a new tab).</li>
                    <li>Your browser doesn't support automatic installation.</li>
                    <li>The app is already installed.</li>
                  </ul>
                  <p className="mt-4">
                    <strong>Manual Install (Chrome/Edge):</strong><br/>
                    Look for an install icon (a screen with a down arrow) on the right side of your browser's address bar, or open the browser menu and select "Install app".
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-8 w-full rounded bg-cyan-900/30 py-3 text-sm font-medium text-cyan-400 hover:bg-cyan-900/50 hover:text-cyan-300 uppercase tracking-widest border border-cyan-800/50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
