'use client'; // Added directive to enable client-side rendering

import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// Import additional MUI components and icons
import { Box, Divider, Paper, Button, Chip, Grid } from '@mui/material';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import HighQualityIcon from '@mui/icons-material/HighQuality';
import EmailIcon from '@mui/icons-material/Email';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import PaymentIcon from '@mui/icons-material/Payment';

export default function HowItWorks() {
  const [expanded, setExpanded] = useState('panel1'); // Set initial state to 'panel1'

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen pt-10 pb-8 bg-white">
        <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>
          How it works
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          paragraph
          sx={{ mb: 4 }}
        >
          FAQ
        </Typography>
        <div className="flex justify-center items-start">
          <div className="w-full md:w-2/3 p-4">
            <Accordion
              expanded={expanded === 'panel1'}
              onChange={handleChange('panel1')}
              elevation={0}
              sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DesignServicesIcon sx={{ mr: 2 }} />
                  <Typography variant="h6">1. Approve a design</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid>
                    <Paper
                      elevation={1}
                      sx={{ p: 2, mb: 2, backgroundColor: 'background.paper' }}
                    >
                      <Typography variant="body1" paragraph>
                        Email your logo or artwork and our team will put
                        together a couple of custom demos with your information.
                        Choose from portrait or landscape layouts. Make any
                        revisions necessary to achieve the design that will suit
                        your needs.
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid>
                    <Box
                      sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}
                    >
                      <HighQualityIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          For Superior Quality Print:
                        </Typography>
                        <Typography variant="body1">
                          Consider sending your artwork at a high resolution
                          (300 dpi) in the following formats:
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            my: 1,
                          }}
                        >
                          <Chip label="JPG" color="primary" size="small" />
                          <Chip
                            label="BMP (Windows Bitmap)"
                            color="primary"
                            size="small"
                          />
                          <Chip label="EPS" color="primary" size="small" />
                          <Chip
                            label="PSD (Photoshop)"
                            color="primary"
                            size="small"
                          />
                          <Chip
                            label="AI (Illustrator)"
                            color="primary"
                            size="small"
                          />
                        </Box>
                        <Typography variant="body1">
                          If you don't have your artwork at a high resolution
                          you can email it and we can optimize it for better
                          results.
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid>
                    <Divider sx={{ my: 2 }} />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<EmailIcon />}
                        onClick={() =>
                          (window.location.href =
                            'mailto:info@fastidbadges.com')
                        }
                        sx={{ mt: 1 }}
                      >
                        Send logos to info@fastidbadges.com
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded === 'panel2'}
              onChange={handleChange('panel2')}
              elevation={0}
              sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhotoCameraIcon sx={{ mr: 2 }} />
                  <Typography variant="h6">
                    2. Email photos and information
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography>
                  Send all the information that the badges will contain such as
                  photos, names, titles etc.
                  <br />
                  <br />
                  Photos: Can be emailed as an attachment.
                  <br />
                  Quality and format: Any Digital Camera of 1.0 Megapixel and up
                  will take great pictures for your badges. If you use a modern
                  Digital Camera, take the pictures in a medium quality setting
                  so that the files created won't exceed 1 MB in size. Rotate
                  the camera in a 90° angle to get portrait type pictures. When
                  taking pictures try to use a white or light color background
                  and avoid using the zoom in the camera for better clarity.
                  <br />
                  <br />
                  Employee information: Information can be sent in a spreadsheet
                  or a text document. See examples below.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded === 'panel3'}
              onChange={handleChange('panel3')}
              elevation={0}
              sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ListAltIcon sx={{ mr: 2 }} />
                  <Typography variant="h6">3. Approve a draft</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography>
                  Once all the information is submitted we will generate final
                  proof of your order for review and approval. Sample proof.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded === 'panel4'}
              onChange={handleChange('panel4')}
              elevation={0}
              sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 2 }} />
                  <Typography variant="h6">Privacy</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography>
                  All information gathered on the web site, phone or email will
                  be only used to conduct business at your request. We don't
                  send unsolicited email, sell or share information with other
                  companies. Occasionally we will send you an email to announce
                  new products or price changes. All information collected
                  (photos, names etc.) will only be used to produce badges at
                  your request, it won't be used for any other sales or
                  marketing processes.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded === 'panel5'}
              onChange={handleChange('panel5')}
              elevation={0}
              sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PaymentIcon sx={{ mr: 2 }} />
                  <Typography variant="h6">Terms</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography>
                  Payment is required before your order is shipped. We accept
                  all major credit cards as well as PayPal, cashier's or company
                  check.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
}
