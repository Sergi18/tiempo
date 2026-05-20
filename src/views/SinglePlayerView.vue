<template>
  <div class="page game">
    
    <div class="game-container">
      
      <!-- Tablero Principal -->
      <main class="game-board">
        
        <div v-if="game.loading" class="game-card glass-card loader-state">
          <div class="loader-circle"></div>
          <p>Localizando una nueva ciudad...</p>
        </div>

        <!-- Contenedor Único -->
        <div v-else class="game-card glass-card" :class="feedbackClass">
          <div class="card-fixed-boundary">
            <Transition name="fade-slide" mode="out-in">
              <!-- PANTALLA DE JUEGO -->
              <div v-if="game.gameState === 'playing'" key="playing" class="card-content">
                <div class="city-info">
                  <Globe :size="40" class="globe-icon" />
                  <p class="question">¿A qué temperatura está ahora mismo?</p>
                  <h1 class="city-name">{{ game.currentCity }}</h1>
                </div>

                <div class="input-area">
                  <div class="guess-input-group">
                    <input 
                      v-model.number="userGuess" 
                      type="number" 
                      placeholder="0" 
                      @keyup.enter="handleCheck"
                      autofocus
                    >
                    <span class="celsius-mark">°C</span>
                  </div>
                  <button @click="handleCheck" :disabled="userGuess === null" class="primary-btn">
                    Comprobar temperatura
                  </button>
                </div>
              </div>

              <!-- PANTALLA DE RESULTADOS -->
              <div v-else key="result" class="card-content result-content">
                <header class="result-header">
                  <div class="status-icon-box">
                    <component :is="feedbackIcon" :size="48" />
                  </div>
                  <h2>{{ feedbackMessage }}</h2>
                </header>

                <div class="stats-comparison">
                  <div class="stat-pill">
                    <span class="label">Tu apuesta</span>
                    <span class="value">{{ userGuess }}°C</span>
                  </div>
                  <div class="stat-pill highlight">
                    <span class="label">Real</span>
                    <span class="value">{{ game.realTemp }}°C</span>
                  </div>
                </div>

                <p class="diff-text">Diferencia de <strong>{{ game.lastDifference }}°</strong></p>

                <button @click="handleNextRound" class="next-btn">
                  Siguiente ciudad <ArrowRight :size="18" />
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </main>

      <!-- Sidebar -->
      <aside class="game-sidebar">
        <div class="score-card glass-card">
          <Trophy :size="32" class="trophy-icon" />
          <div class="score-info">
            <span class="label">Puntos Totales</span>
            <span class="value">{{ game.score }}</span>
          </div>
        </div>

        <div class="sidebar-actions">
          <button @click="showHelp = true" class="action-btn help-btn">
            <HelpCircle :size="18" /> ¿Cómo jugar?
          </button>
          <button @click="game.resetGame" class="action-btn reset-btn">
            <RotateCcw :size="18" /> Reiniciar puntos
          </button>
        </div>

        <!-- PISTA DINÁMICA -->
        <Transition name="fade" mode="out-in">
          <div :key="currentTip" class="tips-card glass-card">
            <div class="tip-header">
              <Lightbulb :size="18" class="tip-icon" />
              <span class="tip-label">Consejo Meteorológico</span>
            </div>
            <p>{{ currentTip }}</p>
          </div>
        </Transition>
      </aside>

    </div>

    <!-- Modal de Ayuda -->
    <Transition name="modal">
      <div v-if="showHelp" class="modal-overlay" @click.self="showHelp = false">
        <div class="modal-content glass-card">
          <header class="modal-header">
            <div class="title-with-icon">
              <HelpCircle :size="28" color="#3b82f6" />
              <h2>Reglas del Juego</h2>
            </div>
            <button @click="showHelp = false" class="close-btn"><X :size="24" /></button>
          </header>
          
          <div class="modal-body">
            <div class="info-section">
              <h3>El Objetivo</h3>
              <p>Pon a prueba tus conocimientos sobre geografía y clima. Debes adivinar la temperatura actual de una ciudad aleatoria del mundo obtenida en tiempo real.</p>
            </div>

            <div class="info-section">
              <h3>Sistema de Puntuación</h3>
              <div class="score-grid">
                <div class="score-item perfect">
                  <div class="item-left"><Star :size="16" /> Exacto</div>
                  <div class="item-right">+100 pts</div>
                </div>
                <div class="score-item near">
                  <div class="item-left"><CheckCircle2 :size="16" /> Error ≤ 2°</div>
                  <div class="item-right">+50 pts</div>
                </div>
                <div class="score-item warm">
                  <div class="item-left"><AlertTriangle :size="16" /> Error ≤ 5°</div>
                  <div class="item-right">+20 pts</div>
                </div>
                <div class="score-item cold">
                  <div class="item-left"><XCircle :size="16" /> Más de 5°</div>
                  <div class="item-right">0 pts</div>
                </div>
              </div>
            </div>
          </div>

          <button @click="showHelp = false" class="modal-confirm-btn">¡Entendido, vamos a jugar!</button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { 
  Trophy, Globe, ArrowRight, HelpCircle, 
  RotateCcw, Lightbulb, X, Star, CheckCircle2, 
  AlertTriangle, XCircle
} from 'lucide-vue-next';

const game = useGameStore();
const userGuess = ref(null);
const showHelp = ref(false);

const tips = [
  "Las ciudades cerca del ecuador suelen estar por encima de los 25°C.",
  "En el hemisferio norte es verano de junio a agosto.",
  "Las ciudades de gran altitud son más frías de lo que parecen.",
  "El desierto puede ser muy caluroso de día y muy frío de noche.",
  "Busca patrones: Londres y París suelen tener temperaturas similares.",
  "Las islas oceánicas tienen temperaturas muy estables todo el año.",
  "Si es de noche en la ciudad, resta unos grados a tu apuesta.",
  "¡Cuidado con Moscú! Incluso en primavera puede hacer mucho frío."
];

const currentTip = ref(tips[0]);

const handleCheck = () => {
  if (userGuess.value !== null) {
    game.checkGuess(userGuess.value);
  }
};

const handleNextRound = () => {
  userGuess.value = null;
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  currentTip.value = randomTip;
  game.nextRound();
};

const feedbackMessage = computed(() => {
  const diff = game.lastDifference;
  if (diff === 0) return "¡Increíble! Acierto exacto.";
  if (diff <= 2) return "¡Casi! Muy cerca.";
  if (diff <= 5) return "Buen intento.";
  return "¡Más suerte la próxima!";
});

const feedbackClass = computed(() => {
  if (game.gameState === 'playing') return '';
  const diff = game.lastDifference;
  if (diff === 0) return 'perfect';
  if (diff <= 2) return 'near';
  if (diff <= 5) return 'warm';
  return 'cold';
});

const feedbackIcon = computed(() => {
  const diff = game.lastDifference;
  if (diff === 0) return Star;
  if (diff <= 2) return CheckCircle2;
  if (diff <= 5) return AlertTriangle;
  return XCircle;
});

onMounted(() => {
  if (!game.currentCity) game.nextRound();
});
</script>

<style scoped>
.game {
  max-width: 1200px;
  margin: 0 auto;
}

.game-container {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2.5rem;
  padding: 1.5rem 0 0 0;
}

@media (max-width: 900px) {
  .game-container { grid-template-columns: 1fr; }
}

/* Tablero Principal */
.game-board {
  min-height: 400px;
  display: flex;
}

@media (min-width: 900px) {
  .game-board {
    height: 650px;
  }
}

.game-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  transition: border-color 0.5s;
  padding: 2rem 1rem;
}

.card-fixed-boundary {
  width: 100%;
  max-width: 600px;
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 640px) {
  .card-fixed-boundary {
    min-height: 550px;
  }
}

.card-content {
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

@media (min-width: 640px) {
  .card-content {
    gap: 2rem;
  }
}

.city-info .globe-icon { color: #60a5fa; margin-bottom: 1rem; }
.city-info .question { font-size: 1.2rem; opacity: 0.5; margin-bottom: 0.5rem; }
.city-name { font-size: clamp(2.5rem, 10vw, 5.5rem); font-weight: 900; margin: 0; line-height: 1; letter-spacing: -3px; }

.guess-input-group {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.guess-input-group input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  width: clamp(140px, 40vw, 220px);
  height: clamp(90px, 30vw, 150px);
  text-align: center;
  font-size: clamp(3rem, 12vw, 6rem);
  font-weight: 900;
  color: white;
  outline: none;
  transition: transform 0.3s, background-color 0.3s, border-color 0.3s;
  padding-right: 0; 
}

.guess-input-group input:focus { border-color: #3b82f6; background: rgba(255, 255, 255, 0.1); }

.celsius-mark { 
  position: absolute; 
  left: calc(50% + clamp(75px, 20vw, 115px));
  font-size: clamp(1.2rem, 5vw, 2.5rem); 
  font-weight: 700; 
  opacity: 0.4; 
}

.primary-btn {
  background: white;
  color: #1e3a8a;
  border: none;
  padding: 1rem 2rem;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  width: fit-content;
}

@media (min-width: 640px) {
  .primary-btn {
    padding: 1.2rem 3rem;
    font-size: 1.2rem;
  }
}
.primary-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }

/* Resultados */
.status-icon-box {
  width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.1); margin-bottom: 1rem;
}

@media (min-width: 640px) {
  .status-icon-box {
    width: 100px; height: 100px;
  }
}

.stats-comparison { display: flex; gap: 2rem; flex-wrap: wrap; justify-content: center; }

@media (min-width: 640px) {
  .stats-comparison {
    gap: 4rem;
  }
}

.stat-pill .label { font-size: 0.9rem; opacity: 0.5; margin-bottom: 0.5rem; display: block; }
.stat-pill .value { font-size: clamp(2rem, 8vw, 3.5rem); font-weight: 900; }
.stat-pill.highlight { color: #fde047; }
.diff-text { font-size: 1.1rem; opacity: 0.8; }

@media (min-width: 640px) {
  .diff-text {
    font-size: 1.3rem;
  }
}

.next-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  border-radius: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

/* Sidebar */
.game-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
.score-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.5rem; }

@media (min-width: 640px) {
  .score-card {
    padding: 2.5rem;
  }
}

.trophy-icon { color: #fde047; }
.score-info .value { font-size: clamp(2.5rem, 10vw, 3.5rem); font-weight: 900; line-height: 1; }

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.action-btn {
  width: 100%;
  padding: 1.2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.3s, background-color 0.3s, border-color 0.3s, box-shadow 0.3s;
}

.help-btn {
  background: #3b82f6;
  color: white;
  border-color: #60a5fa;
}

.help-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}

.reset-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #f87171;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.tips-card { padding: 2rem; display: flex; flex-direction: column; gap: 1rem; min-height: 160px; }
.tip-header { display: flex; align-items: center; gap: 0.8rem; opacity: 0.6; }
.tip-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; }
.tips-card p { font-size: 1rem; line-height: 1.5; opacity: 0.8; margin: 0; }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 1.5rem;
}
.modal-content {
  max-width: 550px; width: 100%; padding: 3rem; display: flex; flex-direction: column; gap: 2.5rem;
}
.modal-header { display: flex; justify-content: space-between; align-items: center; }
.title-with-icon { display: flex; align-items: center; gap: 1.2rem; }
.title-with-icon h2 { margin: 0; font-size: 1.8rem; font-weight: 800; }
.close-btn { background: transparent; border: none; color: white; opacity: 0.5; cursor: pointer; transition: opacity 0.2s; }
.close-btn:hover { opacity: 1; }

.info-section h3 { font-size: 1.1rem; color: #60a5fa; margin-bottom: 0.8rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
.info-section p { font-size: 1.05rem; opacity: 0.8; line-height: 1.6; margin: 0; }

.score-grid { display: grid; grid-template-columns: 1fr; gap: 0.8rem; }
.score-item {
  display: flex; justify-content: space-between; padding: 1rem 1.5rem; border-radius: 12px; background: rgba(255, 255, 255, 0.05); border-left: 4px solid transparent;
}
.item-left { display: flex; align-items: center; gap: 1rem; font-weight: 600; font-size: 1.1rem; }
.item-right { font-weight: 800; font-size: 1.1rem; }

.score-item.perfect { border-left-color: #4ade80; }
.score-item.near { border-left-color: #60a5fa; }
.score-item.warm { border-left-color: #fbbf24; }
.score-item.cold { border-left-color: #f87171; }

.modal-confirm-btn {
  background: #3b82f6; color: white; border: none; padding: 1.2rem; border-radius: 14px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: background 0.2s;
}
.modal-confirm-btn:hover { background: #2563eb; }

/* Transiciones */
.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.9); }

/* Colores Feedback */
.perfect { border-color: rgba(34, 197, 94, 0.4); }
.near { border-color: rgba(59, 130, 246, 0.4); }
.warm { border-color: rgba(251, 191, 36, 0.4); }
.cold { border-color: rgba(248, 113, 113, 0.4); }
</style>
