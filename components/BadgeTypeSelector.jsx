import React from 'react';

const BadgeTypeSelector = ({ selectedBadgeType, setSelectedBadgeType }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Choose Your Badge Type</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`p-4 border rounded-lg cursor-pointer ${
            selectedBadgeType === 'circular'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300'
          }`}
          onClick={() => setSelectedBadgeType('circular')}
        >
          <h3 className="font-medium">Circular Badge</h3>
          <p className="text-sm text-gray-600">
            Round badges ideal for profile pictures
          </p>
        </div>
        <div
          className={`p-4 border rounded-lg cursor-pointer ${
            selectedBadgeType === 'rectangular'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300'
          }`}
          onClick={() => setSelectedBadgeType('rectangular')}
        >
          <h3 className="font-medium">Rectangular Badge</h3>
          <p className="text-sm text-gray-600">
            Standard name badges for events
          </p>
        </div>
        <div
          className={`p-4 border rounded-lg cursor-pointer ${
            selectedBadgeType === 'custom'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300'
          }`}
          onClick={() => setSelectedBadgeType('custom')}
        >
          <h3 className="font-medium">Custom Shape</h3>
          <p className="text-sm text-gray-600">Design your own badge shape</p>
        </div>
      </div>
    </div>
  );
};

export default BadgeTypeSelector;
