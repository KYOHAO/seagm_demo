<script setup>
</script>

<template>
  <section class="hero-section my-4">
    <div class="container">
      <div id="heroCarousel" class="carousel slide rounded overflow-hidden shadow-sm" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>
        <div class="carousel-inner">
          <div class="carousel-item active">
            <img src="https://placehold.co/1200x400/007bff/ffffff?text=discount+1" class="d-block w-100" alt="Promotion 1">
          </div>
          <div class="carousel-item">
            <img src="https://placehold.co/1200x400/6610f2/ffffff?text=discount+2" class="d-block w-100" alt="Promotion 2">
          </div>
          <div class="carousel-item">
            <img src="https://placehold.co/1200x400/fd7e14/ffffff?text=discount+3" class="d-block w-100" alt="Promotion 3">
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
      
      <!-- Quick Access Icons (Optional, based on SEAGM layout) -->
      <!--<div class="row text-center mt-4 g-3">
        <div class="col-3 col-md-2">
          <div class="p-3 border rounded bg-white shadow-sm h-100 d-flex flex-column align-items-center justify-content-center hover-effect">
            <i class="bi bi-controller fs-2 text-primary"></i>
            <span class="d-block mt-2 small fw-bold">Game Cards</span>
          </div>
        </div>
        <div class="col-3 col-md-2">
          <div class="p-3 border rounded bg-white shadow-sm h-100 d-flex flex-column align-items-center justify-content-center hover-effect">
            <i class="bi bi-phone fs-2 text-success"></i>
            <span class="d-block mt-2 small fw-bold">Mobile Reload</span>
          </div>
        </div>
        <div class="col-3 col-md-2">
          <div class="p-3 border rounded bg-white shadow-sm h-100 d-flex flex-column align-items-center justify-content-center hover-effect">
            <i class="bi bi-gift fs-2 text-danger"></i>
            <span class="d-block mt-2 small fw-bold">Gift Cards</span>
          </div>
        </div>
        <div class="col-3 col-md-2">
          <div class="p-3 border rounded bg-white shadow-sm h-100 d-flex flex-column align-items-center justify-content-center hover-effect">
            <i class="bi bi-credit-card fs-2 text-warning"></i>
            <span class="d-block mt-2 small fw-bold">Direct Top-up</span>
          </div>
        </div>
         <div class="col-3 col-md-2">
          <div class="p-3 border rounded bg-white shadow-sm h-100 d-flex flex-column align-items-center justify-content-center hover-effect">
            <i class="bi bi-steam fs-2 text-dark"></i>
            <span class="d-block mt-2 small fw-bold">Steam</span>
          </div>
        </div>
         <div class="col-3 col-md-2">
          <div class="p-3 border rounded bg-white shadow-sm h-100 d-flex flex-column align-items-center justify-content-center hover-effect">
            <i class="bi bi-three-dots fs-2 text-secondary"></i>
            <span class="d-block mt-2 small fw-bold">More</span>
          </div>
        </div>
      </div>-->
    </div>
  </section>
</template>

<style scoped>
.hover-effect:hover {
  transform: translateY(-5px);
  transition: transform 0.3s ease;
  cursor: pointer;
}
</style>
