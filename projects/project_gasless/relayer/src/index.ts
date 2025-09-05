import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { handleMetaSwap, getNonce } from "./relayer.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/metaSwap", async (req, res) => {
  const { user, tokenAddress, amount, signature, nonce, deadline, updateData, maxAge } = req.body;
  if (!user || !tokenAddress || !amount || !signature || !nonce || !deadline) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const result = await handleMetaSwap({ user, tokenAddress, amount, nonce, deadline, signature, updateData, maxAge });
  if (result.success) {
    res.json({ txHash: result.txHash });
  } else {
    res.status(500).json({ error: result.error });
  }
});

// Fetch nonce
app.get("/getNonce", async (req, res) => {
  const user = req.query.user as string;
  if (!user) return res.status(400).json({ error: "Missing user" });

  const result = await getNonce(user);
  res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Relayer listening on port ${PORT}`));
