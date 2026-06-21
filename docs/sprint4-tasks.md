# Sprint 4 — Tasks Refinadas

---

## Épico: Administrador

### [ADM-01] Substituir métricas hardcoded do AdminDashboard por dados reais

**Descrição:**
O painel do administrador exibe quatro cards de métricas com valores completamente fictícios. Nenhum endpoint real existe para alimentá-los. As rotas referenciadas nos cards também levam a 404.

**Estado atual (débito técnico — `development`):**
- `frontend/src/pages/AdminDashboard/index.tsx` linhas 23–56: array `dashboardMetrics` com valores hardcoded (`value: 87`, `value: 24`, `value: 156`, `value: 5`).
- As rotas `/admin/ongs`, `/admin/vinculos` e `/admin/notificacoes` referenciadas nos `href` dos cards não existem no router (`frontend/src/router/index.tsx`).
- O backend não possui endpoint `GET /api/admin/metrics`.

**Critérios de Aceite:**
- Criar endpoint `GET /api/admin/metrics` retornando contagens reais: total de ONGs, editais publicados, vínculos ativos e notificações pendentes.
- `AdminDashboard` consome o endpoint e substitui o array `dashboardMetrics` por dados dinâmicos.
- Implementar as rotas `/admin/ongs` e `/admin/vinculos` no router com páginas de listagem reais.
- Exibir skeleton/loading enquanto os dados carregam e mensagem de erro em caso de falha.

---

### [ADM-03] Vitrine de ONGs no Painel do Administrador

**Descrição:**
Criar uma seção de vitrine no painel do administrador exibindo cards das ONGs cadastradas na plataforma para facilitar navegação e descoberta.

**Critérios de Aceite:**
- Exibir cards de ONGs com logo, nome, área de atuação e status (ativa/inativa).
- Permitir filtro por área de atuação e status.
- Card deve linkar para o perfil público da ONG.
- Paginação ou scroll infinito para listas grandes.

---

### [ADM-04] Projetos no Perfil Público da ONG

**Descrição:**
Exibir os projetos cadastrados pela ONG dentro do seu perfil público, permitindo que qualquer visitante (empresa, administrador ou usuário anônimo) conheça o portfólio da organização.

**Critérios de Aceite:**
- No perfil público da ONG (`/ong/publico/:id`), exibir a lista de projetos cadastrados por ela.
- Cada projeto deve exibir nome, status e ODS associados.
- Visitantes não devem poder editar projetos (somente visualizar).

---

### [ADM-05] Completar Exportação de Dados (lista de vínculos)

**Descrição:**
A exportação CSV de ONGs e Empresas já está implementada em `development`. Falta exportar a lista de vínculos estabelecidos entre Empresas e ONGs.

**Estado atual (`development`):**
- `AdminDashboard/index.tsx` linhas 115–126: `handleExport` chama `fetchAllNpos` e `fetchAllCompanies` e gera CSVs via `downloadCsv`. **Implementado.**
- Exportação de vínculos: **não implementada** — sem endpoint e sem botão na UI.

**Critérios de Aceite:**
- Criar endpoint `GET /api/admin/export/vinculos` retornando lista de vínculos com empresa, ONG, projeto e status.
- Adicionar botão de exportação de vínculos na UI do AdminDashboard.
- Manter o comportamento existente de exportação de ONGs e Empresas.

---

### [ADM-06] Notificação de Mediação de Vínculo (SLA de 7 dias)

**Descrição:**
Alertar o administrador automaticamente quando uma ONG não responder a uma solicitação de interesse em um projeto dentro de 7 dias, permitindo mediação.

**Critérios de Aceite:**
- Sistema monitora o tempo desde a criação da solicitação (1º aperto de mão).
- Se permanecer com status "Pendente" por 7 dias corridos, dispara notificação no painel do administrador.
- Notificação deve conter: empresa solicitante, ONG solicitada, nome do projeto e data do pedido.

---

## Épico: ONGs

## Épico: Empresas

### [EMP-01] Remover mocks restantes do CompanyDashboard

**Descrição:**
O dashboard da empresa ainda usa dados fictícios para o nome da empresa exibido no cabeçalho. O restante do ESG já está integrado com a API real.

**Estado atual (débito técnico — `development`):**
- `frontend/src/pages/CompanyDashboard/index.tsx` linha 59: `Bem-vindo de volta, {mockCompanyName}` — importado de `mockData.ts`.
- `mockData.ts` contém o comentário `// TODO(backend): substituir pelo nome da empresa logada.`
- `EsgImpactSection.tsx` ainda importa o tipo `EsgPillar` de `mockData.ts` (acoplamento residual).

**Critérios de Aceite:**
- Substituir `mockCompanyName` pelo nome real da empresa autenticada (via endpoint ou dados do token/perfil).
- Remover `mockData.ts` após eliminar todas as referências restantes.
- `EsgImpactSection.tsx` deve importar o tipo `EsgPillar` de um arquivo de tipos dedicado, não de `mockData.ts`.

---

### [EMP-02] Card de Projetos Apoiados no Dashboard da Empresa

**Descrição:**
Adicionar card "Projetos Apoiados" ao dashboard da empresa, exibindo o total de projetos ativos e a divisão entre Leis de Incentivo e Investimento Privado.

**Critérios de Aceite:**
- Exibir total de projetos apoiados subdividido em "Leis de incentivo" e "Investimento privado".
- Consumir endpoint real.

---

## Épico: Vínculos

> O fluxo de vínculo é sempre atrelado a um Projeto específico e independe de qual ator inicia. O **1º aperto de mão** cobre desde o sinal de interesse até a aceitação/recusa. O **2º aperto de mão** é a confirmação bilateral após a negociação off-line, que efetiva a parceria. Apenas vínculos **Ativos** alimentam o Dashboard de Impacto ESG da empresa.

---

### [VNC-01] Painel "Meus Vínculos"

**Descrição:**
Criar a tela central de gestão de vínculos, acessível por Empresas e ONGs, onde todas as negociações em andamento ficam visíveis e gerenciáveis por status.

**Critérios de Aceite:**
- Tela "Meus Vínculos" acessível pelo menu principal para ambos os perfis.
- Conexões listadas e filtráveis pelos status: **Pendentes**, **Em Negociação** e **Ativos**.
- Cada item exibe: nome do projeto, instituição parceira e status atual.
- Não é permitido envio de mensagens ou chat dentro da plataforma.

---

### [VNC-02] Iniciação do Vínculo (1º Aperto de Mão — envio)

**Descrição:**
Permitir que qualquer uma das partes dê o primeiro passo para uma parceria, sinalizando interesse em um projeto específico. A empresa inicia a partir do perfil da ONG/projeto; a ONG inicia a partir do perfil da empresa.

**Critérios de Aceite:**
- O vínculo deve sempre estar atrelado a um **Projeto** específico — nunca a uma ONG de forma genérica.
- Empresa: botão de interesse disponível no perfil público da ONG ou na página do projeto.
- ONG: botão "Propor Parceria" disponível no perfil da empresa; ao clicar, deve selecionar obrigatoriamente um projeto ativo do seu portfólio.
- O envio altera o status para **"Pendente"** e notifica a outra parte por e-mail.
- Não é permitido envio de mensagens no momento da solicitação (sem chat).

---

### [VNC-03] Resposta ao Interesse e Liberação de Contato (1º Aperto de Mão — resposta)

**Descrição:**
Permitir que a parte receptora aceite ou recuse o interesse recebido. Em caso de aceite, os dados de contato de ambos são revelados para viabilizar a negociação off-line.

**Critérios de Aceite:**
- Botões "Aceitar Contato" e "Recusar" visíveis para vínculos com status **"Pendente"** (somente para o receptor).
- Ao aceitar, o status muda para **"Em Negociação"** e o e-mail/telefone de ambas as partes ficam visíveis mutuamente.
- Ao recusar, o vínculo é encerrado e a outra parte é notificada por e-mail.
- O prazo de resposta é de 7 dias (ver ADM-06 para mediação de expiração).

---

### [VNC-04] Efetivação da Parceria (2º Aperto de Mão)

**Descrição:**
Garantir que o sistema só contabilize dados de impacto no dashboard após ambas as partes confirmarem que a negociação off-line foi bem-sucedida.

**Critérios de Aceite:**
- Botão "Efetivar Parceria" disponível para ambas as partes em vínculos com status **"Em Negociação"**.
- Quando uma parte clica, a outra recebe notificação de confirmação por e-mail.
- Somente após o aceite das duas partes o status muda para **"Ativo"**.
- Apenas vínculos **Ativos** enviam dados métricos do projeto para o Dashboard de Impacto ESG da empresa.

---

## Débitos Técnicos

### [DEBT-01] Bug: `npoId` hardcoded no upload de documentos da ONG

**Descrição:**
O upload de documentos no dashboard da ONG usa `npoId: 1` fixo, ou seja, funciona corretamente apenas para a ONG com ID 1. Para qualquer outra ONG, o documento é associado à entidade errada.

**Localização:** `frontend/src/pages/RoleHomePage/OngDashboardMock.tsx` linha 72.

**Critérios de Aceite:**
- Obter o `npoId` do usuário autenticado (via endpoint `GET /api/me` ou dados do perfil já disponíveis).
- Substituir o valor fixo `npoId: 1` pelo id real da ONG logada.
- Cobrir o cenário com teste.

---

### [DEBT-02] Bug: perfil público da ONG ainda exige autenticação em `development`

**Descrição:**
Em `development`, a rota `/ong/publico/:id` está envolvida em `<ProtectedRoute>`, exigindo login para acessar o perfil público de uma ONG. Isso contraria o requisito de acesso público. A correção foi feita na branch `fix/sprint3-critical-bugs` mas não chegou em `development`.

**Localização:** `frontend/src/router/index.tsx` — verificar o wrapping de `OngPublicProfilePage`.

**Critérios de Aceite:**
- Mover a rota `/ong/publico/:id` para fora do `<ProtectedRoute>` em `development`.
- Garantir que o backend também aceite requisição sem token para `GET /api/npos/{id}` (já corrigido em `fix/sprint3-critical-bugs` — confirmar que o merge traz essa mudança).

---

### [DEBT-03] Rotas admin referenciadas mas inexistentes no router

**Descrição:**
Os MetricCards do AdminDashboard apontam para rotas que não estão cadastradas no router, resultando em 404 ao clicar.

**Localização:**
- `AdminDashboard/index.tsx` linhas 30, 36, 42, 48: hrefs `/admin/ongs`, `/editais` (existe), `/admin/vinculos`, `/admin/notificacoes`.
- `frontend/src/router/index.tsx`: nenhuma das rotas admin além de `/admin/dashboard` está registrada.

**Critérios de Aceite:**
- Implementar rotas `/admin/ongs` e `/admin/vinculos` com páginas reais (pode ser absorvido por ADM-01 e VNC-04).
- Definir destino para `/admin/notificacoes` ou remover o card até a feature existir.

---

*Documento gerado em 2026-06-01 para planejamento da Sprint 4 — baseado em inspeção direta da branch `development`.*
