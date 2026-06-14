# Sample data CSV contract

This directory defines the input contract for the application's optional sample-data seed.
The CSV files intentionally contain headers only. Business scenarios will be added in separate
stories after the seed infrastructure is complete.

## General conventions

- Encoding: UTF-8.
- Delimiter: comma.
- Header names are case-sensitive.
- Logical keys use lowercase `snake_case` and must be unique inside each entity file.
- Relationships reference logical keys instead of generated database IDs.
- Empty cells represent optional values.
- Dates use ISO-8601 `YYYY-MM-DD`.
- Date-times use ISO-8601 `YYYY-MM-DDTHH:mm:ss`.
- Decimal values use a dot as the decimal separator and no currency symbol.
- Boolean values are `true` or `false`.
- Enum values must match the Java enum constants exactly.

## Files

### `users.csv`

| Column | Required | Description |
| --- | --- | --- |
| `key` | yes | Logical user key. |
| `name` | yes | Local display name. |
| `email` | yes | Exact email used to locate the existing Auth0 account. |
| `user_type` | yes | `admin`, `npo`, or `company`. |

The seed resolves the Auth0 `user_id`; it is not supplied by the CSV.

The Auth0 Machine-to-Machine application used by the seed needs `read:users` permission for the
tenant Management API. The seed validates existing accounts only; it never creates or updates Auth0
users.

### `addresses.csv`

| Column | Required | Description |
| --- | --- | --- |
| `key` | yes | Logical address key. |
| `state` | no | State name. |
| `state_code` | no | Two-character state code. |
| `city` | no | City name. |
| `street` | no | Street name. |
| `number` | no | Street number. |
| `complement` | no | Address complement. |
| `zip_code` | no | Postal code. |

### `companies.csv`

| Column | Required | Description |
| --- | --- | --- |
| `key` | yes | Logical company key. |
| `user_key` | yes | Reference to `users.csv`. |
| `address_key` | no | Reference to `addresses.csv`. |
| `legal_name` | no | Registered legal name. |
| `social_name` | no | Public or trade name. |
| `description` | no | Company description. |
| `logo_url` | no | Public logo URL. |
| `cnpj` | no | CNPJ value. |
| `phone` | no | Contact phone. |

### `npos.csv`

| Column | Required | Description |
| --- | --- | --- |
| `key` | yes | Logical NPO key. |
| `user_key` | yes | Reference to `users.csv`. |
| `address_key` | no | Reference to `addresses.csv`. |
| `name` | yes | NPO name. |
| `description` | no | Institutional description. |
| `logo_url` | no | Public logo URL. |
| `npo_size` | yes | `small`, `medium`, or `large`. |
| `cnpj` | conditional | Valid CNPJ; at least CPF or CNPJ must be supplied. |
| `cpf` | conditional | Valid CPF; at least CPF or CNPJ must be supplied. |
| `phone` | no | Contact phone. |
| `environmental` | yes | Environmental ESG flag. |
| `social` | yes | Social ESG flag. |
| `governance` | yes | Governance ESG flag. |

At least one ESG flag must be `true`. CPF and CNPJ are normalized to digits before persistence.

### `projects.csv`

| Column | Required | Description |
| --- | --- | --- |
| `key` | yes | Logical project key. |
| `npo_key` | yes | Reference to `npos.csv`. |
| `title` | yes | Project title. |
| `description` | yes | Project description, from 50 through 500 characters. |
| `status` | yes | `ACTIVE`, `COMPLETED`, or `CANCELLED`. |
| `type` | yes | A `ProjectType` enum constant. |
| `budget_needed` | no | Non-negative requested budget. |
| `invested_amount` | no | Non-negative amount already invested. |
| `start_date` | no | Project start date. |
| `end_date` | no | Project end date. |
| `focus_area` | no | Project focus area. |
| `fundraising_deadline` | no | Human-readable fundraising deadline. |
| `beneficiaries_count` | no | Number of beneficiaries. |
| `location` | no | Project location. |
| `main_objective` | no | Main objective. |
| `progress` | yes | Integer from 0 through 100. |

### `project_ods.csv`

| Column | Required | Description |
| --- | --- | --- |
| `project_key` | yes | Reference to `projects.csv`. |
| `ods_id` | yes | Existing ODS catalog ID. |

Every project must reference at least one existing ODS.

### `company_projects.csv`

| Column | Required | Description |
| --- | --- | --- |
| `company_key` | yes | Reference to `companies.csv`. |
| `project_key` | yes | Reference to `projects.csv`. |
| `status` | yes | `pending`, `negotiation`, `active`, or `inactive`. |
| `initiator_type` | yes | `company` or `npo`. |
| `company_confirmed_at` | conditional | Company confirmation date-time. |
| `npo_confirmed_at` | conditional | NPO confirmation date-time. |
| `responded_at` | conditional | First-handshake response date-time. |
| `expires_at` | no | Pending relationship expiration date-time. |

### `npo_reports.csv`

| Column | Required | Description |
| --- | --- | --- |
| `key` | yes | Logical report key. |
| `npo_key` | yes | Reference to `npos.csv`. |
| `reporter_company_key` | yes | Reference to `companies.csv`. |
| `reason` | yes | Report reason, from 10 through 1000 characters. |
| `status` | yes | A `NpoReportStatus` enum constant. |

The reporter user is derived from `reporter_company_key`; it is not repeated in the CSV.

## Docker Compose

The repository copy intentionally remains header-only. To run a populated dataset, copy this
directory outside `backend/src/main/resources`, add scenario rows, and point
`APP_SAMPLE_DATA_HOST_PATH` to that directory. Docker mounts it at `/sample-data` as read-only and
the backend reads it from `file:/sample-data`.

The required environment variables are documented in the root `.env.example`. Keep
`APP_SAMPLE_DATA_ENABLED=false` unless the database is disposable and the Auth0 Management API
credentials are configured.
