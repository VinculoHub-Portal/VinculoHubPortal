# Company Dashboard API

Coleção Bruno de smoke tests para os endpoints usados pela experiência de dashboard da empresa.

Ela roda contra o stack de desenvolvimento do `docker-compose.dev.yml`, usando o backend em
`http://localhost:8088` e o emissor local de JWT em `/dev/token`.

## Como executar

```bash
docker compose -f docker-compose.dev.yml up --build -d
cd backend/docs/api/company-dashboard
bru run --env Local
docker compose -f docker-compose.dev.yml down -v
```

## O que a coleção cobre

- Emissão de tokens locais para `COMPANY`, `NPO` e `ADMIN`
- Listagem das ONGs exibidas na vitrine da empresa (`/api/company/npos`)
- Validação do contrato mínimo consumido pelo `OngShowcaseCard`
- Bloqueios de autorização para `NPO`, `ADMIN` e acesso sem token

## Observação

A coleção é somente leitura. Ela depende do profile `dev`, que semeia a `ONG Dev` e a `Empresa Dev`
usadas pelos testes de fumaça.
