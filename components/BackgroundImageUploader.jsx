import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { generateBackgroundImage } from '../services/imageGenerationService';
import { generatePattern } from '../utils/patternGenerator';
// Add a fallback import for client-side
import dynamic from 'next/dynamic';

// Dynamically import the client pattern generator with no SSR
const ClientPatternGenerator = dynamic(
  () =>
    import('../utils/clientPatternGenerator').then((mod) => ({
      default: mod.generatePattern,
    })),
  { ssr: false }
);

const BackgroundImageUploader = ({
  backgroundType,
  setBackgroundType,
  backgroundColor,
  setBackgroundColor,
  backgroundGradient,
  setBackgroundGradient,
  backgroundImage,
  setBackgroundImage,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [gradientPrompt, setGradientPrompt] = useState('');
  const [patternSeed, setPatternSeed] = useState('');
  const [patternColor, setPatternColor] = useState('blue');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingGradient, setIsGeneratingGradient] = useState(false);
  const [isGeneratingPattern, setIsGeneratingPattern] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [generationNote, setGenerationNote] = useState('');
  const [aiGenerationType, setAiGenerationType] = useState('image'); // 'image', 'gradient', or 'pattern'
  const [bgContentCategory, setBgContentCategory] = useState('upload'); // 'upload', 'predefined', 'ai'

  const predefinedBackgrounds = [
    {
      id: 'abstract1',
      name: 'Abstract Blue',
      thumbnail: '/images/backgrounds/abstract-blue-thumb.jpg',
      url: '/images/backgrounds/abstract-blue.jpg',
    },
    {
      id: 'geometric1',
      name: 'Geometric Pattern',
      thumbnail: '/images/backgrounds/geometric-thumb.jpg',
      url: '/images/backgrounds/geometric.jpg',
    },
    {
      id: 'corporate1',
      name: 'Corporate Blue',
      thumbnail: '/images/backgrounds/corporate-thumb.jpg',
      url: '/images/backgrounds/corporate.jpg',
    },
    {
      id: 'gradient1',
      name: 'Blue Gradient',
      thumbnail: '/images/backgrounds/gradient-thumb.jpg',
      url: '/images/backgrounds/gradient.jpg',
    },
    // Add more predefined backgrounds as needed
  ];

  const predefinedPrompts = {
    image: [
      'Elegant blue corporate background with subtle pattern',
      'Modern abstract background with professional colors',
      'Minimal blue and white background for business ID',
      'Tech pattern background with blue geometric shapes',
      'Professional gradient background with abstract elements',
      'Clean corporate ID background with subtle blue accents',
    ],
    gradient: [
      'Blue corporate to navy professional gradient',
      'Green to teal smooth transition',
      'Gray to blue formal gradient',
      'Purple to pink vibrant gradient',
      'Blue to turquoise professional fade',
      'Dark blue to light blue corporate gradient',
    ],
    pattern: [
      'Corporate geometric pattern',
      'Technical hexagon grid',
      'Professional lines pattern',
      'Simple dots matrix',
      'Conference badge pattern',
      'Academic credential design',
    ],
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setBackgroundImage(reader.result);
      setBackgroundType('image');
      setIsUploading(false);
    };
    reader.onerror = () => {
      console.error('Error reading file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const selectPredefinedBackground = (background) => {
    setBackgroundImage(background.url);
    setBackgroundType('image');
  };

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationNote('');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          type: 'image',
        }),
      });

      const data = await response.json();

      if (!response.ok && !data.imageUrl) {
        throw new Error(data.message || 'Error generating the image');
      }

      const img = new Image();
      img.onload = () => {
        setBackgroundImage(data.imageUrl);
        setBackgroundType('image');
        setAiPrompt('');

        if (data.source) {
          const sourceMap = {
            'dall-e': 'DALL-E',
            unsplash: 'Unsplash',
            huggingface: 'Hugging Face AI',
            'generated-gradient': 'gradient generator',
            'basic-gradient': 'basic gradient',
          };

          setGenerationNote(
            `Image generated with ${sourceMap[data.source] || data.source}`
          );
        }

        setIsGenerating(false);
      };

      img.onerror = () => {
        console.error(
          'Failed to load generated image, using gradient fallback'
        );
        setBackgroundImage(`linear-gradient(45deg, #0066cc, #00cc99)`);
        setBackgroundType('gradient');
        setGenerationError(
          'The image could not be loaded. A basic gradient will be used.'
        );
        setIsGenerating(false);
      };

      img.src = data.imageUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      setBackgroundImage(`linear-gradient(45deg, #0066cc, #00cc99)`);
      setBackgroundType('gradient');
      setGenerationError(
        error.message || 'Error generating the image, using basic gradient.'
      );
      setIsGenerating(false);
    }
  };

  const handleGenerateGradient = async () => {
    if (!gradientPrompt.trim()) return;

    setIsGeneratingGradient(true);
    setGenerationError(null);
    setGenerationNote('');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: gradientPrompt,
          type: 'gradient',
        }),
      });

      const data = await response.json();

      if (!response.ok && !data.imageUrl) {
        throw new Error(data.message || 'Error generating the gradient');
      }

      setBackgroundImage(data.imageUrl);
      setBackgroundType('image');
      setGradientPrompt('');

      setGenerationNote('Custom gradient generated successfully');
    } catch (error) {
      console.error('Error generating gradient:', error);
      setGenerationError(error.message || 'Error generating the gradient');
    } finally {
      setIsGeneratingGradient(false);
    }
  };

  const handleGeneratePattern = async () => {
    if (!patternSeed.trim()) return;

    setIsGeneratingPattern(true);
    setGenerationError(null);
    setGenerationNote('');

    try {
      // Try server-side pattern generation first
      let patternUrl;
      try {
        patternUrl = generatePattern(patternSeed, { color: patternColor });
      } catch (serverError) {
        console.log('Falling back to client-side pattern generation');
        // Fall back to client-side generation
        patternUrl = await ClientPatternGenerator(patternSeed, {
          color: patternColor,
        });
      }

      if (!patternUrl) {
        throw new Error('Could not generate the pattern');
      }

      console.log(
        'Pattern URL generated:',
        patternUrl.substring(0, 100) + '...'
      );

      setBackgroundImage(patternUrl);
      setBackgroundType('image');
      setGenerationNote('Unique pattern generated successfully');
    } catch (error) {
      console.error('Error generating pattern:', error);
      setGenerationError(error.message || 'Error generating the pattern');
    } finally {
      setIsGeneratingPattern(false);
    }
  };

  const patternColorOptions = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
    { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
  ];

  const renderPredefinedPrompts = (type) => {
    return (
      <div className="mt-2 mb-3">
        <p className="text-xs text-gray-600 mb-1">Suggested prompts:</p>
        <div className="flex flex-wrap gap-1">
          {predefinedPrompts[type]?.map((prompt, index) => (
            <button
              key={index}
              onClick={() => {
                if (type === 'image') setAiPrompt(prompt);
                else if (type === 'gradient') setGradientPrompt(prompt);
                else if (type === 'pattern') setPatternSeed(prompt);
              }}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
            >
              {prompt.length > 25 ? prompt.substring(0, 25) + '...' : prompt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Background type selector */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => setBackgroundType('color')}
          className={`px-3 py-2 rounded text-sm ${
            backgroundType === 'color'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Solid Color
        </button>
        <button
          onClick={() => setBackgroundType('gradient')}
          className={`px-3 py-2 rounded text-sm ${
            backgroundType === 'gradient'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Gradient
        </button>
        <button
          onClick={() => setBackgroundType('image')}
          className={`px-3 py-2 rounded text-sm ${
            backgroundType === 'image'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Image
        </button>
      </div>

      {backgroundType === 'color' && (
        <div className="p-3 border rounded-md">
          <h3 className="text-sm font-medium mb-2">Choose Color</h3>
          <div className="flex items-center gap-3">
            <HexColorPicker
              color={backgroundColor}
              onChange={setBackgroundColor}
            />
            <div>
              <div
                className="w-10 h-10 rounded border shadow-sm"
                style={{ backgroundColor }}
              ></div>
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="mt-2 w-20 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {backgroundType === 'gradient' && (
        <div className="p-3 border rounded-md">
          <h3 className="text-sm font-medium mb-2">Choose Gradient</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Start Color
              </label>
              <div
                className="w-full h-8 rounded cursor-pointer border"
                style={{ backgroundColor: backgroundGradient.startColor }}
                onClick={() =>
                  document.getElementById('startColorPicker').click()
                }
              ></div>
              <input
                id="startColorPicker"
                type="color"
                value={backgroundGradient.startColor}
                onChange={(e) =>
                  setBackgroundGradient({
                    ...backgroundGradient,
                    startColor: e.target.value,
                  })
                }
                className="hidden"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                End Color
              </label>
              <div
                className="w-full h-8 rounded cursor-pointer border"
                style={{ backgroundColor: backgroundGradient.endColor }}
                onClick={() =>
                  document.getElementById('endColorPicker').click()
                }
              ></div>
              <input
                id="endColorPicker"
                type="color"
                value={backgroundGradient.endColor}
                onChange={(e) =>
                  setBackgroundGradient({
                    ...backgroundGradient,
                    endColor: e.target.value,
                  })
                }
                className="hidden"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs text-gray-600 mb-1">
              Direction
            </label>
            <select
              value={backgroundGradient.direction}
              onChange={(e) =>
                setBackgroundGradient({
                  ...backgroundGradient,
                  direction: e.target.value,
                })
              }
              className="w-full px-2 py-1.5 border rounded text-sm"
            >
              <option value="to right">Horizontal</option>
              <option value="to bottom">Vertical</option>
              <option value="45deg">Diagonal (45°)</option>
              <option value="135deg">Diagonal (135°)</option>
              <option value="circle">Radial</option>
            </select>
          </div>
          <div className="mt-3">
            <div
              className="w-full h-12 rounded border"
              style={{
                background:
                  backgroundGradient.direction === 'circle'
                    ? `radial-gradient(circle, ${backgroundGradient.startColor}, ${backgroundGradient.endColor})`
                    : `linear-gradient(${backgroundGradient.direction}, ${backgroundGradient.startColor}, ${backgroundGradient.endColor})`,
              }}
            ></div>
          </div>
        </div>
      )}

      {backgroundType === 'image' && (
        <div className="p-3 border rounded-md">
          <h3 className="text-sm font-medium mb-2">Image Background</h3>

          {/* Current background image preview (if exists) */}
          {backgroundImage && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Current Background</h3>
              <div className="relative border rounded overflow-hidden h-32">
                <img
                  src={backgroundImage}
                  alt="Current background"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.error('Error loading image');
                    e.target.onerror = null;
                    const parent = e.target.parentNode;
                    if (parent) {
                      const div = document.createElement('div');
                      div.className =
                        'w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-teal-400';
                      div.textContent = 'Error loading image';
                      parent.replaceChild(div, e.target);
                    }
                  }}
                />
                <button
                  onClick={() => setBackgroundImage(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  title="Remove image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Background content category tabs */}
          <div className="flex border border-gray-200 rounded-md overflow-hidden mb-4">
            <button
              onClick={() => setBgContentCategory('upload')}
              className={`flex-1 py-2 text-sm ${
                bgContentCategory === 'upload'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setBgContentCategory('predefined')}
              className={`flex-1 py-2 text-sm ${
                bgContentCategory === 'predefined'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              Predefined
            </button>
            <button
              onClick={() => setBgContentCategory('ai')}
              className={`flex-1 py-2 text-sm ${
                bgContentCategory === 'ai'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              Generate
            </button>
          </div>

          {/* Upload section */}
          {bgContentCategory === 'upload' && (
            <div className="mb-4">
              <label className="block w-full cursor-pointer bg-gray-50 hover:bg-gray-100 border rounded-md p-3 text-center transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <span className="flex items-center justify-center">
                  {isUploading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
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
                      Uploading...
                    </span>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      Click to Upload Image
                    </>
                  )}
                </span>
              </label>
            </div>
          )}

          {/* Predefined backgrounds section */}
          {bgContentCategory === 'predefined' && (
            <div>
              <h3 className="text-sm font-medium mb-2">
                Predefined Backgrounds
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {predefinedBackgrounds.map((bg) => (
                  <div
                    key={bg.id}
                    className={`cursor-pointer rounded overflow-hidden border-2 ${
                      backgroundImage === bg.url
                        ? 'border-blue-500'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => selectPredefinedBackground(bg)}
                  >
                    <img
                      src={bg.thumbnail}
                      alt={bg.name}
                      className="w-full h-16 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI generation section */}
          {bgContentCategory === 'ai' && (
            <div className="mt-1">
              {/* Generation type tabs */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => setAiGenerationType('image')}
                  className={`py-1.5 px-2.5 text-xs rounded ${
                    aiGenerationType === 'image'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Pictures
                </button>
                <button
                  onClick={() => setAiGenerationType('gradient')}
                  className={`py-1.5 px-2.5 text-xs rounded ${
                    aiGenerationType === 'gradient'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Gradients
                </button>
                <button
                  onClick={() => setAiGenerationType('pattern')}
                  className={`py-1.5 px-2.5 text-xs rounded ${
                    aiGenerationType === 'pattern'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Patterns
                </button>
              </div>

              {/* Image generation */}
              {aiGenerationType === 'image' && (
                <div className="space-y-3">
                  {renderPredefinedPrompts('image')}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Describe the badge background you want
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="E.g.: Professional blue and gray ID badge background with subtle geometric patterns"
                      className="w-full text-sm p-2 border rounded resize-none"
                      rows={2}
                    />
                  </div>
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className={`w-full py-2 rounded text-white transition ${
                      isGenerating || !aiPrompt.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
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
                        Generating badge background...
                      </span>
                    ) : (
                      'Generate ID badge background with AI'
                    )}
                  </button>
                </div>
              )}

              {/* Gradient generation */}
              {aiGenerationType === 'gradient' && (
                <div className="space-y-3">
                  {renderPredefinedPrompts('gradient')}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Describe the colors for your gradient
                    </label>
                    <textarea
                      value={gradientPrompt}
                      onChange={(e) => setGradientPrompt(e.target.value)}
                      placeholder="E.g.: Corporate blue to turquoise, with professional tones"
                      className="w-full text-sm p-2 border rounded resize-none"
                      rows={2}
                    />
                  </div>
                  <button
                    onClick={handleGenerateGradient}
                    disabled={isGeneratingGradient || !gradientPrompt.trim()}
                    className={`w-full py-2 rounded text-white transition ${
                      isGeneratingGradient || !gradientPrompt.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#065388] hover:bg-[#054377]'
                    }`}
                  >
                    {isGeneratingGradient ? (
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
                        Generating gradient...
                      </span>
                    ) : (
                      'Generate gradient with AI'
                    )}
                  </button>
                </div>
              )}

              {/* Pattern generation with Jdenticon */}
              {aiGenerationType === 'pattern' && (
                <div className="space-y-3">
                  {renderPredefinedPrompts('pattern')}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Base text for the unique pattern
                    </label>
                    <input
                      type="text"
                      value={patternSeed}
                      onChange={(e) => setPatternSeed(e.target.value)}
                      placeholder="E.g.: Your name or company ID"
                      className="w-full text-sm p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Select the predominant color
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {patternColorOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPatternColor(option.value)}
                          className={`h-8 rounded ${option.class} ${
                            patternColor === option.value
                              ? 'ring-2 ring-offset-1 ring-blue-600'
                              : ''
                          }`}
                          title={option.label}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleGeneratePattern}
                    disabled={isGeneratingPattern || !patternSeed.trim()}
                    className={`w-full py-2 rounded text-white transition ${
                      isGeneratingPattern || !patternSeed.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#065388] hover:bg-[#054377]'
                    }`}
                  >
                    {isGeneratingPattern ? (
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
                        Generating pattern...
                      </span>
                    ) : (
                      'Generate unique pattern'
                    )}
                  </button>
                </div>
              )}

              {generationError && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded mt-3">
                  Error: {generationError}
                </div>
              )}

              {generationNote && (
                <div className="text-blue-500 text-sm p-2 bg-blue-50 rounded mt-3">
                  Note: {generationNote}
                </div>
              )}

              <p className="text-xs text-gray-500 italic mt-3">
                {aiGenerationType === 'image'
                  ? 'AI image generation may take a few seconds and consumes API credits.'
                  : aiGenerationType === 'gradient'
                  ? 'Generate custom gradients based on your color description.'
                  : 'Create unique patterns based on text. Each text generates a different pattern.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BackgroundImageUploader;
