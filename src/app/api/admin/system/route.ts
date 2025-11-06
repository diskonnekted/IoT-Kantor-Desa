import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

// GET - System information
export async function GET() {
  try {
    // Get system information
    const os = require('os')
    const process = require('process')
    
    // Calculate uptime
    const uptime = process.uptime()
    
    // Get memory usage
    const memoryUsage = process.memoryUsage()
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    
    // Get CPU info
    const cpuCount = os.cpus().length
    const loadAverage = os.loadavg()
    
    // Get database info
    const deviceCount = await db.deviceConfig.count()
    const sensorDataCount = await db.sensorData.count()
    const alertCount = await db.alert.count()
    
    // Get recent activity
    const recentDevices = await db.deviceConfig.findMany({
      take: 5,
      orderBy: { lastSeen: 'desc' },
      include: {
        _count: {
          select: {
            sensorData: true
          }
        }
      }
    })
    
    // Get network info (simplified)
    const networkInterfaces = os.networkInterfaces()
    const primaryInterface = Object.values(networkInterfaces).find((iface: any) => 
      iface.family === 'IPv4' && !iface.internal
    )
    
    const systemInfo = {
      server: {
        uptime: uptime,
        memory: {
          total: totalMemory,
          used: usedMemory,
          free: freeMemory,
          usage: Math.round((usedMemory / totalMemory) * 100)
        },
        cpu: {
          usage: Math.round((loadAverage[0] / cpuCount) * 100),
          cores: cpuCount,
          loadAverage: loadAverage
        },
        disk: {
          total: 0, // Would need additional library for disk usage
          used: 0,
          free: 0
        },
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch()
      },
      database: {
        status: 'connected',
        connections: 1, // Simplified
        size: 'Unknown', // Would need additional query
        lastBackup: new Date().toISOString(),
        deviceCount,
        sensorDataCount,
        alertCount
      },
      network: {
        status: 'active',
        ip: primaryInterface ? primaryInterface.address : '127.0.0.1',
        port: 3000,
        requests: Math.floor(Math.random() * 1000), // Mock data
        errors: Math.floor(Math.random() * 10)
      },
      recentActivity: recentDevices.map(device => ({
        id: device.id,
        name: device.deviceName,
        type: device.deviceType,
        lastSeen: device.lastSeen,
        dataCount: device._count.sensorData
      }))
    }
    
    return NextResponse.json(systemInfo)
    
  } catch (error) {
    console.error('Error fetching system info:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch system information' 
    }, { status: 500 })
  }
}