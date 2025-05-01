import React, { useState } from 'react';

const BackgroundAdjuster = ({
  isOpen,
  onClose,
  currentPosition = 'center',
  currentScale = 'cover',
  currentBlur = 0,
  currentBrightness = 100,
  onAdjustBackground,
}) => {
  const [position, setPosition] = useState(currentPosition);
  const [scale, setScale] = useState(currentScale);
  const [blur, setBlur] = useState(currentBlur);
  const [brightness, setBrightness] = useState(currentBrightness);

  const handleApply = () => {
    if (onAdjustBackground) {
      onAdjustBackground({
        position,
        scale,
        blur,
        brightness,
      });
    }
    onClose();
  };

  const handleReset = () => {
    setPosition(currentPosition);
    setScale(currentScale);
    setBlur(currentBlur);
    setBrightness(currentBrightness);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Adjust Background Image</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Position
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                'top left',
                'top center',
                'top right',
                'center left',
                'center',
                'center right',
                'bottom left',
                'bottom center',
                'bottom right',
              ].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  className={`p-2 border rounded flex items-center justify-center ${
                    position === pos
                      ? 'bg-blue-100 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-5 h-5 bg-gray-200 relative">
                    <div
                      className="absolute w-2 h-2 bg-blue-600 rounded-full"
                      style={{
                        top: pos.includes('top')
                          ? '0'
                          : pos.includes('bottom')
                          ? 'calc(100% - 8px)'
                          : 'calc(50% - 4px)',
                        left: pos.includes('left')
                          ? '0'
                          : pos.includes('right')
                          ? 'calc(100% - 8px)'
                          : 'calc(50% - 4px)',
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size and Fit
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { value: 'cover', label: 'Cover Entirely' },
                { value: 'contain', label: 'Contain' },
                { value: '100% auto', label: 'Fit Width' },
                { value: 'auto 100%', label: 'Fit Height' },
                { value: '100% 100%', label: 'Stretch' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScale(value)}
                  className={`py-1 px-3 border rounded ${
                    scale === value
                      ? 'bg-blue-100 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blur: {blur}px
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brightness: {brightness}%
            </label>
            <input
              type="range"
              min="50"
              max="150"
              step="1"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundAdjuster;
