'use client';

/**
 * TextToSpeech utility that prioritizes female Spanish voices
 */
class TextToSpeechService {
  constructor() {
    this.initialized = false;
    this.voices = [];
    this.preferredVoice = null;
    this.initialize();
  }

  initialize() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Try to load voices immediately
      this.voices = window.speechSynthesis.getVoices();
      this.findPreferredVoice();

      // Set up voice change listener for browsers that load voices asynchronously (like Chrome)
      window.speechSynthesis.onvoiceschanged = () => {
        this.voices = window.speechSynthesis.getVoices();
        console.log('Voices loaded:', this.voices.length);
        this.voices.forEach((voice) => {
          console.log(
            `Voice: ${voice.name}, Lang: ${voice.lang}, Default: ${
              voice.default
            }, Female: ${voice.name.includes('Female')}`
          );
        });
        this.findPreferredVoice();
        this.initialized = true;
      };
    }
  }

  findPreferredVoice() {
    if (!this.voices || this.voices.length === 0) return;

    // First try: look for explicitly female Spanish voices
    this.preferredVoice = this.voices.find(
      (voice) =>
        voice.lang.startsWith('es') &&
        (voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('mujer') ||
          voice.name.toLowerCase().includes('femenina') ||
          voice.name.toLowerCase().includes('paulina') ||
          voice.name.toLowerCase().includes('monica') ||
          voice.name.toLowerCase().includes('mónica'))
    );

    // Second try: if no explicitly female Spanish voices, try Microsoft Sabina or Microsoft Helena
    if (!this.preferredVoice) {
      this.preferredVoice = this.voices.find(
        (voice) =>
          voice.name.includes('Sabina') || voice.name.includes('Helena')
      );
    }

    // Third try: any Spanish voice
    if (!this.preferredVoice) {
      this.preferredVoice = this.voices.find((voice) =>
        voice.lang.startsWith('es')
      );
    }

    // Last resort: use any available voice
    if (!this.preferredVoice && this.voices.length > 0) {
      this.preferredVoice = this.voices[0];
    }

    if (this.preferredVoice) {
      console.log(
        'Selected voice:',
        this.preferredVoice.name,
        this.preferredVoice.lang
      );
    } else {
      console.warn('No suitable voice found');
    }
  }

  speak(text) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not available');
      return;
    }

    console.log('Attempting to speak:', text);

    try {
      // Create a test to force voice selection interaction
      if (!this.initialized) {
        const testUtterance = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(testUtterance);
        window.speechSynthesis.cancel();

        // Try to load voices again
        this.voices = window.speechSynthesis.getVoices();
        this.findPreferredVoice();
        this.initialized = true;
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Set language and voice properties
      utterance.lang = 'es-MX';
      utterance.volume = 1;
      utterance.rate = 1.0;
      utterance.pitch = 1.2; // Higher pitch for more feminine sound

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Set the preferred voice if we have one
      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      } else {
        // Try to find a voice at speak time if we don't have one yet
        this.voices = window.speechSynthesis.getVoices();
        this.findPreferredVoice();

        if (this.preferredVoice) {
          utterance.voice = this.preferredVoice;
        }
      }

      // Add event handlers for debugging
      utterance.onstart = () =>
        console.log('Speech started with voice:', utterance.voice?.name);
      utterance.onend = () => console.log('Speech ended');
      utterance.onerror = (e) => console.error('Speech error:', e);

      // Speak the text
      window.speechSynthesis.speak(utterance);

      console.log('Speech requested with voice:', utterance.voice?.name);
    } catch (error) {
      console.error('Error in speech synthesis:', error);
    }
  }
}

// Create and export a singleton instance
const textToSpeech =
  typeof window !== 'undefined' ? new TextToSpeechService() : null;

export default textToSpeech;
