/* (C)2026 */
package com.vinculohub.backend.service.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Stub {@link NotificationService} that logs instead of sending real e-mail. Replace with an
 * SMTP/SendGrid-backed implementation when email infrastructure is introduced.
 */
@Slf4j
@Service
public class LoggingNotificationService implements NotificationService {

    @Override
    public void interestReceived(String recipientEmail, String projectName, String partnerName) {
        log.info(
                "[NOTIFICATION] interestReceived -> to={} project='{}' partner='{}'",
                recipientEmail,
                projectName,
                partnerName);
    }

    @Override
    public void interestAccepted(String recipientEmail, String projectName, String partnerName) {
        log.info(
                "[NOTIFICATION] interestAccepted -> to={} project='{}' partner='{}'",
                recipientEmail,
                projectName,
                partnerName);
    }

    @Override
    public void interestRejected(String recipientEmail, String projectName, String partnerName) {
        log.info(
                "[NOTIFICATION] interestRejected -> to={} project='{}' partner='{}'",
                recipientEmail,
                projectName,
                partnerName);
    }

    @Override
    public void confirmationRequested(
            String recipientEmail, String projectName, String partnerName) {
        log.info(
                "[NOTIFICATION] confirmationRequested -> to={} project='{}' partner='{}'",
                recipientEmail,
                projectName,
                partnerName);
    }

    @Override
    public void partnershipActivated(
            String recipientEmail, String projectName, String partnerName) {
        log.info(
                "[NOTIFICATION] partnershipActivated -> to={} project='{}' partner='{}'",
                recipientEmail,
                projectName,
                partnerName);
    }
}
