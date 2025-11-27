// Weather App JavaScript
class WeatherApp {
    constructor() {
        this.apiKey = 'demo_key'; // In production, this would be handled by backend
        this.baseURL = 'http://localhost:5000/api'; // Flask backend URL
        this.initializeElements();
        this.attachEventListeners();
        this.loadDefaultWeather();
    }

    initializeElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.errorMessage = document.getElementById('errorMessage');
        this.currentWeather = document.getElementById('currentWeather');
        this.forecast = document.getElementById('forecast');
        this.forecastContainer = document.getElementById('forecastContainer');
    }

    attachEventListeners() {
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        this.locationBtn.addEventListener('click', () => this.getCurrentLocation());
    }

    async loadDefaultWeather() {
        // Load weather for a default city (New York)
        await this.getWeatherData('New York');
    }

    async searchWeather() {
        const city = this.cityInput.value.trim();
        if (!city) {
            this.showError('Please enter a city name');
            return;
        }
        await this.getWeatherData(city);
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }

        this.showLoading();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await this.getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                this.hideLoading();
                this.showError('Unable to get your location. Please search manually.');
            }
        );
    }

    async getWeatherData(city) {
        this.showLoading();
        try {
            // In a real implementation, this would call the Flask backend
            // For demo purposes, we'll simulate API responses
            const weatherData = await this.simulateWeatherAPI(city);
            this.displayCurrentWeather(weatherData.current);
            this.displayForecast(weatherData.forecast);
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.showError('City not found. Please check the spelling and try again.');
        }
    }

    async getWeatherByCoords(lat, lon) {
        this.showLoading();
        try {
            // Simulate reverse geocoding and weather fetch
            const weatherData = await this.simulateWeatherAPIByCoords(lat, lon);
            this.displayCurrentWeather(weatherData.current);
            this.displayForecast(weatherData.forecast);
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.showError('Unable to fetch weather data for your location.');
        }
    }

    // Simulate API calls for demo purposes
    async simulateWeatherAPI(city) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock weather data
        const cities = {
            'new york': {
                current: {
                    city: 'New York',
                    country: 'US',
                    temperature: 22,
                    feelsLike: 25,
                    description: 'partly cloudy',
                    humidity: 65,
                    windSpeed: 12,
                    pressure: 1013,
                    visibility: 10,
                    uvIndex: 6,
                    cloudiness: 40,
                    icon: 'fas fa-cloud-sun'
                },
                forecast: this.generateMockForecast()
            },
            'london': {
                current: {
                    city: 'London',
                    country: 'UK',
                    temperature: 15,
                    feelsLike: 13,
                    description: 'light rain',
                    humidity: 80,
                    windSpeed: 8,
                    pressure: 1008,
                    visibility: 8,
                    uvIndex: 3,
                    cloudiness: 75,
                    icon: 'fas fa-cloud-rain'
                },
                forecast: this.generateMockForecast()
            },
            'tokyo': {
                current: {
                    city: 'Tokyo',
                    country: 'JP',
                    temperature: 28,
                    feelsLike: 32,
                    description: 'sunny',
                    humidity: 55,
                    windSpeed: 6,
                    pressure: 1020,
                    visibility: 15,
                    uvIndex: 8,
                    cloudiness: 10,
                    icon: 'fas fa-sun'
                },
                forecast: this.generateMockForecast()
            }
        };

        const cityKey = city.toLowerCase();
        if (cities[cityKey]) {
            return cities[cityKey];
        } else {
            // Return a generic response for other cities
            return {
                current: {
                    city: city,
                    country: 'Unknown',
                    temperature: Math.floor(Math.random() * 30) + 5,
                    feelsLike: Math.floor(Math.random() * 30) + 5,
                    description: 'clear sky',
                    humidity: Math.floor(Math.random() * 40) + 40,
                    windSpeed: Math.floor(Math.random() * 15) + 5,
                    pressure: Math.floor(Math.random() * 50) + 1000,
                    visibility: Math.floor(Math.random() * 10) + 5,
                    uvIndex: Math.floor(Math.random() * 10) + 1,
                    cloudiness: Math.floor(Math.random() * 60) + 20,
                    icon: 'fas fa-sun'
                },
                forecast: this.generateMockForecast()
            };
        }
    }

    async simulateWeatherAPIByCoords(lat, lon) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            current: {
                city: 'Your Location',
                country: '',
                temperature: 20,
                feelsLike: 22,
                description: 'clear sky',
                humidity: 60,
                windSpeed: 10,
                pressure: 1015,
                visibility: 12,
                uvIndex: 5,
                cloudiness: 20,
                icon: 'fas fa-sun'
            },
            forecast: this.generateMockForecast()
        };
    }

    generateMockForecast() {
        const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
        const descriptions = ['sunny', 'partly cloudy', 'cloudy', 'light rain', 'clear'];
        const icons = ['fas fa-sun', 'fas fa-cloud-sun', 'fas fa-cloud', 'fas fa-cloud-rain', 'fas fa-sun'];
        
        return days.map((day, index) => ({
            day: day,
            high: Math.floor(Math.random() * 15) + 20,
            low: Math.floor(Math.random() * 10) + 10,
            description: descriptions[index % descriptions.length],
            icon: icons[index % icons.length]
        }));
    }

    displayCurrentWeather(data) {
        document.getElementById('cityName').textContent = `${data.city}${data.country ? ', ' + data.country : ''}`;
        document.getElementById('weatherDate').textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('currentTemp').textContent = `${data.temperature}°C`;
        document.getElementById('feelsLike').textContent = `${data.feelsLike}°C`;
        document.getElementById('weatherDescription').textContent = data.description;
        document.getElementById('humidity').textContent = `${data.humidity}%`;
        document.getElementById('windSpeed').textContent = `${data.windSpeed} km/h`;
        document.getElementById('pressure').textContent = `${data.pressure} hPa`;
        document.getElementById('visibility').textContent = `${data.visibility} km`;
        document.getElementById('uvIndex').textContent = data.uvIndex;
        document.getElementById('cloudiness').textContent = `${data.cloudiness}%`;
        document.getElementById('weatherIconMain').className = data.icon;

        this.currentWeather.classList.remove('hidden');
    }

    displayForecast(forecastData) {
        this.forecastContainer.innerHTML = '';
        
        forecastData.forEach(item => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-day">${item.day}</div>
                <i class="forecast-icon ${item.icon}"></i>
                <div class="forecast-temps">
                    <span class="forecast-high">${item.high}°</span>
                    <span class="forecast-low">${item.low}°</span>
                </div>
                <div class="forecast-desc">${item.description}</div>
            `;
            this.forecastContainer.appendChild(forecastItem);
        });

        this.forecast.classList.remove('hidden');
    }

    showLoading() {
        this.loading.classList.remove('hidden');
        this.error.classList.add('hidden');
        this.currentWeather.classList.add('hidden');
        this.forecast.classList.add('hidden');
    }

    hideLoading() {
        this.loading.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.error.classList.remove('hidden');
        this.currentWeather.classList.add('hidden');
        this.forecast.classList.add('hidden');
    }
}

// Initialize the weather app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});