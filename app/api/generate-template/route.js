import { NextResponse } from 'next/server';
import { generateGradientDataUrl } from '../../../utils/freeImageGenerator';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { message: 'A prompt is required to generate the template' },
        { status: 400 }
      );
    }

    // Simple algorithm to generate template based on prompt keywords
    // This is a placeholder for actual AI-based template generation
    const templateData = {
      backgroundType: getBackgroundTypeFromPrompt(prompt),
      colors: getColorsFromPrompt(prompt),
    };

    // If background type is 'image', generate or fetch an image URL
    if (templateData.backgroundType === 'image') {
      // This could call the generate-image endpoint or another service
      // For now, we'll use a gradient as a placeholder
      templateData.imageUrl = generateGradientDataUrl(prompt);
    }

    return NextResponse.json(templateData);
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { message: 'Failed to generate template', error: error.message },
      { status: 500 }
    );
  }
}

// Helper functions to determine template properties based on prompt
function getBackgroundTypeFromPrompt(prompt) {
  const prompt_lower = prompt.toLowerCase();

  if (
    prompt_lower.includes('image') ||
    prompt_lower.includes('photo') ||
    prompt_lower.includes('picture')
  ) {
    return 'image';
  }

  if (prompt_lower.includes('gradient')) {
    return 'gradient';
  }

  if (prompt_lower.includes('pattern')) {
    return 'pattern';
  }

  // Default based on keywords
  return Math.random() > 0.5 ? 'color' : 'gradient';
}

function getColorsFromPrompt(prompt) {
  const prompt_lower = prompt.toLowerCase();

  // Color mapping based on keywords
  const colorMap = {
    corporate: { background: '#0066cc', text: '#ffffff' },
    business: { background: '#003366', text: '#ffffff' },
    professional: { background: '#004d99', text: '#ffffff' },
    school: { background: '#3366cc', text: '#ffffff' },
    education: { background: '#6633cc', text: '#ffffff' },
    conference: { background: '#ff7e5f', text: '#ffffff' },
    event: { background: '#fd746c', text: '#ffffff' },
    modern: { background: '#4776E6', text: '#ffffff' },
    hospital: { background: '#11998e', text: '#ffffff' },
    healthcare: { background: '#38ef7d', text: '#ffffff' },
    security: { background: '#333333', text: '#ffffff' },
    red: { background: '#cc0000', text: '#ffffff' },
    blue: { background: '#0066cc', text: '#ffffff' },
    green: { background: '#006633', text: '#ffffff' },
    yellow: { background: '#ffcc00', text: '#333333' },
    orange: { background: '#ff6600', text: '#ffffff' },
    purple: { background: '#660099', text: '#ffffff' },
    pink: { background: '#ff3399', text: '#ffffff' },
    black: { background: '#333333', text: '#ffffff' },
    dark: { background: '#222222', text: '#ffffff' },
    light: { background: '#f5f5f5', text: '#333333' },
    white: { background: '#ffffff', text: '#333333' },
  };

  // Find matching keywords
  for (const [keyword, colors] of Object.entries(colorMap)) {
    if (prompt_lower.includes(keyword)) {
      return colors;
    }
  }

  // Default colors if no keywords match
  return { background: '#065388', text: '#ffffff' };
}
