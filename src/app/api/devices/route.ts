import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

// POST - Register new device
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.deviceName || !data.deviceType || !data.location) {
      return NextResponse.json({ 
        error: 'Missing required fields: deviceName, deviceType, location' 
      }, { status: 400 })
    }
    
    // Check if device already exists
    const existingDevice = await db.deviceConfig.findUnique({
      where: { deviceName: data.deviceName }
    })
    
    if (existingDevice) {
      return NextResponse.json({ 
        error: 'Device already exists' 
      }, { status: 409 })
    }
    
    // Generate device key
    const deviceKey = generateDeviceKey(data.deviceName)
    
    // Create device configuration
    const device = await db.deviceConfig.create({
      data: {
        deviceName: data.deviceName,
        deviceType: data.deviceType,
        location: data.location,
        isActive: true,
      }
    })
    
    // Store device key securely (in production, use proper encryption)
    // For now, we'll return it to the user to configure in ESP32
    
    return NextResponse.json({
      success: true,
      device: {
        id: device.id,
        name: device.deviceName,
        type: device.deviceType,
        location: device.location,
        isActive: device.isActive,
        createdAt: device.createdAt
      },
      deviceKey: deviceKey,
      message: 'Device registered successfully'
    })
    
  } catch (error) {
    console.error('Error registering device:', error)
    return NextResponse.json({ 
      error: 'Failed to register device' 
    }, { status: 500 })
  }
}

// GET - List all devices
export async function GET() {
  try {
    const devices = await db.deviceConfig.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            sensorData: true
          }
        }
      }
    })
    
    // Get latest data for each device
    const devicesWithLatestData = await Promise.all(
      devices.map(async (device) => {
        const latestData = await db.sensorData.findFirst({
          where: { deviceName: device.deviceName },
          orderBy: { timestamp: 'desc' }
        })
        
        return {
          ...device,
          latestData,
          dataCount: device._count.sensorData
        }
      })
    )
    
    return NextResponse.json(devicesWithLatestData)
    
  } catch (error) {
    console.error('Error fetching devices:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch devices' 
    }, { status: 500 })
  }
}

// PATCH - Update device status
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.deviceId) {
      return NextResponse.json({ 
        error: 'Missing deviceId' 
      }, { status: 400 })
    }
    
    const updateData: any = {}
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.location !== undefined) updateData.location = data.location
    if (data.deviceType !== undefined) updateData.deviceType = data.deviceType
    
    const device = await db.deviceConfig.update({
      where: { id: data.deviceId },
      data: updateData
    })
    
    return NextResponse.json({
      success: true,
      device: device,
      message: 'Device updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating device:', error)
    return NextResponse.json({ 
      error: 'Failed to update device' 
    }, { status: 500 })
  }
}

// DELETE - Delete device
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    
    if (!deviceId) {
      return NextResponse.json({ 
        error: 'Missing deviceId parameter' 
      }, { status: 400 })
    }
    
    // Delete related sensor data first
    await db.sensorData.deleteMany({
      where: { deviceName: deviceId }
    })
    
    // Delete device
    await db.deviceConfig.delete({
      where: { id: deviceId }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Device deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting device:', error)
    return NextResponse.json({ 
      error: 'Failed to delete device' 
    }, { status: 500 })
  }
}

// Generate device key
function generateDeviceKey(deviceName: string): string {
  const timestamp = Date.now().toString(36)
  const random = randomBytes(4).toString('hex')
  return `device_${deviceName}_${timestamp}_${random}`
}