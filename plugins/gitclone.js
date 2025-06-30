import { exec } from "child_process";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import config from "../config.cjs";

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
    });
  } catch (err) {
    console.error("💥 LUNA failed to react:", err);
  }
}

const gitclone = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "gitclone" && cmd !== "clone") return;
  await doReact("📂", m, Matrix);

  const q = m.body.trim().slice(prefix.length + cmd.length).trim();

  const newsletterContext = {
    mentionedJid: [m.sender],
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
      serverMessageId: 143,
    },
  };

  if (!q || !q.startsWith("https://github.com/")) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "📌 *LUNA MD* says: Please provide a valid GitHub repo link!\nExample: `.gitclone https://github.com/user/repo.git`",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }

  const repoName = q.split("/").pop().replace(".git", "");
  const reposDir = path.join("/tmp", "repos");
  const repoPath = path.join(reposDir, repoName);
  const zipPath = `${repoPath}.zip`;

  try {
    if (!fs.existsSync(reposDir)) fs.mkdirSync(reposDir, { recursive: true });

    if (fs.existsSync(repoPath)) fs.rmSync(repoPath, { recursive: true, force: true });

    await Matrix.sendMessage(
      m.from,
      {
        text: `🔄 *LUNA MD* is cloning your repository...\n\n🔗 *URL:* ${q}`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );

    exec(`git clone ${q} ${repoPath}`, async (error, stdout, stderr) => {
      if (error) {
        console.error("Git clone error:", error);
        return Matrix.sendMessage(
          m.from,
          {
            text: `🚨 *Oops!* Couldn’t clone the repo.\n💬 ${error.message}`,
            contextInfo: newsletterContext,
          },
          { quoted: m }
        );
      }

      await Matrix.sendMessage(
        m.from,
        {
          text: `📦 *Zipping the repository...*`,
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );

      try {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", async () => {
          await Matrix.sendMessage(
            m.from,
            {
              document: fs.readFileSync(zipPath),
              mimetype: "application/zip",
              fileName: `${repoName}.zip`,
              caption: `🗂️ *Here is your cloned repository!*\n\n🔗 *Source:* ${q}\n\nWith ❤️ by *LUNA MD* and *HANS TECH*!`,
              contextInfo: newsletterContext,
            },
            { quoted: m }
          );

          try {
            fs.rmSync(repoPath, { recursive: true, force: true });
            fs.unlinkSync(zipPath);
            console.log("Cleanup done.");
          } catch (cleanupErr) {
            console.error("Cleanup error:", cleanupErr);
          }
        });

        archive.on("error", (err) => {
          console.error("Archiving error:", err);
          return Matrix.sendMessage(
            m.from,
            {
              text: `😢 *Failed to create ZIP file.*\n💬 ${err.message}`,
              contextInfo: newsletterContext,
            },
            { quoted: m }
          );
        });

        archive.pipe(output);
        archive.directory(repoPath, false);
        archive.finalize();
      } catch (zipErr) {
        console.error("ZIP creation failed:", zipErr);
        await Matrix.sendMessage(
          m.from,
          {
            text: `😵 *Something went wrong while zipping!*\n💬 ${zipErr.message}`,
            contextInfo: newsletterContext,
          },
          { quoted: m }
        );
      }
    });
  } catch (e) {
    console.error("Unexpected error:", e);
    await Matrix.sendMessage(
      m.from,
      {
        text: `💥 *Unexpected error occurred!*\n💬 ${e.message}`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }
};

export default gitclone;
