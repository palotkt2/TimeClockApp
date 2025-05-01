'use client';
import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useDropzone } from 'react-dropzone';

export default function BulkOrderCSVUpload() {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setError(null);
    setSuccess(false);

    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setIsLoading(true);

    // Read and parse CSV
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const rows = csvText.split('\n');
        const headers = rows[0].split(',').map((header) => header.trim());

        // Validate required headers
        const requiredHeaders = ['name', 'title', 'company'];
        const missingHeaders = requiredHeaders.filter(
          (h) => !headers.includes(h)
        );

        if (missingHeaders.length > 0) {
          setError(
            `CSV is missing required headers: ${missingHeaders.join(', ')}`
          );
          setIsLoading(false);
          return;
        }

        // Parse data rows
        const data = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue; // Skip empty rows

          const values = rows[i].split(',').map((val) => val.trim());
          const rowData = {};

          headers.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });

          data.push(rowData);
        }

        setParsedData(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error parsing CSV:', err);
        setError(
          'Failed to parse CSV file. Please check the format and try again.'
        );
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setIsLoading(false);
    };

    reader.readAsText(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmitOrder = async () => {
    if (parsedData.length === 0) {
      setError('No data to submit');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Here you would send the parsed data to your API
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

      // On successful submission
      setSuccess(true);
      setParsedData([]);
      setFile(null);
    } catch (err) {
      setError('Failed to submit order. Please try again.');
      console.error('Error submitting order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    setSuccess(false);
  };

  const renderUploadArea = () => (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.400',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {isDragActive
          ? 'Drop the CSV file here'
          : 'Drag & drop your CSV file here'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        or click to select a file
      </Typography>
      <Button
        variant="outlined"
        startIcon={<UploadFileIcon />}
        sx={{ mt: 2 }}
        onClick={(e) => e.stopPropagation()}
      >
        Browse Files
      </Button>
    </Box>
  );

  const renderPreview = () => {
    if (!parsedData.length) return null;

    const headers = Object.keys(parsedData[0]);

    return (
      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">
            Preview ({parsedData.length} records)
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleReset}
          >
            Clear
          </Button>
        </Box>

        <TableContainer
          component={Paper}
          sx={{ maxHeight: 400, overflow: 'auto' }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {parsedData.slice(0, 100).map((row, index) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell key={`${index}-${header}`}>
                      {row[header]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {parsedData.length > 100 && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            Showing first 100 records of {parsedData.length}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Processing Order...' : 'Submit Bulk Order'}
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" sx={{ mr: 1 }}>
          Bulk Order with CSV
        </Typography>
        <Tooltip title="Upload a CSV file with columns: name, title, company, email (optional), and any other badge fields">
          <IconButton size="small">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(false)}
          icon={<CheckCircleIcon fontSize="inherit" />}
        >
          Bulk order successfully submitted! Your badges will be processed
          shortly.
        </Alert>
      )}

      {file && !isLoading ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            <strong>File:</strong> {file.name} ({(file.size / 1024).toFixed(2)}{' '}
            KB)
          </Typography>
        </Box>
      ) : null}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : parsedData.length > 0 ? (
        renderPreview()
      ) : (
        renderUploadArea()
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          CSV Format Requirements:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>File must be in CSV format</li>
          <li>First row must contain column headers</li>
          <li>Required columns: name, title, company</li>
          <li>Optional columns: email, department, custom fields</li>
        </Typography>
      </Box>
    </Box>
  );
}
