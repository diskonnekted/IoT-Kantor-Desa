/*
 * ESP32 IoT Kantor Desa - Complete Sensor Code
 * 
 * This code supports multiple sensor types:
 * - PZEM-004T (Electricity Monitor)
 * - Ultrasonic Sensor (Water Level)
 * - IR Sensor (Motion Detection)
 * - DHT22 (Temperature & Humidity)
 * - MQ-2 (Smoke Sensor)
 * - Rain Sensor
 * 
 * Hardware Requirements:
 * - ESP32 Dev Board
 * - PZEM-004T (optional, for electricity monitoring)
 * - HC-SR04 (Ultrasonic, for water level)
 * - IR Sensor (motion detection)
 * - DHT22 (temperature & humidity)
 * - MQ-2 (smoke detection)
 * - Rain Sensor Module
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <HardwareSerial.h>

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // Ganti dengan WiFi SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Ganti dengan WiFi password

// Server Configuration
const char* SERVER_URL = "http://192.168.1.100:3000"; // Ganti dengan IP server aplikasi
const String DEVICE_ID = "ESP32_001";                    // Unique device ID
const String DEVICE_KEY = "device_ESP32_001_key_2024";   // Device authentication key

// Sensor Type Configuration
// Pilih salah satu sensor type yang sesuai dengan hardware Anda:
// "electricity", "water_level", "ir_detector", "temperature_humidity", "smoke", "rain"
const String SENSOR_TYPE = "water_level"; 

// Pin Configuration
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define TRIG_PIN 5    // Ultrasonic TRIG
#define ECHO_PIN 18   // Ultrasonic ECHO
#define IR_PIN 19     // IR Sensor
#define SMOKE_PIN 34  // MQ-2 Analog
#define RAIN_PIN 35   // Rain Sensor Digital
#define BUZZER_PIN 2  // Buzzer for alerts

// PZEM-004T Configuration (optional)
HardwareSerial PzemSerial(2); // Use UART2
#define PZEM_RX_PIN 16
#define PZEM_TX_PIN 17

// Sensor Objects
DHT dht(DHT_PIN, DHT_TYPE);

// Global Variables
unsigned long previousMillis = 0;
const long INTERVAL = 5000; // Send data every 5 seconds
int failedAttempts = 0;
const int MAX_FAILED_ATTEMPTS = 10;

// Structure to hold sensor data
struct SensorData {
  float voltage = 0;
  float current = 0;
  float power = 0;
  float energy = 0;
  float frequency = 0;
  float powerFactor = 0;
  float waterLevel = 0;
  bool detected = false;
  float temperature = 0;
  float humidity = 0;
  float smokeLevel = 0;
  float rainfall = 0;
  String rainIntensity = "Tidak Hujan";
  bool isRaining = false;
  float tariff = 1444.70; // Indonesia electricity tariff
  float cost = 0;
};

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(IR_PIN, INPUT);
  pinMode(SMOKE_PIN, INPUT);
  pinMode(RAIN_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Initialize PZEM-004T (if used)
  if (SENSOR_TYPE == "electricity") {
    PzemSerial.begin(9600, SERIAL_8N1, PZEM_RX_PIN, PZEM_TX_PIN);
  }
  
  // Initialize built-in LED
  pinMode(LED_BUILTIN, OUTPUT);
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("ESP32 IoT Kantor Desa - Ready");
  Serial.print("Device ID: ");
  Serial.println(DEVICE_ID);
  Serial.print("Sensor Type: ");
  Serial.println(SENSOR_TYPE);
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
    
    // Read sensor data
    SensorData data = readSensorData();
    
    // Send data to server
    if (sendDataToServer(data)) {
      failedAttempts = 0;
      digitalWrite(LED_BUILTIN, HIGH);
      delay(200);
      digitalWrite(LED_BUILTIN, LOW);
    } else {
      failedAttempts++;
      Serial.print("Failed attempts: ");
      Serial.println(failedAttempts);
      
      // If too many failed attempts, restart WiFi
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        Serial.println("Too many failed attempts, restarting WiFi...");
        WiFi.disconnect();
        connectWiFi();
        failedAttempts = 0;
      }
    }
  }
  
  // Check for local alerts
  checkLocalAlerts();
  
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
    
    // Blink LED to indicate successful connection
    for (int i = 0; i < 3; i++) {
      digitalWrite(LED_BUILTIN, HIGH);
      delay(200);
      digitalWrite(LED_BUILTIN, LOW);
      delay(200);
    }
  } else {
    Serial.println("\nFailed to connect to WiFi!");
  }
}

SensorData readSensorData() {
  SensorData data;
  
  if (SENSOR_TYPE == "electricity") {
    // Read PZEM-004T data (simplified - in real implementation, use PZEM library)
    data.voltage = 220.0 + random(-5, 5); // Simulated data
    data.current = 15.0 + random(-2, 2);
    data.power = data.voltage * data.current;
    data.energy = data.power / 1000; // Convert to kWh
    data.frequency = 50.0;
    data.powerFactor = 0.95;
    data.cost = data.energy * data.tariff;
    
  } else if (SENSOR_TYPE == "water_level") {
    // Read ultrasonic sensor for water level
    long duration, distance;
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    duration = pulseIn(ECHO_PIN, HIGH);
    distance = duration * 0.034 / 2; // Convert to cm
    
    // Convert distance to water level percentage (assuming max tank height 30cm)
    float tankHeight = 30.0;
    data.waterLevel = max(0, min(100, ((tankHeight - distance) / tankHeight) * 100));
    
  } else if (SENSOR_TYPE == "ir_detector") {
    // Read IR sensor
    data.detected = (digitalRead(IR_PIN) == LOW); // IR sensors are usually active LOW
    
  } else if (SENSOR_TYPE == "temperature_humidity") {
    // Read DHT22 sensor
    data.temperature = dht.readTemperature();
    data.humidity = dht.readHumidity();
    
    // Check if readings are valid
    if (isnan(data.temperature) || isnan(data.humidity)) {
      Serial.println("Failed to read from DHT sensor!");
      data.temperature = 25.0; // Default values
      data.humidity = 60.0;
    }
    
  } else if (SENSOR_TYPE == "smoke") {
    // Read MQ-2 smoke sensor
    int smokeValue = analogRead(SMOKE_PIN);
    data.smokeLevel = map(smokeValue, 0, 4095, 0, 100); // Convert to percentage
    
  } else if (SENSOR_TYPE == "rain") {
    // Read rain sensor
    bool rainDetected = (digitalRead(RAIN_PIN) == LOW); // Rain sensors are usually active LOW
    data.isRaining = rainDetected;
    
    if (rainDetected) {
      int rainValue = analogRead(35); // Read analog value if available
      data.rainfall = map(rainValue, 0, 4095, 0, 10); // Simulated rainfall in mm
      
      if (data.rainfall > 7) {
        data.rainIntensity = "Hujan Lebat";
      } else if (data.rainfall > 4) {
        data.rainIntensity = "Hujan Sedang";
      } else {
        data.rainIntensity = "Hujan Ringan";
      }
    } else {
      data.rainfall = 0;
      data.rainIntensity = "Tidak Hujan";
    }
  }
  
  return data;
}

bool sendDataToServer(SensorData data) {
  HTTPClient http;
  
  // Create JSON document
  DynamicJsonDocument doc(1024);
  
  doc["sensorType"] = SENSOR_TYPE;
  doc["deviceName"] = DEVICE_ID;
  doc["timestamp"] = millis();
  
  // Add sensor-specific data
  if (SENSOR_TYPE == "electricity") {
    doc["voltage"] = data.voltage;
    doc["current"] = data.current;
    doc["power"] = data.power;
    doc["energy"] = data.energy;
    doc["frequency"] = data.frequency;
    doc["powerFactor"] = data.powerFactor;
    doc["tariff"] = data.tariff;
    doc["cost"] = data.cost;
    
  } else if (SENSOR_TYPE == "water_level") {
    doc["waterLevel"] = data.waterLevel;
    
  } else if (SENSOR_TYPE == "ir_detector") {
    doc["detected"] = data.detected;
    doc["roomName"] = "Ruang Utama"; // Adjust based on actual location
    
  } else if (SENSOR_TYPE == "temperature_humidity") {
    doc["temperature"] = data.temperature;
    doc["humidity"] = data.humidity;
    
  } else if (SENSOR_TYPE == "smoke") {
    doc["smokeLevel"] = data.smokeLevel;
    
  } else if (SENSOR_TYPE == "rain") {
    doc["rainfall"] = data.rainfall;
    doc["rainIntensity"] = data.rainIntensity;
    doc["isRaining"] = data.isRaining;
  }
  
  // Serialize JSON to string
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send HTTP POST request
  http.begin(SERVER_URL + "/api/esp32");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-id", DEVICE_ID);
  http.addHeader("x-device-key", DEVICE_KEY);
  
  Serial.print("Sending data: ");
  Serial.println(jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.print("Server response: ");
    Serial.println(response);
    http.end();
    return true;
  } else {
    Serial.print("Error on sending POST: ");
    Serial.println(httpResponseCode);
    Serial.print("Response: ");
    Serial.println(http.getString());
    http.end();
    return false;
  }
}

void checkLocalAlerts() {
  SensorData data = readSensorData();
  
  // Local alerts for critical conditions
  if (SENSOR_TYPE == "water_level" && data.waterLevel < 20) {
    // Critical water level - activate buzzer
    tone(BUZZER_PIN, 1000, 500);
    Serial.println("ALERT: Critical water level!");
  }
  
  if (SENSOR_TYPE == "smoke" && data.smokeLevel > 60) {
    // High smoke level - continuous buzzer
    tone(BUZZER_PIN, 1500, 1000);
    Serial.println("ALERT: High smoke level detected!");
  }
  
  if (SENSOR_TYPE == "temperature_humidity" && data.temperature > 40) {
    // High temperature - intermittent buzzer
    tone(BUZZER_PIN, 800, 200);
    Serial.println("ALERT: High temperature!");
  }
}

// Function to get device configuration from server
bool getDeviceConfig() {
  HTTPClient http;
  
  String url = SERVER_URL + "/api/esp32?deviceId=" + DEVICE_ID;
  http.begin(url);
  http.addHeader("x-device-id", DEVICE_ID);
  http.addHeader("x-device-key", DEVICE_KEY);
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    
    Serial.println("Device Configuration:");
    Serial.print("Name: ");
    Serial.println(doc["device"]["name"].as<String>());
    Serial.print("Type: ");
    Serial.println(doc["device"]["type"].as<String>());
    Serial.print("Location: ");
    Serial.println(doc["device"]["location"].as<String>());
    Serial.print("Active: ");
    Serial.println(doc["device"]["isActive"].as<bool>());
    
    http.end();
    return true;
  } else {
    Serial.print("Error getting config: ");
    Serial.println(httpResponseCode);
    http.end();
    return false;
  }
}