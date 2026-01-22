$assetsDir = "c:\Users\akhil\Desktop\sunyab\frontend\assets"
$ffmpegPath = "ffmpeg" # Will try to detect if not in PATH

# Try to find ffmpeg in typical winget location if not in PATH
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    $potentialPaths = @(
        "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe",
        "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\*\*\bin\ffmpeg.exe",
        "C:\Program Files\ffmpeg\bin\ffmpeg.exe"
    )
    foreach ($path in $potentialPaths) {
        $found = Get-ChildItem $path -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) {
            $ffmpegPath = $found.FullName
            Write-Host "Found ffmpeg at: $ffmpegPath"
            break
        }
    }
}

$files = Get-ChildItem -Path $assetsDir -Filter "*.mp3" -Recurse

foreach ($file in $files) {
    if ($file.Length -gt 2000000) { # Only compress files > 2MB
        $input = $file.FullName
        $tempOutput = $file.FullName + ".temp.mp3"
        $originalSize = [math]::Round($file.Length / 1MB, 2)
        
        Write-Host "Compressing $($file.Name) ($originalSize MB)..."
        
        # Compress to 64k mono (or stereo at 64k is fine, but maybe 64k is enough)
        # -y overwrite
        # -map_metadata 0 keep metadata
        # -b:a 64k set bitrate
        $proc = Start-Process -FilePath $ffmpegPath -ArgumentList "-y", "-i", "`"$input`"", "-codec:a", "libmp3lame", "-b:a", "64k", "`"$tempOutput`"" -Wait -NoNewWindow -PassThru
        
        if ($proc.ExitCode -eq 0 -and (Test-Path $tempOutput)) {
            $newSize = (Get-Item $tempOutput).Length / 1MB
            $newSizeStr = [math]::Round($newSize, 2)
            
            if ($newSize -lt $originalSize) {
                Remove-Item $input -Force
                Rename-Item $tempOutput $file.Name
                Write-Host "  -> Reduced to $newSizeStr MB"
            } else {
                Write-Host "  -> Compression didn't make it smaller. Keeping original."
                Remove-Item $tempOutput -Force
            }
        } else {
            Write-Host "  -> FFmpeg failed. Skipping."
             if (Test-Path $tempOutput) { Remove-Item $tempOutput -Force }
        }
    }
}
Write-Host "Compression complete."
