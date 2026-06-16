CREATE TEMP TABLE scenario_user (
    logical_key TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
    user_type TEXT NOT NULL, auth0_id TEXT NOT NULL
) ON COMMIT DROP;
CREATE TEMP TABLE scenario_address (
    logical_key TEXT PRIMARY KEY, state TEXT, state_code CHAR(2), city TEXT, street TEXT,
    number TEXT, zip_code TEXT
) ON COMMIT DROP;
CREATE TEMP TABLE scenario_company (
    logical_key TEXT PRIMARY KEY, user_key TEXT REFERENCES scenario_user(logical_key),
    address_key TEXT REFERENCES scenario_address(logical_key), legal_name TEXT, social_name TEXT,
    description TEXT, cnpj TEXT, phone TEXT
) ON COMMIT DROP;
CREATE TEMP TABLE scenario_npo (
    logical_key TEXT PRIMARY KEY, user_key TEXT REFERENCES scenario_user(logical_key),
    address_key TEXT REFERENCES scenario_address(logical_key), name TEXT, description TEXT,
    npo_size TEXT, cpf TEXT, phone TEXT, environmental BOOLEAN, social BOOLEAN, governance BOOLEAN
) ON COMMIT DROP;
CREATE TEMP TABLE scenario_project (
    logical_key TEXT PRIMARY KEY, npo_key TEXT REFERENCES scenario_npo(logical_key), title TEXT,
    description TEXT, status TEXT, project_type TEXT, budget NUMERIC, invested NUMERIC,
    start_date DATE, end_date DATE, focus_area TEXT, deadline TEXT, beneficiaries INTEGER,
    location TEXT, objective TEXT, progress INTEGER, ods_id INTEGER
) ON COMMIT DROP;
CREATE TEMP TABLE scenario_relationship (
    company_key TEXT REFERENCES scenario_company(logical_key),
    project_key TEXT REFERENCES scenario_project(logical_key), status TEXT, initiator TEXT,
    company_confirmed_at TIMESTAMP, npo_confirmed_at TIMESTAMP, responded_at TIMESTAMP,
    expires_at TIMESTAMP, PRIMARY KEY (company_key, project_key)
) ON COMMIT DROP;
CREATE TEMP TABLE scenario_report (
    logical_key TEXT PRIMARY KEY, npo_key TEXT REFERENCES scenario_npo(logical_key),
    reporter_company_key TEXT REFERENCES scenario_company(logical_key), reason TEXT, status TEXT
) ON COMMIT DROP;
CREATE TEMP TABLE scenario_id_map (
    entity_type TEXT, logical_key TEXT, id BIGINT, PRIMARY KEY (entity_type, logical_key)
) ON COMMIT DROP;
CREATE TEMP TABLE scenario_database_guard ON COMMIT DROP AS
SELECT concat_ws(', ',
    CASE WHEN EXISTS (SELECT 1 FROM address) THEN 'address' END,
    CASE WHEN EXISTS (SELECT 1 FROM company) THEN 'company' END,
    CASE WHEN EXISTS (SELECT 1 FROM npo) THEN 'npo' END, CASE WHEN EXISTS (SELECT 1 FROM project) THEN 'project' END,
    CASE WHEN EXISTS (SELECT 1 FROM project_ods) THEN 'project_ods' END,
    CASE WHEN EXISTS (SELECT 1 FROM company_project) THEN 'company_project' END,
    CASE WHEN EXISTS (SELECT 1 FROM npo_report) THEN 'npo_report' END,
    CASE WHEN EXISTS (SELECT 1 FROM document) THEN 'document' END, CASE WHEN EXISTS (SELECT 1 FROM edital) THEN 'edital' END
) AS populated;

INSERT INTO scenario_user VALUES
('company_empty', 'E2E Empty Company', 'e2e.company.empty@vinculohub.test', 'company', 'auth0|6a3080b7cd92f499f988ff9e'),
('company_active', 'E2E Active Company', 'e2e.company.active@vinculohub.test', 'company', 'auth0|6a3080a930e31f8544d1008c'),
('company_multiple', 'E2E Multiple Company', 'e2e.company.multiple@vinculohub.test', 'company', 'auth0|6a308099cd92f499f988ff8b'),
('npo_projects', 'E2E Projects NPO', 'e2e.npo.projects@vinculohub.test', 'npo', 'auth0|6a308086cd92f499f988ff7b'),
('npo_reported', 'E2E Reported NPO', 'e2e.npo.reported@vinculohub.test', 'npo', 'auth0|6a308065bf0afb7fc359689c');
INSERT INTO scenario_address VALUES
('company_empty', 'Sao Paulo', 'SP', 'Sao Paulo', 'Rua das Flores', '10', '01001-000'),
('company_active', 'Rio Grande do Sul', 'RS', 'Porto Alegre', 'Rua da Industria', '20', '90010-000'),
('company_multiple', 'Parana', 'PR', 'Curitiba', 'Avenida Central', '30', '80010-000'),
('npo_projects', 'Rio de Janeiro', 'RJ', 'Rio de Janeiro', 'Rua da Educacao', '40', '20010-000'),
('npo_reported', 'Bahia', 'BA', 'Salvador', 'Rua da Cidadania', '50', '40010-000');
INSERT INTO scenario_company VALUES
('company_empty', 'company_empty', 'company_empty', 'Empresa Horizonte Ltda', 'Horizonte', 'Empresa sem vinculos.', '11.222.333/0001-81', '1130001000'),
('company_active', 'company_active', 'company_active', 'Empresa Alianca Ltda', 'Alianca', 'Empresa com vinculo ativo.', '12.345.678/0001-95', '5130002000'),
('company_multiple', 'company_multiple', 'company_multiple', 'Empresa Multipla Ltda', 'Multipla', 'Empresa com varios vinculos.', '04.252.011/0001-10', '4130003000');
INSERT INTO scenario_npo VALUES
('npo_projects', 'npo_projects', 'npo_projects', 'Instituto Projetos Vivos', 'ONG com projetos ativos.', 'medium', '529.982.247-25', '2130004000', true, true, false),
('npo_reported', 'npo_reported', 'npo_reported', 'Instituto Cidadania', 'ONG com denuncias registradas.', 'small', '168.995.350-09', '7130005000', false, true, true);
INSERT INTO scenario_project VALUES
('education', 'npo_projects', 'Educacao para Todos', 'Ampliacao do acesso a educacao de qualidade.', 'ACTIVE', 'SOCIAL', 120000, 45000, '2026-01-10', '2026-12-10', 'Educacao', '2026-09-30', 500, 'Rio de Janeiro', 'Atender estudantes da rede publica.', 40, 4),
('climate', 'npo_projects', 'Clima em Acao', 'Formacao comunitaria para resiliencia climatica.', 'ACTIVE', 'ENVIRONMENTAL', 90000, 20000, '2026-02-01', '2026-11-30', 'Clima', '2026-08-31', 300, 'Niteroi', 'Preparar comunidades para eventos climaticos.', 25, 13),
('cities', 'npo_projects', 'Bairros Sustentaveis', 'Melhorias urbanas conduzidas pela comunidade.', 'ACTIVE', 'GOVERNMENTAL', 150000, 60000, '2026-03-01', '2027-02-28', 'Cidades', '2026-10-31', 800, 'Duque de Caxias', 'Fortalecer infraestrutura comunitaria.', 55, 11),
('poverty', 'npo_reported', 'Renda e Autonomia', 'Capacitacao profissional para familias vulneraveis.', 'ACTIVE', 'SOCIAL', 70000, 15000, '2026-01-15', '2026-10-15', 'Renda', '2026-07-31', 200, 'Salvador', 'Promover autonomia financeira.', 30, 1);
INSERT INTO scenario_relationship VALUES
('company_active', 'education', 'active', 'company', '2026-02-03 10:00', '2026-02-04 10:00', '2026-02-02 10:00', '2026-03-02 10:00'),
('company_multiple', 'climate', 'negotiation', 'company', '2026-03-03 10:00', NULL, '2026-03-02 10:00', '2026-04-02 10:00'),
('company_multiple', 'cities', 'pending', 'npo', NULL, NULL, NULL, NULL),
('company_multiple', 'poverty', 'active', 'npo', '2026-04-03 10:00', '2026-04-04 10:00', '2026-04-02 10:00', '2026-05-02 10:00');
INSERT INTO scenario_report VALUES
('report_open', 'npo_reported', 'company_active', 'Informacoes de prestacao de contas precisam de verificacao.', 'OPEN'),
('report_resolved', 'npo_reported', 'company_multiple', 'Documento institucional estava temporariamente indisponivel.', 'RESOLVED');

CREATE TEMP VIEW scenario_catalog_guard AS
SELECT concat_ws(', ',
    CASE WHEN (SELECT count(*) FROM address) <> (SELECT count(*) FROM scenario_address) THEN 'address' END, CASE WHEN (SELECT count(*) FROM company) <> (SELECT count(*) FROM scenario_company) THEN 'company' END,
    CASE WHEN (SELECT count(*) FROM npo) <> (SELECT count(*) FROM scenario_npo) THEN 'npo' END, CASE WHEN (SELECT count(*) FROM project) <> (SELECT count(*) FROM scenario_project) THEN 'project' END,
    CASE WHEN (SELECT count(*) FROM project_ods) <> (SELECT count(*) FROM scenario_project) THEN 'project_ods' END, CASE WHEN (SELECT count(*) FROM company_project) <> (SELECT count(*) FROM scenario_relationship) THEN 'company_project' END,
    CASE WHEN (SELECT count(*) FROM npo_report) <> (SELECT count(*) FROM scenario_report) THEN 'npo_report' END,
    CASE WHEN EXISTS (SELECT 1 FROM scenario_company s LEFT JOIN company c ON c.cnpj = s.cnpj
        LEFT JOIN scenario_user su ON su.logical_key = s.user_key LEFT JOIN users u ON u.id = c.user_id
        WHERE c.id IS NULL OR lower(u.email) <> lower(su.email)) THEN 'company data' END,
    CASE WHEN EXISTS (SELECT 1 FROM scenario_npo s LEFT JOIN npo n ON n.cpf = s.cpf
        LEFT JOIN scenario_user su ON su.logical_key = s.user_key LEFT JOIN users u ON u.id = n.user_id
        WHERE n.id IS NULL OR lower(u.email) <> lower(su.email)) THEN 'npo data' END,
    CASE WHEN EXISTS (SELECT 1 FROM scenario_project s LEFT JOIN npo n ON n.cpf = (SELECT cpf FROM scenario_npo WHERE logical_key = s.npo_key) LEFT JOIN project p ON p.title = s.title AND p.npo_id = n.id
        WHERE p.id IS NULL OR p.status <> s.status OR p.progress <> s.progress) THEN 'project data' END,
    CASE WHEN EXISTS (SELECT 1 FROM scenario_project s LEFT JOIN project p ON p.title = s.title
        LEFT JOIN project_ods po ON po.project_id = p.id AND po.ods_id = s.ods_id
        WHERE po.project_id IS NULL) THEN 'project_ods data' END,
    CASE WHEN EXISTS (SELECT 1 FROM scenario_relationship s LEFT JOIN company c ON c.cnpj = (SELECT cnpj FROM scenario_company WHERE logical_key = s.company_key)
        LEFT JOIN project p ON p.title = (SELECT title FROM scenario_project WHERE logical_key = s.project_key) LEFT JOIN company_project cp ON cp.company_id = c.id AND cp.project_id = p.id
        WHERE cp.company_id IS NULL OR cp.status::text <> s.status) THEN 'company_project data' END,
    CASE WHEN EXISTS (SELECT 1 FROM scenario_report s LEFT JOIN npo_report r ON r.reason = s.reason
        WHERE r.id IS NULL OR r.status <> s.status) THEN 'npo_report data' END
) AS mismatches;
