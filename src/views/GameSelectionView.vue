<script setup>
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { useRouter } from 'vue-router'

const router = useRouter()
const games = ref([
  { id: 1, name: 'Genshin Impact', image: 'https://placehold.co/600x400?text=Genshin+Impact' },
  { id: 2, name: 'Honkai: Star Rail', image: 'https://placehold.co/600x400?text=Honkai+Star+Rail' },
  { id: 3, name: 'League of Legends', image: 'https://placehold.co/600x400?text=League+of+Legends' },
  { id: 4, name: 'Valorant', image: 'https://placehold.co/600x400?text=Valorant' },
  { id: 5, name: 'PUBG Mobile', image: 'https://placehold.co/600x400?text=PUBG+Mobile' },
  { id: 6, name: 'Mobile Legends', image: 'https://placehold.co/600x400?text=Mobile+Legends' },
])

const selectedGame = ref(null)
let modalInstance = null

onMounted(() => {
  modalInstance = new Modal(document.getElementById('actionModal'))
})

const openModal = (game) => {
  selectedGame.value = game
  modalInstance.show()
}

const handleAction = (actionType) => {
  modalInstance.hide()
  router.push({
    path: '/transaction',
    query: {
      type: actionType === 'Buy Currency' ? 'buy' : 'sell',
      game: selectedGame.value.name
    }
  })
}
</script>

<template>
  <div class="container my-5">
    <h2 class="text-center fw-bold mb-5 text-primary">Select a Game</h2>
    
    <div class="row g-4">
      <div v-for="game in games" :key="game.id" class="col-md-4">
        <div class="card h-100 shadow-sm game-card" @click="openModal(game)">
          <img :src="game.image" class="card-img-top" :alt="game.name">
          <div class="card-body text-center">
            <h5 class="card-title fw-bold mb-0">{{ game.name }}</h5>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="actionModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold" v-if="selectedGame">{{ selectedGame.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center py-4">
            <p class="text-muted mb-4">Please select an action:</p>
            <div class="d-grid gap-3">
              <button class="btn btn-success btn-lg" @click="handleAction('Buy Currency')">
                <i class="bi bi-cart-plus me-2"></i> Buy Game Currency (買遊戲幣)
              </button>
              <button class="btn btn-danger btn-lg" @click="handleAction('Sell Currency')">
                <i class="bi bi-currency-exchange me-2"></i> Sell Game Currency (賣遊戲幣)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}
</style>
