<#
  Rebuilds the web-ready images and the product list from the original photos.

    Originals : images/products/<category>/<photo>     (category = folder name, e.g. 201907__)
    Thumbnails: images/thumbs/<category>/<name>.jpg     640x480, centre-cropped
    Large     : images/web/<category>/<name>.jpg        long edge <= 1600px
    Data      : js/products.js                          only the PRODUCTS array is rewritten

  Generated images are rotated upright and carry no EXIF metadata (no GPS, camera, etc.).
  Entries already in js/products.js keep their id / name / date / location, so hand edits
  survive a rebuild. New photos get their date from EXIF (or the file time).

  Usage, from the site folder:
    powershell -ExecutionPolicy Bypass -File tools\update-photos.ps1
    powershell -ExecutionPolicy Bypass -File tools\update-photos.ps1 -Geocode
    powershell -ExecutionPolicy Bypass -File tools\update-photos.ps1 -Force
  -Geocode looks up a place name on OpenStreetMap (Nominatim) for photos that have real
  GPS coordinates and no location yet; the coordinates are sent to that service.
  Taiwan -> "<city>.<district>", elsewhere -> "<country>.<city/town>".
  -Force rebuilds every thumbnail and large image (e.g. after changing the sizes below).

  This file is kept ASCII-only so Windows PowerShell 5.1 reads it correctly.
#>
param([switch]$Geocode, [switch]$Force)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root      = Split-Path -Parent $PSScriptRoot
$srcRoot   = Join-Path $root 'images\products'
$webRoot   = Join-Path $root 'images\web'
$thumbRoot = Join-Path $root 'images\thumbs'
$dataFile  = Join-Path $root 'js\products.js'
$inv       = [Globalization.CultureInfo]::InvariantCulture
$utf8      = New-Object Text.UTF8Encoding $false

$WEB_MAX = 1600; $WEB_QUALITY = 80
$THUMB_W = 640;  $THUMB_H = 480; $THUMB_QUALITY = 78
$EXTENSIONS = @('.jpg', '.jpeg', '.png')
$DOT = [string][char]0x30FB   # the dot used between place names

$jpegCodec = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

# ---------------------------------------------------------------- EXIF helpers
function Get-ExifAscii($img, [int]$id) {
  if (-not ($img.PropertyIdList -contains $id)) { return '' }
  return ([Text.Encoding]::ASCII.GetString($img.GetPropertyItem($id).Value)).Trim([char]0, ' ')
}

function Get-Rational([byte[]]$v, [int]$i) {
  $den = [BitConverter]::ToUInt32($v, $i * 8 + 4)
  if ($den -eq 0) { return 0.0 }
  return [double][BitConverter]::ToUInt32($v, $i * 8) / $den
}

# Returns @(lat, lon), or $null when missing or 0,0 (phones write zeros without a fix)
function Get-GpsCoordinates($img) {
  foreach ($id in 0x0001, 0x0002, 0x0003, 0x0004) {
    if (-not ($img.PropertyIdList -contains $id)) { return $null }
  }
  $coords = @()
  foreach ($pair in @(@(0x0001, 0x0002), @(0x0003, 0x0004))) {
    $v = $img.GetPropertyItem($pair[1]).Value
    $deg = (Get-Rational $v 0) + (Get-Rational $v 1) / 60 + (Get-Rational $v 2) / 3600
    $ref = Get-ExifAscii $img $pair[0]
    if ($ref -eq 'S' -or $ref -eq 'W') { $deg = -$deg }
    $coords += $deg
  }
  if ($coords[0] -eq 0 -and $coords[1] -eq 0) { return $null }
  return $coords
}

function Get-Orientation($img) {
  if (-not ($img.PropertyIdList -contains 0x0112)) { return 1 }
  return [int][BitConverter]::ToUInt16($img.GetPropertyItem(0x0112).Value, 0)
}

$ROTATE_FLIP = @{
  2 = 'RotateNoneFlipX'; 3 = 'Rotate180FlipNone'; 4 = 'Rotate180FlipX'; 5 = 'Rotate90FlipX'
  6 = 'Rotate90FlipNone'; 7 = 'Rotate270FlipX'; 8 = 'Rotate270FlipNone'
}

# ---------------------------------------------------------------- image output
function Save-Jpeg($src, [string]$path, [int]$w, [int]$h, [Drawing.Rectangle]$crop, [long]$quality) {
  New-Item -ItemType Directory -Force (Split-Path -Parent $path) | Out-Null
  $bmp = New-Object Drawing.Bitmap $w, $h, ([Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.Clear([Drawing.Color]::White)
  $g.InterpolationMode  = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode    = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [Drawing.Drawing2D.CompositingQuality]::HighQuality
  $attr = New-Object Drawing.Imaging.ImageAttributes
  $attr.SetWrapMode([Drawing.Drawing2D.WrapMode]::TileFlipXY)
  $g.DrawImage($src, (New-Object Drawing.Rectangle 0, 0, $w, $h),
    $crop.X, $crop.Y, $crop.Width, $crop.Height, [Drawing.GraphicsUnit]::Pixel, $attr)
  $params = New-Object Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object Drawing.Imaging.EncoderParameter ([Drawing.Imaging.Encoder]::Quality), $quality
  $bmp.Save($path, $jpegCodec, $params)
  $attr.Dispose(); $g.Dispose(); $bmp.Dispose()
}

function Build-Images([IO.FileInfo]$file, [string]$webPath, [string]$thumbPath) {
  $fs = [IO.File]::OpenRead($file.FullName)
  try {
    $img = [Drawing.Image]::FromStream($fs, $false, $true)
    $o = Get-Orientation $img
    if ($ROTATE_FLIP.ContainsKey($o)) { $img.RotateFlip([Drawing.RotateFlipType]$ROTATE_FLIP[$o]) }
    $w = $img.Width; $h = $img.Height

    $scale = [math]::Min(1.0, $WEB_MAX / [double][math]::Max($w, $h))
    Save-Jpeg $img $webPath ([int][math]::Round($w * $scale)) ([int][math]::Round($h * $scale)) `
      (New-Object Drawing.Rectangle 0, 0, $w, $h) $WEB_QUALITY

    $ratio = $THUMB_W / [double]$THUMB_H
    if ($w / [double]$h -gt $ratio) {
      $cw = [int][math]::Round($h * $ratio); $crop = New-Object Drawing.Rectangle ([int](($w - $cw) / 2)), 0, $cw, $h
    } else {
      $ch = [int][math]::Round($w / $ratio); $crop = New-Object Drawing.Rectangle 0, ([int](($h - $ch) / 2)), $w, $ch
    }
    Save-Jpeg $img $thumbPath $THUMB_W $THUMB_H $crop $THUMB_QUALITY
    $img.Dispose()
  } finally { $fs.Dispose() }

  # Stamp outputs with the original's time so a replaced original is detected next run
  foreach ($p in $webPath, $thumbPath) { (Get-Item -LiteralPath $p).LastWriteTimeUtc = $file.LastWriteTimeUtc }
}

# ---------------------------------------------------------------- reverse geocoding
$geoCache = @{}
function Get-PlaceName([double]$lat, [double]$lon) {
  # ~1 km grid: nearby photos share one lookup (district-level names rarely differ inside it)
  $key = $lat.ToString('F2', $inv) + ',' + $lon.ToString('F2', $inv)
  if ($geoCache.ContainsKey($key)) { return $geoCache[$key] }
  Start-Sleep -Milliseconds 1100   # Nominatim usage policy: at most 1 request per second
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&accept-language=zh-Hant,zh-TW,zh' +
         '&lat=' + $lat.ToString('F6', $inv) + '&lon=' + $lon.ToString('F6', $inv)
  $place = ''
  try {
    $resp = Invoke-WebRequest -UseBasicParsing -Uri $url -Headers @{ 'User-Agent' = 'showpic-photo-site/1.0 (personal photo gallery)' }
    $ms = New-Object IO.MemoryStream; $resp.RawContentStream.CopyTo($ms)
    $a = ([Text.Encoding]::UTF8.GetString($ms.ToArray()) | ConvertFrom-Json).address
    if ($a -and $a.country_code -eq 'tw') {
      $big = @($a.city, $a.county, $a.state) | Where-Object { $_ } | Select-Object -First 1
      $small = @($a.city_district, $a.district, $a.town, $a.suburb, $a.village) |
        Where-Object { $_ -and $_ -ne $big } | Select-Object -First 1
      $place = (@($big, $small) | Where-Object { $_ }) -join $DOT
    } elseif ($a) {
      $small = @($a.city, $a.town, $a.village, $a.municipality, $a.state) | Where-Object { $_ } | Select-Object -First 1
      $place = (@($a.country, $small) | Where-Object { $_ }) -join $DOT
    }
  } catch { Write-Warning "Geocoding failed for one photo: $($_.Exception.Message)" }
  $geoCache[$key] = $place
  return $place
}

# ---------------------------------------------------------------- products.js
function ConvertTo-JsString([string]$s) { return '"' + $s.Replace('\', '\\').Replace('"', '\"') + '"' }

function Read-ProductsFile {
  $result = @{ Head = ''; Tail = ''; Entries = @{}; Ids = @{} }
  if (-not (Test-Path -LiteralPath $dataFile)) {
    $result.Head = "const PRODUCTS = [`n"; $result.Tail = "];`n"; return $result
  }
  $text = [IO.File]::ReadAllText($dataFile, $utf8) -replace "`r`n", "`n"
  $start = $text.IndexOf('const PRODUCTS = [')
  if ($start -lt 0) { throw 'js/products.js: cannot find the PRODUCTS array' }
  $bodyStart = $text.IndexOf("`n", $start) + 1
  $end = $text.IndexOf("`n];", $bodyStart - 1)
  if ($bodyStart -le 0 -or $end -lt 0) { throw 'js/products.js: cannot find the end of the PRODUCTS array' }
  $result.Head = $text.Substring(0, $bodyStart)
  $result.Tail = $text.Substring($end + 1)
  foreach ($line in $text.Substring($bodyStart, [math]::Max(0, $end - $bodyStart)) -split "`n") {
    $fields = @{}
    foreach ($m in [regex]::Matches($line, '(\w+):\s*"((?:[^"\\]|\\.)*)"')) {
      $fields[$m.Groups[1].Value] = $m.Groups[2].Value.Replace('\"', '"').Replace('\\', '\')
    }
    if ($fields.folder -and $fields.file) {
      $result.Entries[$fields.folder + '/' + $fields.file] = $fields
      if ($fields.id) { $result.Ids[$fields.id] = $true }
    }
  }
  return $result
}

function New-Id([string]$stem, $usedIds) {
  $base = ($stem.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-')
  if (-not $base) { $base = 'photo' }
  $id = $base; $n = 2
  while ($usedIds.ContainsKey($id)) { $id = "$base-$n"; $n++ }
  $usedIds[$id] = $true
  return $id
}

# ---------------------------------------------------------------- main
if (-not (Test-Path -LiteralPath $srcRoot)) { throw "Missing folder: $srcRoot" }
$data = Read-ProductsFile
$entries = @()
$expected = @{}
$built = 0; $added = 0

foreach ($cat in Get-ChildItem -LiteralPath $srcRoot -Directory | Sort-Object Name) {
  $files = Get-ChildItem -LiteralPath $cat.FullName -File |
    Where-Object { $EXTENSIONS -contains $_.Extension.ToLowerInvariant() } | Sort-Object Name
  foreach ($f in $files) {
    $stem = [IO.Path]::GetFileNameWithoutExtension($f.Name)
    $outName = $stem + '.jpg'
    $key = $cat.Name + '/' + $outName
    if ($expected.ContainsKey($key)) { Write-Warning "Skipped $($cat.Name)/$($f.Name): same name as another photo"; continue }
    $expected[$key] = $true

    $webPath = Join-Path (Join-Path $webRoot $cat.Name) $outName
    $thumbPath = Join-Path (Join-Path $thumbRoot $cat.Name) $outName
    $fresh = (-not $Force) -and (Test-Path -LiteralPath $webPath) -and (Test-Path -LiteralPath $thumbPath) -and
      (Get-Item -LiteralPath $webPath).LastWriteTimeUtc -eq $f.LastWriteTimeUtc -and
      (Get-Item -LiteralPath $thumbPath).LastWriteTimeUtc -eq $f.LastWriteTimeUtc
    if (-not $fresh) {
      Build-Images $f $webPath $thumbPath; $built++
      if ($built % 25 -eq 0) { Write-Host "  built $built images..." }
    }

    # metadata (header only, no full decode)
    $fs = [IO.File]::OpenRead($f.FullName)
    try {
      $img = [Drawing.Image]::FromStream($fs, $false, $false)
      $takenText = Get-ExifAscii $img 0x9003
      $gps = Get-GpsCoordinates $img
      $img.Dispose()
    } finally { $fs.Dispose() }
    $taken = $f.LastWriteTime
    if ($takenText) {
      try { $taken = [datetime]::ParseExact($takenText, 'yyyy:MM:dd HH:mm:ss', $inv) } catch { }
    }

    $old = $data.Entries[$key]
    if ($old) {
      $entry = [ordered]@{ id = $old.id; name = $old.name; folder = $cat.Name; file = $outName; date = $old.date; location = $old.location }
      if (-not $entry.id) { $entry.id = New-Id $stem $data.Ids }
    } else {
      $added++
      $entry = [ordered]@{
        id = New-Id $stem $data.Ids; name = $stem; folder = $cat.Name; file = $outName
        date = $taken.ToString('yyyy-MM-dd', $inv); location = ''
      }
    }
    if ($Geocode -and -not $entry.location -and $gps) { $entry.location = Get-PlaceName $gps[0] $gps[1] }
    $entries += [pscustomobject]@{ Entry = $entry; Folder = $cat.Name; Taken = $taken }
  }
}

# Remove generated images whose original is gone
$removed = 0
foreach ($dir in $webRoot, $thumbRoot) {
  if (-not (Test-Path -LiteralPath $dir)) { continue }
  Get-ChildItem -LiteralPath $dir -Recurse -File | ForEach-Object {
    if (-not $expected.ContainsKey($_.Directory.Name + '/' + $_.Name)) { Remove-Item -LiteralPath $_.FullName; $removed++ }
  }
  Get-ChildItem -LiteralPath $dir -Recurse -Directory | Sort-Object { $_.FullName.Length } -Descending |
    Where-Object { -not (Get-ChildItem -LiteralPath $_.FullName -Force) } | Remove-Item
}

# Newest category first; inside a category, oldest photo first
$sorted = $entries | Sort-Object @{ Expression = 'Folder'; Descending = $true }, @{ Expression = 'Taken'; Descending = $false }
$lines = foreach ($e in $sorted) {
  $parts = foreach ($k in $e.Entry.Keys) { $k + ': ' + (ConvertTo-JsString ([string]$e.Entry[$k])) }
  '  { ' + ($parts -join ', ') + ' },'
}
$body = if ($lines) { ($lines -join "`n") + "`n" } else { '' }
[IO.File]::WriteAllText($dataFile, $data.Head + $body + $data.Tail, $utf8)

$missing = @($entries | Where-Object { -not $_.Entry.location }).Count
"Photos: $($entries.Count)  (new: $added, images built: $built, stale images removed: $removed)"
if ($missing) { "Photos without a location: $missing  -> fill in 'location' in js/products.js" }
