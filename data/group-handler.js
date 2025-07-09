import moment from 'moment-timezone';
import config from '../config.cjs';

export default async function GroupParticipants(sock, { id, participants, action }) {
  try {
    const metadata = await sock.groupMetadata(id);

    for (const jid of participants) {
      // Get user profile picture or fallback
      let profile;
      try {
        profile = await sock.profilePictureUrl(jid, 'image');
      } catch {
        profile = 'https://lh3.googleusercontent.com/proxy/esjjzRYoXlhgNYXqU8Gf_3lu6V-eONTnymkLzdwQ6F6z0MWAqIwIpqgq_lk4caRIZF_0Uqb5U8NWNrJcaeTuCjp7xZlpL48JDx-qzAXSTh00AVVqBoT7MJ0259pik9mnQ1LldFLfHZUGDGY=w1200-h630-p-k-no-nu';
      }

      const userName = jid.split('@')[0];
      const currentTime = moment().tz('GMT').format('HH:mm:ss');
      const currentDate = moment().tz('GMT').format('DD/MM/YYYY');
      const membersCount = metadata.participants.length;

      if (action === 'add' && config.WELCOME === 'true') {
        const welcomeMsg = 
          `👋 Hello @${userName}! Welcome to *${metadata.subject}*.\n` +
          `🎉 You are member number ${membersCount}.\n` +
          `⏰ Joined at ${currentTime} GMT on ${currentDate}.`;

        await sock.sendMessage(id, {
          text: welcomeMsg,
          contextInfo: {
            mentionedJid: [jid],
            externalAdReply: {
              title: 'Welcome',
              mediaType: 1,
              previewType: 0,
              renderLargerThumbnail: true,
              thumbnailUrl: profile,
              sourceUrl: 'https://whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O',
            },
          },
        });
      } else if (action === 'remove' && config.WELCOME === 'true') {
        const leaveMsg =
          `👋 Goodbye @${userName}!\n` +
          `😢 We're now ${membersCount} members in *${metadata.subject}*.\n` +
          `⏰ Left at ${currentTime} GMT on ${currentDate}.`;

        await sock.sendMessage(id, {
          text: leaveMsg,
          contextInfo: {
            mentionedJid: [jid],
            externalAdReply: {
              title: 'Goodbye',
              mediaType: 1,
              previewType: 0,
              renderLargerThumbnail: true,
              thumbnailUrl: profile,
              sourceUrl: 'https://whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O',
            },
          },
        });
      }
    }
  } catch (error) {
    console.error('GroupParticipants error:', error);
    throw error;
  }
}
