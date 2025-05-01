import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Divider,
  useMediaQuery,
  useTheme,
  Button,
  Tooltip,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import FlipToBackIcon from '@mui/icons-material/FlipToBack';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import QrCodeIcon from '@mui/icons-material/QrCode';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const CardOptionsDrawer = ({
  isOpen,
  onClose,
  viewingSide,
  setViewingSide,
  name,
  setName,
  title,
  setTitle,
  company,
  setCompany,
  idNumber,
  setIdNumber,
  backText,
  setBackText,
  showBackside,
  setShowBackside,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Local state to handle form values
  const [localName, setLocalName] = useState(name);
  const [localTitle, setLocalTitle] = useState(title);
  const [localCompany, setLocalCompany] = useState(company);
  const [localIdNumber, setLocalIdNumber] = useState(idNumber);
  const [localBackText, setLocalBackText] = useState(backText);
  const [localShowBackside, setLocalShowBackside] = useState(showBackside);
  const [localViewingSide, setLocalViewingSide] = useState(viewingSide);

  // Sync local state with props when drawer opens
  useEffect(() => {
    if (isOpen) {
      setLocalName(name);
      setLocalTitle(title);
      setLocalCompany(company);
      setLocalIdNumber(idNumber);
      setLocalBackText(backText);
      setLocalShowBackside(showBackside);
      setLocalViewingSide(viewingSide);
    }
  }, [
    isOpen,
    name,
    title,
    company,
    idNumber,
    backText,
    showBackside,
    viewingSide,
  ]);

  const handleSave = () => {
    setName(localName);
    setTitle(localTitle);
    setCompany(localCompany);
    setIdNumber(localIdNumber);
    setBackText(localBackText);
    setShowBackside(localShowBackside);
    setViewingSide(localViewingSide);
    onClose();
  };

  const SectionTitle = ({ title, helpText, icon }) => (
    <div className="flex items-center mb-2">
      {icon && <div className="mr-2 text-gray-600">{icon}</div>}
      <p className={`${isMobile ? 'text-base' : 'text-sm'} font-medium`}>
        {title}
      </p>
      {helpText && (
        <Tooltip title={helpText} arrow placement="top">
          <span className="ml-1 text-gray-400 cursor-help">
            <HelpOutlineIcon fontSize={isMobile ? 'small' : 'inherit'} />
          </span>
        </Tooltip>
      )}
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: isMobile ? '0' : '8px',
          maxHeight: '100vh',
          m: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 2,
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <span className={`${isMobile ? 'text-lg' : 'text-base'} font-medium`}>
          Card Options
        </span>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{
            padding: isMobile ? '8px' : '4px',
          }}
        >
          <CloseIcon fontSize={isMobile ? 'medium' : 'small'} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: isMobile ? 2 : 3, pt: 3 }}>
        <div className="flex flex-col">
          {/* Badge Side Selection */}
          <div className="w-full mb-4">
            <SectionTitle
              title="Badge Side"
              helpText="Select which side of the badge to edit"
              icon={<CreditCardIcon fontSize="small" />}
            />
            <div className="mb-3">
              <FormControlLabel
                control={
                  <Switch
                    checked={localShowBackside}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setLocalShowBackside(newValue);
                      if (!newValue && localViewingSide === 'back') {
                        setLocalViewingSide('front');
                      }
                    }}
                    color="primary"
                  />
                }
                label="Include back side"
              />
            </div>

            {localShowBackside && (
              <ToggleButtonGroup
                value={localViewingSide}
                exclusive
                onChange={(e, newSide) => {
                  if (newSide !== null) {
                    setLocalViewingSide(newSide);
                  }
                }}
                color="primary"
                className="w-full"
              >
                <ToggleButton value="front" className="w-1/2">
                  <CreditCardIcon fontSize="small" className="mr-1" />
                  Front Side
                </ToggleButton>
                <ToggleButton value="back" className="w-1/2">
                  <FlipToBackIcon fontSize="small" className="mr-1" />
                  Back Side
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </div>

          {/* Card Preview - Simple representation */}
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div
              className="relative overflow-hidden mx-auto border border-gray-300 rounded-lg bg-blue-600 text-white"
              style={{
                width: '200px',
                height: '320px',
                maxHeight: isMobile ? '180px' : '220px',
                transform: 'scale(0.85)',
                transformOrigin: 'center top',
              }}
            >
              <div className="flex flex-col items-center justify-center h-full p-3">
                {localViewingSide === 'front' ? (
                  <>
                    <div className="w-16 h-16 bg-gray-300 rounded-full mb-3">
                      <img
                        src="https://via.placeholder.com/100"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg mb-1">
                        {localName || 'Name'}
                      </p>
                      <p className="text-sm mb-1">{localTitle || 'Title'}</p>
                      <p className="text-sm mb-1">
                        {localCompany || 'Company'}
                      </p>
                      <p className="text-xs mt-2">
                        {localIdNumber || 'ID-12345'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm">
                      {localBackText || 'No back text entered yet...'}
                    </p>
                  </div>
                )}
              </div>
              <div className="absolute top-2 right-2 bg-white text-xs text-black px-1 rounded">
                {localViewingSide === 'front' ? 'Front' : 'Back'}
              </div>
            </div>
          </div>

          <Divider sx={{ width: '100%', my: 3 }} />

          {/* Fields based on current side */}
          {localViewingSide === 'front' ? (
            <div className="w-full rounded-lg bg-white p-2 space-y-4">
              <div className="mb-3">
                <SectionTitle
                  title="Name"
                  helpText="Enter the employee's full name"
                  icon={<BadgeIcon fontSize="small" />}
                />
                <TextField
                  variant="outlined"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  fullWidth
                  placeholder="Enter full name"
                  size="small"
                />
              </div>

              <div className="mb-3">
                <SectionTitle
                  title="Job Title"
                  helpText="Enter the employee's job position"
                  icon={<WorkIcon fontSize="small" />}
                />
                <TextField
                  variant="outlined"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  fullWidth
                  placeholder="Enter job title"
                  size="small"
                />
              </div>

              <div className="mb-3">
                <SectionTitle
                  title="Company"
                  helpText="Enter the company or organization name"
                  icon={<BusinessIcon fontSize="small" />}
                />
                <TextField
                  variant="outlined"
                  value={localCompany}
                  onChange={(e) => setLocalCompany(e.target.value)}
                  fullWidth
                  placeholder="Enter company name"
                  size="small"
                />
              </div>

              <div className="mb-3">
                <SectionTitle
                  title="ID Number"
                  helpText="Enter the employee's ID or badge number"
                  icon={<QrCodeIcon fontSize="small" />}
                />
                <TextField
                  variant="outlined"
                  value={localIdNumber}
                  onChange={(e) => setLocalIdNumber(e.target.value)}
                  fullWidth
                  placeholder="Enter ID number"
                  size="small"
                />
              </div>
            </div>
          ) : (
            <div className="w-full rounded-lg bg-white p-2">
              <SectionTitle
                title="Back Side Text"
                helpText="Enter text to display on the back side of the badge"
                icon={<FormatColorTextIcon fontSize="small" />}
              />
              <TextField
                variant="outlined"
                value={localBackText}
                onChange={(e) => setLocalBackText(e.target.value)}
                fullWidth
                multiline
                rows={4}
                placeholder="Enter text for back side (e.g., company policies, emergency contacts, return instructions)"
              />
            </div>
          )}

          {/* Bottom action buttons */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
              <button
                onClick={handleSave}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg"
              >
                Apply Changes
              </button>
            </div>
          )}

          {!isMobile && (
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Apply Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardOptionsDrawer;
