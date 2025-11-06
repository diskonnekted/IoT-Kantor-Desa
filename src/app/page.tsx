'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  Zap, 
  Droplets, 
  Shield, 
  Thermometer, 
  Cloud, 
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Home,
  DollarSign,
  Bell,
  CloudRain,
  Umbrella,
  BarChart3,
  Archive,
  Building
} from 'lucide-react'

interface SensorData {
  id: string
  sensorType: string
  deviceName: string
  voltage?: number
  current?: number
  power?: number
  energy?: number
  frequency?: number
  powerFactor?: number
  waterLevel?: number
  detected?: boolean
  temperature?: number
  humidity?: number
  smokeLevel?: number
  rainfall?: number
  rainIntensity?: string
  isRaining?: boolean
  tariff?: number
  cost?: number
  timestamp: string
  roomName?: string
}

interface Alert {
  id: string
  title: string
  message: string
  alertType: string
  sensorType: string
  isRead: boolean
  createdAt: string
}

interface MonthlyData {
  month: string
  usage: number
  cost: number
}

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Mock data for demonstration
  useEffect(() => {
    const mockData: SensorData[] = [
      {
        id: '1',
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
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        sensorType: 'water_level',
        deviceName: 'WaterTank01',
        waterLevel: 75,
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        sensorType: 'ir_detector',
        deviceName: 'IR01',
        detected: false,
        roomName: 'Ruang Aula',
        timestamp: new Date().toISOString()
      },
      {
        id: '4',
        sensorType: 'ir_detector',
        deviceName: 'IR02',
        detected: true,
        roomName: 'Ruang Arsip',
        timestamp: new Date().toISOString()
      },
      {
        id: '5',
        sensorType: 'temperature_humidity',
        deviceName: 'DHT22',
        temperature: 28.5,
        humidity: 65,
        timestamp: new Date().toISOString()
      },
      {
        id: '6',
        sensorType: 'smoke',
        deviceName: 'Smoke01',
        smokeLevel: 12,
        timestamp: new Date().toISOString()
      },
      {
        id: '7',
        sensorType: 'rain',
        deviceName: 'RainSensor01',
        rainfall: 2.5,
        rainIntensity: 'Hujan Ringan',
        isRaining: true,
        timestamp: new Date().toISOString()
      }
    ]

    const mockAlerts: Alert[] = [
      {
        id: '1',
        title: 'Ketinggian Air Rendah',
        message: 'Tandon air mencapai 30%, segera isi ulang',
        alertType: 'warning',
        sensorType: 'water_level',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Aktivitas Terdeteksi di Ruang Arsip',
        message: 'Sensor IR mendeteksi gerakan di ruang arsip',
        alertType: 'info',
        sensorType: 'ir_detector',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ]

    setSensorData(mockData)
    setAlerts(mockAlerts)
    setIsLoading(false)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastUpdate(new Date())
      // Update some values randomly for demo
      setSensorData(prev => prev.map(data => {
        if (data.sensorType === 'electricity') {
          return {
            ...data,
            power: data.power ? data.power + (Math.random() - 0.5) * 100 : undefined,
            current: data.current ? data.current + (Math.random() - 0.5) * 2 : undefined,
            timestamp: new Date().toISOString()
          }
        }
        if (data.sensorType === 'water_level') {
          return {
            ...data,
            waterLevel: data.waterLevel ? Math.max(0, Math.min(100, data.waterLevel + (Math.random() - 0.5) * 5)) : undefined,
            timestamp: new Date().toISOString()
          }
        }
        if (data.sensorType === 'temperature_humidity') {
          return {
            ...data,
            temperature: data.temperature ? data.temperature + (Math.random() - 0.5) * 2 : undefined,
            humidity: data.humidity ? data.humidity + (Math.random() - 0.5) * 5 : undefined,
            timestamp: new Date().toISOString()
          }
        }
        return data
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Mock monthly data for chart
  const monthlyData: MonthlyData[] = [
    { month: 'Jan', usage: 850, cost: 1228000 },
    { month: 'Feb', usage: 920, cost: 1329000 },
    { month: 'Mar', usage: 780, cost: 1127000 },
    { month: 'Apr', usage: 890, cost: 1285000 },
    { month: 'Mei', usage: 950, cost: 1372000 },
    { month: 'Jun', usage: 1020, cost: 1473000 },
    { month: 'Jul', usage: 1100, cost: 1589000 },
    { month: 'Agu', usage: 1050, cost: 1517000 },
    { month: 'Sep', usage: 980, cost: 1416000 },
    { month: 'Okt', usage: 920, cost: 1329000 },
    { month: 'Nov', usage: 880, cost: 1271000 },
    { month: 'Des', usage: 1245.6, cost: 1800000 }
  ]

  const getElectricityData = () => sensorData.find(d => d.sensorType === 'electricity')
  const getWaterData = () => sensorData.find(d => d.sensorType === 'water_level')
  const getIRDataByRoom = (roomName: string) => sensorData.find(d => d.sensorType === 'ir_detector' && d.roomName === roomName)
  const getTempHumidityData = () => sensorData.find(d => d.sensorType === 'temperature_humidity')
  const getSmokeData = () => sensorData.find(d => d.sensorType === 'smoke')
  const getRainData = () => sensorData.find(d => d.sensorType === 'rain')

  const getWaterLevelColor = (level: number) => {
    if (level < 30) return 'text-red-600'
    if (level < 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getWaterTankColor = (level: number) => {
    if (level < 30) return 'from-red-500 to-red-600'
    if (level < 60) return 'from-yellow-500 to-yellow-600'
    return 'from-blue-500 to-blue-600'
  }

  const getPowerStatus = (power: number) => {
    if (power > 5000) return { color: 'text-red-600', status: 'Tinggi' }
    if (power > 3000) return { color: 'text-yellow-600', status: 'Sedang' }
    return { color: 'text-green-600', status: 'Normal' }
  }

  const getRainColor = (intensity: string) => {
    switch (intensity) {
      case 'Hujan Lebat': return 'text-red-600'
      case 'Hujan Sedang': return 'text-yellow-600'
      case 'Hujan Ringan': return 'text-blue-600'
      default: return 'text-gray-600'
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
              <Home className="h-8 w-8 text-primary" />
              Dasbor IoT Kantor Desa Pondokrejo
            </h1>
            <p className="text-slate-600 mt-2">Pantauan real-time sensor dan sistem kantor desa</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              Update: {lastUpdate.toLocaleTimeString('id-ID')}
            </Badge>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              {alerts.filter(a => !a.isRead).length} Notifikasi
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.filter(a => !a.isRead).length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.filter(a => !a.isRead).map(alert => (
            <Alert key={alert.id} className={
              alert.alertType === 'danger' ? 'border-red-200 bg-red-50' :
              alert.alertType === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                {alert.title}
                <Badge variant={alert.alertType === 'danger' ? 'destructive' : 'secondary'}>
                  {alert.alertType}
                </Badge>
              </AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Electricity Monitoring Card */}
        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Monitoring Listrik PLN
            </CardTitle>
            <CardDescription>PZEM-004T Sensor Data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getElectricityData() && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Voltase</p>
                    <p className="text-2xl font-bold">{getElectricityData()?.voltage?.toFixed(1)} V</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Arus</p>
                    <p className="text-2xl font-bold">{getElectricityData()?.current?.toFixed(1)} A</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Daya</p>
                    <p className={`text-2xl font-bold ${getPowerStatus(getElectricityData()?.power || 0).color}`}>
                      {getElectricityData()?.power?.toFixed(0)} W
                    </p>
                    <Badge variant="outline" className={getPowerStatus(getElectricityData()?.power || 0).color}>
                      {getPowerStatus(getElectricityData()?.power || 0).status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Frekuensi</p>
                    <p className="text-2xl font-bold">{getElectricityData()?.frequency?.toFixed(1)} Hz</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Total kWh</p>
                    <p className="text-xl font-semibold">{getElectricityData()?.energy?.toFixed(2)} kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Power Factor</p>
                    <p className="text-xl font-semibold">{getElectricityData()?.powerFactor?.toFixed(2)}</p>
                  </div>
                </div>
                <Separator />
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Estimasi Biaya</p>
                      <p className="text-xl font-bold text-green-700">
                        Rp {getElectricityData()?.cost?.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-slate-500">
                        Tarif: Rp {getElectricityData()?.tariff?.toLocaleString('id-ID')}/kWh
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Monthly Electricity Usage Chart - Line Chart */}
        <Card className="lg:col-span-2 xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Pemakaian Listrik Per Bulan
            </CardTitle>
            <CardDescription>Statistik pemakaian listrik tahun 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-slate-50 rounded-lg p-4 relative">
              {/* Grid Lines */}
              <div className="absolute inset-4 flex flex-col justify-between">
                <div className="border-b border-slate-200"></div>
                <div className="border-b border-slate-200"></div>
                <div className="border-b border-slate-200"></div>
                <div className="border-b border-slate-200"></div>
                <div className="border-b border-slate-200"></div>
              </div>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-4 bottom-8 flex flex-col justify-between text-xs text-slate-600 w-8">
                <span>1400</span>
                <span>1050</span>
                <span>700</span>
                <span>350</span>
                <span>0</span>
              </div>
              
              {/* Chart Area */}
              <div className="relative h-full ml-10 mr-4">
                {/* Usage Line */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[20, 40, 60, 80].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
                  ))}
                  
                  {/* Usage line path */}
                  <path
                    d={`M 0,${100 - (monthlyData[0].usage / 1400) * 100} ${monthlyData.slice(1).map((data, index) => 
                      `L ${((index + 1) / (monthlyData.length - 1)) * 100},${100 - (data.usage / 1400) * 100}`
                    ).join(' ')}`}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    className="transition-all duration-500"
                  />
                  
                  {/* Usage area fill */}
                  <path
                    d={`M 0,${100 - (monthlyData[0].usage / 1400) * 100} ${monthlyData.slice(1).map((data, index) => 
                      `L ${((index + 1) / (monthlyData.length - 1)) * 100},${100 - (data.usage / 1400) * 100}`
                    ).join(' ')} L 100,100 L 0,100 Z`}
                    fill="url(#usageGradient)"
                    opacity="0.3"
                  />
                  
                  {/* Cost line path */}
                  <path
                    d={`M 0,${100 - ((monthlyData[0].cost / 1000) / 2000) * 100} ${monthlyData.slice(1).map((data, index) => 
                      `L ${((index + 1) / (monthlyData.length - 1)) * 100},${100 - ((data.cost / 1000) / 2000) * 100}`
                    ).join(' ')}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    className="transition-all duration-500"
                  />
                  
                  {/* Cost area fill */}
                  <path
                    d={`M 0,${100 - ((monthlyData[0].cost / 1000) / 2000) * 100} ${monthlyData.slice(1).map((data, index) => 
                      `L ${((index + 1) / (monthlyData.length - 1)) * 100},${100 - ((data.cost / 1000) / 2000) * 100}`
                    ).join(' ')} L 100,100 L 0,100 Z`}
                    fill="url(#costGradient)"
                    opacity="0.3"
                  />
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="usageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="costGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Data points */}
                <div className="absolute inset-0 flex items-end justify-between px-2 pb-8">
                  {monthlyData.map((data, index) => (
                    <div key={data.month} className="relative flex flex-col items-center">
                      {/* Usage point */}
                      <div 
                        className="w-2 h-2 bg-blue-500 rounded-full border-2 border-white shadow-sm hover:w-3 hover:h-3 transition-all cursor-pointer"
                        style={{ marginBottom: `${(data.usage / 1400) * 100}%` }}
                        title={`${data.usage} kWh`}
                      />
                      {/* Cost point */}
                      <div 
                        className="w-2 h-2 bg-green-500 rounded-full border-2 border-white shadow-sm hover:w-3 hover:h-3 transition-all cursor-pointer"
                        style={{ marginBottom: `${((data.cost / 1000) / 2000) * 100}%` }}
                        title={`Rp ${(data.cost / 1000).toFixed(0)}K`}
                      />
                    </div>
                  ))}
                </div>
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-slate-600">
                  {monthlyData.map(data => (
                    <span key={data.month} className="font-medium">{data.month}</span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Pemakaian (kWh)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Biaya (Rp/ribu)</span>
              </div>
            </div>
            
            {/* Statistics Summary */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">Rata-rata Pemakaian</p>
                <p className="text-lg font-bold text-blue-700">
                  {Math.round(monthlyData.reduce((acc, curr) => acc + curr.usage, 0) / monthlyData.length)} kWh
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 font-medium">Total Biaya Tahun</p>
                <p className="text-lg font-bold text-green-700">
                  Rp {(monthlyData.reduce((acc, curr) => acc + curr.cost, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600 font-medium">Tertinggi</p>
                <p className="text-lg font-bold text-purple-700">
                  {monthlyData.reduce((max, curr) => curr.usage > max.usage ? curr : max).month}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Water Level Card with Animated Visual */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              Ketinggian Air Tandon
            </CardTitle>
            <CardDescription>Level air dalam tandon</CardDescription>
          </CardHeader>
          <CardContent>
            {getWaterData() && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative w-32 h-48 bg-slate-100 rounded-lg overflow-hidden">
                    {/* Tank Container */}
                    <div className="absolute inset-2 bg-slate-200 rounded-lg">
                      {/* Water Level */}
                      <div 
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getWaterTankColor(getWaterData()?.waterLevel || 0)} transition-all duration-1000 ease-in-out rounded-b-lg`}
                        style={{ height: `${getWaterData()?.waterLevel || 0}%` }}
                      >
                        {/* Water Wave Effect */}
                        <div className="absolute top-0 left-0 right-0 h-3">
                          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                        </div>
                        
                        {/* Multiple Water Bubbles */}
                        <div className="absolute bottom-2 left-2 w-2 h-2 bg-white opacity-70 rounded-full animate-bounce"></div>
                        <div className="absolute bottom-4 right-3 w-1.5 h-1.5 bg-white opacity-50 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute bottom-6 left-4 w-1 h-1 bg-white opacity-60 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-8 right-2 w-2.5 h-2.5 bg-white opacity-40 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
                        <div className="absolute bottom-3 left-6 w-1 h-1 bg-white opacity-50 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute bottom-10 left-3 w-1.5 h-1.5 bg-white opacity-45 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }}></div>
                        <div className="absolute bottom-5 right-5 w-1 h-1 bg-white opacity-55 rounded-full animate-bounce" style={{ animationDelay: '1.2s' }}></div>
                        
                        {/* Floating Bubbles */}
                        <div className="absolute top-2 left-3 w-1 h-1 bg-white opacity-60 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                        <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-white opacity-40 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
                        <div className="absolute top-6 left-5 w-1 h-1 bg-white opacity-50 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
                        
                        {/* Water Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
                      </div>
                      
                      {/* Level Markers */}
                      <div className="absolute inset-0 flex flex-col justify-between py-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs text-slate-600">100%</span>
                          <div className="w-full h-px bg-slate-300"></div>
                        </div>
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs text-slate-600">75%</span>
                          <div className="w-full h-px bg-slate-300"></div>
                        </div>
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs text-slate-600">50%</span>
                          <div className="w-full h-px bg-slate-300"></div>
                        </div>
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs text-slate-600">25%</span>
                          <div className="w-full h-px bg-slate-300"></div>
                        </div>
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs text-slate-600">0%</span>
                          <div className="w-full h-px bg-slate-300"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Large Percentage Display */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-md shadow-lg">
                      <span className={`text-2xl font-bold ${getWaterLevelColor(getWaterData()?.waterLevel || 0)}`}>
                        {getWaterData()?.waterLevel}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Kapasitas: 1000L</span>
                    <span>{Math.round((getWaterData()?.waterLevel || 0) * 10)}L</span>
                  </div>
                  <Badge variant={getWaterData()?.waterLevel && getWaterData().waterLevel! < 30 ? 'destructive' : 'secondary'}>
                    {getWaterData()?.waterLevel && getWaterData().waterLevel! < 30 ? 'Perlu Isi' : 'Aman'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Motion Detection - Ruang Aula */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-500" />
              Deteksi Gerakan - Ruang Aula
            </CardTitle>
            <CardDescription>Sensor IR - Ruang Utama</CardDescription>
          </CardHeader>
          <CardContent>
            {getIRDataByRoom('Ruang Aula') && (
              <div className="text-center space-y-4">
                <div className="relative h-32 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
                  {getIRDataByRoom('Ruang Aula')?.detected ? (
                    <div className="flex flex-col items-center gap-2 text-red-600">
                      <div className="relative">
                        <Users className="h-12 w-12 animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                      </div>
                      <span className="text-lg font-bold">Terdeteksi</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-green-600">
                      <Shield className="h-12 w-12" />
                      <span className="text-lg font-bold">Aman</span>
                    </div>
                  )}
                </div>
                <Badge variant={getIRDataByRoom('Ruang Aula')?.detected ? 'destructive' : 'secondary'}>
                  {getIRDataByRoom('Ruang Aula')?.detected ? 'Ada Aktivitas' : 'Tidak Ada Aktivitas'}
                </Badge>
                <p className="text-sm text-slate-500">
                  Status: {new Date().getHours() >= 17 || new Date().getHours() <= 6 ? 'Jam Off' : 'Jam Kerja'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Motion Detection - Ruang Arsip */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-orange-500" />
              Deteksi Gerakan - Ruang Arsip
            </CardTitle>
            <CardDescription>Sensor IR - Area Penyimpanan</CardDescription>
          </CardHeader>
          <CardContent>
            {getIRDataByRoom('Ruang Arsip') && (
              <div className="text-center space-y-4">
                <div className="relative h-32 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
                  {getIRDataByRoom('Ruang Arsip')?.detected ? (
                    <div className="flex flex-col items-center gap-2 text-red-600">
                      <div className="relative">
                        <Users className="h-12 w-12 animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                      </div>
                      <span className="text-lg font-bold">Terdeteksi</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-green-600">
                      <Shield className="h-12 w-12" />
                      <span className="text-lg font-bold">Aman</span>
                    </div>
                  )}
                </div>
                <Badge variant={getIRDataByRoom('Ruang Arsip')?.detected ? 'destructive' : 'secondary'}>
                  {getIRDataByRoom('Ruang Arsip')?.detected ? 'Ada Aktivitas' : 'Tidak Ada Aktivitas'}
                </Badge>
                <p className="text-sm text-slate-500">
                  Status: {new Date().getHours() >= 17 || new Date().getHours() <= 6 ? 'Jam Off' : 'Jam Kerja'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Temperature & Humidity Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-500" />
              Suhu & Kelembaban
            </CardTitle>
            <CardDescription>Sensor DHT22</CardDescription>
          </CardHeader>
          <CardContent>
            {getTempHumidityData() && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <Thermometer className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm text-slate-600">Suhu</p>
                    <p className="text-2xl font-bold">{getTempHumidityData()?.temperature?.toFixed(1)}°C</p>
                  </div>
                  <div className="text-center">
                    <Cloud className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm text-slate-600">Kelembaban</p>
                    <p className="text-2xl font-bold">{getTempHumidityData()?.humidity?.toFixed(0)}%</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-600 text-center">
                    Kondisi: {getTempHumidityData()?.temperature && getTempHumidityData().temperature! > 30 ? 'Panas' : 
                             getTempHumidityData()?.temperature && getTempHumidityData().temperature! < 20 ? 'Dingin' : 'Nyaman'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Smoke Detection Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-500" />
              Deteksi Asap
            </CardTitle>
            <CardDescription>Smoke Sensor</CardDescription>
          </CardHeader>
          <CardContent>
            {getSmokeData() && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="relative h-24 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <p className="text-2xl font-bold">{getSmokeData()?.smokeLevel}</p>
                      <p className="text-xs text-slate-600">ppm</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant={getSmokeData()?.smokeLevel && getSmokeData().smokeLevel! > 50 ? 'destructive' : 'secondary'}>
                    {getSmokeData()?.smokeLevel && getSmokeData().smokeLevel! > 50 ? 'Bahaya' : 'Normal'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rain Detection Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-blue-500" />
              Sensor Hujan
            </CardTitle>
            <CardDescription>Rain Sensor</CardDescription>
          </CardHeader>
          <CardContent>
            {getRainData() && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="relative h-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <CloudRain className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{getRainData()?.rainfall}</p>
                      <p className="text-xs text-slate-600">mm</p>
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <Badge variant={getRainData()?.isRaining ? 'default' : 'secondary'}>
                    {getRainData()?.isRaining ? 'Sedang Hujan' : 'Tidak Hujan'}
                  </Badge>
                  <p className={`text-sm ${getRainColor(getRainData()?.rainIntensity || '')}`}>
                    {getRainData()?.rainIntensity}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}