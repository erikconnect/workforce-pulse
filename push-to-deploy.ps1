#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick Git Push for Auto-Deploy to Vercel

.DESCRIPTION
    Since your GitHub repo is already connected to Vercel,
    this script commits and pushes changes to trigger automatic deployment.
#>

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Workforce Pulse - Auto-Deploy via GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check git status
Write-Host "Checking for changes..." -ForegroundColor Yellow
$status = git status --porcelain

if (-not $status) {
    Write-Host "No changes to commit." -ForegroundColor Green
    Write-Host ""
    exit 0
}

Write-Host "Changes detected:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Add all changes
Write-Host "Adding changes..." -ForegroundColor Yellow
git add .

# Prompt for commit message
Write-Host "Enter commit message (or press Enter for default):" -ForegroundColor Cyan
$message = Read-Host
if (-not $message) {
    $message = "Configure MongoDB Atlas and update deployment setup"
}

# Commit
Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m $message

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Commit failed" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Changes committed" -ForegroundColor Green
Write-Host ""

# Get current branch
$branch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $branch" -ForegroundColor Cyan
Write-Host ""

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "This will trigger automatic deployment to Vercel!" -ForegroundColor Cyan
Write-Host ""

git push origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Push Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vercel is now automatically deploying your changes!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor Gray
    Write-Host "2. Watch the deployment progress" -ForegroundColor Gray
    Write-Host "3. Make sure environment variables are set:" -ForegroundColor Gray
    Write-Host "   - MONGODB_URI" -ForegroundColor Yellow
    Write-Host "   - NEXT_PUBLIC_USE_STUBS" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If env vars are missing, add them in:" -ForegroundColor Cyan
    Write-Host "Settings > Environment Variables > Add Variable" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Deployment typically takes 2-3 minutes" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Push failed" -ForegroundColor Red
    Write-Host "Check your Git configuration and network connection" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
