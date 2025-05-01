'use client';
import { useEffect } from 'react';

const Drawer = ({ isOpen, onClose, title, children, position = 'right' }) => {
  // Add event listener for ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    // Stop scrolling on body when drawer is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal/Lightbox panel */}
      <div className="relative w-full max-w-lg mx-4 animate-modal-appear">
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="text-white rounded-full hover:bg-white hover:bg-opacity-20 p-1 focus:outline-none transition-colors"
              >
                <span className="sr-only">Close panel</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium text-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
