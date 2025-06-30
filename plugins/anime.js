import pkg from "darksadasyt-anime";
const { search, getep } = pkg;

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

const anime = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "anime") return;

  // React with the fixed anime emoji
  await doReact("🎭", m, Matrix);

  // Extract the query (anime name)
  const q = m.body.trim().slice(prefix.length + cmd.length).trim();

  const newsletterContext = {
    mentionedJid: [m.sender],
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
      serverMessageId: 143,
    },
  };

  try {
    if (!q) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "*Please provide an anime name.* 🎭",
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }

    const results = await search(q);
    if (!results || results.length === 0) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "No anime found with that name!",
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }

    let animeList =
      "🎬 *HANS BYTE Anime Search Results* 🎬\n\nUse .andl <link> to download episode\n\n";
    results.forEach((anime, index) => {
      animeList += `${index + 1}. ${anime.title} - Link: ${anime.link}\n`;
    });

    await Matrix.sendMessage(
      m.from,
      {
        text: animeList,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );

    // Use first result for episodes
    const animeLink = results[0].link;
    const baseUrl = new URL(animeLink).origin;

    const episodeData = await getep(animeLink);

    if (!episodeData || !episodeData.result || !episodeData.results) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "Could not retrieve episode data.",
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }

    let episodeList = `🎬 *Episodes for:* ${episodeData.result.title} 🎬\n\n`;
    episodeData.results.forEach((episode) => {
      const fullEpisodeUrl = new URL(episode.url, baseUrl).href;
      episodeList += `📺 Episode ${episode.episode} - 🔗 ${fullEpisodeUrl}\n`;
    });

    await Matrix.sendMessage(
      m.from,
      {
        text: episodeList,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  } catch (e) {
    console.error(e);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Error: ${e.message}`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }
};

export default anime;
