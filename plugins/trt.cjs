(async () => {
  const { cmd } = await import('../command.js');

  const config = require('../config.cjs');
  const axios = require('axios');
  
  cmd({
      pattern: "trt",
      desc: "Translate text to a specified language (e.g., .trt en Bonjour or .trt fr Hello).",
      category: "tools",
      react: "🌐",
      filename: __filename
  },
  async (conn, mek, m, {
      from,
      quoted,
      body,
      isCmd,
      command,
      isGroup,
      sender,
      pushname,
      reply
  }) => {
      try {
          // Re-parse the message text manually to ensure arguments are captured
          const rawText = body || m.body || m.text || "";
          const args = rawText.trim().split(" ").slice(1); // Remove the command itself
  
          // If no args or less than 2 words after command, show help
          if (!args || args.length < 2) {
              return reply(`
  ❓ *Usage Instructions for .trt Command*:
  
  To translate text to a specific language, use the following format:
  \`.trt <language_code> <text_to_translate>\`
  
  Example: 
  \`.trt en Bonjour\` → translates "Bonjour" to English  
  \`.trt fr Hello\` → translates "Hello" to French
  
  *Supported Codes:*
  \`en, fr, es, de, it, pt, ja, ko, ru, zh, ar, hi, bn, tr, pl, nl, sv, id, th\`
  `);
          }
  
          const langCode = args[0].toLowerCase();
          const textToTranslate = args.slice(1).join(" ");
          const supportedLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja', 'ko', 'ru', 'zh', 'ar', 'hi', 'bn', 'tr', 'pl', 'nl', 'sv', 'id', 'th'];
  
          if (!supportedLanguages.includes(langCode)) {
              return reply(`❌ Unsupported language code. Supported: ${supportedLanguages.join(", ")}`);
          }
  
          // Translation API
          const apiURL = `https://apis.davidcyriltech.my.id/tools/translate?text=${encodeURIComponent(textToTranslate)}&to=${langCode}`;
          const res = await axios.get(apiURL);
  
          if (res.data && res.data.success) {
              return reply(`
  ✅ *Translation Successful*:
  
  *To (${langCode}):*
  ${res.data.translated_text}
  `);
          } else {
              return reply("❌ Error: Invalid response from the translation API.");
          }
  
      } catch (e) {
          console.error("Translate Command Error:", e);
          return reply(`❌ Error: ${e.message || e}`);
      }
  });
})();
