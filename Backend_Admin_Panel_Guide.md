# 🔧 Backend Admin Panel - IoT Kantor Desa

## 📋 Overview

Backend Admin Panel adalah halaman administrasi lengkap untuk mengelola sistem IoT Kantor Desa. Panel ini menyediakan tools untuk monitoring, konfigurasi, dan manajemen perangkat serta API.

## 🌐 Access URLs

- **Dashboard Utama**: `http://localhost:3000/`
- **Device Management**: `http://localhost:3000/devices`
- **Admin Panel**: `http://localhost:3000/admin`
- **API Documentation**: `http://localhost:3000/api-docs`

## 🎯 Features

### 1. **Admin Dashboard** (`/admin`)
- **System Overview**: Status server, memory, CPU, disk usage
- **Device Management**: Monitor dan kontrol semua perangkat IoT
- **API Status**: Monitoring performa API endpoints
- **System Monitoring**: Real-time metrics dan logs
- **Server Configuration**: Pengaturan konfigurasi server

### 2. **Device Management** (`/devices`)
- **Device Registration**: Tambah device baru dengan auto-generate key
- **Device Status**: Monitor online/offline status
- **Device Control**: Enable/disable perangkat
- **Real-time Data**: Lihat data sensor terakhir per device
- **Device Analytics**: Statistik penggunaan per device

### 3. **API Documentation** (`/api-docs`)
- **Interactive API Docs**: Dokumentasi semua endpoints
- **API Testing Interface**: Test API langsung dari browser
- **cURL Generator**: Generate command untuk testing
- **Request/Response Examples**: Contoh penggunaan API
- **Test History**: Riwayat hasil testing API

## 🔧 API Endpoints

### Device Management
```bash
# Register new device
POST /api/devices
Content-Type: application/json
{
  "deviceName": "ESP32_Water_01",
  "deviceType": "WaterLevel", 
  "location": "Tandon Air Utama"
}

# Get all devices
GET /api/devices

# Update device status
PATCH /api/devices
Content-Type: application/json
{
  "deviceId": "device_id_here",
  "isActive": true
}

# Delete device
DELETE /api/devices?deviceId=device_id_here
```

### ESP32 Communication
```bash
# Send sensor data
POST /api/esp32
x-device-id: WaterTank01
x-device-key: device_WaterTank01_key_2024
Content-Type: application/json
{
  "sensorType": "water_level",
  "deviceName": "WaterTank01", 
  "waterLevel": 75.5,
  "timestamp": "2025-11-06T08:08:07.844Z"
}

# Get device configuration
GET /api/esp32?deviceId=WaterTank01
x-device-id: WaterTank01
x-device-key: device_WaterTank01_key_2024
```

### Admin APIs
```bash
# Get system information
GET /api/admin/system

# Get API endpoints status
GET /api/admin/endpoints

# Get system logs
GET /api/admin/logs

# Get server configuration
GET /api/admin/config

# Update server configuration
POST /api/admin/config
Content-Type: application/json
{
  "apiUrl": "http://localhost:3000",
  "port": 3000,
  "environment": "production"
}

# Restart server
POST /api/admin/restart
```

### Data APIs
```bash
# Get sensor data
GET /api/sensors?limit=50&deviceName=WaterTank01

# Get alerts
GET /api/alerts?isRead=false

# Create alert (internal use)
POST /api/alerts
Content-Type: application/json
{
  "title": "Ketinggian Air Rendah",
  "message": "Tandon air mencapai 30%",
  "alertType": "warning",
  "sensorType": "water_level"
}
```

## 🔐 Authentication System

### Device Authentication
Setiap ESP32 device menggunakan **Device ID** dan **Device Key** untuk authentication:

1. **Device Registration**: Device didaftarkan melalui admin panel
2. **Key Generation**: System generate unique device key
3. **API Authentication**: Device mengirim headers:
   ```
   x-device-id: WaterTank01
   x-device-key: device_WaterTank01_key_2024
   ```

### Admin Authentication (Future Enhancement)
- User login system
- Role-based access control
- Session management
- API key authentication

## 📊 Monitoring & Analytics

### System Metrics
- **Server Uptime**: Duration server running
- **Memory Usage**: RAM consumption monitoring
- **CPU Usage**: Processor utilization
- **Disk Usage**: Storage monitoring
- **Network Traffic**: Request/response statistics

### Device Metrics
- **Connection Status**: Online/offline monitoring
- **Data Frequency**: Sensor data update rate
- **Response Time**: Device communication latency
- **Error Rate**: Failed connection attempts
- **Last Seen**: Last device activity timestamp

### API Metrics
- **Request Count**: Total API requests
- **Response Time**: Average response time
- **Error Rate**: Failed request percentage
- **Endpoint Usage**: Most used endpoints
- **Status Codes**: HTTP status distribution

## 🛠️ Configuration Management

### Server Configuration
```json
{
  "apiUrl": "http://localhost:3000",
  "wsUrl": "ws://localhost:3000", 
  "port": 3000,
  "environment": "development",
  "logLevel": "info",
  "maxConnections": 100,
  "timeout": 30000,
  "enableCors": true,
  "enableCompression": true,
  "enableRateLimit": true,
  "enableMonitoring": true,
  "enableBackup": true
}
```

### Database Configuration
- **SQLite**: Default database untuk development
- **Connection Pool**: Manage database connections
- **Backup System**: Automatic data backup
- **Query Optimization**: Performance monitoring

## 📝 Logging System

### Log Types
- **System Logs**: Server events dan errors
- **Device Logs**: Device connection activities
- **API Logs**: Request/response logging
- **Error Logs**: Exception dan error tracking
- **Security Logs**: Authentication attempts

### Log Management
- **Real-time Viewing**: Live log streaming
- **Log Filtering**: Filter by level dan source
- **Log Export**: Download log files
- **Log Rotation**: Automatic log cleanup
- **Search Function**: Search log entries

## 🔧 Troubleshooting

### Common Issues

#### Device Connection Problems
```bash
# Check device status
curl http://localhost:3000/api/devices

# Test ESP32 endpoint
curl -X POST http://localhost:3000/api/esp32 \
  -H "x-device-id: WaterTank01" \
  -H "x-device-key: device_WaterTank01_key_2024" \
  -d '{"sensorType":"water_level","deviceName":"WaterTank01","waterLevel":75}'
```

#### API Issues
```bash
# Check API endpoints status
curl http://localhost:3000/api/admin/endpoints

# Check system status
curl http://localhost:3000/api/admin/system

# View logs
curl http://localhost:3000/api/admin/logs
```

#### Server Issues
```bash
# Restart server
curl -X POST http://localhost:3000/api/admin/restart

# Check configuration
curl http://localhost:3000/api/admin/config
```

### Debug Mode
Enable debug mode untuk detailed logging:
```json
{
  "logLevel": "debug",
  "enableDebugMode": true
}
```

## 🚀 Performance Optimization

### Database Optimization
- **Indexing**: Optimize query performance
- **Connection Pooling**: Manage database connections
- **Query Caching**: Cache frequent queries
- **Data Archiving**: Archive old sensor data

### API Optimization
- **Rate Limiting**: Prevent API abuse
- **Response Caching**: Cache API responses
- **Compression**: Reduce response size
- **CDN Integration**: Static asset delivery

### Monitoring Optimization
- **Metrics Collection**: Efficient data collection
- **Alert Thresholds**: Optimize alert triggers
- **Log Management**: Efficient log handling
- **Resource Monitoring**: Track resource usage

## 🔒 Security Best Practices

### API Security
- **Input Validation**: Validate all input data
- **Rate Limiting**: Prevent API abuse
- **CORS Configuration**: Proper cross-origin setup
- **HTTPS**: Enable SSL/TLS in production

### Device Security
- **Device Key Rotation**: Regular key updates
- **IP Whitelisting**: Restrict device access
- **Connection Encryption**: Secure device communication
- **Device Authentication**: Strong authentication

### Data Security
- **Data Encryption**: Encrypt sensitive data
- **Access Control**: Role-based permissions
- **Audit Logging**: Track all activities
- **Backup Security**: Secure backup storage

## 📈 Scaling Considerations

### Horizontal Scaling
- **Load Balancing**: Distribute server load
- **Database Sharding**: Partition database
- **Microservices**: Split into services
- **Container Orchestration**: Docker/Kubernetes

### Vertical Scaling
- **Resource Allocation**: CPU/memory scaling
- **Database Optimization**: Query optimization
- **Caching Strategy**: Multi-level caching
- **Performance Monitoring**: Continuous optimization

## 📚 Development Guide

### Adding New Features
1. **API Endpoint**: Create new route in `/api/`
2. **Database Model**: Update Prisma schema
3. **Frontend Component**: Create React component
4. **Navigation**: Add to sidebar navigation
5. **Documentation**: Update API docs

### Testing
```bash
# Run tests
npm test

# API testing
npm run test:api

# Integration testing
npm run test:integration
```

### Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy with Docker
docker build -t iot-kantor-desa .
docker run -p 3000:3000 iot-kantor-desa
```

---

## 🆘 Support

Untuk bantuan dan troubleshooting:
1. Cek **System Logs** di admin panel
2. Test **API Endpoints** via API documentation
3. Monitor **Device Status** di device management
4. Review **Configuration** di server settings

**Backend Admin Panel** menyediakan semua tools yang diperlukan untuk mengelola sistem IoT Kantor Desa secara efisien dan aman! 🎉