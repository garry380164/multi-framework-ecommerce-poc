# 設定輸出編碼為 UTF-8，以利在 Windows 主機上正常顯示繁體中文
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 顯示主選單的函式
function Show-Menu {
    Clear-Host
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host "  多商家電商與內容管理系統 (CMS) - 啟動控制台" -ForegroundColor Cyan
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host "  [1] 啟動所有專案 (後端 API + Next.js 前台 + Angular 後台)"
    Write-Host "  [2] 僅啟動後端 API (ASP.NET Core)"
    Write-Host "  [3] 僅啟動前台官網 (Next.js)"
    Write-Host "  [4] 僅啟動管理後台 (Angular)"
    Write-Host "  [5] 檢查環境與自動安裝相依套件 (npm install / dotnet restore)"
    Write-Host "  [6] 結束離開"
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host ""
}

# 檢查 node_modules 是否存在，若不存在則執行安裝
function Check-NodeModules {
    param (
        [string]$Path,
        [string]$ProjectName
    )
    $Target = Join-Path $PSScriptRoot $Path
    $NodeModules = Join-Path $Target "node_modules"
    if (-not (Test-Path $NodeModules)) {
        Write-Host "[警告] 偵測到 $ProjectName 尚未安裝相依套件 (node_modules)，正在執行 npm install..." -ForegroundColor Yellow
        Push-Location $Target
        npm install
        Pop-Location
        Write-Host "[成功] $ProjectName 相依套件安裝完成！" -ForegroundColor Green
    }
}

# 啟動所有專案
function Start-AllProjects {
    Write-Host ""
    Write-Host "[資訊] 正在檢查前端相依性..." -ForegroundColor Gray
    Check-NodeModules "frontend-clients\storefront-nextjs" "前台官網 (Next.js)"
    Check-NodeModules "frontend-clients\admin-angular" "管理後台 (Angular)"

    Write-Host "[資訊] 正在啟動所有服務..." -ForegroundColor Gray

    # 啟動後端 API
    $BackendPath = Join-Path $PSScriptRoot "backend-dotnet\src\WebApi"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BackendPath'; `$Host.UI.RawUI.WindowTitle = '後端 API (.NET)'; dotnet run"
    
    # 啟動 Next.js 前台官網
    $StorefrontPath = Join-Path $PSScriptRoot "frontend-clients\storefront-nextjs"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$StorefrontPath'; `$Host.UI.RawUI.WindowTitle = '前台官網 (Next.js)'; npm run dev"

    # 啟動 Angular 後台管理
    $AdminPath = Join-Path $PSScriptRoot "frontend-clients\admin-angular"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$AdminPath'; `$Host.UI.RawUI.WindowTitle = '管理後台 (Angular)'; npm start"

    Write-Host "[成功] 所有服務已於獨立 PowerShell 視窗中啟動！" -ForegroundColor Green
    Write-Host ""
}

# 僅啟動後端 API
function Start-BackendOnly {
    Write-Host ""
    Write-Host "[資訊] 正在啟動後端 API..." -ForegroundColor Gray
    $BackendPath = Join-Path $PSScriptRoot "backend-dotnet\src\WebApi"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BackendPath'; `$Host.UI.RawUI.WindowTitle = '後端 API (.NET)'; dotnet run"
    Write-Host "[成功] 後端 API 已於新視窗啟動！" -ForegroundColor Green
    Write-Host ""
}

# 僅啟動前台官網
function Start-StorefrontOnly {
    Write-Host ""
    Check-NodeModules "frontend-clients\storefront-nextjs" "前台官網 (Next.js)"
    Write-Host "[資訊] 正在啟動前台官網 (Next.js)..." -ForegroundColor Gray
    $StorefrontPath = Join-Path $PSScriptRoot "frontend-clients\storefront-nextjs"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$StorefrontPath'; `$Host.UI.RawUI.WindowTitle = '前台官網 (Next.js)'; npm run dev"
    Write-Host "[成功] 前台官網已於新視窗啟動！" -ForegroundColor Green
    Write-Host ""
}

# 僅啟動管理後台
function Start-AdminOnly {
    Write-Host ""
    Check-NodeModules "frontend-clients\admin-angular" "管理後台 (Angular)"
    Write-Host "[資訊] 正在啟動管理後台 (Angular)..." -ForegroundColor Gray
    $AdminPath = Join-Path $PSScriptRoot "frontend-clients\admin-angular"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$AdminPath'; `$Host.UI.RawUI.WindowTitle = '管理後台 (Angular)'; npm start"
    Write-Host "[成功] 管理後台已於新視窗啟動！" -ForegroundColor Green
    Write-Host ""
}

# 檢查環境相依性與還原套件
function Check-Environment {
    Clear-Host
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host "  環境與相依套件檢查工具" -ForegroundColor Cyan
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host ""

    # 1. 檢查 .NET SDK
    $dotnetInstalled = $false
    try {
        $dotnetVer = dotnet --version 2>$null
        if ($null -ne $dotnetVer) {
            Write-Host "[OK] .NET SDK 已安裝，版本: $dotnetVer" -ForegroundColor Green
            $dotnetInstalled = $true
        }
    } catch {
        Write-Host "[錯誤] 未偵測到 .NET SDK，請安裝 .NET 8.0 SDK。" -ForegroundColor Red
    }

    # 2. 檢查 Node.js
    $nodeInstalled = $false
    try {
        $nodeVer = node -v 2>$null
        if ($null -ne $nodeVer) {
            Write-Host "[OK] Node.js 已安裝，版本: $nodeVer" -ForegroundColor Green
            $nodeInstalled = $true
        }
    } catch {
        Write-Host "[錯誤] 未偵測到 Node.js，請至官網下載並安裝。" -ForegroundColor Red
    }

    # 3. 檢查 npm
    $npmInstalled = $false
    try {
        $npmVer = npm -v 2>$null
        if ($null -ne $npmVer) {
            Write-Host "[OK] npm 已安裝，版本: $npmVer" -ForegroundColor Green
            $npmInstalled = $true
        }
    } catch {
        Write-Host "[錯誤] 未偵測到 npm。" -ForegroundColor Red
    }

    Write-Host "--------------------------------------------------------------------" -ForegroundColor Gray
    Write-Host "[資訊] 開始還原與檢查各專案的相依套件..." -ForegroundColor Gray
    Write-Host ""

    # 還原後端
    if ($dotnetInstalled) {
        Write-Host "[後端] 正在執行 dotnet restore..." -ForegroundColor Gray
        $BackendPath = Join-Path $PSScriptRoot "backend-dotnet\src\WebApi"
        Push-Location $BackendPath
        dotnet restore
        Pop-Location
        Write-Host "[後端] 還原完成！" -ForegroundColor Green
    }

    # 還原前端
    if ($npmInstalled) {
        # Next.js 前台
        Write-Host "[前台官網] 正在檢查/安裝 Next.js 套件..." -ForegroundColor Gray
        $StorefrontPath = Join-Path $PSScriptRoot "frontend-clients\storefront-nextjs"
        Push-Location $StorefrontPath
        npm install
        Pop-Location
        Write-Host "[前台官網] 安裝/更新完成！" -ForegroundColor Green

        # Angular 後台
        Write-Host "[管理後台] 正在檢查/安裝 Angular 套件..." -ForegroundColor Gray
        $AdminPath = Join-Path $PSScriptRoot "frontend-clients\admin-angular"
        Push-Location $AdminPath
        npm install
        Pop-Location
        Write-Host "[管理後台] 安裝/更新完成！" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "[成功] 所有環境檢查與套件還原作業已完成！" -ForegroundColor Green
    Write-Host ""
}

# 主執行迴圈
do {
    Show-Menu
    $choice = Read-Host "請輸入您的選擇 (1-6)"
    switch ($choice) {
        "1" { Start-AllProjects; Read-Host "按 Enter 鍵返回選單..." }
        "2" { Start-BackendOnly; Read-Host "按 Enter 鍵返回選單..." }
        "3" { Start-StorefrontOnly; Read-Host "按 Enter 鍵返回選單..." }
        "4" { Start-AdminOnly; Read-Host "按 Enter 鍵返回選單..." }
        "5" { Check-Environment; Read-Host "按 Enter 鍵返回選單..." }
        "6" { Write-Host "感謝使用，再見！" -ForegroundColor Yellow; Start-Sleep -Seconds 1 }
        default { Write-Host "無效的選擇，請輸入 1 到 6。" -ForegroundColor Red; Start-Sleep -Seconds 1 }
    }
} while ($choice -ne "6")
