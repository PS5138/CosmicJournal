import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Helper function to extract media URLs from NASA APOD HTML page
async function extractMediaFromApodPage(date: string) {
  try {
    // Format date for NASA URL (YYMMDD)
    const formattedDate = date.replace(/-/g, '').slice(2);
    const apodUrl = `https://apod.nasa.gov/apod/ap${formattedDate}.html`;
    
    const response = await fetch(apodUrl);
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    
    // Extract video source
    const videoMatch = html.match(/<source\s+src="([^"]*\.mp4[^"]*)"[^>]*>/i);
    if (videoMatch) {
      const videoSrc = videoMatch[1];
      // Convert relative URLs to absolute
      const fullVideoUrl = videoSrc.startsWith('http') 
        ? videoSrc 
        : `https://apod.nasa.gov/apod/${videoSrc}`;
      
      return {
        media_type: 'video',
        url: fullVideoUrl,
        extracted: true
      };
    }
    
    // Extract image source (high resolution)
    const imageMatch = html.match(/<a\s+href="([^"]*\.(?:jpg|jpeg|png|gif)[^"]*)"[^>]*><img/i);
    if (imageMatch) {
      const imageSrc = imageMatch[1];
      // Convert relative URLs to absolute
      const fullImageUrl = imageSrc.startsWith('http') 
        ? imageSrc 
        : `https://apod.nasa.gov/apod/${imageSrc}`;
      
      return {
        media_type: 'image',
        url: fullImageUrl,
        extracted: true
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting media from APOD page:', error);
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // NASA APOD API proxy endpoint
  app.get('/api/apod', async (req, res) => {
    try {
      const { date } = req.query;
      const API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
      
      let url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;
      
      if (date && typeof date === 'string') {
        url += `&date=${date}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `NASA API error: ${response.status} ${response.statusText}` 
        });
      }

      const data = await response.json();
      
      if (data.error) {
        return res.status(400).json({ 
          error: data.error.message || 'Failed to fetch APOD data' 
        });
      }

      // Check if API response lacks direct media URL and attempt extraction
      const needsExtraction = (
        data.media_type === 'other' || 
        (!data.url && data.media_type) ||
        (data.media_type === 'video' && !data.url)
      );
      
      if (needsExtraction && date && typeof date === 'string') {
        console.log(`Attempting to extract media for ${date} from NASA APOD page...`);
        const extractedMedia = await extractMediaFromApodPage(date);
        
        if (extractedMedia) {
          console.log(`Successfully extracted ${extractedMedia.media_type} URL:`, extractedMedia.url);
          // Merge extracted data with API response
          data.media_type = extractedMedia.media_type;
          data.url = extractedMedia.url;
          data.extracted_from_page = true;
        }
      }

      res.json(data);
    } catch (error) {
      console.error('APOD API error:', error);
      res.status(500).json({ 
        error: 'Internal server error while fetching APOD data' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
