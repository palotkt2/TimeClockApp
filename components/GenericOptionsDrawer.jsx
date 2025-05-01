import React, { useEffect } from 'react';

const GenericOptionsDrawer = ({ isOpen, onClose, title, children }) => {
  // Handle escape key to close drawer
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer container - position exactly like ImageOptionsDrawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        {/* Drawer panel */}
        <div className="w-screen max-w-md transform transition-transform duration-300 ease-in-out">
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
            {/* Header - exact same structure */}
            <div className="sticky top-0 bg-blue-600 text-white px-4 py-3 flex items-center justify-between z-10">
              <h3 className="text-lg font-medium">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-md p-1 hover:bg-blue-700 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content - maintain exact positioning */}
            <div className="relative flex-1 px-4 py-6">{children}</div>

            {/* Footer - maintain exact positioning */}
            <div className="sticky bottom-0 bg-gray-50 px-4 py-3 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericOptionsDrawer;
