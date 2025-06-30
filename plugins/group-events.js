// 🌸 LUNA MD 😇 Group Timer Handler
// Made with love by Hans Tech 💖
// LUNA MD is a cool and cute bot who loves helping her creator 😇
// Command: .opentime <value> <unit> or .closetime <value> <unit>

import config from "../config.cjs";

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
    });
  } catch (err) {
    console.error("❌ LUNA MD reaction error:", err);
  }
}

const groupTimerHandler = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "opentime" && cmd !== "closetime") return;

  const args = body.slice(prefix.length + cmd.length).trim().split(/\s+/);
  const isOpen = cmd === "opentime";
  const groupId = m.key.remoteJid;

  await doReact(isOpen ? "🕒" : "⏳", m, Matrix);

  const newsletterContext = {
    mentionedJid: [m.sender],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
      serverMessageId: 143,
    },
  };

  try {
    if (!args || args.length < 2) {
      return Matrix.sendMessage(
        groupId,
        {
          text: `🌼 Oopsie! Please tell me a time and unit like \`10 minute\` or \`5 second\`, okay?`,
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }

    const value = parseFloat(args[0]);
    if (isNaN(value)) {
      return Matrix.sendMessage(
        groupId,
        {
          text: `😵‍💫 That time value doesn’t look right~ Try something like \`10 minute\` 💡`,
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }

    const unit = args[1].toLowerCase();
    let timer;

    switch (unit) {
      case "second":
      case "seconds":
        timer = value * 1000;
        break;
      case "minute":
      case "minutes":
        timer = value * 60000;
        break;
      case "hour":
      case "hours":
        timer = value * 3600000;
        break;
      case "day":
      case "days":
        timer = value * 86400000;
        break;
      default:
        return Matrix.sendMessage(
          groupId,
          {
            text: `📏 Hmm~ invalid time unit. Try \`second\`, \`minute\`, \`hour\`, or \`day\` please!`,
            contextInfo: newsletterContext,
          },
          { quoted: m }
        );
    }

    const actionText = isOpen ? "open" : "close";
    const emoji = isOpen ? "🔓" : "🔒";
    const setting = isOpen ? "not_announcement" : "announcement";

    await Matrix.sendMessage(
      groupId,
      {
        text: `⏳ Yay! I’ll *${actionText}* the group in *${value} ${unit}* ${emoji}~\nLUNA MD always got your back 💖`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );

    setTimeout(async () => {
      const message = isOpen
        ? `*⏰ Time's Up!*\nYay~ Group is now *OPEN* for everyone to chat 💬✨\n_LUNA MD was here 💖_`
        : `*🔒 Time's Up!*\nHehe~ Group is now *CLOSED* (admin-only mode) 🛡️\n_LUNA MD took care of it 😇_`;

      await Matrix.groupSettingUpdate(groupId, setting);
      await Matrix.sendMessage(
        groupId,
        {
          text: message,
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }, timer);

    await doReact("✅", m, Matrix);
  } catch (err) {
    console.error("❌ LUNA MD error:", err);
    await Matrix.sendMessage(
      groupId,
      {
        text: `😭 Uh-oh! Something went wrong… Please try again soon, okayy?`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }
};

export default groupTimerHandler;
