/*
 * 商品資料 —— 新增、修改商品只要改這個檔案。
 *
 *   id       唯一代號（英數字），用在照片頁網址 photo.html?id=xxx
 *   name     商品名稱
 *   image    照片路徑，一律用相對路徑，例如 images/products/product-01.jpg
 *   date     拍照日期，格式 YYYY-MM-DD（同一天的商品會自動歸在左側同一個日期分類）
 *   location 拍照地點
 *
 * 換成真的照片：把照片放進 images/products/，再把對應的 image 改成新檔名即可。
 * 若新照片沿用 product-01.jpg 這類檔名直接覆蓋，這裡就不用改。
 */
const PRODUCTS = [
  { id: "p01", name: "商品 01", image: "images/products/product-01.jpg", date: "2026-01-11", location: "埼玉・川越" },
  { id: "p02", name: "商品 02", image: "images/products/product-02.jpg", date: "2026-01-11", location: "埼玉・川越" },
  { id: "p03", name: "商品 03", image: "images/products/product-03.jpg", date: "2026-01-11", location: "埼玉・川越" },
  { id: "p04", name: "商品 04", image: "images/products/product-04.jpg", date: "2026-01-12", location: "神奈川・橫濱" },
  { id: "p05", name: "商品 05", image: "images/products/product-05.jpg", date: "2026-01-12", location: "神奈川・橫濱" },
  { id: "p06", name: "商品 06", image: "images/products/product-06.jpg", date: "2026-01-13", location: "山梨・河口湖" },
  { id: "p07", name: "商品 07", image: "images/products/product-07.jpg", date: "2026-01-13", location: "山梨・富士吉田" },
  { id: "p08", name: "商品 08", image: "images/products/product-08.jpg", date: "2026-01-14", location: "神奈川・鎌倉" },
];
