import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import os from "os";
import path from "path";
import config from "../config.cjs";

// Reaction helper
async function doReact(emoji, m, Matrix) {
  try {
    await Matrix.sendMessage(m.key.remoteJid, {
      react: { text: emoji, key: m.key },
    });
  } catch (e) {
    console.error("Reaction error:", e);
  }
}

const newsletterContext = {
  forwardingScore: 1000,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363292876277898@newsletter",
    newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
    serverMessageId: 143,
  },
};

// Image Enhancement Command
const reminiCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  // Helper function for replies
  const reply = async (text, options = {}) => {
    await Matrix.sendMessage(
      m.from,
      {
        text,
        ...(options.contextInfo ? { contextInfo: options.contextInfo } : {}),
      },
      { quoted: m }
    );
  };

  if (["remini", "enhance", "aiimage"].includes(cmd)) {
    await doReact("🪄", m, Matrix);
    try {
      const args = body.slice(prefix.length).trim().split(" ").slice(1);
      let imageUrl = "";
      
      // Check for direct URL
      if (args[0]?.startsWith("http")) {
        imageUrl = args[0];
        await doReact("🔗", m, Matrix);
      } 
      // Check for image attachment
      else if (m.message?.imageMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        await doReact("📸", m, Matrix);
        
        try {
          // Download image
          const buffer = await Matrix.downloadMediaMessage(m);
          const tempPath = path.join(os.tmpdir(), `luna_${Date.now()}.jpg`);
          fs.writeFileSync(tempPath, buffer);
          
          // Upload to imgbb
          const form = new FormData();
          form.append("image", fs.createReadStream(tempPath));
          
          const upload = await axios.post(
            "https://api.imgbb.com/1/upload?key=f342084918d24b0c0e18bd4bf8c8594e", 
            form, 
            { headers: form.getHeaders() }
          );
          
          fs.unlinkSync(tempPath); // Cleanup
          
          if (!upload.data?.data?.url) throw "Failed to upload image";
          imageUrl = upload.data.data.url;
        } catch (e) {
          console.error("Image upload error:", e);
          throw "❌ Couldn't process your image. Please try again with a clearer photo! 💖";
        }
      } 
      // No valid input found
      else {
        return await reply(
          "✨ *LUNA's Image Enhancer* 🪄\n\n" +
          "Send me a photo to make it magical!\n\n" +
          "How to use:\n" +
          `1. Reply to an image with *${prefix}remini*\n` +
          `2. Or send *${prefix}remini [image-url]*\n\n` +
          "I'll transform your photo with AI magic! ✨"
        );
      }

      // Enhance image with Remini API
      await reply("✨ *Working my magic!* 🪄\nEnhancing your image... Please wait! ⏳");
      
      const response = await axios.get(
        `https://api.giftedtech.web.id/api/tools/remini?apikey=gifted&url=${encodeURIComponent(imageUrl)}`,
        { timeout: 60000 }
      );
      
      if (!response.data?.success || !response.data?.result?.image_url) {
        throw "The AI enhancement failed. Try with a different image? 💖";
      }

      // Send enhanced image
      await Matrix.sendMessage(
        m.from,
        {
          image: { url: response.data.result.image_url },
          caption: "✨ *LUNA's Enhancement Magic* 🪄\n\n" +
                   "Your image has been transformed!\n" +
                   "Before ➡️ After\n\n" +
                   "Made with 💖 by Hans Tech",
          contextInfo: newsletterContext
        },
        { quoted: m }
      );

      await doReact("✨", m, Matrix);
      
    } catch (e) {
      console.error("Remini error:", e);
      await reply(
        "❌ *Oh no!* 🥺\n\n" +
        "My magic wand malfunctioned! Here's what happened:\n" +
        `_${e.message || e || "Unknown error"}_\n\n` +
        "Try again with a different image? 💖\n" +
        "~ Your magical friend LUNA 🌙"
      );
    }
    return;
  }
};

export default reminiCmd;