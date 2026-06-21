/* (C)2026 */
package com.vinculohub.backend.service.notification;

/**
 * Sends e-mail notifications for the relationship (vínculo) lifecycle.
 *
 * <p>Email infrastructure does not exist yet in this project, so the only implementation today is
 * {@link LoggingNotificationService}, which simply logs. The semantic methods keep callers
 * decoupled from the eventual transport (SMTP/SendGrid) and make the side effects easy to assert in
 * unit tests.
 */
public interface NotificationService {

    /** 1st handshake — interest sent: notifies the receptor that a partnership was proposed. */
    void interestReceived(String recipientEmail, String projectName, String partnerName);

    /** 1st handshake — accepted: notifies the initiator that contact was released. */
    void interestAccepted(String recipientEmail, String projectName, String partnerName);

    /** 1st handshake — rejected: notifies the initiator that the interest was declined. */
    void interestRejected(String recipientEmail, String projectName, String partnerName);

    /** 2nd handshake — one side confirmed: asks the other side to also confirm. */
    void confirmationRequested(String recipientEmail, String projectName, String partnerName);

    /** 2nd handshake — both confirmed: notifies a party that the partnership is now active. */
    void partnershipActivated(String recipientEmail, String projectName, String partnerName);

    /**
     * Notifies the other party that the negotiation was cancelled by the counterpart before
     * activation.
     */
    void negotiationCancelled(String recipientEmail, String projectName, String partnerName);
}
