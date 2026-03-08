import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { Observable } from 'rxjs';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI | null;
  private readonly model: string = 'gemini-2.0-flash';
  private readonly systemPrompt = `You are a friendly and knowledgeable AI assistant. 
Your task is to rewrite and improve the message provided to you while keeping the original meaning intact.
Make the response:
- Sound natural and conversational, like a helpful AI assistant
- Be warm, clear and easy to understand
- Keep the same facts and intent as the original message
- Do NOT add disclaimers or mention you're rewriting anything
- Respond only with the improved message, nothing else`;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.genAI = null;
      console.warn('[GeminiService] GEMINI_API_KEY not set — will use fallback mode');
    }
  }

  get isAvailable(): boolean {
    return this.genAI !== null;
  }

  /**
   * Stream transform từ admin message → AI-styled response
   * Trả về Observable emit từng chunk text
   */
  streamTransform(adminMessage: string): Observable<string> {
    return new Observable<string>((subscriber) => {
      if (!this.genAI) {
        subscriber.error(new Error('Gemini API key not configured'));
        return;
      }

      const run = async () => {
        try {
          const model = this.genAI!.getGenerativeModel({
            model: this.model,
            systemInstruction: this.systemPrompt,
            safetySettings: [
              { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
          });

          const result = await model.generateContentStream(adminMessage);

          let fullText = '';
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              fullText += chunkText;
              subscriber.next(chunkText);
            }
          }

          console.log(`[GeminiService] Stream ended, full response: ${fullText.length} chars`);
          subscriber.complete();
        } catch (err: any) {
          console.error('[GeminiService] Error:', err.message);
          subscriber.error(err);
        }
      };

      run();
    });
  }
}
