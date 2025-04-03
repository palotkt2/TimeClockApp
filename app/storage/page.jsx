'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../Layout';
import {
  FaTrash,
  FaSearch,
  FaDownload,
  FaCamera,
  FaExclamationTriangle,
} from 'react-icons/fa';

export default function StoragePage() {
  const [savedEntries, setSavedEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);

  // Load saved entries from localStorage on component mount
  useEffect(() => {
    const storedEntries = localStorage.getItem('barcodeEntries');
    if (storedEntries) {
      try {
        const parsedEntries = JSON.parse(storedEntries);

        // Handle both formats: object entries or plain strings
        const formattedEntries = parsedEntries.map((entry) => {
          if (typeof entry === 'string') {
            return { barcode: entry, timestamp: null, photo: null };
          }
          return entry;
        });

        setSavedEntries(formattedEntries);
        setFilteredEntries(formattedEntries);
      } catch (error) {
        console.error('Error parsing stored entries:', error);
        // Fallback to old storage format
        const oldStoredBarcodes = localStorage.getItem('scannedBarcodes');
        if (oldStoredBarcodes) {
          try {
            const parsedBarcodes = JSON.parse(oldStoredBarcodes);
            const simpleEntries = parsedBarcodes.map((code) => ({
              barcode: code,
              timestamp: null,
              photo: null,
            }));
            setSavedEntries(simpleEntries);
            setFilteredEntries(simpleEntries);
          } catch (e) {
            console.error('Error parsing backup format:', e);
          }
        }
      }
    }
  }, []);

  // Filter entries when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEntries(savedEntries);
    } else {
      const filtered = savedEntries.filter((entry) =>
        entry.barcode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEntries(filtered);
    }
  }, [searchTerm, savedEntries]);

  // Delete individual entry
  const deleteEntry = (index) => {
    const updatedEntries = [...savedEntries];
    updatedEntries.splice(index, 1);
    setSavedEntries(updatedEntries);

    // Update localStorage
    localStorage.setItem('barcodeEntries', JSON.stringify(updatedEntries));

    // Update legacy format
    const simpleBarcodes = updatedEntries.map((entry) => entry.barcode);
    localStorage.setItem('scannedBarcodes', JSON.stringify(simpleBarcodes));
  };

  // Clear all saved entries
  const clearAllEntries = () => {
    if (
      confirm('¿Estás seguro que deseas eliminar todos los códigos guardados?')
    ) {
      setSavedEntries([]);
      localStorage.removeItem('barcodeEntries');
      localStorage.removeItem('scannedBarcodes');
    }
  };

  // Export entries as CSV
  const exportCSV = () => {
    if (savedEntries.length === 0) return;

    // Create CSV header
    const csvRows = [];
    csvRows.push(['Código', 'Fecha y Hora'].join(','));

    // Add data rows
    savedEntries.forEach((entry) => {
      const formattedDate = entry.timestamp
        ? new Date(entry.timestamp).toLocaleString()
        : 'N/A';
      csvRows.push([entry.barcode, formattedDate].join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `barcodes-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format timestamp for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">
            Registros de Códigos Escaneados
          </h1>

          {/* Search and action buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar códigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                disabled={savedEntries.length === 0}
              >
                <FaDownload /> Exportar CSV
              </button>
              <button
                onClick={clearAllEntries}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
                disabled={savedEntries.length === 0}
              >
                <FaTrash /> Eliminar Todo
              </button>
            </div>
          </div>

          {/* Entries table with photos */}
          <div className="overflow-x-auto">
            {filteredEntries.length > 0 ? (
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-b px-4 py-2 text-left">#</th>
                    <th className="border-b px-4 py-2 text-left">Código</th>
                    <th className="border-b px-4 py-2 text-left">Fecha/Hora</th>
                    <th className="border-b px-4 py-2 text-center">Foto</th>
                    <th className="border-b px-4 py-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="border-b px-4 py-2 text-gray-600">
                        {index + 1}
                      </td>
                      <td className="border-b px-4 py-2 font-medium">
                        {entry.barcode}
                      </td>
                      <td className="border-b px-4 py-2 text-gray-600">
                        {formatDate(entry.timestamp)}
                      </td>
                      <td className="border-b px-4 py-2 text-center">
                        {entry.photo ? (
                          <div className="relative group">
                            <img
                              src={entry.photo}
                              alt={`Foto de ${entry.barcode}`}
                              className="h-12 w-12 object-cover cursor-pointer rounded"
                              onClick={() => window.open(entry.photo, '_blank')}
                            />
                            <div className="hidden group-hover:block absolute -bottom-24 left-1/2 transform -translate-x-1/2 z-10">
                              <img
                                src={entry.photo}
                                alt={`Vista previa de ${entry.barcode}`}
                                className="max-h-24 max-w-24 border-2 border-white shadow-lg rounded"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center text-amber-500">
                            <FaExclamationTriangle title="Sin foto" />
                          </div>
                        )}
                      </td>
                      <td className="border-b px-4 py-2 text-center">
                        <button
                          onClick={() => deleteEntry(index)}
                          className="bg-red-100 text-red-700 p-1.5 rounded hover:bg-red-200"
                          title="Eliminar registro"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                {savedEntries.length === 0
                  ? 'No hay registros guardados.'
                  : 'No se encontraron resultados para su búsqueda.'}
              </div>
            )}
          </div>

          <div className="mt-4 text-gray-500 text-sm">
            Total de registros: {savedEntries.length} | Mostrando:{' '}
            {filteredEntries.length}
          </div>
        </div>
      </div>
    </Layout>
  );
}
