import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Utility runtime function (assuming you have this elsewhere, or import it)
function runtime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key }
    });
  } catch (error) {
    console.error('Error sending reaction:', error);
  }
}

const version = async (m, Matrix) => {
  const prefix = '/'; // or import from your config if you want

  // Extract command name from message
  const cmd = m.body && m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
    : '';

  if (!['version', 'changelog', 'cupdate', 'checkupdate'].includes(cmd)) return;

  await doReact('🚀', m, Matrix);

  try {
    // Read local version data
    const localVersionPath = path.join(process.cwd(), 'data/changelog.json'); // adjust base path as needed
    let localVersion = 'Unknown';
    let changelog = 'No changelog available.';
    if (fs.existsSync(localVersionPath)) {
      const localData = JSON.parse(fs.readFileSync(localVersionPath, 'utf-8'));
      localVersion = localData.version;
      changelog = localData.changelog;
    }

    // Fetch latest version data from GitHub
    const rawVersionUrl = 'https://raw.githubusercontent.com/Haroldmth/LUNA_MD/main/data/changelog.json';
    let latestVersion = 'Unknown';
    let latestChangelog = 'No changelog available.';
    try {
      const { data } = await axios.get(rawVersionUrl);
      latestVersion = data.version;
      latestChangelog = data.changelog;
    } catch (error) {
      console.error('Failed to fetch latest version:', error);
    }

    // Count total plugins
    const pluginPath = path.join(process.cwd(), 'plugins');
    const pluginCount = fs.existsSync(pluginPath)
      ? fs.readdirSync(pluginPath).filter(file => file.endsWith('.js')).length
      : 0;

    // Assuming you export or import commands array somewhere; for demo:
    const commands = Array.isArray(global.commands) ? global.commands : [];
    const totalCommands = commands.length;

    // System info
    const uptime = runtime(process.uptime());
    const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);
    const hostName = os.hostname();
    let lastUpdate = 'Unknown';
    if (fs.existsSync(localVersionPath)) {
      lastUpdate = fs.statSync(localVersionPath).mtime.toLocaleString();
    }

    // GitHub repo link
    const githubRepo = 'https://github.com/haroldmth/LUNA_MD';

    // Update status message
    let updateMessage = `✅ LUNA MD bot is up-to-date!`;
    if (localVersion !== latestVersion) {
      updateMessage = `🚀 LUNA MD bot is outdated!\n` +
        `🔹 *Current Version:* ${localVersion}\n` +
        `🔹 *Latest Version:* ${latestVersion}\n\n` +
        `Use *.update* to update.`;
    }

    const pushname = m.pushName || 'User';

    const statusMessage = `🌟 *Good ${new Date().getHours() < 12 ? 'Morning' : 'Night'}, ${pushname}!* 🌟\n\n` +
      `📌 *Bot Name:* LUNA MD\n🔖 *Current Version:* ${localVersion}\n📢 *Latest Version:* ${latestVersion}\n📂 *Total Plugins:* ${pluginCount}\n🔢 *Total Commands:* ${totalCommands}\n\n` +
      `💾 *System Info:*\n⏳ *Uptime:* ${uptime}\n📟 *RAM Usage:* ${ramUsage}MB / ${totalRam}MB\n⚙️ *Host Name:* ${hostName}\n📅 *Last Update:* ${lastUpdate}\n\n` +
      `📝 *Changelog:*\n${latestChangelog}\n\n` +
      `⭐ *GitHub Repo:* ${githubRepo}\n👤 *Owner:* LUNA MD\n\n${updateMessage}\n\n` +
      `🚀 *Hey! Don't forget to fork & star the repo!*`;

    const newsletterContext = {
      mentionedJid: [m.sender],
      forwardingScore: 1000,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363292876277898@newsletter',
        newsletterName: '𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇',
        serverMessageId: 143,
      },
    };

    // Send message with image
    await Matrix.sendMessage(m.from, {
      image: { url: 'https://i.ibb.co/9m0ZcH1N/Chat-GPT-Image-28-juin-2025-01-24-41.png' }, // your moon image url
      caption: statusMessage,
      contextInfo: newsletterContext
    }, { quoted: m });
  } catch (error) {
    console.error('Error fetching version info:', error);
    await Matrix.sendMessage(
      m.from,
      { text: '❌ An error occurred while checking the bot version.' },
      { quoted: m }
    );
  }
};

export default version;
