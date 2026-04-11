#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Cria arquivos de migration do Flyway com timestamp.
    Funciona no PowerShell (Windows/Linux/Mac) e no Bash (via polyglot trick).
 
.USAGE
    PowerShell:  ./create-migration.ps1 criar_tabela_usuarios
    Bash:        bash create-migration.ps1 criar_tabela_usuarios
 
    Com diretório customizado:
    PowerShell:  ./create-migration.ps1 criar_tabela_usuarios -Dir "src/main/resources/db/migration"
    Bash:        bash create-migration.ps1 criar_tabela_usuarios src/main/resources/db/migration
#>
 
# ===== POWERSHELL SECTION =====
param(
    [Parameter(Position=0)]
    [string]$Name,
    [Alias("Dir")]
    [string]$MigrationDir = "src/main/resources/db/migration"
)
 
if (-not $Name) {
    Write-Host ""
    Write-Host "  Uso: ./create-migration.ps1 <descricao> [-Dir <diretorio>]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Exemplo:" -ForegroundColor Gray
    Write-Host "    ./create-migration.ps1 criar_tabela_usuarios" -ForegroundColor Gray
    Write-Host "    ./create-migration.ps1 adicionar_coluna_email -Dir src/main/resources/db/migration" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
 
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$fileName = "V${timestamp}__${Name}.sql"
 
if (-not (Test-Path $MigrationDir)) {
    New-Item -ItemType Directory -Path $MigrationDir -Force | Out-Null
}
 
$filePath = Join-Path $MigrationDir $fileName
New-Item -ItemType File -Path $filePath -Force | Out-Null
 
Write-Host ""
Write-Host "  Migration criada com sucesso!" -ForegroundColor Green
Write-Host "  -> $filePath" -ForegroundColor Cyan
Write-Host ""
 
exit 0
