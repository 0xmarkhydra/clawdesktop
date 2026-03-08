import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Điều khoản sử dụng | ClawDesktop.vn",
  description: "Điều khoản sử dụng dịch vụ ClawDesktop.vn – Phiên bản Desktop tiếng Việt của OpenClaw.",
};

export default function DieuKhoanSuDungPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />
      <article className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Điều khoản sử dụng</h1>
          <p className="mt-2 text-sm text-muted-foreground">Cập nhật: 2026</p>

          <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground">1. Chấp nhận điều khoản</h2>
              <p>
                Bằng việc tải, cài đặt hoặc sử dụng ClawDesktop.vn (phần mềm ClawDesktop), bạn đồng ý tuân thủ các điều khoản sử dụng này. Nếu bạn không đồng ý, vui lòng không sử dụng sản phẩm.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">2. Mô tả dịch vụ</h2>
              <p>
                ClawDesktop.vn là phiên bản Desktop tiếng Việt chính thức, dựa trên nền tảng OpenClaw (mã nguồn mở). Sản phẩm giúp người dùng cài đặt và sử dụng trợ lý AI trên máy tính (Windows, macOS, Linux) một cách dễ dàng, không cần kỹ năng lập trình.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">3. Sử dụng hợp pháp</h2>
              <p>
                Bạn cam kết chỉ sử dụng ClawDesktop cho mục đích hợp pháp, tuân thủ pháp luật Việt Nam và các quy định của bên thứ ba (Zalo, Shopee, ngân hàng, v.v.). Bạn không được dùng sản phẩm để spam, lừa đảo, xâm phạm quyền riêng tư hoặc gây hại cho người khác.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">4. Bản quyền và mã nguồn mở</h2>
              <p>
                ClawDesktop.vn dựa trên OpenClaw (open-source). Phần mở rộng tiếng Việt, giao diện và tài liệu do Lynx và cộng đồng phát triển. Bạn có thể sử dụng phần mềm theo giấy phép của OpenClaw và các thành phần liên quan; không được tái bán hoặc tuyên bố bản quyền trái phép.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">5. Miễn trừ trách nhiệm</h2>
              <p>
                Sản phẩm được cung cấp &quot;nguyên trạng&quot;. Chúng tôi không đảm bảo không gián đoạn hoặc không lỗi. Bạn sử dụng phần mềm trên máy của mình và chịu trách nhiệm về dữ liệu, tài khoản và hành vi sử dụng. Chúng tôi không chịu trách nhiệm cho thiệt hại gián tiếp hoặc phát sinh từ việc sử dụng ClawDesktop.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">6. Thay đổi điều khoản</h2>
              <p>
                Chúng tôi có thể cập nhật điều khoản sử dụng theo thời gian. Phiên bản mới nhất sẽ được đăng trên trang này. Việc bạn tiếp tục sử dụng sản phẩm sau khi có thay đổi được hiểu là bạn chấp nhận điều khoản mới.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">7. Liên hệ</h2>
              <p>
                Mọi thắc mắc về điều khoản sử dụng, vui lòng liên hệ qua{" "}
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
