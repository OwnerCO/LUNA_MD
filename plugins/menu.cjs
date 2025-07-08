(async () => {
  const { cmd } = await import('../command.js');

  const config = require('../config.cjs');
  const os = require('os');
  const platform = os.platform();  // 'linux', 'win32', 'darwin', etc.
  
  
  
  function runtime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
  
    let uptime = "";
    if (d > 0) uptime += d + "d ";
    if (h > 0) uptime += h + "h ";
    if (m > 0) uptime += m + "m ";
    uptime += s + "s";
  
    return uptime.trim();
  }
  
  cmd(
    {
      pattern: "menu",
      alias: ["getmenu"],  // fixed typo here
      react: "📔",
      desc: "Display the menu",
      category: "main",
      filename: __filename,
    },
    async (robin, mek, m, context) => {
      try {
  
        const { sender, reply, from } = context;
  
        
        // Static menu text (customize as you want)
        let madeMenu = `
  ╭━〔 🚀 𝐋𝐔𝐍𝐀 𝐌𝐃 〕━═─═──╮
  ┃ ◈ 👑 𝗢𝘄𝗻𝗲𝗿 : *${config.OWNER_NAME}*  
  ┃ ◈ ⚙️ 𝗣𝗿𝗲𝗳𝗶𝘅 : *[${config.PREFIX}]*  
  ┃ ◈ 📱 𝗡𝘂𝗺𝗯𝗲𝗿: *${config.OWNER_NUMBER}*  
  ┃ ◈ ⭐ 𝗖𝗿𝗲𝗮𝘁𝗼𝗿 : *𝐇𝐀𝐍𝐒 𝗧𝗘𝗖𝗛*  
  ┃ ◈ 📅 𝗗𝗮𝘁𝗲 : *${new Date().toLocaleDateString()}*  
  ┃ ◈ ⏰ 𝗧𝗶𝗺𝗲 : *${new Date().toLocaleTimeString()}*  
  ┃ ◈ 🌐 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺 : *${platform}*  
  ┃ ◈ 📦 𝗩𝗲𝗿𝘀𝗶𝗼𝗻  : *${config.VERSION}*  
  ┃ ◈ ⏱️ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲  : *${runtime(process.uptime())}*  
  ╰━─═─═─═─═──═─═─═─━╯
  
  乂╳─═─═─═─═─═─═─═╳乂
      𝑳𝑼𝑵𝑨 𝑴𝑫 😇
  乂╳─═─═─═─═─═─═─═╳乂
  
  ╭─🤖 𝑨𝑰 & 𝑪𝑯𝑨𝑻 💬
  │🌟 aivoice
  │🧠 claude
  │🔎 deepseek
  │🌌 gemini
  │🤖 gpt
  │✨ lunaai
  │🔮 metaai
  │🎨 imagine
  │💡 chatgpt
  ╰─
  
  ╭─🎨 𝑪𝑹𝑬𝑨𝑻𝑰𝑶𝑵 & 𝑴𝑬𝑫𝑰𝑨 🎬
  │🎥 capcut
  │🖌️ creact
  │🖼️ ephoto
  │🤹 emojimix
  │🎞️ tostick
  │🔐 obfuscate
  │🧴 remini
  │🖍️ removebg
  │🎵 ringtone
  │💬 trt
  ╰─
  
  ╭─👥 𝑺𝑶𝑪𝑰𝑨𝑳 & 𝑮𝑹𝑶𝑼𝑷 🤝
  │💑 couplepic
  │❤️ lovecheck
  │💞 pair
  │📊 groupinfo
  │📝 updategdesc
  │🔤 updategname
  │🔗 join
  │🔒 lockgc
  │🔓 unlockgc
  ╰─
  
  ╭─🛠️ 𝑻𝑶𝑶𝑳𝑺 & 𝑼𝑻𝑰𝑳𝑰𝑻𝑰𝑬𝑺 ⚙️
  │📧 tempmail
  │📬 checkmail
  │➗ calculate
  │📚 topdf
  │📅 calendar
  │📚 define
  │🆚 version
  │🌍 country
  │🌐 fetch
  │⬇️ dl
  │📁 gdrive
  │📂 mediafire
  │🐙 gitclone
  │⏰ opentime
  │🕒 closetime
  │💻 hack
  │🚩 report
  │🔄 restart
  │⏹️ shutdown
  │🕰️ time
  │📆 date
  ╰─
  
  ╭─🎮 𝑭𝑼𝑵 & 𝑮𝑨𝑴𝑬𝑺 🎲
  │❓ quiz
  │🧩 riddle
  │⌨️ typegame
  │💘 matchme
  │🔄 reverse
  │😂 jokes
  │💬 quote
  │💌 pickup
  │💡 advice
  │🌙 goodnight
  │🔥 motivation
  │🎨 randomcolor
  │🪙 coinflip
  │📖 pokedex
  │💖 waifu
  │😈 hentai
  │🎭 truth
  │🎭 dare
  ╰─
  
  
  ╭─📥 𝑫𝑶𝑾𝑵𝑳𝑶𝑨𝑫𝑺 ⬇️
  │📱 apk
  │🏪 playstore
  │🎮 happymod
  │🎞️ moviedl
  │🎬 movie
  │🎵 ytmp3
  │🎶 song
  │📺 yts
  │🎥 ytmp4
  │📹 video
  │🎧 spotify
  │🌐 ssweb
  │🎬 rtik
  │🖼️ wallpaper
  │📱 tiktok
  ╰─
  
  ╭─📚 𝑲𝑵𝑶𝑾𝑳𝑬𝑫𝑮𝑬 & 𝑹𝑬𝑳𝑰𝑮𝑰𝑶𝑵 📖
  │📰 bbcnews
  │🧠 wiki 
  │🔍 epsearch
  │📚 book
  │✝️ bible
  │☪️ quran
  │📜 surahlist
  ╰─
  
  ╭─✨ 𝑴𝑰𝑺𝑪𝑬𝑳𝑳𝑨𝑵𝑬𝑶𝑼𝑺 🌟
  │🔖 version
  │🌐 fetch
  │🚩 report
  │🔄 restart
  │⏹️ shutdown
  │🔒 lockgc
  │🔓 unlockgc
  │🔊 say
  ╰─
  ┗━━━━⊱ 𝐋𝐔𝐍𝐀 𝐌𝐃 😇 ⊰━━━━┛
        `.trim();
  
        const newsletterContext = {
          mentionedJid: [context.sender],
          forwardingScore: 1000,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363292876277898@newsletter',
            newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
            serverMessageId: 143,
          },
        };
  
        await robin.sendMessage(
          context.from,
          {
            image: {
              url: "https://i.ibb.co/9m0ZcH1N/Chat-GPT-Image-28-juin-2025-01-24-41.png",
            },
            caption: madeMenu,
            contextInfo: newsletterContext,
          },
          { quoted: mek }
        );
      } catch (e) {
        console.log(e);
        await context.reply(`Error: ${e.message || e}`);
      }
    }
  );
})();
