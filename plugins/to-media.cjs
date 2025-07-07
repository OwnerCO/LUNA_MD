const { cmd } = require('../command');
const PDFDocument = require('pdfkit');
const { Buffer } = require('buffer');

cmd({
    pattern: "topdf",
    alias: ["pdf"],
    desc: "Convert provided text to a PDF file.",
    react: "📄",
    category: "utilities",
    filename: __filename
},
async (conn, mek, m, { from, q, sender, reply }) => {
    try {
        if (!q) return reply("Please provide the text you want to convert to PDF. *Eg* `.topdf Pakistan ZindaBad 🇵🇰`");

        // Create a new PDF document
        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);

            // Newsletter context info
            const newsletterContext = {
                mentionedJid: [sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363292876277898@newsletter',
                    newsletterName: "𝐇𝐀𝐍𝐒",
                    serverMessageId: 143,
                },
            };

            // Send the PDF file with newsletter context
            await conn.sendMessage(from, {
                document: pdfData,
                mimetype: 'application/pdf',
                fileName: 'LUNA😇.pdf',
                caption: `
*📄 PDF created successfully!*

> © LUNA MD😇`
            }, { quoted: mek, contextInfo: newsletterContext });
        });

        // Add text to the PDF
        doc.text(q);

        // Finalize the PDF and end the stream
        doc.end();

    } catch (e) {
        console.error(e);
        reply(`Error: ${e.message}`);
    }
});
cmd({
  pattern: "readqr",
  desc: "Read QR code from an image.",
  category: "utility",
  react: "🔍",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply, args = [], sender }) => {
  try {
    let imageUrl;

    if (args[0] && args[0].startsWith("http")) {
      imageUrl = args[0];
    } else {
      const msg = quoted || mek;

      // 🔍 Check if it's a valid image message
      const mime = msg.message?.imageMessage?.mimetype || "";
      if (!mime.startsWith("image")) return reply("📷 Please reply to a valid image message.");

      // 📥 Try downloading the image
      const buffer = await conn.downloadMediaMessage(msg);
      if (!buffer || buffer.length === 0) {
        return reply("❌ Cannot download image. Make sure it's not expired or too old.");
      }

      // 🖼 Save temp file
      const tmp = path.join(__dirname, "temp_qr.jpg");
      fs.writeFileSync(tmp, buffer);

      // 📤 Upload to imgbb
      const form = new FormData();
      form.append("image", fs.createReadStream(tmp));
      const upload = await axios.post("https://api.imgbb.com/1/upload?key=f342084918d24b0c0e18bd4bf8c8594e", form, {
        headers: form.getHeaders()
      });

      fs.unlinkSync(tmp);

      if (!upload.data?.data?.url) throw new Error("❌ Failed to upload image.");
      imageUrl = upload.data.data.url;
    }

    // 📡 Decode QR
    const qrApi = `https://api.giftedtech.web.id/api/tools/readqr?apikey=gifted&url=${encodeURIComponent(imageUrl)}`;
    const result = await axios.get(qrApi);

    if (!result.data?.success || !result.data?.result?.qrcode_data) {
      throw new Error("❌ No QR code detected in the image.");
    }

    await conn.sendMessage(from, {
      text: `✅ *QR Code Content:*\n\n🧾 ${result.data.result.qrcode_data}`,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 1000,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363292876277898@newsletter",
          newsletterName: "𝐇𝐀𝐍𝐒",
          serverMessageId: 145
        }
      }
    }, { quoted: mek });

  } catch (err) {
    console.error("❌ readqr error:", err);
    reply(`❌ Error: ${err.message || err}`);
  }
});

cmd({
    pattern: "qr",
    alias: ["qrcode"],
    react: "📲",
    desc: "Generate a QR code from text",
    category: "tools",
    use: '.qr <text>',
    filename: __filename
},
async (conn, mek, m, { from, reply, q, sender }) => {
    if (!q || !q.trim()) {
        return await reply("Please provide text to generate a QR code!");
    }
    
    try {
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(q)}&size=500x500`;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒",
                serverMessageId: 145
            }
        };
        
        await conn.sendMessage(from, { 
            image: { url: apiUrl }, 
            caption: `✅ QR Code Generated for: ${q}`, 
            contextInfo: newsletterContext 
        }, { quoted: mek });
        
    } catch (error) {
        console.error(error);
        reply('❌ Error generating QR code. Try again later.');
    }
});