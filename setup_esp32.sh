#!/bin/bash

# ESP32 IoT Kantor Desa - Quick Setup Script
# Script ini membantu setup cepat untuk menghubungkan ESP32 ke aplikasi

echo "🚀 ESP32 IoT Kantor Desa - Quick Setup"
echo "=========================================="

# Fungsi untuk mendapatkan IP lokal
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ip=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        ip=$(hostname -I | awk '{print $1}')
    else
        # Windows (dengan WSL)
        ip=$(ip route | grep default | awk '{print $3}' | head -1)
    fi
    echo $ip
}

# Main setup
echo ""
echo "📡 Step 1: Network Configuration"
echo "================================"

# Get local IP
LOCAL_IP=$(get_local_ip)
echo "📍 Local IP Address detected: $LOCAL_IP"
echo ""
echo "⚠️  Pastikan aplikasi Next.js berjalan di port 3000"
echo "   Jika belum, jalankan: npm run dev"
echo ""

# Test server connection
echo "🔍 Testing server connection..."
if curl -s "http://$LOCAL_IP:3000/api/health" > /dev/null; then
    echo "✅ Server is running and accessible!"
else
    echo "❌ Server not accessible. Please check:"
    echo "   - Next.js application is running (npm run dev)"
    echo "   - Port 3000 is not blocked by firewall"
    echo "   - IP address is correct"
    exit 1
fi

echo ""
echo "📱 Step 2: Device Registration"
echo "=============================="

# Device configuration
echo "Silakan register device melalui browser:"
echo "🌐 Buka: http://$LOCAL_IP:3000/devices"
echo ""
echo "Klik 'Add Device' dan isi form dengan:"
echo "- Device Name: (contoh: ESP32_Water_01)"
echo "- Device Type: (pilih sesuai sensor)"
echo "- Location: (contoh: Tandon Air Utama)"
echo ""

# Wait for user input
read -p "Tekan ENTER setelah device terdaftar dan dapatkan device key..."

echo ""
echo "⚙️  Step 3: ESP32 Code Configuration"
echo "===================================="

# Create ESP32 configuration file
cat > esp32_config.h << 'EOF'
#ifndef ESP32_CONFIG_H
#define ESP32_CONFIG_H

// WiFi Configuration - GANTI dengan WiFi Anda
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Server Configuration - GANTI dengan IP server
#define SERVER_URL "http://192.168.1.100:3000"  // Ganti dengan IP server

// Device Configuration - GANTI dengan device Anda
#define DEVICE_ID "YOUR_DEVICE_ID"              // Device ID dari /devices
#define DEVICE_KEY "YOUR_DEVICE_KEY"            // Device Key dari /devices

// Sensor Configuration
#define SENSOR_TYPE "water_level"               // Ganti sesuai sensor:
// "electricity", "water_level", "ir_detector", 
// "temperature_humidity", "smoke", "rain"

#endif
EOF

echo "📝 File konfigurasi ESP32 telah dibuat: esp32_config.h"
echo ""
echo "🔧 Edit file esp32_config.h dan ganti:"
echo "   - WIFI_SSID dan WIFI_PASSWORD"
echo "   - SERVER_URL (ganti 192.168.1.100 dengan $LOCAL_IP)"
echo "   - DEVICE_ID dan DEVICE_KEY (dari halaman /devices)"
echo ""

echo "🔌 Step 4: Hardware Connection"
echo "=============================="

echo "📋 Berikut pin configuration untuk sensor yang umum:"
echo ""
echo "💧 Water Level Sensor (HC-SR04):"
echo "   TRIG_PIN → GPIO5"
echo "   ECHO_PIN → GPIO18"
echo "   VCC → 5V"
echo "   GND → GND"
echo ""
echo "⚡ PZEM-004T (Electricity Monitor):"
echo "   RX → GPIO16"
echo "   TX → GPIO17"
echo "   VCC → 3.3V"
echo "   GND → GND"
echo ""
echo "🌡️ DHT22 (Temperature/Humidity):"
echo "   DATA → GPIO4"
echo "   VCC → 3.3V"
echo "   GND → GND"
echo ""
echo "📡 IR Motion Sensor:"
echo "   OUT → GPIO19"
echo "   VCC → 5V"
echo "   GND → GND"
echo ""

echo "🔨 Step 5: Upload Code to ESP32"
echo "==============================="

echo "1. Buka Arduino IDE"
echo "2. Install ESP32 Board Manager jika belum"
echo "3. Install required libraries:"
echo "   - ArduinoJson"
echo "   - DHT sensor library"
echo "4. Pilih Board: ESP32 Dev Module"
echo "5. Pilih Port yang sesuai"
echo "6. Upload code ESP32"
echo ""

echo "🧪 Step 6: Testing"
echo "=================="

echo "Setelah upload code:"
echo "1. Buka Serial Monitor (baud rate: 115200)"
echo "2. Periksa WiFi connection status"
echo "3. Monitor data pengiriman ke server"
echo "4. Buka dashboard: http://$LOCAL_IP:3000"
echo "5. Data sensor seharusnya muncul dalam 5-10 detik"
echo ""

echo "🔍 Troubleshooting Commands:"
echo "============================"
echo "Test API endpoint:"
echo "curl -X POST http://$LOCAL_IP:3000/api/esp32 \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"x-device-id: YOUR_DEVICE_ID\" \\"
echo "  -H \"x-device-key: YOUR_DEVICE_KEY\" \\"
echo "  -d '{\"sensorType\":\"water_level\",\"deviceName\":\"YOUR_DEVICE_ID\",\"waterLevel\":75}'"
echo ""

echo "Check server logs:"
echo "tail -f dev.log"
echo ""

echo "Check device status:"
echo "curl http://$LOCAL_IP:3000/api/devices"
echo ""

echo "✅ Setup complete! Selamat menggunakan ESP32 IoT Kantor Desa!"
echo ""
echo "📚 Documentation lengkap: ESP32_IoT_Setup_Guide.md"
echo "🆘 Jika ada masalah, cek Serial Monitor dan browser console (F12)"