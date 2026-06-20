/* (C)2026 */
package com.vinculohub.backend.service.notification;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class NotificationConfigIntegrationTest {

    private final ApplicationContextRunner runner =
            new ApplicationContextRunner().withUserConfiguration(NotificationConfig.class);

    @Test
    void usesLoggingWhenApiKeyIsEmpty() {
        runner.withPropertyValues("resend.api-key=", "resend.from=test@x.com")
                .run(
                        ctx -> {
                            assertThat(ctx).hasSingleBean(NotificationService.class);
                            assertThat(ctx.getBean(NotificationService.class))
                                    .isInstanceOf(LoggingNotificationService.class);
                        });
    }

    @Test
    void usesResendWhenApiKeyIsPresent() {
        runner.withPropertyValues(
                        "resend.api-key=re_test_key_12345", "resend.from=test@x.com")
                .run(
                        ctx -> {
                            assertThat(ctx).hasSingleBean(NotificationService.class);
                            assertThat(ctx.getBean(NotificationService.class))
                                    .isInstanceOf(ResendNotificationService.class);
                        });
    }

    @Test
    void usesLoggingWhenApiKeyIsBlankWhitespace() {
        runner.withPropertyValues("resend.api-key=   ", "resend.from=test@x.com")
                .run(
                        ctx -> {
                            assertThat(ctx).hasSingleBean(NotificationService.class);
                            assertThat(ctx.getBean(NotificationService.class))
                                    .isInstanceOf(LoggingNotificationService.class);
                        });
    }
}
