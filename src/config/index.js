import "dotenv/config";

const config = {
  env: process.env.NODE_ENV || "development",
  isDev: (process.env.NODE_ENV || "development") === "development",

  bot: {
    name: process.env.BOT_NAME || "Bobabot",
    prefix: (process.env.BOT_PREFIX || "!").split(",").map((p) => p.trim()),
    owner: process.env.BOT_OWNER || "",
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
  },

  log: {
    level: process.env.LOG_LEVEL || "info",
  },
};

export default config;
