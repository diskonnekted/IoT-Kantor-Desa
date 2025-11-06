'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Settings, 
  Trash2, 
  Wifi, 
  WifiOff, 
  Activity,
  MapPin,
  Clock,
  Microchip,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

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
}

interface NewDevice {
  deviceName: string
  deviceType: string
  location: string
}

export default function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newDevice, setNewDevice] = useState<NewDevice>({
    deviceName: '',
    deviceType: '',
    location: ''
  })
  const [deviceKey, setDeviceKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices')
      if (response.ok) {
        const data = await response.json()
        setDevices(data)
      } else {
        setError('Failed to fetch devices')
      }
    } catch (error) {
      setError('Error fetching devices')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDevice = async () => {
    if (!newDevice.deviceName || !newDevice.deviceType || !newDevice.location) {
      setError('Please fill all fields')
      return
    }

    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDevice)
      })

      if (response.ok) {
        const result = await response.json()
        setDeviceKey(result.deviceKey)
        setShowAddDialog(false)
        fetchDevices()
        setNewDevice({ deviceName: '', deviceType: '', location: '' })
        setError('')
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to add device')
      }
    } catch (error) {
      setError('Error adding device')
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
      } else {
        setError('Failed to update device')
      }
    } catch (error) {
      setError('Error updating device')
    }
  }

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device and all its data?')) {
      return
    }

    try {
      const response = await fetch(`/api/devices?deviceId=${deviceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchDevices()
      } else {
        setError('Failed to delete device')
      }
    } catch (error) {
      setError('Error deleting device')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const getDeviceTypeIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'PZEM-004T': return '⚡'
      case 'WaterLevel': return '💧'
      case 'IR': return '📡'
      case 'DHT22': return '🌡️'
      case 'Smoke': return '💨'
      case 'RainSensor': return '🌧️'
      default: return '📱'
    }
  }

  const getDeviceStatusColor = (device: Device) => {
    if (!device.isActive) return 'bg-gray-500'
    
    if (!device.lastSeen) return 'bg-yellow-500'
    
    const lastSeenTime = new Date(device.lastSeen).getTime()
    const now = new Date().getTime()
    const diffMinutes = (now - lastSeenTime) / (1000 * 60)
    
    if (diffMinutes < 5) return 'bg-green-500'
    if (diffMinutes < 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never'
    
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    return date.toLocaleDateString()
  }

  const getLatestDataDisplay = (device: Device) => {
    if (!device.latestData) return 'No data'
    
    const data = device.latestData
    switch (data.sensorType) {
      case 'electricity':
        return `${data.power?.toFixed(0)}W`
      case 'water_level':
        return `${data.waterLevel?.toFixed(1)}%`
      case 'temperature_humidity':
        return `${data.temperature?.toFixed(1)}°C`
      case 'smoke':
        return `${data.smokeLevel?.toFixed(0)}ppm`
      case 'ir_detector':
        return data.detected ? 'Motion' : 'Clear'
      case 'rain':
        return data.isRaining ? 'Raining' : 'Dry'
      default:
        return 'Active'
    }
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
              <Microchip className="h-8 w-8 text-primary" />
              Device Management
            </h1>
            <p className="text-slate-600 mt-2">Manage and monitor IoT devices</p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Device</DialogTitle>
                <DialogDescription>
                  Register a new IoT device to the system
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deviceName">Device Name</Label>
                  <Input
                    id="deviceName"
                    value={newDevice.deviceName}
                    onChange={(e) => setNewDevice({...newDevice, deviceName: e.target.value})}
                    placeholder="e.g., ESP32_001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="deviceType">Device Type</Label>
                  <Select value={newDevice.deviceType} onValueChange={(value) => setNewDevice({...newDevice, deviceType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PZEM-004T">⚡ PZEM-004T (Electricity)</SelectItem>
                      <SelectItem value="WaterLevel">💧 Water Level Sensor</SelectItem>
                      <SelectItem value="IR">📡 IR Motion Detector</SelectItem>
                      <SelectItem value="DHT22">🌡️ DHT22 (Temp/Humidity)</SelectItem>
                      <SelectItem value="Smoke">💨 Smoke Sensor</SelectItem>
                      <SelectItem value="RainSensor">🌧️ Rain Sensor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newDevice.location}
                    onChange={(e) => setNewDevice({...newDevice, location: e.target.value})}
                    placeholder="e.g., Kantor Utama"
                  />
                </div>
                
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button onClick={handleAddDevice} className="w-full">
                  Register Device
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Device Key Display */}
      {deviceKey && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-800">Device Registered Successfully!</p>
              <p className="text-sm text-green-600 mt-1">
                Use this device key in your ESP32 code:
              </p>
              <div className="flex items-center gap-2 mt-2">
                <code className="bg-green-100 px-2 py-1 rounded text-sm text-green-800">
                  {showKey ? deviceKey : '••••••••••••••••'}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(deviceKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeviceKey('')}
            >
              Dismiss
            </Button>
          </div>
        </Alert>
      )}

      {/* Error Display */}
      {error && !deviceKey && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <Card key={device.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getDeviceTypeIcon(device.deviceType)}</span>
                  <div>
                    <CardTitle className="text-lg">{device.deviceName}</CardTitle>
                    <CardDescription className="text-sm">
                      {device.deviceType}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getDeviceStatusColor(device)}`}></div>
                  {device.isActive ? (
                    <Wifi className="h-4 w-4 text-green-600" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>{device.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>Last seen: {formatLastSeen(device.lastSeen)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Activity className="h-4 w-4" />
                  <span>Data points: {device.dataCount}</span>
                </div>
              </div>
              
              {device.latestData && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-slate-700">Latest Reading:</p>
                  <p className="text-lg font-bold text-slate-900">
                    {getLatestDataDisplay(device)}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Badge variant={device.isActive ? 'default' : 'secondary'}>
                  {device.isActive ? 'Active' : 'Inactive'}
                </Badge>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleDevice(device.id, device.isActive)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDevice(device.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {devices.length === 0 && (
        <div className="text-center py-12">
          <Microchip className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No devices registered</h3>
          <p className="text-slate-600 mb-4">Add your first IoT device to get started</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>
      )}
    </div>
  )
}