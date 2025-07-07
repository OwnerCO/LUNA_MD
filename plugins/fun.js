import axios from "axios";
import fetch from "node-fetch";
import config from "../config.cjs";

// 📦 Newsletter context helper
function getNewsletterContext(mentioned = []) {
  return {
    mentionedJid: mentioned,
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
      serverMessageId: 175,
    },
  };
}

// 🖼️ Image URLs
const JOKE_IMG = "https://i.ibb.co/PS5DZdJ/Chat-GPT-Image-Mar-30-2025-12-53-39-PM.png";
const QUOTE_IMG = "https://i.ibb.co/6Rxhg321/Chat-GPT-Image-Mar-30-2025-03-39-42-AM.png";

// 😂 Jokes
const jokes = async (m, Matrix) => {
  const ctx = getNewsletterContext([m.sender]);
  try {
    await Matrix.sendMessage(m.from, { react: { text: "😂", key: m.key } });
    const res = await fetch("https://official-joke-api.appspot.com/random_joke").then(r => r.json());

    const jokeMsg = `
🤣 *LUNA MD JOKE* 🤣

╭─・─・─・─・─・─・─・─╮
│ ${res.setup}
│ 
│ 😂 ${res.punchline}
╰─・─・─・─・─・─・─・─╯

💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇* 😇`.trim();

    await Matrix.sendMessage(m.from, {
      image: { url: JOKE_IMG },
      caption: jokeMsg,
      contextInfo: ctx,
    }, { quoted: m });

  } catch {
    Matrix.sendMessage(m.from, {
      text: "❌ Oopsie~ Couldn't find a joke! Try again later?",
      contextInfo: ctx,
    }, { quoted: m });
  }
};

// 💡 Quote
const quote = async (m, Matrix) => {
  const ctx = getNewsletterContext([m.sender]);
  try {
    await Matrix.sendMessage(m.from, { react: { text: "💡", key: m.key } });
    const res = await axios.get("https://apis.davidcyriltech.my.id/random/quotes");

    const quoteMsg = `
💫 *LUNA MD QUOTE* 💫

╭─・─・─・─・─・─・─・─╮
│ "${res.data.response.quote}"
│ 
│ - ${res.data.response.author}
╰─・─・─・─・─・─・─・─╯

💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇* 😇`.trim();

    await Matrix.sendMessage(m.from, {
      image: { url: QUOTE_IMG },
      caption: quoteMsg,
      contextInfo: ctx,
    }, { quoted: m });

  } catch {
    Matrix.sendMessage(m.from, {
      text: "❌ Oopsie~ Couldn't find wisdom! Try again?",
      contextInfo: ctx,
    }, { quoted: m });
  }
};

// 💘 Pickup Line
const pickup = async (m, Matrix) => {
  const ctx = getNewsletterContext([m.sender]);
  try {
    await Matrix.sendMessage(m.from, { react: { text: "💘", key: m.key } });
    const res = await axios.get("https://apis.davidcyriltech.my.id/pickupline");

    const pickupMsg = `
💘 *LUNA MD PICKUP LINE* 💘

╭─・─・─・─・─・─・─・─╮
│ "${res.data.pickupline}"
╰─・─・─・─・─・─・─・─╯

💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇* 😇`.trim();

    await Matrix.sendMessage(m.from, {
      image: { url: QUOTE_IMG },
      caption: pickupMsg,
      contextInfo: ctx,
    }, { quoted: m });

  } catch {
    Matrix.sendMessage(m.from, {
      text: "❌ Oopsie~ Couldn't find love! Try again?",
      contextInfo: ctx,
    }, { quoted: m });
  }
};

// 🧠 Advice
const advice = async (m, Matrix) => {
  const ctx = getNewsletterContext([m.sender]);
  try {
    await Matrix.sendMessage(m.from, { react: { text: "🧠", key: m.key } });
    const res = await axios.get("https://api.giftedtech.web.id/api/fun/advice?apikey=gifted");

    const adviceMsg = `
🧠 *LUNA MD ADVICE* 🧠

╭─・─・─・─・─・─・─・─╮
│ "${res.data.result}"
╰─・─・─・─・─・─・─・─╯

💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇* 😇`.trim();

    await Matrix.sendMessage(m.from, {
      image: { url: QUOTE_IMG },
      caption: adviceMsg,
      contextInfo: ctx,
    }, { quoted: m });

  } catch {
    Matrix.sendMessage(m.from, {
      text: "❌ Oopsie~ Couldn't find advice! Try again?",
      contextInfo: ctx,
    }, { quoted: m });
  }
};

// 🌙 Good Night
const goodnight = async (m, Matrix) => {
  const ctx = getNewsletterContext([m.sender]);
  try {
    await Matrix.sendMessage(m.from, { react: { text: "🌙", key: m.key } });
    const res = await axios.get("https://api.giftedtech.web.id/api/fun/goodnight?apikey=gifted");

    const msg = `
🌙 *LUNA MD GOOD NIGHT* 🌙

╭─・─・─・─・─・─・─・─╮
│ "${res.data.result}"
╰─・─・─・─・─・─・─・─╯

💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇* 😇`.trim();

    await Matrix.sendMessage(m.from, {
      image: { url: QUOTE_IMG },
      caption: msg,
      contextInfo: ctx,
    }, { quoted: m });

  } catch {
    Matrix.sendMessage(m.from, {
      text: "❌ Oopsie~ Couldn't find bedtime wishes! Try again?",
      contextInfo: ctx,
    }, { quoted: m });
  }
};

// 🔥 Motivation
const motivation = async (m, Matrix) => {
  const ctx = getNewsletterContext([m.sender]);
  try {
    await Matrix.sendMessage(m.from, { react: { text: "🔥", key: m.key } });
    const res = await axios.get("https://api.giftedtech.web.id/api/fun/motivation?apikey=gifted");

    const msg = `
🔥 *LUNA MD MOTIVATION* 🔥

╭─・─・─・─・─・─・─・─╮
│ "${res.data.result}"
╰─・─・─・─・─・─・─・─╯

💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇* 😇`.trim();

    await Matrix.sendMessage(m.from, {
      image: { url: QUOTE_IMG },
      caption: msg,
      contextInfo: ctx,
    }, { quoted: m });

  } catch {
    Matrix.sendMessage(m.from, {
      text: "❌ Oopsie~ Couldn't find motivation! Try again?",
      contextInfo: ctx,
    }, { quoted: m });
  }
};

// ✅ Command loader
export default async function register(m, Matrix) {
  if (!m.body || typeof m.body !== 'string') return;

  const prefix = config.PREFIX || '.';
  const body = m.body.toLowerCase();
  if (!body.startsWith(prefix)) return;

  const [command] = body.slice(prefix.length).trim().split(/\s+/);

  switch (command) {
    case "joke":
    case "jokes":
      return await jokes(m, Matrix);

    case "quote":
    case "quotes":
      return await quote(m, Matrix);

    case "pickup":
    case "pickupline":
      return await pickup(m, Matrix);

    case "advice":
      return await advice(m, Matrix);

    case "goodnight":
    case "gn":
      return await goodnight(m, Matrix);

    case "motivate":
    case "motivation":
      return await motivation(m, Matrix);

    default:
      return;
  }
}
