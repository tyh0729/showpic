/*
 * 商品資料。
 *
 * 照片原檔放在 images/products/<分類資料夾>/，資料夾名稱就是首頁左側的分類：
 *   201907__   → 顯示「2019/07」（年月，日期未定用 __）
 *   20190701   → 顯示「2019/07/01（一）」
 *   其他名稱   → 原樣顯示
 *
 * 新增或更換照片後，執行 tools\update-photos.ps1：
 *   - 產生縮圖 images/thumbs/ 和網頁版大圖 images/web/（已轉正、移除 EXIF）
 *   - 更新下面的 PRODUCTS 清單；已經存在的項目會保留你改過的 name、date、location
 *
 * 欄位：
 *   id       唯一代號，用在照片頁網址 photo.html?id=xxx
 *   name     名稱（不顯示在卡片上，用於替代文字與照片頁標題）
 *   folder   分類資料夾名稱
 *   file     檔名（產生出來的 .jpg）
 *   date     拍照日期，格式 YYYY-MM-DD（預設取自照片 EXIF）
 *   location 拍照地點，可自行填寫；空白時卡片不顯示地點
 */
const PRODUCTS = [
  { id: "fiwn6767", name: "FIWN6767", folder: "201907__", file: "FIWN6767.jpg", date: "2019-07-01", location: "" },
  { id: "bflr3057", name: "BFLR3057", folder: "201907__", file: "BFLR3057.jpg", date: "2019-07-01", location: "" },
  { id: "jdld3412", name: "JDLD3412", folder: "201907__", file: "JDLD3412.jpg", date: "2019-07-01", location: "" },
  { id: "xvrt4974", name: "XVRT4974", folder: "201907__", file: "XVRT4974.jpg", date: "2019-07-01", location: "" },
  { id: "ylhy5739", name: "YLHY5739", folder: "201907__", file: "YLHY5739.jpg", date: "2019-07-01", location: "" },
  { id: "jani7142", name: "JANI7142", folder: "201907__", file: "JANI7142.jpg", date: "2019-07-01", location: "" },
  { id: "qhhj4185", name: "QHHJ4185", folder: "201907__", file: "QHHJ4185.jpg", date: "2019-07-01", location: "" },
  { id: "rcad4407", name: "RCAD4407", folder: "201907__", file: "RCAD4407.jpg", date: "2019-07-01", location: "" },
  { id: "mhjb0823", name: "MHJB0823", folder: "201907__", file: "MHJB0823.jpg", date: "2019-07-01", location: "" },
  { id: "wobl4643", name: "WOBL4643", folder: "201907__", file: "WOBL4643.jpg", date: "2019-07-01", location: "" },
  { id: "mcqt8581", name: "MCQT8581", folder: "201907__", file: "MCQT8581.jpg", date: "2019-07-02", location: "" },
  { id: "ntye4036", name: "NTYE4036", folder: "201907__", file: "NTYE4036.jpg", date: "2019-07-02", location: "" },
  { id: "vndn6545", name: "VNDN6545", folder: "201907__", file: "VNDN6545.jpg", date: "2019-07-02", location: "" },
  { id: "nrja5268", name: "NRJA5268", folder: "201907__", file: "NRJA5268.jpg", date: "2019-07-02", location: "" },
  { id: "ygld5326", name: "YGLD5326", folder: "201906__", file: "YGLD5326.jpg", date: "2019-06-07", location: "" },
  { id: "woeb6297", name: "WOEB6297", folder: "201906__", file: "WOEB6297.jpg", date: "2019-06-07", location: "" },
  { id: "hazm9721", name: "HAZM9721", folder: "201906__", file: "HAZM9721.jpg", date: "2019-06-07", location: "" },
  { id: "xgor6459", name: "XGOR6459", folder: "201906__", file: "XGOR6459.jpg", date: "2019-06-07", location: "" },
  { id: "btra3924", name: "BTRA3924", folder: "201906__", file: "BTRA3924.jpg", date: "2019-06-07", location: "" },
  { id: "bcgv7827", name: "BCGV7827", folder: "201904__", file: "BCGV7827.jpg", date: "2019-04-04", location: "" },
  { id: "guex6592", name: "GUEX6592", folder: "201801__", file: "GUEX6592.jpg", date: "2018-01-21", location: "" },
];

// 組出相對路徑：縮圖給首頁卡片用，大圖給照片頁用
PRODUCTS.forEach(function (p) {
  const path = encodeURIComponent(p.folder) + "/" + encodeURIComponent(p.file);
  p.thumb = "images/thumbs/" + path;
  p.image = "images/web/" + path;
});
