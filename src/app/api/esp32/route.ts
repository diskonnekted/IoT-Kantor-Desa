import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Device authentication middleware
async function authenticateDevice(request: NextRequest) {
  const deviceId = request.headers.get('x-device-id')
  const deviceKey = request.headers.get('x-device-key')
  
  if (!deviceId || !deviceKey) {
    return { error: 'Missing device credentials', status: 401 }
  }
  
  // Check if device exists and is active
  const device = await db.deviceConfig.findUnique({
    where: { deviceName: deviceId }
  })
  
  if (!device || !device.isActive) {
    return { error: 'Device not found or inactive', status: 403 }
  }
  
  // Simple key validation (in production, use more secure method)
  const expectedKey = `device_${deviceId}_key_2024`
  if (deviceKey !== expectedKey) {
    return { error: 'Invalid device key', status: 401 }
  }
  
  return { device, status: 200 }
}

// POST - ESP32 sends sensor data
export async function POST(request: NextRequest) {
  try {
    // Authenticate device
    const auth = await authenticateDevice(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.sensorType || !data.deviceName) {
      return NextResponse.json({ 
        error: 'Missing required fields: sensorType, deviceName' 
      }, { status: 400 })
    }
    
    // Create sensor data record
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
    })
    
    // Update device last seen
    await db.deviceConfig.update({
      where: { deviceName: data.deviceName },
      data: { lastSeen: new Date() }
    })
    
    // Check for alerts based on sensor data
    await checkAndCreateAlerts(data)
    
    return NextResponse.json({ 
      success: true, 
      dataId: sensorData.id,
      message: 'Sensor data received successfully'
    })
    
  } catch (error) {
    console.error('Error processing ESP32 data:', error)
    return NextResponse.json({ 
      error: 'Failed to process sensor data' 
    }, { status: 500 })
  }
}

// GET - ESP32 gets device configuration
export async function GET(request: NextRequest) {
  try {
    // Authenticate device
    const auth = await authenticateDevice(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    
    if (!deviceId) {
      return NextResponse.json({ 
        error: 'Missing deviceId parameter' 
      }, { status: 400 })
    }
    
    // Get device configuration
    const device = await db.deviceConfig.findUnique({
      where: { deviceName: deviceId }
    })
    
    if (!device) {
      return NextResponse.json({ 
        error: 'Device not found' 
      }, { status: 404 })
    }
    
    // Get latest sensor data for this device
    const latestData = await db.sensorData.findFirst({
      where: { deviceName: deviceId },
      orderBy: { timestamp: 'desc' }
    })
    
    return NextResponse.json({
      device: {
        name: device.deviceName,
        type: device.deviceType,
        location: device.location,
        isActive: device.isActive,
        lastSeen: device.lastSeen
      },
      latestData: latestData,
      serverTime: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error getting device config:', error)
    return NextResponse.json({ 
      error: 'Failed to get device configuration' 
    }, { status: 500 })
  }
}

// Function to check and create alerts based on sensor data
async function checkAndCreateAlerts(data: any) {
  try {
    const alerts = []
    
    // Water level alerts
    if (data.sensorType === 'water_level' && data.waterLevel) {
      if (data.waterLevel < 30) {
        alerts.push({
          title: 'Ketinggian Air Kritis',
          message: `Tandon air mencapai ${data.waterLevel}%, segera isi ulang!`,
          alertType: 'danger',
          sensorType: 'water_level'
        })
      } else if (data.waterLevel < 50) {
        alerts.push({
          title: 'Ketinggian Air Rendah',
          message: `Tandon air mencapai ${data.waterLevel}%, pertimbangkan untuk mengisi`,
          alertType: 'warning',
          sensorType: 'water_level'
        })
      }
    }
    
    // Electricity alerts
    if (data.sensorType === 'electricity' && data.power) {
      if (data.power > 5000) {
        alerts.push({
          title: 'Daya Listrik Tinggi',
          message: `Penggunaan daya mencapai ${data.power}W, perhatikan beban`,
          alertType: 'warning',
          sensorType: 'electricity'
        })
      }
    }
    
    // Smoke alerts
    if (data.sensorType === 'smoke' && data.smokeLevel) {
      if (data.smokeLevel > 50) {
        alerts.push({
          title: 'Terdeteksi Asap Tinggi',
          message: `Level asap mencapai ${data.smokeLevel}, waspadai bahaya kebakaran!`,
          alertType: 'danger',
          sensorType: 'smoke'
        })
      } else if (data.smokeLevel > 30) {
        alerts.push({
          title: 'Terdeteksi Asap',
          message: `Level asap mencapai ${data.smokeLevel}, periksa area sekitar`,
          alertType: 'warning',
          sensorType: 'smoke'
        })
      }
    }
    
    // Temperature alerts
    if (data.sensorType === 'temperature_humidity' && data.temperature) {
      if (data.temperature > 35) {
        alerts.push({
          title: 'Suhu Tinggi',
          message: `Suhu mencapai ${data.temperature}°C, pastikan ventilasi baik`,
          alertType: 'warning',
          sensorType: 'temperature_humidity'
        })
      }
    }
    
    // IR Motion alerts (only for certain rooms)
    if (data.sensorType === 'ir_detector' && data.detected && data.roomName) {
      if (data.roomName === 'Ruang Arsip') {
        alerts.push({
          title: 'Aktivitas di Ruang Arsip',
          message: 'Sensor IR mendeteksi gerakan di ruang arsip',
          alertType: 'info',
          sensorType: 'ir_detector'
        })
      }
    }
    
    // Create alerts in database
    for (const alert of alerts) {
      await db.alert.create({
        data: alert
      })
    }
    
  } catch (error) {
    console.error('Error creating alerts:', error)
  }
}