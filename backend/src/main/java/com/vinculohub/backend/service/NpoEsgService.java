/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.exception.EsgSelectionException;
import org.springframework.stereotype.Service;

@Service
public class NpoEsgService {

    /**
     * Valida que pelo menos um pilar ESG foi selecionado.
     *
     * <p>Critério de aceite: a ONG deve selecionar no mínimo 1 pilar ESG durante o cadastro.
     *
     * @param environmental se o pilar Ambiental foi selecionado
     * @param social se o pilar Social foi selecionado
     * @param governance se o pilar Governança foi selecionado
     * @throws EsgSelectionException se nenhum pilar for selecionado
     */
    public void validateEsgSelection(
            Boolean environmental, Boolean social, Boolean governance) {

        boolean hasEnvironmental = Boolean.TRUE.equals(environmental);
        boolean hasSocial = Boolean.TRUE.equals(social);
        boolean hasGovernance = Boolean.TRUE.equals(governance);

        if (!hasEnvironmental && !hasSocial && !hasGovernance) {
            throw new EsgSelectionException(
                    "É obrigatório selecionar pelo menos um pilar ESG"
                            + " (Ambiental, Social ou Governança).");
        }
    }
}
