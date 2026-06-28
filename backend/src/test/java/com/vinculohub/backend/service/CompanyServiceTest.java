/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.*;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.exception.CompanyAlreadyExistsException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.UserRepository;
import com.vinculohub.backend.repository.projection.CompanyNpoCardProjection;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock private CompanyRepository companyRepository;

    @Mock private NpoRepository npoRepository;

    @Mock private AddressService addressService;

    @Mock private UserRepository userRepository;

    @InjectMocks private CompanyService companyService;

    @Test
    void shouldListCompaniesForNpoWithPageableAndScreenDto() {
        Pageable pageable = PageRequest.of(0, 10);
        Company company = new Company();
        company.setId(7);
        company.setLegalName("Empresa Parceira LTDA");
        company.setSocialName("Empresa Parceira");
        company.setDescription("Apoia projetos de educação.");
        company.setLogoUrl("https://example.com/logo.png");
        company.setPhone("(11) 99999-9999");
        company.setCnpj("12345678000199");
        company.setAddress(Address.builder().city("São Paulo").state("SP").build());

        when(companyRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(company), pageable, 1));

        Page<CompanyListItemResponse> result = companyService.findAllForNpoListing(pageable);

        assertEquals(1, result.getTotalElements());
        CompanyListItemResponse response = result.getContent().get(0);
        assertEquals(7, response.id());
        assertEquals("Empresa Parceira LTDA", response.legalName());
        assertEquals("Empresa Parceira", response.socialName());
        assertEquals("Apoia projetos de educação.", response.description());
        assertEquals("https://example.com/logo.png", response.logoUrl());
        assertEquals("São Paulo", response.city());
        assertEquals("SP", response.state());

        verify(companyRepository).findAll(pageable);
    }

    @Test
    void shouldMapNullableAddressForNpoListing() {
        Pageable pageable = PageRequest.of(0, 10);
        Company company = new Company();
        company.setId(8);
        company.setLegalName("Empresa Sem Endereço LTDA");

        when(companyRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(company), pageable, 1));

        Page<CompanyListItemResponse> result = companyService.findAllForNpoListing(pageable);

        CompanyListItemResponse response = result.getContent().get(0);
        assertEquals("Empresa Sem Endereço LTDA", response.legalName());
        assertNull(response.city());
        assertNull(response.state());
    }

    @Test
    void shouldListActiveNposForCompanyWithNameFilter() {
        Pageable pageable = PageRequest.of(0, 10);
        CompanyNpoCardProjection projection =
                new CompanyNpoCardProjection() {
                    @Override
                    public Integer getId() {
                        return 12;
                    }

                    @Override
                    public String getName() {
                        return "ONG Aurora";
                    }

                    @Override
                    public String getDescription() {
                        return "Capacitação profissional.";
                    }

                    @Override
                    public String getLogoUrl() {
                        return "https://example.com/aurora.png";
                    }

                    @Override
                    public String getCity() {
                        return "Fortaleza";
                    }

                    @Override
                    public String getStateCode() {
                        return "CE";
                    }
                };

        when(npoRepository.findActiveCardsForCompany("Aur", pageable))
                .thenReturn(new PageImpl<>(List.of(projection), pageable, 1));

        Page<NpoListItemResponse> result = companyService.findAllForCompanyListing("Aur", pageable);

        assertEquals(1, result.getTotalElements());
        NpoListItemResponse response = result.getContent().get(0);
        assertEquals(12, response.id());
        assertEquals("ONG Aurora", response.name());
        assertEquals("Capacitação profissional.", response.description());
        assertEquals("https://example.com/aurora.png", response.logoUrl());
        assertEquals("Fortaleza", response.city());
        assertEquals("CE", response.stateCode());

        verify(npoRepository).findActiveCardsForCompany("Aur", pageable);
    }

    // ── findAllForExport ──────────────────────────────────────────────────────

    @Test
    @DisplayName("Deve exportar lista de empresas com endereço e usuário")
    void shouldExportAllCompaniesWithAddressAndUser() {
        Company company = new Company();
        company.setId(1);
        company.setLegalName("Empresa Export LTDA");
        company.setSocialName("Export Social");
        company.setCnpj("12345678000199");
        company.setPhone("(11) 99999-9999");

        User user = new User();
        user.setEmail("export@empresa.com");
        company.setUser(user);

        Address address = Address.builder().city("Curitiba").state("PR").zipCode("80000-000").build();
        company.setAddress(address);

        when(companyRepository.findAll()).thenReturn(List.of(company));

        List<CompanyExportDTO> result = companyService.findAllForExport();

        assertEquals(1, result.size());
        CompanyExportDTO dto = result.get(0);
        assertEquals(1, dto.id());
        assertEquals("Empresa Export LTDA", dto.legalName());
        assertEquals("export@empresa.com", dto.email());
        assertEquals("Curitiba", dto.city());
        assertEquals("PR", dto.state());
    }

    @Test
    @DisplayName("Deve exportar empresa sem endereço e sem usuário")
    void shouldExportCompanyWithNullAddressAndUser() {
        Company company = new Company();
        company.setId(2);
        company.setLegalName("Empresa Simples LTDA");
        company.setUser(null);
        company.setAddress(null);

        when(companyRepository.findAll()).thenReturn(List.of(company));

        List<CompanyExportDTO> result = companyService.findAllForExport();

        CompanyExportDTO dto = result.get(0);
        assertNull(dto.email());
        assertNull(dto.city());
        assertNull(dto.state());
    }

    // ── getCompanyProfileByAuth0Id ────────────────────────────────────────────

    @Test
    @DisplayName("Deve retornar perfil da empresa para auth0Id válido")
    void shouldReturnCompanyProfileForValidAuth0Id() {
        User user = new User();
        user.setId(10);
        user.setName("Responsável");
        user.setEmail("resp@empresa.com");
        user.setAuth0Id("auth0|company123");
        user.setUserType(UserType.company);

        Address address = Address.builder().id(5).state("SP").stateCode("SP")
                .city("São Paulo").street("Av. Paulista").number("100")
                .complement("Sala 1").zipCode("01310-100").build();

        Company company = new Company();
        company.setId(20);
        company.setLegalName("Empresa Legal LTDA");
        company.setSocialName("Empresa Social");
        company.setCnpj("12345678000199");
        company.setPhone("(11) 99999-0000");
        company.setUser(user);
        company.setAddress(address);

        when(userRepository.findByAuth0Id("auth0|company123")).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(10)).thenReturn(Optional.of(company));

        CompanyProfileResponse resp = companyService.getCompanyProfileByAuth0Id("auth0|company123");

        assertNotNull(resp);
        assertEquals(20, resp.institutionalData().id());
        assertEquals("SP", resp.address().stateCode());
        assertEquals("resp@empresa.com", resp.responsible().email());
    }

    @Test
    @DisplayName("Deve lançar BadRequestException para auth0Id nulo")
    void shouldThrowForNullAuth0IdInProfile() {
        assertThrows(BadRequestException.class, () -> companyService.getCompanyProfileByAuth0Id(null));
    }

    @Test
    @DisplayName("Deve lançar BadRequestException para auth0Id em branco")
    void shouldThrowForBlankAuth0IdInProfile() {
        assertThrows(BadRequestException.class, () -> companyService.getCompanyProfileByAuth0Id("  "));
    }

    @Test
    @DisplayName("Deve lançar NotFoundException quando usuário não encontrado")
    void shouldThrowNotFoundWhenUserNotFoundInProfile() {
        when(userRepository.findByAuth0Id("auth0|ghost")).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> companyService.getCompanyProfileByAuth0Id("auth0|ghost"));
    }

    @Test
    @DisplayName("Deve lançar NotFoundException quando empresa não encontrada para usuário")
    void shouldThrowNotFoundWhenCompanyNotFoundForUser() {
        User user = new User();
        user.setId(99);
        when(userRepository.findByAuth0Id("auth0|nocompany")).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(99)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> companyService.getCompanyProfileByAuth0Id("auth0|nocompany"));
    }

    @Test
    @DisplayName("Deve retornar perfil sem endereço (address null)")
    void shouldReturnProfileWithNullAddress() {
        User user = new User();
        user.setId(1);
        user.setEmail("a@a.com");

        Company company = new Company();
        company.setId(1);
        company.setUser(user);
        company.setAddress(null);

        when(userRepository.findByAuth0Id("auth0|a")).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(1)).thenReturn(Optional.of(company));

        CompanyProfileResponse resp = companyService.getCompanyProfileByAuth0Id("auth0|a");

        assertNull(resp.address());
    }

    @Test
    @DisplayName("Deve retornar perfil sem responsável (user null)")
    void shouldReturnProfileWithNullUser() {
        User user = new User();
        user.setId(1);
        user.setEmail("a@a.com");

        Company company = new Company();
        company.setId(1);
        company.setUser(null);
        company.setAddress(null);

        when(userRepository.findByAuth0Id("auth0|a")).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(1)).thenReturn(Optional.of(company));

        CompanyProfileResponse resp = companyService.getCompanyProfileByAuth0Id("auth0|a");

        assertNull(resp.responsible());
        assertNull(resp.contact().email());
    }

    // ── getPublicProfile ──────────────────────────────────────────────────────

    @Test
    @DisplayName("Deve retornar perfil público com endereço")
    void shouldReturnPublicProfileWithAddress() {
        Address address = Address.builder().city("Belo Horizonte").state("Minas Gerais")
                .stateCode("MG").street("Rua C").number("300").zipCode("30000-000").build();
        Company company = new Company();
        company.setId(5);
        company.setLegalName("Public LTDA");
        company.setAddress(address);

        when(companyRepository.findById(5)).thenReturn(Optional.of(company));

        CompanyPublicProfileResponse resp = companyService.getPublicProfile(5);

        assertEquals(5, resp.id());
        assertEquals("Belo Horizonte", resp.city());
        assertEquals("MG", resp.stateCode());
    }

    @Test
    @DisplayName("Deve retornar perfil público sem endereço")
    void shouldReturnPublicProfileWithNullAddress() {
        Company company = new Company();
        company.setId(6);
        company.setLegalName("Sem End LTDA");
        company.setAddress(null);

        when(companyRepository.findById(6)).thenReturn(Optional.of(company));

        CompanyPublicProfileResponse resp = companyService.getPublicProfile(6);

        assertNull(resp.city());
        assertNull(resp.state());
        assertNull(resp.stateCode());
    }

    @Test
    @DisplayName("Deve lançar BadRequestException para id nulo em getPublicProfile")
    void shouldThrowForNullIdInPublicProfile() {
        assertThrows(BadRequestException.class, () -> companyService.getPublicProfile(null));
    }

    @Test
    @DisplayName("Deve lançar NotFoundException quando empresa não existe em getPublicProfile")
    void shouldThrowNotFoundInPublicProfile() {
        when(companyRepository.findById(999)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> companyService.getPublicProfile(999));
    }

    // ── createCompany ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("Deve criar empresa com sucesso")
    void shouldCreateCompanySuccessfully() {
        AddressDTO addressDTO = AddressDTO.builder().state("SP").stateCode("SP")
                .city("São Paulo").street("Rua A").number("1").zipCode("01000-000").build();
        UserDTO userDTO = UserDTO.builder().name("Resp").email("resp@empresa.com").build();
        CompanyDTO dto = CompanyDTO.builder()
                .legalName("Nova Empresa LTDA").socialName("Nova Empresa")
                .cnpj("12.345.678/0001-99").phone("(11) 99999-0000")
                .address(addressDTO).user(userDTO).build();

        Address savedAddress = Address.builder().id(1).city("São Paulo").build();
        User savedUser = new User();
        savedUser.setId(10);
        savedUser.setName("Nova Empresa");
        savedUser.setEmail("resp@empresa.com");

        Company savedCompany = new Company();
        savedCompany.setId(20);
        savedCompany.setLegalName("Nova Empresa LTDA");
        savedCompany.setSocialName("Nova Empresa");
        savedCompany.setCnpj("12345678000199");
        savedCompany.setUser(savedUser);
        savedCompany.setAddress(savedAddress);

        when(companyRepository.existsByCnpj("12345678000199")).thenReturn(false);
        when(npoRepository.existsByCnpj("12345678000199")).thenReturn(false);
        when(userRepository.existsByAuth0Id("auth0|new")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("resp@empresa.com")).thenReturn(false);
        when(addressService.createAddress(addressDTO)).thenReturn(savedAddress);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(companyRepository.save(any(Company.class))).thenReturn(savedCompany);
        when(addressService.addressToAddressDTO(savedAddress)).thenReturn(addressDTO);

        CompanyDTO result = companyService.createCompany("auth0|new", "resp@empresa.com", dto);

        assertEquals(20, result.id());
        assertEquals("Nova Empresa LTDA", result.legalName());
    }

    @Test
    @DisplayName("Deve lançar BadRequestException para auth0Id nulo na criação")
    void shouldThrowForNullAuth0IdOnCreate() {
        CompanyDTO dto = CompanyDTO.builder().legalName("X").socialName("X")
                .cnpj("123").address(AddressDTO.builder().build())
                .user(UserDTO.builder().build()).build();

        assertThrows(BadRequestException.class, () -> companyService.createCompany(null, "e@e.com", dto));
    }

    @Test
    @DisplayName("Deve lançar CompanyAlreadyExistsException para CNPJ duplicado na NPO")
    void shouldThrowForDuplicateCnpjInNpo() {
        CompanyDTO dto = CompanyDTO.builder().legalName("X").socialName("X")
                .cnpj("12345678000199").address(AddressDTO.builder().build())
                .user(UserDTO.builder().build()).build();

        when(npoRepository.existsByCnpj("12345678000199")).thenReturn(true);

        assertThrows(CompanyAlreadyExistsException.class,
                () -> companyService.createCompany("auth0|dup", "a@b.com", dto));
    }

    @Test
    @DisplayName("Deve lançar CompanyAlreadyExistsException para CNPJ duplicado na Company")
    void shouldThrowForDuplicateCnpjInCompany() {
        CompanyDTO dto = CompanyDTO.builder().legalName("X").socialName("X")
                .cnpj("12345678000199").address(AddressDTO.builder().build())
                .user(UserDTO.builder().build()).build();

        when(companyRepository.existsByCnpj("12345678000199")).thenReturn(true);

        assertThrows(CompanyAlreadyExistsException.class,
                () -> companyService.createCompany("auth0|dup", "a@b.com", dto));
    }

    @Test
    @DisplayName("Deve lançar CompanyAlreadyExistsException para auth0Id duplicado")
    void shouldThrowForDuplicateAuth0Id() {
        CompanyDTO dto = CompanyDTO.builder().legalName("X").socialName("X")
                .cnpj("12345678000199").address(AddressDTO.builder().build())
                .user(UserDTO.builder().build()).build();

        when(npoRepository.existsByCnpj("12345678000199")).thenReturn(false);
        when(companyRepository.existsByCnpj("12345678000199")).thenReturn(false);
        when(userRepository.existsByAuth0Id("auth0|dup")).thenReturn(true);

        assertThrows(CompanyAlreadyExistsException.class,
                () -> companyService.createCompany("auth0|dup", "a@b.com", dto));
    }

    @Test
    @DisplayName("Deve lançar BadRequestException quando email não está disponível")
    void shouldThrowForNullEmail() {
        UserDTO userDTO = UserDTO.builder().email(null).build();
        CompanyDTO dto = CompanyDTO.builder().legalName("X").socialName("X")
                .cnpj("12345678000199").address(AddressDTO.builder().build())
                .user(userDTO).build();

        when(npoRepository.existsByCnpj("12345678000199")).thenReturn(false);
        when(companyRepository.existsByCnpj("12345678000199")).thenReturn(false);
        when(userRepository.existsByAuth0Id("auth0|new")).thenReturn(false);

        assertThrows(BadRequestException.class,
                () -> companyService.createCompany("auth0|new", null, dto));
    }

    @Test
    @DisplayName("Deve lançar CompanyAlreadyExistsException para e-mail duplicado")
    void shouldThrowForDuplicateEmail() {
        CompanyDTO dto = CompanyDTO.builder().legalName("X").socialName("X")
                .cnpj("12345678000199").address(AddressDTO.builder().build())
                .user(UserDTO.builder().build()).build();

        when(npoRepository.existsByCnpj("12345678000199")).thenReturn(false);
        when(companyRepository.existsByCnpj("12345678000199")).thenReturn(false);
        when(userRepository.existsByAuth0Id("auth0|ok")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("dup@email.com")).thenReturn(true);

        assertThrows(CompanyAlreadyExistsException.class,
                () -> companyService.createCompany("auth0|ok", "dup@email.com", dto));
    }

    // ── mapAddress/mapResponsible branches already covered above ──────────────

    @Test
    void shouldMapNullableAddressForCompanyNpoListing() {
        Pageable pageable = PageRequest.of(0, 10);
        CompanyNpoCardProjection projection =
                new CompanyNpoCardProjection() {
                    @Override
                    public Integer getId() {
                        return 15;
                    }

                    @Override
                    public String getName() {
                        return "ONG Sem Endereço";
                    }

                    @Override
                    public String getDescription() {
                        return null;
                    }

                    @Override
                    public String getLogoUrl() {
                        return null;
                    }

                    @Override
                    public String getCity() {
                        return null;
                    }

                    @Override
                    public String getStateCode() {
                        return null;
                    }
                };

        when(npoRepository.findActiveCardsForCompany(null, pageable))
                .thenReturn(new PageImpl<>(List.of(projection), pageable, 1));

        Page<NpoListItemResponse> result = companyService.findAllForCompanyListing(null, pageable);

        NpoListItemResponse response = result.getContent().get(0);
        assertEquals("ONG Sem Endereço", response.name());
        assertNull(response.city());
        assertNull(response.stateCode());
    }
}
