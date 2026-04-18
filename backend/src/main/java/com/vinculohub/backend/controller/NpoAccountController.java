/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.NpoInstitutionalSignupRequest;
import com.vinculohub.backend.dto.NpoInstitutionalSignupResponse;
import com.vinculohub.backend.exception.DuplicateDocumentException;
import com.vinculohub.backend.exception.DuplicateLoginException;
import com.vinculohub.backend.exception.EsgSelectionException;
import com.vinculohub.backend.exception.InvalidDocumentException;
import com.vinculohub.backend.service.NpoAccountService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/npo-accounts")
public class NpoAccountController {

    private final NpoAccountService npoAccountService;

    public NpoAccountController(NpoAccountService npoAccountService) {
        this.npoAccountService = npoAccountService;
    }

    @PostMapping
    public ResponseEntity<NpoInstitutionalSignupResponse> create(
            @AuthenticationPrincipal Jwt jwt, @RequestBody NpoInstitutionalSignupRequest request) {
        log.info("POST /api/npo-accounts | sub={} email={}", jwt.getSubject(), jwt.getClaimAsString("email"));
        NpoInstitutionalSignupResponse response =
                npoAccountService.registerInstitutionalAccount(
                        jwt.getSubject(), jwt.getClaimAsString("email"), request);
        log.info("NPO account created | userId={} npoId={}", response.userId(), response.npoId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @ExceptionHandler({
        IllegalArgumentException.class,
        InvalidDocumentException.class,
        EsgSelectionException.class
    })
    ResponseEntity<ApiError> handleBadRequest(RuntimeException exception) {
        log.warn("NPO signup 400: {}", exception.getMessage());
        return ResponseEntity.badRequest().body(new ApiError(exception.getMessage()));
    }

    @ExceptionHandler({DuplicateLoginException.class, DuplicateDocumentException.class})
    ResponseEntity<ApiError> handleConflict(RuntimeException exception) {
        log.warn("NPO signup 409: {}", exception.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError(exception.getMessage()));
    }

    public record ApiError(String message) {}
}
