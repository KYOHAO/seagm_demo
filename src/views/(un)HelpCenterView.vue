<script setup>
</script>

<template>
  <div class="container my-5">
    <div class="text-center mb-5">
      <h1 class="fw-bold text-primary">幫助中心</h1>
      <p class="text-muted">我們可以幫到你什麼?</p>
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="input-group">
            <input type="text" class="form-control" placeholder="搜尋幫助主題...">
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
                <i class="bi bi-person-circle me-2 text-primary"></i> 帳號與個人資料
              </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#helpAccordion">
              <div class="accordion-body">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">如何註冊帳號?</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">我忘了密碼?</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">如何修改我的電子郵件地址?</a></li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Category 2 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingTwo">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                <i class="bi bi-credit-card me-2 text-success"></i> 付款與帳單
              </button>
            </h2>
            <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#helpAccordion">
              <div class="accordion-body">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">接受哪些付款方式?</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">我的付款被拒絕了?</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">如何申請退款?</a></li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Category 3 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingThree">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                <i class="bi bi-controller me-2 text-danger"></i> 訂單與配送
              </button>
            </h2>
            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#helpAccordion">
              <div class="accordion-body">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">我的訂單在哪?</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">如何兌換我的代碼?</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">訂單狀態說明</a></li>
                </ul>
              </div>
            </div>
          </div>

           <!-- Category 4 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingFour">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                <i class="bi bi-shield-check me-2 text-warning"></i> 安全與隱私
              </button>
            </h2>
            <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#helpAccordion">
              <div class="accordion-body">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">我的個人信息是否安全?</a></li>
                  <li class="list-group-item"><a href="#" class="text-decoration-none text-secondary">兩步驟驗證指南</a></li>
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
