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

  // Function to get response from OpenAI
  const getAIResponse = async (userMessage) => {
    setIsTyping(true);
    setError(null);

    try {
      // Check if we're in question phase
      if (isQuestionPhase) {
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
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
          throw new Error('Error communicating with virtual assistant');
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        return data.response;
      }
    } catch (error) {
      setError(error.message);
      return 'Sorry, an error occurred processing your request. Please try again later.';
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
                p: 2,
                my: 2,
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
    // Pattern to match internal paths like "/badges" or external URLs
    const urlPattern = /(\/\w+)|(https?:\/\/[^\s]+)/g;

    if (!text) return text;

    // Split text by matched URLs
    const parts = text.split(urlPattern);

    // Match all URLs in the text
    const matches = text.match(urlPattern) || [];

    // If no URLs found, return the original text
    if (matches.length === 0) return text;

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
          result.push(
            <Link
              href={url}
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
              {url}
              <LinkIcon fontSize="small" />
            </Link>
          );
        } else {
          // External URL
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
            p: 2,
            maxWidth: '70%',
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
          <Typography variant="body1" component="div">
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
    <Tooltip title="Chat with our Virtual Assistant" placement="left">
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
            width: 60,
            height: 60,
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
              fontSize: 30,
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
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        {expanded ? (
          <Zoom in={expanded} timeout={300}>
            <Paper
              elevation={6}
              sx={{
                height: 500,
                width: { xs: 300, sm: 350, md: 400 },
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 4,
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                animation: 'slideIn 0.3s ease-out',
                '@keyframes slideIn': {
                  from: { transform: 'translateY(20px)', opacity: 0 },
                  to: { transform: 'translateY(0)', opacity: 1 },
                },
              }}
            >
              {/* Chat header */}
              <Box
                sx={{
                  p: 2,
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
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <CloseIcon />
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
                  p: 2,
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
                  p: 1.5,
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
                    sx: { borderRadius: 4 },
                  }}
                />
                <IconButton
                  color="primary"
                  type="submit"
                  disabled={inputMessage.trim() === '' || isTyping}
                  sx={{
                    p: '8px',
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
                  <SendIcon />
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
