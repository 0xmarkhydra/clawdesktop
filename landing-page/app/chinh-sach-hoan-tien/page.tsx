import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Chính sách hoàn tiền | ClawDesktop.vn",
  description: "Chính sách hoàn tiền và đảm bảo hài lòng khi sử dụng ClawDesktop.vn.",
};

export default function ChinhSachHoanTienPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />
      <article className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Chính sách hoàn tiền</h1>
          <p className="mt-2 text-sm text-muted-foreground">Cập nhật: 2026</p>

          <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground">1. Tổng quan</h2>
              <p>
                ClawDesktop.vn hiện cung cấp sản phẩm <strong className="text-foreground">hoàn toàn miễn phí</strong>. Bạn tải phần mềm và sử dụng đầy đủ tính năng mà không phải thanh toán. Chính sách hoàn tiền dưới đây áp dụng trong trường hợp trong tương lai có phát sinh gói trả phí hoặc khoản thu từ người dùng (ví dụ: hỗ trợ tùy chọn, gói nâng cấp).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">2. Khi có giao dịch trả phí</h2>
              <p>
                Nếu bạn đã thanh toán bất kỳ khoản phí nào liên quan đến ClawDesktop.vn (qua VNPay, Momo, chuyển khoản hoặc kênh chính thức khác), bạn có quyền yêu cầu hoàn tiền trong vòng <strong className="text-foreground">7 ngày</strong> kể từ ngày thanh toán, với điều kiện:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Bạn chưa sử dụng hoặc kích hoạt các tính năng/ quyền lợi dành riêng cho gói trả phí đó (nếu có).</li>
                <li>Yêu cầu hoàn tiền gửi qua kênh chính thức (Zalo tư vấn hoặc email được công bố trên website).</li>
                <li>Chúng tôi xác minh được giao dịch và thông tin tài khoản/ngân hàng để hoàn tiền.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">3. Cách xử lý hoàn tiền</h2>
              <p>
                Sau khi yêu cầu hợp lệ được xác nhận, chúng tôi sẽ tiến hành hoàn tiền trong vòng <strong className="text-foreground">14 ngày làm việc</strong> qua cùng phương thức thanh toán bạn đã dùng (ví dụ chuyển khoản về tài khoản đã thanh toán). Trong một số trường hợp, ngân hàng hoặc cổng thanh toán có thể mất thêm vài ngày để số tiền về tài khoản của bạn.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">4. Trường hợp không áp dụng hoàn tiền</h2>
              <p>
                Chúng tôi có thể từ chối hoàn tiền nếu: (i) quá 7 ngày kể từ ngày thanh toán; (ii) bạn đã sử dụng đầy đủ quyền lợi gói trả phí; (iii) có dấu hiệu lạm dụng, gian lận hoặc vi phạm điều khoản sử dụng; (iv) pháp luật hoặc chính sách của cổng thanh toán không cho phép hoàn tiền trong trường hợp đó.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">5. Liên hệ</h2>
              <p>
                Mọi yêu cầu hoàn tiền hoặc thắc mắc về chính sách:{" "}
                <Link href="https://zalo.me/g/iirzlr303" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  Nhắn Zalo tư vấn
                </Link>{" "}
                hoặc{" "}
                <Link href="https://zalo.me/g/iirzlr303" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  Cộng đồng Zalo
                </Link>
                . Chúng tôi sẽ phản hồi trong giờ làm việc.
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
