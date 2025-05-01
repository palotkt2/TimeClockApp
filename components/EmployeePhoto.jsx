import { useState } from 'react';
import { Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const EmployeePhoto = ({
  photoUrl,
  onPhotoChange,
  photoBorderStyle,
  setPhotoBorderStyle,
  photoBorderColor,
  setPhotoBorderColor,
  borderVisible,
  setBorderVisible,
  photoSize,
  setPhotoSize,
}) => {
  const defaultPhoto = 'https://randomuser.me/api/portraits/lego/1.jpg';
  const displayPhoto = photoUrl || defaultPhoto;
  const isUsingDefaultPhoto = !photoUrl;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && onPhotoChange) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  const SectionTitle = ({ title, helpText }) => (
    <div className="flex items-center mb-2">
      <p className="text-sm font-medium">{title}</p>
      {helpText && (
        <Tooltip title={helpText} arrow placement="top">
          <span className="ml-1 text-gray-400 cursor-help">
            <HelpOutlineIcon fontSize="small" />
          </span>
        </Tooltip>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm bg-white">
      <div className="w-full border-b pb-2 mb-4">
        <h3 className="text-lg font-medium text-center">Employee Photo</h3>
        <p className="text-xs text-center text-gray-500">
          Customize the photo appearance on your badge
        </p>
      </div>

      <div className="relative mb-4">
        <div
          className="p-2 bg-gray-50 border rounded-md"
          style={{
            boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <img
            src={displayPhoto}
            alt="Employee"
            className={`object-cover ${
              photoBorderStyle === 'rounded' ? 'rounded-full' : 'rounded-none'
            } ${borderVisible ? 'border-2' : 'border-0'}`}
            style={{
              width: photoSize,
              height: photoSize,
              ...(borderVisible ? { borderColor: photoBorderColor } : {}),
            }}
          />
          {isUsingDefaultPhoto && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
              <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                Default Photo
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full mb-5">
        <SectionTitle
          title="Photo Upload"
          helpText="Upload a photo of the employee for their ID badge"
        />

        <div className="flex flex-col gap-2 w-full">
          <label className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer text-center">
            <span className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Upload New Photo
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>

          {!isUsingDefaultPhoto && (
            <button
              onClick={() => onPhotoChange(null)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded transition flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Remove Photo
            </button>
          )}
        </div>
      </div>

      <div className="w-full rounded-lg bg-gray-50 p-3 border border-gray-200 mb-2">
        <SectionTitle
          title="Photo Shape"
          helpText="Choose how the photo will appear on the badge"
        />

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setPhotoBorderStyle('rounded')}
            className={`flex-1 py-3 rounded transition flex flex-col items-center ${
              photoBorderStyle === 'rounded'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-current opacity-20 mb-1"></div>
            <span className="text-xs">Rounded</span>
          </button>
          <button
            onClick={() => setPhotoBorderStyle('square')}
            className={`flex-1 py-3 rounded transition flex flex-col items-center ${
              photoBorderStyle === 'square'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="w-8 h-8 bg-current opacity-20 mb-1"></div>
            <span className="text-xs">Square</span>
          </button>
        </div>

        <SectionTitle title="Border" helpText="Add a border around the photo" />

        <div className="flex mb-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={borderVisible}
              onChange={() => setBorderVisible(!borderVisible)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            <span className="ms-3 text-sm font-medium text-gray-700">
              {borderVisible ? 'Border On' : 'Border Off'}
            </span>
          </label>
        </div>

        {borderVisible && (
          <div className="mb-4">
            <SectionTitle
              title="Border Color"
              helpText="Choose a color for the photo border"
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={photoBorderColor}
                onChange={(e) => setPhotoBorderColor(e.target.value)}
                className="h-8 w-9 rounded cursor-pointer"
                title="Color picker"
              />
              <div className="relative max-w-[110px]">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  #
                </span>
                <input
                  type="text"
                  value={photoBorderColor.replace('#', '').toUpperCase()}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Basic validation for hex color
                    if (/^[0-9A-Fa-f]{0,6}$/.test(value)) {
                      setPhotoBorderColor('#' + value);
                    }
                  }}
                  className="px-6 py-1 rounded border border-gray-300 w-full text-xs font-mono"
                  placeholder="RRGGBB"
                  maxLength="6"
                  aria-label="Hex color code"
                />
              </div>
              <div
                className="h-6 w-6 rounded border border-gray-300"
                style={{ backgroundColor: photoBorderColor }}
                title="Current color"
              ></div>
            </div>
          </div>
        )}

        <SectionTitle
          title={`Photo Size: ${photoSize}px`}
          helpText="Adjust how large the photo appears on the badge"
        />

        <div className="flex flex-col">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs text-gray-500">Small</span>
            <input
              type="range"
              min="50"
              max="200"
              value={photoSize}
              onChange={(e) => setPhotoSize(Number(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span className="text-xs text-gray-500">Large</span>
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <span>50px</span>
            <span>125px</span>
            <span>200px</span>
          </div>

          {/* Size presets */}
          <div className="mt-3">
            <div className="flex justify-between space-x-2">
              <button
                onClick={() => setPhotoSize(80)}
                className="flex-1 py-1.5 px-2 text-xs rounded bg-white border border-gray-300 hover:bg-gray-50 transition"
              >
                Small
              </button>
              <button
                onClick={() => setPhotoSize(125)}
                className="flex-1 py-1.5 px-2 text-xs rounded bg-white border border-gray-300 hover:bg-gray-50 transition"
              >
                Medium
              </button>
              <button
                onClick={() => setPhotoSize(180)}
                className="flex-1 py-1.5 px-2 text-xs rounded bg-white border border-gray-300 hover:bg-gray-50 transition"
              >
                Large
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePhoto;
