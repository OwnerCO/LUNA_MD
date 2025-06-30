import config from "../config.cjs";

// Helper: newsletter context
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

// Shutdown handler
const shutdown = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "shutdown") return;
  
  const ctx = getNewsletterContext([m.sender]);
  
  try {
    // Check owner status
    if (!config.OWNERS.includes(m.sender.split('@')[0])) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "❌ *Oopsie~* Only my owner can do this!",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    // React with stop sign
    await Matrix.sendMessage(m.from, {
      react: { text: "🛑", key: m.key },
    });

    // Send shutdown message
    await Matrix.sendMessage(
      m.from,
      { 
        text: "🛑 *Shutting down LUNA MD...*\nGoodbye for now~ 💖",
        contextInfo: ctx
      },
      { quoted: m }
    );

    // Exit process after delay
    setTimeout(() => process.exit(0), 1000);

  } catch (e) {
    console.error("LUNA MD shutdown error:", e);
  }
};



// Helper: newsletter context


// Broadcast handler
const broadcast = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "broadcast") return;
  
  const ctx = getNewsletterContext([m.sender]);
  const message = m.body.slice(prefix.length + cmd.length).trim();
  
  try {
    // Owner check
    if (!config.OWNERS.includes(m.sender.split('@')[0])) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "❌ *Oopsie~* Only my owner can do this!",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    if (!message) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "✨ *LUNA MD* here!\nPlease provide a message to broadcast~ 📢\nExample: .broadcast Hello everyone!",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    // React with megaphone
    await Matrix.sendMessage(m.from, {
      react: { text: "📢", key: m.key },
    });

    // Get all groups
    const groups = Object.keys(await Matrix.groupFetchAllParticipating());
    
    // Send to all groups
    for (const groupId of groups) {
      await Matrix.sendMessage(
        groupId,
        { 
          text: `📢 *LUNA MD Broadcast* 📢\n\n${message}\n\n- Sent by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇`,
          contextInfo: ctx
        }
      );
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to avoid rate limits
    }

    // Confirmation message
    await Matrix.sendMessage(
      m.from,
      { 
        text: `✅ *Broadcast complete!*\nSent to ${groups.length} groups~`,
        contextInfo: ctx
      },
      { quoted: m }
    );

  } catch (e) {
    console.error("LUNA MD broadcast error:", e);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Broadcast failed: ${e.message}`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

// Helper: newsletter context
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

// Group JIDs handler
const gjid = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "gjid") return;
  
  const ctx = getNewsletterContext([m.sender]);
  
  try {
    // Owner check
    if (!config.OWNERS.includes(m.sender.split('@')[0])) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "❌ *Oopsie~* Only my owner can do this!",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    // React with notepad
    await Matrix.sendMessage(m.from, {
      react: { text: "📝", key: m.key },
    });

    // Get all groups
    const groups = await Matrix.groupFetchAllParticipating();
    const groupJids = Object.keys(groups);

    if (groupJids.length === 0) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "❌ I'm not in any groups!",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    // Format list
    const groupList = groupJids.map((jid, i) => 
      `${i + 1}. ${groups[jid].subject || 'Unnamed Group'} - ${jid}`
    ).join('\n');

    await Matrix.sendMessage(
      m.from,
      { 
        text: `📝 *LUNA MD Group List* (${groupJids.length} groups)\n\n${groupList}\n\n💖 *𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇*`,
        contextInfo: ctx
      },
      { quoted: m }
    );

  } catch (e) {
    console.error("LUNA MD gjid error:", e);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Failed to get groups: ${e.message}`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export { broadcast, shutdown, gjid };