$files = Get-ChildItem -Path "c:\Users\akhil\Desktop\sunyab\frontend\assets\*.temp.mp3"
foreach ($f in $files) {
    $dest = $f.FullName.Replace('.temp.mp3', '.mp3')
    Write-Host "Swapping $($f.Name) to $dest"
    Move-Item -Path $f.FullName -Destination $dest -Force
}
