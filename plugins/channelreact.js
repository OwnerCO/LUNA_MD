import config from '../config.cjs';

const stylizedChars = {
  a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
  h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
  o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
  v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
  '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
  '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
};

async function chr(m, Matrix) {
  const prefix = config.PREFIX;
  const body = m.body || '';
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
    : '';

  if (cmd !== 'chr' && cmd !== 'creact') return;

  const args = body.trim().slice(prefix.length + cmd.length).trim().split(/\s+/);
  if (args.length < 2) {
    return Matrix.sendMessage(
      m.from,
      { text: `Usage:\n${prefix}${cmd} https://whatsapp.com/channel/1234567890/175 hello` },
      { quoted: m }
    );
  }

  

  const [link, ...textParts] = args;
  if (!link.includes("whatsapp.com/channel/")) {
    return Matrix.sendMessage(
      m.from,
      { text: '❌ Invalid channel link format' },
      { quoted: m }
    );
  }

  const inputText = textParts.join(' ').toLowerCase();
  if (!inputText) {
    return Matrix.sendMessage(
      m.from,
      { text: '❌ Please provide text to convert' },
      { quoted: m }
    );
  }

  const emoji = inputText
    .split('')
    .map(char => (char === ' ' ? '―' : stylizedChars[char] || char))
    .join('');

  const parts = link.split('/');
  const channelId = parts[4];
  const messageId = parts[5];

  if (!channelId || !messageId) {
    return Matrix.sendMessage(
      m.from,
      { text: '❌ Invalid link - missing channel or message ID' },
      { quoted: m }
    );
  }

  try {
    const channelMeta = await Matrix.newsletterMetadata('invite', channelId);
    await Matrix.newsletterReactMessage(channelMeta.id, messageId, emoji);

    return Matrix.sendMessage(
      m.from,
      {
        text: `╭━━━〔 *LUNA MD* 〕━━━┈⊷
┃▸ *Success!* Reaction sent
┃▸ *Channel:* ${channelMeta.name}
┃▸ *Reaction:* ${emoji}
╰────────────────┈⊷
> *© POWERED BY LUNA MD*`
      },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    return Matrix.sendMessage(
      m.from,
      { text: `❎ Error: ${e.message || "Failed to send reaction"}` },
      { quoted: m }
    );
  }
}

export default chr;
