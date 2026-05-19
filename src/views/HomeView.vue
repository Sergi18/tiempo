<template>
  <div class="page home">
    <!-- Estado de Carga -->
    <div v-if="loading" class="global-loader">
      <div class="loader-circle"></div>
      <p>Localizando tu posición...</p>
    </div>

    <!-- Manejo de Errores -->
    <div v-else-if="error" class="error-container glass-card">
      <AlertCircle :size="48" color="#f87171" />
      <h2>¡Ups! Algo salió mal</h2>
      <p>{{ error }}</p>
      <button @click="getLocation" class="retry-btn">Reintentar Acceso</button>
    </div>

    <!-- Dashboard Principal -->
    <div v-else-if="weather" class="home-container fade-in">
      
      <!-- Bloque 1: Cabecera y Tiempo Principal -->
      <section class="main-display glass-card">
        <div class="display-header">
          <div class="location-box">
            <div class="geo-badge">
              <MapPin :size="14" /> {{ weather.name }}, {{ weather.sys.country }}
            </div>
            <h1 class="city-title">Tu Clima Actual</h1>
            <p class="current-date">{{ currentFullDate }}</p>
          </div>
          <div class="weather-badge">Tiempo Real</div>
        </div>

        <div class="weather-hero">
          <div class="hero-temp">
            <span class="temp-number">{{ Math.round(weather.main.temp) }}°</span>
            <div class="hero-condition">
              <img :src="`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`" alt="weather">
              <span class="condition-text">{{ weather.weather[0].description }}</span>
            </div>
          </div>

          <!-- Métricas Primarias Integradas -->
          <div class="hero-metrics">
            <div class="metric-item">
              <Thermometer :size="20" class="m-icon" />
              <div class="m-data">
                <span class="m-label">Sensación</span>
                <span class="m-value">{{ Math.round(weather.main.feels_like) }}°</span>
              </div>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <Droplets :size="20" class="m-icon" />
              <div class="m-data">
                <span class="m-label">Humedad</span>
                <span class="m-value">{{ weather.main.humidity }}%</span>
              </div>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <Wind :size="20" class="m-icon" />
              <div class="m-data">
                <span class="m-label">Viento</span>
                <span class="m-value">{{ weather.wind.speed }} <small>km/h</small></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bloque 2: Grid de Información Técnica (Ahora más prominente) -->
      <section class="technical-grid">
         <div class="tech-card glass-card">
            <div class="tech-icon"><Gauge :size="24" /></div>
            <div class="tech-info">
              <span class="tech-label">Presión Atmosférica</span>
              <span class="tech-value">{{ weather.main.pressure }} <small>hPa</small></span>
            </div>
         </div>
         <div class="tech-card glass-card">
            <div class="tech-icon"><Eye :size="24" /></div>
            <div class="tech-info">
              <span class="tech-label">Visibilidad</span>
              <span class="tech-value">{{ (weather.visibility / 1000).toFixed(1) }} <small>km</small></span>
            </div>
         </div>
         <div class="tech-card glass-card">
            <div class="tech-icon sunrise-icon"><Sunrise :size="24" /></div>
            <div class="tech-info">
              <span class="tech-label">Salida del Sol</span>
              <span class="tech-value">{{ formatTime(weather.sys.sunrise) }}</span>
            </div>
         </div>
         <div class="tech-card glass-card">
            <div class="tech-icon sunset-icon"><Sunset :size="24" /></div>
            <div class="tech-info">
              <span class="tech-label">Puesta del Sol</span>
              <span class="tech-value">{{ formatTime(weather.sys.sunset) }}</span>
            </div>
         </div>
      </section>

      <!-- Bloque 3: Timeline de las próximas horas -->
      <section v-if="hourlyForecast.length" class="timeline-container glass-card">
        <div class="section-header">
          <Clock :size="18" />
          <h3>Pronóstico por horas para hoy</h3>
        </div>
        <div class="timeline-scroll">
          <div v-for="slot in hourlyForecast" :key="slot.dt" class="timeline-slot">
            <span class="slot-time">{{ formatTime(slot.dt) }}</span>
            <img :src="`https://openweathermap.org/img/wn/${slot.weather[0].icon}.png`" alt="icon">
            <span class="slot-temp">{{ Math.round(slot.main.temp) }}°</span>
            <span class="slot-pop" v-if="slot.pop > 0">
              <CloudRain :size="10" /> {{ Math.round(slot.pop * 100) }}%
            </span>
          </div>
        </div>
      </section>

      <!-- Footer discreto con estado de API -->
      <footer class="home-footer">
        <div class="api-status">
          <div class="status-dot"></div>
          <span>OpenWeather API: Online</span>
        </div>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { 
  Droplets, Wind, Thermometer, Eye, MapPin,
  Gauge, AlertCircle, Sunrise, Sunset, Clock, 
  CloudRain
} from 'lucide-vue-next';
import { weatherService } from '../services/weatherService';

const weather = ref(null);
const hourlyForecast = ref([]);
const loading = ref(true);
const error = ref(null);

const currentFullDate = computed(() => {
  return new Intl.DateTimeFormat('es-ES', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  }).format(new Date());
});

const getLocation = () => {
  loading.value = true;
  error.value = null;

  if (!navigator.geolocation) {
    error.value = "Tu navegador no soporta geolocalización.";
    loading.value = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const [wRes, fRes] = await Promise.all([
          weatherService.getCurrentWeather(latitude, longitude),
          weatherService.getForecast(`${latitude},${longitude}`).catch(() => null)
        ]);
        
        weather.value = wRes;
        if (fRes) hourlyForecast.value = fRes.list.slice(0, 8);
      } catch (err) {
        error.value = "Error de conexión con el servicio.";
      } finally {
        loading.value = false;
      }
    },
    (err) => {
      error.value = "Se requiere permiso de ubicación para esta sección.";
      loading.value = false;
    }
  );
};

const formatTime = (t) => new Date(t * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

onMounted(getLocation);
</script>

<style scoped>
.home {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.home-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Bloque Principal */
.main-display {
  padding: 3rem;
}

.display-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
}

.geo-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.city-title { font-size: 3rem; margin: 0; font-weight: 900; line-height: 1; letter-spacing: -2px; }
.current-date { font-size: 1.1rem; color: rgba(255, 255, 255, 0.5); text-transform: capitalize; margin-top: 0.5rem; }

.weather-badge {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Hero Section */
.hero-temp {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}
.temp-number { font-size: 10rem; font-weight: 900; line-height: 0.8; letter-spacing: -6px; }
.hero-condition { display: flex; flex-direction: column; align-items: center; }
.hero-condition img { width: 220px; height: 220px; margin: -40px 0; }
.condition-text { font-size: 1.6rem; font-weight: 600; text-transform: capitalize; opacity: 0.9; }

.hero-metrics {
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  justify-content: space-around;
  align-items: center;
}
.metric-item { display: flex; align-items: center; gap: 1.5rem; }
.m-icon { color: #60a5fa; }
.m-data { display: flex; flex-direction: column; }
.m-label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 1px; }
.m-value { font-size: 1.5rem; font-weight: 700; }
.metric-divider { width: 1px; height: 40px; background: rgba(255, 255, 255, 0.1); }

/* Grid Técnico (Mejorado) */
.technical-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .technical-grid { grid-template-columns: repeat(2, 1fr); }
}

.tech-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  transition: transform 0.3s;
}
.tech-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.12); }
.tech-icon { width: 50px; height: 50px; border-radius: 12px; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; color: #93c5fd; }
.sunrise-icon { color: #fbbf24; }
.sunset-icon { color: #f87171; }
.tech-label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.5); display: block; margin-bottom: 0.3rem; }
.tech-value { font-size: 1.5rem; font-weight: 700; }

/* Timeline */
.timeline-container {
  padding: 2.5rem;
}
.section-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 2rem; opacity: 0.6; }
.section-header h3 { font-size: 1.1rem; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
.timeline-scroll { display: flex; gap: 3rem; overflow-x: auto; padding-bottom: 1.5rem; }
.timeline-scroll::-webkit-scrollbar { height: 4px; }
.timeline-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
.timeline-slot { display: flex; flex-direction: column; align-items: center; min-width: 80px; position: relative; }
.slot-time { font-size: 0.9rem; opacity: 0.5; margin-bottom: 0.5rem; }
.slot-temp { font-weight: 800; font-size: 1.4rem; }
.slot-pop { font-size: 0.7rem; color: #60a5fa; font-weight: 700; display: flex; align-items: center; gap: 2px; margin-top: 0.4rem; }

/* Footer & API Status */
.home-footer {
  padding: 1rem 0;
  display: flex;
  justify-content: center;
}
.api-status {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.75rem;
  opacity: 0.4;
}
.status-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 5px #22c55e; }

/* Utils */
.global-loader {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(20px);
  display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2000;
}
.loader-circle { 
  width: 60px; 
  height: 60px; 
  border: 4px solid rgba(255, 255, 255, 0.1); 
  border-top-color: #3b82f6; 
  border-radius: 50%; 
  animation: spin 1s infinite linear; 
  margin-bottom: 2rem; 
  will-change: transform;
}
@keyframes spin { to { transform: rotate(360deg); } }
.fade-in { animation: fadeIn 0.8s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
