<template>
  <div class="page game-multi">
    
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
                <div class="round-indicator">Ronda {{ game.currentRound }} de {{ game.maxRounds }}</div>
                
                <div class="city-info">
                  <Globe :size="40" class="globe-icon" />
                  <p class="question">¿A qué temperatura está ahora mismo?</p>
                  <h1 class="city-name">{{ game.currentCity }}</h1>
                </div>

                <div class="player-turn-info">
                  <div class="player-badge" :class="'player-' + (currentPlayerIndex + 1)">
                    Turno de {{ game.players[currentPlayerIndex].name }}
                  </div>
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
                    Confirmar apuesta
                  </button>
                </div>
              </div>

              <!-- PANTALLA DE RESULTADOS DE RONDA -->
              <div v-else-if="game.gameState === 'results'" key="result" class="card-content result-content">
                <header class="result-header">
                  <div class="status-icon-box">
                    <component :is="feedbackIcon" :size="48" />
                  </div>
                  <h2>{{ roundResultMessage }}</h2>
                </header>

                <div class="real-temp-display">
                  <span class="label">Temperatura Real</span>
                  <span class="value">{{ game.realTemp }}°C</span>
                </div>

                <div class="players-comparison">
                  <div class="player-result-card" :class="{ 'is-winner': game.roundWinner === 0 }">
                    <span class="p-name">{{ game.players[0].name }}</span>
                    <span class="p-guess">{{ game.players[0].currentGuess }}°C</span>
                    <span class="p-diff">Dif: {{ Math.abs(game.players[0].currentGuess - game.realTemp) }}°</span>
                    <Trophy v-if="game.roundWinner === 0" :size="20" class="mini-trophy" />
                  </div>
                  
                  <div class="vs-divider">VS</div>

                  <div class="player-result-card" :class="{ 'is-winner': game.roundWinner === 1 }">
                    <span class="p-name">{{ game.players[1].name }}</span>
                    <span class="p-guess">{{ game.players[1].currentGuess }}°C</span>
                    <span class="p-diff">Dif: {{ Math.abs(game.players[1].currentGuess - game.realTemp) }}°</span>
                    <Trophy v-if="game.roundWinner === 1" :size="20" class="mini-trophy" />
                  </div>
                </div>

                <button @click="handleNextRound" class="next-btn">
                  {{ game.currentRound < game.maxRounds ? 'Siguiente ronda' : 'Ver resultado final' }} 
                  <ArrowRight :size="18" />
                </button>
              </div>

              <!-- PANTALLA DE FIN DE JUEGO -->
              <div v-else-if="game.gameState === 'gameOver'" key="gameover" class="card-content final-content">
                <div class="crown-box">
                  <Trophy :size="80" color="#fbbf24" />
                </div>
                <h1 class="final-title">{{ gameOverTitle }}</h1>
                
                <div class="final-score-board">
                  <div class="final-player-stat">
                    <span class="name">{{ game.players[0].name }}</span>
                    <span class="wins">{{ game.players[0].roundWins }} rondas</span>
                  </div>
                  <div class="final-player-stat">
                    <span class="name">{{ game.players[1].name }}</span>
                    <span class="wins">{{ game.players[1].roundWins }} rondas</span>
                  </div>
                </div>

                <button @click="game.resetGame" class="restart-btn">
                  <RotateCcw :size="20" /> Jugar de nuevo
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </main>

      <!-- Sidebar -->
      <aside class="game-sidebar">
        <div class="score-card glass-card multi-scores">
          <h3>Rondas Ganadas</h3>
          <div class="p-score-item p1">
            <span class="p-label">{{ game.players[0].name }}</span>
            <span class="p-val">{{ game.players[0].roundWins }}</span>
          </div>
          <div class="p-score-item p2">
            <span class="p-label">{{ game.players[1].name }}</span>
            <span class="p-val">{{ game.players[1].roundWins }}</span>
          </div>
        </div>

        <div class="sidebar-actions">
          <button @click="showHelp = true" class="action-btn help-btn">
            <HelpCircle :size="18" /> ¿Cómo se juega?
          </button>
          <button @click="game.resetGame" class="action-btn reset-btn">
            <RotateCcw :size="18" /> Reiniciar duelo
          </button>
        </div>

        <div class="info-card glass-card">
          <div class="info-header">
            <Users :size="18" class="info-icon" />
            <span class="info-label">Duelo Local</span>
          </div>
          <p>Jugad por turnos en el mismo dispositivo. Quien más se acerque a la temperatura real gana la ronda.</p>
        </div>
      </aside>

    </div>

    <!-- Modal de Ayuda -->
    <Transition name="modal">
      <div v-if="showHelp" class="modal-overlay" @click.self="showHelp = false">
        <div class="modal-content glass-card">
          <header class="modal-header">
            <div class="title-with-icon">
              <HelpCircle :size="28" color="#3b82f6" />
              <h2>Duelo Multijugador</h2>
            </div>
            <button @click="showHelp = false" class="close-btn"><X :size="24" /></button>
          </header>
          
          <div class="modal-body">
            <div class="info-section">
              <h3>El Objetivo</h3>
              <p>Competid cara a cara para ver quién tiene mejor instinto meteorológico. Ganará quien más rondas consiga ganar tras 5 ciudades aleatorias.</p>
            </div>

            <div class="info-section">
              <h3>Dinámica de Ronda</h3>
              <div class="score-grid">
                <div class="score-item perfect">
                  <div class="item-left"><Users :size="16" /> Turno P1</div>
                  <div class="item-right">Apuesta ciega</div>
                </div>
                <div class="score-item near">
                  <div class="item-left"><Users :size="16" /> Turno P2</div>
                  <div class="item-right">Apuesta ciega</div>
                </div>
                <div class="score-item warm">
                  <div class="item-left"><Trophy :size="16" /> Ganador</div>
                  <div class="item-right">Menor diferencia</div>
                </div>
                <div class="score-item cold">
                  <div class="item-left"><MinusCircle :size="16" /> Empate</div>
                  <div class="item-right">Nadie puntúa</div>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h3>Fin de Partida</h3>
              <p>Tras 5 rondas, el jugador con más victorias se llevará la corona. ¡Cuidado con los empates en la diferencia de temperatura!</p>
            </div>
          </div>

          <button @click="showHelp = false" class="modal-confirm-btn">¡Que empiece el duelo!</button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useMultiplayerStore } from '../stores/multiplayerStore';
import { 
  Trophy, Globe, ArrowRight, HelpCircle, 
  RotateCcw, X, Users, CheckCircle2, 
  MinusCircle, AlertTriangle
} from 'lucide-vue-next';

const game = useMultiplayerStore();
const userGuess = ref(null);
const currentPlayerIndex = ref(0);
const showHelp = ref(false);

const handleCheck = () => {
  if (userGuess.value === null) return;

  if (currentPlayerIndex.value === 0) {
    game.players[0].currentGuess = userGuess.value;
    userGuess.value = null;
    currentPlayerIndex.value = 1;
  } else {
    game.submitGuess(1, userGuess.value);
    userGuess.value = null;
    currentPlayerIndex.value = 0;
  }
};

const handleNextRound = () => {
  game.advanceRound();
};

const roundResultMessage = computed(() => {
  if (game.roundWinner === 'tie') return "¡Empate en esta ronda!";
  const winnerName = game.players[game.roundWinner].name;
  return `¡${winnerName} gana la ronda!`;
});

const feedbackClass = computed(() => {
  if (game.gameState === 'results') {
    if (game.roundWinner === 'tie') return 'near';
    return game.roundWinner === 0 ? 'player1-win' : 'player2-win';
  }
  if (game.gameState === 'gameOver') return 'perfect';
  return '';
});

const feedbackIcon = computed(() => {
  if (game.roundWinner === 'tie') return MinusCircle;
  return Trophy;
});

const gameOverTitle = computed(() => {
  const winner = game.gameWinner;
  if (winner === 'tie') return "¡Empate final!";
  return `¡${game.players[winner].name} es el ganador!`;
});

onMounted(() => {
  if (!game.currentCity) game.resetGame();
});
</script>

<style scoped>
.game-multi {
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

.game-board {
  height: 650px;
  display: flex;
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
}

.card-fixed-boundary {
  width: 100%;
  max-width: 600px;
  min-height: 550px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content {
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  text-align: center;
}

.round-indicator {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.city-info .globe-icon { color: #3b82f6; margin-bottom: 1rem; }
.city-info .question { font-size: 1.1rem; opacity: 0.5; margin-bottom: 0.5rem; }
.city-name { font-size: 4.5rem; font-weight: 900; margin: 0; line-height: 1; letter-spacing: -2px; }

.player-badge {
  padding: 0.8rem 2rem;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
}
.player-1 { border-color: #3b82f6; color: #60a5fa; }
.player-2 { border-color: #ec4899; color: #f472b6; }

.guess-input-group {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 1.5rem;
}

.guess-input-group input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  width: 200px;
  height: 120px;
  text-align: center;
  font-size: 5rem;
  font-weight: 900;
  color: white;
  outline: none;
  transition: transform 0.3s, background-color 0.3s, border-color 0.3s;
}

.guess-input-group input:focus { border-color: #3b82f6; background: rgba(255, 255, 255, 0.1); }

.celsius-mark { 
  position: absolute; 
  left: calc(50% + 110px);
  font-size: 2rem; 
  font-weight: 700; 
  opacity: 0.4; 
}

.primary-btn {
  background: white;
  color: #1e3a8a;
  border: none;
  padding: 1.2rem 3rem;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

/* Resultados */
.real-temp-display {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.real-temp-display .label { font-size: 0.9rem; opacity: 0.6; }
.real-temp-display .value { font-size: 4rem; font-weight: 900; color: #fbbf24; }

.players-comparison {
  display: flex;
  align-items: center;
  gap: 2rem;
  width: 100%;
  justify-content: center;
}

.player-result-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 140px;
  border: 2px solid transparent;
  position: relative;
}

.player-result-card.is-winner {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}

.mini-trophy {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #fbbf24;
  color: #1e3a8a;
  padding: 4px;
  border-radius: 50%;
}

.p-name { font-weight: 800; opacity: 0.7; }
.p-guess { font-size: 2.2rem; font-weight: 900; }
.p-diff { font-size: 0.9rem; font-weight: 700; color: #60a5fa; }

.vs-divider {
  font-weight: 900;
  font-style: italic;
  opacity: 0.3;
  font-size: 1.5rem;
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

/* GameOver */
.final-title { font-size: 3.5rem; font-weight: 900; margin: 0; }
.final-score-board {
  display: flex;
  gap: 3rem;
  margin: 1rem 0;
}
.final-player-stat {
  display: flex;
  flex-direction: column;
}
.final-player-stat .name { font-weight: 700; opacity: 0.6; }
.final-player-stat .wins { font-size: 2.5rem; font-weight: 900; }

.restart-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 1.2rem 3rem;
  border-radius: 16px;
  font-size: 1.2rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Sidebar */
.game-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
.multi-scores h3 { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1.5rem; opacity: 0.6; }
.p-score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
}
.p-score-item.p1 { border-left: 4px solid #3b82f6; }
.p-score-item.p2 { border-left: 4px solid #ec4899; }
.p-val { font-size: 2rem; font-weight: 900; }

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
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.2);
}

.help-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.reset-btn {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.reset-btn:hover {
  background: rgba(248, 113, 113, 0.1);
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.2);
  transform: translateY(-2px);
}

.info-card { padding: 1.5rem; text-align: left; }
.info-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1rem; opacity: 0.6; }
.info-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 800; }
.info-card p { font-size: 0.95rem; line-height: 1.5; opacity: 0.8; margin: 0; }

/* Feedback states */
.player1-win { border-color: rgba(59, 130, 246, 0.5); }
.player2-win { border-color: rgba(236, 72, 153, 0.5); }
.perfect { border-color: rgba(251, 191, 36, 0.5); }

/* Transitions & Modal (reusing patterns from single player) */
.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }

/* MODAL REDISEÑADO */
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

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.9); }

/* Loader */
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
</style>
