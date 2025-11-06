/*
 * ESP32 Water Level Sensor - Tandon Air
 * 
 * Hardware:
 * - ESP32 Dev Board
 * - HC-SR04 Ultrasonic Sensor
 * - Jumper wires
 * 
 * Pin Configuration:
 * - TRIG_PIN -> GPIO5
 * - ECHO_PIN -> GPIO18
 * - BUZZER_PIN -> GPIO2 (optional)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Server Configuration
const char* SERVER_URL = "http://192.168.1.100:3000"; // Ganti dengan IP server
const String DEVICE_ID = "WaterTank01";
const String DEVICE_KEY = "device_WaterTank01_key_2024";

// Pin Configuration
#define TRIG_PIN 5
#define ECHO_PIN 18
#define BUZZER_PIN 2

// Global Variables
unsigned long previousMillis = 0;
const long INTERVAL = 10000; // Send data every 10 seconds
float tankHeight = 30.0; // Tank height in cm

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initialize LED
  pinMode(LED_BUILTIN, OUTPUT);
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("ESP32 Water Level Sensor - Ready");
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
    
    // Read water level
    float waterLevel = readWaterLevel();
    
    // Send data to server
    sendWaterLevelData(waterLevel);
    
    // Check for alerts
    checkWaterLevelAlerts(waterLevel);
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

float readWaterLevel() {
  // Send ultrasonic pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read echo
  long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = duration * 0.034 / 2; // Convert to cm
  
  // Calculate water level percentage
  float waterLevel = max(0, min(100, ((tankHeight - distance) / tankHeight) * 100));
  
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.print(" cm, Water Level: ");
  Serial.print(waterLevel);
  Serial.println("%");
  
  return waterLevel;
}

void sendWaterLevelData(float waterLevel) {
  HTTPClient http;
  
  // Create JSON document
  DynamicJsonDocument doc(512);
  
  doc["sensorType"] = "water_level";
  doc["deviceName"] = DEVICE_ID;
  doc["waterLevel"] = waterLevel;
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

void checkWaterLevelAlerts(float waterLevel) {
  if (waterLevel < 20) {
    // Critical level - continuous buzzer
    tone(BUZZER_PIN, 1000, 1000);
    Serial.println("ALERT: Critical water level!");
    
    // Blink LED rapidly
    for (int i = 0; i < 5; i++) {
      digitalWrite(LED_BUILTIN, HIGH);
      delay(100);
      digitalWrite(LED_BUILTIN, LOW);
      delay(100);
    }
  } else if (waterLevel < 40) {
    // Warning level - intermittent buzzer
    tone(BUZZER_PIN, 800, 500);
    Serial.println("WARNING: Low water level");
    
    // Blink LED slowly
    digitalWrite(LED_BUILTIN, HIGH);
    delay(500);
    digitalWrite(LED_BUILTIN, LOW);
  }
}