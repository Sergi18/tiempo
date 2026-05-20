<template>
  <div class="app-container">
    <nav class="main-nav">
      <div class="logo">WeatherApp</div>
      <div class="nav-links">
        <router-link to="/">Actual</router-link>
        <router-link to="/forecast">Previsión</router-link>
        <router-link to="/game-single">Individual</router-link>
        <router-link to="/game-multi">Duelo</router-link>
      </div>
    </nav>

    <main class="content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
.main-nav {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

@media (min-width: 640px) {
  .main-nav {
    flex-direction: row;
    justify-content: space-between;
    padding: 1.5rem 2rem;
  }
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  letter-spacing: -1px;
}

.nav-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

@media (min-width: 640px) {
  .nav-links {
    gap: 1.5rem;
  }
}

.nav-links a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.nav-links a:hover {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.nav-links a.router-link-active {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}
  padding: 1rem 1rem 0 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 768px) {
  .content {
    padding: 2rem 2rem 0 2rem;
  }
}

/* Animaciones de transición */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
