# 商品照片集

放在 GitHub Pages 上的靜態照片網站。

## 檔案結構

```
index.html            首頁（左側依拍照日期分類，右側格狀商品卡片）
photo.html            照片頁（點卡片後在新視窗開啟）
css/style.css         樣式
js/products.js        ★ 商品資料，新增／修改商品只改這裡
js/main.js            產生首頁卡片
js/photo.js           照片頁邏輯
images/products/      商品照片
```

## 換成真的照片

1. 把照片放進 `images/products/`。
2. 打開 `js/products.js`，修改對應商品的 `image`、`date`、`location`、`name`。
   - 若新照片直接用 `product-01.jpg` 這類檔名覆蓋，`image` 就不用改。
3. 新增商品：在 `PRODUCTS` 裡多加一行，`id` 不可重複。

路徑一律寫相對路徑（`images/products/xxx.jpg`），不要以 `/` 開頭，
否則部署到 `https://<帳號>.github.io/<repo>/` 時會找不到圖片。

建議照片長邊縮到 1600–2000px、存成品質約 80% 的 JPG，載入會快很多。

## 部署到 GitHub Pages

1. 把這個資料夾的內容推到 GitHub repo 的根目錄。
2. repo → Settings → Pages → Source 選 `Deploy from a branch`，分支選 `main`、資料夾選 `/ (root)`。
3. 幾分鐘後網址會出現在同一頁。

## 本機預覽

```bash
python -m http.server 8000
```

然後開 http://localhost:8000 。直接雙擊 `index.html` 也能看。
