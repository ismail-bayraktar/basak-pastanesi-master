import app from './app.js';
import { logInfo } from "./utils/logger.js";

const port = process.env.PORT || 4001;

// Normal ortamda (development/production server) app.listen kullan
if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    logInfo(`Server running on PORT: ${port}`, { port, environment: process.env.NODE_ENV });
  });
}

// Vercel için export
export default app;

