#!/usr/bin/env python3
"""
Weather API Backend using Flask
Provides weather data endpoints for the weather app frontend
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
from datetime import datetime, timedelta
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Configuration
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', 'your_api_key_here')
OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'

class WeatherService:
    """Service class to handle weather API operations"""
    
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = OPENWEATHER_BASE_URL
    
    def get_current_weather(self, city=None, lat=None, lon=None):
        """Get current weather data"""
        try:
            if city:
                url = f"{self.base_url}/weather"
                params = {
                    'q': city,
                    'appid': self.api_key,
                    'units': 'metric'
                }
            elif lat and lon:
                url = f"{self.base_url}/weather"
                params = {
                    'lat': lat,
                    'lon': lon,
                    'appid': self.api_key,
                    'units': 'metric'
                }
            else:
                return None
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            print(f"Error fetching current weather: {e}")
            return None
    
    def get_forecast(self, city=None, lat=None, lon=None):
        """Get 5-day weather forecast"""
        try:
            if city:
                url = f"{self.base_url}/forecast"
                params = {
                    'q': city,
                    'appid': self.api_key,
                    'units': 'metric'
                }
            elif lat and lon:
                url = f"{self.base_url}/forecast"
                params = {
                    'lat': lat,
                    'lon': lon,
                    'appid': self.api_key,
                    'units': 'metric'
                }
            else:
                return None
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            print(f"Error fetching forecast: {e}")
            return None
    
    def get_weather_icon_class(self, weather_code, is_day=True):
        """Convert OpenWeather icon code to Font Awesome class"""
        icon_mapping = {
            '01d': 'fas fa-sun',           # clear sky day
            '01n': 'fas fa-moon',          # clear sky night
            '02d': 'fas fa-cloud-sun',     # few clouds day
            '02n': 'fas fa-cloud-moon',    # few clouds night
            '03d': 'fas fa-cloud',         # scattered clouds
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-cloud',         # broken clouds
            '04n': 'fas fa-cloud',
            '09d': 'fas fa-cloud-rain',    # shower rain
            '09n': 'fas fa-cloud-rain',
            '10d': 'fas fa-cloud-sun-rain', # rain day
            '10n': 'fas fa-cloud-moon-rain', # rain night
            '11d': 'fas fa-bolt',          # thunderstorm
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',     # snow
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',          # mist
            '50n': 'fas fa-smog'
        }
        return icon_mapping.get(weather_code, 'fas fa-cloud')

# Initialize weather service
weather_service = WeatherService(OPENWEATHER_API_KEY)

@app.route('/api/weather/current', methods=['GET'])
def get_current_weather():
    """Get current weather for a city or coordinates"""
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    if not city and not (lat and lon):
        return jsonify({'error': 'City name or coordinates required'}), 400
    
    # Get current weather
    current_data = weather_service.get_current_weather(city=city, lat=lat, lon=lon)
    if not current_data:
        return jsonify({'error': 'Weather data not available'}), 404
    
    # Format response
    weather_info = {
        'city': current_data['name'],
        'country': current_data['sys']['country'],
        'temperature': round(current_data['main']['temp']),
        'feelsLike': round(current_data['main']['feels_like']),
        'description': current_data['weather'][0]['description'],
        'humidity': current_data['main']['humidity'],
        'windSpeed': round(current_data['wind']['speed'] * 3.6),  # Convert m/s to km/h
        'pressure': current_data['main']['pressure'],
        'visibility': round(current_data.get('visibility', 10000) / 1000),  # Convert m to km
        'cloudiness': current_data['clouds']['all'],
        'icon': weather_service.get_weather_icon_class(current_data['weather'][0]['icon']),
        'uvIndex': 5  # UV index requires separate API call, using placeholder
    }
    
    return jsonify(weather_info)

@app.route('/api/weather/forecast', methods=['GET'])
def get_weather_forecast():
    """Get 5-day weather forecast"""
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    if not city and not (lat and lon):
        return jsonify({'error': 'City name or coordinates required'}), 400
    
    # Get forecast data
    forecast_data = weather_service.get_forecast(city=city, lat=lat, lon=lon)
    if not forecast_data:
        return jsonify({'error': 'Forecast data not available'}), 404
    
    # Process forecast data (get daily forecasts)
    daily_forecasts = {}
    for item in forecast_data['list']:
        date = datetime.fromtimestamp(item['dt']).date()
        if date not in daily_forecasts:
            daily_forecasts[date] = {
                'temps': [],
                'descriptions': [],
                'icons': []
            }
        
        daily_forecasts[date]['temps'].append(item['main']['temp'])
        daily_forecasts[date]['descriptions'].append(item['weather'][0]['description'])
        daily_forecasts[date]['icons'].append(item['weather'][0]['icon'])
    
    # Format daily forecasts
    forecast_list = []
    today = datetime.now().date()
    
    for i, (date, data) in enumerate(list(daily_forecasts.items())[:5]):
        if date == today:
            day_name = 'Today'
        elif date == today + timedelta(days=1):
            day_name = 'Tomorrow'
        else:
            day_name = date.strftime('%A')
        
        forecast_list.append({
            'day': day_name,
            'high': round(max(data['temps'])),
            'low': round(min(data['temps'])),
            'description': max(set(data['descriptions']), key=data['descriptions'].count),
            'icon': weather_service.get_weather_icon_class(max(set(data['icons']), key=data['icons'].count))
        })
    
    return jsonify(forecast_list)

@app.route('/api/weather/complete', methods=['GET'])
def get_complete_weather():
    """Get both current weather and forecast in one request"""
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    if not city and not (lat and lon):
        return jsonify({'error': 'City name or coordinates required'}), 400
    
    # Get current weather
    current_response = get_current_weather()
    if current_response.status_code != 200:
        return current_response
    
    # Get forecast
    forecast_response = get_weather_forecast()
    if forecast_response.status_code != 200:
        return forecast_response
    
    return jsonify({
        'current': current_response.get_json(),
        'forecast': forecast_response.get_json()
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'api_key_configured': bool(OPENWEATHER_API_KEY and OPENWEATHER_API_KEY != 'your_api_key_here')
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting Weather API Server...")
    print(f"API Key configured: {bool(OPENWEATHER_API_KEY and OPENWEATHER_API_KEY != 'your_api_key_here')}")
    print("Available endpoints:")
    print("  GET /api/weather/current?city=CityName")
    print("  GET /api/weather/forecast?city=CityName")
    print("  GET /api/weather/complete?city=CityName")
    print("  GET /api/health")
    print("\nServer running on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)