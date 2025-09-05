import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { handleMetaSwap } from "./relayer.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/meta-swap", async (req, res) => {
  const body = req.body;
  if (!body.user || !body.tokenAddress || !body.amount || !body.signature || !body.nonce || !body.deadline) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const result = await handleMetaSwap(body);
  if (result.success) {
    res.json({ txHash: result.txHash });
  } else {
    res.status(500).json({ error: result.error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Relayer listening on port ${PORT}`));
