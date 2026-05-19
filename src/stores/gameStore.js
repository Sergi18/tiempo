import { defineStore } from 'pinia';
import { weatherService } from '../services/weatherService';
import { worldCities } from '../services/cities';

export const useGameStore = defineStore('game', {
  state: () => ({
    currentCity: '',
    realTemp: null,
    score: 0,
    loading: false,
    lastDifference: null,
    gameState: 'playing', // 'playing', 'result'
    availableCities: [], // Pool de ciudades mezcladas
  }),

  actions: {
    // Función para mezclar un array (Fisher-Yates)
    shuffle(array) {
      let currentIndex = array.length, randomIndex;
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
      }
      return array;
    },

    initializePool() {
      // Filtramos duplicados por si acaso y mezclamos toda la lista
      const uniqueCities = [...new Set(worldCities)];
      this.availableCities = this.shuffle([...uniqueCities]);
    },

    async nextRound() {
      // Si no hay piscina de ciudades o se está agotando, la inicializamos
      if (this.availableCities.length < 10) {
        this.initializePool();
      }

      this.loading = true;
      this.gameState = 'playing';
      this.lastDifference = null;
      
      // Sacamos la primera ciudad de la piscina (garantiza no repetición)
      this.currentCity = this.availableCities.pop();

      try {
        const data = await weatherService.getWeatherByCity(this.currentCity);
        this.realTemp = Math.round(data.main.temp);
      } catch (error) {
        console.error("Error al obtener clima para:", this.currentCity);
        // Si falla la ciudad, intentamos con la siguiente de la piscina inmediatamente
        return this.nextRound();
      } finally {
        this.loading = false;
      }
    },

    checkGuess(guess) {
      this.lastDifference = Math.abs(guess - this.realTemp);
      if (this.lastDifference === 0) {
        this.score += 100;
      } else if (this.lastDifference <= 2) {
        this.score += 50;
      } else if (this.lastDifference <= 5) {
        this.score += 20;
      }
      this.gameState = 'result';
    },

    resetGame() {
      this.score = 0;
      this.initializePool();
      this.nextRound();
    }
  }
});
