import { useQuery } from "@tanstack/react-query";

interface APODData {
  title: string;
  date: string;
  explanation: string;
  url: string;
  media_type: 'image' | 'video';
  hdurl?: string;
  copyright?: string;
}

async function fetchAPOD(date?: string | null): Promise<APODData> {
  const API_KEY = import.meta.env.VITE_NASA_API_KEY || process.env.NASA_API_KEY || 'DEMO_KEY';
  let url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;
  
  if (date) {
    url += `&date=${date}`;
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch APOD: ${response.status} ${response.statusText}`);
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
