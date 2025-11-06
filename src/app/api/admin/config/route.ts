import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Default server configuration
const defaultConfig = {
  apiUrl: 'http://localhost:3000',
  wsUrl: 'ws://localhost:3000',
  port: 3000,
  environment: 'development',
  logLevel: 'info',
  maxConnections: 100,
  timeout: 30000,
  enableCors: true,
  enableCompression: true,
  enableRateLimit: true,
  rateLimitWindow: 900000, // 15 minutes
  rateLimitMax: 100,
  enableHttps: false,
  sslCertPath: '',
  sslKeyPath: '',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  redisUrl: process.env.REDIS_URL || '',
  enableCaching: true,
  cacheTimeout: 300000, // 5 minutes
  enableMonitoring: true,
  enableBackup: true,
  backupInterval: 86400000, // 24 hours
  maxBackups: 7,
  enableAuth: false,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  sessionTimeout: 3600000, // 1 hour
  enableWebhooks: false,
  webhookUrls: [],
  enableNotifications: true,
  notificationEmail: '',
  enableApiDocs: true,
  enableDebugMode: false
}

// GET - Get server configuration
export async function GET() {
  try {
    const configPath = join(process.cwd(), 'server-config.json')
    
    let config = defaultConfig
    
    // Try to read existing configuration
    if (existsSync(configPath)) {
      try {
        const savedConfig = readFileSync(configPath, 'utf8')
        config = { ...defaultConfig, ...JSON.parse(savedConfig) }
      } catch (error) {
        console.error('Error reading config file:', error)
      }
    }
    
    // Remove sensitive information from response
    const publicConfig = { ...config }
    delete publicConfig.jwtSecret
    delete publicConfig.sslCertPath
    delete publicConfig.sslKeyPath
    delete publicConfig.databaseUrl
    delete publicConfig.redisUrl
    
    return NextResponse.json(publicConfig)
    
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch configuration' 
    }, { status: 500 })
  }
}

// POST - Save server configuration
export async function POST(request: NextRequest) {
  try {
    const newConfig = await request.json()
    
    // Validate configuration
    if (!newConfig.apiUrl || !newConfig.port) {
      return NextResponse.json({ 
        error: 'Missing required configuration fields' 
      }, { status: 400 })
    }
    
    // Merge with default configuration
    const config = { ...defaultConfig, ...newConfig }
    
    // Save configuration to file
    const configPath = join(process.cwd(), 'server-config.json')
    writeFileSync(configPath, JSON.stringify(config, null, 2))
    
    // In a real implementation, you would also:
    // 1. Update environment variables
    // 2. Restart server with new configuration
    // 3. Validate configuration changes
    // 4. Log configuration changes
    
    return NextResponse.json({
      success: true,
      config: config,
      message: 'Configuration saved successfully'
    })
    
  } catch (error) {
    console.error('Error saving configuration:', error)
    return NextResponse.json({ 
      error: 'Failed to save configuration' 
    }, { status: 500 })
  }
}

// PUT - Update specific configuration
export async function PUT(request: NextRequest) {
  try {
    const { key, value } = await request.json()
    
    if (!key) {
      return NextResponse.json({ 
        error: 'Missing configuration key' 
      }, { status: 400 })
    }
    
    // Read current configuration
    const configPath = join(process.cwd(), 'server-config.json')
    let config = defaultConfig
    
    if (existsSync(configPath)) {
      try {
        const savedConfig = readFileSync(configPath, 'utf8')
        config = { ...defaultConfig, ...JSON.parse(savedConfig) }
      } catch (error) {
        console.error('Error reading config file:', error)
      }
    }
    
    // Update specific configuration
    config[key] = value
    
    // Save updated configuration
    writeFileSync(configPath, JSON.stringify(config, null, 2))
    
    return NextResponse.json({
      success: true,
      key,
      value,
      message: `Configuration ${key} updated successfully`
    })
    
  } catch (error) {
    console.error('Error updating configuration:', error)
    return NextResponse.json({ 
      error: 'Failed to update configuration' 
    }, { status: 500 })
  }
}