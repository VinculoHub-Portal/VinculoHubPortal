/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.exception.DuplicateDocumentException;
import com.vinculohub.backend.exception.InvalidDocumentException;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.utils.DocumentValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NpoDocumentService {

    private final NpoRepository npoRepository;

    public NpoDocumentService(NpoRepository npoRepository) {
        this.npoRepository = npoRepository;
    }

    /**
     * Valida os documentos (CPF e/ou CNPJ) de uma ONG antes do cadastro.
     *
     * <p>Regras:
     *
     * <ul>
     *   <li>Pelo menos um documento (CPF ou CNPJ) deve ser informado
     *   <li>Se informado, o documento deve ter formato válido (dígitos verificadores)
     *   <li>O documento não pode já estar cadastrado no banco (unicidade)
     * </ul>
     *
     * @param cpf CPF da ONG (pode ser null se CNPJ for informado)
     * @param cnpj CNPJ da ONG (pode ser null se CPF for informado)
     * @throws InvalidDocumentException se nenhum documento for informado ou se o formato for
     *     inválido
     * @throws DuplicateDocumentException se o documento já estiver cadastrado
     */
    public void validateDocuments(String cpf, String cnpj) {
        String sanitizedCpf = DocumentValidator.sanitize(cpf);
        String sanitizedCnpj = DocumentValidator.sanitize(cnpj);

        boolean hasCpf = sanitizedCpf != null && !sanitizedCpf.isBlank();
        boolean hasCnpj = sanitizedCnpj != null && !sanitizedCnpj.isBlank();

        // Regra: pelo menos um documento é obrigatório
        if (!hasCpf && !hasCnpj) {
            throw new InvalidDocumentException(
                    "É obrigatório informar pelo menos um documento (CPF ou CNPJ).");
        }

        // Validar formato e unicidade do CPF
        if (hasCpf) {
            if (!DocumentValidator.isValidCpf(sanitizedCpf)) {
                throw new InvalidDocumentException("CPF informado é inválido.");
            }
            if (npoRepository.existsByCpf(sanitizedCpf)) {
                throw new DuplicateDocumentException(
                        "Já existe uma instituição cadastrada com este CPF.");
            }
        }

        // Validar formato e unicidade do CNPJ
        if (hasCnpj) {
            if (!DocumentValidator.isValidCnpj(sanitizedCnpj)) {
                throw new InvalidDocumentException("CNPJ informado é inválido.");
            }
            if (npoRepository.existsByCnpj(sanitizedCnpj)) {
                throw new DuplicateDocumentException(
                        "Já existe uma instituição cadastrada com este CNPJ.");
            }
        }
    }

    /**
     * Sanitiza os documentos removendo formatação (pontos, traços, barras).
     *
     * @param cpf CPF com possível formatação
     * @return CPF somente com dígitos, ou null
     */
    public String sanitizeCpf(String cpf) {
        return DocumentValidator.sanitize(cpf);
    }

    /**
     * Sanitiza os documentos removendo formatação (pontos, traços, barras).
     *
     * @param cnpj CNPJ com possível formatação
     * @return CNPJ somente com dígitos, ou null
     */
    public String sanitizeCnpj(String cnpj) {
        return DocumentValidator.sanitize(cnpj);
    }
}
