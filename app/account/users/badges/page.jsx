'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Container,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Breadcrumbs,
  Link as MuiLink,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import Link from 'next/link';
import SideNavigation from '../SideNavigation';
import BulkOrderCSVUpload from '../../../components/BulkOrderCSVUpload';
import HomeIcon from '@mui/icons-material/Home';
import BadgeIcon from '@mui/icons-material/Badge';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TableRowsIcon from '@mui/icons-material/TableRows';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export default function BulkOrderPage() {
  const [tabValue, setTabValue] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(false); // State to control footer visibility

  const [manualEntries, setManualEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    department: '',
    custom_field_1: '',
  });
  const [manualSubmitSuccess, setManualSubmitSuccess] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDownloadTemplate = () => {
    const csvContent = [
      'name,title,company,email,department,custom_field_1',
      'John Doe,Software Engineer,ABC Company,john@example.com,Engineering,Value 1',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'badge_order_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEntry((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddEntry = () => {
    if (!currentEntry.name || !currentEntry.title || !currentEntry.company) {
      return;
    }

    setManualEntries([...manualEntries, { ...currentEntry, id: Date.now() }]);

    setCurrentEntry({
      name: '',
      title: '',
      company: '',
      email: '',
      department: '',
      custom_field_1: '',
    });
  };

  const handleRemoveEntry = (id) => {
    setManualEntries(manualEntries.filter((entry) => entry.id !== id));
  };

  const handleSubmitManualEntries = () => {
    if (manualEntries.length === 0) return;

    console.log('Submitting manual entries:', manualEntries);

    setTimeout(() => {
      setManualSubmitSuccess(true);
      setManualEntries([]);

      setTimeout(() => setManualSubmitSuccess(false), 5000);
    }, 1000);
  };

  // Function to toggle footer visibility
  const toggleFooter = () => {
    setShowFooter(!showFooter);
  };

  // Hide footer on component mount (similar to users/page.jsx)
  useEffect(() => {
    setShowFooter(false);
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - 240px)` },
          mt: { sm: '300px' },
          mt: '64px',
          display: 'flex',
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            width: '100%',
            px: 1,
          }}
        >
          <Breadcrumbs sx={{ mb: 1 }}>
            <MuiLink
              component={Link}
              href="/account/users"
              underline="hover"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </MuiLink>
            <Typography
              sx={{ display: 'flex', alignItems: 'center' }}
              color="text.primary"
            >
              <BadgeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Bulk Order
            </Typography>
          </Breadcrumbs>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
              Bulk Badge Order
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              Download CSV Template
            </Button>
          </Box>

          <Paper sx={{ mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="Bulk order methods"
            >
              <Tab
                icon={<UploadFileIcon />}
                label="Upload CSV"
                id="tab-0"
                aria-controls="tabpanel-0"
              />
              <Tab
                icon={<TableRowsIcon />}
                label="Manual Entry"
                id="tab-1"
                aria-controls="tabpanel-1"
              />
            </Tabs>
          </Paper>

          <div
            role="tabpanel"
            hidden={tabValue !== 0}
            id="tabpanel-0"
            aria-labelledby="tab-0"
          >
            {tabValue === 0 && (
              <Paper sx={{ p: 3 }}>
                <BulkOrderCSVUpload />
              </Paper>
            )}
          </div>

          <div
            role="tabpanel"
            hidden={tabValue !== 1}
            id="tabpanel-1"
            aria-labelledby="tab-1"
          >
            {tabValue === 1 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Manual Bulk Entry
                </Typography>

                {manualSubmitSuccess && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Your bulk order has been successfully submitted!
                  </Alert>
                )}

                <Box sx={{ mb: 4 }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Manually enter badge information using the form below. Add
                    as many entries as needed.
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        name="name"
                        label="Name *"
                        value={currentEntry.name}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        name="title"
                        label="Title *"
                        value={currentEntry.title}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        name="company"
                        label="Company *"
                        value={currentEntry.company}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        name="email"
                        label="Email"
                        type="email"
                        value={currentEntry.email}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        name="department"
                        label="Department"
                        value={currentEntry.department}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        name="custom_field_1"
                        label="Custom Field"
                        value={currentEntry.custom_field_1}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAddEntry}
                        disabled={
                          !currentEntry.name ||
                          !currentEntry.title ||
                          !currentEntry.company
                        }
                      >
                        Add Entry
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {manualEntries.length > 0 && (
                  <>
                    <Divider sx={{ my: 3 }} />

                    <Box
                      sx={{
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="h6">
                        Badge Entries ({manualEntries.length})
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmitManualEntries}
                      >
                        Submit Bulk Order
                      </Button>
                    </Box>

                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Custom Field</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {manualEntries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>{entry.name}</TableCell>
                              <TableCell>{entry.title}</TableCell>
                              <TableCell>{entry.company}</TableCell>
                              <TableCell>{entry.email}</TableCell>
                              <TableCell>{entry.department}</TableCell>
                              <TableCell>{entry.custom_field_1}</TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveEntry(entry.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </Paper>
            )}
          </div>

          {/* Footer - Only shown when showFooter is true */}
          {showFooter && (
            <Grid container spacing={3} sx={{ mt: 4 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Need Help?
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Download our CSV template to ensure your bulk order is
                      formatted correctly. For assistance, contact support.
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadTemplate}
                    >
                      Download Template
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order Status
                    </Typography>
                    <Typography variant="body2">
                      You can check the status of your bulk orders in the
                      Dashboard under "Recent Orders".
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Optional - Add button to show help if needed */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button variant="text" color="primary" onClick={toggleFooter}>
              {showFooter ? 'Hide Help' : 'Show Help'}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
