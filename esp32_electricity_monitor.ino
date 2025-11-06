/*
 * ESP32 PZEM-004T Electricity Monitor
 * 
 * Hardware:
 * - ESP32 Dev Board
 * - PZEM-004T Power Meter
 * - Jumper wires
 * 
 * Pin Configuration:
 * - PZEM_RX_PIN -> GPIO16
 * - PZEM_TX_PIN -> GPIO17
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <HardwareSerial.h>

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Server Configuration
const char* SERVER_URL = "http://192.168.1.100:3000"; // Ganti dengan IP server
const String DEVICE_ID = "PZEM-004T";
const String DEVICE_KEY = "device_PZEM-004T_key_2024";

// PZEM-004T Configuration
HardwareSerial PzemSerial(2);
#define PZEM_RX_PIN 16
#define PZEM_TX_PIN 17

// Electricity tariff (Indonesia)
const float ELECTRICITY_TARIFF = 1444.70; // Rp/kWh

// Global Variables
unsigned long previousMillis = 0;
const long INTERVAL = 15000; // Send data every 15 seconds
float totalEnergy = 0;

// PZEM-004T data structure
struct PZEMData {
  float voltage;
  float current;
  float power;
  float energy;
  float frequency;
  float powerFactor;
};

void setup() {
  Serial.begin(115200);
  
  // Initialize PZEM serial
  PzemSerial.begin(9600, SERIAL_8N1, PZEM_RX_PIN, PZEM_TX_PIN);
  
  // Initialize LED
  pinMode(LED_BUILTIN, OUTPUT);
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("ESP32 PZEM-004T Electricity Monitor - Ready");
  Serial.print("Device ID: ");
  Serial.println(DEVICE_ID);
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected! Reconnecting...");
    connectWiFi();
    return;
  }
  
  // Send data at specified interval
  if (currentMillis - previousMillis >= INTERVAL) {
    previousMillis = currentMillis;
    
    // Read PZEM data
    PZEMData data = readPZEMData();
    
    // Send data to server
    sendElectricityData(data);
    
    // Check for alerts
    checkElectricityAlerts(data);
  }
  
  delay(100);
}

void connectWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to WiFi!");
  }
}

PZEMData readPZEMData() {
  PZEMData data;
  
  // Send read command to PZEM
  uint8_t request[] = {0x01, 0x04, 0x00, 0x00, 0x00, 0x0A, 0x70, 0xCD};
  PzemSerial.write(request, 8);
  
  // Wait for response
  delay(100);
  
  // Read response
  if (PzemSerial.available() >= 21) {
    uint8_t response[21];
    PzemSerial.readBytes(response, 21);
    
    // Parse response (simplified parsing)
    if (response[0] == 0x01 && response[1] == 0x04) {
      data.voltage = (response[3] << 8 | response[4]) / 10.0;
      data.current = (response[7] << 24 | response[8] << 16 | response[9] << 8 | response[10]) / 1000.0;
      data.power = (response[11] << 24 | response[12] << 16 | response[13] << 8 | response[14]) / 10.0;
      data.energy = (response[15] << 24 | response[16] << 16 | response[17] << 8 | response[18]) / 1000.0;
      data.frequency = (response[19] << 8 | response[20]) / 10.0;
      data.powerFactor = (response[21] << 8 | response[22]) / 100.0;
      
      // Update total energy
      totalEnergy = data.energy;
    }
  } else {
    // If PZEM not connected, use simulated data for testing
    data.voltage = 220.0 + random(-5, 5);
    data.current = 15.0 + random(-2, 2);
    data.power = data.voltage * data.current;
    totalEnergy += data.power * (INTERVAL / 1000.0) / 3600.0; // Calculate energy
    data.energy = totalEnergy;
    data.frequency = 50.0;
    data.powerFactor = 0.95;
    
    Serial.println("PZEM not connected, using simulated data");
  }
  
  // Print data
  Serial.print("Voltage: ");
  Serial.print(data.voltage);
  Serial.print("V, Current: ");
  Serial.print(data.current);
  Serial.print("A, Power: ");
  Serial.print(data.power);
  Serial.print("W, Energy: ");
  Serial.print(data.energy);
  Serial.println("kWh");
  
  return data;
}

void sendElectricityData(PZEMData data) {
  HTTPClient http;
  
  // Create JSON document
  DynamicJsonDocument doc(1024);
  
  doc["sensorType"] = "electricity";
  doc["deviceName"] = DEVICE_ID;
  doc["voltage"] = data.voltage;
  doc["current"] = data.current;
  doc["power"] = data.power;
  doc["energy"] = data.energy;
  doc["frequency"] = data.frequency;
  doc["powerFactor"] = data.powerFactor;
  doc["tariff"] = ELECTRICITY_TARIFF;
  doc["cost"] = data.energy * ELECTRICITY_TARIFF;
  doc["timestamp"] = millis();
  
  // Serialize JSON to string
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send HTTP POST request
  http.begin(String(SERVER_URL) + "/api/esp32");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-id", DEVICE_ID);
  http.addHeader("x-device-key", DEVICE_KEY);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.print("Server response: ");
    Serial.println(response);
  } else {
    Serial.print("Error on sending POST: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

void checkElectricityAlerts(PZEMData data) {
  if (data.power > 5000) {
    Serial.println("ALERT: High power consumption!");
    // Blink LED rapidly
    for (int i = 0; i < 3; i++) {
      digitalWrite(LED_BUILTIN, HIGH);
      delay(200);
      digitalWrite(LED_BUILTIN, LOW);
      delay(200);
    }
  }
  
  if (data.voltage < 200 || data.voltage > 240) {
    Serial.println("ALERT: Voltage fluctuation!");
    digitalWrite(LED_BUILTIN, HIGH);
    delay(1000);
    digitalWrite(LED_BUILTIN, LOW);
  }
}