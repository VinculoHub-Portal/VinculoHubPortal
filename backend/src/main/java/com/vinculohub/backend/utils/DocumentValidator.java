/* (C)2026 */
package com.vinculohub.backend.utils;

public final class DocumentValidator {

    private DocumentValidator() {}

    /**
     * Valida se um CPF é válido (formato e dígitos verificadores).
     *
     * @param cpf String contendo apenas dígitos (11 caracteres)
     * @return true se o CPF é válido
     */
    public static boolean isValidCpf(String cpf) {
        if (cpf == null) {
            return false;
        }

        cpf = cpf.replaceAll("[^0-9]", "");

        if (cpf.length() != 11) {
            return false;
        }

        // Rejeita CPFs com todos os dígitos iguais (ex: 111.111.111-11)
        if (cpf.chars().distinct().count() == 1) {
            return false;
        }

        // Validação do primeiro dígito verificador
        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
        }
        int firstDigit = 11 - (sum % 11);
        if (firstDigit >= 10) {
            firstDigit = 0;
        }
        if (Character.getNumericValue(cpf.charAt(9)) != firstDigit) {
            return false;
        }

        // Validação do segundo dígito verificador
        sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
        }
        int secondDigit = 11 - (sum % 11);
        if (secondDigit >= 10) {
            secondDigit = 0;
        }

        return Character.getNumericValue(cpf.charAt(10)) == secondDigit;
    }

    /**
     * Valida se um CNPJ é válido (formato e dígitos verificadores).
     *
     * @param cnpj String contendo apenas dígitos (14 caracteres)
     * @return true se o CNPJ é válido
     */
    public static boolean isValidCnpj(String cnpj) {
        if (cnpj == null) {
            return false;
        }

        cnpj = cnpj.replaceAll("[^0-9]", "");

        if (cnpj.length() != 14) {
            return false;
        }

        // Rejeita CNPJs com todos os dígitos iguais
        if (cnpj.chars().distinct().count() == 1) {
            return false;
        }

        // Pesos para o primeiro dígito verificador
        int[] weights1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int sum = 0;
        for (int i = 0; i < 12; i++) {
            sum += Character.getNumericValue(cnpj.charAt(i)) * weights1[i];
        }
        int firstDigit = 11 - (sum % 11);
        if (firstDigit >= 10) {
            firstDigit = 0;
        }
        if (Character.getNumericValue(cnpj.charAt(12)) != firstDigit) {
            return false;
        }

        // Pesos para o segundo dígito verificador
        int[] weights2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        sum = 0;
        for (int i = 0; i < 13; i++) {
            sum += Character.getNumericValue(cnpj.charAt(i)) * weights2[i];
        }
        int secondDigit = 11 - (sum % 11);
        if (secondDigit >= 10) {
            secondDigit = 0;
        }

        return Character.getNumericValue(cnpj.charAt(13)) == secondDigit;
    }

    /**
     * Remove caracteres não numéricos de um documento.
     *
     * @param document String com possível formatação (pontos, traços, barras)
     * @return String contendo apenas dígitos
     */
    public static String sanitize(String document) {
        if (document == null) {
            return null;
        }
        return document.replaceAll("[^0-9]", "");
    }
}
