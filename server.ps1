# Gods of Egypt MMORPG - Yerel HTTP Web Sunucusu
$port = 8080
$prefix = "http://localhost:$port/"
$root = (Get-Location).Path

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    $port = 8088
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host "======================================================"
Write-Host "  GODS OF EGYPT MMORPG SUNUCUSU AKTIF!"
Write-Host "  Sunucu Adresi : $prefix"
Write-Host "  Kok Dizin     : $root"
Write-Host "======================================================"

# Tarayicida ac
Start-Process $prefix

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # URL cozme (UTF-8 ve Turkce karakter destegi)
        $raw = $request.RawUrl.Split('?')[0]
        $urlPath = [System.Uri]::UnescapeDataString($raw)
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }

        $relPath = $urlPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        $filePath = [System.IO.Path]::Combine($root, $relPath)

        if (-not (Test-Path $filePath -PathType Leaf)) {
            $searchName = [System.IO.Path]::GetFileName($filePath)
            $searchNorm = $searchName.Replace('ı','i').Replace('İ','i').ToLower()
            $candidate = Get-ChildItem -Path $root -File | Where-Object {
                $nNorm = $_.Name.Replace('ı','i').Replace('İ','i').ToLower()
                $_.Name -eq $searchName -or $nNorm -eq $searchNorm
            } | Select-Object -First 1
            if ($candidate) {
                $filePath = $candidate.FullName
            }
        }

        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "*")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $mime = $mimeTypes[$ext]
            }
            $response.ContentType = $mime

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Dosya Bulunamadi: $urlPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    } catch {
        # Istemci baglantiyi kestiginde donguye devam et
    }
}
