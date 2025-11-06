'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Server, 
  Database, 
  Wifi, 
  WifiOff, 
  Activity,
  Settings,
  Users,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  HardDrive,
  Memory,
  Cpu,
  RefreshCw,
  Eye,
  Copy,
  Download,
  Upload,
  Terminal,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Power,
  PowerOff,
  Edit,
  Trash2,
  Plus,
  Save,
  X
} from 'lucide-react'

interface SystemInfo {
  server: {
    uptime: string
    memory: {
      total: number
      used: number
      free: number
    }
    cpu: {
      usage: number
      cores: number
    }
    disk: {
      total: number
      used: number
      free: number
    }
  }
  database: {
    status: string
    connections: number
    size: string
    lastBackup: string
  }
  network: {
    status: string
    ip: string
    port: number
    requests: number
    errors: number
  }
}

interface Device {
  id: string
  deviceName: string
  deviceType: string
  location: string
  isActive: boolean
  lastSeen: string | null
  createdAt: string
  latestData?: any
  dataCount: number
  status: 'online' | 'offline' | 'warning'
}

interface ApiEndpoint {
  path: string
  method: string
  status: number
  responseTime: number
  requests: number
  errors: number
  lastCalled: string
}

interface ServerConfig {
  apiUrl: string
  wsUrl: string
  port: number
  environment: string
  logLevel: string
  maxConnections: number
  timeout: number
}

export default function AdminDashboard() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([])
  const [serverConfig, setServerConfig] = useState<ServerConfig>({
    apiUrl: 'http://localhost:3000',
    wsUrl: 'ws://localhost:3000',
    port: 3000,
    environment: 'development',
    logLevel: 'info',
    maxConnections: 100,
    timeout: 30000
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [showLogsDialog, setShowLogsDialog] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSystemInfo()
    fetchDevices()
    fetchApiEndpoints()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSystemInfo()
      fetchDevices()
      fetchApiEndpoints()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/admin/system')
      if (response.ok) {
        const data = await response.json()
        setSystemInfo(data)
      }
    } catch (error) {
      console.error('Error fetching system info:', error)
    }
  }

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices')
      if (response.ok) {
        const data = await response.json()
        setDevices(data)
      }
    } catch (error) {
      console.error('Error fetching devices:', error)
    }
  }

  const fetchApiEndpoints = async () => {
    try {
      const response = await fetch('/api/admin/endpoints')
      if (response.ok) {
        const data = await response.json()
        setApiEndpoints(data)
      }
    } catch (error) {
      console.error('Error fetching API endpoints:', error)
    }
  }

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs')
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  const handleSaveConfig = async () => {
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverConfig)
      })
      
      if (response.ok) {
        setShowConfigDialog(false)
        setError('')
      } else {
        setError('Failed to save configuration')
      }
    } catch (error) {
      setError('Error saving configuration')
    }
  }

  const handleRestartServer = async () => {
    if (!confirm('Are you sure you want to restart the server? This will disconnect all devices.')) {
      return
    }
    
    try {
      const response = await fetch('/api/admin/restart', {
        method: 'POST'
      })
      
      if (response.ok) {
        alert('Server restart initiated. Please wait a moment...')
      } else {
        setError('Failed to restart server')
      }
    } catch (error) {
      setError('Error restarting server')
    }
  }

  const handleToggleDevice = async (deviceId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/devices', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId, isActive: !isActive })
      })
      
      if (response.ok) {
        fetchDevices()
      }
    } catch (error) {
      setError('Error updating device')
    }
  }

  const getDeviceStatus = (device: Device) => {
    if (!device.isActive) return { status: 'disabled', color: 'bg-gray-500', icon: PowerOff }
    
    if (!device.lastSeen) return { status: 'offline', color: 'bg-red-500', icon: WifiOff }
    
    const lastSeenTime = new Date(device.lastSeen).getTime()
    const now = new Date().getTime()
    const diffMinutes = (now - lastSeenTime) / (1000 * 60)
    
    if (diffMinutes < 5) return { status: 'online', color: 'bg-green-500', icon: Wifi }
    if (diffMinutes < 30) return { status: 'warning', color: 'bg-yellow-500', icon: AlertTriangle }
    return { status: 'offline', color: 'bg-red-500', icon: WifiOff }
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Server className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-slate-600 mt-2">System management and monitoring</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setShowConfigDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Server Config
            </Button>
            <Button variant="outline" onClick={() => { fetchLogs(); setShowLogsDialog(true) }}>
              <Terminal className="h-4 w-4 mr-2" />
              View Logs
            </Button>
            <Button variant="destructive" onClick={handleRestartServer}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart Server
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="api">API Status</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-500" />
                  Server Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Status</span>
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Uptime</span>
                    <span className="text-sm font-medium">
                      {systemInfo ? formatUptime(systemInfo.server.uptime) : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Environment</span>
                    <Badge variant="outline">
                      {serverConfig.environment}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Status</span>
                    <Badge variant="default" className="bg-green-500">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Connections</span>
                    <span className="text-sm font-medium">
                      {systemInfo?.database.connections || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Size</span>
                    <span className="text-sm font-medium">
                      {systemInfo?.database.size || 'Unknown'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Memory className="h-5 w-5 text-yellow-500" />
                  Memory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Used</span>
                    <span className="text-sm font-medium">
                      {systemInfo ? formatBytes(systemInfo.server.memory.used) : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total</span>
                    <span className="text-sm font-medium">
                      {systemInfo ? formatBytes(systemInfo.server.memory.total) : 'Loading...'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: `${systemInfo ? (systemInfo.server.memory.used / systemInfo.server.memory.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Status</span>
                    <Badge variant="default" className="bg-green-500">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Port</span>
                    <span className="text-sm font-medium">{serverConfig.port}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Requests</span>
                    <span className="text-sm font-medium">
                      {systemInfo?.network.requests || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Manage Devices
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  View Logs
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Management</CardTitle>
              <CardDescription>Monitor and manage all connected IoT devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device) => {
                  const deviceStatus = getDeviceStatus(device)
                  return (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${deviceStatus.color}`}></div>
                        <div>
                          <h4 className="font-medium">{device.deviceName}</h4>
                          <p className="text-sm text-slate-600">
                            {device.deviceType} • {device.location}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {device.dataCount} data points
                          </p>
                          <p className="text-xs text-slate-600">
                            Last seen: {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}
                          </p>
                        </div>
                        
                        <Badge variant={device.isActive ? 'default' : 'secondary'}>
                          {deviceStatus.status}
                        </Badge>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleDevice(device.id, device.isActive)}
                        >
                          {device.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Status Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints Status</CardTitle>
              <CardDescription>Monitor API performance and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant={endpoint.status === 200 ? 'default' : 'destructive'}>
                        {endpoint.method}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{endpoint.path}</h4>
                        <p className="text-sm text-slate-600">
                          Response time: {endpoint.responseTime}ms
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {endpoint.requests} requests
                        </p>
                        <p className="text-xs text-slate-600">
                          {endpoint.errors} errors
                        </p>
                      </div>
                      
                      <Badge variant={endpoint.status === 200 ? 'default' : 'destructive'}>
                        {endpoint.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time system metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-slate-600">
                        {systemInfo?.server.cpu.usage || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${systemInfo?.server.cpu.usage || 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-slate-600">
                        {systemInfo ? Math.round((systemInfo.server.memory.used / systemInfo.server.memory.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ 
                          width: `${systemInfo ? Math.round((systemInfo.server.memory.used / systemInfo.server.memory.total) * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className="text-sm text-slate-600">
                        {systemInfo ? Math.round((systemInfo.server.disk.used / systemInfo.server.disk.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${systemInfo ? Math.round((systemInfo.server.disk.used / systemInfo.server.disk.total) * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Statistics</CardTitle>
                <CardDescription>Network performance and traffic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Requests</span>
                    <span className="text-sm font-medium">
                      {systemInfo?.network.requests || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-sm font-medium">
                      {systemInfo ? Math.round((systemInfo.network.errors / systemInfo.network.requests) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Server IP</span>
                    <span className="text-sm font-medium">
                      {systemInfo?.network.ip || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Port</span>
                    <span className="text-sm font-medium">
                      {systemInfo?.network.port || 3000}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Server Configuration</CardTitle>
              <CardDescription>Manage server settings and API configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiUrl">API URL</Label>
                    <Input
                      id="apiUrl"
                      value={serverConfig.apiUrl}
                      onChange={(e) => setServerConfig({...serverConfig, apiUrl: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="wsUrl">WebSocket URL</Label>
                    <Input
                      id="wsUrl"
                      value={serverConfig.wsUrl}
                      onChange={(e) => setServerConfig({...serverConfig, wsUrl: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={serverConfig.port}
                      onChange={(e) => setServerConfig({...serverConfig, port: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select value={serverConfig.environment} onValueChange={(value) => setServerConfig({...serverConfig, environment: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="logLevel">Log Level</Label>
                    <Select value={serverConfig.logLevel} onValueChange={(value) => setServerConfig({...serverConfig, logLevel: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxConnections">Max Connections</Label>
                    <Input
                      id="maxConnections"
                      type="number"
                      value={serverConfig.maxConnections}
                      onChange={(e) => setServerConfig({...serverConfig, maxConnections: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveConfig}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Server Configuration</DialogTitle>
            <DialogDescription>
              Configure server settings and API parameters
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dialogApiUrl">API URL</Label>
                <Input
                  id="dialogApiUrl"
                  value={serverConfig.apiUrl}
                  onChange={(e) => setServerConfig({...serverConfig, apiUrl: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="dialogWsUrl">WebSocket URL</Label>
                <Input
                  id="dialogWsUrl"
                  value={serverConfig.wsUrl}
                  onChange={(e) => setServerConfig({...serverConfig, wsUrl: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveConfig}>
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>System Logs</DialogTitle>
            <DialogDescription>
              Real-time system logs and events
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLogs([])}>
                Clear Logs
              </Button>
              <Button variant="outline" onClick={fetchLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowLogsDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}