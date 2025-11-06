const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with IoT sample data...');

  // Clear existing data
  await prisma.sensorData.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.deviceConfig.deleteMany();

  // Create device configurations
  const devices = await Promise.all([
    prisma.deviceConfig.create({
      data: {
        deviceName: 'PZEM-004T',
        deviceType: 'PZEM-004T',
        location: 'Kantor Utama',
        isActive: true,
      },
    }),
    prisma.deviceConfig.create({
      data: {
        deviceName: 'WaterTank01',
        deviceType: 'WaterLevel',
        location: 'Tandon Air',
        isActive: true,
      },
    }),
    prisma.deviceConfig.create({
      data: {
        deviceName: 'IR01',
        deviceType: 'IR',
        location: 'Ruang Aula',
        isActive: true,
      },
    }),
    prisma.deviceConfig.create({
      data: {
        deviceName: 'IR02',
        deviceType: 'IR',
        location: 'Ruang Arsip',
        isActive: true,
      },
    }),
    prisma.deviceConfig.create({
      data: {
        deviceName: 'IR03',
        deviceType: 'IR',
        location: 'Ruang Layanan',
        isActive: true,
      },
    }),
    prisma.deviceConfig.create({
      data: {
        deviceName: 'DHT22',
        deviceType: 'DHT22',
        location: 'Kantor Utama',
        isActive: true,
      },
    }),
    prisma.deviceConfig.create({
      data: {
        deviceName: 'Smoke01',
        deviceType: 'Smoke',
        location: 'Kantor Utama',
        isActive: true,
      },
    }),
    prisma.deviceConfig.create({
      data: {
        deviceName: 'RainSensor01',
        deviceType: 'RainSensor',
        location: 'Luar Kantor',
        isActive: true,
      },
    }),
  ]);

  console.log('Created device configurations');

  // Create sensor data
  const sensorData = await Promise.all([
    // Electricity data
    prisma.sensorData.create({
      data: {
        sensorType: 'electricity',
        deviceName: 'PZEM-004T',
        voltage: 220.5,
        current: 15.2,
        power: 3350,
        energy: 1245.6,
        frequency: 50.0,
        powerFactor: 0.95,
        tariff: 1444.70,
        cost: 1800000,
        timestamp: new Date(),
      },
    }),
    // Water level data
    prisma.sensorData.create({
      data: {
        sensorType: 'water_level',
        deviceName: 'WaterTank01',
        waterLevel: 75,
        timestamp: new Date(),
      },
    }),
    // IR detector data
    prisma.sensorData.create({
      data: {
        sensorType: 'ir_detector',
        deviceName: 'IR01',
        detected: false,
        timestamp: new Date(),
      },
    }),
    prisma.sensorData.create({
      data: {
        sensorType: 'ir_detector',
        deviceName: 'IR02',
        detected: true,
        timestamp: new Date(),
      },
    }),
    prisma.sensorData.create({
      data: {
        sensorType: 'ir_detector',
        deviceName: 'IR03',
        detected: false,
        timestamp: new Date(),
      },
    }),
    // Temperature and humidity data
    prisma.sensorData.create({
      data: {
        sensorType: 'temperature_humidity',
        deviceName: 'DHT22',
        temperature: 28.5,
        humidity: 65,
        timestamp: new Date(),
      },
    }),
    // Smoke sensor data
    prisma.sensorData.create({
      data: {
        sensorType: 'smoke',
        deviceName: 'Smoke01',
        smokeLevel: 12,
        timestamp: new Date(),
      },
    }),
    // Rain sensor data
    prisma.sensorData.create({
      data: {
        sensorType: 'rain',
        deviceName: 'RainSensor01',
        rainfall: 2.5,
        rainIntensity: 'Hujan Ringan',
        isRaining: true,
        timestamp: new Date(),
      },
    }),
  ]);

  console.log('Created sensor data');

  // Create alerts
  const alerts = await Promise.all([
    prisma.alert.create({
      data: {
        title: 'Ketinggian Air Rendah',
        message: 'Tandon air mencapai 30%, segera isi ulang',
        alertType: 'warning',
        sensorType: 'water_level',
        isRead: false,
      },
    }),
    prisma.alert.create({
      data: {
        title: 'Aktivitas Terdeteksi di Ruang Arsip',
        message: 'Sensor IR mendeteksi gerakan di ruang arsip',
        alertType: 'info',
        sensorType: 'ir_detector',
        isRead: false,
      },
    }),
    prisma.alert.create({
      data: {
        title: 'Pengunjung di Ruang Layanan',
        message: 'Sensor IR mendeteksi kehadiran pengunjung',
        alertType: 'info',
        sensorType: 'ir_detector',
        isRead: false,
      },
    }),
  ]);

  console.log('Created alerts');

  console.log('Database seeded successfully!');
  console.log(`Created ${devices.length} devices, ${sensorData.length} sensor readings, and ${alerts.length} alerts`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });