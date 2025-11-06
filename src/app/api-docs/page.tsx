'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Code, 
  Send, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Database, 
  Shield, 
  Globe, 
  FileText,
  Play,
  RefreshCw,
  Terminal,
  Book,
  Api,
  TestTube,
  Settings,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react'

interface ApiEndpoint {
  path: string
  method: string
  description: string
  parameters: Parameter[]
  responses: Response[]
  example: any
}

interface Parameter {
  name: string
  type: string
  required: boolean
  description: string
  example?: any
}

interface Response {
  status: number
  description: string
  example?: any
}

interface TestResult {
  endpoint: string
  method: string
  status: number
  responseTime: number
  response: any
  error?: string
  timestamp: string
}

export default function ApiDocumentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showHeaders, setShowHeaders] = useState(false)
  const [authToken, setAuthToken] = useState('')
  const [customHeaders, setCustomHeaders] = useState('{"Content-Type": "application/json"}')
  const [testData, setTestData] = useState('')
  const [activeTab, setActiveTab] = useState('endpoints')

  const apiEndpoints: ApiEndpoint[] = [
    {
      path: '/api/esp32',
      method: 'POST',
      description: 'Send sensor data from ESP32 device',
      parameters: [
        {
          name: 'x-device-id',
          type: 'header',
          required: true,
          description: 'Unique device identifier',
          example: 'WaterTank01'
        },
        {
          name: 'x-device-key',
          type: 'header',
          required: true,
          description: 'Device authentication key',
          example: 'device_WaterTank01_key_2024'
        },
        {
          name: 'sensorType',
          type: 'string',
          required: true,
          description: 'Type of sensor data',
          example: 'water_level'
        },
        {
          name: 'deviceName',
          type: 'string',
          required: true,
          description: 'Device name',
          example: 'WaterTank01'
        },
        {
          name: 'waterLevel',
          type: 'number',
          required: false,
          description: 'Water level percentage (0-100)',
          example: 75.5
        }
      ],
      responses: [
        {
          status: 200,
          description: 'Sensor data received successfully',
          example: {
            success: true,
            dataId: 'cmhn59tb9000dqknu1u52req0',
            message: 'Sensor data received successfully'
          }
        },
        {
          status: 401,
          description: 'Authentication failed',
          example: {
            error: 'Invalid device key'
          }
        }
      ],
      example: {
        sensorType: 'water_level',
        deviceName: 'WaterTank01',
        waterLevel: 75.5,
        timestamp: '2025-11-06T08:08:07.844Z'
      }
    },
    {
      path: '/api/devices',
      method: 'POST',
      description: 'Register a new IoT device',
      parameters: [
        {
          name: 'deviceName',
          type: 'string',
          required: true,
          description: 'Unique device name',
          example: 'ESP32_Water_01'
        },
        {
          name: 'deviceType',
          type: 'string',
          required: true,
          description: 'Type of device',
          example: 'WaterLevel'
        },
        {
          name: 'location',
          type: 'string',
          required: true,
          description: 'Device location',
          example: 'Tandon Air Utama'
        }
      ],
      responses: [
        {
          status: 200,
          description: 'Device registered successfully',
          example: {
            success: true,
            device: {
              id: 'cmhn5j0in0001qkw89m9upneu',
              name: 'ESP32_Water_01',
              type: 'WaterLevel',
              location: 'Tandon Air Utama',
              isActive: true
            },
            deviceKey: 'device_ESP32_Water_01_mhn5j0in_7ebe1557'
          }
        }
      ],
      example: {
        deviceName: 'ESP32_Water_01',
        deviceType: 'WaterLevel',
        location: 'Tandon Air Utama'
      }
    },
    {
      path: '/api/devices',
      method: 'GET',
      description: 'Get all registered devices',
      parameters: [],
      responses: [
        {
          status: 200,
          description: 'List of devices',
          example: [
            {
              id: 'cmhn5j0in0001qkw89m9upneu',
              deviceName: 'ESP32_Water_01',
              deviceType: 'WaterLevel',
              location: 'Tandon Air Utama',
              isActive: true,
              lastSeen: '2025-11-06T08:15:17.088Z',
              dataCount: 1234
            }
          ]
        }
      ],
      example: null
    },
    {
      path: '/api/sensors',
      method: 'GET',
      description: 'Get all sensor data',
      parameters: [
        {
          name: 'limit',
          type: 'number',
          required: false,
          description: 'Maximum number of records',
          example: 50
        },
        {
          name: 'deviceName',
          type: 'string',
          required: false,
          description: 'Filter by device name',
          example: 'WaterTank01'
        }
      ],
      responses: [
        {
          status: 200,
          description: 'Sensor data array',
          example: [
            {
              id: 'cmhn59tb9000dqknu1u52req0',
              sensorType: 'water_level',
              deviceName: 'WaterTank01',
              waterLevel: 75.5,
              timestamp: '2025-11-06T08:08:07.844Z'
            }
          ]
        }
      ],
      example: null
    },
    {
      path: '/api/alerts',
      method: 'GET',
      description: 'Get all alerts',
      parameters: [
        {
          name: 'isRead',
          type: 'boolean',
          required: false,
          description: 'Filter by read status',
          example: false
        }
      ],
      responses: [
        {
          status: 200,
          description: 'Alerts array',
          example: [
            {
              id: 'cmhn59tbc000gqknuzgh6avj4',
              title: 'Ketinggian Air Rendah',
              message: 'Tandon air mencapai 30%, segera isi ulang',
              alertType: 'warning',
              isRead: false,
              createdAt: '2025-11-06T08:08:07.848Z'
            }
          ]
        }
      ],
      example: null
    },
    {
      path: '/api/admin/system',
      method: 'GET',
      description: 'Get system information (admin only)',
      parameters: [],
      responses: [
        {
          status: 200,
          description: 'System information',
          example: {
            server: {
              uptime: 123456,
              memory: { total: 8589934592, used: 4294967296, free: 4294967296 },
              cpu: { usage: 45, cores: 4 }
            },
            database: {
              status: 'connected',
              deviceCount: 8,
              sensorDataCount: 15234
            }
          }
        }
      ],
      example: null
    }
  ]

  const handleTestEndpoint = async (endpoint: ApiEndpoint) => {
    setIsLoading(true)
    const startTime = Date.now()
    
    try {
      const headers = JSON.parse(customHeaders || '{}')
      
      // Add auth headers if provided
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      const options: RequestInit = {
        method: endpoint.method,
        headers
      }
      
      // Add body for POST/PUT requests
      if (['POST', 'PUT'].includes(endpoint.method) && testData) {
        options.body = testData
      }
      
      const response = await fetch(endpoint.path, options)
      const responseTime = Date.now() - startTime
      
      let responseData
      try {
        responseData = await response.json()
      } catch {
        responseData = await response.text()
      }
      
      const testResult: TestResult = {
        endpoint: endpoint.path,
        method: endpoint.method,
        status: response.status,
        responseTime,
        response: responseData,
        timestamp: new Date().toISOString()
      }
      
      setTestResults(prev => [testResult, ...prev.slice(0, 9)]) // Keep last 10 results
      
    } catch (error) {
      const testResult: TestResult = {
        endpoint: endpoint.path,
        method: endpoint.method,
        status: 0,
        responseTime: Date.now() - startTime,
        response: null,
        error: error.message,
        timestamp: new Date().toISOString()
      }
      
      setTestResults(prev => [testResult, ...prev.slice(0, 9)])
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const generateCurlCommand = (endpoint: ApiEndpoint) => {
    const headers = JSON.parse(customHeaders || '{}')
    let curlCommand = `curl -X ${endpoint.method} \\\n`
    
    // Add headers
    Object.entries(headers).forEach(([key, value]) => {
      curlCommand += `  -H "${key}: ${value}" \\\n`
    })
    
    // Add auth token if provided
    if (authToken) {
      curlCommand += `  -H "Authorization: Bearer ${authToken}" \\\n`
    }
    
    // Add body for POST/PUT requests
    if (['POST', 'PUT'].includes(endpoint.method) && testData) {
      curlCommand += `  -d '${testData}' \\\n`
    }
    
    curlCommand += `  http://localhost:3000${endpoint.path}`
    
    return curlCommand
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 300 && status < 400) return 'text-yellow-600'
    if (status >= 400) return 'text-red-600'
    return 'text-gray-600'
  }

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4" />
    if (status >= 400) return <XCircle className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Api className="h-8 w-8 text-primary" />
              API Documentation & Testing
            </h1>
            <p className="text-slate-600 mt-2">Interactive API documentation and testing interface</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setTestResults([])}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Endpoint List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoints</CardTitle>
                  <CardDescription>Available API endpoints</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {apiEndpoints.map((endpoint, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedEndpoint?.path === endpoint.path
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={() => setSelectedEndpoint(endpoint)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              endpoint.method === 'GET' ? 'default' :
                              endpoint.method === 'POST' ? 'secondary' :
                              endpoint.method === 'PUT' ? 'outline' : 'destructive'
                            }>
                              {endpoint.method}
                            </Badge>
                            <span className="text-sm font-medium">{endpoint.path}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {endpoint.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Endpoint Details */}
            <div className="lg:col-span-2">
              {selectedEndpoint ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant={
                            selectedEndpoint.method === 'GET' ? 'default' :
                            selectedEndpoint.method === 'POST' ? 'secondary' :
                            selectedEndpoint.method === 'PUT' ? 'outline' : 'destructive'
                          }>
                            {selectedEndpoint.method}
                          </Badge>
                          {selectedEndpoint.path}
                        </CardTitle>
                        <CardDescription>{selectedEndpoint.description}</CardDescription>
                      </div>
                      <Button onClick={() => handleTestEndpoint(selectedEndpoint)}>
                        <Play className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="parameters">
                      <TabsList>
                        <TabsTrigger value="parameters">Parameters</TabsTrigger>
                        <TabsTrigger value="responses">Responses</TabsTrigger>
                        <TabsTrigger value="example">Example</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="parameters" className="space-y-4">
                        {selectedEndpoint.parameters.length > 0 ? (
                          <div className="space-y-3">
                            {selectedEndpoint.parameters.map((param, index) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                                      {param.name}
                                    </code>
                                    <Badge variant={param.required ? 'destructive' : 'secondary'}>
                                      {param.required ? 'Required' : 'Optional'}
                                    </Badge>
                                    <Badge variant="outline">
                                      {param.type}
                                    </Badge>
                                  </div>
                                  {param.type === 'header' && <Shield className="h-4 w-4 text-slate-400" />}
                                </div>
                                <p className="text-sm text-slate-600">{param.description}</p>
                                {param.example && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    Example: <code>{param.example}</code>
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500">No parameters required</p>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="responses" className="space-y-4">
                        {selectedEndpoint.responses.map((response, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={response.status === 200 ? 'default' : 'destructive'}>
                                {response.status}
                              </Badge>
                              <span className="text-sm font-medium">{response.description}</span>
                            </div>
                            {response.example && (
                              <div className="mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(JSON.stringify(response.example, null, 2))}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy Example
                                </Button>
                                <pre className="mt-2 bg-slate-100 p-2 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(response.example, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </TabsContent>
                      
                      <TabsContent value="example" className="space-y-4">
                        {selectedEndpoint.example ? (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">Example Request</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(JSON.stringify(selectedEndpoint.example, null, 2))}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto">
                              {JSON.stringify(selectedEndpoint.example, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <p className="text-slate-500">No example available</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Select an Endpoint</h3>
                      <p className="text-slate-600">Choose an API endpoint from the list to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>Configure your API test settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="authToken">Authorization Token (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="authToken"
                      type="password"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      placeholder="Bearer token or API key"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHeaders(!showHeaders)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="customHeaders">Custom Headers (JSON)</Label>
                  <Textarea
                    id="customHeaders"
                    value={customHeaders}
                    onChange={(e) => setCustomHeaders(e.target.value)}
                    placeholder='{"Content-Type": "application/json"}'
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="testData">Request Body (JSON)</Label>
                  <Textarea
                    id="testData"
                    value={testData}
                    onChange={(e) => setTestData(e.target.value)}
                    placeholder='{"sensorType": "water_level", "deviceName": "WaterTank01", "waterLevel": 75.5}'
                    rows={6}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setTestData('')}>
                    Clear
                  </Button>
                  <Button variant="outline" onClick={() => setTestData(JSON.stringify({
                    sensorType: 'water_level',
                    deviceName: 'WaterTank01',
                    waterLevel: 75.5,
                    timestamp: new Date().toISOString()
                  }, null, 2))}>
                    Load Example
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Test */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Test</CardTitle>
                <CardDescription>Test common API endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleTestEndpoint(apiEndpoints[3])} // GET /api/devices
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Test GET /api/devices
                  </Button>
                  
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleTestEndpoint(apiEndpoints[4])} // GET /api/sensors
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Test GET /api/sensors
                  </Button>
                  
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleTestEndpoint(apiEndpoints[5])} // GET /api/alerts
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Test GET /api/alerts
                  </Button>
                  
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleTestEndpoint(apiEndpoints[6])} // GET /api/admin/system
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Test GET /api/admin/system
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* cURL Command Generator */}
          {selectedEndpoint && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>cURL Command</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateCurlCommand(selectedEndpoint))}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <CardDescription>Generated cURL command for testing</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                  {generateCurlCommand(selectedEndpoint)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>History of API test results</CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <Badge variant={result.status === 0 ? 'destructive' : 'default'}>
                            {result.method} {result.endpoint}
                          </Badge>
                          <span className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                            {result.status === 0 ? 'Error' : result.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">
                            {result.responseTime}ms
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      
                      {result.error ? (
                        <Alert className="mt-2">
                          <AlertDescription className="text-red-700">
                            {result.error}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(result.response, null, 2))}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Response
                          </Button>
                          <pre className="mt-2 bg-slate-100 p-2 rounded text-xs overflow-x-auto max-h-32">
                            {JSON.stringify(result.response, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TestTube className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Test Results</h3>
                  <p className="text-slate-600">Run some API tests to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}