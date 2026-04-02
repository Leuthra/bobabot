import "dotenv/config";

const config = {
  env: process.env.NODE_ENV || "development",
  isDev: (process.env.NODE_ENV || "development") === "development",

  bot: {
    name: process.env.BOT_NAME || "Bobabot",
    prefix: (process.env.BOT_PREFIX || "!").split(",").map((p) => p.trim()),
    owner: (process.env.BOT_OWNER || '').split(',').map(id => id.trim()).filter(Boolean),
    limit: {
      max: parseInt(process.env.BOT_LIMIT_MAX || '5', 10),
      window: parseInt(process.env.BOT_LIMIT_WINDOW || '10', 10) * 1000,
    }
  },

  whatsapp: {
    sessionId: process.env.WA_SESSION_ID || "bobabot-main",
  },

  telegram: {
    token: process.env.TG_BOT_TOKEN || "",
  },

  discord: {
    token: process.env.DISCORD_BOT_TOKEN || "",
  },

  api: {
    port: parseInt(process.env.API_PORT || "3000", 10),
    secret: process.env.API_SECRET || "",
    limit: {
      max: parseInt(process.env.API_LIMIT_MAX || '10', 10),
      window: parseInt(process.env.API_LIMIT_WINDOW || '60', 10) * 1000,
    }
  },

  log: {
    level: process.env.LOG_LEVEL || "info",
  },
};

export default config;
