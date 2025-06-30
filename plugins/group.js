import config from "../config.cjs";
import { fetchJson } from "../lib/functions2";

// Helper: React with emoji
async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
    });
  } catch (err) {
    console.error("💥 LUNA MD reaction error:", err);
  }
}

// Helper: Newsletter context template
function getNewsletterContext(mentioned = []) {
  return {
    mentionedJid: mentioned,
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
      serverMessageId: 161,
    },
  };
}

// Utility: convert UNIX seconds to structured date/time
function convertTimestamp(ts) {
  const d = new Date(ts * 1000);
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return {
    date: d.getDate(),
    month: new Intl.DateTimeFormat("en-US", { month: "long" }).format(d),
    year: d.getFullYear(),
    day: days[d.getUTCDay()],
    time: `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')}`
  };
}

/**
 * groupinfo: Show metadata for a group
 */
export async function groupinfo(m, Matrix) {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";
  if (!["groupinfo","grpinfo","gpinfo"].includes(cmd)) return;

  await doReact("🏘", m, Matrix);
  if (!m.isGroup) {
    return Matrix.sendMessage(m.from, { text: "❌ LUNA MD can only show group info inside a group!" }, { quoted: m });
  }

  try {
    const meta = await Matrix.groupMetadata(m.from);
    const ts = convertTimestamp(meta.creation);
    let pic = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
    try { pic = await Matrix.profilePictureUrl(m.from, "image"); } catch {}

    const owner = meta.owner ? `@${meta.owner.split("@")[0]}` : "Unknown";
    const total = meta.size;
    const admins = meta.participants.filter(p => p.admin != null).length;
    const members = total - admins;

    const ctx = getNewsletterContext([meta.owner]);
    const caption = `🏷️ *Group Name:* ${meta.subject}\n` +
      `🆔 *ID:* ${meta.id}\n` +
      `👑 *Owner:* ${owner}\n` +
      `📅 *Created:* ${ts.day}, ${ts.date} ${ts.month} ${ts.year} at ${ts.time}\n` +
      `👥 *Participants:* ${total}\n` +
      `🙋 *Members:* ${members}\n` +
      `🛡️ *Admins:* ${admins}\n` +
      `✉️ *Who can message:* ${meta.announce ? "Admins only" : "Everyone"}\n` +
      `⚙️ *Who can edit info:* ${meta.restrict ? "Admins only" : "Everyone"}\n` +
      `➕ *Who can add:* ${meta.memberAddMode ? "Everyone" : "Admins only"}\n\n` +
      `👩‍💻 *Brought by LUNA MD 😇*\n` +
      `💖 Powered by *HANS TECH*`;

    await Matrix.sendMessage(
      m.from,
      { image: { url: pic }, caption, contextInfo: ctx },
      { quoted: m }
    );
  } catch (e) {
    console.error("groupinfo error:", e);
    await Matrix.sendMessage(
      m.from,
      { text: `⚠️ LUNA MD hit an error: ${e.message}` },
      { quoted: m }
    );
  }
}

/**
 * updategdesc: Update group description
 */
export async function updategdesc(m, Matrix) {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";
  if (!["updategdesc","upgdesc","gdesc"].includes(cmd)) return;

  await doReact("📜", m, Matrix);
  const q = m.body.slice(prefix.length + cmd.length).trim();
  const ctx = getNewsletterContext();

  if (!m.isGroup) return Matrix.sendMessage(m.from, { text: "❌ Only in groups." }, { quoted: m });
  if (!m.isAdmins) return Matrix.sendMessage(m.from, { text: "❌ Only admins can use this." }, { quoted: m });
  if (!m.isBotAdmins) return Matrix.sendMessage(m.from, { text: "❌ I need admin role to perform this." }, { quoted: m });
  if (!q) return Matrix.sendMessage(m.from, { text: "❌ Provide a new description!" }, { quoted: m });

  try {
    await Matrix.groupUpdateDescription(m.from, q);
    await Matrix.sendMessage(m.from, { text: "✅ Group description updated!" }, { quoted: m });
  } catch (e) {
    console.error("updategdesc error:", e);
    await Matrix.sendMessage(m.from, { text: `❌ Failed: ${e.message}` }, { quoted: m });
  }
}

/**
 * updategname: Update group subject/name
 */
export async function updategname(m, Matrix) {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";
  if (!["updategname","upgname","gname"].includes(cmd)) return;

  await doReact("📝", m, Matrix);
  const q = m.body.slice(prefix.length + cmd.length).trim();
  const ctx = getNewsletterContext();

  if (!m.isGroup) return Matrix.sendMessage(m.from, { text: "❌ Only in groups." }, { quoted: m });
  if (!m.isAdmins) return Matrix.sendMessage(m.from, { text: "❌ Only admins can use this." }, { quoted: m });
  if (!m.isBotAdmins) return Matrix.sendMessage(m.from, { text: "❌ I need admin role to perform this." }, { quoted: m });
  if (!q) return Matrix.sendMessage(m.from, { text: "❌ Provide a new name!" }, { quoted: m });

  try {
    await Matrix.groupUpdateSubject(m.from, q);
    await Matrix.sendMessage(
      m.from,
      { text: `✅ Group name updated to: *${q}*` },
      { quoted: m }
    );
  } catch (e) {
    console.error("updategname error:", e);
    await Matrix.sendMessage(m.from, { text: `❌ Failed: ${e.message}` }, { quoted: m });
  }
}

/**
 * join: Join a group via invite link (creator/dev only)
 */
export async function join(m, Matrix) {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";
  if (!["join","joinme","f_join"].includes(cmd)) return;

  await doReact("📬", m, Matrix);
  const q = m.body.slice(prefix.length + cmd.length).trim();
  const ctx = getNewsletterContext();

  // Only allow bot creator or dev
  const owner = Matrix.user.id.split(":")[0];
  if (![owner, ...(config.DEVS||[])].includes(m.sender.split("@")[0])) {
    return Matrix.sendMessage(m.from, { text: "❌ Only the bot owner can use this." }, { quoted: m });
  }
  if (!q) {
    return Matrix.sendMessage(m.from, { text: "❌ Provide a group invite link!`" }, { quoted: m });
  }

  try {
    const code = q.split("https://chat.whatsapp.com/")[1];
    await Matrix.groupAcceptInvite(code);
    await Matrix.sendMessage(m.from, { text: "✔️ Successfully Joined!" }, { quoted: m });
  } catch (e) {
    console.error("join error:", e);
    await Matrix.sendMessage(m.from, { text: `❌ Error: ${e.message}` }, { quoted: m });
  }
}

/**
 * lockgc: Lock the group
 */
export async function lockgc(m, Matrix) {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";
  if (!["lockgc","lock"].includes(cmd)) return;

  await doReact("🔒", m, Matrix);
  if (!m.isGroup) return Matrix.sendMessage(m.from, { text: "❌ Only in groups." }, { quoted: m });
  if (!m.isAdmins) return Matrix.sendMessage(m.from, { text: "❌ Only admins can use this." }, { quoted: m });
  if (!m.isBotAdmins) return Matrix.sendMessage(m.from, { text: "❌ I need admin role to lock." }, { quoted: m });

  try {
    await Matrix.groupSettingUpdate(m.from, "locked");
    await Matrix.sendMessage(m.from, { text: "✅ Group has been locked." }, { quoted: m });
  } catch (e) {
    console.error("lockgc error:", e);
    await Matrix.sendMessage(m.from, { text: `❌ Failed: ${e.message}` }, { quoted: m });
  }
}

/**
 * newgc: Create a new group
 */
export async function newgc(m, Matrix) {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";
  if (cmd !== "newgc") return;

  const body = m.body.slice(prefix.length + cmd.length).trim();
  if (!body || !body.includes(";")) {
    return Matrix.sendMessage(m.from, { text: `Usage: ${prefix}newgc groupName;number1,number2,...` }, { quoted: m });
  }
  const [groupName, nums] = body.split(";");
  const participants = nums.split(",").map(n => n.trim()+"@s.whatsapp.net");

  try {
    const group = await Matrix.groupCreate(groupName, participants);
    const link = await Matrix.groupInviteCode(group.id);
    await Matrix.sendMessage(group.id, { text: `👋 Welcome!` });
    await Matrix.sendMessage(
      m.from,
      { text: `✨ New group created! https://chat.whatsapp.com/${link}` },
      { quoted: m }
    );
  } catch (e) {
    console.error("newgc error:", e);
    await Matrix.sendMessage(m.from, { text: `❌ Error: ${e.message}` }, { quoted: m });
  }
}

/**
 * out: Remove members by country code (owner only)
 */
export async function out(m, Matrix) {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";
  if (cmd !== "out") return;

  await doReact("❌", m, Matrix);
  if (!m.isGroup) return Matrix.sendMessage(m.from, { text: "❌ Only in groups." }, { quoted: m });

  const botOwner = Matrix.user.id.split(":")[0];
  if (m.sender.split("@")[0] !== botOwner) {
    return Matrix.sendMessage(m.from, { text: "❌ Only the bot owner can use this." }, { quoted: m });
  }

  const code = m.body.slice(prefix.length + cmd.length).trim();
  if (!code || !/^\d+$/.test(code)) {
    return Matrix.sendMessage(m.from, { text: "❌ Provide a numeric country code, e.g. .out 92" }, { quoted: m });
  }

  try {
    const meta = await Matrix.groupMetadata(m.from);
    const targets = meta.participants.filter(p => p.id.startsWith(code) && !p.admin);
    if (!targets.length) {
      return Matrix.sendMessage(m.from, { text: `❌ No members with country code +${code}` }, { quoted: m });
    }
    const jids = targets.map(p => p.id);
    await Matrix.groupParticipantsUpdate(m.from, jids, "remove");
    await Matrix.sendMessage(m.from, { text: `✅ Removed ${jids.length} members with code +${code}` }, { quoted: m });
  } catch (e) {
    console.error("out error:", e);
    await Matrix.sendMessage(m.from, { text: `❌ Failed: ${e.message}` }, { quoted: m });
  }
}

/**
 * poll: Create a poll
 */
export async function poll(m, Matrix) {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";
  if (cmd !== "poll") return;

  await doReact("📊", m, Matrix);
  const body = m.body.slice(prefix.length + cmd.length).trim();
  if (!body.includes(";")) {
    return Matrix.sendMessage(m.from, { text: `Usage: ${prefix}poll question;opt1,opt2,...` }, { quoted: m });
  }
  const [question, optStr] = body.split(";");
  const options = optStr.split(",").map(o => o.trim()).filter(o => o);
  if (options.length < 2) {
    return Matrix.sendMessage(m.from, { text: "❌ Provide at least two options." }, { quoted: m });
  }

  try {
    await Matrix.sendMessage(
      m.from,
      { poll: { name: question, values: options, selectableCount: 1 } },
      { quoted: m }
    );
  } catch (e) {
    console.error("poll error:", e);
    await Matrix.sendMessage(m.from, { text: `❌ Failed: ${e.message}` }, { quoted: m });
  }
}

/**
 * revoke: Revoke group invite link
 */
export async function revoke(m, Matrix) {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";
  if (!["revoke","revokegrouplink","resetglink","revokelink","f_revoke"].includes(cmd)) return;

  await doReact("🖇️", m, Matrix);
  if (!m.isGroup) return Matrix.sendMessage(m.from,{ text:"❌ Only in groups."},{ quoted: m });
  if (!m.isAdmins) return Matrix.sendMessage(m.from,{ text:"❌ Only admins."},{ quoted: m });
  if (!m.isBotAdmins) return Matrix.sendMessage(m.from,{ text:"❌ I need admin role."},{ quoted: m });

  try {
    await Matrix.groupRevokeInvite(m.from);
    await Matrix.sendMessage(m.from,{ text: "✅ Group link has been reset."},{ quoted: m });
  } catch (e) {
    console.error("revoke error:", e);
    await Matrix.sendMessage(m.from,{ text:`❌ Error: ${e.message}`},{ quoted: m });
  }
}

/**
 * hidetag: Mention all members without showing tags
 */
export async function hidetag(m, Matrix) {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";
  if (!["hidetag","tag","f_tag"].includes(cmd)) return;

  await doReact("🔊", m, Matrix);
  if (!m.isGroup) return Matrix.sendMessage(m.from,{ text:"❌ Only in groups."},{ quoted: m });
  if (!m.isAdmins) return Matrix.sendMessage(m.from,{ text:"❌ Only admins."},{ quoted: m });
  if (!m.isBotAdmins) return Matrix.sendMessage(m.from,{ text:"❌ I need admin role."},{ quoted: m });

  const text = m.body.slice(prefix.length + cmd.length).trim();
  if (!text) return Matrix.sendMessage(m.from,{ text:"❌ Provide message to tag."},{ quoted: m });

  try {
    const meta = await Matrix.groupMetadata(m.from);
    const mentions = meta.participants.map(p => p.id);
    await Matrix.sendMessage(
      m.from,
      { text, mentions },
      { quoted: m }
    );
  } catch (e) {
    console.error("hidetag error:", e);
    await Matrix.sendMessage(m.from,{ text:`❌ Error: ${e.message}`},{ quoted: m });
  }
}

/**
 * unlockgc: Unlock the group
 */
export async function unlockgc(m, Matrix) {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";
  if (!["unlockgc","unlock"].includes(cmd)) return;

  await doReact("🔓", m, Matrix);
  if (!m.isGroup) return Matrix.sendMessage(m.from,{ text:"❌ Only in groups."},{ quoted: m });
  if (!m.isAdmins) return Matrix.sendMessage(m.from,{ text:"❌ Only admins."},{ quoted: m });
  if (!m.isBotAdmins) return Matrix.sendMessage(m.from,{ text:"❌ I need admin role."},{ quoted: m });

  try {
    await Matrix.groupSettingUpdate(m.from, "unlocked");
    await Matrix.sendMessage(m.from,{ text:"✅ Group unlocked."},{ quoted: m });
  } catch (e) {
    console.error("unlockgc error:", e);
    await Matrix.sendMessage(m.from,{ text:`❌ Error: ${e.message}`},{ quoted: m });
  }
}

/**
 * unmute: Enable messaging for all
 */
export async function unmute(m, Matrix) {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";
  if (!["unmute","groupunmute"].includes(cmd)) return;

  await doReact("🔊", m, Matrix);
  if (!m.isGroup) return Matrix.sendMessage(m.from,{ text:"❌ Only in groups."},{ quoted: m });
  if (!m.isAdmins) return Matrix.sendMessage(m.from,{ text:"❌ Only admins."},{ quoted: m });
  if (!m.isBotAdmins) return Matrix.sendMessage(m.from,{ text:"❌ I need admin role."},{ quoted: m });

  try {
    await Matrix.groupSettingUpdate(m.from, "not_announcement");
    await Matrix.sendMessage(m.from,{ text:"✅ Group unmuted."},{ quoted: m });
  } catch (e) {
    console.error("unmute error:", e);
    await Matrix.sendMessage(m.from,{ text:`❌ Error: ${e.message}`},{ quoted: m });
  }
}
