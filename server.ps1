# Gods of Egypt MMORPG - Yerel HTTP Web Sunucusu
$scriptDirectory = $PSScriptRoot
if (-not $scriptDirectory) {
    $scriptDirectory = (Get-Location).Path
}
$root = [System.IO.Path]::GetFullPath($scriptDirectory)

$listener = $null
$port = 8080
foreach ($candidatePort in @(8080, 8088) + (8081..8087) + (8089..8099)) {
    $candidateListener = [System.Net.Sockets.TcpListener]::new(
        [System.Net.IPAddress]::Loopback,
        [int]$candidatePort
    )
    try {
        $candidateListener.Start()
        $listener = $candidateListener
        $port = $candidatePort
        break
    } catch {
        $candidateListener.Stop()
    }
}

if (-not $listener) {
    throw "8080-8099 aralığında kullanılabilir bir port bulunamadı."
}

$address = "http://127.0.0.1:$port/"
$rootPrefix = $root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$encoding = [System.Text.Encoding]::UTF8
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
    ".webp" = "image/webp"
    ".mp4"  = "video/mp4"
    ".webm" = "video/webm"
}

Write-Host "======================================================"
Write-Host "  GODS OF EGYPT MMORPG SUNUCUSU AKTIF!"
Write-Host "  Sunucu Adresi : $address"
Write-Host "  Kok Dizin     : $root"
Write-Host "======================================================"
Start-Process $address

try {
    while ($listener) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        try {
            $reader = [System.IO.StreamReader]::new(
                $stream,
                [System.Text.Encoding]::ASCII,
                $false,
                1024,
                $true
            )
            $requestLine = $reader.ReadLine()
            while (($headerLine = $reader.ReadLine()) -and $headerLine.Length -gt 0) {}

            $status = 200
            $reason = "OK"
            $contentType = "text/plain; charset=utf-8"
            $body = [byte[]]@()
            $method = ""

            if ($requestLine -match '^(\S+)\s+(\S+)\s+HTTP/\d(?:\.\d)?$') {
                $method = $Matches[1].ToUpperInvariant()
                if ($method -notin @("GET", "HEAD")) {
                    $status = 405
                    $reason = "Method Not Allowed"
                    $body = $encoding.GetBytes("405 Method Not Allowed")
                } else {
                    $requestPath = $Matches[2].Split('?')[0]
                    $relativePath = [System.Uri]::UnescapeDataString($requestPath).TrimStart('/')
                    if (-not $relativePath) {
                        $relativePath = "index.html"
                    }

                    $filePath = [System.IO.Path]::GetFullPath(
                        [System.IO.Path]::Combine($root, $relativePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar))
                    )
                    if (-not $filePath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                        $status = 403
                        $reason = "Forbidden"
                        $body = $encoding.GetBytes("403 Forbidden")
                    } elseif (Test-Path -LiteralPath $filePath -PathType Leaf) {
                        $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
                        if ($mimeTypes.ContainsKey($extension)) {
                            $contentType = $mimeTypes[$extension]
                        } else {
                            $contentType = "application/octet-stream"
                        }
                        $body = [System.IO.File]::ReadAllBytes($filePath)
                    } else {
                        $status = 404
                        $reason = "Not Found"
                        $body = $encoding.GetBytes("404 Dosya Bulunamadi: $requestPath")
                    }
                }
            } else {
                $status = 400
                $reason = "Bad Request"
                $body = $encoding.GetBytes("400 Bad Request")
            }

            $responseBody = if ($method -eq "HEAD") { [byte[]]@() } else { $body }
            $headers = "HTTP/1.1 $status $reason`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nX-Content-Type-Options: nosniff`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            if ($responseBody.Length -gt 0) {
                $stream.Write($responseBody, 0, $responseBody.Length)
            }
            $stream.Flush()
        } catch {
            Write-Warning "Istek islenemedi: $($_.Exception.Message)"
        } finally {
            $stream.Dispose()
            $client.Dispose()
        }
    }
} finally {
    $listener.Stop()
}
