import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Box } from '@mui/material';

const FAQSection = ({ faqs }) => {
  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        Frequently Asked Questions
      </Typography>

      {faqs.map((faq, index) => (
        <Accordion key={index} sx={{ mb: 1 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
          >
            <Typography sx={{ display: 'flex', alignItems: 'center' }}>
              <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} />
              {faq.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary">{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FAQSection;
