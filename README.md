# WeatherApp 🌤️

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3.0-FFE14D?style=for-the-badge&logo=pinia&logoColor=black)
![OpenWeather](https://img.shields.io/badge/OpenWeather-API-EB6E4B?style=for-the-badge&logo=openweathermap&logoColor=white)

WeatherApp es una aplicación web moderna construida con **Vue 3** que consume la API de **OpenWeather** para ofrecer información climatológica en tiempo real y experiencias de juego interactivas. Este proyecto ha sido desarrollado como entrega para la asignatura de **DWEC**.

## 🚀 Características

La aplicación consta de 4 apartados principales:

1.  **📍 Clima Actual:** Obtención automática de la ubicación del usuario mediante geolocalización para mostrar la temperatura, descripción del tiempo y métricas detalladas (humedad, viento, presión, visibilidad).
2.  **📅 Previsión:** Buscador avanzado que combina un selector de ciudades preestablecidas y búsqueda manual para consultar el pronóstico detallado de los próximos 5 días.
3.  **🎯 Juego Individual:** Un reto de conocimientos climáticos donde deberás adivinar la temperatura actual de una ciudad aleatoria del mundo. ¡Consigue la puntuación más alta!
4.  **⚔️ Duelo Multijugador:** Modo competitivo local para 2 jugadores por turnos. El juego se desarrolla a 5 rondas, ganando quien más se aproxime a la temperatura real en cada ciudad.

## ✨ Aspectos Visuales

-   **Glassmorphism:** Interfaz elegante basada en tarjetas translúcidas con desenfoque de fondo.
-   **Diseño Responsivo:** Adaptado para una visualización óptima en diferentes dispositivos.
-   **Iconografía Dinámica:** Uso de la librería `lucide-vue-next` para una experiencia visual intuitiva.
-   **Transiciones:** Animaciones suaves entre rutas y cambios de estado de juego.

## 🛠️ Tecnologías Utilizadas

-   [Vue 3](https://vuejs.org/) - Framework progresivo de JavaScript.
-   [Vite](https://vitejs.dev/) - Herramienta de construcción rápida.
-   [Pinia](https://pinia.vuejs.org/) - Gestión de estado (Stores para el juego).
-   [Vue Router](https://router.vuejs.org/) - Navegación entre páginas.
-   [Lucide Vue Next](https://lucide.dev/) - Set de iconos personalizables.
-   [OpenWeather API](https://openweathermap.org/api) - Fuente de datos meteorológicos.

## 📦 Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto localmente:

1. **Clonar el repositorio:**
   ```bash
   git clone [URL-DE-TU-REPOSITORIO]
   cd [NOMBRE-DE-LA-CARPETA]
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. **Construir para producción:**
   ```bash
   npm run build
   ```

## 📝 Documentación Adicional

-   [Diseño Esquemático (Wireframe)](./WIREFRAME.md): Consulta la estructura lógica y los diagramas de flujo de la aplicación.

---

Desarrollado por un estudiante de **DAW** - Entrega Final DWEC.
