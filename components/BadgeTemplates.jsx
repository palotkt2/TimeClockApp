import React, { useEffect, useState } from 'react';
import jdenticonPatterns, {
  getPatternsByCategory,
  getAllPatterns,
} from '../services/jdenticonPatterns';
import * as jdenticon from 'jdenticon';
import AIGenerator from './AIChat/AIGenerator';
// Material-UI Imports
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Collapse,
  Divider,
  Alert,
  AlertTitle,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Modal,
  Button,
} from '@mui/material';
// FontAwesome Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup,
  faBuilding,
  faCalendarAlt,
  faGraduationCap,
  faShieldAlt,
  faMedkit,
  faPalette,
  faPencilAlt,
  faChevronRight,
  faListUl,
  faMousePointer,
  faBorderStyle,
  faTimes,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';

const BadgeTemplates = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  templates,
  selectedTemplate,
  setSelectedTemplate,
  onSelectTemplate,
  aiGeneratedTemplates,
  setAiGeneratedTemplates,
  onBackgroundGenerate,
}) => {
  const [generationType, setGenerationType] = useState('template');
  const [filteredPatterns, setFilteredPatterns] = useState(jdenticonPatterns);
  const [toasts, setToasts] = useState([]);
  const [showPatterns, setShowPatterns] = useState(false);
  const [selectedPatternCategory, setSelectedPatternCategory] = useState('all');
  const [showHelp, setShowHelp] = useState(false);

  const patternCategories = [
    { id: 'all', name: 'All Patterns', icon: '🔍' },
    { id: 'corporate', name: 'Corporate', icon: '🏢' },
    { id: 'event', name: 'Event', icon: '🎉' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'healthcare', name: 'Healthcare', icon: '⚕️' },
    { id: 'custom', name: 'Custom', icon: '✏️' },
    { id: 'modern', name: 'Modern', icon: '⚡' },
  ];

  const categoriesWithIcons = [
    { id: 'all', name: 'All Templates', icon: '🔍' },
    { id: 'corporate', name: 'Corporate', icon: '🏢' },
    { id: 'event', name: 'Event', icon: '🎉' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'healthcare', name: 'Healthcare', icon: '⚕️' },
    { id: 'patterns', name: 'Patterns', icon: '🎨' },
    { id: 'custom', name: 'Custom', icon: '✏️' },
  ];

  const allTemplates = [...templates, ...aiGeneratedTemplates];

  const filteredTemplates =
    selectedCategory === 'all'
      ? allTemplates
      : allTemplates.filter((tmpl) => tmpl.category === selectedCategory);

  useEffect(() => {
    if (selectedCategory === 'patterns') {
      setShowPatterns(true);

      if (selectedPatternCategory === 'all') {
        setFilteredPatterns(getAllPatterns());
      } else {
        setFilteredPatterns(getPatternsByCategory(selectedPatternCategory));
      }
    } else {
      setShowPatterns(false);
      setFilteredPatterns(getPatternsByCategory(selectedCategory));
    }
  }, [selectedCategory, selectedPatternCategory]);

  const getTemplateBackground = (tmplId) => {
    const aiTemplate = aiGeneratedTemplates.find((t) => t.id === tmplId);
    if (aiTemplate) {
      if (
        aiTemplate.backgroundType === 'image' &&
        (aiTemplate.suggestedImageUrl || aiTemplate.backgroundImage)
      ) {
        return `url(${
          aiTemplate.suggestedImageUrl || aiTemplate.backgroundImage
        })`;
      } else if (aiTemplate.colors && aiTemplate.colors.background) {
        return aiTemplate.colors.background;
      }
    }

    switch (tmplId) {
      case 'gradient':
        return 'linear-gradient(45deg, #0066cc, #00cc99)';
      case 'striped':
        return 'repeating-linear-gradient(45deg, #0066cc, #0066cc 10px, #ffffff22 10px, #ffffff22 20px)';
      case 'minimal':
        return 'white';
      case 'conference':
        return 'linear-gradient(to right, #ff7e5f, #feb47b)';
      case 'school':
        return 'linear-gradient(to right, #4776E6, #8E54E9)';
      case 'hospital':
        return 'linear-gradient(to right, #11998e, #38ef7d)';
      case 'visitor':
        return 'linear-gradient(to right, #f83600, #f9d423)';
      default:
        return '#0066cc';
    }
  };

  const getTemplateTextColor = (tmplId) => {
    const aiTemplate = aiGeneratedTemplates.find((t) => t.id === tmplId);
    if (aiTemplate && aiTemplate.colors && aiTemplate.colors.text) {
      return aiTemplate.colors.text;
    }
    return '#ffffff';
  };

  const handleSelectTemplate = (templateId) => {
    console.log(`Clicking template: ${templateId}`);
    if (onSelectTemplate) {
      onSelectTemplate(templateId);
    }
    if (typeof setSelectedTemplate === 'function') {
      setSelectedTemplate(templateId);
    }

    showToast(`✅ Template "${templateId}" selected successfully!`, 'success');

    if (showHelp) {
      setShowHelp(false);
    }
  };

  const showToast = (message, type = 'info', id = null) => {
    const toastId = id || Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id: toastId, message, type }]);

    if (type !== 'error') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
      }, 5000);
    }

    return toastId;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handlePatternSelect = (pattern) => {
    if (onBackgroundGenerate) {
      const patternElement = document.getElementById(`pattern-${pattern.id}`);
      if (patternElement) {
        patternElement.classList.add('ring-2', 'ring-blue-500');
        setTimeout(() => {
          patternElement.classList.remove('ring-2', 'ring-blue-500');
        }, 1000);
      }

      onBackgroundGenerate('pattern', pattern.prompt);

      console.log(`Selected pattern: ${pattern.name} (${pattern.prompt})`);
    }
  };

  // Icon mapping for categories
  const getCategoryIcon = (categoryId) => {
    switch (categoryId) {
      case 'all':
        return faLayerGroup;
      case 'corporate':
        return faBuilding;
      case 'event':
        return faCalendarAlt;
      case 'education':
        return faGraduationCap;
      case 'security':
        return faShieldAlt;
      case 'healthcare':
        return faMedkit;
      case 'patterns':
        return faPalette;
      case 'custom':
        return faPencilAlt;
      default:
        return faLayerGroup;
    }
  };

  // Get category description
  const getCategoryDescription = (categoryId) => {
    switch (categoryId) {
      case 'all':
        return 'View all available templates';
      case 'corporate':
        return 'Professional designs for business use';
      case 'event':
        return 'Perfect for conferences & meetings';
      case 'education':
        return 'Ideal for schools & universities';
      case 'security':
        return 'Enhanced security features';
      case 'healthcare':
        return 'Designs for medical staff';
      case 'patterns':
        return 'Decorative background patterns';
      case 'custom':
        return 'Your customized designs';
      default:
        return '';
    }
  };

  // Help modal style
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    maxWidth: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  };

  return (
    <div className="space-y-6">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded shadow-md flex items-center justify-between ${
              toast.type === 'error'
                ? 'bg-red-100 text-red-800'
                : toast.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Help Modal */}
      <Modal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        aria-labelledby="help-modal-title"
        aria-describedby="help-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography
            id="help-modal-title"
            variant="h6"
            component="h2"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold',
              mb: 2,
            }}
          >
            <FontAwesomeIcon
              icon={faInfoCircle}
              style={{ marginRight: '8px' }}
            />
            How to Choose a Template
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Follow these simple steps to select a template:
          </Typography>

          <Box sx={{ ml: 1 }}>
            <Stepper
              orientation="vertical"
              sx={{ '.MuiStepLabel-label': { fontSize: '0.9rem' } }}
            >
              <Step active completed>
                <StepLabel
                  StepIconComponent={() => (
                    <Box sx={{ mr: 1, color: '#065388' }}>
                      <FontAwesomeIcon icon={faListUl} />
                    </Box>
                  )}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    Choose a category from the left sidebar (e.g., Corporate,
                    Event)
                  </Typography>
                </StepLabel>
              </Step>

              <Step active completed>
                <StepLabel
                  StepIconComponent={() => (
                    <Box sx={{ mr: 1, color: '#065388' }}>
                      <FontAwesomeIcon icon={faLayerGroup} />
                    </Box>
                  )}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    Browse the template options that appear on the right
                  </Typography>
                </StepLabel>
              </Step>

              <Step active completed>
                <StepLabel
                  StepIconComponent={() => (
                    <Box sx={{ mr: 1, color: '#065388' }}>
                      <FontAwesomeIcon icon={faMousePointer} />
                    </Box>
                  )}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    Click on any template that you like to select it
                  </Typography>
                </StepLabel>
              </Step>

              <Step active completed>
                <StepLabel
                  StepIconComponent={() => (
                    <Box sx={{ mr: 1, color: '#065388' }}>
                      <FontAwesomeIcon icon={faBorderStyle} />
                    </Box>
                  )}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    Your selected template will have a blue border around it
                  </Typography>
                </StepLabel>
              </Step>
            </Stepper>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={() => setShowHelp(false)}>
              Got it
            </Button>
          </Box>
        </Box>
      </Modal>

      <h2 className="text-2xl font-bold flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 mr-2 text-[#065388]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
        Choose Your Badge Design
        <IconButton
          size="small"
          onClick={() => setShowHelp(true)}
          sx={{ ml: 1, color: '#065388' }}
        >
          <FontAwesomeIcon icon={faInfoCircle} />
        </IconButton>
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 bg-gray-50 rounded-lg border shadow-sm">
          <div className="sticky top-24 p-4">
            <h3 className="font-bold text-gray-700 mb-3 text-lg flex items-center">
              <FontAwesomeIcon icon={faLayerGroup} className="mr-2" />
              Badge Categories
            </h3>

            <Paper elevation={0} className="bg-gray-50">
              <List component="nav" aria-label="badge categories">
                {categoriesWithIcons.map((category) => (
                  <React.Fragment key={category.id}>
                    <ListItem
                      button
                      selected={selectedCategory === category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`rounded-lg transition-all duration-200 mb-1 ${
                        selectedCategory === category.id
                          ? 'bg-[#065388] text-white shadow-md'
                          : 'hover:bg-blue-50 hover:text-[#065388]'
                      }`}
                      style={
                        selectedCategory === category.id
                          ? { color: 'white' }
                          : {}
                      }
                    >
                      <ListItemIcon
                        style={
                          selectedCategory === category.id
                            ? { color: 'white' }
                            : { color: '#065388' }
                        }
                      >
                        <FontAwesomeIcon icon={getCategoryIcon(category.id)} />
                      </ListItemIcon>
                      <ListItemText
                        primary={category.name}
                        secondary={
                          selectedCategory === category.id
                            ? getCategoryDescription(category.id)
                            : null
                        }
                        secondaryTypographyProps={{
                          style: {
                            color:
                              selectedCategory === category.id
                                ? 'rgba(255,255,255,0.7)'
                                : '',
                            fontSize: '0.75rem',
                          },
                        }}
                      />
                      {selectedCategory === category.id && (
                        <FontAwesomeIcon icon={faChevronRight} size="sm" />
                      )}
                    </ListItem>
                    {category.id === 'patterns' && <Divider className="my-2" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>

            <Divider className="my-4" />

            <AIGenerator
              onSelectTemplate={onSelectTemplate}
              aiGeneratedTemplates={aiGeneratedTemplates}
              setAiGeneratedTemplates={setAiGeneratedTemplates}
              onBackgroundGenerate={onBackgroundGenerate}
              generationType={generationType}
              setGenerationType={setGenerationType}
            />
          </div>
        </div>

        <div className="flex-1">
          {(showPatterns || generationType === 'pattern') && (
            <>
              <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="text-2xl mr-2">🎨</span>
                  {selectedCategory === 'patterns'
                    ? 'Select a Pattern Style'
                    : 'Choose a Pattern Design'}
                </h3>

                <p className="text-sm text-gray-600 mb-3">
                  Click on any pattern below to apply it to your badge
                  background. These patterns create a professional look.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {patternCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedPatternCategory(category.id)}
                      className={`px-3 py-2 text-sm rounded-full flex items-center transition-all ${
                        selectedPatternCategory === category.id
                          ? 'bg-[#065388] text-white font-medium shadow-md'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <span className="mr-1.5">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    onClick={() => handlePatternSelect(pattern)}
                    className="border p-3 rounded-lg cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 bg-white relative group"
                  >
                    <div className="flex justify-center items-center">
                      <div
                        id={`pattern-${pattern.id}`}
                        className="h-24 w-full rounded-md bg-gray-100 flex items-center justify-center overflow-hidden"
                        dangerouslySetInnerHTML={{
                          __html: jdenticon.toSvg(pattern.prompt, 100),
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-center font-medium mt-2">
                      {pattern.name}
                    </p>
                    <p className="text-xs text-center text-gray-500 mt-1">
                      {pattern.category}
                    </p>

                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                      <button className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transform scale-90 group-hover:scale-100 transition-all">
                        Apply Pattern
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredPatterns.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 mx-auto text-gray-400 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-500">
                    No patterns found in this category
                  </p>
                  <button
                    onClick={() => setSelectedPatternCategory('all')}
                    className="mt-2 text-blue-600 underline text-sm"
                  >
                    View all patterns
                  </button>
                </div>
              )}
            </>
          )}

          {!showPatterns && (
            <>
              <Alert
                severity="info"
                variant="outlined"
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    alignItems: 'flex-start',
                    pt: 1,
                  },
                }}
              >
                <AlertTitle
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  <FontAwesomeIcon
                    icon={faPalette}
                    style={{ marginRight: '8px' }}
                  />
                  Select a Template
                </AlertTitle>

                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Click on any design below to use it as your badge template.
                  Your selected template will have a blue highlight.
                  <Button
                    size="small"
                    onClick={() => setShowHelp(true)}
                    sx={{ ml: 1 }}
                  >
                    Need help?
                  </Button>
                </Typography>
              </Alert>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`border-2 p-4 rounded-lg cursor-pointer transition-all hover:shadow-lg transform hover:-translate-y-1 relative group ${
                      selectedTemplate === tmpl.id
                        ? 'border-[#065388] bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {selectedTemplate === tmpl.id && (
                      <div className="absolute -top-3 -right-3 bg-[#065388] text-white text-xs px-2 py-1 rounded-full shadow-md z-10">
                        Selected
                      </div>
                    )}

                    <div
                      className="h-36 rounded-md mb-3 overflow-hidden"
                      style={{
                        background: getTemplateBackground(tmpl.id),
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: getTemplateTextColor(tmpl.id),
                      }}
                    >
                      {tmpl.id.startsWith('ai_template_') && (
                        <div
                          className="flex items-center justify-center h-full text-center p-2 opacity-70"
                          style={{
                            color: getTemplateTextColor(tmpl.id),
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: '0.25rem',
                          }}
                        >
                          AI Generated
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-base">{tmpl.name}</p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          {tmpl.category}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {tmpl.id.startsWith('ai_template_') && (
                          <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded whitespace-nowrap">
                            <span className="mr-1">✨</span> AI
                          </span>
                        )}
                        {tmpl.category === 'security' && (
                          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded whitespace-nowrap">
                            <span className="mr-1">🔒</span> Secure
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`mt-3 transition-all ${
                        selectedTemplate === tmpl.id
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <button
                        className={`w-full py-1.5 rounded-md text-sm font-medium ${
                          selectedTemplate === tmpl.id
                            ? 'bg-green-600 text-white'
                            : 'bg-[#065388] text-white'
                        }`}
                      >
                        {selectedTemplate === tmpl.id
                          ? '✓ Selected'
                          : 'Select Template'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {filteredTemplates.length === 0 &&
            !showPatterns &&
            generationType !== 'pattern' && (
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  No templates found
                </h3>
                <p className="text-gray-500 mb-4">
                  There are no templates in this category yet.
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  View All Templates
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BadgeTemplates;
