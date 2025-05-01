import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { generateGradientDataUrl } from '../../../utils/freeImageGenerator';

// Función avanzada para mejorar prompts usando técnicas de ingeniería de prompts
function enhancePromptForBackground(originalPrompt) {
  let enhancedPrompt = originalPrompt.trim();

  const visualQualityDescriptors = [
    'stunning high definition',
    'premium professional quality',
    'cinematic quality',
    'crisp high resolution',
    'artistic 4K quality',
    'beautifully detailed',
    'exquisite high-end',
  ];

  const styleDescriptors = [
    'elegant abstract composition',
    'smooth sophisticated texture',
    'premium artistic backdrop',
    'clean modern design with perfect balance',
    'subtle harmonious pattern',
    'minimalist professional aesthetic',
    'soft focus artistic texture',
    'balanced visual composition',
  ];

  const randomVisualDesc =
    visualQualityDescriptors[
      Math.floor(Math.random() * visualQualityDescriptors.length)
    ];
  const randomStyleDesc =
    styleDescriptors[Math.floor(Math.random() * styleDescriptors.length)];

  const additionalKeywords = [
    'with perfect composition',
    'with balanced visual elements',
    'with sophisticated appearance',
    'with harmonious design elements',
    'with tasteful aesthetic',
    'with perfect visual balance',
  ];
  const randomAdditionalKeyword =
    additionalKeywords[Math.floor(Math.random() * additionalKeywords.length)];

  enhancedPrompt = `Generate a ${randomVisualDesc} ${randomStyleDesc} with ${enhancedPrompt} theme/colors ${randomAdditionalKeyword}. The image should be clean, professional and suitable as a background. No text, no logos, no watermarks, no busy elements.`;

  return enhancedPrompt;
}

// Función para generar sugerencias más contextuales y específicas
function generateSmartSuggestions(originalPrompt) {
  const colorTerms = [
    'blue',
    'red',
    'green',
    'yellow',
    'purple',
    'black',
    'white',
    'orange',
    'teal',
    'azul',
    'rojo',
    'verde',
    'amarillo',
    'morado',
    'negro',
    'blanco',
    'naranja',
  ];
  const styleTerms = [
    'abstract',
    'modern',
    'geometric',
    'minimalist',
    'professional',
    'corporate',
    'gradient',
    'abstracto',
    'moderno',
    'geométrico',
    'minimalista',
    'profesional',
    'corporativo',
    'degradado',
  ];
  const themeTerms = [
    'business',
    'education',
    'healthcare',
    'technology',
    'nature',
    'creative',
    'negocio',
    'educación',
    'salud',
    'tecnología',
    'naturaleza',
    'creativo',
  ];

  const hasColor = colorTerms.some((color) =>
    originalPrompt.toLowerCase().includes(color)
  );
  const hasStyle = styleTerms.some((style) =>
    originalPrompt.toLowerCase().includes(style)
  );
  const hasTheme = themeTerms.some((theme) =>
    originalPrompt.toLowerCase().includes(theme)
  );

  const suggestions = [];

  if (!hasColor) {
    if (
      originalPrompt.toLowerCase().includes('corporate') ||
      originalPrompt.toLowerCase().includes('business') ||
      originalPrompt.toLowerCase().includes('professional')
    ) {
      suggestions.push(
        `Try adding corporate colors: "${originalPrompt} with blue and gray tones"`
      );
    } else if (
      originalPrompt.toLowerCase().includes('creative') ||
      originalPrompt.toLowerCase().includes('artistic')
    ) {
      suggestions.push(
        `Try adding vibrant colors: "${originalPrompt} with purple and teal gradient"`
      );
    } else {
      suggestions.push(
        `Try adding colors: "${originalPrompt} with elegant color palette"`
      );
    }
  }

  if (!hasStyle) {
    suggestions.push(
      `Try specifying a style: "${originalPrompt} with modern abstract style"`
    );
    suggestions.push(
      `Try specifying a pattern: "${originalPrompt} with subtle geometric elements"`
    );
  }

  if (!hasTheme && !hasColor && !hasStyle) {
    suggestions.push(
      `Try being more specific: "Professional ${originalPrompt} background with blue gradients and subtle patterns"`
    );
  }

  suggestions.push(
    `Enhanced version: "${originalPrompt} with premium look, high quality background for credentials"`
  );

  return suggestions;
}

// Función actualizada para manejar generación de imágenes con Anthropic
async function generateImageWithAnthropic(prompt) {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (!anthropicApiKey) {
    console.log('No se encontró la API key de Anthropic');
    return null;
  }

  try {
    const client = new Anthropic({
      apiKey: anthropicApiKey,
    });

    console.log('Usando Claude para mejorar la descripción para DALL-E');
    const message = await client.messages.create({
      model: 'claude-3-opus-20240307',
      max_tokens: 1000,
      system:
        "You are a world-class image creation expert. Your task is to improve the user's prompt to generate a high-quality background image with OpenAI DALL-E. Enhance the prompt to be very detailed about style, colors, and mood. Focus on creating beautiful backgrounds without text, logos, or busy elements. Reply ONLY with the improved prompt, nothing else.",
      messages: [
        {
          role: 'user',
          content: `Please improve this background image prompt for DALL-E: "${prompt}"`,
        },
      ],
    });

    const enhancedPrompt = message.content[0].text.trim();
    console.log('Prompt mejorado por Claude:', enhancedPrompt);

    return {
      enhancedPrompt: enhancedPrompt,
      source: 'claude-enhanced',
    };
  } catch (error) {
    console.error('Error al usar Anthropic para mejorar el prompt:', error);
    console.error('Detalles del error:', error.message || error);
    return null;
  }
}

export async function POST(request) {
  let requestData = { prompt: '', type: 'image' };

  try {
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { prompt, type = 'image' } = requestData;

    if (!prompt) {
      return NextResponse.json(
        { message: 'A prompt is required to generate the image or gradient' },
        { status: 400 }
      );
    }

    if (type === 'gradient') {
      const imageUrl = generateGradientDataUrl(prompt);
      return NextResponse.json({
        imageUrl,
        source: 'custom-gradient',
        type: 'gradient',
      });
    }

    const suggestions = generateSmartSuggestions(prompt);

    let enhancedPrompt;
    try {
      const anthropicResult = await generateImageWithAnthropic(prompt);
      if (anthropicResult && anthropicResult.enhancedPrompt) {
        enhancedPrompt = anthropicResult.enhancedPrompt;
      } else {
        enhancedPrompt = enhancePromptForBackground(prompt);
      }
      console.log('Prompt mejorado:', enhancedPrompt);
    } catch (error) {
      console.error('Error al mejorar prompt con Anthropic:', error);
      enhancedPrompt = enhancePromptForBackground(prompt);
    }

    console.log('Generando imagen con OpenAI DALL-E...');

    const apiKey = process.env.OPENAI_API_KEY;

    // Verificar que la API key existe
    if (!apiKey || apiKey.trim() === '') {
      console.warn('API key de OpenAI no configurada o vacía');
      throw new Error('OpenAI API key no disponible');
    }

    // Actualización: validar tanto las keys estándar (sk-...) como las keys de proyecto (sk-proj-...)
    if (!apiKey.startsWith('sk-')) {
      console.warn(
        'API key de OpenAI con formato incorrecto (debe comenzar con sk-)'
      );
      throw new Error('OpenAI API key inválida - formato incorrecto');
    }

    try {
      // Modificación del cliente OpenAI para mejorar la detección de errores
      const openai = new OpenAI({
        apiKey,
        timeout: 60000,
        maxRetries: 2, // Reducimos los reintentos para evitar esperas largas en caso de errores de autenticación
        dangerouslyAllowBrowser: true, // Necesario para cliente-lado
      });

      // Registrar la conexión
      console.log('Intentando conectar con OpenAI API...');

      const models = ['dall-e-3', 'dall-e-2'];
      let imageUrl = null;
      let modelUsed = null;

      for (const model of models) {
        try {
          console.log(`Intentando generar imagen con modelo ${model}...`);
          const response = await openai.images.generate({
            model: model,
            prompt: enhancedPrompt,
            n: 1,
            size: model === 'dall-e-3' ? '1024x1024' : '1024x1024',
            quality: model === 'dall-e-3' ? 'hd' : 'standard',
            style: model === 'dall-e-3' ? 'natural' : undefined,
            response_format: 'url',
          });

          if (response?.data?.[0]?.url) {
            imageUrl = response.data[0].url;
            modelUsed = model;
            break;
          } else {
            console.warn(
              `Respuesta de ${model} no tiene el formato esperado:`,
              response
            );
            continue;
          }
        } catch (modelError) {
          const errorDetails = JSON.stringify(modelError, null, 2);
          console.error(`Error completo con modelo ${model}:`, errorDetails);

          if (modelError.status === 429) {
            console.error(
              `Error con modelo ${model}: Límite de tasa excedido. Espere unos minutos.`
            );
          } else if (modelError.status === 400) {
            console.error(
              `Error con modelo ${model}: Solicitud inválida - ${modelError.message}`
            );
          } else if (modelError.status === 401) {
            console.error(
              `Error con modelo ${model}: Error de autenticación - Verifique su API key`
            );
            console.error(
              'IMPORTANTE: Si está usando una API key de proyecto (sk-proj-...), necesita usar una key personal regular (sk-...)'
            );
            // En lugar de lanzar error, continuamos con el siguiente modelo o usaremos el fallback
          } else {
            console.error(
              `Error con modelo ${model}:`,
              modelError.message || modelError
            );
          }
          continue; // Probamos con el siguiente modelo
        }
      }

      if (imageUrl) {
        console.log(`Imagen generada exitosamente con ${modelUsed}`);
        return NextResponse.json({
          imageUrl,
          source: 'dall-e',
          model: modelUsed,
          type: 'image',
          message: `Imagen generada con OpenAI ${modelUsed}`,
          suggestions,
          originalPrompt: prompt,
          enhancedPrompt: enhancedPrompt,
        });
      } else {
        console.error('Todos los modelos de OpenAI fallaron');
        throw new Error(
          'No se pudo generar la imagen con ningún modelo de OpenAI'
        );
      }
    } catch (openaiError) {
      console.error('Error de OpenAI:', openaiError.message);
      console.error('Detalles completos del error:', openaiError);
      throw new Error('No se pudo generar la imagen con OpenAI');
    }
  } catch (error) {
    console.error('Error general al generar imagen:', error);

    const suggestions = [
      'Try specifying colors like "blue and teal professional gradient"',
      'Try adding a style like "modern corporate background with subtle patterns"',
      'Try describing a specific mood like "elegant professional backdrop with calm colors"',
    ];

    const originalPrompt = requestData?.prompt || 'blue professional';

    const colorExtract = originalPrompt.match(
      /blue|red|green|yellow|purple|orange|teal|violet|pink|gray|black|white/i
    );
    const baseColor = colorExtract ? colorExtract[0].toLowerCase() : 'blue';

    const gradientPrompt = `${baseColor} professional gradient`;

    return NextResponse.json({
      imageUrl: generateGradientDataUrl(gradientPrompt),
      source: 'emergency-gradient',
      type: 'gradient',
      isFallback: true,
      message:
        'Error en la generación de imagen con APIs. Usando gradiente básico personalizado.',
      suggestions,
      error:
        error.message ||
        'Error en la generación de imagen con APIs disponibles',
    });
  }
}
