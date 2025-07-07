import axios from "axios";
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

// Islamic Commands Handler
const islamicCommands = async (m, Matrix) => {
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

  // 📖 Surah List Command
  if (["surahlist", "listsurahs"].includes(cmd)) {
    await doReact("🕌", m, Matrix);
    try {
      const surahList = `
🕋 *بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ* 🕋
✨ *LUNA's Quran Guide* ✨

🤲 *Assalamu Alaikum dear friend!*  
Here are the blessed Surahs from the Holy Quran 🌙:

1. Al-Fatihah (The Opening) - سورة الفاتحة
2. Al-Baqarah (The Cow) - سورة البقرة
3. Ali 'Imran (Family of Imran) - سورة آل عمران
4. An-Nisa (The Women) - سورة النساء
5. Al-Ma'idah (The Table Spread) - سورة المائدة
...
114. An-Nas (Mankind) - سورة الناس

💖 To read a Surah:
Type *${prefix}quran <number>*
Example: *${prefix}quran 1* for Surah Al-Fatihah

🕯️ *"This is the Book about which there is no doubt, a guidance for the righteous"* (Quran 2:2)
May Allah bless your journey through His words 🤍
      `;
      await reply(surahList, { contextInfo: newsletterContext });
    } catch (e) {
      console.error("Surah list error:", e);
      await reply(
        "❌ *SubhanAllah!* Something went wrong while fetching the Surah list.\n" +
        "Please try again later, InshaAllah. 🤲"
      );
    }
    return;
  }

  // 📿 Quran Surah Command
  if (["quran", "surah", "recitequran"].includes(cmd)) {
    await doReact("📿", m, Matrix);
    try {
      const args = body.slice(prefix.length).trim().split(" ");
      const surahNumber = parseInt(args[1] || "");

      if (!args[1] || isNaN(surahNumber)) {
        return await reply(
          `🕋 *Assalamu Alaikum!* 🌸\n\n` +
          `To recite the Holy Quran, please specify a Surah number:\n` +
          `Usage: *${prefix}quran <1-114>*\n\n` +
          `Example: *${prefix}quran 1* for Surah Al-Fatihah\n` +
          `View all Surahs with *${prefix}surahlist*`
        );
      }

      if (surahNumber < 1 || surahNumber > 114) {
        return await reply(
          "❌ *Ya Allah!* Please provide a valid Surah number between 1 and 114 🤍\n" +
          `Example: *${prefix}quran 36* for Surah Ya-Sin`
        );
      }

      await doReact("⏳", m, Matrix);
      const apiUrl = `https://quran-endpoint.vercel.app/quran/${surahNumber}`;
      const response = await axios.get(apiUrl, { timeout: 30000 });
      const data = response.data;

      if (data.status === 200 && data.data) {
        const { number, ayahCount, asma, type, tafsir, recitation } = data.data;

        const surahInfo = 
          `🕋 *Surah ${number}: ${asma.en.long}* 🕋\n` +
          `(${asma.ar.long})\n\n` +
          `✨ *Meaning:* ${asma.en.translation}\n` +
          `📖 *Verses:* ${ayahCount} Ayat\n` +
          `🌍 *Revelation:* ${type.en} (${type.ar})\n\n` +
          `🎧 *Listen to Recitation:*\n${recitation?.full || "Link not available"}\n\n` +
          `📜 *Tafsir (Explanation):*\n${tafsir?.id?.slice(0, 300) || "Tafsir unavailable"}...\n\n` +
          `💖 *"And We have certainly made the Quran easy for remembrance, so is there any who will remember?"* (Quran 54:17)\n\n` +
          `May this Surah bring peace to your heart 🤍\n` +
          `~ Your sister LUNA 🌙`;

        await reply(surahInfo, { contextInfo: newsletterContext });
      } else {
        await reply(
          "❌ *SubhanAllah!* I couldn't retrieve this Surah.\n" +
          "Please try again later or choose another Surah number."
        );
      }
    } catch (e) {
      console.error("Quran error:", e);
      await reply(
        "❌ *Ya Rabb!* An error occurred while fetching the Surah.\n" +
        "Please have patience and try again. 🤲\n" +
        `Error: ${e.message || "Unknown"}`
      );
    }
    return;
  }
};

export default islamicCommands;