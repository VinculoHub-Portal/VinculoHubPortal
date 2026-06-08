# Vínculos — API docs

Backend do épico **Vínculos** (VNC-01..04). Duas formas de explorar a API:

## Swagger / OpenAPI
Com a aplicação rodando (`./mvnw spring-boot:run`):
- UI interativa: http://localhost:8080/swagger-ui.html
- Spec OpenAPI (JSON): http://localhost:8080/v3/api-docs

Clique em **Authorize** e cole um JWT (Bearer) para chamar os endpoints autenticados.
A spec também pode ser importada no Postman/Insomnia (Import → URL → `/v3/api-docs`).

## Bruno
Esta pasta é uma coleção [Bruno](https://www.usebruno.com/) (arquivos `.bru`, versionáveis em git).

**App desktop:**
1. Abra a pasta `docs/api/vinculos` no Bruno.
2. Selecione o environment **Local** e preencha `bearerToken` com um JWT válido.
3. Execute as requisições na ordem (01 → 05) para percorrer o ciclo completo:
   criar interesse → aceitar → ambas as partes efetivam → status `active`.

**CLI:**
```bash
npm i -g @usebruno/cli
bru run --env Local --env-var bearerToken=<jwt>   # rode dentro de docs/api/vinculos
```

Ajuste `companyId`/`projectId` nas URLs e no corpo conforme os dados do seu ambiente.

## Como obter um `bearerToken` (sem Auth0)
Suba o stack de desenvolvimento (auth local) na raiz do projeto e emita um token:
```bash
docker compose -f docker-compose.dev.yml up --build -d
curl "http://localhost:8088/dev/token?sub=dev%7Ccompany&roles=COMPANY"   # empresa (seed: company/project id 1)
curl "http://localhost:8088/dev/token?sub=dev%7Cnpo&roles=NPO"           # ONG
```
Copie o `access_token` da resposta para o `bearerToken`. O `%7C` é o `|` url-encodado (sem isso o
Tomcat responde 400). O profile `dev` semeia uma Empresa, uma ONG e um Projeto automaticamente.
