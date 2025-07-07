import moment from 'moment-timezone';
import config from '../config.cjs';

export default async function GroupParticipants(sock, { id, participants, action, m }, Matrix) {
  try {
    const metadata = await sock.groupMetadata(id);

    for (const jid of participants) {
      let profile;
      try {
        profile = await sock.profilePictureUrl(jid, 'image');
      } catch {
        profile = 'https://lh3.googleusercontent.com/proxy/esjjzRYoXlhgNYXqU8Gf_3lu6V-eONTnymkLzdwQ6F6z0MWAqIwIpqgq_lk4caRIZF_0Uqb5U8NWNrJcaeTuCjp7xZlpL48JDx-qzAXSTh00AVVqBoT7MJ0259pik9mnQ1LldFLfHZUGDGY=w1200-h630-p-k-no-nu';
      }

      const userName = jid.split('@')[0];
      const nowGMT = moment.tz('Etc/GMT').format('HH:mm:ss');
      const todayGMT = moment.tz('Etc/GMT').format('DD/MM/YYYY');
      const membersCount = metadata.participants.length;

      if (action === 'add' && config.WELCOME === 'true') {
        const text = 
`👋 *Hello* @${userName}!

Welcome to *${metadata.subject}* 🎉

✨ You are member number *${membersCount}*

⏰ Joined at: *${nowGMT} GMT* on *${todayGMT}*

Enjoy your stay! 🚀`;

        await sock.sendMessage(id, {
          text,
          contextInfo: {
            mentionedJid: [jid],
            externalAdReply: {
              title: `Welcome to ${metadata.subject}`,
              mediaType: 1,
              renderLargerThumbnail: true,
              thumbnailUrl: profile,
            },
          },
        });

        // Optional: Matrix sendMessage with image
        if (Matrix?.sendMessage) {
          await Matrix.sendMessage(m.from, {
            image: { url: "https://i.ibb.co/6Rxhg321/Chat-GPT-Image-Mar-30-2025-03-39-42-AM.png" },
            caption: text,
            contextInfo: {
              mentionedJid: [m.sender],
              forwardingScore: 1000,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
                newsletterName: "𝐋𝐔𝐍𝐀 𝐌𝐃",
                serverMessageId: 151,
              },
            },
          });
        }

      } else if (action === 'remove' && config.WELCOME === 'true') {
        const text =
`👋 *Goodbye* @${userName}!

We're now *${membersCount}* members in *${metadata.subject}*.

⏰ Left at: *${nowGMT} GMT* on *${todayGMT}*

We'll miss you! 💔`;

        await sock.sendMessage(id, {
          text,
          contextInfo: {
            mentionedJid: [jid],
            externalAdReply: {
              title: `Farewell from ${metadata.subject}`,
              mediaType: 1,
              renderLargerThumbnail: true,
              thumbnailUrl: profile,
              sourceUrl: 'https://sid-bhai.vercel.app',
            },
          },
        });

        // Optional: Matrix farewell
        if (Matrix?.sendMessage) {
          await Matrix.sendMessage(m.from, {
            image: { url: "https://i.ibb.co/6Rxhg321/Chat-GPT-Image-Mar-30-2025-03-39-42-AM.png" },
            caption: text,
            contextInfo: {
              mentionedJid: [m.sender],
              forwardingScore: 1000,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
                newsletterName: "𝐋𝐔𝐍𝐀 𝐌𝐃",
                serverMessageId: 151,
              },
            },
          });
        }
      }
    }
  } catch (e) {
    console.error('❌ GroupParticipants error:', e);
  }
}
