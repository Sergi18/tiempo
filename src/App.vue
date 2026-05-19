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
}

.main-nav {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: white;
}

.content {
  flex: 1;
  padding: 2rem 2rem 0 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
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
