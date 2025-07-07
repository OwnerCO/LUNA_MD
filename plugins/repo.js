import fetch from 'node-fetch';
import config from '../config.cjs';

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

// Repository Information Command
const repoCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (["repo", "sc", "script", "info", "source"].includes(cmd)) {
    await doReact("📂", m, Matrix);
    try {
      // GitHub repository details
      const repoData = {
        name: "LUNA MD",
        owner: "HaroldMth",
        repo: "HANS_BYTE",
        url: "https://github.com/HaroldMth/LUNA_MD",
        description: "Your adorable digital companion with superpowers! 💖",
        image: "https://i.ibb.co/9m0ZcH1N/Chat-GPT-Image-28-juin-2025-01-24-41.png"
      };

      // Fetch repository statistics
      const apiUrl = `https://api.github.com/repos/${repoData.owner}/${repoData.repo}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      const githubData = await response.json();

      // Format the repository information
      const repoInfo = 
        `✨ *LUNA's Source Repository* 🌙\n\n` +
        `🤖 *Bot Name:* ${repoData.name}\n` +
        `👩‍💻 *Creator:* ${githubData.owner?.login || repoData.owner}\n` +
        `⭐ *Stars:* ${githubData.stargazers_count || 0}\n` +
        `🌿 *Forks:* ${githubData.forks_count || 0}\n` +
        `📅 *Last Updated:* ${new Date(githubData.updated_at).toLocaleDateString()}\n\n` +
        `📝 *Description:*\n${githubData.description || repoData.description}\n\n` +
        `🔗 *GitHub Link:*\n${repoData.url}\n\n` +
        `💖 *Don't forget to star the repository if you love LUNA!*\n` +
        `It helps Hans Tech improve me every day! 🤖✨\n\n` +
        `Made with 💖 by Hans Tech`;

      // Send repository information with image
      await Matrix.sendMessage(
        m.from,
        {
          image: { url: repoData.image },
          caption: repoInfo,
          contextInfo: newsletterContext
        },
        { quoted: m }
      );

    } catch (e) {
      console.error("Repo command error:", e);
      // Fallback message if GitHub API fails
      const fallbackInfo = 
        `✨ *LUNA's Source Repository* 🌙\n\n` +
        `🤖 *Bot Name:* LUNA MD\n` +
        `👩‍💻 *Creator:* HaroldMth\n` +
        `🔗 *GitHub Link:* https://github.com/HaroldMth/HANS_BYTE\n\n` +
        `📝 *Description:*\nYour adorable digital companion with superpowers! 💖\n\n` +
        `💖 *Don't forget to star the repository if you love LUNA!*\n` +
        `Made with 💖 by Hans Tech`;
      
      await Matrix.sendMessage(
        m.from,
        {
          text: fallbackInfo,
          contextInfo: newsletterContext
        },
        { quoted: m }
      );
    }
  }
};

export default repoCmd;