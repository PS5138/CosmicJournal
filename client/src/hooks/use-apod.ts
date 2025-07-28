import { useQuery } from "@tanstack/react-query";

interface APODData {
  title: string;
  date: string;
  explanation: string;
  url?: string;
  media_type: 'image' | 'video' | 'other';
  hdurl?: string;
  copyright?: string;
  extracted_from_page?: boolean;
}

async function fetchAPOD(date?: string | null): Promise<APODData> {
  let url = '/api/apod';
  
  if (date) {
    url += `?date=${date}`;
    // Add cache buster for today's date to force extraction
    if (date === '2025-07-28') {
      url += `&_cb=${Date.now()}`;
    }
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch APOD: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || 'Failed to fetch APOD data');
  }

  return data;
}

export function useApod(date?: string | null) {
  return useQuery<APODData, Error>({
    queryKey: ['apod', date],
    queryFn: () => fetchAPOD(date),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0, // No cache for extraction testing
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
