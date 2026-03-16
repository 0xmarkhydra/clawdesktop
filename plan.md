# 🚀 CentrixPay – Ví Điện Tử Siêu Ứng Dụng Như MoMo

**Đề xuất bởi [Tên anh/chị]**  
**Tháng 3/2026**  
**Mục tiêu:** Xây dựng ví điện tử thông minh tập trung vào Freelancer & SME tại Hà Nội với AI Personal Finance Coach

---

## 📋 SOLUTION HOÀN CHỈNH ĐỂ TRIỂN KHAI (6–12 tháng)

### Giai đoạn 1: Pháp lý & Giấy phép (1–3 tháng)
- Nộp hồ sơ **Giấy phép dịch vụ trung gian thanh toán (IPSP – Electronic Wallet)** tại Ngân hàng Nhà nước theo **Nghị định 52/2024 & Circular 39/2014** (sửa đổi).
- Vốn pháp định tối thiểu **~50 tỷ VND** (đảm bảo thanh khoản & an ninh).
- Tuân thủ bắt buộc từ 2026: **Xác thực sinh trắc học** (in-person kiểm tra CMND/CCCD + khuôn mặt/vân tay) trước khi kích hoạt ví.
- Bắt đầu bằng **partnership ngân hàng** (VPBank, TPBank hoặc Vietcombank) để dùng hạ tầng sẵn → rút ngắn thời gian cấp phép (cách MoMo & ZaloPay đã làm).
- Tham gia **Regulatory Sandbox** nếu NHNN mở rộng cho payment AI (theo Luật Công nghệ số 2026).

### Giai đoạn 2: Xây dựng sản phẩm MVP (3–4 tháng)
**Tech stack tối ưu chi phí & scale nhanh:**
- App mobile: **Flutter** (iOS + Android)
- Backend: **Python FastAPI + Node.js**
- AI: **TensorFlow / XGBoost** cho Personal Finance Coach
- Tích hợp: VietQR, NAPAS, Open API ngân hàng, eKYC Viettel/VNPT, biometric (Face ID + vân tay)
- Bảo mật: **ISO 27001, PCI-DSS**, blockchain lưu trữ giao dịch (tùy chọn)
- Authentication: **JWT với Refresh Token**, session management, auto-logout

**Tính năng chính (siêu ứng dụng như MoMo):**
1. Chuyển tiền nhanh, QR thanh toán (**0 phí nội bộ**)
2. Thanh toán hóa đơn, nạp điện thoại, vé xe, mua sắm
3. **AI Coach**: “Hôm nay bạn chi quá 15% ăn uống, nên chuyển 500k vào tiết kiệm”
4. Đầu tư nhỏ lẻ (tiết kiệm, quỹ, cổ phiếu qua partnership)
5. Bảo hiểm micro + trả góp 0% (tích hợp SME)
6. Dashboard doanh thu cho freelancer/SME

### Giai đoạn 3: Ra mắt & Scale (từ tháng 5)
- Test beta **5.000 users Hà Nội** (freelancer & SME online)
- Marketing: TikTok + Zalo OA + partnership Shopee/Lazada + livestream GenZ
- Doanh thu: Phí giao dịch 0.5–1% + lãi float + premium AI Coach (99k/tháng) + data analytics + bảo hiểm
- **Dự kiến năm 1**: 200.000 users, doanh thu **25–40 tỷ VND** (break-even tháng 9–10)

### ⚠️ Rủi ro & Giải pháp
- **Cạnh tranh khốc liệt**: USP = AI Coach độc quyền + niche SME/freelancer + phí thấp hơn MoMo 20%
- **Pháp lý siết chặt 2026**: Đã tuân thủ biometric ngay từ đầu
- **An ninh**: Audit hàng quý + bảo hiểm cyber
- **Chi phí user acquisition cao**: Partnership ngân hàng & e-commerce giảm 40% CAC

### 🔐 Xử lý JWT & Session Management

**Khi JWT hết hạn, hệ thống sẽ:**

1. **Refresh Token tự động (Silent Refresh)**
   - Access Token: 15 phút
   - Refresh Token: 7 ngày (lưu secure storage)
   - Auto-refresh khi còn 2 phút trước khi hết hạn
   - Không gián đoạn trải nghiệm người dùng

2. **Logout tự động khi Refresh Token hết hạn**
   - Xóa tất cả token khỏi device
   - Redirect về màn hình login
   - Thông báo: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"
   - Lưu trạng thái để user quay lại đúng màn hình

3. **Biometric Re-authentication cho giao dịch quan trọng**
   - Chuyển tiền > 5 triệu: Bắt buộc Face ID/vân tay
   - Thay đổi thông tin nhạy cảm: PIN + biometric
   - Login từ device mới: SMS OTP + biometric

4. **Security Features bổ sung**
   - Device fingerprinting (chống clone app)
   - Geo-location check (cảnh báo login từ vị trí lạ)
   - Rate limiting: Max 5 lần login sai/15 phút
   - Session timeout khi app ở background > 5 phút

5. **Backup Authentication**
   - SMS OTP khi biometric fail
   - Email verification cho device mới
   - Câu hỏi bảo mật backup
   - Hotline hỗ trợ 24/7 cho trường hợp khẩn cấp

### 💰 Ngân sách năm đầu
**Tổng: 25–40 tỷ VND**  
- Phát triển app: 35%  
- Marketing: 30%  
- Compliance & license: 20%  
- Vận hành: 15%  

**Có thể gọi seed round** từ Dragon Capital, VinaCapital hoặc quỹ Fintech chuyên payment.

---

## 📊 BẢN SLIDER (Pitch Deck) – 14 slides sẵn sàng copy-paste

**Hướng dẫn thiết kế:** Nền xanh dương – trắng, font **Roboto**, thêm icon QR & AI. Thời gian trình bày: **12–15 phút**.

### Slide 1: Trang bìa
**CentrixPay – Ví Điện Tử Siêu Ứng Dụng Như MoMo**  
**Tagline:** “Thanh toán nhanh – AI quản lý tài chính thông minh”  
Phía dưới: Đề xuất bởi [Tên anh/chị] – Tháng 3/2026  
*(Hình: Smartphone quét QR + biểu tượng AI)*

### Slide 2: Mục lục
(12 slide còn lại)

### Slide 3: Thị trường Ví Điện Tử Việt Nam 2026 – Cơ hội khổng lồ
- Digital Wallet: **7.19 tỷ USD** (tăng 26.6%)
- Mobile Payments: **52.19 tỷ USD**
- MoMo dẫn đầu nhưng top 5 chỉ chiếm 65% → còn chỗ cho **AI niche**
- Chính phủ đẩy không tiền mặt đến 2030  
*(Hình: Biểu đồ tăng trưởng + bản đồ Việt Nam)*

### Slide 4: Vấn đề thực tế
- Người dùng mất thời gian quản lý chi tiêu thủ công
- Freelancer/SME khó theo dõi dòng tiền
- MoMo chưa có AI tư vấn cá nhân hóa sâu
- Rủi ro lừa đảo & chi tiêu quá đà  
*(Hình: Icon đau đầu + thống kê)*

### Slide 5: Giải pháp CentrixPay
- Ví điện tử siêu ứng dụng (giống MoMo)
- **AI Personal Finance Coach 24/7**
- Tập trung Freelancer & SME Hà Nội
- Biometric bảo mật chuẩn 2026  
*(Hình: Before-After)*

### Slide 6: Sản phẩm & Tính năng nổi bật
- QR & chuyển tiền tức thì
- Thanh toán hóa đơn tự động
- AI Coach cá nhân hóa
- Đầu tư & bảo hiểm micro
- Dashboard SME  
*(Gợi ý: Chèn mockup app đẹp)*

### Slide 7: Cách hoạt động
1. Đăng ký biometric **2 phút**
2. Nạp tiền & liên kết ngân hàng
3. AI phân tích & gợi ý
4. Thanh toán mọi nơi
5. Báo cáo thông minh  
*(Hình: Flowchart 5 bước)*

### Slide 8: Thị trường mục tiêu
- **TAM**: 7.19 tỷ USD
- **SAM**: Phân khúc Freelancer + SME (Hà Nội & lớn)
- **Target năm 1**: 200.000 users  
*(Hình: Pyramid TAM/SAM/SOM)*

### Slide 9: Mô hình kinh doanh
- Phí giao dịch + lãi float
- Premium AI Coach (99k/tháng)
- Partnership bảo hiểm & đầu tư
- Bán dữ liệu phân tích  
*(Hình: Pie chart)*

### Slide 10: Lợi thế cạnh tranh

| Tiêu chí              | **CentrixPay**              | MoMo                  | ZaloPay               | ShopeePay            |
|-----------------------|-----------------------------|-----------------------|-----------------------|----------------------|
| AI Personal Coach     | Có (độc quyền)              | Không                 | Cơ bản                | Không                |
| Niche mục tiêu        | Freelancer + SME            | Đại chúng             | Đại chúng             | Mua sắm              |
| Phí giao dịch         | Thấp hơn 20%                | Trung bình            | Trung bình            | 0% (mua sắm)         |
| Tích hợp biometric    | Chuẩn 2026 ngay từ đầu      | Có                    | Có                    | Có                   |
| Dashboard SME         | Chi tiết                    | Cơ bản                | Không                 | Không                |

### Slide 11: Roadmap
- Tháng 1–3: Nộp license & xây MVP
- Tháng 4–6: Beta 5.000 users Hà Nội
- Tháng 7–12: Ra mắt toàn quốc  
*(Hình: Timeline đẹp)*

### Slide 12: Đội ngũ & Đối tác
- [Chỗ sếp điền] + chuyên gia AI & payment
- Đối tác: Ngân hàng + Shopee + NAPAS  
*(Hình: Ảnh đội ngũ + logo đối tác)*

### Slide 13: Dự báo tài chính (3 năm)
- Năm 1: **30 tỷ** doanh thu
- Năm 2: **120 tỷ**
- Năm 3: **350 tỷ** (ROI >250%)  
*(Hình: Biểu đồ cột + đường)*

### Slide 14: The Ask & Kết luận
**Yêu cầu từ sếp:**  
- Phê duyệt **25–35 tỷ vốn**  
- Tuyển **10 nhân sự**  
- Giới thiệu ngân hàng đối tác  

**“Cùng CentrixPay mang AI vào ví điện tử Việt Nam – Bắt đầu ngay hôm nay!”**  
**Q&A**  
*(Hình: Call-to-action mạnh mẽ)*