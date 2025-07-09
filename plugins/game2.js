import axios from "axios";
import config from "../config.cjs";

// Sleep function for countdown delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

// Main command handler
const funUtilityCommands = async (m, Matrix) => {
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
        ...(options.mentions ? { mentions: options.mentions } : {}),
      },
      { quoted: m }
    );
  };

  // 🌈 Random Color Command
  if (["rcolor", "randomcolor", "color"].includes(cmd)) {
    await doReact("🎨", m, Matrix);
    try {
      const colorNames = [
        "Red", "Green", "Blue", "Yellow", "Orange", "Purple", 
        "Pink", "Brown", "Black", "White", "Gray", "Cyan", 
        "Magenta", "Violet", "Indigo", "Teal", "Lavender", "Turquoise"
      ];
      
      const randomColorHex = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      const randomColorName = colorNames[Math.floor(Math.random() * colorNames.length)];

      await reply(`🎨 *LUNA's Color Magic!* ✨\n\n💖 *Name:* ${randomColorName}\n🌈 *Hex Code:* ${randomColorHex}\n\nMade with 💖 by Hans Tech!`);
    } catch (e) {
      console.error("Color error:", e);
      await reply("❌ Oopsie! Colors faded away... 💔\nPlease try again, cutie! 🥺");
    }
    return;
  }

  // 🎲 Roll Dice Command
  if (["roll", "dice"].includes(cmd)) {
    await doReact("🎲", m, Matrix);
    try {
      const result = Math.floor(Math.random() * 6) + 1;
      await reply(`🎲 *LUNA rolled for you!*\n\nYou got: *${result}* ✨\n\n${result === 6 ? "Yay! Lucky roll! 🥳" : "Better luck next time! 💖"}`);
    } catch (e) {
      console.error("Dice error:", e);
      await reply("❌ Oops! Dice rolled under the couch... 🙈\nLet me try again? 🥺");
    }
    return;
  }

  // 🪙 Coin Flip Command
  if (["coinflip", "coin", "flip"].includes(cmd)) {
    await doReact("🪙", m, Matrix);
    try {
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      await reply(`🪙 *LUNA flipped a coin!* ✨\n\nIt's... *${result}*! 💫\n\n${result === "Heads" ? "Heads up, buttercup! 🌼" : "Tails never fails! 🦊"}`);
    } catch (e) {
      console.error("Coin error:", e);
      await reply("❌ Uh-oh! Coin got lost in the void... 🌌\nWanna try again? 😇");
    }
    return;
  }

  // 🕒 Time Command
  if (["time", "clock"].includes(cmd)) {
    await doReact("🕒", m, Matrix);
    try {
      const now = new Date();
      const localTime = now.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit", 
        hour12: true,
        timeZone: "Africa/Douala"
      });
      await reply(`🕒 *LUNA's Time Check!* ✨\n\nCurrent time in GMT+1: ${localTime}\n\nDon't stay up too late! 😴💖`);
    } catch (e) {
      console.error("Time error:", e);
      await reply("❌ Oops! Time machine broke... ⏳💔\nHans will fix me soon! 🤖");
    }
    return;
  }

  // 📅 Date Command
  if (["date", "today"].includes(cmd)) {
    await doReact("📅", m, Matrix);
    try {
      const now = new Date();
      const currentDate = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      await reply(`📅 *LUNA's Date Reminder!* ✨\n\nToday is: ${currentDate}\n\nMake it a wonderful day! 🌸💖`);
    } catch (e) {
      console.error("Date error:", e);
      await reply("❌ Oopsie! My calendar flew away... 🗓️💨\nHans Tech will get me a new one! 🤗");
    }
    return;
  }

  // 😂 Shapar Command
  if (["shapar", "shap", "asciiart"].includes(cmd)) {
    await doReact("😂", m, Matrix);
    try {
      if (!m.key.remoteJid.endsWith("@g.us")) {
        return await reply("❌ This magical art only works in groups, sweetie! 💖\nCreate a group and try again! 👯‍♀️");
      }

      const mentionedUser = m?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!mentionedUser) {
        return await reply("❌ Oops! You forgot to mention someone! 😅\nTry: .shapar @friend 💖");
      }

      const asciiArt = `
          _______
       .-'       '-.
      /           /|
     /           / |
    /___________/  |
    |   _______ |  |
    |  |  \\ \\  ||  |
    |  |   \\ \\ ||  |
    |  |____\\ \\||  |
    |  '._  _.'||  |
    |    .' '.  ||  |
    |   '.___.' ||  |
    |___________||  |
    '------------'  |
     \\_____________\\|
`;

      await Matrix.sendMessage(
        m.from, 
        {
          text: `😂 @${mentionedUser.split("@")[0]}!\nLUNA made this for you:\n\n${asciciArt}\n\nMade with giggles by Hans Tech! 🤖💕`,
          mentions: [mentionedUser],
          contextInfo: newsletterContext
        }, 
        { quoted: m }
      );
    } catch (e) {
      console.error("Shapar error:", e);
      await reply("❌ Oh no! My art supplies spilled... 🎨💦\nLet me clean up and try again! 🧹😇");
    }
    return;
  }

    // 🌟 Group Link Command

  // 🔢 Count Command
  const botOwner2 = config.OWNER_NUMBER;
  if (["count", "countdown"].includes(cmd)) {
    await doReact("🔢", m, Matrix);
    try {
      const botOwner = Matrix.user.id.split(":")[0];
      if (m.sender !== botOwner2) {
        return await reply("❌ Oopsie! Only my creator Hans can use this! 🤖💖\n(He's super special! ✨)");
      }

      const args = body.slice(prefix.length).trim().split(" ").slice(1);
      if (!args[0]) {
        return await reply("✳️ Example cutie: .count 10\nI'll count to 10 for you! 💫");
      }

      const count = parseInt(args[0]);
      if (isNaN(count) || count <= 0 || count > 50) {
        return await reply("❌ Please give LUNA a number between 1-50!\n(She's smol but mighty! 🌙💪)");
      }

      await reply(`⏳ Starting countdown to ${count}...\nGet ready! 💖`);
      
      for (let i = 1; i <= count; i++) {
        await Matrix.sendMessage(m.from, { text: `${i}` }, { quoted: m });
        await sleep(1000);
      }
      
      await reply(`🎉 *Countdown complete!*\nWasn't that fun? 😇💖\n\n~ Your fave digital buddy LUNA MD`);
    } catch (e) {
      console.error("Count error:", e);
      await reply("❌ Oh no! I lost count... 😭💔\nHans Tech will fix my math skills! 🧮🤖");
    }
    return;
  }
};

export default funUtilityCommands;