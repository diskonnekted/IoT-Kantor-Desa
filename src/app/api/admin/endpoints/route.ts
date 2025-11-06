import { NextRequest, NextResponse } from 'next/server'

// Mock API endpoints data
const mockEndpoints = [
  {
    path: '/api/esp32',
    method: 'POST',
    status: 200,
    responseTime: 45,
    requests: 1234,
    errors: 12,
    lastCalled: new Date().toISOString()
  },
  {
    path: '/api/devices',
    method: 'GET',
    status: 200,
    responseTime: 23,
    requests: 567,
    errors: 3,
    lastCalled: new Date().toISOString()
  },
  {
    path: '/api/sensors',
    method: 'GET',
    status: 200,
    responseTime: 67,
    requests: 890,
    errors: 8,
    lastCalled: new Date().toISOString()
  },
  {
    path: '/api/alerts',
    method: 'GET',
    status: 200,
    responseTime: 34,
    requests: 234,
    errors: 2,
    lastCalled: new Date().toISOString()
  },
  {
    path: '/api/admin/system',
    method: 'GET',
    status: 200,
    responseTime: 156,
    requests: 45,
    errors: 0,
    lastCalled: new Date().toISOString()
  }
]

// GET - API endpoints status
export async function GET() {
  try {
    // In a real implementation, you would track actual API usage
    // For now, we'll return mock data with some randomization
    
    const endpoints = mockEndpoints.map(endpoint => ({
      ...endpoint,
      responseTime: endpoint.responseTime + Math.floor(Math.random() * 20) - 10,
      requests: endpoint.requests + Math.floor(Math.random() * 10),
      errors: endpoint.errors + (Math.random() > 0.9 ? 1 : 0),
      lastCalled: new Date(Date.now() - Math.floor(Math.random() * 300000)).toISOString()
    }))
    
    return NextResponse.json(endpoints)
    
  } catch (error) {
    console.error('Error fetching API endpoints:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch API endpoints' 
    }, { status: 500 })
  }
}