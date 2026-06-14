/* (C)2026 */
package com.vinculohub.backend.config.dev;

import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seed idempotente para o profile {@code dev}: garante uma Empresa (sub {@code dev|company}) e uma
 * ONG (sub {@code dev|npo}) com um Projeto, casando com os {@code sub} emitidos pelo
 * {@link com.vinculohub.backend.controller.dev.DevTokenController}, para que o fluxo de vínculos
 * possa ser exercitado via curl logo após subir o app.
 */
@Slf4j
@Component
@Profile("dev")
@ConditionalOnProperty(
        prefix = "app.sample-data",
        name = "enabled",
        havingValue = "false",
        matchIfMissing = true)
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private static final String COMPANY_SUB = "dev|company";
    private static final String NPO_SUB = "dev|npo";

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final NpoRepository npoRepository;
    private final ProjectRepository projectRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.findByAuth0Id(COMPANY_SUB).isEmpty()) {
            User companyUser =
                    userRepository.save(
                            User.builder()
                                    .name("Empresa Dev")
                                    .email("empresa.dev@vinculohub.local")
                                    .auth0Id(COMPANY_SUB)
                                    .userType(UserType.company)
                                    .build());
            Company company = new Company();
            company.setSocialName("Empresa Dev S.A.");
            company.setLegalName("Empresa Desenvolvimento Ltda");
            company.setPhone("(11) 1111-1111");
            company.setUser(companyUser);
            company = companyRepository.save(company);
            log.info(
                    "[DEV SEED] Empresa criada | companyId={} sub={}",
                    company.getId(),
                    COMPANY_SUB);
        }

        if (userRepository.findByAuth0Id(NPO_SUB).isEmpty()) {
            User npoUser =
                    userRepository.save(
                            User.builder()
                                    .name("ONG Dev")
                                    .email("ong.dev@vinculohub.local")
                                    .auth0Id(NPO_SUB)
                                    .userType(UserType.npo)
                                    .build());
            Npo npo =
                    npoRepository.save(
                            Npo.builder()
                                    .name("ONG Dev")
                                    .npoSize(NpoSize.small)
                                    .phone("(11) 2222-2222")
                                    .userId(npoUser.getId())
                                    .build());
            Project project =
                    projectRepository.save(
                            Project.builder()
                                    .npo(npo)
                                    .title("Projeto Dev")
                                    .description("Projeto semeado para testes locais")
                                    .build());
            log.info(
                    "[DEV SEED] ONG criada | npoId={} projectId={} sub={}",
                    npo.getId(),
                    project.getId(),
                    NPO_SUB);
        }

        log.info(
                "[DEV SEED] pronto. Tokens: GET /dev/token?sub=dev|company&roles=COMPANY  e "
                        + "GET /dev/token?sub=dev|npo&roles=NPO");
    }
}
