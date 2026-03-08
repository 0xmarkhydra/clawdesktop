import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Chính sách bảo mật | ClawDesktop.vn",
  description: "Chính sách bảo mật và xử lý dữ liệu của ClawDesktop.vn – Trợ lý AI chạy trên máy bạn.",
};

export default function ChinhSachBaoMatPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />
      <article className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Chính sách bảo mật</h1>
          <p className="mt-2 text-sm text-muted-foreground">Cập nhật: 2026</p>

          <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground">1. Tầm áp dụng</h2>
              <p>
                Chính sách này mô tả cách ClawDesktop.vn và Lynx (đơn vị phát triển) thu thập, sử dụng và bảo vệ thông tin khi bạn truy cập website clawdesktop.vn và sử dụng phần mềm ClawDesktop. Phần mềm ClawDesktop chạy trên máy tính của bạn; dữ liệu trợ lý AI (tin nhắn, lịch, tác vụ) mặc định được xử lý trên thiết bị của bạn hoặc theo cấu hình mô hình AI bạn chọn.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">2. Dữ liệu chúng tôi có thể thu thập</h2>
              <p>
                Trên website: chúng tôi có thể sử dụng công cụ phân tích (ví dụ Google Analytics, Vercel Analytics) để thu thập dữ liệu truy cập không nhận dạng cá nhân (trình duyệt, thiết bị, trang xem). Khi bạn liên hệ qua Zalo hoặc form, chúng tôi lưu thông tin bạn cung cấp (tên, số điện thoại, nội dung) chỉ để hỗ trợ và trả lời bạn.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">3. Cách sử dụng dữ liệu</h2>
              <p>
                Dữ liệu thu thập được dùng để cải thiện trải nghiệm website, hỗ trợ người dùng và gửi thông tin cập nhật sản phẩm (nếu bạn đồng ý). Chúng tôi không bán dữ liệu cá nhân cho bên thứ ba. Dữ liệu có thể được chia sẻ khi pháp luật yêu cầu hoặc để bảo vệ quyền lợi hợp pháp của chúng tôi và người dùng.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">4. Dữ liệu trên máy bạn (ClawDesktop)</h2>
              <p>
                Phần mềm ClawDesktop chạy cục bộ trên máy bạn. Các cuộc hội thoại, tài khoản Zalo/Shopee/ngân hàng bạn kết nối, và dữ liệu do trợ lý AI xử lý có thể được lưu trên máy bạn hoặc gửi tới API mô hình AI (Claude, OpenAI, v.v.) tùy cấu hình. Bạn cần tự bảo vệ máy tính và tài khoản; chúng tôi khuyến nghị đọc chính sách bảo mật của từng dịch vụ bạn tích hợp.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">5. Bảo mật và lưu trữ</h2>
              <p>
                Chúng tôi áp dụng biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu thu thập qua website và kênh hỗ trợ. Dữ liệu được lưu trong thời gian cần thiết cho mục đích đã nêu hoặc theo quy định pháp luật.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">6. Quyền của bạn</h2>
              <p>
                Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu cá nhân liên quan đến bạn mà chúng tôi đang lưu. Để thực hiện, vui lòng liên hệ qua Cộng đồng Zalo hoặc Zalo tư vấn. Nếu bạn ở EU hoặc các khu vực có quy định tương tự, bạn có thể có thêm quyền theo GDPR hoặc luật địa phương.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">7. Cập nhật chính sách</h2>
              <p>
                Chúng tôi có thể cập nhật chính sách bảo mật theo thời gian. Phiên bản mới nhất sẽ được đăng trên trang này với ngày cập nhật. Việc bạn tiếp tục sử dụng website hoặc sản phẩm sau khi có thay đổi được hiểu là bạn chấp nhận chính sách mới.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">8. Liên hệ</h2>
              <p>
                Mọi câu hỏi về chính sách bảo mật:{" "}
                <Link href="https://zalo.me/g/iirzlr303" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  Cộng đồng Zalo
                </Link>{" "}
                hoặc{" "}
                <Link href="https://zalo.me/g/iirzlr303" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  Nhắn Zalo tư vấn
                </Link>
                .
              </p>
            </section>
          </div>

          <p className="mt-10">
            <Link href="/" className="text-sm text-muted-foreground underline hover:text-foreground">
              ← Về trang chủ
            </Link>
          </p>
        </div>
      </article>
      <Footer />
    </main>
  );
}
