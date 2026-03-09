#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick deployment script for Vercel

.DESCRIPTION
    Deploys the application to Vercel production with all configurations
#>

Write-Host "🚀 Deploying Workforce Pulse to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "⚠️  Not a git repository. Initializing..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - Workforce Pulse application"
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Uncommitted changes detected. Committing..." -ForegroundColor Yellow
    git add .
    git commit -m "Update configuration for deployment"
    Write-Host "✓ Changes committed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Deploy to production
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✨ Deployment Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your application is now live!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Visit your deployment URL" -ForegroundColor Gray
    Write-Host "2. Test the APIs:" -ForegroundColor Gray
    Write-Host "   - /api/skills" -ForegroundColor Gray
    Write-Host "   - /api/jobs/stats" -ForegroundColor Gray
    Write-Host "   - /api/jobs/aggregate" -ForegroundColor Gray
    Write-Host ""
    Write-Host "For automatic deployments, connect your GitHub repo in Vercel dashboard" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
