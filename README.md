# 🌺 沖繩旅行手冊 2025

## 部署步驟（照順序做，大約 10 分鐘）

---

## 第一步：建立 Firebase 專案（免費資料庫）

1. 前往 https://console.firebase.google.com
2. 點「建立專案」→ 取名（例如 okinawa-trip-2025）→ 不需要 Google Analytics → 建立
3. 左側選單點「Firestore Database」→「建立資料庫」
4. 選「在測試模式下啟動」→ 選 asia-east1 → 啟用
5. 回到「專案概覽」→ 點「</> 網頁應用程式」圖示
6. 取個暱稱（例如 okinawa-app）→「註冊應用程式」
7. 複製 firebaseConfig 裡的六個值備用

---

## 第二步：上傳到 GitHub

1. 前往 https://github.com → 點「+」→「New repository」
2. 名稱填 okinawa-trip → Public → 建立
3. 把這個資料夾的所有檔案上傳（uploading an existing file）
4. Commit changes

---

## 第三步：部署到 Vercel

1. 前往 https://vercel.com → GitHub 登入
2. Add New Project → 選 okinawa-trip → Import
3. 設定 Environment Variables（六個）：
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
4. Deploy → 等 1-2 分鐘 → 拿到網址！

---

## 給家人

把網址傳給所有人，任何人修改行程後即時同步。
手機可以加到桌面當 App 用（Safari → 分享 → 加入主畫面）。
