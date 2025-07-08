(async () => {
  const { cmd } = await import('../command.js');

  const axios = require('axios');
  const config = require('../config.cjs');
  
  cmd(
    {
      pattern: "tempmail",
      react: "📧",
      desc: "Generate a temporary email address.",
      category: "utility",
      filename: __filename,
    },
    async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender }) => {
      // Newsletter context
      const newsletterContext = {
        mentionedJid: [sender],
        forwardingScore: 1000,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363292876277898@newsletter',
          newsletterName: "𝐇𝐀𝐍𝐒 𝐌𝐃",
          serverMessageId: Math.floor(Math.random() * 1000),
        }
      };
  
      try {
        const response = await axios.get('https://apis.davidcyriltech.my.id/temp-mail');
  
        if (response.data.success) {
          const email = response.data.email;
          const sessionId = response.data.session_id;
          const expiresAt = response.data.expires_at;
  
          await robin.sendMessage(from, {
            text: `╭─⊳⋅🤖 TEMPMAIL⋅⊲─╮
  ⌬ ADDRESS: ${email}
  ⌬ EXPIRY: ${expiresAt}
  ⌬ SESSION ID: ${sessionId}
  ⌬ To check inbox, run:
  ⌬ ${config.PREFIX}checkmail <SID>
  ╰─⊲⋅═══════════⋅⊳─╯`,
          }, { quoted: mek, contextInfo: newsletterContext });
        } else {
          await robin.sendMessage(from, {
            text: `❌ Failed to generate temporary email address.`,
          }, { quoted: mek, contextInfo: newsletterContext });
        }
      } catch (error) {
        console.error(error);
        await robin.sendMessage(from, {
          text: `❌ Error: Could not fetch temporary email address.`,
        }, { quoted: mek, contextInfo: newsletterContext });
      }
    }
  );
  
  cmd(
    {
      pattern: "checkmail",
      react: "📬",
      desc: "Check inbox for temporary email.",
      category: "utility",
      filename: __filename,
    },
    async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender }) => {
      // Newsletter context
      const newsletterContext = {
        mentionedJid: [sender],
        forwardingScore: 1000,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363292876277898@newsletter',
          newsletterName: "𝐇𝐀𝐍𝐒 𝐌𝐃",
          serverMessageId: Math.floor(Math.random() * 1000),
        }
      };
  
      try {
        if (args.length < 1) {
          return await robin.sendMessage(from, {
            text: `❌ Please provide your session ID (use the tempmail command to get it).`,
          }, { quoted: mek, contextInfo: newsletterContext });
        }
  
        const sessionId = args[0];
        const response = await axios.get(`https://apis.davidcyriltech.my.id/temp-mail/inbox?id=${sessionId}`);
  
        if (response.data.success) {
          const inboxCount = response.data.inbox_count;
          const messages = response.data.messages;
  
          if (inboxCount > 0) {
            let messageList = '📬 You have new messages:\n';
            messages.forEach((message, index) => {
              messageList += `\n${index + 1}. From: ${message.from} - Subject: ${message.subject}`;
            });
  
            await robin.sendMessage(from, {
              text: messageList,
            }, { quoted: mek, contextInfo: newsletterContext });
          } else {
            await robin.sendMessage(from, {
              text: `✅ No new messages in your inbox.`,
            }, { quoted: mek, contextInfo: newsletterContext });
          }
        } else {
          await robin.sendMessage(from, {
            text: `❌ Error checking inbox. Please check the session ID.`,
          }, { quoted: mek, contextInfo: newsletterContext });
        }
      } catch (error) {
        console.error(error);
        await robin.sendMessage(from, {
          text: `❌ Error: Could not fetch inbox data.`,
        }, { quoted: mek, contextInfo: newsletterContext });
      }
    }
  );
})();
