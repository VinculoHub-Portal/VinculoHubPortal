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
| `cnpj` | conditional | CNPJ, mutually exclusive with CPF. |
| `cpf` | conditional | CPF, mutually exclusive with CNPJ. |
| `phone` | no | Contact phone. |
| `environmental` | yes | Environmental ESG flag. |
| `social` | yes | Social ESG flag. |
| `governance` | yes | Governance ESG flag. |

### `projects.csv`

| Column | Required | Description |
| --- | --- | --- |
| `key` | yes | Logical project key. |
| `npo_key` | yes | Reference to `npos.csv`. |
| `title` | yes | Project title. |
| `description` | yes | Project description. |
| `status` | yes | `ACTIVE`, `COMPLETED`, or `CANCELLED`. |
| `type` | no | A `ProjectType` enum constant. |
| `budget_needed` | no | Requested budget. |
| `invested_amount` | no | Amount already invested. |
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
| `reporter_user_key` | yes | Reference to `users.csv`. |
| `reason` | yes | Report reason. |
| `status` | yes | A `NpoReportStatus` enum constant. |
