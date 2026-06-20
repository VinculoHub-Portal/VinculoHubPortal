# Admin Dashboard API

Coleção Bruno legada base de smoke tests dos endpoints usados pelo `AdminDashboard`.

Ela roda contra o stack de desenvolvimento do `docker-compose.dev.yml`, usando o backend em
`http://localhost:8088` e o emissor local de JWT em `/dev/token`.

## Como executar

```bash
docker compose -f docker-compose.dev.yml up --build -d
cd backend/docs/api/admin-dashboard
bru run --env Local
docker compose -f docker-compose.dev.yml down -v
```

## O que a coleção cobre

- Emissão de tokens locais para `ADMIN`, `COMPANY` e `NPO`
- Descoberta da ONG semeada no profile `dev`
- Exportação de ONGs e empresas
- Criação e atualização de denúncia
- Listagem de denúncias abertas e resolvidas
- Bloqueios de autorização para rotas administrativas com COMPANY, NPO e sem token

## Observação

A coleção é mutável: ela cria uma denúncia durante a execução e depois atualiza o status. Use o
stack limpo do `docker-compose.dev.yml` para repetir a execução sem ruído de dados antigos.
