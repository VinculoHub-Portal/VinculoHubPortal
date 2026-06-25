import { api } from "../services/api";
import { logger } from "../utils/logger";

/**
 * Interface baseada no DocumentResponseDTO
 */
export interface DocumentResponseDTO {
  id: number;
  npoId?: number;
  projectId?: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface DocumentDownloadResponseDTO {
  downloadUrl: string;
  fileName: string;
  mimeType: string;
  expiresAt: string;
}

export interface PaginatedDocumentsResponse {
  content: DocumentResponseDTO[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * Interface baseada no DocumentRequestDTO
 */
export interface DocumentRequestDTO {
  id?: number;
  projectId?: number;
  title: string;
  description?: string;
  mimeType?: string;
}

/**
 * Realiza o upload de um documento seguindo o contrato do backend
 * 
 * @param file O arquivo físico a ser enviado
 * @param payload Objeto do tipo DocumentRequestDTO
 * @param token Token de autenticação (opcional)
 */
export async function uploadDocument(
  file: File,
  payload: DocumentRequestDTO,
  token?: string,
): Promise<DocumentResponseDTO> {
  const formData = new FormData();

  
  formData.append("file", file);

  
  const metadata = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  });
  formData.append("data", metadata);

  logger.info("DocumentAPI", "Iniciando upload de documento", { 
    title: payload.title, 
    fileName: file.name, 
    hasToken: !!token 
  });

  try {
    const { data } = await api.post<DocumentResponseDTO>(
      "/api/documents",
      formData,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    logger.info("DocumentAPI", "Documento enviado com sucesso", { documentId: data.id });
    return data;
  } catch (error) {
    logger.error("DocumentAPI", "Falha no upload do documento", error);
    throw error;
  }
}

export async function fetchMyOngDocuments(
  token: string,
  page = 0,
  size = 20,
): Promise<PaginatedDocumentsResponse> {
  logger.info("DocumentAPI", "Buscando documentos privados da ONG", { page, size });

  try {
    const { data } = await api.get<PaginatedDocumentsResponse>(
      "/api/documents/my-ong",
      {
        params: { page, size },
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    logger.info("DocumentAPI", "Documentos privados carregados", {
      totalElements: data.totalElements,
    });
    return data;
  } catch (error) {
    logger.error("DocumentAPI", "Falha ao buscar documentos privados da ONG", error);
    throw error;
  }
}

export async function getMyOngDocumentDownloadUrl(
  documentId: number,
  token: string,
): Promise<DocumentDownloadResponseDTO> {
  logger.info("DocumentAPI", "Solicitando URL de download do documento", { documentId });

  try {
    const { data } = await api.get<DocumentDownloadResponseDTO>(
      `/api/documents/my-ong/${documentId}/download`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    logger.info("DocumentAPI", "URL de download gerada com sucesso", { documentId });
    return data;
  } catch (error) {
    logger.error("DocumentAPI", "Falha ao gerar URL de download do documento", error);
    throw error;
  }
}
