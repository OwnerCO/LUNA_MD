import config from '../config.cjs';
import { exec } from 'child_process';

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

// Restart Command Handler
const restartCmd = async (m, Matrix) => {
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

  if (["restart", "reboot", "refresh"].includes(cmd)) {
    try {
      // Authorization check
      const botOwner = Matrix.user.id.split(":")[0]; // Get bot owner number
      const sudoNumbers = config.SUDO || [];
      const isSudo = sudoNumbers.includes(m.sender.split('@')[0]);
      
      if (m.sender !== botOwner && !isSudo) {
        return await reply(
          "❌ *Oopsie!* 🥺\n\n" +
          "Only my creator Hans or sudo users can restart me!\n" +
          "You're still special though! 💖\n" +
          "~ Your friend LUNA 🌙"
        );
      }

      await doReact("⚡", m, Matrix);

      // Send restart notification
      await reply(
        "✨ *System Refresh Initiated!* ⚡\n\n" +
        "I'm taking a quick power nap! 💤\n" +
        "Will be back in 5 seconds with more energy! 💫\n\n" +
        "Made with 💖 by Hans Tech",
        { contextInfo: newsletterContext }
      );

      // Immediate restart process
      setTimeout(() => {
        try {
          // Try PM2 first
          exec('pm2 restart all', (error) => {
            if (error) {
              console.log("PM2 restart failed, using fallback");
              // Fallback to direct node start
              exec('killall node && node .', (err) => {
                if (err) console.error("Fallback restart error:", err);
              });
            }
          });
        } catch (e) {
          console.error("Restart execution error:", e);
        }
      }, 1500);

    } catch (e) {
      console.error('Restart command error:', e);
      // Don't send reply as bot may be restarting
    }
  }
};

export default restartCmd;