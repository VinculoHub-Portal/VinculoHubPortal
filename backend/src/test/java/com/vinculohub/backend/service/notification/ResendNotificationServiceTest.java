/* (C)2026 */
package com.vinculohub.backend.service.notification;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.service.notification.ResendNotificationService.EmailRequest;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@ExtendWith(MockitoExtension.class)
class ResendNotificationServiceTest {

    private static final String FROM = "VinculoHub <noreply@test.com>";
    private static final String TO = "destinatario@test.com";
    private static final String PROJECT = "Projeto X";
    private static final String PARTNER = "Empresa Y";

    @Mock private RestClient restClient;
    @Mock private RestClient.RequestBodyUriSpec requestBodyUriSpec;
    @Mock private RestClient.RequestBodySpec requestBodySpec;
    @Mock private RestClient.ResponseSpec responseSpec;

    private ResendNotificationService service;

    @BeforeEach
    void setUp() {
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(EmailRequest.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        service = new ResendNotificationService(restClient, FROM, null);
    }

    private EmailRequest capturePayload() {
        ArgumentCaptor<EmailRequest> captor = ArgumentCaptor.forClass(EmailRequest.class);
        verify(requestBodySpec).body(captor.capture());
        return captor.getValue();
    }

    private void assertCommonPayload(EmailRequest req) {
        assertEquals(FROM, req.from());
        assertEquals(List.of(TO), req.to());
        assertTrue(
                req.html().contains("<strong>" + PROJECT + "</strong>"),
                "HTML deve destacar o nome do projeto");
        assertTrue(
                req.html().contains("<strong>" + PARTNER + "</strong>"),
                "HTML deve destacar o nome do parceiro");
    }

    @Test
    @DisplayName("interestReceived envia payload correto para o Resend")
    void interestReceivedSendsCorrectPayload() {
        service.interestReceived(TO, PROJECT, PARTNER);

        verify(requestBodyUriSpec).uri(ResendNotificationService.RESEND_URL);
        EmailRequest req = capturePayload();
        assertCommonPayload(req);
        assertTrue(req.subject().contains("Nova proposta"));
        assertTrue(req.subject().contains(PROJECT));
    }

    @Test
    @DisplayName("interestAccepted envia payload correto para o Resend")
    void interestAcceptedSendsCorrectPayload() {
        service.interestAccepted(TO, PROJECT, PARTNER);

        EmailRequest req = capturePayload();
        assertCommonPayload(req);
        assertTrue(req.subject().contains("aceito"));
        assertTrue(req.subject().contains(PROJECT));
    }

    @Test
    @DisplayName("interestRejected envia payload correto para o Resend")
    void interestRejectedSendsCorrectPayload() {
        service.interestRejected(TO, PROJECT, PARTNER);

        EmailRequest req = capturePayload();
        assertCommonPayload(req);
        assertTrue(req.subject().contains("não foi aceito"));
        assertTrue(req.subject().contains(PROJECT));
    }

    @Test
    @DisplayName("confirmationRequested envia payload correto para o Resend")
    void confirmationRequestedSendsCorrectPayload() {
        service.confirmationRequested(TO, PROJECT, PARTNER);

        EmailRequest req = capturePayload();
        assertCommonPayload(req);
        assertTrue(req.subject().contains("Confirme"));
        assertTrue(req.subject().contains(PROJECT));
    }

    @Test
    @DisplayName("partnershipActivated envia payload correto para o Resend")
    void partnershipActivatedSendsCorrectPayload() {
        service.partnershipActivated(TO, PROJECT, PARTNER);

        EmailRequest req = capturePayload();
        assertCommonPayload(req);
        assertTrue(req.subject().contains("ativada"));
        assertTrue(req.subject().contains(PROJECT));
    }

    @Test
    @DisplayName("send não propaga exceções HTTP — falha de email não pode quebrar transação")
    void sendDoesNotPropagateExceptions() {
        when(responseSpec.toBodilessEntity())
                .thenThrow(new RestClientException("HTTP 500 - Internal Server Error"));

        assertDoesNotThrow(() -> service.interestReceived(TO, PROJECT, PARTNER));
    }

    @Test
    @DisplayName("overrideTo substitui o destinatário real do payload")
    void overrideToReplacesRecipient() {
        String override = "dev-bucket@example.com";
        ResendNotificationService svc = new ResendNotificationService(restClient, FROM, override);

        svc.interestReceived(TO, PROJECT, PARTNER);

        EmailRequest req = capturePayload();
        assertEquals(java.util.List.of(override), req.to());
    }

    @Test
    @DisplayName("overrideTo nulo ou em branco mantém destinatário original")
    void nullOrBlankOverrideToKeepsOriginalRecipient() {
        ResendNotificationService svc = new ResendNotificationService(restClient, FROM, "  ");

        svc.interestReceived(TO, PROJECT, PARTNER);

        EmailRequest req = capturePayload();
        assertEquals(java.util.List.of(TO), req.to());
    }
}
