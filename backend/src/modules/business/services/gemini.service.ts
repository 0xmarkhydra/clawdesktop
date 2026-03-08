import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { Observable } from 'rxjs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WebSocketGateway } from '../../websocket/websocket.gateway';
import { MessageRepository } from '../../database/repositories';
import { MessageRole } from '../../database/entities/message.entity';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI | null;
  private readonly model: string = 'gemini-2.5-flash';
  private readonly systemPrompt = `Bạn là một trợ lý AI thông minh và thân thiện.
Nhiệm vụ của bạn là viết lại và cải thiện tin nhắn do Admin cung cấp sao cho hay hơn, chuyên nghiệp nhưng vẫn giữ nguyên ý gốc.

Yêu cầu BẮT BUỘC:
- **Luôn ưu tiên trả lời và hoàn thiện văn bản bằng Tiếng Việt (Vietnamese)**.
- Ngữ điệu tự nhiên, thân thiện, lịch sự và rõ ràng như một chuyên gia chăm sóc khách hàng mẫn cán.
- Giữ đúng thông tin, các thông số kỹ thuật và ý định của tin nhắn gốc.
- TUYỆT ĐỐI KHÔNG thêm các câu rào trước đón sau (ví dụ: "Dưới đây là tin nhắn đã sửa...", "Vâng, tin nhắn là...").
- CHỈ output phần văn bản đã được tối ưu, không giải thích gì thêm.`;

  constructor(
    @InjectPinoLogger(GeminiService.name)
    private readonly logger: PinoLogger,
    private readonly wsGateway: WebSocketGateway,
    private readonly messageRepo: MessageRepository,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.genAI = null;
      this.logger.warn('GEMINI_API_KEY not set — will use fallback mode');
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

  /**
   * AI tự động trả lời User (Auto-Reply)
   * Thay vì đóng vai công cụ rewrite cho Admin, AI đóng vai trò Assistant trực tiếp.
   */
  async streamAutoReply(threadId: string, context: string, messages: any[]) {
    if (!this.model || !messages || messages.length === 0) {
      this.logger.warn('Gemini API is not configured or messages empty.');
      return;
    }

    const latestMessage = messages[messages.length - 1];
    const userMessage = latestMessage.content;
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === MessageRole.USER ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const systemInstruction = `
[KNOWLEDGE BASE]
${context}

Bạn là "Chuyên gia OpenClaw", được vận hành bởi model tổng hợp "clawdesktop 0.1". Bạn hoạt động dưới dạng RouterModel để trao đổi phù hợp, tối ưu hóa và tiết kiệm token nhất nhưng vẫn đảm bảo hiệu năng và độ chính xác cao.
Nhiệm vụ của bạn là hỗ trợ cài đặt OpenClaw trên VPS và trả lời các thắc mắc dựa trên [KNOWLEDGE BASE] phía trên.
Đặc biệt LƯU Ý: Bạn CHỈ hỗ trợ khách hàng sử dụng dịch vụ VPS của hệ thống ClawDesktop.VN. Nếu khách dùng VPS bên thứ 3 (AWS, Azure, Contabo...), hãy gọi họ cung cấp thêm thông tin và báo rằng có thể kiến thức sẽ không đúng hoàn toàn trên platform khác.

- Khi user gửi lời chào, hoặc những câu chung chung không rõ ràng (như "alo", "hi", "giúp mình với"), hãy LUÔN LUÔN trả lời chính xác bằng câu này:
"Chào bạn! Mình là Chuyên gia OpenClaw. Bạn cần mình hỗ trợ gì setup trên OpenClaw trên VPS ko"
- Đọc lịch sử trò chuyện (nếu có) để hiểu rõ ngữ cảnh câu hỏi: "${userMessage}".
- LƯU Ý QUAN TRỌNG 1: Tuyệt đối KHÔNG ĐƯỢC nhắc đến các từ khóa "Admin", "hệ thống", "báo cáo". 
- LƯU Ý QUAN TRỌNG 2: Nếu bạn không biết hoặc câu hỏi nằm ngoài phạm vi tài liệu, hãy chỉ hỏi lại user cần hỗ trợ gì về OpenClaw trên VPS, không được hứa hẹn báo cáo ai cả.
- LƯU Ý QUAN TRỌNG 3: **Luôn ưu tiên trả lời và hoàn thiện văn bản bằng Tiếng Việt (Vietnamese)** trong mọi tình huống, trừ khi user yêu cầu trả lời bằng ngôn ngữ khác.
- Trả lời tự nhiên, thân thiện, ngắn gọn, dùng Markdown để format lệnh code nếu có.
`;

    try {
      this.wsGateway.emitTyping(threadId);

      const aiModel = this.genAI!.getGenerativeModel({
        model: this.model,
        systemInstruction,
      });

      const chat = aiModel.startChat({
        history: history,
      });

      const result = await chat.sendMessageStream(userMessage);
      
      let fullText = '';
      for await (const chunk of result.stream) {
        const textChunk = chunk.text();
        fullText += textChunk;
        this.wsGateway.emitStreamChunk(threadId, textChunk);
      }

      // 4. Lưu full reply vào DB với vai trò 'ai'
      const aiMessage = await this.messageRepo.save({
        thread_id: threadId,
        content: fullText,
        role: MessageRole.AI,
      });

      this.wsGateway.emitStreamDone(threadId, aiMessage);
    } catch (error) {
      this.logger.error({ err: error, threadId }, 'Error auto-replying with Gemini');
      this.wsGateway.emitStreamError(threadId, 'Bot error: ' + String(error));
    }
  }
}
