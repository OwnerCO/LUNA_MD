import config from '../config.cjs';
import axios from 'axios';

async function claude(m, Matrix) {
  const prefix = config.PREFIX;
  const body = m.body || '';
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
    : '';

  if (!['claude', 'claudeai', 'sonnet', 'ai3'].includes(cmd)) return;

  const args = body.trim().slice(prefix.length + cmd.length).trim().split(/\s+/);
  let q = args.join(' ');
  if (!q) q = "Hey";

  const newsletterContext = {
    mentionedJid: [m.sender],
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363292876277898@newsletter',
      newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
      serverMessageId: 143,
    },
  };

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/ai/claudeSonnet?text=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.response) {
      return Matrix.sendMessage(
        m.from,
        { text: "❌ Claude AI response error! Please try again." },
        { quoted: m }
      );
    }

    await Matrix.sendMessage(
      m.from,
      {
        text: `🧠 **Claude AI:**\n\n${data.response}`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    await Matrix.sendMessage(
      m.from,
      { text: `❌ Error: ${e.message}` },
      { quoted: m }
    );
  }
}

export default claude;
