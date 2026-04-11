#!/bin/bash
# =============================================================
# Cria arquivos de migration do Flyway com timestamp
# Funciona no Bash (Linux/Mac) e Git Bash / WSL no Windows
#
# Uso:
#   ./create-migration.sh criar_tabela_usuarios
#   ./create-migration.sh criar_tabela_usuarios src/main/resources/db/migration
# =============================================================
 
NAME="$1"
MIGRATION_DIR="${2:-src/main/resources/db/migration}"
 
if [ -z "$NAME" ]; then
    echo ""
    echo "  Uso: ./create-migration.sh <descricao> [diretorio]"
    echo ""
    echo "  Exemplo:"
    echo "    ./create-migration.sh criar_tabela_usuarios"
    echo "    ./create-migration.sh adicionar_coluna_email src/main/resources/db/migration"
    echo ""
    exit 1
fi
 
TIMESTAMP=$(date +%Y%m%d%H%M%S)
FILENAME="V${TIMESTAMP}__${NAME}.sql"
 
mkdir -p "$MIGRATION_DIR"
 
FILEPATH="${MIGRATION_DIR}/${FILENAME}"
touch "$FILEPATH"
 
echo ""
echo "  Migration criada com sucesso!"
echo "  -> $FILEPATH"
echo ""
