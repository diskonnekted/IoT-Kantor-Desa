import { Server } from 'socket.io';
import { db } from './db';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join dashboard room for real-time updates
    socket.join('dashboard');
    
    // Handle sensor data from ESP32 devices
    socket.on('sensor_data', async (data) => {
      try {
        // Save sensor data to database
        const sensorData = await db.sensorData.create({
          data: {
            sensorType: data.sensorType,
            deviceName: data.deviceName,
            voltage: data.voltage,
            current: data.current,
            power: data.power,
            energy: data.energy,
            frequency: data.frequency,
            powerFactor: data.powerFactor,
            waterLevel: data.waterLevel,
            detected: data.detected,
            temperature: data.temperature,
            humidity: data.humidity,
            smokeLevel: data.smokeLevel,
            rainfall: data.rainfall,
            rainIntensity: data.rainIntensity,
            isRaining: data.isRaining,
            tariff: data.tariff,
            cost: data.cost,
            timestamp: new Date(data.timestamp || Date.now())
          }
        });
        
        // Broadcast to all dashboard clients
        io.to('dashboard').emit('sensor_update', sensorData);
        
        // Check for alerts and create if needed
        await checkAndCreateAlerts(data);
        
      } catch (error) {
        console.error('Error processing sensor data:', error);
        socket.emit('error', { message: 'Failed to process sensor data' });
      }
    });
    
    // Handle device registration
    socket.on('register_device', async (deviceData) => {
      try {
        const device = await db.deviceConfig.upsert({
          where: { deviceName: deviceData.deviceName },
          update: { 
            lastSeen: new Date(),
            isActive: true 
          },
          create: {
            deviceName: deviceData.deviceName,
            deviceType: deviceData.deviceType,
            location: deviceData.location || 'Unknown',
            isActive: true,
            lastSeen: new Date()
          }
        });
        
        socket.emit('device_registered', device);
        io.to('dashboard').emit('device_status', device);
        
      } catch (error) {
        console.error('Error registering device:', error);
        socket.emit('error', { message: 'Failed to register device' });
      }
    });
    
    // Handle request for latest sensor data
    socket.on('get_latest_data', async () => {
      try {
        const latestData = await db.sensorData.findMany({
          orderBy: { timestamp: 'desc' },
          take: 10
        });
        
        socket.emit('latest_data', latestData);
      } catch (error) {
        console.error('Error fetching latest data:', error);
        socket.emit('error', { message: 'Failed to fetch latest data' });
      }
    });
    
    // Handle alert marking as read
    socket.on('mark_alert_read', async (alertId) => {
      try {
        const alert = await db.alert.update({
          where: { id: alertId },
          data: { isRead: true }
        });
        
        io.to('dashboard').emit('alert_updated', alert);
      } catch (error) {
        console.error('Error marking alert as read:', error);
        socket.emit('error', { message: 'Failed to mark alert as read' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

// Helper function to check and create alerts based on sensor data
async function checkAndCreateAlerts(data: any) {
  try {
    // Check water level
    if (data.waterLevel && data.waterLevel < 30) {
      await db.alert.create({
        data: {
          title: 'Ketinggian Air Rendah',
          message: `Tandon air mencapai ${data.waterLevel}%, segera isi ulang`,
          alertType: 'warning',
          sensorType: 'water_level'
        }
      });
    }
    
    // Check high power consumption
    if (data.power && data.power > 5000) {
      await db.alert.create({
        data: {
          title: 'Konsumsi Listrik Tinggi',
          message: `Pemakaian daya mencapai ${data.power}W, melebihi batas aman`,
          alertType: 'warning',
          sensorType: 'electricity'
        }
      });
    }
    
    // Check smoke detection
    if (data.smokeLevel && data.smokeLevel > 50) {
      await db.alert.create({
        data: {
          title: 'Deteksi Asap Tinggi',
          message: `Tingkat asap mencapai ${data.smokeLevel}ppm, waspada kebakaran`,
          alertType: 'danger',
          sensorType: 'smoke'
        }
      });
    }
    
    // Check heavy rain alert
    if (data.isRaining && data.rainIntensity === 'Hujan Lebat') {
      await db.alert.create({
        data: {
          title: 'Hujan Lebat',
          message: `Terdeteksi hujan lebat, waspada potensi banjir`,
          alertType: 'warning',
          sensorType: 'rain'
        }
      });
    }
    
    // Check IR detection during off hours
    if (data.detected && data.sensorType === 'ir_detector') {
      const hour = new Date().getHours();
      if (hour >= 17 || hour <= 6) {
        await db.alert.create({
          data: {
            title: 'Aktivitas di Luar Jam Kerja',
            message: 'Terdeteksi aktivitas pada jam off kantor',
            alertType: 'info',
            sensorType: 'ir_detector'
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Error creating alerts:', error);
  }
}