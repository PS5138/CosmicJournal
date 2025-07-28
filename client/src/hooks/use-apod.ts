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

export function useApod(date?: string | null) {
  const queryKey = ['apod', date];
  
  return useQuery<APODData, Error>({
    queryKey,
    queryFn: async () => {
      let url = '/api/apod';
      
      if (date) {
        url += `?date=${date}`;
      }
      
      const response = await fetch(url, {
        cache: 'no-store' // Force fresh requests to bypass browser cache
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch APOD: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch APOD data');
      }

      return data;
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1 * 60 * 1000, // 1 minute for today's date extraction
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
}
