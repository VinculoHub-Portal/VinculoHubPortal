/* (C)2026 */
package com.vinculohub.backend.service.notification;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.RestClient;

/**
 * {@link NotificationService} backed by the Resend REST API (https://resend.com).
 *
 * <p>Activated by {@link NotificationConfig} only when {@code resend.api-key} is non-blank; otherwise
 * the project falls back to {@link LoggingNotificationService}.
 *
 * <p>E-mail send failures are intentionally swallowed and only logged: callers run inside
 * {@code @Transactional} blocks, so propagating an exception here would roll back the relationship
 * state change — a far worse outcome than a missed notification.
 */
@Slf4j
public class ResendNotificationService implements NotificationService {

    static final String RESEND_URL = "https://api.resend.com/emails";

    private final RestClient restClient;
    private final String from;
    private final String overrideTo;

    public ResendNotificationService(String apiKey, String from, String overrideTo) {
        this(buildClient(apiKey), from, overrideTo);
    }

    /** Package-private constructor for tests — accepts a pre-built (mockable) RestClient. */
    ResendNotificationService(RestClient restClient, String from, String overrideTo) {
        this.restClient = restClient;
        this.from = from;
        this.overrideTo = (overrideTo == null || overrideTo.isBlank()) ? null : overrideTo.trim();
        if (this.overrideTo != null) {
            log.warn(
                    "[RESEND] OVERRIDE ATIVO — todos os e-mails serão redirecionados para {}."
                            + " Esta configuração é apenas para desenvolvimento/sandbox.",
                    this.overrideTo);
        }
    }

    private static RestClient buildClient(String apiKey) {
        if (apiKey == null || !apiKey.startsWith("re_")) {
            log.warn(
                    "[RESEND] API key não parece válida (esperado prefixo 're_'). "
                            + "Emails podem falhar silenciosamente.");
        }
        return RestClient.builder()
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json; charset=utf-8")
                .build();
    }

    /** Resend API request payload. Package-private so tests in the same package can assert on it. */
    record EmailRequest(String from, List<String> to, String subject, String html) {}

    /**
     * Sends an e-mail via Resend, swallowing any failure to avoid breaking the caller's transaction.
     */
    private void send(String originalTo, String subject, String html) {
        String effectiveTo = overrideTo != null ? overrideTo : originalTo;
        if (overrideTo != null) {
            log.warn(
                    "[RESEND] Override ativo: enviando '{}' para {} (original: {})",
                    subject,
                    overrideTo,
                    originalTo);
        }
        try {
            restClient
                    .post()
                    .uri(RESEND_URL)
                    .body(new EmailRequest(from, List.of(effectiveTo), subject, html))
                    .retrieve()
                    .toBodilessEntity();
            log.debug("[RESEND] Sent '{}' to {}", subject, effectiveTo);
        } catch (RuntimeException e) {
            // Catches RestClientException (HTTP errors), IllegalStateException (config issues),
            // and Jackson serialization errors. Email failures must never propagate — see class
            // javadoc.
            log.error(
                    "[RESEND] Falha ao enviar '{}' para {}: {}",
                    subject,
                    effectiveTo,
                    e.getMessage());
        }
    }

    @Override
    public void interestReceived(String recipientEmail, String projectName, String partnerName) {
        send(
                recipientEmail,
                "[VinculoHub] Nova proposta de parceria para " + projectName,
                buildInterestReceivedHtml(projectName, partnerName));
    }

    @Override
    public void interestAccepted(String recipientEmail, String projectName, String partnerName) {
        send(
                recipientEmail,
                "[VinculoHub] Seu interesse em " + projectName + " foi aceito",
                buildInterestAcceptedHtml(projectName, partnerName));
    }

    @Override
    public void interestRejected(String recipientEmail, String projectName, String partnerName) {
        send(
                recipientEmail,
                "[VinculoHub] Seu interesse em " + projectName + " não foi aceito",
                buildInterestRejectedHtml(projectName, partnerName));
    }

    @Override
    public void confirmationRequested(
            String recipientEmail, String projectName, String partnerName) {
        send(
                recipientEmail,
                "[VinculoHub] Confirme a parceria em " + projectName,
                buildConfirmationRequestedHtml(projectName, partnerName));
    }

    @Override
    public void partnershipActivated(
            String recipientEmail, String projectName, String partnerName) {
        send(
                recipientEmail,
                "[VinculoHub] Parceria ativada em " + projectName,
                buildPartnershipActivatedHtml(projectName, partnerName));
    }

    // ---------- HTML templates ----------

    private static String wrap(String title, String body) {
        return """
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>VinculoHub</title></head>
<body style="font-family: sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
  <div style="background: #2563eb; padding: 24px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">VinculoHub</h1>
  </div>
  <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="font-size: 18px;">%s</h2>
    %s
    <p>Acesse o VinculoHub para mais detalhes.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="font-size: 12px; color: #6b7280;">
      E-mail automático do VinculoHub. Não responda.
    </p>
  </div>
</body>
</html>
"""
                .formatted(title, body);
    }

    private static String buildInterestReceivedHtml(String projectName, String partnerName) {
        return wrap(
                "Novo interesse recebido",
                ("<p>A organização <strong>%s</strong> demonstrou interesse no projeto"
                                + " <strong>%s</strong>.</p>"
                                + "<p>Aceite ou recuse o vínculo no portal.</p>")
                        .formatted(partnerName, projectName));
    }

    private static String buildInterestAcceptedHtml(String projectName, String partnerName) {
        return wrap(
                "Interesse aceito",
                "<p><strong>%s</strong> aceitou seu interesse no projeto <strong>%s</strong>.</p>"
                        .formatted(partnerName, projectName));
    }

    private static String buildInterestRejectedHtml(String projectName, String partnerName) {
        return wrap(
                "Interesse não aceito",
                "<p><strong>%s</strong> não aceitou seu interesse no projeto <strong>%s</strong>.</p>"
                        .formatted(partnerName, projectName));
    }

    private static String buildConfirmationRequestedHtml(String projectName, String partnerName) {
        return wrap(
                "Confirme a parceria",
                ("<p>Confirme a parceria com <strong>%s</strong> no projeto <strong>%s</strong>"
                                + " para ativar o vínculo.</p>")
                        .formatted(partnerName, projectName));
    }

    private static String buildPartnershipActivatedHtml(String projectName, String partnerName) {
        return wrap(
                "Parceria ativada",
                "<p>A parceria com <strong>%s</strong> no projeto <strong>%s</strong> está ativa.</p>"
                        .formatted(partnerName, projectName));
    }
}
