#!/bin/bash

# Dừng script nếu có lệnh nào bị lỗi
set -e

echo "========================================="
echo "  BẮT ĐẦU QUÁ TRÌNH BUILD DESKTOP APP   "
echo "========================================="

# Thư mục đích sẽ chứa file cài đặt
PUBLIC_DIR="public"
RELEASE_DIR="release"

# Tạo thư mục public nếu chưa tồn tại
mkdir -p "$PUBLIC_DIR"

echo "[1/3] Building cho Windows (.exe)"
npm run electron:build:win

echo "[2/3] Building cho macOS Intel (.dmg)"
npm run electron:build:mac:intel

echo "[3/3] Building cho macOS ARM / Apple Silicon (.dmg)"
npm run electron:build:mac:arm

echo "========================================="
echo "  BUILD HOÀN TẤT. Đang copy file...      "
echo "========================================="

# Move file .exe (Windows)
if ls "$RELEASE_DIR"/*.exe 1> /dev/null 2>&1; then
    echo "Đã tìm thấy file .exe. Đang di chuyển vào public/..."
    mv -f "$RELEASE_DIR"/*.exe "$PUBLIC_DIR"/
else
    echo "⚠️  Không tìm thấy file .exe"
fi

# Move file .dmg (macOS)
if ls "$RELEASE_DIR"/*.dmg 1> /dev/null 2>&1; then
    echo "Đã tìm thấy file .dmg. Đang di chuyển vào public/..."
    mv -f "$RELEASE_DIR"/*.dmg "$PUBLIC_DIR"/
else
    echo "⚠️  Không tìm thấy file .dmg"
fi

echo "========================================="
echo "  XONG! Các file cài đặt đã được chuyển "
echo "  vào thư mục /public.                  "
echo "========================================="
