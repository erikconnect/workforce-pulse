#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Vercel Automatic Deployment Setup Script

.DESCRIPTION
    This script sets up automatic deployment to Vercel with MongoDB Atlas integration.
    It configures environment variables and connects your GitHub repository.

.NOTES
    Prerequisites:
    - Vercel CLI installed (npm install -g vercel)
    - Git repository initialized
    - MongoDB Atlas connection string ready
    - Logged into Vercel (vercel login)
#>

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Workforce Pulse - Vercel Deployment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# MongoDB Configuration
# Read from environment — never hardcode credentials in the repo
$MONGODB_URI = $env:MONGODB_URI
if (-not $MONGODB_URI) {
    Write-Host "✗ MONGODB_URI is not set in your environment." -ForegroundColor Red
    Write-Host "  Export it first, e.g.:" -ForegroundColor Yellow
    Write-Host '  $env:MONGODB_URI = "mongodb+srv://USER:PASSWORD@cluster.mongodb.net/workforce-pulse?retryWrites=true&w=majority"' -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ MongoDB URI configured" -ForegroundColor Green
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>$null
    if ($vercelVersion) {
        Write-Host "✓ Vercel CLI installed: $vercelVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Vercel CLI not found" -ForegroundColor Red
    Write-Host "  Install with: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Setting up Vercel project..." -ForegroundColor Yellow
Write-Host ""

# Link to Vercel project (or create new one)
Write-Host "This will link your project to Vercel." -ForegroundColor Cyan
Write-Host "If you don't have a project yet, Vercel will create one." -ForegroundColor Cyan
Write-Host ""

vercel link

Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Yellow

# Set production environment variables
vercel env add MONGODB_URI production --force
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ MONGODB_URI set for production" -ForegroundColor Green
} else {
    Write-Host "Note: You may need to enter the value manually" -ForegroundColor Yellow
}

# Set for preview environment
vercel env add MONGODB_URI preview --force

# Set for development environment
vercel env add MONGODB_URI development --force

# Set NEXT_PUBLIC_USE_STUBS
Write-Host ""
Write-Host "Setting NEXT_PUBLIC_USE_STUBS=false..." -ForegroundColor Yellow
echo "false" | vercel env add NEXT_PUBLIC_USE_STUBS production --force
echo "false" | vercel env add NEXT_PUBLIC_USE_STUBS preview --force
echo "false" | vercel env add NEXT_PUBLIC_USE_STUBS development --force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Connect your GitHub repository to Vercel:" -ForegroundColor White
Write-Host "   - Go to https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "   - Select your project" -ForegroundColor Gray
Write-Host "   - Go to Settings > Git" -ForegroundColor Gray
Write-Host "   - Connect your GitHub repository" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy to production:" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "Or simply push to your main branch for automatic deployment!" -ForegroundColor Cyan
Write-Host ""
