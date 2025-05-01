import React from 'react';

const CardInformationSection = ({
  viewingSide,
  name,
  title,
  company,
  idNumber,
  backText,
  showBackside,
  openDrawer,
}) => {
  return (
    <div>
      <div className="text-gray-900 not-first:border-l-4 border-blue-500 pl-3 mb-4">
        <h2 className="text-xl font-bold">
          {viewingSide === 'front' ? 'CARD OPTIONS' : 'BACKSIDE OPTIONS'}
        </h2>
        <p className="text-sm text-gray-600">
          {viewingSide === 'front'
            ? 'Configure the basic settings for your badge.'
            : 'Configure the back of your badge.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Card options button */}
        <button
          onClick={() =>
            openDrawer(
              'card',
              viewingSide === 'front'
                ? 'EDIT CARD INFORMATION'
                : 'EDIT BACKSIDE INFORMATION'
            )
          }
          className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800">
            Card Information
          </h3>
          <p className="text-sm text-gray-500 text-center mt-1">
            Edit name, title, company and ID details
          </p>
        </button>
      </div>

      <div className="mt-4 bg-gray-50 rounded-md p-3">
        <h3 className="font-medium mb-1">
          {viewingSide === 'front' ? 'Current Information' : 'Backside Status'}
        </h3>
        {viewingSide === 'front' ? (
          <div className="text-sm space-y-1 text-gray-600">
            <p>
              <span className="font-medium">Name:</span> {name}
            </p>
            <p>
              <span className="font-medium">Title:</span> {title}
            </p>
            <p>
              <span className="font-medium">Company:</span> {company}
            </p>
            <p>
              <span className="font-medium">ID Number:</span> {idNumber}
            </p>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            <p>
              {showBackside ? 'Backside is enabled' : 'Backside is disabled'}
            </p>
            {showBackside && backText && (
              <p className="mt-1">
                <span className="font-medium">Back text:</span>{' '}
                {backText.length > 50
                  ? `${backText.substring(0, 50)}...`
                  : backText}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardInformationSection;
