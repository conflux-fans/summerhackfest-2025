import express from "express";
import cors from "cors";
import { handleMetaSwap, getNonce } from "./relayerService.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express error:", error);
  res.status(500).json({ 
    success: false, 
    error: error.message || "Internal server error" 
  });
});

// Routes
app.get("/getNonce", async (req, res) => {
  try {
    const { user } = req.query;
    
    if (!user || typeof user !== "string") {
      return res.status(400).json({ 
        success: false, 
        error: "User address is required" 
      });
    }

    const nonce = await getNonce(user);
    res.json({ success: true, nonce });
  } catch (error) {
    console.error("GetNonce endpoint error:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get nonce" 
    });
  }
});

app.post("/metaSwap", async (req, res) => {
  try {
    const { user, tokenAddress, amount, nonce, deadline, signature, updateData, maxAge } = req.body;

    // Validate required fields
    if (!user || !tokenAddress || !amount || !signature || !updateData) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields" 
      });
    }

    const result = await handleMetaSwap({
      user,
      tokenAddress,
      amount,
      nonce: nonce || "0",
      deadline: deadline || Math.floor(Date.now() / 1000) + 3600,
      signature,
      updateData,
      maxAge: maxAge || 3600
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("MetaSwap endpoint error:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "MetaSwap failed" 
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Relayer server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});