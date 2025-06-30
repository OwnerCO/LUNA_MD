import axios from "axios";
import config from "../config.cjs";

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
    });
  } catch (error) {
    console.error("Error sending reaction:", error);
  }
}

const aivoice = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  // Accept aliases as well
  if (!["aivoice", "vai", "voicex", "voiceai"].includes(cmd)) return;

  // React with fixed emoji 🪃
  await doReact("🪃", m, Matrix);

  const args = m.body.trim().slice(prefix.length + cmd.length).trim().split(/\s+/);

  if (args.length === 0 || !args[0]) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "Please provide text after the command.\nExample: .aivoice hello",
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 1000,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363292876277898@newsletter",
            newsletterName: "𝐋𝐔𝐍𝐀 𝐌𝐃",
            serverMessageId: 150,
          },
        },
      },
      { quoted: m }
    );
  }

  const inputText = args.join(" ");

  // Define available voice models
  const voiceModels = [
    { number: "1", name: "Hatsune Miku", model: "miku" },
    { number: "2", name: "Nahida (Exclusive)", model: "nahida" },
    { number: "3", name: "Nami", model: "nami" },
    { number: "4", name: "Ana (Female)", model: "ana" },
    { number: "5", name: "Optimus Prime", model: "optimus_prime" },
    { number: "6", name: "Goku", model: "goku" },
    { number: "7", name: "Taylor Swift", model: "taylor_swift" },
    { number: "8", name: "Elon Musk", model: "elon_musk" },
    { number: "9", name: "Mickey Mouse", model: "mickey_mouse" },
    { number: "10", name: "Kendrick Lamar", model: "kendrick_lamar" },
    { number: "11", name: "Angela Adkinsh", model: "angela_adkinsh" },
    { number: "12", name: "Eminem", model: "eminem" },
  ];

  let menuText = "╭━━━〔 *AI VOICE MODELS* 〕━━━⊷\n";
  voiceModels.forEach((model) => {
    menuText += `┃▸ ${model.number}. ${model.name}\n`;
  });
  menuText += "╰━━━⪼\n\n";
  menuText += `📌 *Reply with the number to select a voice model for:*\n"${inputText}"`;

  // Send the menu image + caption
  const sentMsg = await Matrix.sendMessage(
    m.from,
    {
      image: { url: "https://i.ibb.co/6Rxhg321/Chat-GPT-Image-Mar-30-2025-03-39-42-AM.png" },
      caption: menuText,
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
    },
    { quoted: m }
  );

  const messageID = sentMsg.key.id;
  let handlerActive = true;

  const handlerTimeout = setTimeout(() => {
    handlerActive = false;
    Matrix.ev.off("messages.upsert", messageHandler);
    Matrix.sendMessage(m.from, { text: "⌛ Voice selection timed out. Please try the command again." }, { quoted: m });
  }, 120000);

  // Message handler to catch user's reply
  const messageHandler = async (msgData) => {
    if (!handlerActive) return;

    const receivedMsg = msgData.messages[0];
    if (!receivedMsg || !receivedMsg.message) return;

    const receivedText =
      receivedMsg.message.conversation ||
      receivedMsg.message.extendedTextMessage?.text ||
      receivedMsg.message.buttonsResponseMessage?.selectedButtonId;

    const senderID = receivedMsg.key.remoteJid;
    const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

    if (isReplyToBot && senderID === m.from) {
      clearTimeout(handlerTimeout);
      Matrix.ev.off("messages.upsert", messageHandler);
      handlerActive = false;

      // React to acknowledge reply
      await Matrix.sendMessage(senderID, {
        react: { text: "⬇️", key: receivedMsg.key },
      });

      const selectedNumber = receivedText.trim();
      const selectedModel = voiceModels.find((model) => model.number === selectedNumber);

      if (!selectedModel) {
        return Matrix.sendMessage(senderID, { text: "❌ Invalid option! Please reply with a number from the menu." });
      }

      try {
        await Matrix.sendMessage(
          m.from,
          { text: `🔊 Generating audio with ${selectedModel.name} voice...` },
          { quoted: receivedMsg }
        );

        const apiUrl = `https://api.agatz.xyz/api/voiceover?text=${encodeURIComponent(
          inputText
        )}&model=${selectedModel.model}`;

        const response = await axios.get(apiUrl, { timeout: 30000 });
        const data = response.data;

        if (data.status === 200 && data.data?.oss_url) {
          await Matrix.sendMessage(
            m.from,
            {
              audio: { url: data.data.oss_url },
              mimetype: "audio/mpeg",
            },
            { quoted: receivedMsg }
          );
        } else {
          await Matrix.sendMessage(m.from, { text: "❌ Error generating audio. Please try again." });
        }
      } catch (error) {
        console.error("API Error:", error);
        await Matrix.sendMessage(m.from, { text: "❌ Error processing your request. Please try again." });
      }
    }
  };

  Matrix.ev.on("messages.upsert", messageHandler);
};

export default aivoice;
