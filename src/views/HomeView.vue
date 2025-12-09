<script setup>
import HeroSection from '../components/HeroSection.vue'
import GameGrid from '../components/GameGrid.vue'
</script>

<template>
  <div>
    <HeroSection />
    <GameGrid title="熱門遊戲" />
    <GameGrid title="新上市" />
    <GameGrid title="每周熱銷" />
  </div>
</template>
