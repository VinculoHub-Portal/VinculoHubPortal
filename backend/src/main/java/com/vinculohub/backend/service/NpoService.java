/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.NpoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NpoService {

    private final NpoRepository npoRepository;
    private final AddressRepository addressRepository;

    public NpoService(NpoRepository npoRepository, AddressRepository addressRepository) {
        this.npoRepository = npoRepository;
        this.addressRepository = addressRepository;
    }

    /**
     * Persiste uma ONG e, quando informado, seu endereço associado.
     *
     * <p>O endereço é salvo primeiro para gerar o {@code address_id}, e só depois o registro da
     * ONG é persistido com o vínculo configurado.
     *
     * @param npo ONG a ser persistida
     * @param address endereço opcional da ONG
     * @return ONG persistida, já com a referência do endereço quando fornecido
     */
    @Transactional
    public Npo saveWithAddress(Npo npo, Address address) {
        if (npo == null) {
            throw new IllegalArgumentException("A ONG não pode ser nula.");
        }

        if (address != null) {
            Address savedAddress = addressRepository.save(address);
            npo.setAddress(savedAddress);
        }

        return npoRepository.save(npo);
    }
}
