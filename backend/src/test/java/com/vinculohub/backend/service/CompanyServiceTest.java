/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.dto.CompanyListItemResponse;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
}
