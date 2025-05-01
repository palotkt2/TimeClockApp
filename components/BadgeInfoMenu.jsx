import React, { useRef, useEffect, useState } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  SvgIcon,
  useMediaQuery,
  useTheme,
  IconButton,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom styled component for the active indicator
const ActiveIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  height: '100%',
  width: 4,
  backgroundColor: '#065388',
}));

// Scroll indicator arrows
const ScrollIndicator = ({ direction, onClick, visible }) => (
  <Fade in={visible}>
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        width: 28,
        height: 28,
        borderRadius: '50%',
        color: '#065388',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        },
        ...(direction === 'left' ? { left: 4 } : { right: 4 }),
      }}
    >
      <SvgIcon fontSize="small">
        <path
          fill="currentColor"
          d={
            direction === 'left'
              ? 'M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z'
              : 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'
          }
        />
      </SvgIcon>
    </IconButton>
  </Fade>
);

const BadgeInfoMenu = ({
  infoSections,
  activeInfoSection,
  setActiveInfoSection,
  isDrawerOpen,
  setIsDrawerOpen,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const listRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Check if scroll indicators should be shown
  useEffect(() => {
    if (isMobile && listRef.current) {
      const checkScrollIndicators = () => {
        const { scrollLeft, scrollWidth, clientWidth } = listRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // -5 for tolerance
      };

      checkScrollIndicators();
      listRef.current.addEventListener('scroll', checkScrollIndicators);
      return () =>
        listRef.current?.removeEventListener('scroll', checkScrollIndicators);
    }
  }, [isMobile]);

  // Scroll functions
  const scrollLeft = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: { xs: '100%', md: 256 },
        background: 'linear-gradient(to bottom right, #ffffff, #f9fafb)',
        p: isMobile ? 1 : 2,
        borderRadius: isMobile ? 1 : 2,
        border: '1px solid #f3f4f6',
        position: 'relative',
      }}
    >
      {isMobile && (
        <ScrollIndicator
          direction="left"
          onClick={scrollLeft}
          visible={showLeftArrow}
        />
      )}

      <List
        ref={listRef}
        sx={{
          p: 0,
          display: isMobile ? 'flex' : 'block',
          flexDirection: isMobile ? 'row' : 'column',
          flexWrap: isMobile ? 'nowrap' : 'initial',
          overflowX: isMobile ? 'auto' : 'visible',
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': { display: 'none' }, // Chrome
          msOverflowStyle: 'none', // IE/Edge
        }}
      >
        {infoSections.map((section) => (
          <ListItem
            key={section.id}
            disablePadding
            sx={{
              mb: isMobile ? 0 : 1,
              mr: isMobile ? 1 : 0,
              width: isMobile ? 'auto' : '100%',
              flexShrink: isMobile ? 0 : 1,
            }}
          >
            <ListItemButton
              onClick={() => {
                setActiveInfoSection(section.id);
                if (isDrawerOpen) {
                  setIsDrawerOpen(false);
                }
              }}
              selected={activeInfoSection === section.id}
              sx={{
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                py: isMobile ? 1.5 : 1.5,
                px: isMobile ? 2 : 2,
                minWidth: isMobile ? '90px' : 'auto',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: isMobile ? 'center' : 'flex-start',
                '&.Mui-selected': {
                  bgcolor: '#e6f0f9',
                  color: '#065388',
                },
                '&:hover': {
                  bgcolor:
                    activeInfoSection === section.id ? '#e6f0f9' : '#f1f5f9',
                },
                '&:active': {
                  bgcolor: '#d0e4f5',
                },
              }}
            >
              {activeInfoSection === section.id && <ActiveIndicator />}

              <ListItemIcon
                sx={{
                  minWidth: 'auto',
                  mr: isMobile ? 0 : 1.5,
                  mb: isMobile ? 0.5 : 0,
                  p: 1.2,
                  borderRadius: 1.5,
                  bgcolor:
                    activeInfoSection === section.id ? '#bbdefb' : '#f1f5f9',
                  color:
                    activeInfoSection === section.id ? '#1976d2' : '#64748b',
                }}
              >
                <SvgIcon fontSize="small">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={section.icon}
                  />
                </SvgIcon>
              </ListItemIcon>

              <ListItemText
                primary={section.name}
                primaryTypographyProps={{
                  fontWeight: 500,
                  color:
                    activeInfoSection === section.id ? '#065388' : 'inherit',
                  fontSize: isMobile ? '0.75rem' : 'inherit',
                  textAlign: isMobile ? 'center' : 'left',
                  lineHeight: isMobile ? 1.2 : 'inherit',
                }}
              />

              {/* Show star/chevron icons for both mobile and desktop */}
              {activeInfoSection === section.id ? (
                <SvgIcon
                  fontSize="small"
                  sx={{
                    color: '#065388',
                    position: isMobile ? 'absolute' : 'relative',
                    top: isMobile ? '8px' : 'auto',
                    right: isMobile ? '8px' : 'auto',
                  }}
                >
                  <path
                    fill="currentColor"
                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  />
                </SvgIcon>
              ) : (
                <SvgIcon
                  fontSize="small"
                  sx={{
                    color: '#94a3b8',
                    opacity: isMobile ? 0.7 : 0,
                    position: isMobile ? 'absolute' : 'relative',
                    top: isMobile ? '8px' : 'auto',
                    right: isMobile ? '8px' : 'auto',
                    '.MuiListItemButton-root:hover &': {
                      opacity: 1,
                    },
                  }}
                >
                  <path
                    fill="currentColor"
                    d="M13.59 5.59L18.17 10l-4.58 4.59L12 13l2.83-3-2.83-3 1.59-1.41zm-8 0L11.17 10l-5.58 4.59L4 13l2.83-3L4 7l1.59-1.41z"
                  />
                </SvgIcon>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {isMobile && (
        <ScrollIndicator
          direction="right"
          onClick={scrollRight}
          visible={showRightArrow}
        />
      )}
    </Paper>
  );
};

export default BadgeInfoMenu;
