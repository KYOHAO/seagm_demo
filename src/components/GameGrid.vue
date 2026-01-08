<script setup>
import { useRouter } from 'vue-router'
import { formatNumber } from '../utils/format'

const router = useRouter()

defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => [
      { id: 1, name: 'PUBG', price: 'TWD 30', image: 'https://placehold.co/150x200/28a745/ffffff?text=PUBG' },
      { id: 2, name: '傳說對決', price: 'TWD 15', image: 'https://placehold.co/150x200/dc3545/ffffff?text=MLBB' },
      { id: 3, name: '穿越火線', price: 'TWD 20', image: 'https://placehold.co/150x200/ffc107/ffffff?text=Free+Fire' },
      { id: 4, name: '原神', price: 'TWD 150', image: 'https://placehold.co/150x200/17a2b8/ffffff?text=Genshin' },
      { id: 5, name: '瓦羅蘭', price: 'TWD 100', image: 'https://placehold.co/150x200/6610f2/ffffff?text=Valorant' },
      { id: 6, name: 'Steam 錢包', price: 'TWD 50', image: 'https://placehold.co/150x200/343a40/ffffff?text=Steam' },
    ]
  }
})


const emit = defineEmits(['game-click'])

const handleGameClick = (game) => {
  emit('game-click', game)
}
</script>

<template>
  <section class="game-grid my-5">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="fw-bold">{{ title }}</h3>
        <a href="#" class="text-decoration-none text-primary fw-semibold">查看全部 <i class="bi bi-chevron-right"></i></a>
      </div>
      
      <div class="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-3">
        <div class="col" v-for="item in items" :key="item.id">
          <div class="card h-100 border-0 shadow-sm hover-card" @click="handleGameClick(item)">
            <img :src="item.image" class="card-img-top rounded-top" :alt="item.name">
            <div class="card-body p-2 text-center">
              <h6 class="card-title text-truncate mb-1" :title="item.name">
                {{ item.name }}
              </h6>
              <div class="d-inline-block text-start small fw-bold">
                <div class="text-success">(買) NT$ 1 : {{ formatNumber(item.selling_rate) }}</div>
                <div class="text-danger">(賣) NT$ 1 : {{ formatNumber(item.buying_rate) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
  transition: all 0.3s ease;
  cursor: pointer;
}
.card-img-top {
  height: 200px;
  object-fit: cover;
}
</style>
