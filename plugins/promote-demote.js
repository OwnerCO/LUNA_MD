import config from "../config.cjs";

async function doReact(emoji, m, Matrix) {
  try {
    await Matrix.sendMessage(m.key.remoteJid, {
      react: { text: emoji, key: m.key },
    });
  } catch (e) {
    console.error("❌ Reaction error:", e);
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

const promoteDemoteCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  if (!body.startsWith(prefix)) return;

  const parts = body.slice(prefix.length).trim().split(/ +/);
  const cmd = parts.shift().toLowerCase();

  // Only handle promote/demote aliases
  if (!["promote", "demote"].includes(cmd)) return;

  const jid = m.key.remoteJid;

  // Check if group
  if (!jid.endsWith("@g.us")) {
    await Matrix.sendMessage(
      jid,
      {
        text: "❌ This command only works in group chats!",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    return;
  }

  // Check if message is a reply to someone
  if (!m.message?.extendedTextMessage?.contextInfo?.mentionedJid && !m.message?.extendedTextMessage?.contextInfo?.participant) {
    await Matrix.sendMessage(
      jid,
      {
        text: `❌ Please reply to the user's message whom you want to ${cmd}.`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    return;
  }

  // Extract participant jid from reply
  const repliedParticipant = 
    m.message.extendedTextMessage.contextInfo.participant ||
    (m.message.extendedTextMessage.contextInfo.mentionedJid && m.message.extendedTextMessage.contextInfo.mentionedJid[0]);

  if (!repliedParticipant) {
    await Matrix.sendMessage(
      jid,
      {
        text: `❌ Unable to find the user to ${cmd}. Please reply properly.`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    return;
  }

  await doReact("⏳", m, Matrix);

  try {
    if (cmd === "promote") {
      await Matrix.groupParticipantsUpdate(jid, [repliedParticipant], "promote");
      await Matrix.sendMessage(
        jid,
        {
          text: `✅ Successfully promoted @${repliedParticipant.split("@")[0]} to admin!`,
          contextInfo: { ...newsletterContext, mentionedJid: [repliedParticipant, m.sender] },
        },
        { quoted: m }
      );
      await doReact("✅", m, Matrix);
    } else if (cmd === "demote") {
      await Matrix.groupParticipantsUpdate(jid, [repliedParticipant], "demote");
      await Matrix.sendMessage(
        jid,
        {
          text: `✅ Successfully demoted @${repliedParticipant.split("@")[0]} from admin!`,
          contextInfo: { ...newsletterContext, mentionedJid: [repliedParticipant, m.sender] },
        },
        { quoted: m }
      );
      await doReact("✅", m, Matrix);
    }
  } catch (error) {
    console.error(`${cmd} Error:`, error);
    await doReact("❌", m, Matrix);
    await Matrix.sendMessage(
      jid,
      {
        text: `❌ Failed to ${cmd} user. Make sure I have admin rights and the user is in the group.`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }
};

export default promoteDemoteCmd;
