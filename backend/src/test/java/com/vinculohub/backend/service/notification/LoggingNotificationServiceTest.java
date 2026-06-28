/* (C)2026 */
package com.vinculohub.backend.service.notification;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class LoggingNotificationServiceTest {

    private final LoggingNotificationService service = new LoggingNotificationService();

    @Test
    @DisplayName("interestReceived não deve lançar exceção")
    void shouldNotThrowOnInterestReceived() {
        assertDoesNotThrow(() -> service.interestReceived("to@email.com", "Projeto A", "ONG B"));
    }

    @Test
    @DisplayName("interestAccepted não deve lançar exceção")
    void shouldNotThrowOnInterestAccepted() {
        assertDoesNotThrow(() -> service.interestAccepted("to@email.com", "Projeto A", "ONG B"));
    }

    @Test
    @DisplayName("interestRejected não deve lançar exceção")
    void shouldNotThrowOnInterestRejected() {
        assertDoesNotThrow(() -> service.interestRejected("to@email.com", "Projeto A", "ONG B"));
    }

    @Test
    @DisplayName("confirmationRequested não deve lançar exceção")
    void shouldNotThrowOnConfirmationRequested() {
        assertDoesNotThrow(
                () -> service.confirmationRequested("to@email.com", "Projeto A", "ONG B"));
    }

    @Test
    @DisplayName("partnershipActivated não deve lançar exceção")
    void shouldNotThrowOnPartnershipActivated() {
        assertDoesNotThrow(
                () -> service.partnershipActivated("to@email.com", "Projeto A", "ONG B"));
    }

    @Test
    @DisplayName("negotiationCancelled não deve lançar exceção")
    void shouldNotThrowOnNegotiationCancelled() {
        assertDoesNotThrow(
                () -> service.negotiationCancelled("to@email.com", "Projeto A", "ONG B"));
    }
}
