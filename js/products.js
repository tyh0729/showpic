/*
 * 商品資料 —— 新增、修改商品只要改這個檔案。
 *
 *   id       唯一代號（英數字），用在照片頁網址 photo.html?id=xxx
 *   name     商品名稱
 *   date     拍照日期，格式 YYYY-MM-DD（同一天的商品會自動歸在左側同一個日期分類）
 *   file     照片檔名（只寫檔名）
 *   location 拍照地點
 *
 * 照片依「左側日期分類」分資料夾存放：
 *   images/products/<拍照日期>/<檔名>   例如 images/products/2026-01-11/product-01.jpg
 * 路徑會由 date + file 自動組合，所以 date 改了，照片也要搬到對應日期的資料夾。
 */
const PRODUCTS = [
  { id: "p01", name: "商品 01", date: "2026-01-11", file: "product-01.jpg", location: "埼玉・川越" },
  { id: "p02", name: "商品 02", date: "2026-01-11", file: "product-02.jpg", location: "埼玉・川越" },
  { id: "p03", name: "商品 03", date: "2026-01-11", file: "product-03.jpg", location: "埼玉・川越" },
  { id: "p04", name: "商品 04", date: "2026-01-12", file: "product-04.jpg", location: "神奈川・橫濱" },
  { id: "p05", name: "商品 05", date: "2026-01-12", file: "product-05.jpg", location: "神奈川・橫濱" },
  { id: "p06", name: "商品 06", date: "2026-01-13", file: "product-06.jpg", location: "山梨・河口湖" },
  { id: "p07", name: "商品 07", date: "2026-01-13", file: "product-07.jpg", location: "山梨・富士吉田" },
  { id: "p08", name: "商品 08", date: "2026-01-14", file: "product-08.jpg", location: "神奈川・鎌倉" },
];

// 組出相對路徑：images/products/<拍照日期>/<檔名>
PRODUCTS.forEach(function (p) {
  p.image = "images/products/" + p.date + "/" + encodeURIComponent(p.file);
});
