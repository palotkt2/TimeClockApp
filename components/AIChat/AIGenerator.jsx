import React, { useState } from 'react';
import {
  generateTemplate,
  generateImage,
} from '../../services/aiTemplateService';
import IdeaGenerator from '../IdeaGenerator';

const AIGenerator = ({
  onSelectTemplate,
  aiGeneratedTemplates,
  setAiGeneratedTemplates,
  onBackgroundGenerate,
  generationType,
  setGenerationType,
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [lastResponse, setLastResponse] = useState(null);
  const [showIdeaGenerator, setShowIdeaGenerator] = useState(false);

  const predefinedPrompts = [
    // Templates
    ...(generationType === 'template'
      ? [
          'Professional corporate badge with blue accents',
          'Colorful school ID card with mascot',
          'Simple conference badge with gradient background',
          'Modern tech event pass with geometric pattern',
          'Hospital staff ID with medical symbols',
          'University student card with campus theme',
          'Government employee ID with official style',
        ]
      : []),

    // Gradients
    ...(generationType === 'gradient'
      ? [
          'Blue corporate to navy gradient',
          'Vibrant purple to pink sunset colors',
          'Professional green to teal transition',
          'Warm orange to yellow gradient',
          'Cool blue to cyan professional look',
          'Deep red to burgundy elegant style',
        ]
      : []),

    // Patterns
    ...(generationType === 'pattern'
      ? [
          'Geometric blue corporate pattern',
          'Abstract tech lines with dots',
          'Subtle professional grid pattern',
          'Modern hexagon tech pattern',
          'Simple elegant stripe design',
          'Minimalist dot matrix pattern',
        ]
      : []),

    // Pictures
    ...(generationType === 'picture'
      ? [
          'Professional blue abstract background for corporate ID',
          'Modern tech background with subtle geometric shapes',
          'Clean minimal background with soft blue gradient',
          'Abstract corporate pattern with professional colors',
          'Elegant background with subtle waves and blue tones',
          'Professional ID card background with geometric elements',
          'Minimalist credential background with soft colors',
        ]
      : []),
  ];

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

  const updateToast = (id, message, type) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, message, type } : toast
      )
    );

    if (type !== 'error') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleGenerateTemplate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setSuggestions([]);

    try {
      const toastId = Math.random().toString(36).substring(2, 9);

      if (generationType === 'template') {
        showToast('Generating template...', 'info', toastId);
        const generatedTemplate = await generateTemplate(aiPrompt);
        setAiGeneratedTemplates((prev) => [...prev, generatedTemplate]);
        updateToast(toastId, 'Template created successfully!', 'success');

        if (onSelectTemplate) {
          setTimeout(() => {
            onSelectTemplate(generatedTemplate.id);
          }, 100);
        }
      } else if (generationType === 'picture') {
        updateToast(
          toastId,
          'Generating image background with OpenAI DALL-E...',
          'info'
        );
        try {
          const imageResponse = await generateImage(aiPrompt);
          if (imageResponse && imageResponse.imageUrl) {
            if (onBackgroundGenerate) {
              onBackgroundGenerate('image', imageResponse.imageUrl);
            }

            setLastResponse(imageResponse);

            if (
              imageResponse.suggestions &&
              imageResponse.suggestions.length > 0
            ) {
              setSuggestions(imageResponse.suggestions);
            }

            const sourceMessage =
              imageResponse.source === 'dall-e'
                ? 'Image background created successfully with OpenAI DALL-E!'
                : `Image background generated using ${imageResponse.source} (OpenAI DALL-E unavailable)`;

            updateToast(toastId, sourceMessage, 'success');
          } else {
            updateToast(
              toastId,
              'Error generating the image. Please try again.',
              'error'
            );
          }
        } catch (imageError) {
          console.error('Error in image generation:', imageError);
          updateToast(
            toastId,
            `Error generating image: ${imageError.message || 'API error'}`,
            'error'
          );
        }
      } else {
        let message = '';
        switch (generationType) {
          case 'gradient':
            message = 'Gradient background created successfully!';
            break;
          case 'pattern':
            message = 'Pattern background created successfully!';
            break;
          default:
            message = 'Background created successfully!';
        }

        if (onBackgroundGenerate) {
          onBackgroundGenerate(generationType, aiPrompt);
        }

        updateToast(toastId, message, 'success');
      }

      if (generationType !== 'picture' || suggestions.length === 0) {
        setAiPrompt('');
      }
    } catch (error) {
      console.error(`Failed to generate ${generationType}:`, error);
      showToast(
        `Error generating ${generationType}: ${
          error.message || 'Unknown error'
        }`,
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleIdeaGeneratorSubmit = (generatedPrompt) => {
    setAiPrompt(generatedPrompt);
    setShowIdeaGenerator(false);
  };

  return (
    <div className="mt-6 pt-4 border-t">
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

      <h3 className="font-semibold text-gray-700 mb-3">Generate with AI</h3>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-2">
          What do you want to generate?
        </label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => setGenerationType('template')}
            className={`px-3 py-2 text-xs rounded ${
              generationType === 'template'
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-100 border border-gray-300 text-gray-700'
            }`}
          >
            Template
          </button>
          <button
            onClick={() => setGenerationType('gradient')}
            className={`px-3 py-2 text-xs rounded ${
              generationType === 'gradient'
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-100 border border-gray-300 text-gray-700'
            }`}
          >
            Gradients
          </button>
          <button
            onClick={() => setGenerationType('pattern')}
            className={`px-3 py-2 text-xs rounded ${
              generationType === 'pattern'
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-100 border border-gray-300 text-gray-700'
            }`}
          >
            Patterns
          </button>
          <button
            onClick={() => setGenerationType('picture')}
            className={`px-3 py-2 text-xs rounded ${
              generationType === 'picture'
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-100 border border-gray-300 text-gray-700'
            }`}
          >
            Pictures
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">Predefined prompts:</p>
            <button
              onClick={() => setShowIdeaGenerator(!showIdeaGenerator)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {showIdeaGenerator ? 'Hide idea generator' : 'Need ideas?'}
            </button>
          </div>

          {showIdeaGenerator ? (
            <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100">
              <IdeaGenerator
                generationType={generationType}
                onSubmit={handleIdeaGeneratorSubmit}
                onClose={() => setShowIdeaGenerator(false)}
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-1 mb-3">
              {predefinedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setAiPrompt(prompt)}
                  className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded mb-1"
                >
                  {prompt.length > 20
                    ? prompt.substring(0, 20) + '...'
                    : prompt}
                </button>
              ))}
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Suggestions to improve the image:
            </p>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setAiPrompt(
                      suggestion
                        .replace('Try adding a color: "', '')
                        .replace('Try specifying a style: "', '')
                        .replace('Try being more specific: "', '')
                        .replace('"', '')
                    )
                  }
                  className="text-xs px-2 py-1 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded mb-1"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            {lastResponse?.enhancedPrompt && (
              <p className="text-xs text-blue-700 mt-2">
                <strong>Prompt used:</strong> {lastResponse.enhancedPrompt}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {generationType === 'template'
              ? 'Describe your template:'
              : generationType === 'gradient'
              ? 'Describe the colors:'
              : generationType === 'pattern'
              ? 'Describe the pattern style:'
              : 'Describe the image for OpenAI DALL-E:'}
          </label>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={
              generationType === 'template'
                ? 'Describe the badge template you want...'
                : generationType === 'gradient'
                ? 'E.g., Blue corporate to turquoise gradient'
                : generationType === 'pattern'
                ? 'E.g., Geometric pattern with blue shapes'
                : 'E.g., Professional blue background with abstract shapes'
            }
            className="w-full text-sm p-2 border rounded resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={handleGenerateTemplate}
          disabled={isGenerating || !aiPrompt.trim()}
          className={`w-full py-2 rounded text-white transition ${
            isGenerating || !aiPrompt.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : generationType === 'picture'
              ? 'bg-purple-700 hover:bg-purple-800'
              : 'bg-[#065388] hover:bg-[#054377]'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {generationType === 'picture'
                ? 'Generating background with OpenAI...'
                : 'Generating...'}
            </span>
          ) : (
            `Generate ${
              generationType === 'template'
                ? 'Template'
                : generationType === 'gradient'
                ? 'Gradient'
                : generationType === 'pattern'
                ? 'Pattern'
                : 'Picture with OpenAI'
            }`
          )}
        </button>

        {aiGeneratedTemplates.length > 0 && generationType === 'template' && (
          <div className="mt-3">
            <button
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to delete all AI generated templates?'
                  )
                ) {
                  setAiGeneratedTemplates([]);
                  localStorage.removeItem('aiGeneratedTemplates');
                }
              }}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Clear all AI templates
            </button>
          </div>
        )}

        {generationType === 'picture' && (
          <div className="text-xs text-gray-500 mt-2">
            <p>
              The generated images are optimized to be used as{' '}
              <strong>backgrounds</strong> for credentials. For best results:
            </p>
            <ul className="list-disc ml-4 mt-1 space-y-1">
              <li>Describe colors, patterns, or styles</li>
              <li>Avoid mentioning texts, logos, or complex shapes</li>
              <li>Be specific with the style: abstract, modern, etc.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGenerator;
