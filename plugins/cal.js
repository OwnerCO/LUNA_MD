import config from '../config.cjs';

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
    });
  } catch (error) {
    console.error('Error sending reaction:', error);
  }
}

const calendar = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
    : '';

  if (cmd !== 'calendar' && cmd !== 'cal') return;

  await doReact('🗓️', m, Matrix);

  const args = m.body.trim().slice(prefix.length + cmd.length).trim().split(/\s+/);
  let month = parseInt(args[0]);
  let year = parseInt(args[1]);
  const now = new Date();

  if (!month || month < 1 || month > 12) month = now.getUTCMonth() + 1;
  if (!year || year < 1000) year = now.getUTCFullYear();

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  let output = `🗓️ *Calendar for ${month}/${year} (GMT)*\n\`\`\`\n`;
  output += days.join(' ') + '\n';

  let dayString = '   '.repeat(firstDay);
  for (let date = 1; date <= daysInMonth; date++) {
    dayString += String(date).padStart(2, ' ') + ' ';
    if ((firstDay + date) % 7 === 0 || date === daysInMonth) {
      output += dayString.trimEnd() + '\n';
      dayString = '';
    }
  }
  output += '```';

  const newsletterContext = {
    mentionedJid: [m.sender],
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363292876277898@newsletter',
      newsletterName: '𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇',
      serverMessageId: 146,
    },
  };

  try {
    await Matrix.sendMessage(
      m.from,
      { text: output, contextInfo: newsletterContext },
      { quoted: m }
    );
  } catch (e) {
    console.error('Calendar command error:', e);
    await Matrix.sendMessage(
      m.from,
      { text: '❌ Error generating calendar. ' + e.message },
      { quoted: m }
    );
  }
};

export default calendar;
