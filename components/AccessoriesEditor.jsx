import React, { useState, useEffect } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

const AccessoriesEditor = ({
  accessories,
  selectedAccessories,
  toggleAccessory,
  pricingData: propsPricingData, // Original pricing data prop (keep for backward compatibility)
  accessoryQuantities = {},
  updateAccessoryQuantity = () => {},
  isEditMode = false,
  updateAccessoryText = () => {},
}) => {
  // Local state to manage quantities
  const [quantities, setQuantities] = useState({});
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  // New state for pricing data
  const [pricingData, setPricingData] = useState(propsPricingData || {});
  const [isPricesLoading, setIsPricesLoading] = useState(true);

  // Fetch pricing data from JSON file
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch('/data/pricing.json');
        if (!response.ok) {
          throw new Error('Failed to fetch pricing data');
        }
        const data = await response.json();

        // Format pricing data to be compatible with existing format
        const formattedPricing = {
          accessories: {},
        };

        // Map each accessory to its price
        accessories.forEach((accessory) => {
          // Use priceKey if available, otherwise use ID
          const priceKey = accessory.priceKey || accessory.id;
          formattedPricing.accessories[accessory.id] = data[priceKey] || 0;
        });

        setPricingData(formattedPricing);
        setIsPricesLoading(false);
      } catch (error) {
        console.error('Error loading pricing data:', error);
        // Fallback to props pricing data if fetch fails
        setPricingData(propsPricingData || {});
        setIsPricesLoading(false);
      }
    };

    fetchPricing();
  }, [accessories, propsPricingData]);

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
    console.log(`Changing quantity for ${accId} to ${newQuantity}`);
    const updatedQuantity = Math.max(1, newQuantity);
    console.log(`Updated quantity calculated: ${updatedQuantity}`);

    // Actualizar el estado local
    setQuantities((prevQuantities) => {
      const newQuantities = {
        ...prevQuantities,
        [accId]: updatedQuantity,
      };
      return newQuantities;
    });

    // Propagar el cambio al componente padre
    updateAccessoryQuantity(accId, updatedQuantity);
  };

  // Increment quantity - FIXED FUNCTION
  const incrementQuantity = (accId) => {
    console.log(`Incrementing quantity for ${accId}`);
    const currentQuantity = quantities[accId] || 1;
    console.log(`Current quantity before increment: ${currentQuantity}`);
    handleQuantityChange(accId, currentQuantity + 1);
  };

  // Decrement quantity - FIXED FUNCTION
  const decrementQuantity = (accId) => {
    console.log(`Decrementing quantity for ${accId}`);
    const currentQuantity = quantities[accId] || 1;
    console.log(`Current quantity before decrement: ${currentQuantity}`);
    handleQuantityChange(accId, Math.max(1, currentQuantity - 1));
  };

  // Nueva función para manejar la selección del accesorio
  const handleAccessorySelect = (accessoryId) => {
    // Si ya estaba seleccionado, solo actualizamos la cantidad
    if (selectedAccessories.includes(accessoryId)) {
      const acc = accessories.find((a) => a.id === accessoryId);
      setSelectedAccessory(acc);
      setTempQuantity(quantities[accessoryId] || 1);
      setIsModalOpen(true);
    } else {
      // Si es nuevo, primero lo agregamos y luego abrimos el modal
      toggleAccessory(accessoryId);
      const acc = accessories.find((a) => a.id === accessoryId);
      setSelectedAccessory(acc);
      setTempQuantity(1);
      setIsModalOpen(true);
    }
  };

  // Función para confirmar la cantidad en el modal
  const confirmQuantity = () => {
    if (selectedAccessory) {
      handleQuantityChange(selectedAccessory.id, tempQuantity);
    }
    setIsModalOpen(false);
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
                  } ${
                    isEditMode
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'cursor-pointer hover:shadow-md'
                  }`}
                  onClick={() => !isEditMode && handleAccessorySelect(item.id)}
                >
                  <div className="flex md:flex-col lg:flex-row items-center p-3">
                    <div className="w-20 h-20 md:w-full md:h-36 lg:w-24 lg:h-24 overflow-hidden bg-white rounded-md flex items-center justify-center border">
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
                      {isEditMode ? (
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <EditIcon className="h-4 w-4 text-yellow-600 mr-2" />
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                e.stopPropagation(); // Prevenir que el click se propague
                                updateAccessoryText(
                                  item.id,
                                  'name',
                                  e.target.value
                                );
                              }}
                              className="w-full px-2 py-1 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                          </div>
                          <div className="flex items-start">
                            <EditIcon className="h-4 w-4 text-yellow-600 mr-2 mt-1" />
                            <textarea
                              value={item.description}
                              onChange={(e) => {
                                e.stopPropagation(); // Prevenir que el click se propague
                                updateAccessoryText(
                                  item.id,
                                  'description',
                                  e.target.value
                                );
                              }}
                              rows="2"
                              className="w-full px-2 py-1 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.description}
                          </p>
                        </>
                      )}

                      <div className="mt-2 flex justify-between items-center">
                        {isPricesLoading ? (
                          <span className="inline-block bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded">
                            <CircularProgress size={14} color="inherit" />
                          </span>
                        ) : (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {pricingData?.accessories[item.id]
                              ? `$${pricingData.accessories[item.id].toFixed(
                                  2
                                )}`
                              : 'Included'}
                          </span>
                        )}

                        <div
                          className="flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            id={`accessory-${item.id}`}
                            checked={selectedAccessories.includes(item.id)}
                            onChange={() => handleAccessorySelect(item.id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`accessory-${item.id}`}
                            className="ml-2 text-sm font-medium text-gray-700"
                          >
                            Select
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
      </div>

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
                        console.log(
                          'Botón de decremento en lista seleccionados'
                        );
                        const currentQuantity = quantities[accId] || 1;
                        console.log(
                          `Cantidad actual en lista: ${currentQuantity}`
                        );
                        if (currentQuantity <= 1) {
                          toggleAccessory(accId);
                        } else {
                          decrementQuantity(accId);
                        }
                      }}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:outline-none transition-colors duration-150"
                      aria-label="Decrease quantity"
                    >
                      <RemoveIcon className="h-4 w-4" fontSize="small" />
                    </button>

                    <input
                      type="number"
                      min="1"
                      value={quantities[accId] || 1}
                      onChange={(e) => {
                        const value = e.target.value;
                        const newQuantity = parseInt(value, 10);
                        if (!isNaN(newQuantity) && newQuantity >= 1) {
                          handleQuantityChange(accId, newQuantity);
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (
                          value === '' ||
                          isNaN(parseInt(value, 10)) ||
                          parseInt(value, 10) < 1
                        ) {
                          handleQuantityChange(accId, 1);
                        }
                      }}
                      className="px-2 py-1 text-sm font-medium w-12 text-center bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      aria-label="Quantity"
                    />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log(
                          'Botón de incremento en lista seleccionados'
                        );
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

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="accessory-quantity-dialog"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="accessory-quantity-dialog" className="bg-blue-50">
          <div className="flex items-center">
            <CheckIcon className="h-5 w-5 mr-2 text-blue-600" />
            <span>Select Quantity</span>
          </div>
        </DialogTitle>
        <DialogContent className="mt-4">
          {selectedAccessory && (
            <div className="py-2">
              <div className="flex items-center mb-4">
                {selectedAccessory.image && (
                  <img
                    src={selectedAccessory.image}
                    alt={selectedAccessory.name}
                    className="w-16 h-16 object-contain mr-3 border rounded"
                  />
                )}
                <div>
                  <h3 className="font-medium text-lg">
                    {selectedAccessory.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedAccessory.description}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  How many do you need?
                </p>
                <div className="flex items-center max-w-xs">
                  <button
                    onClick={() =>
                      setTempQuantity(Math.max(1, tempQuantity - 1))
                    }
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-l-md border border-blue-200"
                  >
                    <RemoveIcon fontSize="small" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={tempQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val > 0) {
                        setTempQuantity(val);
                      }
                    }}
                    className="px-4 py-2 w-20 text-center border-t border-b border-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setTempQuantity(tempQuantity + 1)}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-r-md border border-blue-200"
                  >
                    <AddIcon fontSize="small" />
                  </button>
                </div>
              </div>

              <div className="text-right font-medium text-blue-700">
                {isPricesLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  pricingData?.accessories[selectedAccessory.id] && (
                    <>
                      Price: $
                      {(
                        pricingData.accessories[selectedAccessory.id] *
                        tempQuantity
                      ).toFixed(2)}
                    </>
                  )
                )}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions className="bg-gray-50 p-4">
          <Button
            onClick={() => {
              if (
                selectedAccessory &&
                selectedAccessories.includes(selectedAccessory.id)
              ) {
                toggleAccessory(selectedAccessory.id);
              }
              setIsModalOpen(false);
            }}
            color="error"
            variant="outlined"
            size="small"
          >
            Remove
          </Button>
          <Button
            onClick={() => setIsModalOpen(false)}
            color="primary"
            size="small"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmQuantity}
            color="primary"
            variant="contained"
            size="small"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AccessoriesEditor;
