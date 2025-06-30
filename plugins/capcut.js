import axios from 'axios';

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key }
    });
  } catch (error) {
    console.error('Error sending reaction:', error);
  }
}

const cpt = async (m, Matrix) => {
  const prefix = '/'; // or import from config if you have it
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
    : '';

  if (!['cpt', 'capcut', 'capcut-dl'].includes(cmd)) return;

  await doReact('🎥', m, Matrix);

  const args = m.body.trim().slice(prefix.length + cmd.length).trim();
  const url = args;

  if (!url || !url.startsWith('http')) {
    return Matrix.sendMessage(
      m.from,
      { text: '❌ Please provide a valid Capcut link.' },
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
    const response = await axios.get(`https://api.diioffc.web.id/api/download/capcut?url=${encodeURIComponent(url)}`);
    const data = response.data;

    if (!data || data.status !== true || !data.result || !data.result.url) {
      return Matrix.sendMessage(
        m.from,
        { text: '⚠️ Failed to fetch Capcut content. Please check the link and try again.' },
        { quoted: m }
      );
    }

    await Matrix.sendMessage(
      m.from,
      {
        video: { url: data.result.url },
        mimetype: 'video/mp4',
        caption: `📥 *Capcut Template Downloaded*\n🎥 *Title:* ${data.result.title}\n📏 *Size:* ${data.result.size}`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  } catch (error) {
    console.error('Error:', error);
    await Matrix.sendMessage(
      m.from,
      { text: '❌ An error occurred while processing your request. Please try again.' },
      { quoted: m }
    );
  }
};

export default cpt;
