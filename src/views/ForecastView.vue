<template>
  <div class="page forecast">
    <!-- Buscador Superior -->
    <header class="search-header glass-card">
      <div class="search-input-group">
        <div class="select-wrapper">
          <MapPin class="icon-pin" :size="20" />
          <select v-model="searchQuery" @change="fetchData">
            <option disabled value="">Selecciona una ciudad</option>
            <option v-for="city in presetCities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
        </div>
        
        <div class="divider"></div>

        <div class="manual-search">
          <Search class="icon-search" :size="18" />
          <input 
            v-model="manualQuery" 
            type="text" 
            placeholder="O busca otra..."
            @keyup.enter="handleManualSearch"
          >
        </div>
      </div>
    </header>

    <div v-if="error" class="error-msg glass-card">
      <AlertCircle color="#ff4444" />
      <span>{{ error }}</span>
    </div>

    <!-- Layout Dashboard -->
    <div v-if="currentWeather && !loading" class="dashboard-layout">
      
      <!-- Columna Principal -->
      <section class="main-column">
        
        <!-- Tarjeta de Exhibición Principal -->
        <div class="main-display glass-card">
          <div class="display-header">
            <div class="location-nav">
              <span v-if="selectedDayData" class="breadcrumb-back" @click="selectedDayData = null">
                {{ currentWeather.name }} <ChevronRight :size="14" />
              </span>
              <h2 class="city-title">
                {{ selectedDayData ? formatDateLong(selectedDayData.dt) : currentWeather.name + ', ' + currentWeather.sys.country }}
              </h2>
            </div>
            <div class="time-label">{{ selectedDayData ? 'Previsión detallada' : currentDayName }}</div>
          </div>

          <div class="weather-hero">
            <div class="hero-temp">
              <span class="temp-number">{{ Math.round(activeWeather.main.temp) }}°</span>
              <div class="hero-condition">
                <img :src="`https://openweathermap.org/img/wn/${activeWeather.weather[0].icon}@4x.png`" alt="weather">
                <span class="condition-text">{{ activeWeather.weather[0].description }}</span>
              </div>
            </div>

            <!-- Métricas Integradas (Rediseñadas) -->
            <div class="hero-metrics">
              <div class="metric-item">
                <Thermometer :size="18" class="m-icon" />
                <div class="m-data">
                  <span class="m-label">Sensación</span>
                  <span class="m-value">{{ Math.round(activeWeather.main.feels_like) }}°</span>
                </div>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <Droplets :size="18" class="m-icon" />
                <div class="m-data">
                  <span class="m-label">Humedad</span>
                  <span class="m-value">{{ activeWeather.main.humidity }}%</span>
                </div>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <Wind :size="18" class="m-icon" />
                <div class="m-data">
                  <span class="m-label">Viento</span>
                  <span class="m-value">{{ activeWeather.wind.speed }} <small>km/h</small></span>
                </div>
              </div>
              <div v-if="activeWeather.pop !== undefined" class="metric-divider"></div>
              <div v-if="activeWeather.pop !== undefined" class="metric-item">
                <CloudRain :size="18" class="m-icon" />
                <div class="m-data">
                  <span class="m-label">Lluvia</span>
                  <span class="m-value">{{ Math.round(activeWeather.pop * 100) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline Detallada -->
          <div v-if="selectedDayData" class="timeline-section">
            <div class="section-header">
              <Clock :size="16" />
              <h3>Evolución por horas</h3>
            </div>
            <div class="timeline-scroll">
              <div v-for="slot in hourlyForecast" :key="slot.dt" class="timeline-slot">
                <span class="slot-time">{{ formatTime(slot.dt) }}</span>
                <img :src="`https://openweathermap.org/img/wn/${slot.weather[0].icon}.png`" alt="icon">
                <span class="slot-temp">{{ Math.round(slot.main.temp) }}°</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Grid de Info Secundaria (Solo modo actual) -->
        <div v-if="!selectedDayData" class="secondary-info-grid">
           <div class="info-card glass-card">
              <div class="info-icon"><Gauge :size="20" /></div>
              <div class="info-content">
                <span class="info-label">Presión Atmosférica</span>
                <span class="info-value">{{ currentWeather.main.pressure }} <small>hPa</small></span>
              </div>
           </div>
           <div class="info-card glass-card">
              <div class="info-icon"><Eye :size="20" /></div>
              <div class="info-content">
                <span class="info-label">Visibilidad Total</span>
                <span class="info-value">{{ (currentWeather.visibility / 1000).toFixed(1) }} <small>km</small></span>
              </div>
           </div>
           <div class="info-card glass-card">
              <div class="info-icon sunrise-icon"><Sunrise :size="20" /></div>
              <div class="info-content">
                <span class="info-label">Amanecer</span>
                <span class="info-value">{{ formatTime(currentWeather.sys.sunrise) }}</span>
              </div>
           </div>
           <div class="info-card glass-card">
              <div class="info-icon sunset-icon"><Sunset :size="20" /></div>
              <div class="info-content">
                <span class="info-label">Atardecer</span>
                <span class="info-value">{{ formatTime(currentWeather.sys.sunset) }}</span>
              </div>
           </div>
        </div>
      </section>

      <!-- Panel Lateral -->
      <aside class="side-panel">
        <header class="side-header">
          <h3>Próximos días</h3>
          <span class="selection-hint">Selecciona para ver detalles</span>
        </header>
        
        <div class="forecast-list">
          <div 
            v-for="day in forecastDays" 
            :key="day.dt" 
            class="forecast-card glass-card"
            :class="{ 'is-active': selectedDayData && isSameDay(selectedDayData.dt, day.dt) }"
            @click="selectDay(day)"
          >
            <div class="f-day-info">
              <span class="f-name">{{ formatDateShort(day.dt).split(' ')[0] }}</span>
              <span class="f-date">{{ formatDateShort(day.dt).split(' ')[1] }}</span>
            </div>
            
            <img :src="`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`" alt="w" class="f-icon">
            
            <div class="f-main">
              <span class="f-condition">{{ day.weather[0].description }}</span>
              <div class="f-temp-range">
                <span class="f-max">{{ Math.round(day.main.temp_max) }}°</span>
                <span class="f-min">{{ Math.round(day.main.temp_min) }}°</span>
              </div>
            </div>
            
            <ChevronRight :size="16" class="f-chevron" />
          </div>
        </div>
      </aside>

    </div>

    <!-- Cargando -->
    <div v-if="loading" class="global-loader">
      <div class="loader-circle"></div>
      <p>Actualizando datos...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { 
  Search, Droplets, Wind, Thermometer, Eye, 
  Gauge, AlertCircle, ChevronRight,
  CloudRain, Sunrise, Sunset, Clock, MapPin
} from 'lucide-vue-next';
import { weatherService } from '../services/weatherService';

const searchQuery = ref('Barcelona');
const manualQuery = ref('');
const presetCities = [
  'Barcelona', 'Madrid', 'Londres', 'París', 'Berlín', 
  'Roma', 'Nueva York', 'Tokio', 'Sídney', 'Ciudad de México'
];

const handleManualSearch = () => {
  if (manualQuery.value) {
    searchQuery.value = manualQuery.value;
    fetchData();
  }
};

const currentWeather = ref(null);
const fullForecastList = ref([]);
const forecastDays = ref([]);
const selectedDayData = ref(null);
const loading = ref(false);
const error = ref(null);

const activeWeather = computed(() => selectedDayData.value || currentWeather.value);
const currentDayName = computed(() => new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()));

const hourlyForecast = computed(() => {
  if (!selectedDayData.value) return [];
  const dateStr = new Date(selectedDayData.value.dt * 1000).toDateString();
  return fullForecastList.value.filter(i => new Date(i.dt * 1000).toDateString() === dateStr);
});

const fetchData = async () => {
  if (!searchQuery.value) return;
  loading.value = true;
  error.value = null;
  selectedDayData.value = null;
  try {
    const [w, f] = await Promise.all([
      weatherService.getWeatherByCity(searchQuery.value),
      weatherService.getForecast(searchQuery.value)
    ]);
    currentWeather.value = w;
    fullForecastList.value = f.list;
    forecastDays.value = f.list.filter(i => i.dt_txt.includes('12:00:00'));
  } catch (err) {
    error.value = "Localidad no encontrada";
  } finally { loading.value = false; }
};

const selectDay = (day) => selectedDayData.value = day;
const isSameDay = (t1, t2) => new Date(t1 * 1000).toDateString() === new Date(t2 * 1000).toDateString();
const formatDateShort = (t) => new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric' }).format(new Date(t * 1000));
const formatDateLong = (t) => new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(t * 1000));
const formatTime = (t) => new Date(t * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

onMounted(fetchData);
</script>

<style scoped>
.forecast {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Buscador */
.search-header {
  padding: 1rem 2rem;
}
.search-input-group {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.select-wrapper {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.icon-pin { color: #60a5fa; }

select {
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  min-width: 150px;
}

select option {
  background: #1e3a8a;
  color: white;
}

.divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
}

.manual-search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.icon-search { opacity: 0.4; }

input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  outline: none;
}

/* Dashboard Layout */
.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 2rem;
}

@media (max-width: 1100px) {
  .dashboard-layout { grid-template-columns: 1fr; }
}

/* Columna Principal */
.main-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.main-display {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  position: relative;
  overflow: hidden;
}

/* Navegación Interna */
.display-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.location-nav {
  display: flex;
  flex-direction: column;
}
.breadcrumb-back {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  margin-bottom: 0.4rem;
  transition: color 0.2s;
}
.breadcrumb-back:hover { color: white; }
.city-title { font-size: 2.5rem; margin: 0; font-weight: 800; line-height: 1.1; }
.time-label { font-size: 1rem; color: rgba(255, 255, 255, 0.5); text-transform: capitalize; }

/* Hero Weather Section */
.weather-hero {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
.hero-temp {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.temp-number { font-size: 8rem; font-weight: 900; line-height: 0.8; letter-spacing: -4px; }
.hero-condition { display: flex; flex-direction: column; align-items: center; }
.hero-condition img { width: 180px; height: 180px; margin: -20px 0; }
.condition-text { font-size: 1.4rem; font-weight: 600; text-transform: capitalize; opacity: 0.9; }

/* Métricas Rediseñadas */
.hero-metrics {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  justify-content: space-around;
  align-items: center;
}
.metric-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.m-icon { color: #60a5fa; }
.m-data { display: flex; flex-direction: column; }
.m-label { font-size: 0.75rem; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 1px; }
.m-value { font-size: 1.2rem; font-weight: 700; }
.m-value small { font-size: 0.8rem; font-weight: 400; opacity: 0.6; }
.metric-divider { width: 1px; height: 30px; background: rgba(255, 255, 255, 0.1); }

/* Timeline */
.timeline-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
}
.section-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.5rem; opacity: 0.6; }
.section-header h3 { font-size: 1rem; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
.timeline-scroll { display: flex; gap: 2rem; overflow-x: auto; padding-bottom: 1rem; }
.timeline-scroll::-webkit-scrollbar { height: 4px; }
.timeline-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
.timeline-slot { display: flex; flex-direction: column; align-items: center; min-width: 60px; transition: transform 0.2s; }
.timeline-slot:hover { transform: translateY(-5px); }
.slot-time { font-size: 0.8rem; opacity: 0.5; }
.slot-temp { font-weight: 700; font-size: 1.1rem; }

/* Grid Secundaria */
.secondary-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}
.info-card {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.3s;
}
.info-card:hover { transform: translateY(-3px); background: rgba(255, 255, 255, 0.12); }
.info-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; color: #93c5fd; }
.sunrise-icon { color: #fbbf24; }
.sunset-icon { color: #f87171; }
.info-content { display: flex; flex-direction: column; }
.info-label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.5); }
.info-value { font-size: 1.3rem; font-weight: 700; }
.info-value small { font-size: 0.9rem; opacity: 0.5; }

/* Side Panel */
.side-panel { display: flex; flex-direction: column; gap: 1.5rem; }
.side-header { padding: 0 0.5rem; }
.side-header h3 { font-size: 1.5rem; margin: 0; }
.selection-hint { font-size: 0.85rem; opacity: 0.4; }
.forecast-list { display: flex; flex-direction: column; gap: 1rem; }
.forecast-card {
  padding: 1.2rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s, background-color 0.3s, border-color 0.3s;
  border: 1px solid transparent;
}
.forecast-card:hover { background: rgba(255, 255, 255, 0.15); transform: scale(1.02); transform: scale(1.02); }
.forecast-card.is-active { background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.4); }
.f-day-info { display: flex; flex-direction: column; width: 60px; }
.f-name { font-size: 0.75rem; font-weight: 800; color: #60a5fa; text-transform: uppercase; }
.f-date { font-size: 1.4rem; font-weight: 700; line-height: 1; }
.f-icon { width: 50px; height: 50px; margin: 0 0.5rem; }
.f-main { flex: 1; display: flex; flex-direction: column; }
.f-condition { font-size: 0.85rem; opacity: 0.6; text-transform: capitalize; }
.f-temp-range { display: flex; gap: 1rem; margin-top: 0.2rem; }
.f-max { font-weight: 700; font-size: 1.1rem; }
.f-min { opacity: 0.4; font-size: 1.1rem; }
.f-chevron { opacity: 0.2; transition: transform 0.3s; }
.forecast-card:hover .f-chevron { opacity: 1; transform: translateX(4px); }

/* Loader */
.global-loader {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px);
  display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2000;
}
.loader-circle { 
  width: 60px; 
  height: 60px; 
  border: 4px solid rgba(255, 255, 255, 0.1); 
  border-top-color: #3b82f6; 
  border-radius: 50%; 
  animation: spin 1s infinite linear; 
  margin-bottom: 1.5rem; 
  will-change: transform;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
