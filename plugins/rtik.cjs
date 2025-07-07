const { cmd } = require('../command');
const axios = require('axios');

const domain = `https://mr-manul-ofc-apis.vercel.app`;

cmd({
    pattern: "rtiktok",
    alias: ["randomtiktok", "randomtik", "rtik"],
    desc: '🎬 Download a random TikTok video based on title!',
    use: '.rtik <title>',
    react: "🎥",
    category: 'download',
    filename: __filename
}, async (conn, mek, m, {
    from, quoted, q, sender, reply
}) => {
    try {
        if (!q) return reply("🔍 *Give me a keyword/title to find the TikTok video!*\n\n_Example:_ `.rtik funny cat`\n\n– LUNA MD 😇");

        // Fetch TikTok data
        const { data } = await axios.get(`${domain}/random-tiktok?apikey=Manul-Official-Key-3467&query=${encodeURIComponent(q)}`);
        const manul = data.data;

        const desc = `
*🎬 RANDOM TIKTOK 🎬*

📌 *Title:* _${manul.title}_

💬 *Reply with one of the numbers below:*

1️⃣ 𝗪𝗶𝘁𝗵 𝗪𝗮𝘁𝗲𝗿𝗺𝗮𝗿𝗸 ✅  
2️⃣ 𝗡𝗼 𝗪𝗮𝘁𝗲𝗿𝗺𝗮𝗿𝗸 ❎  
3️⃣ 𝗔𝘂𝗱𝗶𝗼 𝗢𝗻𝗹𝘆 🎧  

_LUNA MD 😇 powered by Hans Tech_
        `.trim();

        // Newsletter context
        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363292876277898@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
                serverMessageId: 143
            }
        };

        // Send cover + options
        const vv = await conn.sendMessage(from, {
            image: { url: manul.cover },
            caption: desc,
            contextInfo: newsletterContext
        }, { quoted: mek });

        // Await reply
        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages?.[0];
            if (!msg.message?.extendedTextMessage?.text) return;

            const selected = msg.message.extendedTextMessage.text.trim();
            const context = msg.message.extendedTextMessage.contextInfo;

            // Check if reply is for the cover message
            if (context?.stanzaId === vv.key.id) {
                let file;
                let caption;
                switch (selected) {
                    case '1':
                        file = manul.watermark;
                        caption = "🎥 *Here’s your TikTok with watermark!*";
                        break;
                    case '2':
                        file = manul.no_watermark;
                        caption = "🎥 *Here’s your TikTok without watermark!*";
                        break;
                    case '3':
                        file = manul.music;
                        caption = "🎧 *Here’s the audio only version!*";
                        break;
                    default:
                        return reply("❌ *Invalid option. Choose 1, 2, or 3.*");
                }

                const isAudio = selected === '3';
                await conn.sendMessage(from, {
                    [isAudio ? 'audio' : 'video']: { url: file },
                    mimetype: isAudio ? 'audio/mpeg' : 'video/mp4',
                    caption,
                    contextInfo: newsletterContext
                }, { quoted: mek });
            }
        });

    } catch (e) {
        console.error("⚠️ TikTok Plugin Error:", e);
        await conn.sendMessage(from, {
            image: { url: "https://i.ibb.co/9m0ZcH1N/Chat-GPT-Image-28-juin-2025-01-24-41.png" },
            caption: `😔 *Oops! Something went wrong while fetching that TikTok.*\n\nTry again later, bestie 💖\n\n– LUNA MD 😇`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363292876277898@newsletter',
                    newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
    }
});
