import config from "../config.cjs";
import axios from "axios";
import fetch from "node-fetch";

// Helper: newsletter context
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

// Image URLs
const JOKE_IMG = "https://i.ibb.co/PS5DZdJ/Chat-GPT-Image-Mar-30-2025-12-53-39-PM.png";
const QUOTE_IMG = "https://i.ibb.co/6Rxhg321/Chat-GPT-Image-Mar-30-2025-03-39-42-AM.png";

// Jokes handler
const jokes = async (m, Matrix) => {
  const ctx = getNewsletterContext([m.sender]);
  
  try {
    await Matrix.sendMessage(m.from, { react: { text: "😂", key: m.key } });
    const res = await fetch("https://official-joke-api.appspot.com/random_joke").then(r => r.json());

    if (res.setup && res.punchline) {
      const jokeMsg = `
🤣 *LUNA MD JOKE* 🤣

╭─・─・─・─・─・─・─・─╮
│ ${res.setup}
│ 
│ 😂 ${res.punchline}
╰─・─・─・─・─・─・─・─╯

💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇* 😇
      `.trim();

      await Matrix.sendMessage(
        m.from,
        {
          image: { url: JOKE_IMG },
          caption: jokeMsg,
          contextInfo: ctx
        },
        { quoted: m }
      );
    } else {
      throw new Error("Couldn't fetch a joke");
    }
  } catch (e) {
    console.error("LUNA MD joke error:", e);
    Matrix.sendMessage(
      m.from,
      {
        text: "❌ Oopsie~ Couldn't find a joke! Try again later?",
        contextInfo: ctx
      },
      { quoted: m }
    );
  }
};

// Quote handler
const quote = async (m, Matrix) => {
  const ctx = getNewsletterContext([m.sender]);
  
  try {
    await Matrix.sendMessage(m.from, { react: { text: "💡", key: m.key } });
    const response = await axios.get('https://apis.davidcyriltech.my.id/random/quotes');
    
    if (response.data.success) {
      const quoteMsg = `
💫 *LUNA MD QUOTE* 💫

╭─・─・─・─・─・─・─・─╮
│ "${response.data.response.quote}"
│ 
│ - ${response.data.response.author}
╰─・─・─・─・─・─・─・─╯

💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇* 😇
      `.trim();

      await Matrix.sendMessage(
        m.from,
        {
          image: { url: QUOTE_IMG },
          caption: quoteMsg,
          contextInfo: ctx
        },
        { quoted: m }
      );
    } else {
      throw new Error("Failed to fetch quote");
    }
  } catch (error) {
    console.error("LUNA MD quote error:", error);
    Matrix.sendMessage(
      m.from,
      {
        text: "❌ Oopsie~ Couldn't find wisdom! Try again?",
        contextInfo: ctx
      },
      { quoted: m }
    );
  }
};

// Pickup Line handler
const pickup = async (m, Matrix) => {
  const ctx = getNewsletterContext([m.sender]);
  
  try {
    await Matrix.sendMessage(m.from, { react: { text: "💘", key: m.key } });
    const response = await axios.get('https://apis.davidcyriltech.my.id/pickupline');
    
    if (response.data.success) {
      const pickupMsg = `
💘 *LUNA MD PICKUP LINE* 💘

╭─・─・─・─・─・─・─・─╮
│ "${response.data.pickupline}"
╰─・─・─・─・─・─・─・─╯

💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇* 😇
      `.trim();

      await Matrix.sendMessage(
        m.from,
        {
          image: { url: QUOTE_IMG },
          caption: pickupMsg,
          contextInfo: ctx
        },
        { quoted: m }
      );
    } else {
      throw new Error("Failed to fetch pickup line");
    }
  } catch (error) {
    console.error("LUNA MD pickup error:", error);
    Matrix.sendMessage(
      m.from,
      {
        text: "❌ Oopsie~ Couldn't find love! Try again?",
        contextInfo: ctx
      },
      { quoted: m }
    );
  }
};

// Advice handler
const advice = async (m, Matrix) => {
  const ctx = getNewsletterContext([m.sender]);
  
  try {
    await Matrix.sendMessage(m.from, { react: { text: "🧠", key: m.key } });
    const response = await axios.get('https://api.giftedtech.web.id/api/fun/advice?apikey=gifted');
    
    if (response.data.success) {
      const adviceMsg = `
🧠 *LUNA MD ADVICE* 🧠

╭─・─・─・─・─・─・─・─╮
│ "${response.data.result}"
╰─・─・─・─・─・─・─・─╯

💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇* 😇
      `.trim();

      await Matrix.sendMessage(
        m.from,
        {
          image: { url: QUOTE_IMG },
          caption: adviceMsg,
          contextInfo: ctx
        },
        { quoted: m }
      );
    } else {
      throw new Error("Failed to fetch advice");
    }
  } catch (error) {
    console.error("LUNA MD advice error:", error);
    Matrix.sendMessage(
      m.from,
      {
        text: "❌ Oopsie~ Couldn't find advice! Try again?",
        contextInfo: ctx
      },
      { quoted: m }
    );
  }
};

// Goodnight handler
const goodnight = async (m, Matrix) => {
  const ctx = getNewsletterContext([m.sender]);
  
  try {
    await Matrix.sendMessage(m.from, { react: { text: "🌙", key: m.key } });
    const response = await axios.get('https://api.giftedtech.web.id/api/fun/goodnight?apikey=gifted');
    
    if (response.data.success) {
      const nightMsg = `
🌙 *LUNA MD GOOD NIGHT* 🌙

╭─・─・─・─・─・─・─・─╮
│ "${response.data.result}"
╰─・─・─・─・─・─・─・─╯

💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇* 😇
      `.trim();

      await Matrix.sendMessage(
        m.from,
        {
          image: { url: QUOTE_IMG },
          caption: nightMsg,
          contextInfo: ctx
        },
        { quoted: m }
      );
    } else {
      throw new Error("Failed to fetch goodnight message");
    }
  } catch (error) {
    console.error("LUNA MD goodnight error:", error);
    Matrix.sendMessage(
      m.from,
      {
        text: "❌ Oopsie~ Couldn't find bedtime wishes! Try again?",
        contextInfo: ctx
      },
      { quoted: m }
    );
  }
};

// Motivation handler
const motivation = async (m, Matrix) => {
  const ctx = getNewsletterContext([m.sender]);
  
  try {
    await Matrix.sendMessage(m.from, { react: { text: "🔥", key: m.key } });
    const response = await axios.get('https://api.giftedtech.web.id/api/fun/motivation?apikey=gifted');
    
    if (response.data.success) {
      const motivationMsg = `
🔥 *LUNA MD MOTIVATION* 🔥

╭─・─・─・─・─・─・─・─╮
│ "${response.data.result}"
╰─・─・─・─・─・─・─・─╯

💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇* 😇
      `.trim();

      await Matrix.sendMessage(
        m.from,
        {
          image: { url: QUOTE_IMG },
          caption: motivationMsg,
          contextInfo: ctx
        },
        { quoted: m }
      );
    } else {
      throw new Error("Failed to fetch motivation");
    }
  } catch (error) {
    console.error("LUNA MD motivation error:", error);
    Matrix.sendMessage(
      m.from,
      {
        text: "❌ Oopsie~ Couldn't find motivation! Try again?",
        contextInfo: ctx
      },
      { quoted: m }
    );
  }
};

export {
  jokes,
  quote,
  pickup,
  advice,
  goodnight,
  motivation
};