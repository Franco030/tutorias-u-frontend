import apiClient from "./apiClient";

export const subirArchivo = (archivo) => {
  const formData = new FormData();

  formData.append("File", archivo);

  return apiClient.post("/api/files/upload", formData);
};