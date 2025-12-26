<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import HeroSection from '../components/HeroSection.vue'
import GameGrid from '../components/GameGrid.vue'
import { useGameStores } from '../composables/useGameStores'

const router = useRouter()
const { stores: games, fetchGameStores: fetchGames } = useGameStores()
const selectedGame = ref(null)
let modalInstance = null

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
            <p class="text-muted mb-4">請選擇一個動作:</p>
            <div class="d-grid gap-3">
              <button class="btn btn-success btn-lg" @click="handleAction('Buy Currency')">
                <i class="bi bi-cart-plus me-2"></i> 買遊戲幣
              </button>
              <button class="btn btn-danger btn-lg" @click="handleAction('Sell Currency')">
                <i class="bi bi-currency-exchange me-2"></i> 賣遊戲幣
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
