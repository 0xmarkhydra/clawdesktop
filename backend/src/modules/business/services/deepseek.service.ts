import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class DeepSeekService {
  private readonly apiKey: string;
  private readonly apiUrl: string = 'https://api.deepseek.com/v1/chat/completions';

  private readonly DEFAULT_SYSTEM_PROMPT = `Bạn là trợ lý AI thông minh tên là Claw AI. 
Nhiệm vụ của bạn là diễn đạt lại tin nhắn được cung cấp theo giọng AI tự nhiên, lịch sự và thân thiện.
Giữ nguyên ý nghĩa và thông tin trong tin nhắn gốc, chỉ thay đổi cách diễn đạt cho phù hợp với giọng AI.
Trả lời bằng ngôn ngữ giống với ngôn ngữ của tin nhắn gốc.
Không thêm thông tin không có trong tin nhắn gốc.
Không giải thích hay đề cập rằng bạn đang diễn đạt lại, chỉ trả về nội dung đã được diễn đạt lại.`;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
  }

  /**
   * Stream transform admin message to AI voice
   * @param adminMessage - Raw message from admin
   * @param systemPrompt - Optional custom system prompt
   */
  streamTransform(adminMessage: string, systemPrompt?: string): Observable<string> {
    return new Observable<string>(observer => {
      const controller = new AbortController();
      const { signal } = controller;
      let completeResponse = '';

      try {
        if (!this.apiKey) {
          observer.error(new Error('DeepSeek API key is missing'));
          return;
        }

        const headers = {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        };

        const data = {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: systemPrompt || this.DEFAULT_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: adminMessage,
            },
          ],
          stream: true,
        };

        axios.post(this.apiUrl, data, {
          headers,
          signal,
          responseType: 'stream',
        }).then(response => {
          response.data.on('data', (chunk: Buffer) => {
            try {
              const lines = chunk.toString().split('\n');
              for (const line of lines) {
                if (!line || line === 'data: [DONE]') continue;
                if (line.startsWith('data: ')) {
                  const jsonStr = line.slice(6);
                  try {
                    const json = JSON.parse(jsonStr);
                    if (json.choices && json.choices[0]?.delta?.content) {
                      const contentChunk = json.choices[0].delta.content;
                      completeResponse += contentChunk;
                      observer.next(contentChunk);
                    }
                  } catch { /* skip invalid JSON */ }
                }
              }
            } catch (error) {
              console.error('[DeepSeekService] Error processing chunk:', error);
            }
          });

          response.data.on('end', () => {
            console.log('[DeepSeekService] Stream ended, full response:', completeResponse.length, 'chars');
            observer.complete();
          });

          response.data.on('error', (_error: Error) => {
            // Ignore stream errors on disconnect
          });
        }).catch(error => {
          if (axios.isCancel(error)) {
            observer.complete();
          } else {
            const axiosError = error as AxiosError;
            console.error('[DeepSeekService] Axios error:', axiosError.message);
            observer.error(error);
          }
        });

        return () => {
          controller.abort();
        };
      } catch (error) {
        observer.error(error);
      }
    });
  }
}
