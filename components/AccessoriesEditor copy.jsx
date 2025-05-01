import React, { useState, useEffect } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const AccessoriesEditor = ({
  accessories,
  selectedAccessories,
  toggleAccessory,
  pricingData,
  accessoryQuantities = {}, // Add this prop to receive quantities
  updateAccessoryQuantity = () => {}, // Add this prop for updating quantities
}) => {
  // Local state to manage quantities
  const [quantities, setQuantities] = useState({});

  // Initialize quantities from props or default to 1
  useEffect(() => {
    const initialQuantities = {};
    selectedAccessories.forEach((accId) => {
      initialQuantities[accId] = accessoryQuantities[accId] || 1;
    });

    // Compare with current state to avoid unnecessary updates
    const needsUpdate =
      !Object.keys(quantities).every(
        (id) => quantities[id] === (initialQuantities[id] || 1)
      ) ||
      !Object.keys(initialQuantities).every(
        (id) => (quantities[id] || 1) === initialQuantities[id]
      );

    if (needsUpdate) {
      setQuantities(initialQuantities);
    }
  }, [selectedAccessories, accessoryQuantities]);

  // Handle quantity change
  const handleQuantityChange = (accId, newQuantity) => {
    console.log(`Changing quantity for ${accId} to ${newQuantity}`); // Add logging
    const updatedQuantity = Math.max(1, newQuantity); // Ensure minimum quantity is 1
    setQuantities({
      ...quantities,
      [accId]: updatedQuantity,
    });
    updateAccessoryQuantity(accId, updatedQuantity);
  };

  // Increment quantity
  const incrementQuantity = (accId) => {
    console.log(`Incrementing quantity for ${accId}`); // Add logging
    const currentQuantity = quantities[accId] || 1;
    handleQuantityChange(accId, currentQuantity + 1);
  };

  // Decrement quantity
  const decrementQuantity = (accId) => {
    console.log(`Decrementing quantity for ${accId}`); // Add logging
    const currentQuantity = quantities[accId] || 1;
    handleQuantityChange(accId, Math.max(1, currentQuantity - 1));
  };

  return (
    <div className="space-y-5 relative z-10">
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-4">
          Choose how you want to wear or display your badges. You can select
          multiple accessories.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accessories.map(
            (item) =>
              item.id !== 'none' && (
                <div
                  key={item.id}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    selectedAccessories.includes(item.id)
                      ? 'border-blue-500 ring-2 ring-blue-300'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex md:flex-col lg:flex-row items-center p-3">
                    <div
                      className="w-20 h-20 md:w-full md:h-36 lg:w-24 lg:h-24 overflow-hidden bg-white rounded-md flex items-center justify-center border cursor-pointer"
                      onClick={() => toggleAccessory(item.id)}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-contain w-full h-full"
                        />
                      ) : item.icon ? (
                        <div className="w-full h-full p-2">{item.icon}</div>
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="ml-4 md:ml-0 md:mt-3 lg:mt-0 lg:ml-4 flex-1">
                      <h4
                        className="font-medium text-gray-900 cursor-pointer"
                        onClick={() => toggleAccessory(item.id)}
                      >
                        {item.name}
                      </h4>
                      <p
                        className="text-sm text-gray-500 mt-1 cursor-pointer"
                        onClick={() => toggleAccessory(item.id)}
                      >
                        {item.description}
                      </p>

                      <div className="mt-2 flex justify-between items-center">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {pricingData?.accessories[item.id]
                            ? `$${pricingData.accessories[item.id].toFixed(2)}`
                            : 'Included'}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Quantity control - improved UI with better visibility */}
                          <div
                            className={`flex items-center border ${
                              selectedAccessories.includes(item.id)
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-gray-200'
                            } rounded-md shadow-sm transition-all duration-200`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                if (selectedAccessories.includes(item.id)) {
                                  decrementQuantity(item.id);
                                } else {
                                  toggleAccessory(item.id);
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-l-md ${
                                selectedAccessories.includes(item.id)
                                  ? 'text-blue-600 hover:bg-blue-100 active:bg-blue-200'
                                  : 'text-gray-400'
                              } focus:outline-none transition-colors duration-150`}
                              disabled={!selectedAccessories.includes(item.id)}
                              aria-label="Decrease quantity"
                            >
                              <RemoveIcon
                                className="h-4 w-4"
                                fontSize="small"
                              />
                            </button>
                            <span className="px-3 py-0.5 text-sm font-medium min-w-[28px] text-center">
                              {selectedAccessories.includes(item.id)
                                ? quantities[item.id] || 1
                                : 0}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                if (selectedAccessories.includes(item.id)) {
                                  incrementQuantity(item.id);
                                } else {
                                  toggleAccessory(item.id);
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-r-md ${
                                selectedAccessories.includes(item.id)
                                  ? 'text-blue-600 hover:bg-blue-100 active:bg-blue-200'
                                  : 'text-gray-400'
                              } focus:outline-none transition-colors duration-150`}
                              disabled={!selectedAccessories.includes(item.id)}
                              aria-label="Increase quantity"
                            >
                              <AddIcon className="h-4 w-4" fontSize="small" />
                            </button>
                          </div>

                          {/* Checkbox - improved with better highlight and transition */}
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedAccessories.includes(item.id)}
                              onChange={() => toggleAccessory(item.id)}
                              className="sr-only"
                              id={`acc-${item.id}`}
                              aria-label={`Select ${item.name}`}
                            />
                            <label
                              htmlFor={`acc-${item.id}`}
                              className={`w-6 h-6 rounded border flex items-center justify-center cursor-pointer transition-all duration-200 ${
                                selectedAccessories.includes(item.id)
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-md hover:bg-blue-700'
                                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                              }`}
                            >
                              {selectedAccessories.includes(item.id) && (
                                <CheckIcon
                                  className="h-4 w-4"
                                  fontSize="small"
                                />
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      {/* Selected accessories list with improved UI */}
      {selectedAccessories.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm mt-6 transition-all duration-300">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
            <CheckIcon className="h-5 w-5 mr-2" />
            Selected Accessories:
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedAccessories.map((accId) => {
              const acc = accessories.find((a) => a.id === accId);
              return (
                <div
                  key={accId}
                  className="flex items-center bg-white pl-3 pr-2 py-2 rounded-lg border border-blue-200 shadow-sm hover:shadow transition-all duration-200"
                >
                  <span className="font-medium text-gray-700">{acc?.name}</span>
                  <div className="mx-2 flex items-center border border-gray-200 rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        decrementQuantity(accId);
                      }}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:outline-none transition-colors duration-150"
                      aria-label="Decrease quantity"
                    >
                      <RemoveIcon className="h-4 w-4" fontSize="small" />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium bg-gray-50 min-w-[28px] text-center">
                      {quantities[accId] || 1}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        incrementQuantity(accId);
                      }}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:outline-none transition-colors duration-150"
                      aria-label="Increase quantity"
                    >
                      <AddIcon className="h-4 w-4" fontSize="small" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleAccessory(accId);
                    }}
                    className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none p-1 rounded-full hover:bg-red-50 transition-colors duration-150"
                    aria-label={`Remove ${acc?.name}`}
                  >
                    <CloseIcon className="h-4 w-4" fontSize="small" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Total count with improved visual */}
          <div className="mt-4 text-right">
            <span className="inline-block bg-blue-200 text-blue-800 px-4 py-2 rounded-lg font-medium text-sm">
              Total accessories:{' '}
              <span className="font-bold">
                {selectedAccessories.reduce(
                  (sum, accId) => sum + (quantities[accId] || 1),
                  0
                )}
              </span>
            </span>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => toggleAccessory('none')}
          className="px-5 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-label="Clear all selections"
        >
          Clear All Selections
        </button>
      </div>
    </div>
  );
};

export default AccessoriesEditor;
