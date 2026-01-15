<script setup>
import { ref, onMounted } from 'vue'

const helpCategories = [
  {
    title: '新手上路',
    icon: 'bi-emoji-smile',
    topics: [
      { 
        id: 'register', 
        title: '會員註冊', 
        sections: [
            { heading: '會員資格?', body: '具中華民國國籍、年滿18歲並行為認知能力無異常者。' },
            { heading: '會員資料?', body: `準備會員本人身分證、手機與本人銀行帳號封面。
會員驗證銀行限參加金融XML協定之金融機構：
<div class="table-responsive mt-2">
  <table class="table table-bordered table-sm small">
    <thead>
      <tr class="table-light">
        <th>代號</th>
        <th>金融機構名稱</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>004</td><td>臺灣銀行</td></tr>
      <tr><td>005</td><td>臺灣土地銀行</td></tr>
      <tr><td>006</td><td>合作金庫商業銀行</td></tr>
      <tr><td>007</td><td>第一商業銀行</td></tr>
      <tr><td>008</td><td>華南商業銀行</td></tr>
      <tr><td>009</td><td>彰化商業銀行</td></tr>
      <tr><td>011</td><td>上海商業儲蓄銀行</td></tr>
      <tr><td>012</td><td>台北富邦商業銀行</td></tr>
      <tr><td>013</td><td>國泰世華商業銀行</td></tr>
      <tr><td>016</td><td>高雄銀行</td></tr>
      <tr><td>017</td><td>兆豐國際商業銀行</td></tr>
      <tr><td>018</td><td>全國農業金庫</td></tr>
      <tr><td>021</td><td>花旗(台灣)商業銀行</td></tr>
      <tr><td>048</td><td>王道商業銀行</td></tr>
      <tr><td>050</td><td>臺灣中小企業銀行</td></tr>
      <tr><td>052</td><td>渣打國際商業銀行</td></tr>
      <tr><td>053</td><td>台中商業銀行</td></tr>
      <tr><td>054</td><td>京城銀行</td></tr>
      <tr><td>081</td><td>匯豐（台灣）商業銀行</td></tr>
      <tr><td>101</td><td>瑞興商業銀行</td></tr>
      <tr><td>102</td><td>華泰商業銀行</td></tr>
      <tr><td>103</td><td>臺灣新光商業銀行</td></tr>
      <tr><td>108	</td><td>陽信商業銀行</td></tr>
      <tr><td>118</td><td>板信商業銀行</td></tr>
      <tr><td>147</td><td>三信商業銀行</td></tr>
      <tr><td>216</td><td>花蓮第二信用合作社</td></tr>
      <tr><td>600</td><td>農金資訊股份有限公司</td></tr>
      <tr><td>700</td><td>中華郵政股份有限公司</td></tr>
      <tr><td>803</td><td>聯邦商業銀行</td></tr>
      <tr><td>805</td><td>遠東國際商業銀行</td></tr>
      <tr><td>806</td><td>元大商業銀行</td></tr>
      <tr><td>807</td><td>永豐商業銀行</td></tr>
      <tr><td>808</td><td>玉山商業銀行</td></tr>
      <tr><td>809</td><td>凱基商業銀行</td></tr>
      <tr><td>810</td><td>星展(台灣)商業銀行</td></tr>
      <tr><td>812</td><td>台新國際商業銀行</td></tr>
      <tr><td>816</td><td>安泰商業銀行</td></tr>
      <tr><td>822</td><td>中國信託商業銀行</td></tr>
      <tr><td>823</td><td>將來商業銀行</td></tr>
      <tr><td>824</td><td>連線商業銀行</td></tr>
      <tr><td>952</td><td>財團法人農漁會南區資訊中心</td></tr>
    </tbody>
  </table>
</div>` },
            { heading: '註冊流程', body: '點選首頁由上角『註冊』後，完成所有流程。\n請特別注意，完成身份驗證才可開啟買賣功能能。' },
            { heading: '能註冊幾個帳號?', body: '每位自然人僅能註冊一個會員帳號，暫不接受法人註冊會員。' },
            { heading: '能綁定幾個銀行帳號?', body: '會員僅能綁定一個本人銀行帳號。' },
            { heading: '能綁定幾個遊戲帳號?', body: '會員於每個遊戲僅能綁定一個遊戲帳號。' }
        ] 
      },
      { 
        id: 'login', 
        title: '會員登入', 
        sections: [
            { heading: '登入會員時的驗證碼?', body: '為保護會員帳號安全，防止有心人士以暴力破解方式入侵會員帳號。' },
            { heading: '密碼輸入正確，但無法登入?', body: '1.需請會員注意英文字母大小些是否正確。\n2.若密碼確定正確，會員極有可能觸犯平台管理規章或使用者條款遭到停權，請與客服聯繫查詢原因。' }
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
            { heading: '掛賣前需確認什麼?', body: '預掛賣之會員需確認綁定於本平台之遊戲帳號金幣數量，若多次下賣單後未能轉幣完成完整掛單動作，可能會被視為惡意用戶，停止下單或帳號使用權限。' },
            { heading: '掛賣單的操作流程是?', body: '1.請確認已完成會員註冊、KYC驗證、銀行帳號驗證、遊戲帳號綁定。\n2.點擊欲出售金幣之遊戲，選擇賣單。\n3.填妥欲售金幣數量、遊戲帳號、銀行帳號。\n4.點選提交訂單並完成轉幣予本平台，恭喜已完成掛賣單。' },
            { heading: '一天有限制掛賣金額嗎?', body: '沒有限制掛賣金額，但當日掛賣金額累計超過50萬元將依洗錢防制法做大額通貨通報。' },
            { heading: '掛賣單有時間限制嗎?', body: '全天24小時皆可以掛單。' },
            { heading: '掛賣單成交後多久收到款項?', body: '除遇特殊狀況，最快5分鐘內，最久不超過兩小時。\n但要注意，當天到款的最晚掛單時間是22:30，在22:30後之掛單，若未於當天最後出款時間23:15前媒合訂單，將於隔日08:30後開始出款。' }
        ]
      },
      { 
        id: 'buying-guide', 
        title: '掛買須知', 
        sections: [
            { heading: '掛買前需確認什麼?', body: '會員需確認下單金額是自身可以負擔的，若多次下單未匯款完成完整掛單動作，可能會被視為惡意用戶，停止下單或帳號使用權限。' },
            { heading: '掛買單的操作流程是?', body: '1.請確認已完成會員註冊、KYC驗證、銀行帳號驗證、遊戲帳號綁定。\n2.點擊欲購入金幣之遊戲，選擇買單。\n3.填妥欲購金幣數量、遊戲帳號、銀行帳號。\n4.點選提交訂單並完成付款，恭喜已完成掛買單。' },
            { heading: '一天有限制掛買金額嗎?', body: '沒有限制掛買金額，但當日掛買金額累計超過50萬元將依洗錢防制法做大額通貨通報。' },
            { heading: '掛買單有時間限制嗎?', body: '全天24小時皆可以掛單。' },
            { heading: '掛買單後多久收到虛擬寶物?', body: '除遇特殊狀況，最快2分鐘內，最久不超過12分鐘。' }
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
            { heading: '紐約遊戲倉庫是否會提供會員交易資料予稅捐機關?', body: '紐約遊戲倉庫基於保護會員隱私，不會主動提交會員交易紀律予公家或私人機構(關)，惟公家機關不可抗拒。' },
            { heading: '網路買賣所涉稅務問題?', body: `資料引用：財政部

一、財政部為何要發布「網路交易課徵營業稅及所得稅規範」，對從事網路交易者課徵稅捐？
答：「網路交易」（即電子商務）是一種新興的銷售（交易）型態，也可以說是一種在實體通路外新增的銷售通路，或許有它不同的附加價值，但是目前經濟合作暨開發組織（OECD）、歐盟及美國等對於此種交易行為，都是採取維持與實體通路相同課稅規定之原則，我國的「網路交易課徵營業稅及所得稅規範」亦依循本項原則所訂定。所以，對於網路交易行為課徵稅負除了是基於維護租稅公平考量外，也是未來不可避免的趨勢。

二、何種網路交易行為需要課徵營業稅？
答：依據現行加值型及非加值型營業稅法（以下簡稱營業稅法）第1條規定，在我國境內銷售貨物或勞務，均應依法課徵營業稅。同法第6條第1款規定，以營利為目的之公營、私營或公私合營之事業為營業人。因此，網路賣家如以營利為目的、採進、銷貨方式經營，透過網路銷售貨物或勞務者，基於租稅公平考量，稽徵機關應依法對其課徵營業稅。

三、財政部發布之「網路交易課徵營業稅及所得稅規範」對從事網路拍賣業者課徵營業稅是否公平？
答：財政部於94年5月5日發布「網路交易課徵營業稅及所得稅規範」的內容都是建構在現行租稅法律規範架構下，主要是為了維持營業人透過實體通路銷售行為與透過網路銷售行為間的租稅衡平，並未有創設或增加任何人民租稅負擔的情形。就營業稅而言，如甲營業人開設實體商店銷售A商品，均已依法報繳稅捐，而乙營業人透過網路銷售相同商品即可不必課稅，則勢必造成對甲營業人的不公平現象。所以，財政部主要就是為了維護租稅公平性及中立性才發布該項規範。

四、個人透過拍賣網站出售自己使用過後的二手商品，或買來尚未使用就因為不適用而透過拍賣網站出售，或他人贈送的物品，自己認為不實用透過拍賣網站出售，是否也需要課稅？
答：基於租稅公平性考量，財政部規定以營利為目的、採進、銷貨方式經營，透過網路銷售貨物或勞務者，必須依法課稅。所以，如果網路賣家是透過拍賣網站出售自己使用過後的二手商品，或買來尚未使用就因為不適用而透過拍賣網站出售，或他人贈送的物品，自己認為不實用透過拍賣網站出售，均不屬於上面所述必須課稅的範圍。

五、如果網路賣家是專門經由其他管道收購二手商品，再透過網路銷售，賺取利潤，也要課徵營業稅嗎？
答：財政部規定以營利為目的、採進、銷貨方式經營，透過網路銷售貨物或勞務者，必須依法課徵營業稅，所以如果網路賣家所銷售的二手商品，是透過各種管道收購而來，利用賺取差價作為利潤者，就符合上面的課稅構成要件，也就是說這種行為必須課稅。

六、如果是以營利為目的、採進、銷貨方式經營，透過網路銷售貨物或勞務的網路賣家，是否都應該要辦理稅籍登記？
答：符合「以營利為目的、採進、銷貨方式經營，透過網路銷售貨物或勞務」要件的網路賣家，並非一定要辦理稅籍登記。因為依據財政部的規定，為了維持租稅公平性，網路賣家的課稅標準必須比照實體商店（小規模營業人），依據現行一般營業人課稅標準，每月銷售額如果未達起徵點【自114年1月1日起貨物新臺幣(下同)10萬元、勞務5萬元】，是不須課徵營業稅的，而網路賣家的銷售額是透過網路交易而來，交易資料明確，所以，如果網路賣家每個月在網站銷售額未達到起徵點，暫時可以免向國稅局辦理稅籍登記，但是一旦當月的銷售額超過起徵點，就必須立即向國稅局辦理稅籍登記並報繳稅款，以免因被檢舉或被查獲而必須被處罰。

七、如果從事網路銷售且已符合應辦理稅籍登記標準者，在向國稅局辦理稅籍登記時，應該要檢附及填寫那些資料？
答：
1.網路賣家如果是以營利為目的、採進、銷貨方式經營，透過網路銷售貨物或勞務者，於當月銷售額已達起徵點（自114年1月1日起貨物10萬元、勞務5萬元）時，應檢附該網路賣家的國民身分證及印章，由納稅義務人（網路賣家）自行選擇向住（居）所或戶籍所在地的財政部各地區國稅局所屬分局、稽徵所、服務處辦理。
2.辦理時，請填寫「營業人設立（變更）登記申請書」。
3.營業人名稱欄，請填寫該網路賣家的個人姓名或商號名稱（許多網路賣家在網路上已設有商號名稱者，可自行選擇填寫商號名稱，但填寫商號名稱者必須檢附營利事業印章，也就是所謂的「大章」）。
4.專營網路銷售且沒有實體營業地址的網路賣家，稅籍登記地址欄請填寫網路賣家所選擇的住（居）所或戶籍地（無須檢附房屋稅稅單或租賃契約影本等）。此欄位是為了送達稅單使用，請務必填寫正確資料，避免屆時因為稅單未繳納，造成欠稅問題。另外，可免填列「稅籍登記地址房屋稅籍編號」欄，國稅局並不會因為網路賣家將其戶籍地或住（居）所登記在「稅籍登記地址」欄，就認定該址有營業行為。
5.營業項目欄，依據實際經營項目可選擇採「列載登記」或「列載及概括方式登記」填列外，請加填「經營網路購物」，並於「網路銷售業者應登記資料」欄位，確實載明「網域名稱及網路位址」及「會員帳號」，若網路賣家有數個銷售網站網址或會員帳號，必須全數填列，但是務必不要填列個人密碼，因為此部分資料涉及個人隱私而且與課稅無關，所以網路賣家不必要將個人網路密碼告訴國稅局人員。

八、國稅局對於從事網路銷售的營業人，是如何核定銷售額及稅額？
答：
1. 網路賣家的銷售額是透過網路交易而來，交易資料明確，因此，從事網路銷售的營業人必須提供網路交易明細資料，供國稅局核定該賣家的銷售額。原則上不必提供存摺資料，但是當徵納雙方對於銷售額的認定有爭議時，必要時，國稅局為了查證需要，可能會要求網路賣家提供。
2. 至於稅額部分，稽徵機關目前是依據營業稅法規定對具營利性質之網路交易行為課稅，所以與實體商店維持相同課稅標準。現行銷售貨物的實體商店課稅標準如下：
(1) 每月銷售額在起徵點以下（自114年1月1日起貨物10萬元、勞務5萬元）者，無須課徵營業稅。
(2) 每月銷售額超過起徵點但未達20萬元者，按銷售額依稅率1%，由國稅局按季（每年1、4、7、10月的月底前發單）開徵。
(3) 每月銷售額超過20萬元，或依其營業性質、業別或規模經國稅局認定具使用統一發票能力者，國稅局將核定其使用統一發票，稅率為5%，但相關進項稅額可提出扣抵，且此類營業人必須每2個月向國稅局申報一次銷售額並自行繳納營業稅額。

九、如果買家棄標或結標後買方討價還價以致降價出售，如何處理這部分銷售額？
答：如果在網路上拍賣的商品結標後買方棄標，或者因為買方討價還價而降價出售時，網路賣家必須對此部分資料舉證，例如網頁上的評價資料、拍賣網站出具證明或匯款資料等均可，基於覈實課稅原則，只要營業人能提出證明，國稅局會扣除此部分銷售額。

十、如果網路賣家當期銷售額與上期不同時，可否要求調整？
答：網路交易具有具體交易資料，國稅局應該要依據具體交易資料課稅，因此，如果網路賣家的銷售額與上期不同時，是可以要求國稅局調整，但是如果在稅單核發後才提出，就必須依循更正程序辦理。

十一、部分網路賣家反映他們銷售的貨物價格遠較實體商店為低，因此利潤較少，政府對於網路交易營業人與實體商店維持相同課稅標準，是否公平？
答：財政部僅將以營利為目的之網路交易業者納入課稅範圍，主要就是考量如果此部分不課稅，對於銷售相同商品的實體商店會形成稅負上的不公平。況且，我國營業稅是對於銷售貨物或勞務行為課稅，尚不問其銷售通路為何，因此，對於實體通路業者及網路交易業者採取相同課稅標準，是符合租稅公平原則的。

十二、對於從事網路拍賣交易的賣家，財政部可否規定由拍賣網站業者代徵一定稅率的營業稅？
答：
1. 依據營業稅法第2條第1款規定，銷售貨物或勞務的營業人為納稅義務人，也就是說從事網路拍賣的營業人在銷售貨物或勞務時，是營業稅法規定的納稅義務人，如果由拍賣網站業者（如Yahoo!拍賣或露天拍賣等）代扣稅款，因為現行營業稅法並無代扣稅款規定，於法不合。
2. 財政部目前僅將以營利為目的之網路賣家納入課稅範圍，如果規定由拍賣網站業者代扣稅款，對於僅是為出售（清）自己或家人多餘日常用品的網路拍賣賣家而言，因為拍賣網站無法區分其拍賣貨物的目的，以致於必須被代扣稅款，將造成另一種不公平現象。

十三、網路交易買受人向國外網站的網路賣家購買貨物，為何海關在貨物進口時要對其課徵進口貨物的營業稅？國外賣家是否需要被我國課稅？
答：
1. 我國營業稅是採消費地課稅原則，依據營業稅法第1條規定，進口貨物應依法課徵營業稅，同法第41條亦規定，進口貨物應由海關代徵營業稅，所以當網路交易買受人向國外網站的網路賣家購買貨物，在該項貨物進口時，將由海關依法代徵營業稅。
2. 至於國外網站的網路賣家，依據目前消費稅課稅原則及我國營業稅法第4條規定，因為貨物起運地並不是在我國境內，所以我國並沒有對該外國網路賣家課稅的權力，應該由該國外網路賣家所在地的政府對該銷售行為主張課稅。

十四、境內買家在境外購物網站消費購物，是否需要課徵營業稅？如果需要課徵營業稅，營業稅的納稅義務人為何人？另外因為境外購物網站的興起，衍生「代購代付」平臺業者替境內買家代買商品並代付貨款，該代購代付業者是否也需課徵營業稅？
答：
1.境內買家向境外購物網站購物，貨物以空運快遞或進口郵包等方式運送至境內，就屬於進口貨物的範疇，基於加速通關及簡化行政作業，現行稅法規定允許關稅完稅價格在2,000元以下者，免徵營業稅。但是如果進口貨物關稅完稅價格超過2,000元，就必須課徵營業稅。
2.如果境外購物網站的網路賣家在中華民國境內沒有固定營業場所，該賣家透過網路銷售貨物給境內買家，屬於進口貨物，依稅法規定進口貨物的收貨人或持有人（境內買家）就是營業稅法規定的納稅義務人，應納營業稅由海關代徵。
3.因應境外高人氣購物網站興起而衍生的「代購代付」平臺業者，主要是接受境內買家委託，向境外購物網站購買並進口貨物，該代購代付平臺業者提供代購商品及代付貨款服務，將代購貨物送交委託人時，除按佣金收入開立統一發票外，應依代購貨物之實際價格開立統一發票，並註明「代購」字樣，交付委託人；所開立之統一發票應依規定報繳營業稅。

十五、網路購物盛行，店家在團購網站以極優惠的價格，限量推出特定商品或服務，吸引消費者下單購買，是否需要課徵營業稅？
答：
1. 消費者為獲取優惠的價格折扣，常透過團購網揪團購買商品，並以團購網交易平臺業者提供的團購憑證向店家預約取貨或訂位，因此，店家是透過團購網平臺銷售貨物或勞務，屬營業行為，依法必須辦理稅籍登記及課徵營業稅。
2. 如果該店家的銷售行為全部在網路上完成，每月銷售貨物的銷售額未達起徵點（自114年1月1日起貨物10萬元、勞務5萬元），可以暫時免向國稅局辦理稅籍登記，免徵營業稅，但應該記得要就經營網路交易的年度營利所得，併計個人年度綜合所得總額，辦理結算申報。一旦當月銷售額超過前揭標準，應立即向國稅局辦理稅籍登記。
3. 如果該店家是部分網路銷售，部分於實體店面銷售，則應該依據一般營業人辦理稅籍登記規定，在開始營業前向國稅局辦理稅籍登記及課徵營業稅。

十六、網路新興商業模式，幫買家找商品，幫賣家找買家，以第三方角色連結消費者與賣家的導購網站，該導購網站業者是否需課徵營業稅？
答：購物網站的規模愈大，商品愈多，消費者不易找到自己想要的商品，新興行業「導購網站」即因應而生。導購網站本身並不提供商品販售，而是將有意購買的消費者引導至賣方網站，並提供比價機制，目的就是要促成交易，如有成交，導購網站業者再向賣家收取手續費（服務費）。該導購網站業者媒介買家與賣家間的交易行為，並收取代價，是屬於營業行為，應依法辦理稅籍登記及課徵營業稅。

十七、境內買家向境外網站購買電子勞務，是否需要課徵營業稅？如果需要課徵營業稅，營業稅的納稅義務人為何人？
答：境外網站在中華民國境內沒有固定營業場所，銷售電子勞務予境內買家，課徵營業稅情形，依境內買家為營業人或自然人而有不同，分述如下：
一、境內買家為營業人：
(一)屬查定計算營業稅額之營業人於給付報酬的次期開始15日內，自行至財政部稅務入口網 （www.etax.nat.gov.tw）線上列印購買國外勞務營業稅繳款書（408繳款書）或向國稅局索取前揭營業稅繳款書，自行繳納營業稅款。
(二)屬營業稅法第4章第1節規定計算稅額之營業人依營業稅法第36條規定，購買之電子勞務如專供經營應稅貨物或勞務使用，免予繳納營業稅；但如該營業人為兼營營業稅法第8條第1項規定免稅貨物或勞務者 ，則應於申報該期之營業人銷售額與稅額申報書(403)時，自行填入購買國外勞務欄項，依比例計算報繳營業稅，不必另外以408繳款書繳納。
二、境內買家為境內自然人：
依營業稅法第2條之1及第6條規定，該境外網站業者雖於境內無固定營業場所，但仍為我國營業稅法規定之營業人及營業稅之納稅義務人，如其銷售電子勞務予境內自然人之年銷售額逾新臺幣48萬元者，應於我國辦理稅籍登記，並報繳營業稅，境內自然人免予繳納。` }
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
            { heading: '慎防釣魚網站', body: `「釣魚網站」（Phishing Website）是一種網路詐騙手段，詐騙者會偽裝成你信任的機構（如銀行、社群媒體、政府機關或電商平台），誘騙你輸入敏感資訊。
簡單來說，它就像是一個精心佈置的陷阱，目的是偷走你的「鑰匙」（帳號密碼）或「錢包」（信用卡資訊）。

釣魚攻擊通常遵循以下三個步驟：
1.誘餌（The Bait）：你會收到一封電子郵件、簡訊（SMS）或社群訊息，內容通常帶有迫切性。例如：「您的帳戶異常，請立即登入驗證」、「您有一筆訂單未繳」或「恭喜獲得限量獎項」。
2.偽裝（The Disguise）： 訊息中通常會附上連結，點擊後，會進入一個外觀與正版網站（如 Facebook、Google、玉山銀行等）幾乎一樣的假網頁。
3.收割（The Catch）：當你在假網頁輸入帳號、密碼、身分證字號或信用卡號時，這些資料會直接傳送到詐騙者的後台。

如何辨識釣魚網站？
詐騙技術日新月異，但通常仍可從以下細節抓到破綻：
1. 網址（URL）不正確： 這是最準確的判斷方式，詐騙者會使用非常相似的網址，例如把 google.com 變成 googIe.com（用大寫 I 代替小寫 l），或是 shopee.tw 變成 shopee-secure.top。
2. 過度的迫切感：訊息常包含「帳戶將在 24 小時內停用」、「立即領取否則失效」等字眼，讓你因為緊張而失去判斷力。
3. 不尋常的要求：銀行通常不會透過簡訊要求你點擊連結並輸入完整的密碼或轉帳資訊。
4. 拼寫與語法錯誤：許多釣魚郵件是透過翻譯軟體生成的，語句可能顯得生硬或夾雜簡體字。

如果不小心點了，該怎麼辦？
如果你懷疑自己剛才在釣魚網站輸入了資料，請立即採取以下行動：
1. 更改密碼：立即前往「真正的」官方網站更改密碼。如果你在其他地方也使用了相同密碼，請一併更改。
2. 開啟雙重驗證（2FA）：即使駭客有了密碼，沒有手機驗證碼也無法登入。
3. 聯絡銀行：如果輸入了信用卡資訊，請立刻打給銀行掛失、止付。
4. 檢查帳戶活動：查看是否有不明的登入紀錄或交易。` },
            { heading: '會員帳號如何保護?', body: `保障會員帳號安全是維護數位生活最重要的一環，除了防範前面提到的「釣魚網站」，建立一套多層次的防禦體系，能有效降低帳號被盜用的風險。

以下是保護帳號安全的關鍵核心：

1. 密碼管理策略
避免「連鎖反應」：許多人為了方便，所有網站都用同一組密碼，這會導致「撞庫攻擊」，只要一個小網站個資外洩，你所有的帳號（臉書、銀行、Email）都會一起淪陷。
不重複使用：確保重要帳號（Email、金融、社群）的密碼各自獨立。
長度大於複雜度：一串長且隨機的句子（如 IloveCoffee2026!）通常比短而複雜的符號更難破解。
使用密碼管理員：如 iCloud 鑰匙圈、1Password 或 Bitwarden，幫你記住並產生強密碼。

2. 養成定期「體檢」帳號的習慣
登入活動紀錄：在設定中查看「目前登入的裝置」，若發現來自不明地區（如異國 IP）或裝置，請立即登出該裝置並改密碼。
警報通知：開啟「不明登入嘗試通知」，第一時間掌握帳號狀況。

3. 保持軟體更新
駭客常利用系統漏洞（Exploit）繞過密碼。保持手機系統（iOS/Android）與瀏覽器（Chrome/Safari）在最新版本，能修補這些安全性漏洞。` },
            { heading: '會員帳號怪怪的該如何處理?', body: '紐約遊戲倉庫有領先業界之人臉辨識保護，不肖人士無法進行下單，建議馬上變更密碼，若密碼已被變更，可以檢附身分證資料給予客服做暫停帳號與更改密碼支申請。' }
        ]
      },
      { 
        id: 'anti-fraud', 
        title: '防詐Q&A', 
        sections: [
            { heading: '重要防詐提醒', body: '提醒會員！官方人員絕不會使用LINE、FB、簡訊等通訊軟體，要求會員提供帳號、密碼與驗證碼等資訊，亦不會以各種驗證或停權名義逼迫玩家提供簡訊驗證碼。    若遇假冒本平台客服人員之遊戲帳號，請勿相信對方任何說詞並向官方檢舉；也請勿接收來路不明之遊戲金幣、虛擬寶物等，避免間接涉及詐騙行為。' },
            { heading: 'Q01. 有沒見過面的人引導我去下載【遠端存取程式】，可以下載嗎？', body: '此類程式讓他人可以通過異地設備從遠端連接、存取與操作會員設備，有導致會員帳號遭盜用，或設備內其它資料遭竊取之可能，會員需審慎評估，切勿輕信不熟悉之網友，以確保會員個人權益不至損害。' },
            { heading: 'Ｑ02. 有人說願意付款跟我借會員帳號，可以相信嗎？', body: '紐約遊戲倉庫(本平台)嚴格禁止會員將帳號提供予他人使用，除會員帳號會遭停權外，更可能受他人牽連法律事件，切勿相信類似訊息。' },
            { heading: 'Q03. 有人說下載一個程式以後下單買遊戲幣不用付款，可以相信嗎？', body: '本平台禁止會員以非官方提供之程式進行交易，本平台系統會隨時偵測外掛程式，\n經系統偵測發現使用非法程式者，會員帳號一律永久停權處分，並將追究相關刑責及民事賠償，請勿相信此類訊息。' },
            { heading: 'Q04. 在遊戲中遇見自稱紐約遊戲倉庫(本平台)客服，告知說先把遊戲幣轉給他可以賣較好的價格，可以相信嗎？', body: '本平台不論買或賣之交易皆須先在網站上取訂單，亦會於網站上提供官方在遊戲內之帳號，故切勿相信此類說法，避免有心人士蓄意詐騙。' },
            { heading: 'Q05. 在遊戲中有玩家告知『系統偵測到您疑似遭其他玩家詐騙』要求提供帳號密碼？', body: '星城官方人員是不會在遊戲中以密語的方式主動要求玩家提供帳號及密碼，且遊戲內的『客服』功能，才是官方的線上客服系統，敬請玩家妥善保管您的個人資料如：身分證號、遊戲帳號，手機門號密碼， 切勿以任何方式透漏給其他人，以確保您的權益。' },
            { heading: 'Q06. 有玩家在遊戲中密語說是線上客服，恭喜中獎，要求提供帳號密碼核對身分？', body: '紐約遊戲倉庫(本平台)官方人員是不會在各遊戲中以密語的方式主動要求會員提供帳號及密碼，敬請會員妥善保管個人資料，切勿以任何方式透漏給其他人，以確保會員之權益。' },
            { heading: 'Ｑ07. 遊戲中有玩家說要提供遊戲點數或遊戲幣，要求撥打手機或留下聯絡資訊，是真實的嗎？', body: '不法人士假藉提供遊戲點數或遊戲幣，但須先交出手機號碼及申請人之資料，接著將手機收到之「驗證碼」告訴對方，會員當收到簡訊扣費通知時，才知道手機及個人資料部份被利用於購買遊戲點數。   會員應培養正確遊戲觀念及習慣，秉持「不輕信網路之免費遊戲點數及免費遊戲幣」、「不輕易告知個人資料」才不會因此受害。' },
            { heading: 'Q08. 有玩家說要買遊戲帳號是什麼意思呢？能相信嗎？', body: '各遊戲公司皆有各自之規範，大多數遊戲公司建議不要做買賣帳號之行為，若會員之遊戲帳號有更動，請將新遊戲帳號相關證明文件交予客服信箱Service@NYgamedepot.com 做更新，會員未至本平台更新遊戲帳號，導致本平台轉幣失敗或是轉到會員舊有之遊戲帳號時，所有損失由會員自行負擔，本平台無涉相關責任。' },
            { heading: 'Ｑ09. 如果遭騙帳號，對方也登入帳號要怎麼處理？', body: '若會員疑似帳號被盜並被登入，請盡速修改登入密碼，並直接登入帳號將盜用者踢出，並查詢交易歷程判斷是否會有後續影響。' },
            { heading: 'Ｑ10. 如果遇到詐騙或遭騙帳號要怎麼處理呢？', body: '如疑似遇到詐騙，此屬網路刑事案件，須由檢警來協助您進行處理。 \n北部：\u2028刑事局電腦犯罪調查科：（02）2370-0693\u2028台北市刑警大隊：（02）2381-7263\u2028台北市警察局網路犯罪組：（02）2343-3980\u2028警政署刑事警察局-偵九隊：（02）2764-4490、（02）2764-4434\u2028中部：\u2028台中市警察總局：（04）2327-3953、（04）2328-9100轉2032\u2028南部：\u2028高雄市警察總局：（07）212-0800\u2028(以上單位資訊若有誤，以單位網站公布之資訊為主)' }
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

// Search Logic
import { computed } from 'vue'

const searchQuery = ref('')

const filteredCategories = computed(() => {
  if (!searchQuery.value) return helpCategories

  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return helpCategories

  return helpCategories.map(category => {
    // Check if category title matches
    const categoryMatches = category.title.toLowerCase().includes(query)
    
    // Filter topics
    const matchedTopics = category.topics.filter(topic => {
      const topicTitleMatches = topic.title.toLowerCase().includes(query)
      const sectionsMatch = topic.sections && topic.sections.some(section => 
        section.heading.toLowerCase().includes(query) || 
        section.body.toLowerCase().includes(query)
      )
      return topicTitleMatches || sectionsMatch
    })

    // If category title matches, show all topics. Otherwise show only matched topics.
    // Actually, usually search should narrow down. If I search "login", matching "Member Login" category is good, 
    // but maybe we still want to filter topics? 
    // Let's stick to: If category matches, show all. If not, show only matched topics.
    // But if category matches "Member", almost everything matches. 
    // Let's refine: Just return matched topics, unless the category match is strong? 
    // Let's use the logic: Category matching implies relevance, but specific topic matching is better.
    // To match the user expectation of finding answers:
    // If category title matches, it's safer to include all topics so they don't lose context?
    // Let's go with: Include category if it or its topics match. 
    // Topics: include if topic matches OR section matches OR parent category matches.
    
    if (categoryMatches) {
        return category // Return original category with all topics
    }

    if (matchedTopics.length > 0) {
      return { ...category, topics: matchedTopics }
    }

    return null
  }).filter(Boolean)
})

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

// Handle query params
import { useRoute } from 'vue-router'
import { watch } from 'vue'
const route = useRoute()

const handleQueryParam = () => {
    if (route.query.topic) {
        // Find the category and topic
        for (const category of helpCategories) {
            const foundTopic = category.topics.find(t => t.id === route.query.topic)
            if (foundTopic) {
                activeCategory.value = category
                activeTopic.value = foundTopic
                
                // Also scroll to top on mobile or desktop to show content
                 if (window.innerWidth < 768) {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                } else {
                    // Optional: Scroll to top of page if needed, or just let it stay
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }
                break
            }
        }
    }
}

onMounted(() => {
    handleQueryParam()
})

watch(() => route.query.topic, () => {
    handleQueryParam()
})
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
            <input type="text" class="form-control border-start-0 ps-0" placeholder="搜尋幫助主題..." v-model="searchQuery">
            <button class="btn btn-primary" type="button">搜尋</button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Left Sidebar (Menu) -->
      <div class="col-lg-3 mb-4 mb-lg-0">
        <div class="accordion shadow-sm" id="helpAccordion">
          <div class="accordion-item" v-for="(category, index) in filteredCategories" :key="category.title">
            <h2 class="accordion-header" :id="'heading' + index">
              <button 
                class="accordion-button" 
                :class="{ collapsed: activeCategory.title !== category.title && !searchQuery }"
                type="button" 
                data-bs-toggle="collapse" 
                :data-bs-target="'#collapse' + index" 
                :aria-expanded="activeCategory.title === category.title || !!searchQuery" 
                :aria-controls="'collapse' + index"
              >
                <i :class="['bi', category.icon, 'me-2']"></i> {{ category.title }}
              </button>
            </h2>
            <div 
              :id="'collapse' + index" 
              class="accordion-collapse collapse" 
              :class="{ show: activeCategory.title === category.title || !!searchQuery }" 
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
                  <div class="text-muted" style="white-space: pre-line" v-html="section.body"></div>
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
