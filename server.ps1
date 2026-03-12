$port = 3000
$root = "C:\Users\babug\Downloads\calm-spiritual-pwa\bibleverse"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Listening on http://localhost:$port/"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        $fullPath = Join-Path $root $path

        # Basic MIME types
        $mime = "application/octet-stream"
        if ($path.EndsWith(".html")) { $mime = "text/html" }
        elseif ($path.EndsWith(".js")) { $mime = "application/javascript" }
        elseif ($path.EndsWith(".css")) { $mime = "text/css" }
        elseif ($path.EndsWith(".json")) { $mime = "application/json" }
        elseif ($path.EndsWith(".svg")) { $mime = "image/svg+xml" }
        elseif ($path.EndsWith(".mp3")) { $mime = "audio/mpeg" }

        $response.ContentType = $mime

        if (Test-Path $fullPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} catch {
    Write-Host "Server stopped."
} finally {
    $listener.Stop()
}
