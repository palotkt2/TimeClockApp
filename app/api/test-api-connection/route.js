import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// This API route allows testing the various API connections
export async function POST(request) {
  try {
    const { service } = await request.json();

    if (service === 'openai') {
      const result = await testOpenAIConnection();
      return NextResponse.json(result);
    }

    if (service === 'anthropic') {
      const result = await testAnthropicConnection();
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: `Unknown service: ${service}` },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error testing API connection:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Tests connection to the OpenAI API
 */
async function testOpenAIConnection() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: 'API key not found',
        tip: 'Make sure you have set OPENAI_API_KEY in your .env file',
      };
    }

    if (!apiKey.startsWith('sk-')) {
      return {
        success: false,
        error: 'Invalid API key format',
        tip: "API key must start with 'sk-'. Project keys (sk-proj-...) may not work with image generation.",
      };
    }

    const openai = new OpenAI({
      apiKey,
      timeout: 5000,
    });

    // Simple model list call to test connection
    try {
      const models = await openai.models.list();

      // Check if DALL-E models are available
      const hasDallE = models.data.some(
        (m) => m.id === 'dall-e-3' || m.id === 'dall-e-2'
      );

      return {
        success: true,
        message: 'Connection successful',
        modelCount: models.data.length,
        hasDallE: hasDallE,
        models: models.data.slice(0, 5).map((m) => m.id), // Just the first 5 for brevity
      };
    } catch (callError) {
      return {
        success: false,
        error: `API call failed: ${callError.message}`,
        status: callError.status,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unknown error',
      status: error.status,
    };
  }
}

/**
 * Tests connection to the Anthropic API
 */
async function testAnthropicConnection() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    const client = new Anthropic({
      apiKey,
    });

    // Simple message to test connection
    try {
      const message = await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        system: 'You are a helpful assistant.',
        messages: [{ role: 'user', content: 'Say hello' }],
      });

      return {
        success: true,
        message: 'Connection successful',
        response: message.content[0].text.substring(0, 20) + '...',
      };
    } catch (callError) {
      return {
        success: false,
        error: `API call failed: ${callError.message}`,
        status: callError.status,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unknown error',
      status: error.status,
    };
  }
}
