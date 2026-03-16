# VinculoHubPortal

🚀 Como rodar o projeto
Pre-requisitos
Java 17 ou superior
Node.js 18 ou superior

☕ Backend (Spring Boot)
Navegue até a pasta do backend:
cd backend
Execute o projeto usando o Maven Wrapper:
MAC e Linux: ./mvnw spring-boot:run
Windows: mvnw spring-boot:run
Nota: O projeto iniciará com um erro de DataSource até que o banco de dados seja configurado. Isso é esperado.

⚛️ Frontend (React + Vite)
Navegue até a pasta do frontend:
cd frontend
Instale as dependências rodando npm install
Inicie o servidor de desenvolvimento rodando npm run dev
Acesse: http://localhost:5173/

📊 Cobertura de Testes (JaCoCo)
O JaCoCo é utilizado para medir a porcentagem do código backend que está sendo validada pelos testes unitários.

Como rodar:
Navegue até a pasta do backend e execute:
Mac/Linux: ./mvnw clean test
Windows: mvnw clean test
Onde encontrar o relatório:
O relatório detalhado em HTML será gerado automaticamente em:
backend/target/site/jacoco/index.html

Como abrir:
Mac: open target/site/jacoco/index.html
Windows: Abra o arquivo index.html manualmente em qualquer navegador.