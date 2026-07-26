import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Simple in-memory store for MVP
const genomeDB = new Map();

router.post('/share', (req, res) => {
  try {
    const layoutData = req.body;
    
    // Generate a short 6-character ID
    const id = crypto.randomBytes(4).toString('hex').slice(0, 6);
    
    genomeDB.set(id, layoutData);
    
    res.json({ id, url: `/genome/${id}` });
  } catch (error) {
    console.error("Share generation error:", error);
    res.status(500).json({ error: "Failed to generate share link" });
  }
});

router.get('/genome/:id', (req, res) => {
  const { id } = req.params;
  const data = genomeDB.get(id);
  
  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ error: "Genome not found or expired" });
  }
});

export default router;
