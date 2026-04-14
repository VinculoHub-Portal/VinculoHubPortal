import type { NpoAccountRegistrationPayload } from "../types/npo-account.types";
import { api } from "./api";

/**
 * Cadastro institucional ONG (user + NPO). Sem Authorization — conforme escopo do #93.
 */
export function createNpoAccount(payload: NpoAccountRegistrationPayload) {
  return api.post<unknown>("/api/npo-accounts", payload);
}
