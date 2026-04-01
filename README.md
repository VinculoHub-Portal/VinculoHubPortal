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