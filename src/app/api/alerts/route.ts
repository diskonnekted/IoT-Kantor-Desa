import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const alerts = await db.alert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const alert = await db.alert.create({
      data: {
        title: data.title,
        message: data.message,
        alertType: data.alertType,
        sensorType: data.sensorType,
        isRead: false
      }
    })
    
    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { alertId, isRead } = await request.json()
    
    const alert = await db.alert.update({
      where: { id: alertId },
      data: { isRead }
    })
    
    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}