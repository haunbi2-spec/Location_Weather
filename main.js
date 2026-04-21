// Configuration
const LAT = 35.215;
const LON = 128.825;
const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

// Weather Code mapping to English and Lucide Icons
const weatherMap = {
      0: { label: 'Clear', icon: 'sun' },
      1: { label: 'Mainly Clear', icon: 'sun' },
      2: { label: 'Partly Cloudy', icon: 'cloud-sun' },
      3: { label: 'Overcast', icon: 'cloud' },
      45: { label: 'Fog', icon: 'cloud-fog' },
      48: { label: 'Dense Fog', icon: 'cloud-fog' },
      51: { label: 'Light Drizzle', icon: 'cloud-drizzle' },
      53: { label: 'Drizzle', icon: 'cloud-drizzle' },
      55: { label: 'Dense Drizzle', icon: 'cloud-drizzle' },
      61: { label: 'Light Rain', icon: 'cloud-rain' },
      63: { label: 'Rain', icon: 'cloud-rain' },
      65: { label: 'Heavy Rain', icon: 'cloud-rain' },
      71: { label: 'Light Snow', icon: 'cloud-snow' },
      73: { label: 'Snow', icon: 'cloud-snow' },
      75: { label: 'Heavy Snow', icon: 'cloud-snow' },
      80: { label: 'Showers', icon: 'cloud-lightning' },
      95: { label: 'Thunderstorm', icon: 'cloud-lightning' }
};

const getDayName = (dateStr) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const d = new Date(dateStr);
      return days[d.getDay()];
};

const formatDate = () => {
      const d = new Date();
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const date = d.getDate();
      const day = getDayName(d);
      return `${year}-${month}-${date} (${day})`;
};

// UI Update Functions
async function fetchWeather() {
      showLoading(true);
      try {
                const response = await fetch(API_URL);
                const data = await response.json();
                updateUI(data);
      } catch (error) {
                console.error('Failed to fetch weather data:', error);
                alert('Failed to get weather info.');
      } finally {
                showLoading(false);
      }
}

function showLoading(isLoading) {
      const loading = document.getElementById('loading');
      const content = document.getElementById('content');
      if (isLoading) {
                loading.classList.remove('hidden');
                content.classList.add('hidden');
      } else {
                loading.classList.add('hidden');
                content.classList.remove('hidden');
      }
}

function updateUI(data) {
      const current = data.current;
      const weather = weatherMap[current.weather_code] || { label: 'Unknown', icon: 'help-circle' };

    // Update Current Weather
    document.getElementById('current-date').textContent = formatDate();
      document.getElementById('current-temp').textContent = Math.round(current.temperature_2m);
      document.getElementById('weather-description').textContent = weather.label;
      document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
      document.getElementById('wind-speed').textContent = `${current.wind_speed_10m} m/s`;
      document.getElementById('feels-like').textContent = `${Math.round(current.apparent_temperature)}degC`;
      document.getElementById('precipitation').textContent = `${current.precipitation}mm`;

    // Update Main Icon
    const mainIcon = document.getElementById('main-icon');
      mainIcon.setAttribute('data-lucide', weather.icon);

    // Update Hourly Forecast
    renderHourly(data.hourly);

    // Update Daily Forecast
    renderDaily(data.daily);

    // Re-create icons
    lucide.createIcons();
}

function renderHourly(hourly) {
      const container = document.getElementById('hourly-forecast');
      container.innerHTML = '';

    const now = new Date().getHours();

    // Next 24 hours
    for (let i = now; i < now + 24; i++) {
              const time = new Date(hourly.time[i]);
              const hour = time.getHours();
              const temp = Math.round(hourly.temperature_2m[i]);
              const code = hourly.weather_code[i];
              const weather = weatherMap[code] || { icon: 'help-circle' };

          const item = document.createElement('div');
              item.className = 'hourly-item';
              item.innerHTML = `
                          <span>${hour}:00</span>
                                      <i data-lucide="${weather.icon}"></i>
                                                  <span style="font-weight: 600">${temp}deg</span>
                                                          `;
              container.appendChild(item);
    }
}

function renderDaily(daily) {
      const container = document.getElementById('daily-forecast');
      container.innerHTML = '';

    for (let i = 0; i < daily.time.length; i++) {
              const date = daily.time[i];
              const dayName = i === 0 ? 'Today' : getDayName(date);
              const maxTemp = Math.round(daily.temperature_2m_max[i]);
              const minTemp = Math.round(daily.temperature_2m_min[i]);
              const code = daily.weather_code[i];
              const weather = weatherMap[code] || { icon: 'help-circle' };

          const item = document.createElement('div');
              item.className = 'daily-item';
              item.innerHTML = `
                          <span class="day">${dayName}</span>
                                      <div style="display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
                                                      <i data-lucide="${weather.icon}"></i>
                                                                      <span style="font-size: 0.9rem; color: var(--text-dim)">${weatherMap[code]?.label || ''}</span>
                                                                                  </div>
                                                                                              <span class="temp-max">${maxTemp}deg</span>
                                                                                                          <span class="temp-min">${minTemp}deg</span>
                                                                                                                  `;
              container.appendChild(item);
    }
}

// Initial Fetch
document.addEventListener('DOMContentLoaded', () => {
      fetchWeather();

                              document.getElementById('refresh-btn').addEventListener('click', () => {
                                        const icon = document.querySelector('#refresh-btn i');
                                        icon.classList.add('refreshing');
                                        fetchWeather().then(() => {
                                                      setTimeout(() => icon.classList.remove('refreshing'), 1000);
                                        });
                              });
});
