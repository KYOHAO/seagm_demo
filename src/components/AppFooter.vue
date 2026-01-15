<script setup>
</script>

<template>
  <footer class="bg-light pt-5 pb-3 border-top mt-5">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-3 col-md-6">
          <h5 class="fw-bold mb-3 text-primary">
            <img src="/logo.png" alt="New York Game Warehouse" height="30" />
          </h5>
          <!--<p class="text-muted small">
            SEAGM is a global digital goods and services platform for gamers, game developers, and publishers.
          </p>-->
          <h5 class="fw-bold text-primary">
            紐約遊戲倉庫
          </h5>
          <div class="text-muted small">
            <div>服務時間：全年無休</div>
            <div>客服信箱：Service@NYgamedepot.com</div>
          </div>
          <div class="d-flex gap-3">
            <a href="#" class="text-secondary fs-5"><i class="bi bi-facebook"></i></a>
            <a href="#" class="text-secondary fs-5"><i class="bi bi-twitter"></i></a>
            <a href="#" class="text-secondary fs-5"><i class="bi bi-instagram"></i></a>
            <a href="#" class="text-secondary fs-5"><i class="bi bi-youtube"></i></a>
          </div>
        </div>
        <!--<div class="col-lg-2 col-md-6">
          <h6 class="fw-bold mb-3">關於 NEWYORK</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><a href="#" class="text-decoration-none text-secondary">關於我們</a></li>
            <li class="mb-2"><a href="#" class="text-decoration-none text-secondary">相關新聞</a></li>
            <li class="mb-2"><a href="#" class="text-decoration-none text-secondary">合作夥伴</a></li>
          </ul>
        </div>-->
        <div class="col-lg-2 col-md-6">
          <h6 class="fw-bold mb-3">會員支援</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><router-link to="/help?topic=register" class="text-decoration-none text-secondary">新手上路</router-link></li>
            <li class="mb-2"><router-link to="/help?topic=selling-guide" class="text-decoration-none text-secondary">交易政策</router-link></li>
            <li class="mb-2"><router-link to="/help?topic=about-us" class="text-decoration-none text-secondary">關於紐約</router-link></li>
          </ul>
        </div>
        <div class="col-lg-2 col-md-6">
          <h6 class="fw-bold mb-3">會員條款</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><router-link to="/help?topic=platform-rules" class="text-decoration-none text-secondary">管理規章</router-link></li>
            <li class="mb-2"><router-link to="/help?topic=privacy" class="text-decoration-none text-secondary">隱私政策</router-link></li>
            <li class="mb-2"><router-link to="/help?topic=user-terms" class="text-decoration-none text-secondary">使用條款</router-link></li>
          </ul>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="d-flex align-items-start gap-3">
             <img src="/rating_18_plus.png" alt="18+" width="50" height="50">
             <div>
                <p class="small text-muted mb-2">
                  本平台僅接受成年並具行為能力者使用，若為限制行為能力或無行為能力者，請勿註冊會員。
                </p>
                <p class="small text-muted mb-0">
                  遊戲僅供娛樂消遣，理性遊戲，勿過度沈迷。
                </p>
             </div>
          </div>
        </div>
      </div>
      <hr class="my-4">
      <div class="text-center text-muted small">
        Copyright&copy;2025 Bodhi System Engineering Co., Ltd. All Rights Reserved
      </div>
    </div>
  </footer>
</template>

<style scoped>
</style>
