#!/bin/bash

# Dừng script nếu có lệnh nào bị lỗi
set -e

echo "========================================="
echo "  BẮT ĐẦU QUÁ TRÌNH BUILD DESKTOP APP   "
echo "========================================="

# Thư mục đích chứa file cài đặt
# KHÔNG dùng public/ vì Vite sẽ tự copy public/ vào dist/ khi build
# → dẫn đến file installer bị đóng gói vào app → app nặng bất thường
INSTALLERS_DIR="installers"
RELEASE_DIR="release"

# Tạo thư mục installers/ nếu chưa tồn tại
mkdir -p "$INSTALLERS_DIR"

# Xoá file installer cũ bị lẫn trong dist/ (phòng trường hợp bị copy vào app)
echo "🧹 Đang dọn file cũ trong dist/..."
rm -f dist/*.dmg dist/*.exe dist/*.AppImage dist/*.blockmap

echo "[1/4] Building cho Windows (.exe)"
npm run electron:build:win

echo "[2/4] Building cho macOS Intel (.dmg)"
npm run electron:build:mac:intel

echo "[3/4] Building cho macOS ARM / Apple Silicon (.dmg)"
npm run electron:build:mac:arm

echo "[4/4] Building cho Linux (.AppImage)"
npm run electron:build:linux

echo "========================================="
echo "  BUILD HOÀN TẤT. Đang copy file...      "
echo "========================================="

# Move file .exe (Windows)
if ls "$RELEASE_DIR"/*.exe 1> /dev/null 2>&1; then
    echo "✅ Đã tìm thấy file .exe. Đang di chuyển vào $INSTALLERS_DIR/..."
    mv -f "$RELEASE_DIR"/*.exe "$INSTALLERS_DIR"/
else
    echo "⚠️  Không tìm thấy file .exe"
fi

# Move file .dmg (macOS)
if ls "$RELEASE_DIR"/*.dmg 1> /dev/null 2>&1; then
    echo "✅ Đã tìm thấy file .dmg. Đang di chuyển vào $INSTALLERS_DIR/..."
    mv -f "$RELEASE_DIR"/*.dmg "$INSTALLERS_DIR"/
else
    echo "⚠️  Không tìm thấy file .dmg"
fi

# Move file .AppImage (Linux)
if ls "$RELEASE_DIR"/*.AppImage 1> /dev/null 2>&1; then
    echo "✅ Đã tìm thấy file .AppImage. Đang di chuyển vào $INSTALLERS_DIR/..."
    mv -f "$RELEASE_DIR"/*.AppImage "$INSTALLERS_DIR"/
else
    echo "⚠️  Không tìm thấy file .AppImage"
fi

echo "========================================="
echo "  XONG! Các file cài đặt đã được chuyển "
echo "  vào thư mục /installers.              "
echo "  - Windows:  .exe                      "
echo "  - macOS:    .dmg                      "
echo "  - Linux:    .AppImage                 "
echo "========================================="
