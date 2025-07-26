import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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
