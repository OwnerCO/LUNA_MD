import config from "../config.cjs";
import axios from "axios";
import fs from "fs";
import path from "path";

// Helper: newsletter context for consistent metadata
function getNewsletterContext(mentioned = []) {
  return {
    mentionedJid: mentioned,
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
      serverMessageId: 175,
    },
  };
}

// Main obfuscate handler
const obfuscate = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["obfuscate", "obfs", "obf"].includes(cmd)) return;

  const args = m.body.trim().slice(prefix.length + cmd.length).trim();
  const ctx = getNewsletterContext([m.sender]);

  try {
    // React with lock emoji
    await Matrix.sendMessage(m.from, {
      react: { text: "🔒", key: m.key },
    });

    let jsCode = "";
    
    if (m.quoted && m.quoted.text) {
      jsCode = m.quoted.text;
    } else if (args) {
      jsCode = args;
    } else {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "✨ *LUNA MD* here!\nPlease provide JavaScript code to obfuscate~ 💻\nEither reply to a file or write it inline!",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    const apiUrl = `https://apis.davidcyriltech.my.id/obfuscate?code=${encodeURIComponent(jsCode)}&level=low`;
    
    const response = await axios.get(apiUrl);
    if (!response.data.success) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "❌ Failed to obfuscate the code~ Try again later!",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    const obfuscatedCode = response.data.result.obfuscated_code.code;
    const filePath = path.join(process.cwd(), 'media/obfuscated.js');
    fs.writeFileSync(filePath, obfuscatedCode, 'utf8');

    await Matrix.sendMessage(
      m.from,
      {
        document: fs.readFileSync(filePath),
        mimetype: 'text/javascript',
        fileName: 'LUNA.js',
        caption: "🔒 *Code Obfuscated Successfully!*\nPowered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇 💻",
        contextInfo: ctx,
      },
      { quoted: m }
    );

    // Clean up
    fs.unlinkSync(filePath);

  } catch (e) {
    console.error("LUNA MD obfuscate error:", e);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Oopsie~ Error: ${e.message}`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export default obfuscate;