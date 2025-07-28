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
      const force = new Date().getTime(); // force param busts browser + CDN cache
      let url = '/api/apod';
      
      if (date) {
        url += `?date=${date}&force=${force}`;
      } else {
        url += `?force=${force}`;
      }
      
      const response = await fetch(url, { cache: 'no-store' }); // disable browser caching
      
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
    staleTime: 0, // force re-fetch on every load
    refetchOnWindowFocus: false
  });
}
