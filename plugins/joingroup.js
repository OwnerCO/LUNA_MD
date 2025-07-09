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

const joinGroupCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  if (!body.startsWith(prefix)) return;

  const parts = body.slice(prefix.length).trim().split(/ +/);
  const cmd = parts.shift().toLowerCase();
  const invite = parts.join(" ").trim();

  if (!["joingroup", "join"].includes(cmd)) return;

  // ✅ Only OWNER can use
  if (m.sender !== config.OWNER_NUMBER.replace(/[^0-9]/g, "") + "@s.whatsapp.net") {
    await Matrix.sendMessage(
      m.key.remoteJid,
      {
        text: "❌ Only *Hans Tech Owner* can use this command.",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    return;
  }

  await doReact("🔗", m, Matrix);

  const match = invite.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/) || invite.match(/^([0-9A-Za-z]{20,})$/);
  const inviteCode = match ? match[1] : null;

  if (!inviteCode) {
    await Matrix.sendMessage(
      m.key.remoteJid,
      {
        text: "❌ Invalid group invite link or code.\n\n📌 *Example:* `.joingroup chat.whatsapp.com/ABC123xyzDEF456`",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    return;
  }

  try {
    const response = await Matrix.groupAcceptInvite(inviteCode);
    await doReact("✅", m, Matrix);
    await Matrix.sendMessage(
      m.key.remoteJid,
      {
        text: `✅ Successfully joined the group!\n🪪 Group ID: ${response}`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  } catch (error) {
    console.error("JoinGroup Error:", error);
    await doReact("❌", m, Matrix);
    await Matrix.sendMessage(
      m.key.remoteJid,
      {
        text: "❌ Failed to join the group. Make sure the invite link is valid and I’m not banned.",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }
};

export default joinGroupCmd;
