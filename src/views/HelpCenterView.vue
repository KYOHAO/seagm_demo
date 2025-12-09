<script setup>
</script>

<template>
  <div class="container my-5">
    <div class="text-center mb-5">
      <h1 class="fw-bold text-primary">Help Center</h1>
      <p class="text-muted">How can we help you today?</p>
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="input-group">
            <input type="text" class="form-control" placeholder="Search for help topics...">
            <button class="btn btn-primary" type="button"><i class="bi bi-search"></i></button>
          </div>
        </div>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="accordion shadow-sm" id="helpAccordion">
          
          <!-- Category 1 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                <i class="bi bi-person-circle me-2 text-primary"></i> Account & Profile
              </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#helpAccordion">
              <div class="accordion-body">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">How to register an account?</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">I forgot my password</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">How to change my email address?</a></li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Category 2 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingTwo">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                <i class="bi bi-credit-card me-2 text-success"></i> Payments & Billing
              </button>
            </h2>
            <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#helpAccordion">
              <div class="accordion-body">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">What payment methods are accepted?</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">Why was my payment declined?</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">How to request a refund?</a></li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Category 3 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingThree">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                <i class="bi bi-controller me-2 text-danger"></i> Orders & Delivery
              </button>
            </h2>
            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#helpAccordion">
              <div class="accordion-body">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">Where is my order?</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">How to redeem my code?</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">Order status explanation</a></li>
                </ul>
              </div>
            </div>
          </div>

           <!-- Category 4 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingFour">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                <i class="bi bi-shield-check me-2 text-warning"></i> Security & Privacy
              </button>
            </h2>
            <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#helpAccordion">
              <div class="accordion-body">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">Is my personal information safe?</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">Two-factor authentication guide</a></li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion-button:not(.collapsed) {
  background-color: #e7f1ff;
  color: #0c63e4;
}
.list-group-item {
  border: none;
  padding-left: 0;
}
.list-group-item a:hover {
  color: #0d6efd !important;
  text-decoration: underline !important;
}
</style>
