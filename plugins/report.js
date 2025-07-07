import config from '../config.cjs';

// Report command handler
const reportCmd = async (m, Matrix) => {
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
        ...(options.mentions ? { mentions: options.mentions } : {}),
      },
      { quoted: m }
    );
  };

  // Report command
  if (["report", "ask", "bug", "request", "feedback"].includes(cmd)) {
    try {
      const args = body.slice(prefix.length).trim().split(" ").slice(1);
      
      if (!args.length) {
        return await reply(
          `✨ *LUNA's Help Center* 🛟\n\n` +
          `To report an issue or request a feature:\n` +
          `Usage: *${prefix}report [your message]*\n\n` +
          `Examples:\n` +
          `• *${prefix}report Play command not working*\n` +
          `• *${prefix}request Add weather command*\n\n` +
          `I'll make sure Hans Tech sees your message! 💌`
        );
      }

      const reportText = 
        `🛎️ *New User Report* 🌙\n\n` +
        `*User:* @${m.sender.split("@")[0]}\n` +
        `*Name:* ${m.pushName || "Unknown"}\n` +
        `*Issue/Request:* ${args.join(" ")}\n\n` +
        `💖 *LUNA MD v${config.VERSION || "1.0.0"}*`;
      
      const confirmationText = 
        `✨ *Thank you, ${m.pushName || "friend"}!* 💖\n\n` +
        `Your report has been sent to Hans Tech:\n` +
        `_"${args.join(" ").slice(0, 50)}${args.join(" ").length > 50 ? "..." : ""}"_\n\n` +
        `I'll notify you when we respond! ⏳\n` +
        `~ Your helpful companion LUNA 🌙`;

      // Get bot owner number
      const devNumber = config.OWNER_NUMBER || "237696900612";
      
      // Send to owner
      await Matrix.sendMessage(
        `${devNumber}@s.whatsapp.net`, 
        {
          text: reportText,
          mentions: [m.sender]
        }
      );

      // Confirm to user
      await reply(confirmationText, {
        mentions: [m.sender]
      });

      // Add reaction to confirm
      await Matrix.sendMessage(m.key.remoteJid, {
        react: { text: '✅', key: m.key }
      });

    } catch (e) {
      console.error("Report error:", e);
      await reply(
        "❌ *Oh no!* 🥺\n\n" +
        "My message bottle got lost at sea... 🌊💔\n" +
        "Please try again later or contact Hans Tech directly!\n" +
        "~ Your friend LUNA 🌙"
      );
    }
  }
};

// Note: We need to maintain state across restarts
// For production, you should use a database instead of in-memory storage
// This simplified version works for demonstration

export default reportCmd;