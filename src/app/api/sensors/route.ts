import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const sensorData = await db.sensorData.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    })
    
    return NextResponse.json(sensorData)
  } catch (error) {
    console.error('Error fetching sensor data:', error)
    return NextResponse.json({ error: 'Failed to fetch sensor data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
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
    
    return NextResponse.json(sensorData)
  } catch (error) {
    console.error('Error saving sensor data:', error)
    return NextResponse.json({ error: 'Failed to save sensor data' }, { status: 500 })
  }
}