<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import HeroSection from '../components/HeroSection.vue'
import GameGrid from '../components/GameGrid.vue'

const router = useRouter()
const games = ref([])
const selectedGame = ref(null)
let modalInstance = null

const fetchGames = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stores`)
    const data = await response.json()
    if (response.ok && data.code === 0) {
      games.value = data.data.stores.map((store, index) => ({
        id: store.id,
        name: store.name,
        // Random price for display since API doesn't list price in store summary easily without points logic
        price: 'TWD ' + (Math.floor(Math.random() * 500) + 50), 
        image: `https://picsum.photos/600/400?random=${index + 100}`
      }))
    }
  } catch (error) {
    console.error('Fetch Games Error:', error)
  }
}

onMounted(() => {
  modalInstance = new Modal(document.getElementById('homeActionModal'))
  fetchGames()
})

const openModal = (game) => {
  selectedGame.value = game
  modalInstance.show()
}

const handleAction = (actionType) => {
  modalInstance.hide()
  if (!selectedGame.value) return

  router.push({
    path: '/transaction',
    query: {
      type: actionType === 'Buy Currency' ? 'buy' : 'sell',
      game: selectedGame.value.name,
      storeId: selectedGame.value.id
    }
  })
}
</script>

<template>
  <div>
    <HeroSection />
    <GameGrid title="熱門遊戲" :items="games.slice(0, 6)" @game-click="openModal" />
    <GameGrid title="新上市" :items="games.slice(0, 6).reverse()" @game-click="openModal" />
    <GameGrid title="每周熱銷" :items="games.slice(0, 6)" @game-click="openModal" />

    <!-- Action Modal -->
    <div class="modal fade" id="homeActionModal" tabindex="-1" aria-hidden="true">
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
