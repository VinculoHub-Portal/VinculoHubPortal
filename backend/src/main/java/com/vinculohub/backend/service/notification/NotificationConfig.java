/* (C)2026 */
package com.vinculohub.backend.service.notification;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Wires the active {@link NotificationService} bean.
 *
 * <p>When {@code resend.api-key} is non-blank, {@link ResendNotificationService} is registered.
 * Otherwise, {@link LoggingNotificationService} is used as a fallback. Using {@code @Bean} +
 * {@code @ConditionalOnMissingBean} inside a {@code @Configuration} guarantees deterministic bean
 * resolution — unlike applying these conditions to {@code @Service}-annotated classes, which can
 * produce non-deterministic ordering.
 */
@Configuration
public class NotificationConfig {

    @Bean
    @ConditionalOnExpression("!'${resend.api-key:}'.isBlank()")
    public NotificationService resendNotificationService(
            @Value("${resend.api-key}") String apiKey,
            @Value("${resend.from:}") String from,
            @Value("${resend.override-to:}") String overrideTo) {
        return new ResendNotificationService(apiKey, from, overrideTo);
    }

    @Bean
    @ConditionalOnMissingBean(NotificationService.class)
    public NotificationService loggingNotificationService() {
        return new LoggingNotificationService();
    }
}
