/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import com.vinculohub.backend.model.enums.InitiatorType;
import com.vinculohub.backend.model.enums.NpoReportStatus;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.model.enums.UserType;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.function.Function;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

@Component
public class SampleDataDatasetReader {

    private static final CSVFormat CSV_FORMAT =
            CSVFormat.DEFAULT
                    .builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreEmptyLines(true)
                    .setTrim(true)
                    .build();

    private final ResourceLoader resourceLoader;

    public SampleDataDatasetReader(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    public LoadedSampleDataDataset read(String location) {
        MessageDigest digest = sha256();
        SampleDataDataset dataset =
                new SampleDataDataset(
                        read(location, SampleDataCsvFile.USERS, digest, this::user),
                        read(location, SampleDataCsvFile.ADDRESSES, digest, this::address),
                        read(location, SampleDataCsvFile.COMPANIES, digest, this::company),
                        read(location, SampleDataCsvFile.NPOS, digest, this::npo),
                        read(location, SampleDataCsvFile.PROJECTS, digest, this::project),
                        read(location, SampleDataCsvFile.PROJECT_ODS, digest, this::projectOds),
                        read(
                                location,
                                SampleDataCsvFile.COMPANY_PROJECTS,
                                digest,
                                this::companyProject),
                        read(location, SampleDataCsvFile.NPO_REPORTS, digest, this::npoReport));
        return new LoadedSampleDataDataset(dataset, HexFormat.of().formatHex(digest.digest()));
    }

    private <T> List<SeedRow<T>> read(
            String location,
            SampleDataCsvFile file,
            MessageDigest digest,
            Function<SeedCsvRecord, T> mapper) {
        Resource resource = resourceLoader.getResource(resourcePath(location, file.fileName()));
        if (!resource.exists()) {
            throw new SeedDatasetException("Required seed file is missing: " + file.fileName());
        }

        try (InputStream inputStream = resource.getInputStream()) {
            byte[] bytes = inputStream.readAllBytes();
            digest.update(file.fileName().getBytes(StandardCharsets.UTF_8));
            digest.update(bytes);
            return parse(file, bytes, mapper);
        } catch (IOException exception) {
            throw new SeedDatasetException(
                    "Could not read seed file: " + file.fileName(), exception);
        }
    }

    private <T> List<SeedRow<T>> parse(
            SampleDataCsvFile file, byte[] bytes, Function<SeedCsvRecord, T> mapper)
            throws IOException {
        try (CSVParser parser =
                CSV_FORMAT.parse(new StringReader(new String(bytes, StandardCharsets.UTF_8)))) {
            if (!parser.getHeaderNames().equals(file.headers())) {
                throw new SeedDatasetException(
                        "%s:1 headers must be exactly %s"
                                .formatted(file.fileName(), String.join(",", file.headers())));
            }

            List<SeedRow<T>> rows = new ArrayList<>();
            for (CSVRecord csvRecord : parser) {
                SeedCsvRecord record = new SeedCsvRecord(file.fileName(), csvRecord);
                rows.add(new SeedRow<>(record.source(), mapper.apply(record)));
            }
            return rows;
        }
    }

    private UserSeedRow user(SeedCsvRecord row) {
        return new UserSeedRow(
                row.logicalKey("key"),
                row.requiredText("name"),
                row.requiredText("email"),
                row.requiredEnum("user_type", UserType.class));
    }

    private AddressSeedRow address(SeedCsvRecord row) {
        return new AddressSeedRow(
                row.logicalKey("key"),
                row.optionalText("state"),
                row.optionalText("state_code"),
                row.optionalText("city"),
                row.optionalText("street"),
                row.optionalText("number"),
                row.optionalText("complement"),
                row.optionalText("zip_code"));
    }

    private CompanySeedRow company(SeedCsvRecord row) {
        return new CompanySeedRow(
                row.logicalKey("key"),
                row.logicalKey("user_key"),
                row.optionalLogicalKey("address_key"),
                row.optionalText("legal_name"),
                row.optionalText("social_name"),
                row.optionalText("description"),
                row.optionalText("logo_url"),
                row.optionalText("cnpj"),
                row.optionalText("phone"));
    }

    private NpoSeedRow npo(SeedCsvRecord row) {
        return new NpoSeedRow(
                row.logicalKey("key"),
                row.logicalKey("user_key"),
                row.optionalLogicalKey("address_key"),
                row.requiredText("name"),
                row.optionalText("description"),
                row.optionalText("logo_url"),
                row.requiredEnum("npo_size", NpoSize.class),
                row.optionalText("cnpj"),
                row.optionalText("cpf"),
                row.optionalText("phone"),
                row.requiredBoolean("environmental"),
                row.requiredBoolean("social"),
                row.requiredBoolean("governance"));
    }

    private ProjectSeedRow project(SeedCsvRecord row) {
        return new ProjectSeedRow(
                row.logicalKey("key"),
                row.logicalKey("npo_key"),
                row.requiredText("title"),
                row.requiredText("description"),
                row.requiredEnum("status", ProjectStatus.class),
                row.optionalEnum("type", ProjectType.class),
                row.optionalDecimal("budget_needed"),
                row.optionalDecimal("invested_amount"),
                row.optionalDate("start_date"),
                row.optionalDate("end_date"),
                row.optionalText("focus_area"),
                row.optionalText("fundraising_deadline"),
                row.optionalInteger("beneficiaries_count"),
                row.optionalText("location"),
                row.optionalText("main_objective"),
                row.requiredInteger("progress"));
    }

    private ProjectOdsSeedRow projectOds(SeedCsvRecord row) {
        return new ProjectOdsSeedRow(row.logicalKey("project_key"), row.requiredInteger("ods_id"));
    }

    private CompanyProjectSeedRow companyProject(SeedCsvRecord row) {
        return new CompanyProjectSeedRow(
                row.logicalKey("company_key"),
                row.logicalKey("project_key"),
                row.requiredEnum("status", RelationshipStatus.class),
                row.requiredEnum("initiator_type", InitiatorType.class),
                row.optionalDateTime("company_confirmed_at"),
                row.optionalDateTime("npo_confirmed_at"),
                row.optionalDateTime("responded_at"),
                row.optionalDateTime("expires_at"));
    }

    private NpoReportSeedRow npoReport(SeedCsvRecord row) {
        return new NpoReportSeedRow(
                row.logicalKey("key"),
                row.logicalKey("npo_key"),
                row.logicalKey("reporter_company_key"),
                row.requiredText("reason"),
                row.requiredEnum("status", NpoReportStatus.class));
    }

    private String resourcePath(String location, String fileName) {
        return location.endsWith("/") ? location + fileName : location + "/" + fileName;
    }

    private MessageDigest sha256() {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available.", exception);
        }
    }
}
