/* (C)2026 */
package com.vinculohub.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@vinculohub.com.br}")
    private String fromAddress;

    @Value("${app.frontend.portal-url:http://localhost:5173}")
    private String portalUrl;

    public void sendPartnershipConfirmationRequest(
            String toEmail,
            String recipientName,
            String confirmerName,
            String projectTitle,
            String vinculosPath) {
        if (mailSender == null) {
            log.warn(
                    "JavaMailSender not configured – skipping e-mail to {} for project '{}'",
                    toEmail,
                    projectTitle);
            return;
        }

        String subject = "VínculoHub – Confirmação de Efetivação de Parceria";
        String body =
                String.format(
                        "Olá, %s!%n%n"
                                + "%s confirmou a efetivação da parceria referente ao projeto \"%s\"."
                                + "%n%nPara que o vínculo seja ativado no sistema, você também precisa"
                                + " confirmar acessando o portal:%n%n"
                                + "  %s%s%n%n"
                                + "Após a confirmação de ambas as partes, o vínculo passará para o"
                                + " status Ativo e os dados de impacto serão contabilizados no"
                                + " Dashboard ESG.%n%n"
                                + "Atenciosamente,%n"
                                + "Equipe VínculoHub",
                        recipientName,
                        confirmerName,
                        projectTitle,
                        portalUrl,
                        vinculosPath);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Partnership confirmation e-mail sent to {}", toEmail);
        } catch (MailException ex) {
            log.error("Failed to send e-mail to {}: {}", toEmail, ex.getMessage());
        }
    }

    public void sendPartnershipActivated(
            String toEmail, String recipientName, String projectTitle) {
        if (mailSender == null) {
            log.warn(
                    "JavaMailSender not configured – skipping activation e-mail to {}", toEmail);
            return;
        }

        String subject = "VínculoHub – Parceria Ativada!";
        String body =
                String.format(
                        "Olá, %s!%n%n"
                                + "Ótimas notícias! A parceria referente ao projeto \"%s\" foi"
                                + " efetivada com sucesso por ambas as partes.%n%n"
                                + "O vínculo agora está Ativo e os dados de impacto do projeto"
                                + " serão contabilizados no Dashboard de Impacto ESG.%n%n"
                                + "Acesse o portal para acompanhar os detalhes:%n%n"
                                + "  %s%n%n"
                                + "Atenciosamente,%n"
                                + "Equipe VínculoHub",
                        recipientName,
                        projectTitle,
                        portalUrl);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Partnership activated e-mail sent to {}", toEmail);
        } catch (MailException ex) {
            log.error("Failed to send activation e-mail to {}: {}", toEmail, ex.getMessage());
        }
    }
}
