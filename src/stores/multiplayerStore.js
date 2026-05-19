import { defineStore } from 'pinia';
import { weatherService } from '../services/weatherService';
import { worldCities } from '../services/cities';

export const useMultiplayerStore = defineStore('multiplayer', {
  state: () => ({
    currentCity: '',
    realTemp: null,
    players: [
      { name: 'Jugador 1', score: 0, currentGuess: null, roundWins: 0 },
      { name: 'Jugador 2', score: 0, currentGuess: null, roundWins: 0 }
    ],
    currentRound: 1,
    maxRounds: 5,
    loading: false,
    gameState: 'playing', // 'playing', 'comparing', 'results', 'gameOver'
    availableCities: [],
    roundWinner: null, // index of winner, 'tie', or null
  }),

  actions: {
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
      const uniqueCities = [...new Set(worldCities)];
      this.availableCities = this.shuffle([...uniqueCities]);
    },

    async nextRound() {
      if (this.currentRound > this.maxRounds) {
        this.gameState = 'gameOver';
        return;
      }

      if (this.availableCities.length < 10) {
        this.initializePool();
      }

      this.loading = true;
      this.gameState = 'playing';
      this.players.forEach(p => p.currentGuess = null);
      this.roundWinner = null;
      
      this.currentCity = this.availableCities.pop();

      try {
        const data = await weatherService.getWeatherByCity(this.currentCity);
        this.realTemp = Math.round(data.main.temp);
      } catch (error) {
        console.error("Error al obtener clima para:", this.currentCity);
        return this.nextRound();
      } finally {
        this.loading = false;
      }
    },

    submitGuess(playerIndex, guess) {
      this.players[playerIndex].currentGuess = guess;
      
      // If both players have guessed, evaluate
      if (this.players.every(p => p.currentGuess !== null)) {
        this.evaluateRound();
      }
    },

    evaluateRound() {
      const diff0 = Math.abs(this.players[0].currentGuess - this.realTemp);
      const diff1 = Math.abs(this.players[1].currentGuess - this.realTemp);

      if (diff0 < diff1) {
        this.roundWinner = 0;
        this.players[0].roundWins++;
      } else if (diff1 < diff0) {
        this.roundWinner = 1;
        this.players[1].roundWins++;
      } else {
        this.roundWinner = 'tie';
      }
      
      this.gameState = 'results';
    },

    advanceRound() {
      this.currentRound++;
      if (this.currentRound > this.maxRounds) {
        this.gameState = 'gameOver';
      } else {
        this.nextRound();
      }
    },

    resetGame() {
      this.currentRound = 1;
      this.players.forEach(p => {
        p.score = 0;
        p.roundWins = 0;
        p.currentGuess = null;
      });
      this.initializePool();
      this.nextRound();
    }
  },

  getters: {
    gameWinner() {
      if (this.players[0].roundWins > this.players[1].roundWins) return 0;
      if (this.players[1].roundWins > this.players[0].roundWins) return 1;
      return 'tie';
    }
  }
});
