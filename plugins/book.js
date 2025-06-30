import config from '../config.cjs';

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key }
    });
  } catch (error) {
    console.error('Error sending reaction:', error);
  }
}

const book = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
    : '';

  if (cmd !== 'book') return;

  await doReact('📘', m, Matrix);

  const args = m.body.trim().slice(prefix.length + cmd.length).trim().split(/\s+/);
  const text = args.join(' ');

  if (!text) {
    return Matrix.sendMessage(
      m.from,
      { text: "❗Please provide some text.\n\nExample: *.book DavidCyril*" },
      { quoted: m }
    );
  }

  const newsletterContext = {
    mentionedJid: [m.sender],
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363292876277898@newsletter',
      newsletterName: '𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇',
      serverMessageId: 143,
    },
  };

  try {
    const url = `https://apis.davidcyriltech.my.id/generate/book?text=${encodeURIComponent(text)}&size=35`;

    await Matrix.sendMessage(
      m.from,
      {
        image: { url },
        caption: `📝 Book generated for: ${text}\n\n*© POWERED BY LUNA MD*`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  } catch (e) {
    console.error(e);
    await Matrix.sendMessage(
      m.from,
      { text: `❌ Error: ${e.message || e}` },
      { quoted: m }
    );
  }
};

export default book;
