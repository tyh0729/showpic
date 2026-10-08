# 商品照片集

放在 GitHub Pages 上的靜態照片網站。

## 檔案結構

```
index.html            首頁（左側分類，右側格狀商品卡片；中間分隔線可拖曳調整寬度）
photo.html            照片頁（點卡片後在新視窗開啟）
css/style.css         樣式
js/products.js        商品資料（由工具產生，可手動修改名稱、日期、地點）
js/main.js            產生首頁卡片
js/resizer.js         左右分隔線拖曳
js/photo.js           照片頁邏輯
tools/update-photos.ps1  由原檔產生縮圖、大圖與 products.js
images/products/      ★ 照片原檔，依分類分資料夾（只留在本機，不上傳 GitHub）
  201907__/           ← 首頁左側顯示「2019/07」
  20190701/           ← 首頁左側顯示「2019/07/01（一）」
images/thumbs/        首頁縮圖（640×480，工具產生）
images/web/           照片頁大圖（長邊 2000px，工具產生）
```

## 新增或更換照片

1. 把照片原檔放進 `images/products/<分類資料夾>/`，資料夾名稱就是左側的分類。
2. 在這個資料夾執行：

   ```bash
   powershell -ExecutionPolicy Bypass -File tools\update-photos.ps1
   ```

   - 依 EXIF 轉正，產生縮圖與大圖，並移除 EXIF（含 GPS、相機型號等）。
   - 更新 `js/products.js`：新照片自動加入（日期取自 EXIF），刪掉的照片自動移除；
     已經存在的項目會保留你改過的 `name`、`date`、`location`。
   - 加上 `-Geocode` 會用照片的 GPS 向 OpenStreetMap 查地名（座標會送到該服務）。
3. 打開 `js/products.js` 填寫 `location`（拍照地點）；空白時卡片不顯示地點。

路徑一律是相對路徑，不要以 `/` 開頭，
否則部署到 `https://<帳號>.github.io/<repo>/` 時會找不到圖片。

## 部署到 GitHub Pages

1. 把這個資料夾的內容推到 GitHub repo 的根目錄。
2. repo → Settings → Pages → Source 選 `Deploy from a branch`，分支選 `main`、資料夾選 `/ (root)`。
3. 幾分鐘後網址會出現在同一頁。

## 本機預覽

```bash
python -m http.server 8000
```

然後開 http://localhost:8000 。直接雙擊 `index.html` 也能看。
