import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Memory storage for simulated active OTP verification
  const activeOtps = new Map<string, string>();

  // OTP send endpoint
  app.post("/api/otp/send", (req, res) => {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    // Generate a random 4-digit OTP code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    activeOtps.set(phone, otpCode);
    console.log(`[AUTH] Sent OTP ${otpCode} to phone ${phone}`);
    
    res.json({ 
      success: true, 
      message: "OTP sent successfully to your mobile carrier", 
      simulatedCode: otpCode 
    });
  });

  // OTP verify endpoint
  app.post("/api/otp/verify", (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone number and OTP code are required" });
    }
    const expected = activeOtps.get(phone);
    if (expected && expected === otp) {
      activeOtps.delete(phone); // consume OTP
      return res.json({ success: true, message: "Verification successful!" });
    } else {
      return res.status(400).json({ error: "Invalid OTP code entered. Please try again!" });
    }
  });

  // Mock API for sending emergency alerts
  app.post("/api/emergency/alert", (req, res) => {
    const { userId, location, contacts } = req.body;
    console.log(`[Emergency] Alert triggered for user ${userId} at ${JSON.stringify(location)}`);
    console.log(`[Emergency] Notifying contacts: ${contacts.join(', ')}`);
    res.json({ success: true, message: "Emergency alerts sent successfully" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
