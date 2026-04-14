/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.NpoInstitutionalSignupRequest;
import com.vinculohub.backend.dto.NpoInstitutionalSignupResponse;
import com.vinculohub.backend.exception.DuplicateDocumentException;
import com.vinculohub.backend.exception.DuplicateLoginException;
import com.vinculohub.backend.exception.EsgSelectionException;
import com.vinculohub.backend.exception.InvalidDocumentException;
import com.vinculohub.backend.service.NpoAccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/npo-accounts")
public class NpoAccountController {

    private final NpoAccountService npoAccountService;

    public NpoAccountController(NpoAccountService npoAccountService) {
        this.npoAccountService = npoAccountService;
    }

    @PostMapping
    public ResponseEntity<NpoInstitutionalSignupResponse> create(
            @RequestBody NpoInstitutionalSignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(npoAccountService.registerInstitutionalAccount(request));
    }

    @ExceptionHandler({
        IllegalArgumentException.class,
        InvalidDocumentException.class,
        EsgSelectionException.class
    })
    ResponseEntity<ApiError> handleBadRequest(RuntimeException exception) {
        return ResponseEntity.badRequest().body(new ApiError(exception.getMessage()));
    }

    @ExceptionHandler({DuplicateLoginException.class, DuplicateDocumentException.class})
    ResponseEntity<ApiError> handleConflict(RuntimeException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError(exception.getMessage()));
    }

    public record ApiError(String message) {}
}
