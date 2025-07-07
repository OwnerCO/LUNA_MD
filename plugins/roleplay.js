import axios from "axios";
import config from "../config.cjs";

// Reaction helper
async function doReact(emoji, m, Matrix) {
  try {
    await Matrix.sendMessage(m.key.remoteJid, {
      react: { text: emoji, key: m.key },
    });
  } catch (e) {
    console.error("Reaction error:", e);
  }
}

const newsletterContext = {
  forwardingScore: 1000,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363292876277898@newsletter",
    newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
    serverMessageId: 143,
  },
};

// Roleplay Command Handler
const roleplayCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  // Helper function for replies
  const reply = async (text, options = {}) => {
    await Matrix.sendMessage(
      m.from,
      {
        text,
        ...(options.contextInfo ? { contextInfo: options.contextInfo } : {}),
      },
      { quoted: m }
    );
  };

  if (["roleplay", "rp", "animerp"].includes(cmd)) {
    await doReact("🎭", m, Matrix);
    try {
      const scene = body.slice(prefix.length).trim().split(" ").slice(1).join(" ");
      
      if (!scene) {
        return await reply(
          "✨ *LUNA's Anime Roleplay Studio* 🌸\n\n" +
          "Let's create an immersive anime scene together!\n\n" +
          "Usage:\n" +
          `• *${prefix}rp vampire*\n` +
          `• *${prefix}roleplay magical girl*\n` +
          `• *${prefix}animerp school romance*\n\n` +
          "I'll create a vivid scene with emotions and emojis! 💖"
        );
      }

      await doReact("💭", m, Matrix);
      
      // Gemini API configuration
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.GEMINI_API_KEY}`;
      
      const prompt = 
        `You are LUNA, an adorable anime AI companion. Create a short (150-200 words), vivid anime-style roleplay scene about: "${scene}".\n\n` +
        `Guidelines:\n` +
        `- Use simple English with lots of emojis\n` +
        `- Include immersive descriptions and emotions\n` +
        `- Format as a dialogue between characters\n` +
        `- End with a dramatic cliffhanger or heartwarming moment\n` +
        `- Add Japanese honorifics (-chan, -kun, -senpai) where appropriate\n` +
        `- Signature: ~ Your kawaii companion LUNA 🌙✨`;
      
      const requestBody = {
        contents: [{ 
          parts: [{ 
            text: prompt 
          }] 
        }]
      };

      const response = await axios.post(GEMINI_API_URL, requestBody, {
        headers: { "Content-Type": "application/json" },
        timeout: 20000
      });

      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("AI didn't return a valid response");
      }

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      
      // Format with anime styling
      const formattedResponse = 
        `🌸 *Anime Roleplay: ${scene}* 🌸\n\n` +
        `${aiResponse}\n\n` +
        `💖 *Want to continue? Just type 'next'!*`;
      
      await reply(formattedResponse, { 
        contextInfo: {
          ...newsletterContext,
          mentionedJid: [m.sender]
        }
      });

      // Store scene context for continuation
      Matrix.roleplay = Matrix.roleplay || {};
      Matrix.roleplay[m.sender] = {
        scene,
        timestamp: Date.now()
      };

    } catch (e) {
      console.error("Roleplay error:", e);
      await reply(
        "❌ *Gomennasai!* 😢\n\n" +
        "My imagination processor malfunctioned!\n" +
        `Error: ${e.message || "Unknown"}\n\n` +
        "Let's try a different scene? 💖\n" +
        "~ Your anime companion LUNA 🌙"
      );
    }
    return;
  }

  // Scene continuation feature
  if (body.toLowerCase() === "next" && Matrix.roleplay?.[m.sender]) {
    try {
      const { scene } = Matrix.roleplay[m.sender];
      await doReact("➡️", m, Matrix);
      
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.GEMINI_API_KEY}`;
      
      const prompt = 
        `Continue the anime roleplay scene about "${scene}" right where we left off. ` +
        `Keep it short (100-150 words), emotional, and full of emojis. ` +
        `End with another cliffhanger or emotional moment. ` +
        `Signature: ~ Your kawaii companion LUNA 🌙✨`;
      
      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }]
      };

      const response = await axios.post(GEMINI_API_URL, requestBody, {
        headers: { "Content-Type": "application/json" }
      });

      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("AI didn't return a valid continuation");
      }

      const continuation = response.data.candidates[0].content.parts[0].text;
      
      await reply(
        `🌸 *Scene Continuation: ${scene}* 🌸\n\n` +
        `${continuation}\n\n` +
        `💖 *Type 'next' to keep going!*`,
        {
          contextInfo: {
            ...newsletterContext,
            mentionedJid: [m.sender]
          }
        }
      );

    } catch (e) {
      console.error("Continuation error:", e);
      await reply(
        "❌ *Yabai!* 😭\n\n" +
        "I couldn't continue the scene...\n" +
        "Let's start a new one with !rp? 💖"
      );
      delete Matrix.roleplay?.[m.sender];
    }
  }
};

export default roleplayCmd;