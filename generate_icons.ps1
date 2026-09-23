Add-Type -AssemblyName System.Drawing
$iconsDir = 'c:\Users\ABC\Documents\App\icons'
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
}

function Generate-Icon([int]$size, [string]$outputPath) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background gradient: Deep Indigo to Sapphire Blue
    $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
    $c1 = [System.Drawing.Color]::FromArgb(30, 58, 138)  # Deep Indigo #1e3a8a
    $c2 = [System.Drawing.Color]::FromArgb(37, 99, 235)  # Electric Blue #2563eb
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, 45
    $g.FillRectangle($brush, $rect)

    # Accent circular glow
    $margin = [int]($size * 0.08)
    $circleSize = $size - ($margin * 2)
    $circleRect = New-Object System.Drawing.Rectangle $margin, $margin, $circleSize, $circleSize
    $cAcc1 = [System.Drawing.Color]::FromArgb(60, 255, 255, 255)
    $cAcc2 = [System.Drawing.Color]::FromArgb(10, 255, 255, 255)
    $circleBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $circleRect, $cAcc1, $cAcc2, 90
    $g.FillEllipse($circleBrush, $circleRect)

    # Center coordinates
    $cx = [float]($size / 2.0)
    $cy = [float]($size / 2.0)
    $s = [float]($size * 0.44)

    # Diamond mortarboard top
    $diamondBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255))
    $p1 = New-Object System.Drawing.PointF $cx, ($cy - $s * 0.42)
    $p2 = New-Object System.Drawing.PointF ($cx + $s * 0.75), ($cy - $s * 0.10)
    $p3 = New-Object System.Drawing.PointF $cx, ($cy + $s * 0.22)
    $p4 = New-Object System.Drawing.PointF ($cx - $s * 0.75), ($cy - $s * 0.10)
    $points = [System.Drawing.PointF[]]@($p1, $p2, $p3, $p4)
    $g.FillPolygon($diamondBrush, $points)

    # Skullcap underneath
    $capPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $capRect = New-Object System.Drawing.RectangleF ($cx - $s * 0.42), ($cy + $s * 0.08), ($s * 0.84), ($s * 0.38)
    $capPath.AddArc($capRect, 0, 180)
    $capBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(226, 232, 240))
    $g.FillPath($capBrush, $capPath)

    # Gold tassel
    $gold = [System.Drawing.Color]::FromArgb(251, 191, 36)
    $goldBrush = New-Object System.Drawing.SolidBrush $gold
    $tasselPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $tasselPath.AddEllipse(($cx + $s * 0.65), ($cy + $s * 0.22), [float]($size * 0.08), [float]($size * 0.08))
    $g.FillPath($goldBrush, $tasselPath)

    # Save to disk
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Success: $outputPath"
}

Generate-Icon 192 'c:\Users\ABC\Documents\App\icons\icon-192.png'
Generate-Icon 512 'c:\Users\ABC\Documents\App\icons\icon-512.png'
Generate-Icon 180 'c:\Users\ABC\Documents\App\icons\apple-touch-icon.png'
Generate-Icon 64  'c:\Users\ABC\Documents\App\icons\favicon.png'
