const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const FormData = require('form-data');

cmd({
    pattern: "rmbg",
    alias: ["removebg", "bgless"],
    desc: "🖼️ Remove background from an image",
    category: "utility",
    use: ".rmbg (reply to image)",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, {
    from, quoted, sender, reply
}) => {
    try {
        const qmsg = quoted ? quoted.message : null;
        const isImage = qmsg?.imageMessage;

        if (!isImage) {
            return reply("📸 *Please reply to an image, sweetie.*\n\n_Example:_ Send an image, then type `.rmbg`\n\n– LUNA MD 😇");
        }

        // Download the image
        const mediaPath = path.join(os.tmpdir(), `${Date.now()}.jpg`);
        const buffer = await conn.downloadMediaMessage(quoted);
        fs.writeFileSync(mediaPath, buffer);

        // Step 1: Upload to imgbb
        const form1 = new FormData();
        form1.append("image", fs.createReadStream(mediaPath));
        const imgbb = await axios.post(
            `https://api.imgbb.com/1/upload?key=f342084918d24b0c0e18bd4bf8c8594e`,
            form1,
            { headers: form1.getHeaders() }
        );
        const imageUrl = imgbb.data.data.url;

        // Step 2: Send to remove.bg
        const form2 = new FormData();
        form2.append("image_url", imageUrl);
        form2.append("size", "auto");
        const result = await axios.post("https://api.remove.bg/v1.0/removebg", form2, {
            headers: {
                ...form2.getHeaders(),
                "X-Api-Key": "9b8foyjCo73GJMn8VUvsJzgC"
            },
            responseType: "arraybuffer"
        });

        const nobgPath = path.join(os.tmpdir(), `${Date.now()}_nobg.png`);
        fs.writeFileSync(nobgPath, result.data);

        // Newsletter style
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

        // Send final image
        await conn.sendMessage(from, {
            image: fs.readFileSync(nobgPath),
            caption: `✅ *Done!* Here’s your image with no background 🌈\n\n– LUNA MD 😇`,
            contextInfo: newsletterContext
        }, { quoted: mek });

        // Cleanup
        fs.unlinkSync(mediaPath);
        fs.unlinkSync(nobgPath);

    } catch (e) {
        console.error("💥 RemoveBG Error:", e);
        await conn.sendMessage(from, {
            image: { url: "https://i.ibb.co/9m0ZcH1N/Chat-GPT-Image-28-juin-2025-01-24-41.png" },
            caption: `😢 *Oops! I couldn’t remove the background from that image.*\n\nTry again later, okie?\n\n– LUNA MD 😇`,
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
