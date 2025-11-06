/*
 * ESP32 Multi-Sensor IR Motion Detector
 * 
 * Hardware:
 * - ESP32 Dev Board
 * - IR Sensor (PIR)
 * - DHT22 Temperature & Humidity Sensor
 * - Jumper wires
 * 
 * Pin Configuration:
 * - IR_PIN -> GPIO19
 * - DHT_PIN -> GPIO4
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Server Configuration
const char* SERVER_URL = "http://192.168.1.100:3000"; // Ganti dengan IP server
const String DEVICE_ID = "IR01"; // Ganti dengan IR02, IR03 untuk ruangan lain
const String DEVICE_KEY = "device_IR01_key_2024";
const String ROOM_NAME = "Ruang Aula"; // Ganti sesuai ruangan

// Sensor Configuration
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define IR_PIN 19

// Sensor Objects
DHT dht(DHT_PIN, DHT_TYPE);

// Global Variables
unsigned long previousMillis = 0;
const long INTERVAL = 5000; // Send data every 5 seconds
bool lastMotionState = false;
unsigned long lastMotionTime = 0;

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(IR_PIN, INPUT);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Initialize LED
  pinMode(LED_BUILTIN, OUTPUT);
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("ESP32 IR Motion Detector - Ready");
  Serial.print("Device ID: ");
  Serial.println(DEVICE_ID);
  Serial.print("Room: ");
  Serial.println(ROOM_NAME);
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected! Reconnecting...");
    connectWiFi();
    return;
  }
  
  // Check for motion (immediate response)
  bool motionDetected = (digitalRead(IR_PIN) == LOW);
  
  if (motionDetected != lastMotionState) {
    lastMotionState = motionDetected;
    if (motionDetected) {
      lastMotionTime = millis();
      Serial.println("Motion detected!");
      digitalWrite(LED_BUILTIN, HIGH);
      
      // Send immediate alert when motion is detected
      sendMotionData(true, true);
    } else {
      Serial.println("Motion stopped");
      digitalWrite(LED_BUILTIN, LOW);
      
      // Send data when motion stops
      sendMotionData(false, false);
    }
  }
  
  // Send periodic data with temperature and humidity
  if (currentMillis - previousMillis >= INTERVAL) {
    previousMillis = currentMillis;
    
    // Read temperature and humidity
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    
    // Check if readings are valid
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor!");
      temperature = 25.0;
      humidity = 60.0;
    }
    
    // Send environmental data
    sendEnvironmentalData(temperature, humidity, motionDetected);
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

void sendMotionData(bool detected, bool isAlert) {
  HTTPClient http;
  
  // Create JSON document
  DynamicJsonDocument doc(512);
  
  doc["sensorType"] = "ir_detector";
  doc["deviceName"] = DEVICE_ID;
  doc["detected"] = detected;
  doc["roomName"] = ROOM_NAME;
  doc["timestamp"] = millis();
  doc["isAlert"] = isAlert;
  
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
    Serial.print("Motion data sent: ");
    Serial.println(detected ? "DETECTED" : "NONE");
  } else {
    Serial.print("Error sending motion data: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

void sendEnvironmentalData(float temperature, float humidity, bool motionDetected) {
  HTTPClient http;
  
  // Create JSON document
  DynamicJsonDocument doc(512);
  
  doc["sensorType"] = "temperature_humidity";
  doc["deviceName"] = DEVICE_ID;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["timestamp"] = millis();
  
  // Also include motion status if recently detected
  if (millis() - lastMotionTime < 30000) { // Within last 30 seconds
    doc["recentMotion"] = true;
  }
  
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
    Serial.print("Environmental data sent - Temp: ");
    Serial.print(temperature);
    Serial.print("°C, Humidity: ");
    Serial.print(humidity);
    Serial.println("%");
  } else {
    Serial.print("Error sending environmental data: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}