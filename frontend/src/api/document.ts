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

/**
 * Interface baseada no DocumentRequestDTO
 */
export interface DocumentRequestDTO {
  id?: number;
  npoId?: number;
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
      "api/documents",
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