# 🚀 ESP32 IoT Kantor Desa - Panduan Lengkap

## 📋 Overview

Panduan ini menjelaskan cara menghubungkan ESP32 secara langsung ke aplikasi IoT Kantor Desa. ESP32 akan berfungsi sebagai client yang terhubung ke access point lokal dan mengirim data sensor secara real-time ke aplikasi web.

## 🏗️ Arsitektur Sistem

```
ESP32 Device → WiFi Router → Local Network → Next.js Application → Database
     ↓              ↓              ↓                    ↓              ↓
  Sensor Data    Internet    HTTP/Socket.io        API Routes      Prisma/SQLite
```

## 🛠️ Hardware Requirements

### ESP32 Development Board
- ESP32 Dev Kit v1 atau sejenisnya
- Kabel Micro USB untuk programming
- Breadboard dan jumper wires

### Sensor Options (Pilih salah satu atau beberapa):
1. **PZEM-004T** - Monitoring listrik (voltage, current, power, energy)
2. **HC-SR04** - Sensor ultrasonic untuk ketinggian air
3. **IR Sensor (PIR)** - Deteksi gerakan/motion
4. **DHT22** - Suhu dan kelembaban
5. **MQ-2** - Sensor asap/smoke
6. **Rain Sensor** - Sensor hujan

## 🔧 Software Requirements

### Arduino IDE Setup
1. Install Arduino IDE 2.0+
2. Install ESP32 Board Manager:
   - File → Preferences → Additional Boards Manager URLs
   - Tambahkan: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Tools → Board → Boards Manager → Search "ESP32" → Install

### Required Libraries
Install libraries melalui Arduino IDE Library Manager:
- **WiFi** (built-in)
- **HTTPClient** (built-in)
- **ArduinoJson** by Benoit Blanchon
- **DHT sensor library** by Adafruit
- **HardwareSerial** (built-in)

## 📝 Konfigurasi Dasar

### 1. Setup WiFi
```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // Ganti dengan WiFi Anda
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Ganti dengan password WiFi
```

### 2. Setup Server
```cpp
const char* SERVER_URL = "http://192.168.1.100:3000"; // IP server aplikasi
```

**Cara menemukan IP server:**
- Buka Command Prompt/Terminal
- Jalankan: `ipconfig` (Windows) atau `ifconfig` (Linux/Mac)
- Cari IP address komputer yang menjalankan aplikasi

### 3. Device Authentication
Setiap ESP32 membutuhkan:
- **Device ID**: Unique identifier (e.g., "ESP32_001")
- **Device Key**: Authentication key dari sistem

## 🔌 Koneksi Hardware

### Water Level Sensor (HC-SR04)
```
ESP32    → HC-SR04
GPIO5    → TRIG
GPIO18   → ECHO
5V       → VCC
GND      → GND
```

### PZEM-004T (Electricity Monitor)
```
ESP32    → PZEM-004T
GPIO16   → RX
GPIO17   → TX
3.3V     → VCC
GND      → GND
```

### DHT22 (Temperature/Humidity)
```
ESP32    → DHT22
GPIO4    → DATA
3.3V     → VCC
GND      → GND
```

### IR Motion Sensor
```
ESP32    → IR Sensor
GPIO19   → OUT
5V       → VCC
GND      → GND
```

### MQ-2 Smoke Sensor
```
ESP32    → MQ-2
GPIO34   → A0
5V       → VCC
GND      → GND
```

### Rain Sensor
```
ESP32    → Rain Sensor
GPIO35   → D0
3.3V     → VCC
GND      → GND
```

## 💻 Upload Code ke ESP32

### Langkah 1: Pilih Code yang Tepat
Pilih salah satu file sesuai sensor yang digunakan:
- `esp32_water_level_sensor.ino` - Untuk sensor air
- `esp32_electricity_monitor.ino` - Untuk PZEM-004T
- `esp32_ir_motion_detector.ino` - Untuk sensor gerakan
- `esp32_iot_kantor_desa.ino` - Untuk multi-sensor

### Langkah 2: Konfigurasi
Edit bagian konfigurasi di code:
```cpp
// Ganti dengan WiFi Anda
const char* WIFI_SSID = "Your_WiFi_Name";
const char* WIFI_PASSWORD = "Your_WiFi_Password";

// Ganti dengan IP server
const char* SERVER_URL = "http://192.168.1.100:3000";

// Ganti dengan device ID dan key
const String DEVICE_ID = "WaterTank01";
const String DEVICE_KEY = "device_WaterTank01_key_2024";
```

### Langkah 3: Upload
1. Hubungkan ESP32 ke komputer
2. Pilih Board: Tools → Board → ESP32 Arduino → ESP32 Dev Module
3. Pilih Port: Tools → Port → (pilih port ESP32)
4. Klik Upload button

## 📱 Registrasi Device di Aplikasi

### Langkah 1: Buka Device Management
1. Buka browser → `http://localhost:3000/devices`
2. Klik "Add Device"

### Langkah 2: Isi Form Registrasi
- **Device Name**: Sesuai dengan DEVICE_ID di ESP32 (e.g., "WaterTank01")
- **Device Type**: Pilih jenis sensor
- **Location**: Lokasi device (e.g., "Tandon Air")

### Langkah 3: Dapatkan Device Key
Setelah registrasi, sistem akan generate **Device Key**. Copy key ini dan gunakan di ESP32 code.

## 🧪 Testing Connection

### 1. Test Serial Monitor
Buka Arduino IDE Serial Monitor (baud rate: 115200) untuk melihat:
- WiFi connection status
- Data sensor yang terbaca
- Server response

### 2. Test API Endpoint
Gunakan curl atau Postman untuk test:
```bash
curl -X POST http://localhost:3000/api/esp32 \
  -H "Content-Type: application/json" \
  -H "x-device-id: WaterTank01" \
  -H "x-device-key: device_WaterTank01_key_2024" \
  -d '{
    "sensorType": "water_level",
    "deviceName": "WaterTank01",
    "waterLevel": 75.5
  }'
```

### 3. Monitor Dashboard
Buka `http://localhost:3000` untuk melihat data real-time dari ESP32.

## 🔍 Troubleshooting

### WiFi Connection Issues
**Problem:** ESP32 tidak bisa connect ke WiFi
**Solution:**
- Periksa SSID dan password
- Pastikan ESP32 dalam range WiFi
- Restart ESP32 dan router

### Server Connection Issues
**Problem:** ESP32 tidak bisa kirim data ke server
**Solution:**
- Periksa IP server di code ESP32
- Pastikan firewall tidak blocking port 3000
- Test dengan curl dari device lain

### Device Authentication Issues
**Problem:** "Invalid device key" error
**Solution:**
- Pastikan device key benar dari halaman /devices
- Copy paste tanpa spasi tambahan
- Register ulang device jika perlu

### Sensor Reading Issues
**Problem:** Data sensor tidak valid
**Solution:**
- Periksa koneksi hardware
- Pastikan sensor mendapat power yang cukup
- Kalibrasi sensor jika perlu

## 📊 Monitoring Data

### Real-time Dashboard
- Buka `http://localhost:3000`
- Data akan update otomatis setiap 5 detik
- Alert akan muncul jika sensor melebihi threshold

### Device Management
- Buka `http://localhost:3000/devices`
- Monitor status semua device
- Enable/disable device
- Lihat data history

### API Documentation
Endpoint yang tersedia:
- `POST /api/esp32` - Kirim data sensor
- `GET /api/esp32?deviceId=X` - Get device config
- `GET /api/sensors` - Get all sensor data
- `GET /api/alerts` - Get all alerts

## 🔒 Security Best Practices

### Production Environment
1. **Gunakan HTTPS** instead of HTTP
2. **Implement proper authentication** dengan token-based system
3. **Encrypt device keys** di database
4. **Rate limiting** untuk API endpoints
5. **Input validation** untuk semua data masuk

### Network Security
1. **Separate IoT network** dari network utama
2. **VPN** untuk remote access
3. **Firewall rules** untuk membatasi akses
4. **Regular firmware updates** untuk ESP32

## 🚀 Advanced Features

### Over-the-Air (OTA) Updates
```cpp
#include <WiFi.h>
#include <ESPmDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>

void setupOTA() {
  ArduinoOTA.setHostname("ESP32-IoT");
  ArduinoOTA.setPassword("admin123");
  
  ArduinoOTA.begin();
}
```

### Deep Sleep untuk Power Saving
```cpp
// Setup deep sleep
esp_sleep_enable_timer_wakeup(60 * 1000000); // 60 detik
esp_deep_sleep_start();
```

### Data Buffering
```cpp
// Buffer data jika WiFi terputus
std::vector<String> dataBuffer;

void bufferData(String data) {
  dataBuffer.push_back(data);
  if (dataBuffer.size() > 100) {
    dataBuffer.erase(dataBuffer.begin());
  }
}
```

## 📈 Scaling Considerations

### Multiple Devices
- Gunakan unique device IDs
- Implement device grouping
- Load balancing untuk server

### Data Storage
- Consider database migration untuk production
- Implement data archiving
- Backup strategy

### Performance Optimization
- Implement data compression
- Use WebSocket untuk real-time
- Cache frequently accessed data

## 🆘 Support

Jika mengalami masalah:
1. Cek Serial Monitor ESP32
2. Cek browser console (F12)
3. Test API endpoints dengan curl
4. Review log file aplikasi

## 📚 Additional Resources

- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/)
- [ArduinoJson Library](https://arduinojson.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Selamat mengimplementasikan ESP32 IoT Kantor Desa!** 🎉