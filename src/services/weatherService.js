const API_KEY = '9e70ef97531435bfb36aadff98898d20';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const weatherService = {
  /**
   * Obtiene el clima actual por coordenadas
   */
  async getCurrentWeather(lat, lon) {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
      );
      if (!response.ok) throw new Error('Error al obtener el clima');
      return await response.ok ? response.json() : null;
    } catch (error) {
      console.error('WeatherService Error:', error);
      throw error;
    }
  },

  /**
   * Obtiene el clima actual por nombre de ciudad
   */
  async getWeatherByCity(city) {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`
      );
      if (!response.ok) throw new Error('Ciudad no encontrada');
      return await response.json();
    } catch (error) {
      console.error('WeatherService Error:', error);
      throw error;
    }
  },

  /**
   * Obtiene la previsión de los próximos días (Forecast)
   * Nota: La versión gratuita de OpenWeather retorna cada 3 horas por 5 días.
   */
  async getForecast(city) {
    try {
      const response = await fetch(
        `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`
      );
      if (!response.ok) throw new Error('Error al obtener la previsión');
      return await response.json();
    } catch (error) {
      console.error('WeatherService Error:', error);
      throw error;
    }
  }
};
