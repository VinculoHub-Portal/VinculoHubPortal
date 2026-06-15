# VinculoHubPortal

## 🚀 Como rodar o projeto

### Pré-requisitos
Para rodar a aplicação completa de forma simples, você precisará ter instalado:
- **Docker** e **Docker Compose**

*(Caso deseje rodar a aplicação manualmente sem o Docker, você precisará de Java 17+ e Node.js 18+).*

---

### 🪝Configuração do Git Hooks

Os git hooks são scripts executados automaticamente em eventos do git. O `pre-push` roda antes de cada push e garante que o código do backend passe pelo Spotless (formatação) e PMD (análise estática) antes de ser enviado ao repositório.

Para configurar, rode o comando abaixo na raiz do projeto:
```bash
bash githooks/setup
```

### ⚙️ Configuração de Variáveis de Ambiente
Antes de rodar o projeto, copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com as credenciais desejadas. Os valores padrão já funcionam para desenvolvimento local.

---

## 🐳 Rodando com Docker Compose (Recomendado)

A maneira mais fácil e rápida de subir toda a aplicação (Banco de Dados + Backend + Frontend) é utilizando o Docker Compose na raiz do projeto.

1. Navegue até a pasta raiz do projeto (`VinculoHubPortal`).
2. Execute o seguinte comando:
   ```bash
   docker compose up -d --build
   ```

A aplicação estará disponível em:
- **Frontend:** http://localhost (ou http://localhost:80)
- **Backend API:** http://localhost:8080
- **Banco de Dados:** `localhost:5432`

Para parar todos os serviços, execute: `docker compose down`.

---

## Cenários de dados para desenvolvimento e E2E

O compose principal pode carregar um catálogo fixo de empresas, ONGs, projetos, vínculos e
denúncias em um banco funcionalmente vazio. A carga é opcional:

```dotenv
APP_TEST_SCENARIOS_ENABLED=true
```

Antes de subir a aplicação, devem existir na tabela `users`, com os tipos indicados, as contas:

- `e2e.company.empty@vinculohub.test` (`company`)
- `e2e.company.active@vinculohub.test` (`company`)
- `e2e.company.multiple@vinculohub.test` (`company`)
- `e2e.npo.projects@vinculohub.test` (`npo`)
- `e2e.npo.reported@vinculohub.test` (`npo`)

Esses usuários também devem corresponder às contas de teste mantidas no Auth0. A feature apenas
resolve os registros locais por e-mail: não chama a Management API, não cria e não atualiza usuários
no Auth0.

O catálogo inclui empresa sem vínculo, empresa com vínculo ativo, empresa com múltiplos vínculos,
ONG com três projetos ativos e ONG com duas denúncias. A carga inteira ocorre em uma transação e
falha sem persistir dados quando falta um usuário, seu tipo é incompatível ou alguma tabela funcional
já contém registros. Para recriar o ambiente, use um banco vazio e execute `docker compose up`.

---

## 🛠️ Rodando Manualmente (Sem Docker)

Se preferir rodar os serviços individualmente para desenvolvimento mais focado:

### ☕ Backend (Spring Boot)
1. Certifique-se de ter um banco PostgreSQL rodando localmente (ou use `docker compose up db -d` para subir apenas o banco).
2. Navegue até a pasta do backend: `cd backend`
3. Execute o projeto usando o Maven Wrapper:
   - **Mac/Linux:** `./mvnw spring-boot:run`
   - **Windows:** `mvnw spring-boot:run`

### ⚛️ Frontend (React + Vite)
1. Navegue até a pasta do frontend: `cd frontend`
2. Instale as dependências rodando: `npm install`
3. Inicie o servidor de desenvolvimento rodando: `npm run dev`
4. Acesse: http://localhost:5173/

---

## 🧪 Testes

### Unitários — Frontend (Vitest)

Rodam sem precisar do Docker, diretamente na pasta `frontend`:

```bash
cd frontend
npm run test:run          # roda uma vez e sai
npm run test              # modo watch
```

### Unitários — Backend (JUnit)

```bash
cd backend
./mvnw test               # Mac/Linux
mvnw test                 # Windows
```

### E2E — Playwright

**Pré-requisito:** Docker Compose rodando com a aplicação completa.

```bash
docker compose up -d --build   # sobe frontend + backend + banco
```

Depois, na pasta `frontend`:

```bash
cd frontend
npm run test:e2e          # headless (CI)
npm run test:e2e:ui       # abre o Playwright UI para depurar visualmente
```

Os testes cobrem:
- Landing page pública (título, sem redirect)
- Rotas protegidas redirecionam para Auth0 (`/ong/*`, `/empresa/*`, `/admin/*`, `/editais`)
- Rota pública `/ong/publico/:id` acessível sem login
- Segurança de API: endpoints protegidos retornam 401 sem token
- Endpoints públicos (`GET /api/editais`, `GET /public/ping`) retornam 200

---

## 📬 API de Vínculos — Swagger e coleção Bruno

A API do épico **Vínculos** (`/api/relationships`) pode ser explorada de duas formas.

### Swagger / OpenAPI (app rodando)
- UI interativa: **http://localhost:8080/swagger-ui.html**
- Spec OpenAPI (JSON): **http://localhost:8080/v3/api-docs**

Clique em **Authorize** e cole um JWT (`Bearer`) para chamar os endpoints autenticados. A mesma spec
pode ser importada no Postman/Insomnia (Import → URL → `/v3/api-docs`).

### Coleção Bruno
A coleção fica versionada em `backend/docs/api/vinculos/` (arquivos `.bru`, amigáveis ao git) e cobre
o ciclo completo (criar interesse → aceitar → efetivar → ativo).

**Opção 1 — app desktop ([Bruno](https://www.usebruno.com/)):**
1. Abra a pasta `backend/docs/api/vinculos` no Bruno.
2. Selecione o environment **Local** e preencha `bearerToken` com um JWT válido.
3. Rode as requisições na ordem `01 → 05`.

**Opção 2 — CLI:**
```bash
npm i -g @usebruno/cli
cd backend/docs/api/vinculos
bru run --env Local --env-var bearerToken=<jwt>
```

### Como obter um `bearerToken` sem Auth0 (profile dev)
Existe um stack de desenvolvimento com **auth local** (sem Auth0): ele assina o JWT localmente,
expõe um emissor de tokens em `/dev/token` e semeia dados de exemplo (Empresa + ONG + Projeto).

```bash
# sobe Postgres + backend no profile dev (porta 8088)
docker compose -f docker-compose.dev.yml up --build -d

# emite um token (note o %7C, que é o "|" url-encodado)
curl "http://localhost:8088/dev/token?sub=dev%7Ccompany&roles=COMPANY"   # empresa
curl "http://localhost:8088/dev/token?sub=dev%7Cnpo&roles=NPO"           # ONG
```
Copie o `access_token` da resposta e use como `bearerToken` no Bruno (ou no `Authorize` do Swagger).
Para encerrar: `docker compose -f docker-compose.dev.yml down -v`.

> ⚠️ O profile `dev` e o `/dev/token` existem **apenas para desenvolvimento**. Em produção o app roda
> no profile padrão, que continua validando JWTs reais do Auth0.

---

## 📊 Cobertura de Testes (JaCoCo)
O JaCoCo é utilizado para medir a porcentagem do código backend que está sendo validada pelos testes unitários.

**Como rodar:**
Navegue até a pasta do backend e execute:
- **Mac/Linux:** `./mvnw clean test`
- **Windows:** `mvnw clean test`

**Onde encontrar o relatório:**
O relatório detalhado em HTML será gerado automaticamente em: `backend/target/site/jacoco/index.html`

**Como abrir:**
- **Mac:** `open target/site/jacoco/index.html`
- **Windows:** Abra o arquivo `index.html` manualmente em qualquer navegador.
