'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Alert,
  Collapse,
  Zoom,
  Tooltip,
  Badge,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

const AIChat = () => {
  // Storage key for session persistence
  const STORAGE_KEY = 'miller_square_chat_history';

  // Add state for initial animation
  const [isAnimating, setIsAnimating] = React.useState(true);

  // Add state for question gathering phase
  const [isQuestionPhase, setIsQuestionPhase] = React.useState(false);
  const [questionCount, setQuestionCount] = React.useState(0);
  const [questionAnswers, setQuestionAnswers] = React.useState([]);
  const [askedQuestions, setAskedQuestions] = React.useState([]);

  // Add state for background workflow specifically
  const [backgroundWorkflow, setBackgroundWorkflow] = React.useState({
    active: false,
    phase: 0, // 0: purpose, 1: colors, 2: style, 3: elements, 4: final
    answers: [],
  });

  // Add state for tooltip visibility
  const [showTooltip, setShowTooltip] = React.useState(true);

  // Function to safely access sessionStorage (handles disabled storage)
  const safeSessionStorage = {
    getItem: (key) => {
      try {
        return sessionStorage.getItem(key);
      } catch (error) {
        console.warn('Session storage is not available:', error);
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        sessionStorage.setItem(key, value);
      } catch (error) {
        console.warn('Failed to save to session storage:', error);
      }
    },
  };

  // Get stored messages or use default welcome message
  const getStoredMessages = () => {
    const storedData = safeSessionStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.warn('Failed to parse stored chat data');
      }
    }

    // Default welcome message - badge-sales oriented
    return [
      {
        id: 1,
        text: "Hello! I'm the Miller Square badge expert. Looking for custom ID badges, event credentials, or badge accessories? I'm here to help you create the perfect identification solution for your needs!",
        sender: 'ai',
      },
    ];
  };

  const [messages, setMessages] = React.useState(getStoredMessages);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [expanded, setExpanded] = React.useState(false);
  const chatContainerRef = React.useRef(null);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    safeSessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Control the initial animation duration
  useEffect(() => {
    // Stop animation after 10 seconds
    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 10000);

    // Clean up timer on unmount
    return () => clearTimeout(animationTimer);
  }, []);

  // Add tooltip timer effect
  useEffect(() => {
    // Hide tooltip after 10 seconds
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 10000);

    // Clean up timer on unmount
    return () => clearTimeout(tooltipTimer);
  }, []);

  // Function to toggle widget expansion
  const toggleChat = () => {
    setExpanded((prev) => !prev);
    // If expanding, scroll to bottom after a brief delay to ensure rendering
    if (!expanded) {
      setTimeout(scrollToBottom, 300);
    }
  };

  // Function to scroll to the last message
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // Function to generate non-repetitive questions based on context
  const generateQuestion = (userMessage) => {
    // Pool of possible questions to ask - ID badge vendor oriented
    const questionPool = [
      'What type of badges are you looking for? (ID cards, event badges, access cards, etc.)',
      'How many badges do you need for your order?',
      'Do you need any special features like magnetic strips, RFID, or QR codes?',
      'Will these badges include photos or just names and basic information?',
      'Are you looking for a specific material like plastic, PVC, or metal?',
      'Do you need accessories like lanyards, badge reels, or holders?',
      'What information needs to appear on the badges?',
      'Do you have a specific timeline for when you need these badges?',
    ];

    // Filter out already asked questions
    const availableQuestions = questionPool.filter(
      (q) => !askedQuestions.includes(q)
    );

    // If we've exhausted our question pool, reset
    if (availableQuestions.length === 0) {
      return "Is there anything else you'd like to add before I suggest the best badge solution for you?";
    }

    // Select a random question from available options
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];

    // Track this question so we don't repeat it
    setAskedQuestions((prev) => [...prev, selectedQuestion]);

    return selectedQuestion;
  };

  // Enhanced function to detect background prompt requests
  const isBackgroundPromptRequest = (text) => {
    const backgroundKeywords = [
      'background',
      'backdrop',
      'design prompt',
      'background prompt',
      'badge background',
      'generate background',
      'create background',
      'background design',
      'background ideas',
      'background suggestions',
    ];

    const lowercaseText = text.toLowerCase();
    return backgroundKeywords.some((keyword) =>
      lowercaseText.includes(keyword)
    );
  };

  // Function to detect off-topic queries
  const isOffTopic = (message) => {
    // List of badge/company related keywords
    const relevantKeywords = [
      'badge',
      'badges',
      'id',
      'card',
      'cards',
      'credential',
      'credentials',
      'design',
      'background',
      'accessory',
      'accessories',
      'lanyard',
      'lanyards',
      'holder',
      'holders',
      'miller square',
      'millersquare',
      'order',
      'delivery',
      'shipping',
      'price',
      'cost',
      'material',
      'plastic',
      'metal',
      'discount',
      // Ampliar palabras clave relacionadas con fotos y datos personales
      'photo',
      'photos',
      'photograph',
      'picture',
      'pictures',
      'image',
      'images',
      'portrait',
      'headshot',
      'camera',
      'snapshot',
      // Datos personales para tarjetas
      'name',
      'names',
      'id card',
      'id cards',
      'identification',
      'identity',
      'personal data',
      'personal info',
      'personal information',
      'employee photo',
      'profile picture',
      'face',
      'facial',
      // Otras palabras clave existentes
      'logo',
      'print',
      'printing',
      'custom',
      'event',
      'conference',
      'company',
      'employee',
      'corporate',
      'school',
      'student',
      'faculty',
      'security',
      'access',
      'layout',
      'template',
      'magnetic',
      'stripe',
      'rfid',
      'qr',
      'barcode',
      'return',
      'policy',
      'contact',
      'help',
      'support',
      'question',
      'timeline',
    ];

    const lowercaseMsg = message.toLowerCase();

    // Check if message contains any relevant keywords
    const isRelevant = relevantKeywords.some((keyword) =>
      lowercaseMsg.includes(keyword)
    );

    // If message is very short, give it the benefit of the doubt
    if (message.length < 15) return false;

    // If message is lengthy and has no relevant keywords, likely off-topic
    return !isRelevant && message.length > 60;
  };

  // Function to get response from AI - updated for topic restriction
  const getAIResponse = async (userMessage) => {
    setIsTyping(true);
    setError(null);

    try {
      // Check if message appears to be off-topic
      if (isOffTopic(userMessage)) {
        return "I'm sorry, I can only answer questions related to our badge services, credentials, and identification products. How can I help you with our products or services?";
      }

      // Handle background workflow if active or if this is a request to start it
      if (backgroundWorkflow.active) {
        // Add answer to our collection
        const updatedAnswers = [...backgroundWorkflow.answers, userMessage];
        const currentPhase = backgroundWorkflow.phase;

        // Move to next phase
        const nextPhase = currentPhase + 1;
        setBackgroundWorkflow({
          active: nextPhase < 4, // End at phase 4 (final)
          phase: nextPhase,
          answers: updatedAnswers,
        });

        // If we've reached the final phase, generate prompts
        if (nextPhase >= 4) {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: userMessage,
              conversationPhase: 'final',
              previousAnswers: updatedAnswers,
            }),
          });

          if (!response.ok) {
            throw new Error('Error communicating with virtual assistant');
          }

          const data = await response.json();
          return data.response;
        } else {
          // Continue with next question
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: userMessage,
              conversationPhase: nextPhase,
              previousAnswers: updatedAnswers,
            }),
          });

          if (!response.ok) {
            throw new Error('Error communicating with virtual assistant');
          }

          const data = await response.json();
          return data.response;
        }
      } else if (isBackgroundPromptRequest(userMessage)) {
        // Start the background workflow
        setBackgroundWorkflow({
          active: true,
          phase: 0,
          answers: [],
        });

        // Ask the first question about purpose
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `The user wants help creating a badge background: "${userMessage}". Start the Background Prompt Generator Workflow by asking about the badge purpose.`,
          }),
        });

        if (!response.ok) {
          throw new Error('Error communicating with virtual assistant');
        }

        const data = await response.json();
        return data.response;
      } else if (isQuestionPhase) {
        // Store user's answer
        setQuestionAnswers((prev) => [...prev, userMessage]);

        // Increment question count
        const newCount = questionCount + 1;
        setQuestionCount(newCount);

        // Check if we've asked all 3 questions
        if (newCount >= 3) {
          // Exit question phase and generate final prompt
          setIsQuestionPhase(false);

          // Compile all answers to generate the final prompt
          const compiledInfo =
            questionAnswers.join('\n\n') + '\n\n' + userMessage;

          // Send the complete context to the API for prompt generation
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: compiledInfo,
              generatePrompt: true,
            }),
          });

          if (!response.ok) {
            throw new Error('Error communicating with virtual assistant');
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          // Reset for future interactions
          setQuestionCount(0);
          setQuestionAnswers([]);
          setAskedQuestions([]);

          return `Based on your requirements, here's my badge recommendation:\n\n\`\`\`${data.response}\`\`\``;
        } else {
          // Ask the next question
          return generateQuestion(userMessage);
        }
      } else {
        // Regular message flow - check if this is a request for a badge recommendation
        if (
          userMessage.toLowerCase().includes('suggestion') ||
          userMessage.toLowerCase().includes('prompt') ||
          userMessage.toLowerCase().includes('help with') ||
          userMessage.toLowerCase().includes('recommend') ||
          userMessage.toLowerCase().includes('badge design') ||
          userMessage.toLowerCase().includes('custom badge') ||
          userMessage.toLowerCase().includes('create a badge')
        ) {
          // Enter question phase
          setIsQuestionPhase(true);
          setQuestionCount(0);
          setQuestionAnswers([]);
          setAskedQuestions([]);

          // Ask first question
          return (
            "I'd be happy to help you find the perfect badge solution. To give you the best recommendation, I need a bit of information. " +
            generateQuestion(userMessage)
          );
        }

        // Regular chat response
        console.log(
          'Sending message to chat API:',
          userMessage.substring(0, 50) + '...'
        );

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            forceOnTopic: true, // Signal to API to stay on topic
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response from API:', response.status, errorData);
          throw new Error(
            errorData.error || `Server error: ${response.status}`
          );
        }

        const data = await response.json();

        if (data.error) {
          console.error('Error in API response:', data.error);
          throw new Error(data.error);
        }

        if (!data.response || typeof data.response !== 'string') {
          console.error('Invalid response format:', data);
          throw new Error('Received invalid response format from the server');
        }

        return data.response;
      }
    } catch (error) {
      console.error('Chat error details:', error);
      setError(error.message || 'An unexpected error occurred');
      return 'Sorry, I encountered a problem while processing your request. Please try asking in a different way or try again later.';
    } finally {
      setIsTyping(false);
    }
  };

  // Handle message sending
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (inputMessage.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
    };

    setMessages((prevMessages) => {
      const newMessages = [...prevMessages, userMessage];
      // Use setTimeout to ensure the DOM updates before scrolling
      setTimeout(scrollToBottom, 0);
      return newMessages;
    });
    setInputMessage('');

    // Get AI response
    const aiResponseText = await getAIResponse(inputMessage);

    // Add AI response
    const aiMessage = {
      id: messages.length + 2,
      text: aiResponseText,
      sender: 'ai',
    };

    setMessages((prevMessages) => {
      const newMessages = [...prevMessages, aiMessage];
      // Use setTimeout to ensure the DOM updates before scrolling
      setTimeout(scrollToBottom, 0);
      return newMessages;
    });
  };

  // Function to handle code blocks for prompt suggestions
  const formatCodeBlock = (text) => {
    // Find code blocks with backticks
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const hasCodeBlocks = codeBlockRegex.test(text);

    if (!hasCodeBlocks) {
      return text;
    }

    // Reset regex lastIndex
    codeBlockRegex.lastIndex = 0;

    // Replace code blocks with styled divs
    let result = text;
    let match;
    let blocks = [];
    let lastIndex = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        blocks.push(text.substring(lastIndex, match.index));
      }

      // Extract code content
      const codeContent = match[1].trim();

      // Add styled code block
      blocks.push(`<div class="code-block">${codeContent}</div>`);

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastIndex < text.length) {
      blocks.push(text.substring(lastIndex));
    }

    return blocks.join('');
  };

  // Function to convert message content to display format (including images and links)
  const formatMessageContent = (text) => {
    if (!text) return text;

    // First format any code blocks for prompts
    const textWithFormattedCodeBlocks = formatCodeBlock(text);

    // Check for special image marker in the text
    const imagePattern = /\[IMAGE:(\/images\/[^\]]+)\]/g;
    const hasImages = imagePattern.test(textWithFormattedCodeBlocks);

    // Reset regex lastIndex to start fresh
    imagePattern.lastIndex = 0;

    // If there are no images, just handle normal URLs and code blocks
    if (!hasImages) {
      // Look for code block divs
      const codeBlockPattern = /<div class="code-block">([\s\S]*?)<\/div>/g;

      if (!textWithFormattedCodeBlocks.includes('<div class="code-block">')) {
        // No code blocks or images, just handle URLs
        return convertUrlsToLinks(textWithFormattedCodeBlocks);
      }

      // Handle text with code blocks
      const parts = [];
      const sections = textWithFormattedCodeBlocks.split(
        /<div class="code-block">|<\/div>/
      );

      sections.forEach((section, i) => {
        if (!section) return;

        if (i % 2 === 0) {
          // Regular text section
          parts.push(
            <Typography key={`text-${i}`} component="span">
              {convertUrlsToLinks(section)}
            </Typography>
          );
        } else {
          // Code block section
          parts.push(
            <Box
              key={`prompt-${i}`}
              sx={{
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                borderRadius: '4px',
                p: { xs: 1.5, sm: 2 },
                my: 1.5,
                width: '100%',
                position: 'relative',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.12)',
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Recommended Badge Solution:
              </Typography>

              <Typography
                variant="body1"
                fontFamily="'Courier New', monospace"
                fontWeight="500"
                sx={{
                  fontSize: '14px',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}
              >
                {section}
              </Typography>

              <IconButton
                size="small"
                onClick={() => navigator.clipboard.writeText(section)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  opacity: 0.6,
                  '&:hover': { opacity: 1 },
                }}
                title="Copy prompt"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        }
      });

      return parts;
    }

    // If we have images, handle both images and URLs
    const parts = [];
    let lastIndex = 0;
    let match;

    // Find all image markers
    while ((match = imagePattern.exec(textWithFormattedCodeBlocks)) !== null) {
      // Add text before the image
      if (match.index > lastIndex) {
        const beforeText = textWithFormattedCodeBlocks.substring(
          lastIndex,
          match.index
        );
        parts.push(
          <Typography key={`text-${lastIndex}`} component="span">
            {convertUrlsToLinks(beforeText)}
          </Typography>
        );
      }

      // Add the image
      const imagePath = match[1]; // This is the captured image path
      parts.push(
        <Box
          key={`img-${match.index}`}
          sx={{
            my: 2,
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Image
            src={imagePath}
            alt="Product"
            width={250}
            height={180}
            style={{ objectFit: 'cover' }}
          />
        </Box>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last image
    if (lastIndex < textWithFormattedCodeBlocks.length) {
      const remainingText = textWithFormattedCodeBlocks.substring(lastIndex);
      parts.push(
        <Typography key={`text-end`} component="span">
          {convertUrlsToLinks(remainingText)}
        </Typography>
      );
    }

    return parts;
  };

  // Function to convert URLs in text to clickable links
  const convertUrlsToLinks = (text) => {
    if (!text) return text;

    // Pattern to match internal paths like "/badges" or external URLs
    const urlPattern = /(\/[\w-]+(?:\/[\w-]+)*)|(https?:\/\/[^\s]+)/g;

    // Split text by matched URLs
    const parts = text.split(urlPattern);

    // Match all URLs in the text
    const matches = text.match(urlPattern) || [];

    // If no URLs found, return the original text
    if (matches.length === 0) return text;

    // Track paths we've already seen to avoid duplicates
    const seenPaths = new Set();

    // Build result with links
    const result = [];
    let matchIndex = 0;

    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        result.push(<span key={`text-${i}`}>{parts[i]}</span>);
      }

      if (matchIndex < matches.length) {
        const url = matches[matchIndex];
        matchIndex++;

        // Check if it's an internal path (starts with "/")
        if (url.startsWith('/')) {
          // Get path segments
          const segments = url.split('/').filter(Boolean);

          // Remove duplicate segments (especially important for "/badges/badges" cases)
          const uniqueSegments = [];
          segments.forEach((segment) => {
            // Only add if this segment hasn't appeared yet or it's not 'badges'
            if (!uniqueSegments.includes(segment) || segment !== 'badges') {
              uniqueSegments.push(segment);
            }
          });

          // Rebuild clean path
          const cleanPath = '/' + uniqueSegments.join('/');

          // For display text, use just the main path
          const displayPath = '/' + uniqueSegments[0];

          // Only add the link if we haven't seen this display path before
          if (!seenPaths.has(displayPath)) {
            seenPaths.add(displayPath);

            result.push(
              <Link
                href={cleanPath}
                key={`link-${i}`}
                style={{
                  color: '#1976d2',
                  textDecoration: 'underline',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                {displayPath}
                <LinkIcon fontSize="small" />
              </Link>
            );
          }
        } else {
          // External URL - no change needed
          result.push(
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              key={`link-${i}`}
              style={{
                color: '#1976d2',
                textDecoration: 'underline',
              }}
            >
              {url}
            </a>
          );
        }
      }
    }

    return result;
  };

  // Individual message component
  const MessageItem = ({ message }) => {
    const isUser = message.sender === 'user';

    React.useLayoutEffect(() => {
      scrollToBottom();
    }, []);

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2,
          mx: 1,
        }}
      >
        {!isUser && (
          <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
            <SmartToyIcon />
          </Avatar>
        )}

        <Paper
          elevation={1}
          sx={{
            p: { xs: 1.5, sm: 2 },
            maxWidth: { xs: '85%', sm: '80%' },
            bgcolor: isUser ? 'primary.main' : 'grey.100',
            color: isUser ? 'white' : 'text.primary',
            borderTopRightRadius: isUser ? 0 : 16,
            borderTopLeftRadius: isUser ? 16 : 0,
            position: 'relative',
            '&::after': isUser
              ? {
                  content: '""',
                  position: 'absolute',
                  right: -10,
                  top: 0,
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: '0 0 10px 10px',
                  borderColor: `transparent transparent ${theme.palette.primary.main} transparent`,
                  transform: 'rotate(0deg)',
                }
              : {},
          }}
        >
          <Typography
            variant="body1"
            component="div"
            sx={{
              lineHeight: { xs: 1.4, sm: 1.5 },
              fontSize: { xs: '15px', sm: '16px' },
            }}
          >
            {isUser ? message.text : formatMessageContent(message.text)}
          </Typography>
        </Paper>

        {isUser && (
          <Avatar sx={{ bgcolor: 'secondary.main', ml: 1 }}>
            <PersonIcon />
          </Avatar>
        )}
      </Box>
    );
  };

  const TypingIndicator = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, mt: 1 }}>
      <Chip
        icon={<SmartToyIcon fontSize="small" />}
        label="Typing..."
        variant="outlined"
        color="primary"
        size="small"
        sx={{
          px: 1,
          animation: 'pulse 1.5s infinite',
          '@keyframes pulse': {
            '0%, 100%': {
              opacity: 1,
            },
            '50%': {
              opacity: 0.5,
            },
          },
        }}
      />
    </Box>
  );

  // Collapsed chat bubble widget
  const CollapsedChatWidget = () => (
    <Box sx={{ position: 'relative' }}>
      <Tooltip
        title="Help"
        placement="left"
        arrow
        open={showTooltip}
        PopperProps={{
          sx: {
            '& .MuiTooltip-tooltip': {
              backgroundColor: '#ff6d00', // Vibrant orange color
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              padding: '8px 12px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            },
            '& .MuiTooltip-arrow': {
              color: '#ff6d00', // Match arrow color with background
            },
          },
        }}
      >
        <Badge
          badgeContent={messages.length - 1 > 0 ? messages.length - 1 : 0}
          color="error"
          overlap="circular"
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Avatar
            sx={{
              width: { xs: 70, sm: 60 },
              height: { xs: 70, sm: 60 },
              bgcolor: 'primary.main',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 6px 14px rgba(0,0,0,0.4)',
              },
              ...(isAnimating && {
                animation:
                  'chatPulse 2s infinite ease-in-out, chatBounce 1s 5 alternate ease-in-out',
                '@keyframes chatPulse': {
                  '0%': { boxShadow: '0 4px 10px rgba(0,0,0,0.3)' },
                  '50%': { boxShadow: '0 4px 20px rgba(25, 118, 210, 0.6)' },
                  '100%': { boxShadow: '0 4px 10px rgba(0,0,0,0.3)' },
                },
                '@keyframes chatBounce': {
                  '0%': { transform: 'translateY(0)' },
                  '100%': { transform: 'translateY(-10px)' },
                },
              }),
            }}
            onClick={toggleChat}
          >
            <ChatIcon
              sx={{
                fontSize: { xs: 40, sm: 35 },
                color: 'white',
                ...(isAnimating && {
                  animation: 'iconPulse 1s infinite alternate',
                  '@keyframes iconPulse': {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.2)' },
                  },
                }),
              }}
            />
          </Avatar>
        </Badge>
      </Tooltip>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: '10px', sm: '15px' },
          right: { xs: '5px', sm: '10px' },
          zIndex: 1000,
        }}
      >
        {expanded ? (
          <Zoom in={expanded} timeout={300}>
            <Paper
              elevation={6}
              sx={{
                height: { xs: 'calc(75vh)', sm: 500 },
                width: { xs: 'calc(100vw - 20px)', sm: 350, md: 400 },
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: { xs: '16px 16px 0 0', sm: 4 },
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                animation: 'slideIn 0.3s ease-out',
                position: { xs: 'fixed', sm: 'static' },
                bottom: { xs: 0, sm: 'auto' },
                right: { xs: '10px', sm: 'auto' },
                '@keyframes slideIn': {
                  from: { transform: 'translateY(20px)', opacity: 0 },
                  to: { transform: 'translateY(0)', opacity: 1 },
                },
              }}
            >
              {/* Chat header */}
              <Box
                sx={{
                  p: { xs: 2.5, sm: 2 },
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{ bgcolor: 'white', color: 'primary.main', mr: 2 }}
                  >
                    <SmartToyIcon />
                  </Avatar>
                  <Typography variant="h6">Virtual Assistant</Typography>
                </Box>
                <IconButton
                  color="inherit"
                  onClick={toggleChat}
                  size="medium"
                  sx={{ ml: 1, p: { xs: 1.5, sm: 1 } }}
                >
                  <CloseIcon fontSize="medium" />
                </IconButton>
              </Box>

              {/* Error Alert */}
              <Collapse in={!!error}>
                <Alert
                  severity="error"
                  action={
                    <IconButton
                      aria-label="close"
                      color="inherit"
                      size="small"
                      onClick={() => setError(null)}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  }
                  sx={{ mb: 0 }}
                >
                  {error}
                </Alert>
              </Collapse>

              {/* Message container */}
              <Box
                ref={chatContainerRef}
                sx={{
                  flex: 1,
                  p: { xs: 1.5, sm: 2 },
                  overflowY: 'auto',
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {messages.map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}

                {/* Typing indicator */}
                {isTyping && <TypingIndicator />}
              </Box>

              {/* Message input form */}
              <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                  p: { xs: 2, sm: 1.5 },
                  bgcolor: 'background.paper',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your message here..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  size="small"
                  sx={{ mr: 1 }}
                  InputProps={{
                    sx: {
                      borderRadius: 4,
                      fontSize: { xs: '16px', sm: 'inherit' },
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  type="submit"
                  disabled={inputMessage.trim() === '' || isTyping}
                  sx={{
                    p: { xs: '10px', sm: '8px' },
                    bgcolor:
                      inputMessage.trim() === '' || isTyping
                        ? 'grey.300'
                        : 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor:
                        inputMessage.trim() === '' || isTyping
                          ? 'grey.300'
                          : 'primary.dark',
                    },
                  }}
                >
                  <SendIcon
                    fontSize={window.innerWidth <= 600 ? 'medium' : 'default'}
                  />
                </IconButton>
              </Box>
            </Paper>
          </Zoom>
        ) : (
          <CollapsedChatWidget />
        )}
      </Box>
    </ThemeProvider>
  );
};

export default AIChat;
