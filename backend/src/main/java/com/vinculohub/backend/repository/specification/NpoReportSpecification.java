/* (C)2026 */
package com.vinculohub.backend.repository.specification;

import com.vinculohub.backend.model.NpoReport;
import com.vinculohub.backend.model.enums.NpoReportStatus;
import org.springframework.data.jpa.domain.Specification;

public class NpoReportSpecification {

    private NpoReportSpecification() {}

    public static Specification<NpoReport> npoNameContains(String name) {
        return (root, query, cb) ->
                name == null || name.isBlank()
                        ? null
                        : cb.like(
                                cb.lower(root.get("npo").get("name")),
                                "%" + name.toLowerCase() + "%");
    }

    public static Specification<NpoReport> companyNameContains(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) return null;
            String pattern = "%" + name.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("reporterCompany").get("legalName")), pattern),
                    cb.like(cb.lower(root.get("reporterCompany").get("socialName")), pattern));
        };
    }

    public static Specification<NpoReport> hasStatus(NpoReportStatus status) {
        return (root, query, cb) ->
                status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<NpoReport> from(
            String npoName, String companyName, NpoReportStatus status) {
        return Specification.where(npoNameContains(npoName))
                .and(companyNameContains(companyName))
                .and(hasStatus(status));
    }
}
