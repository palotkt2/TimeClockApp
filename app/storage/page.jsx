'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../Layout';
import { useRouter } from 'next/navigation';
import {
  FaTrash,
  FaSearch,
  FaDownload,
  FaCamera,
  FaExclamationTriangle,
  FaFilter,
  FaSort,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTimes,
  FaCalendarAlt,
  FaSync,
  FaUser,
  FaPowerOff,
  FaDatabase,
} from 'react-icons/fa';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { Button } from '@mui/material';

export default function StoragePage() {
  // Router hook
  const router = useRouter();

  // Move ALL state declarations to the top level, before any conditional returns
  const [user, setUser] = useState(null);
  const [savedEntries, setSavedEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState('newest');
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [recalcTrigger, setRecalcTrigger] = useState(0);

  // Add loading and error states for API requests
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (!parsedUser.isLoggedIn) {
        router.push('/login');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  // Replace localStorage fetch with API call
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const response = await fetch('/api/barcode-entries');

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Process data similar to the localStorage approach
        const formattedEntries = data.map((entry) => ({
          barcode: entry.barcode,
          timestamp: entry.timestamp,
          photo: entry.photo,
          id: entry.id, // Keep database ID if available
        }));

        setSavedEntries(formattedEntries);
        setFilteredEntries(formattedEntries);
      } catch (error) {
        console.error('Error fetching barcode entries:', error);
        setLoadError(error.message || 'Error loading barcode entries');

        // Fall back to localStorage as a backup
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Modified delete entry function to use API
  const deleteEntry = async (index) => {
    const entryToRemove = savedEntries[index];

    try {
      if (entryToRemove.id) {
        // Use API to delete if we have an ID
        const response = await fetch(
          `/api/barcode-entries/${entryToRemove.id}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete entry from database');
        }
      }

      // Update local state regardless of API result
      const updatedEntries = [...savedEntries];
      updatedEntries.splice(index, 1);
      setSavedEntries(updatedEntries);

      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting entry:', error);

      // Show error in UI
      alert('Error al eliminar registro: ' + error.message);
    }
  };

  // Modify clear all entries to use API
  const executeDeleteAll = async () => {
    try {
      // Delete all entries through API
      const response = await fetch('/api/barcode-entries', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete all entries');
      }

      setSavedEntries([]);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting all entries:', error);

      // Show error in UI
      alert('Error al eliminar registros: ' + error.message);
    }
  };

  // Define all event handlers and functions
  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Sort entries based on selected order
  const sortEntries = (entries, order) => {
    return [...entries].sort((a, b) => {
      switch (order) {
        case 'newest':
          // Handle null timestamps (put them at the end)
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'alphabetical':
          return a.barcode.localeCompare(b.barcode);
        default:
          return 0;
      }
    });
  };

  // Group entries by barcode
  const groupEntriesByBarcode = (entries) => {
    return entries.reduce((groups, entry) => {
      if (!groups[entry.barcode]) {
        groups[entry.barcode] = [];
      }
      groups[entry.barcode].push(entry);
      return groups;
    }, {});
  };

  // Calculate total hours and minutes worked for a group
  const calculateTotalTime = (entries) => {
    let totalMinutes = 0;

    // First, group entries by day
    const entriesByDay = {};
    entries.forEach((entry) => {
      if (!entry.timestamp) return;

      const entryDate = new Date(entry.timestamp);
      const dateKey = `${entryDate.getFullYear()}-${String(
        entryDate.getMonth() + 1
      ).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;

      // Check if date is within selected range
      const startDate = dateRange.start
        ? new Date(dateRange.start + 'T00:00:00')
        : null;
      const endDate = dateRange.end
        ? new Date(dateRange.end + 'T23:59:59')
        : null;

      if (
        (!startDate || entryDate >= startDate) &&
        (!endDate || entryDate <= endDate)
      ) {
        if (!entriesByDay[dateKey]) {
          entriesByDay[dateKey] = [];
        }
        entriesByDay[dateKey].push({
          timestamp: entryDate,
          exactTime: entryDate.getTime(),
        });
      }
    });

    // Process each day's entries
    Object.entries(entriesByDay).forEach(([date, dayEntries]) => {
      // Sort entries by timestamp
      dayEntries.sort((a, b) => a.exactTime - b.exactTime);

      let dayMinutes = 0;

      // Process pairs: first entry, second exit, third entry, fourth exit, etc.
      for (let i = 0; i < dayEntries.length - 1; i += 2) {
        const entry = dayEntries[i];
        const exit = i + 1 < dayEntries.length ? dayEntries[i + 1] : null;

        if (entry && exit) {
          const diff = (exit.exactTime - entry.exactTime) / (1000 * 60); // Convert to minutes

          // Only add if the difference is valid (positive and less than 24 hours)
          if (diff > 0 && diff < 24 * 60) {
            dayMinutes += diff;
          }
        }
      }

      totalMinutes += dayMinutes;
    });

    // Round to nearest minute and calculate hours and minutes
    totalMinutes = Math.round(totalMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    return { hours, minutes };
  };

  // Debug function to show time calculations
  const showTimeCalculationDetails = (entries) => {
    if (!entries || entries.length === 0) return null;

    const timeDetails = [];

    // Group by day
    const entriesByDay = {};
    entries.forEach((entry) => {
      if (!entry.timestamp) return;

      const entryDate = new Date(entry.timestamp);
      // Create date key in a way that avoids timezone issues
      const dateKey = `${entryDate.getFullYear()}-${String(
        entryDate.getMonth() + 1
      ).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;

      if (!entriesByDay[dateKey]) {
        entriesByDay[dateKey] = [];
      }
      entriesByDay[dateKey].push({
        ...entry,
        exactTime: entryDate.getTime(),
      });
    });

    // Format date for display using local date format
    const formatDisplayDate = (dateStr) => {
      try {
        const [year, month, day] = dateStr.split('-');
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        return date.toLocaleDateString();
      } catch (e) {
        return dateStr;
      }
    };

    // For each day, format the time calculations
    Object.entries(entriesByDay).forEach(([day, dailyEntries]) => {
      dailyEntries.sort((a, b) => a.exactTime - b.exactTime);

      const formattedDay = formatDisplayDate(day);
      timeDetails.push(`${formattedDay}: ${dailyEntries.length} registros`);

      for (let i = 0; i < dailyEntries.length - 1; i += 2) {
        const entry = dailyEntries[i];
        const exit = i + 1 < dailyEntries.length ? dailyEntries[i + 1] : null;

        if (entry && exit) {
          const entryTime = new Date(entry.exactTime);
          const exitTime = new Date(exit.exactTime);

          const minutesDiff = (exitTime - entryTime) / (1000 * 60);
          if (minutesDiff <= 0 || minutesDiff >= 24 * 60) {
            timeDetails.push(
              `- ⚠️ Entrada: ${entryTime.toLocaleTimeString()} → Salida: ${exitTime.toLocaleTimeString()} = Tiempo inválido`
            );
          } else {
            const hours = Math.floor(minutesDiff / 60);
            const minutes = Math.round(minutesDiff % 60);
            timeDetails.push(
              `- Entrada: ${entryTime.toLocaleTimeString()} → Salida: ${exitTime.toLocaleTimeString()} = ${hours}h ${minutes}m`
            );
          }
        } else if (entry) {
          timeDetails.push(
            `- ⚠️ Entrada: ${new Date(
              entry.exactTime
            ).toLocaleTimeString()} (sin registro de salida)`
          );
        }
      }
    });

    return timeDetails.join('\n');
  };

  // Function to label entries as "Entrada" or "Salida"
  const getEntryType = (entry, entries) => {
    if (!entry.timestamp) return 'Sin fecha';

    // Get all entries for the same day
    const entryDate = new Date(entry.timestamp);
    // Use local date string to group by local day
    const dateKey = new Date(
      entryDate.getFullYear(),
      entryDate.getMonth(),
      entryDate.getDate()
    )
      .toISOString()
      .split('T')[0];

    // Filter and sort entries for the same day
    const sameDayEntries = entries
      .filter((e) => {
        if (!e.timestamp) return false;
        const eDate = new Date(e.timestamp);
        const eDateKey = new Date(
          eDate.getFullYear(),
          eDate.getMonth(),
          eDate.getDate()
        )
          .toISOString()
          .split('T')[0];
        return eDateKey === dateKey;
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Find position of current entry in the day's entries
    const entryIndex = sameDayEntries.findIndex((e) => {
      return (
        e.timestamp === entry.timestamp &&
        e.barcode === entry.barcode &&
        (e.photo === entry.photo || (!e.photo && !entry.photo))
      );
    });

    // Even indices (0, 2, 4...) are entries, odd indices are exits
    if (entryIndex === -1) return 'Sin coincidencia';
    return entryIndex % 2 === 0 ? 'Entrada' : 'Salida';
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

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setSortOrder('newest');
    setIsFilterMenuOpen(false);
    setDateRange({ start: '', end: '' });
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...savedEntries];

    // Apply text search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter((entry) =>
        entry.barcode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setIsFiltering(true);
    } else {
      setIsFiltering(searchTerm.trim() !== '' || dateFilter !== '');
    }

    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter).setHours(0, 0, 0, 0);
      filtered = filtered.filter((entry) => {
        if (!entry.timestamp) return false;
        const entryDate = new Date(entry.timestamp).setHours(0, 0, 0, 0);
        return entryDate === filterDate;
      });
      setIsFiltering(true);
    }

    // Apply sorting
    filtered = sortEntries(filtered, sortOrder);

    setFilteredEntries(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, savedEntries, sortOrder, dateFilter]);

  // Confirm deletion
  const confirmDeleteEntry = (index) => {
    setEntryToDelete(index);
    setIsDeleteModalOpen(true);
  };

  // Clear all saved entries
  const clearAllEntries = () => {
    setIsDeleteModalOpen(true);
    setEntryToDelete(null); // null means delete all
  };

  // Export entries as CSV
  const exportCSV = () => {
    if (savedEntries.length === 0) return;

    // Create CSV header
    const csvRows = [];
    csvRows.push(['Código', 'Fecha y Hora', 'Tiempo Trabajado'].join(','));

    // Group entries by barcode for time calculations
    const entriesByBarcode = groupEntriesByBarcode(savedEntries);

    // Process each entry with its corresponding worked time
    Object.entries(entriesByBarcode).forEach(([barcode, entries]) => {
      // Get time calculation for this barcode
      const { hours, minutes } = calculateTotalTime(entries);
      const timeWorked = `${hours}h ${minutes}m`;

      // Add each entry with its barcode's total time
      entries.forEach((entry) => {
        const formattedDate = entry.timestamp
          ? new Date(entry.timestamp).toLocaleString()
          : 'N/A';
        csvRows.push([entry.barcode, formattedDate, timeWorked].join(','));
      });
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

  // Pre-calculate time values for all entries - this useMemo must come BEFORE any conditional returns
  const timeCalculations = useMemo(() => {
    const grouped = groupEntriesByBarcode(filteredEntries);
    const calculations = {};

    Object.entries(grouped).forEach(([barcode, entries]) => {
      calculations[barcode] = {
        timeValues: calculateTotalTime(entries),
        timeDetails: showTimeCalculationDetails(entries),
      };
    });

    return calculations;
  }, [filteredEntries, dateRange, recalcTrigger]);

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Make the header logout button more prominent
  const headerButtons = (
    <Button
      variant="contained"
      color="error"
      sx={{
        py: 1,
        px: 2.5,
        borderRadius: 1,
        boxShadow: 2,
        transition: 'all 0.3s',
        '&:hover': {
          backgroundColor: 'rgb(211, 47, 47)',
          boxShadow: 3,
        },
      }}
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
    >
      Cerrar Sesión
    </Button>
  );

  // NOW you can use conditional return after all hooks have been called
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout headerButtons={headerButtons}>
      {/* Welcome message with user email and logout button */}
      <div className="container mx-auto px-4 pt-3">
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md mb-4 flex flex-col sm:flex-row sm:items-center">
          <div className="flex items-center">
            <FaUser className="mr-2" />
            <span className="font-medium mr-2">Usuario:</span>
            {user.name || user.email}
            <span className="ml-3 text-sm text-gray-500">
              Último acceso: {new Date(user.loginTime).toLocaleString()}
            </span>
          </div>

          {/* Updated MUI logout button */}
          <Button
            variant="outlined"
            color="error"
            size="small"
            sx={{
              mt: { xs: 2, sm: 0 },
              ml: { sm: 'auto' },
              borderRadius: 1,
              transition: 'all 0.3s',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.04)',
              },
            }}
            startIcon={<FaPowerOff />}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-blue-800">
            Registros de Códigos Escaneados
          </h1>

          {/* Data source indicator */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <FaDatabase className="text-blue-500" />
            <span>
              Datos cargados desde:{' '}
              {loadError ? 'almacenamiento local (fallback)' : 'base de datos'}
            </span>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-700">Cargando registros...</p>
            </div>
          )}

          {/* Error message */}
          {loadError && !isLoading && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md mb-6 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">
                    Error al cargar datos de la base de datos
                  </h3>
                  <p className="mt-2 text-sm">{loadError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Continue with existing code if not loading */}
          {!isLoading && (
            <>
              {/* Search, filter, and date range bar */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar códigos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm w-full focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                    {searchTerm && (
                      <button
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setSearchTerm('')}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                    className={`p-2 rounded-md ${
                      isFiltering
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 hover:bg-gray-200'
                    } transition-all`}
                    title="Filtros avanzados"
                  >
                    <FaFilter />
                  </button>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Desde:
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Hasta:
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={exportCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2 transition-colors shadow-sm"
                    disabled={savedEntries.length === 0}
                  >
                    <FaDownload /> Exportar CSV
                  </button>
                  <button
                    onClick={clearAllEntries}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2 transition-colors shadow-sm"
                    disabled={savedEntries.length === 0}
                  >
                    <FaTrash /> Eliminar Todo
                  </button>
                </div>
              </div>

              {/* Filter panel */}
              <Transition
                show={isFilterMenuOpen}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 transform -translate-y-2"
                enterTo="opacity-100 transform translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 transform translate-y-0"
                leaveTo="opacity-0 transform -translate-y-2"
              >
                <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-700">
                      Filtros avanzados
                    </h3>
                    <button
                      onClick={resetFilters}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Reiniciar filtros
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Date filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filtrar por fecha
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaCalendarAlt className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Sort order */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ordenar por
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSortOrder('newest')}
                          className={`px-3 py-2 flex-1 rounded-md flex items-center justify-center gap-1 ${
                            sortOrder === 'newest'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <FaSortAmountDown size={12} /> Más recientes
                        </button>
                        <button
                          onClick={() => setSortOrder('oldest')}
                          className={`px-3 py-2 flex-1 rounded-md flex items-center justify-center gap-1 ${
                            sortOrder === 'oldest'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <FaSortAmountUp size={12} /> Más antiguos
                        </button>
                        <button
                          onClick={() => setSortOrder('alphabetical')}
                          className={`px-3 py-2 flex-1 rounded-md flex items-center justify-center gap-1 ${
                            sortOrder === 'alphabetical'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <FaSort size={12} /> A-Z
                        </button>
                      </div>
                    </div>

                    {/* Items per page */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Items por página
                      </label>
                      <select
                        value={entriesPerPage}
                        onChange={(e) =>
                          setEntriesPerPage(Number(e.target.value))
                        }
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Transition>

              {/* Filter status indication */}
              {isFiltering && (
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md mb-4 flex justify-between items-center">
                  <span>
                    Mostrando resultados filtrados ({filteredEntries.length} de{' '}
                    {savedEntries.length})
                  </span>
                  <button
                    onClick={resetFilters}
                    className="text-blue-700 hover:text-blue-900 font-medium"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}

              {/* Grouped list view for entries */}
              {filteredEntries.length > 0 ? (
                <div className="mb-6">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {Object.entries(groupEntriesByBarcode(filteredEntries)).map(
                      ([barcode, entries], groupIndex) => {
                        // Access pre-calculated time values
                        const { hours, minutes } = timeCalculations[barcode]
                          ?.timeValues || {
                          hours: 0,
                          minutes: 0,
                        };
                        const timeDetails =
                          timeCalculations[barcode]?.timeDetails || '';

                        return (
                          <div key={groupIndex} className="mb-4">
                            {/* Group header */}
                            <div className="bg-gray-100 px-4 py-3 font-semibold text-gray-700 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center">
                              <div>
                                Código:{' '}
                                <span className="text-blue-700">{barcode}</span>{' '}
                                ({entries.length} registro
                                {entries.length > 1 ? 's' : ''})
                              </div>
                              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <button
                                  onClick={() =>
                                    setRecalcTrigger((prev) => prev + 1)
                                  }
                                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1 rounded-full transition-colors"
                                  title="Recalcular tiempo"
                                >
                                  <FaSync className="h-4 w-4" />
                                </button>
                                <div
                                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                                  title={timeDetails}
                                >
                                  {hours} hora{hours !== 1 ? 's' : ''} y{' '}
                                  {minutes} minuto{minutes !== 1 ? 's' : ''}{' '}
                                  trabajado
                                  {hours !== 1 || minutes !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>

                            {/* Entries in the group */}
                            {entries.map((entry, index) => {
                              const actualIndex = savedEntries.findIndex(
                                (e) => e === entry
                              );
                              const entryType = getEntryType(entry, entries);

                              return (
                                <div
                                  key={index}
                                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }`}
                                >
                                  <div className="flex-shrink-0 w-24">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                        entryType === 'Entrada'
                                          ? 'bg-green-100 text-green-800'
                                          : entryType === 'Salida'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {entryType}
                                    </span>
                                  </div>

                                  <div className="flex-grow min-w-0">
                                    <div className="text-sm text-gray-600 flex items-center gap-1">
                                      <FaCalendarAlt
                                        className="opacity-70"
                                        size={12}
                                      />
                                      {formatDate(entry.timestamp)}
                                    </div>
                                  </div>

                                  <div className="flex-shrink-0 flex items-center gap-3">
                                    {entry.photo ? (
                                      <div
                                        className="cursor-pointer relative group"
                                        onClick={() =>
                                          setSelectedPhoto(entry.photo)
                                        }
                                      >
                                        <img
                                          src={entry.photo}
                                          alt={`Foto de ${entry.barcode}`}
                                          className="w-14 h-14 object-cover rounded-md shadow-sm hover:opacity-90 transition-opacity"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-14 h-14 flex justify-center items-center text-amber-500 bg-amber-50 rounded-md border border-amber-100">
                                        <FaExclamationTriangle
                                          size={16}
                                          title="Sin foto"
                                        />
                                      </div>
                                    )}

                                    <button
                                      onClick={() =>
                                        confirmDeleteEntry(actualIndex)
                                      }
                                      className="bg-red-100 text-red-700 p-2 rounded-full hover:bg-red-200 transition-colors"
                                      title="Eliminar registro"
                                    >
                                      <FaTrash size={14} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 border border-dashed rounded-lg bg-gray-50">
                  <FaExclamationTriangle
                    size={32}
                    className="mx-auto mb-3 text-amber-400"
                  />
                  <p className="text-lg font-medium">
                    {savedEntries.length === 0
                      ? 'No hay registros guardados.'
                      : 'No se encontraron resultados para su búsqueda.'}
                  </p>
                  {savedEntries.length > 0 && filteredEntries.length === 0 && (
                    <button
                      onClick={resetFilters}
                      className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {filteredEntries.length > entriesPerPage && (
                <div className="flex justify-center mt-6">
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 ${
                        currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      &larr;
                    </button>

                    {[...Array(totalPages).keys()].map((number) => (
                      <button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === number + 1
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {number + 1}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        paginate(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 ${
                        currentPage === totalPages
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      <span className="sr-only">Siguiente</span>
                      &rarr;
                    </button>
                  </nav>
                </div>
              )}

              <div className="mt-6 text-gray-500 text-sm flex justify-between items-center">
                <span>Total de registros: {savedEntries.length}</span>
                <span>
                  Mostrando: {indexOfFirstEntry + 1} -{' '}
                  {Math.min(indexOfLastEntry, filteredEntries.length)} de{' '}
                  {filteredEntries.length}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      <Transition appear show={selectedPhoto !== null} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setSelectedPhoto(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Vista ampliada
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setSelectedPhoto(null)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="mt-2">
                    <img
                      src={selectedPhoto}
                      alt="Imagen ampliada"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-center text-red-500 mb-4">
                    <FaExclamationTriangle size={48} />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-center text-gray-900"
                  >
                    {entryToDelete !== null
                      ? '¿Eliminar este registro?'
                      : '¿Eliminar todos los registros?'}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 text-center">
                      {entryToDelete !== null
                        ? 'Esta acción no se puede deshacer.'
                        : 'Se eliminarán permanentemente todos los registros guardados. Esta acción no se puede deshacer.'}
                    </p>
                  </div>

                  <div className="mt-6 flex gap-2 justify-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsDeleteModalOpen(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      onClick={() =>
                        entryToDelete !== null
                          ? deleteEntry(entryToDelete)
                          : executeDeleteAll()
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Layout>
  );
}
