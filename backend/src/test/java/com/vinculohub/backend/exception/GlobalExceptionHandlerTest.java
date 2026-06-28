/* (C)2026 */
package com.vinculohub.backend.exception;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("handleNotFound retorna 404")
    void shouldHandle404() {
        NotFoundException ex = new NotFoundException("Recurso não encontrado");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleNotFound(ex);
        assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
        assertEquals(404, resp.getBody().status());
        assertEquals("Recurso não encontrado", resp.getBody().message());
    }

    @Test
    @DisplayName("handleNoResourceFound retorna 404")
    void shouldHandleNoResourceFound() throws NoSuchFieldException {
        NoResourceFoundException ex = mock(NoResourceFoundException.class);
        when(ex.getResourcePath()).thenReturn("/nao-existe");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleNoResourceFound(ex);
        assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
        assertEquals(404, resp.getBody().status());
    }

    @Test
    @DisplayName("handleUnprocessableEntity retorna 422")
    void shouldHandle422() {
        UnprocessableEntityException ex = new UnprocessableEntityException("Entidade inválida");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleUnprocessableEntity(ex);
        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, resp.getStatusCode());
        assertEquals(422, resp.getBody().status());
        assertEquals("Entidade inválida", resp.getBody().message());
    }

    @Test
    @DisplayName("handleBadRequest retorna 400")
    void shouldHandle400() {
        BadRequestException ex = new BadRequestException("Dados inválidos");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleBadRequest(ex);
        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        assertEquals(400, resp.getBody().status());
        assertEquals("Dados inválidos", resp.getBody().message());
    }

    @Test
    @DisplayName("handleForbidden retorna 403")
    void shouldHandle403() {
        ForbiddenException ex = new ForbiddenException("Proibido");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleForbidden(ex);
        assertEquals(HttpStatus.FORBIDDEN, resp.getStatusCode());
        assertEquals(403, resp.getBody().status());
        assertEquals("Proibido", resp.getBody().message());
    }

    @Test
    @DisplayName("handleIllegalArgument retorna 400")
    void shouldHandleIllegalArgument() {
        IllegalArgumentException ex = new IllegalArgumentException("Argumento inválido");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleIllegalArgument(ex);
        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        assertEquals("Argumento inválido", resp.getBody().message());
    }

    @Test
    @DisplayName("handleDataAccess retorna 503")
    void shouldHandleDataAccess() {
        org.springframework.dao.DataAccessResourceFailureException ex =
                new org.springframework.dao.DataAccessResourceFailureException("DB down");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleDataAccess(ex);
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, resp.getStatusCode());
        assertEquals(503, resp.getBody().status());
        assertTrue(resp.getBody().message().contains("indisponível"));
    }

    @Test
    @DisplayName("handleTypeMismatch para enum retorna 400 com valores aceitos")
    void shouldHandleTypeMismatchForEnum() {
        MethodArgumentTypeMismatchException ex = mock(MethodArgumentTypeMismatchException.class);
        when(ex.getRequiredType()).thenAnswer(inv -> TestEnum.class);
        when(ex.getValue()).thenReturn("invalido");

        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleTypeMismatch(ex);

        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        assertTrue(resp.getBody().message().contains("invalido"));
        assertTrue(resp.getBody().message().contains("VALUE_A"));
    }

    @Test
    @DisplayName("handleTypeMismatch para tipo não-enum retorna 400")
    void shouldHandleTypeMismatchForNonEnum() {
        MethodArgumentTypeMismatchException ex = mock(MethodArgumentTypeMismatchException.class);
        when(ex.getRequiredType()).thenReturn(null);
        when(ex.getValue()).thenReturn("abc");

        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleTypeMismatch(ex);

        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        assertTrue(resp.getBody().message().contains("abc"));
    }

    @Test
    @DisplayName("handleAuthorizationDenied retorna 403")
    void shouldHandleAuthorizationDenied() {
        AuthorizationDeniedException ex = mock(AuthorizationDeniedException.class);
        when(ex.getMessage()).thenReturn("Acesso negado");

        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleAuthorizationDenied(ex);

        assertEquals(HttpStatus.FORBIDDEN, resp.getStatusCode());
        assertTrue(resp.getBody().message().contains("permissão"));
    }

    @Test
    @DisplayName("handleUnexpected retorna 500")
    void shouldHandleUnexpected() {
        Exception ex = new RuntimeException("Erro inesperado");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleUnexpected(ex);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
        assertEquals(500, resp.getBody().status());
        assertTrue(resp.getBody().message().contains("interno"));
    }

    @Test
    @DisplayName("ErrorResponse inclui timestamp")
    void shouldIncludeTimestampInErrorResponse() {
        GlobalExceptionHandler.ErrorResponse resp =
                new GlobalExceptionHandler.ErrorResponse(400, "teste");
        assertNotNull(resp.timestamp());
        assertEquals(400, resp.status());
        assertEquals("teste", resp.message());
    }

    enum TestEnum { VALUE_A, VALUE_B }
}
