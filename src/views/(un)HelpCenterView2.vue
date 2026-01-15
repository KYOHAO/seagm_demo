<script setup>
import { ref } from 'vue'

const helpCategories = [
  {
    title: '新手上路',
    icon: 'bi-emoji-smile',
    topics: [
      { 
        id: 'register', 
        title: '會員註冊', 
        sections: [
            { heading: '會員資格?', body: '只要您年滿18歲，並持有有效的手機門號，即可註冊成為我們的會員。' },
            { heading: '會員資料?', body: '註冊時需要填寫真實姓名、手機號碼與基本的個人資料，以確保帳戶安全與交易順利。' },
            { heading: '註冊流程', body: '點擊右上角「註冊」 → 輸入手機號碼驗證 → 設定密碼 → 填寫基本資料 → 完成註冊。' },
            { heading: '能註冊幾個帳號?', body: '每位使用者限註冊一個帳號。系統會綁定您的身分證字號與手機號碼，重複註冊將無法通過驗證。' },
            { heading: '能綁定幾個銀行帳號?', body: '每個會員帳號最多可綁定 1 個本人名下的銀行帳號，用於提領款項。' },
            { heading: '能綁定幾個遊戲帳號?', body: '目前我們支援綁定多個遊戲帳號，方便您進行不同遊戲的交易。具體數量限制請參考使用者條款。' }
        ] 
      },
      { 
        id: 'login', 
        title: '會員登入', 
        sections: [
            { heading: '登入會員時的驗證碼?', body: '為了確保您的帳號安全，系統在登入時可能會要求輸入圖形驗證碼。請依照圖片顯示的數字或英文字母輸入即可。若看不清楚，可點擊圖片重新整理。' },
            { heading: '密碼輸入正確，但無法登入?', body: '請確認您的輸入法是否為半形模式，並檢查是否誤按了 Caps Lock 鍵。若仍無法登入，建議您嘗試重置密碼或聯繫客服人員協助。' }
        ]
      }
    ]
  },
  {
    title: '交易相關',
    icon: 'bi-currency-exchange',
    topics: [
      { 
        id: 'selling-guide', 
        title: '掛賣須知', 
        sections: [
            { heading: '掛賣前需確認什麼?', body: '掛賣前請確保您的遊戲帳號資訊正確，且擁有足夠的遊戲幣或虛擬寶物。同時，請確認您已完成身分驗證與銀行帳戶綁定，以便順利收款。' },
            { heading: '掛賣單的操作流程是?', body: '進入「交易大廳」→ 點擊「掛賣」→ 選擇遊戲與伺服器 → 輸入數量與單價 → 確認掛單資訊 → 提交掛單。' },
            { heading: '一天有限制掛賣金額嗎?', body: '為了保障交易安全，我們依據不同的會員等級設有每日掛賣上限。詳細額度請至「會員中心」查看您的等級權限。' },
            { heading: '掛賣單有時間限制嗎?', body: '掛賣單通常有效期限為 24 小時至 72 小時（視遊戲而定）。若超時未成交，系統將自動下架，您可重新上架。' },
            { heading: '掛賣單成交後多久收到款項?', body: '交易完成後，款項將進入「圈存」狀態。經系統確認無誤後（通常為 15-30 分鐘），款項將自動轉入您的平台錢包，您可隨時申請提領。' }
        ]
      },
      { 
        id: 'buying-guide', 
        title: '掛買須知', 
        sections: [
            { heading: '掛買前需確認什麼?', body: '掛買前請確認您的平台錢包有足夠的餘額。若餘額不足，請先進行儲值。同時確認您欲購買的遊戲伺服器與物品名稱無誤。' },
            { heading: '掛買單的操作流程是?', body: '進入「交易大廳」→ 點擊「掛買」→ 選擇遊戲與伺服器 → 輸入欲收購的數量與單價 → 確認掛單資訊 → 提交掛單。' },
            { heading: '一天有限制掛買金額嗎?', body: '為了保障您的帳戶安全，系統依據會員等級設有每日掛買金額上限。若需提高額度，請聯繫客服進行身分驗證升級。' },
            { heading: '掛買單有時間限制嗎?', body: '掛買單的有效期限通常為 3 天（72 小時）。若在此期間內未成交，掛單將自動取消，款項將退回您的平台錢包。' },
            { heading: '掛買單後多久收到虛擬寶物?', body: '當有賣家出售符合您需求的物品時，系統會自動撮合交易。成交後，請留意遊戲內的收件箱或交易通知，通常在成交後 10-30 分鐘內完成移交。' }
        ]
      }
    ]
  },
  {
    title: '會員條款',
    icon: 'bi-file-earmark-text',
    topics: [
      { 
        id: 'platform-rules', 
        title: '平台管理規章', 
        sections: [
            { heading: '總則', body: '為維護本平台的交易秩序與安全，保障所有會員之權益，特制定本管理規章。所有會員在進行交易前，均應詳閱並遵守本規章。' },
            { heading: '帳號管理', body: '會員應妥善保管帳號與密碼，不得將帳號出借、轉讓或與他人共用。若因保管不致使帳號被盜用或產生損失，會員應自行負責。' },
            { heading: '交易規範', body: '嚴禁在平台內發佈虛假商品、詐騙訊息或進行洗錢等非法行為。所有交易必須在平台內完成，嚴禁引導至私下交易，違者將永久凍結帳號。' },
            { heading: '違規處理', body: '若會員違反本規章或中華民國相關法律，平台有權暫停或終止該會員之權限，並扣除其帳戶內之違規所得，情節嚴重者將依法追究。' }
        ]
      },
      { 
        id: 'user-terms', 
        title: '使用者條款', 
        sections: [
            { heading: '認知與接受條款', body: '當您完成註冊或開始使用本服務時，即表示您已閱讀、瞭解並同意接受本服務條款之所有內容。若您為未滿二十歲之未成年人，應經您的法定代理人閱讀、瞭解並同意本條款後，始得使用。' },
            { heading: '服務內容', body: '本平台提供虛擬寶物、遊戲幣及點數卡之撮合交易服務。平台僅提供交易媒合機制，不保證特定商品之價格或獲利。' },
            { heading: '免責聲明', body: '本平台不保證服務之穩定性、安全性、無誤或不中斷。對於因網路中斷、系統故障或其他不可抗力因素造成之損失，平台不負賠償責任。' },
            { heading: '條款變更', body: '平台保留隨時修改本條款之權利，修改後將於網站首頁公告，不另行個別通知。若您於公告後繼續使用本服務，視為您已同意修改後之條款。' }
        ]
      },
      { 
        id: 'privacy', 
        title: '隱私條款', 
        sections: [
            { heading: '個人資料蒐集', body: '為了提供您完善的交易服務，我們會蒐集您的姓名、電話、電子郵件、銀行帳戶及身分證字號等必要資訊。' },
            { heading: '資料使用目的', body: '蒐集之資料僅用於身分驗證、交易聯絡、款項撥付、發票開立及平台行銷活動通知，絕不會用於其他無關之用途。' },
            { heading: '資料保護與安全', body: '我們採用業界標準之加密技術（SSL）保護您的個人資料傳輸安全，並設有嚴格的內部控管機制，防止資料外洩。' },
            { heading: '第三方共用', body: '除司法機關依法調閱或為完成交易及金流服務必要（如金流公司）外，我們不會將您的個人資料提供給任何無關之第三人。' }
        ]
      }
    ]
  },
  {
    title: '會員問題',
    icon: 'bi-question-circle',
    topics: [
      { 
        id: 'modify-info', 
        title: '資料修改', 
        sections: [
            { heading: '會員資料可以修改的部分', body: '手機、E-Mail信箱、銀行帳號、遊戲帳號與會員密碼。' },
            { heading: '手機修改', body: '需拍實體帳單或門號申請書向客服申請，六個月僅可申請一次。\n\n新門號及舊門號所有者應為同一人，不接受非屬同一人之門號變更。\n新門號不得有綁定其他會員帳號。\n請附上舊門號證明文件。(電信帳單或退租證明)\n請附上新門號證明文件。(近三個月內任一期電信帳單或持有證明)' },
            { heading: 'E-mail修改', body: '六個月僅可申請一次。' },
            { heading: '銀行帳號修改', body: '需為本人銀行帳號，六個月僅可申請一次。' },
            { heading: '遊戲帳號修改', body: '需持遊戲官方所提供之帳號持有證明向客服申請修改。' },
            { heading: '會員密碼修改', body: '於會員後台頁面即可操作修改。' }
        ]
      },
      { 
        id: 'invoice', 
        title: '發票問題', 
        sections: [
            { heading: '發票收取方式', body: '將會發送電子發票至會員留存本平台之信箱地址，若會員未有留存信箱將會捐贈給社福機構。' },
            { heading: '發票開立時機', body: '會員訂單完成時，將依財政部核釋之規則開立發票。' }
        ]
      },
      { 
        id: 'tax', 
        title: '稅務問題', 
        sections: [
            { heading: '紐約遊戲倉庫是否會提供會員交易資料予稅捐機關?', body: '本平台嚴格保護會員隱私，但在符合法律規範及稅捐稽徵機關依法定程序（如公文調閱）要求下，本平台有義務配合提供相關交易資料以供核查。' },
            { heading: '網路買賣所涉稅務問題?', body: '依據財政部規定，個人以營利為目的，透過網路銷售貨物或勞務，若每月銷售額達起徵點（貨物8萬元、勞務4萬元），應向國稅局申請稅籍登記並報繳稅款。詳細稅務法規請諮詢專業會計師或各地國稅局。' }
        ]
      }
    ]
  },
  {
    title: '帳號安全',
    icon: 'bi-shield-lock',
    topics: [
      { 
        id: 'faq', 
        title: '常見問題', 
        sections: [
            { heading: '慎防釣魚網站', body: '請務必確認您瀏覽的網址為本平台官方網址。詐騙集團常利用相似網址或簡訊連結誘騙您輸入帳密。本平台官方絕不會透過簡訊或通訊軟體要求您提供密碼或驗證碼。' },
            { heading: '會員帳號如何保護?', body: '建議您設定高強度的密碼（混合大小寫字母、數字與符號），並定期更換。切勿將帳號密碼告知他人，或在公用電腦儲存您的登入資訊。' },
            { heading: '會員帳號怪怪的該如何處理?', body: '若您發現帳號有異常登入紀錄或未經授權的交易，請立即至會員中心修改密碼，並截圖相關異常畫面，儘速聯繫客服人員協助處理。' }
        ]
      },
      { 
        id: 'anti-fraud', 
        title: '防詐Q&A', 
        sections: [
            { heading: 'Q1: 接到自稱客服人員要求操作ATM或網銀解除分期付款?', body: '這是典型的詐騙手法！本平台絕不會以「誤設分期」、「重複扣款」或「升級會員」為由，要求您操作ATM、網銀或購買遊戲點數。若接到此類電話，請掛斷並撥打165反詐騙專線查證。' },
            { heading: 'Q2: 有人要求私下加LINE進行交易?', body: '請勿答應！私下交易缺乏平台保障，極易遇到詐騙（如：收錢不發貨、發送假貨）。所有對話與交易請務必在平台系統內進行，以確保您的權益。' },
            { heading: 'Q3: 賣家要求提供身分證件或銀行存摺照片?', body: '請小心！正常交易流程中，賣家無需索取您的個人證件。若對方執意要求，可能是為了盜用您的身分進行不法行為，請立即停止交易並向客服檢舉。' },
            { heading: 'Q4: 收到不明連結要求需登入驗證?', body: '請勿點擊！詐騙集團常製作與官方相似的假網站（釣魚網站）騙取您的帳密。請務必確認網址是否為本平台官方域名，並透過官方APP或書籤進入網站。' },
            { heading: 'Q5: 買家傳送匯款成功的截圖，但我帳戶沒收到錢?', body: '截圖可以造假！請務必以「您的銀行帳戶實際入帳」或「平台系統顯示款項已圈存」為準。切勿僅憑對方提供的截圖就移交商品，以免財物兩失。' }
        ]
      }
    ]
  },
  {
    title: '網站相關',
    icon: 'bi-globe',
    topics: [
      { 
        id: 'about-us', 
        title: '公司簡介', 
        sections: [
            { heading: '基本資料', body: '母 公 司：菩提科技系統工程股份有限公司\n設立日期：2025年 9 月' },
            { heading: '公司理念', body: '紐約遊戲倉庫管理人員、負責人皆曾經是小課長，對儲值打寶有經驗，鑑於詐騙猖獗，目前玩家交換寶物總是會害怕收到危險款項或是買到虛擬贓物，創立本平台意在給予玩家有安全、方便、快速的方式穿越虛擬遊戲世界與現實世界。\n\n會逐步挑選優質遊戲上架，希望跟會員們一起安心享受課金的樂趣。' }
        ]
      },
      { 
        id: 'cooperation', 
        title: '合作提案', 
        sections: [
            { heading: '聯絡我們', body: '若您對紐約遊戲倉庫有建議或是合作意願，請撰寫具體內容寄到客服信箱，管理人員會盡快回覆，感謝萬分\n\n信箱：Service@NYgamedepot.com' }
        ] 
      }
    ]
  }
]

const activeCategory = ref(helpCategories[0])
const activeTopic = ref(helpCategories[0].topics[0])

const selectTopic = (category, topic) => {
  activeCategory.value = category
  activeTopic.value = topic
  // On mobile, maybe scroll to top of content
  if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="container my-5">
    <!-- Header / Search -->
    <div class="text-center mb-5">
      <h1 class="fw-bold text-primary">幫助中心</h1>
      <p class="text-muted">我們可以幫到你什麼?</p>
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control border-start-0 ps-0" placeholder="搜尋幫助主題...">
            <button class="btn btn-primary" type="button">搜尋</button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Left Sidebar (Menu) -->
      <div class="col-lg-3 mb-4 mb-lg-0">
        <div class="accordion shadow-sm" id="helpAccordion">
          <div class="accordion-item" v-for="(category, index) in helpCategories" :key="index">
            <h2 class="accordion-header" :id="'heading' + index">
              <button 
                class="accordion-button" 
                :class="{ collapsed: activeCategory.title !== category.title }"
                type="button" 
                data-bs-toggle="collapse" 
                :data-bs-target="'#collapse' + index" 
                :aria-expanded="activeCategory.title === category.title" 
                :aria-controls="'collapse' + index"
              >
                <i :class="['bi', category.icon, 'me-2']"></i> {{ category.title }}
              </button>
            </h2>
            <div 
              :id="'collapse' + index" 
              class="accordion-collapse collapse" 
              :class="{ show: activeCategory.title === category.title }" 
              :aria-labelledby="'heading' + index" 
              data-bs-parent="#helpAccordion"
            >
              <div class="accordion-body p-0">
                <div class="list-group list-group-flush">
                  <a 
                    href="#" 
                    v-for="topic in category.topics" 
                    :key="topic.id" 
                    class="list-group-item list-group-item-action border-0 py-3 ps-4"
                    :class="{ 'active-topic': activeTopic.id === topic.id }"
                    @click.prevent="selectTopic(category, topic)"
                  >
                   {{ topic.title }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Content Area -->
      <div class="col-lg-9">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body p-4 p-lg-5">
            <nav aria-label="breadcrumb" class="mb-4">
              <ol class="breadcrumb">
                <li class="breadcrumb-item text-muted">{{ activeCategory.title }}</li>
                <li class="breadcrumb-item active fw-bold" aria-current="page">{{ activeTopic.title }}</li>
              </ol>
            </nav>

            <h2 class="fw-bold mb-4 text-primary">{{ activeTopic.title }}</h2>
            
            <div class="content-placeholder">
              <div v-if="activeTopic.sections">
                <div v-for="(section, idx) in activeTopic.sections" :key="idx" class="mb-4">
                  <h4 class="fw-bold text-secondary mb-2">{{ section.heading }}</h4>
                  <p class="text-muted" style="white-space: pre-line">{{ section.body }}</p>
                </div>
              </div>
              <p v-else class="lead">{{ activeTopic.content }}</p>
              
              <!--<hr class="my-4">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <div class="alert alert-light border mt-4">
                <h5 class="alert-heading"><i class="bi bi-info-circle me-2"></i>需要更多協助?</h5>
                <p class="mb-0">如果您找不到需要的答案，請隨時<a href="#" class="alert-link">聯繫客服</a>。</p>
              </div>-->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion-button:not(.collapsed) {
  background-color: #f8f9fa;
  color: #0d6efd;
  font-weight: bold;
}
.accordion-button:focus {
    box-shadow: none;
    border-color: rgba(0,0,0,.125);
}
.accordion-item {
    border: none;
    border-bottom: 1px solid rgba(0,0,0,.125);
}
.accordion-item:last-child {
    border-bottom: none;
}
.active-topic {
  background-color: #e7f1ff;
  color: #0d6efd;
  font-weight: bold;
  border-left: 3px solid #0d6efd !important;
}
.list-group-item-action:hover {
    background-color: #f8f9fa;
    color: #0d6efd;
}
</style>
