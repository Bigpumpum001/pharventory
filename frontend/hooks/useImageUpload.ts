import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export interface GCSUploadResponse {
  url: string;
  filename: string;
  localPath?: string;
}

export interface UploadApiResponse {
  statusCode: number;
  message: string;
  data: GCSUploadResponse;
}

export async function uploadImageToGCS(file: File): Promise<GCSUploadResponse> {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await api.post<UploadApiResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Extract the data from the wrapped response
    return response.data.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export function validateImageFile(file: File): string | null {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'Image file size must not exceed 5MB';
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP image files are supported';
  }

  return null;
}

export function useImageUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadImageToGCS,
    onSuccess: () => {
      // Invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
    onError: (error) => {
      console.error('Image upload failed:', error);
    },
  });
}
