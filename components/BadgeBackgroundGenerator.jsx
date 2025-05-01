'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  FormLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import ColorizeIcon from '@mui/icons-material/Colorize';
import StyleIcon from '@mui/icons-material/Style';
import CategoryIcon from '@mui/icons-material/Category';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const steps = ['Purpose', 'Colors', 'Style', 'Elements'];

export default function BadgeBackgroundGenerator() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    purpose: '',
    colors: '',
    style: '',
    elements: '',
  });
  const [loading, setLoading] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState([]);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Generate badge background prompts',
          conversationPhase: 'final',
          previousAnswers: [
            formData.purpose,
            formData.colors,
            formData.style,
            formData.elements,
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompts');
      }

      const data = await response.json();

      // Extract prompts from the response using regex
      const promptRegex = /```([\s\S]*?)```/g;
      const extractedPrompts = [];
      let match;

      while ((match = promptRegex.exec(data.response)) !== null) {
        extractedPrompts.push(match[1].trim());
      }

      if (extractedPrompts.length === 0) {
        // If no code blocks found, treat the entire response as one prompt
        extractedPrompts.push(data.response.trim());
      }

      setGeneratedPrompts(extractedPrompts);
    } catch (err) {
      console.error('Error generating prompts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth>
            <FormLabel sx={{ mb: 1 }}>
              What type of badge are you creating?
            </FormLabel>
            <Select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              displayEmpty
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="" disabled>
                Select badge purpose
              </MenuItem>
              <MenuItem value="Professional company ID">
                Professional company ID
              </MenuItem>
              <MenuItem value="Creative studio badge">
                Creative studio badge
              </MenuItem>
              <MenuItem value="Special event badge">
                Special event badge
              </MenuItem>
              <MenuItem value="Conference badge">Conference badge</MenuItem>
              <MenuItem value="Membership card">Membership card</MenuItem>
              <MenuItem value="Access control badge">
                Access control badge
              </MenuItem>
            </Select>
          </FormControl>
        );
      case 1:
        return (
          <FormControl fullWidth>
            <FormLabel sx={{ mb: 1 }}>
              What colors would you like to use?
            </FormLabel>
            <TextField
              name="colors"
              value={formData.colors}
              onChange={handleChange}
              placeholder="E.g., Blue and white, Company brand colors (red and gray), etc."
              required
              multiline
              rows={2}
            />
          </FormControl>
        );
      case 2:
        return (
          <FormControl fullWidth>
            <FormLabel sx={{ mb: 1 }}>What style do you prefer?</FormLabel>
            <Select
              name="style"
              value={formData.style}
              onChange={handleChange}
              displayEmpty
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="" disabled>
                Select style preference
              </MenuItem>
              <MenuItem value="Minimal/clean design">
                Minimal/clean design
              </MenuItem>
              <MenuItem value="Abstract/artistic style">
                Abstract/artistic style
              </MenuItem>
              <MenuItem value="Themed/decorative approach">
                Themed/decorative approach
              </MenuItem>
              <MenuItem value="Corporate/professional look">
                Corporate/professional look
              </MenuItem>
              <MenuItem value="Modern/tech-inspired">
                Modern/tech-inspired
              </MenuItem>
              <MenuItem value="Classic/traditional style">
                Classic/traditional style
              </MenuItem>
            </Select>
          </FormControl>
        );
      case 3:
        return (
          <FormControl fullWidth>
            <FormLabel sx={{ mb: 1 }}>
              Any specific elements to include?
            </FormLabel>
            <TextField
              name="elements"
              value={formData.elements}
              onChange={handleChange}
              placeholder="E.g., Company logo, geometric patterns, nature elements, etc."
              multiline
              rows={2}
            />
          </FormControl>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="500">
        <AutoAwesomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Badge Background Generator
      </Typography>

      <Typography
        variant="body1"
        align="center"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Follow the steps below to create custom background prompts for your
        badges
      </Typography>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label, index) => {
              const stepProps = {};
              const labelProps = {};
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>

          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center' }}>
              {loading ? (
                <CircularProgress sx={{ my: 4 }} />
              ) : error ? (
                <Box sx={{ my: 4 }}>
                  <Typography color="error" gutterBottom>
                    {error}
                  </Typography>
                  <Button onClick={() => setActiveStep(0)} variant="outlined">
                    Start Over
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Your Custom Background Prompts
                  </Typography>

                  {generatedPrompts.length > 0 ? (
                    generatedPrompts.map((prompt, index) => (
                      <Paper
                        key={index}
                        elevation={1}
                        sx={{
                          p: 2,
                          mb: 2,
                          position: 'relative',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderLeftWidth: 4,
                          borderLeftColor: theme.palette.primary.main,
                        }}
                      >
                        <Typography variant="body1" sx={{ pr: 4 }}>
                          {prompt}
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<ContentCopyIcon />}
                          onClick={() => handleCopyPrompt(prompt)}
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                          }}
                        >
                          Copy
                        </Button>
                      </Paper>
                    ))
                  ) : (
                    <Typography>No prompts generated yet.</Typography>
                  )}

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 4,
                    }}
                  >
                    <Button onClick={() => setActiveStep(0)}>Start Over</Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      startIcon={<AutoAwesomeIcon />}
                    >
                      Regenerate Prompts
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <Box sx={{ mb: 4 }}>{renderStepContent(activeStep)}</Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={() => {
                      handleNext();
                      handleSubmit();
                    }}
                    startIcon={<AutoAwesomeIcon />}
                  >
                    Generate Prompts
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!formData[Object.keys(formData)[activeStep]]}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip
          icon={<CategoryIcon />}
          label={`Purpose: ${formData.purpose || 'Not set'}`}
        />
        <Chip
          icon={<ColorizeIcon />}
          label={`Colors: ${formData.colors ? 'Set' : 'Not set'}`}
        />
        <Chip
          icon={<StyleIcon />}
          label={`Style: ${formData.style || 'Not set'}`}
        />
      </Stack>

      <Typography variant="body2" color="text.secondary" align="center">
        These prompts can be used in our Badge Configurator to create unique
        badge backgrounds
      </Typography>
    </Box>
  );
}
