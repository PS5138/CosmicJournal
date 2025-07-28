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
  // Special handling for today's date to force fresh data
  const isToday = date === '2025-07-28' || (!date && new Date().toISOString().split('T')[0] === '2025-07-28');
  const queryKey = isToday ? ['apod', date, Date.now()] : ['apod', date]; // Unique key for today
  
  return useQuery<APODData, Error>({
    queryKey,
    queryFn: async () => {
      const force = new Date().getTime(); // force param busts browser + CDN cache
      let url = '/api/apod';
      
      if (date) {
        url += `?date=${date}&force=${force}&_nocache=${Math.random()}`;
      } else {
        url += `?force=${force}&_nocache=${Math.random()}`;
      }
      
      console.log('Fetching APOD from:', url);
      
      const response = await fetch(url, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch APOD: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received APOD data:', data);
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch APOD data');
      }

      return data;
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0, // force re-fetch on every load
    gcTime: 0, // don't cache at all
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });
}
