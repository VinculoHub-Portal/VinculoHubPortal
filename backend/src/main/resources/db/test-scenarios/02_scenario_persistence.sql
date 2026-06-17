INSERT INTO scenario_id_map
SELECT 'address', logical_key, nextval(pg_get_serial_sequence('address', 'id')) FROM scenario_address
UNION ALL SELECT 'company', logical_key, nextval(pg_get_serial_sequence('company', 'id')) FROM scenario_company
UNION ALL SELECT 'npo', logical_key, nextval(pg_get_serial_sequence('npo', 'id')) FROM scenario_npo
UNION ALL SELECT 'project', logical_key, nextval(pg_get_serial_sequence('project', 'id')) FROM scenario_project;

INSERT INTO address (id, state, state_code, city, street, number, zip_code, created_at, updated_at)
SELECT ids.id, s.state, s.state_code, s.city, s.street, s.number, s.zip_code,
       '2026-01-01 09:00', '2026-01-01 09:00'
FROM scenario_address s JOIN scenario_id_map ids
  ON ids.entity_type = 'address' AND ids.logical_key = s.logical_key;

INSERT INTO company (id, user_id, address_id, legal_name, social_name, description, cnpj, phone, created_at, updated_at)
SELECT ids.id, u.id, address_ids.id, s.legal_name, s.social_name, s.description, s.cnpj,
       s.phone, '2026-01-01 09:00', '2026-01-01 09:00'
FROM scenario_company s
JOIN scenario_id_map ids ON ids.entity_type = 'company' AND ids.logical_key = s.logical_key
JOIN scenario_id_map address_ids ON address_ids.entity_type = 'address' AND address_ids.logical_key = s.address_key
JOIN scenario_user su ON su.logical_key = s.user_key
JOIN users u ON lower(u.email) = lower(su.email);

INSERT INTO npo (id, user_id, address_id, name, description, npo_size, cpf, phone,
                 environmental, social, governance, created_at, updated_at)
SELECT ids.id, u.id, address_ids.id, s.name, s.description, s.npo_size::npo_size, s.cpf,
       s.phone, s.environmental, s.social, s.governance, '2026-01-01 09:00', '2026-01-01 09:00'
FROM scenario_npo s
JOIN scenario_id_map ids ON ids.entity_type = 'npo' AND ids.logical_key = s.logical_key
JOIN scenario_id_map address_ids ON address_ids.entity_type = 'address' AND address_ids.logical_key = s.address_key
JOIN scenario_user su ON su.logical_key = s.user_key
JOIN users u ON lower(u.email) = lower(su.email);

INSERT INTO project (id, npo_id, title, description, status, project_type, budget_needed,
                     invested_amount, start_date, end_date, focus_area, fundraising_deadline,
                     beneficiaries_count, location, main_objective, progress, created_at, updated_at)
SELECT ids.id, npo_ids.id, s.title, s.description, s.status, s.project_type, s.budget, s.invested,
       s.start_date, s.end_date, s.focus_area, s.deadline, s.beneficiaries, s.location,
       s.objective, s.progress, '2026-01-01 09:00', '2026-01-01 09:00'
FROM scenario_project s
JOIN scenario_id_map ids ON ids.entity_type = 'project' AND ids.logical_key = s.logical_key
JOIN scenario_id_map npo_ids ON npo_ids.entity_type = 'npo' AND npo_ids.logical_key = s.npo_key;

INSERT INTO project_ods (project_id, ods_id)
SELECT ids.id, s.ods_id FROM scenario_project s JOIN scenario_id_map ids
  ON ids.entity_type = 'project' AND ids.logical_key = s.logical_key;

INSERT INTO company_project (company_id, project_id, status, initiator_type, company_confirmed_at,
                             npo_confirmed_at, responded_at, expires_at, created_at, updated_at)
SELECT company_ids.id, project_ids.id, s.status::relationship_status, s.initiator::initiator_type,
       s.company_confirmed_at, s.npo_confirmed_at, s.responded_at, s.expires_at,
       '2026-01-01 09:00', '2026-01-01 09:00'
FROM scenario_relationship s
JOIN scenario_id_map company_ids
  ON company_ids.entity_type = 'company' AND company_ids.logical_key = s.company_key
JOIN scenario_id_map project_ids
  ON project_ids.entity_type = 'project' AND project_ids.logical_key = s.project_key;

INSERT INTO npo_report (npo_id, reporter_company_id, reporter_user_id, reason, status, created_at, updated_at)
SELECT npo_ids.id, company_ids.id, c.user_id, s.reason, s.status,
       '2026-05-01 09:00', '2026-05-01 09:00'
FROM scenario_report s
JOIN scenario_id_map npo_ids ON npo_ids.entity_type = 'npo' AND npo_ids.logical_key = s.npo_key
JOIN scenario_id_map company_ids
  ON company_ids.entity_type = 'company' AND company_ids.logical_key = s.reporter_company_key
JOIN company c ON c.id = company_ids.id;
