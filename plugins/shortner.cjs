const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "shorten" || "tourl1",
    alias: ['to-url'],
    desc: "🌼 Make looong URLs cute and tiny!",
    category: "magic wand",
    react: "💫",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        // Try to get raw text from multiple sources
        const rawText = mek.body || mek.message?.conversation || m.text || "";
        const url = rawText.replace(/^[.!]?(shorten|tourl1|tourl)\s*/i, '').trim();

        if (!url || !/^https?:\/\//i.test(url)) {
            return reply("✨ Oopsie-daisy! You forgot to give me a valid URL to shrink~ 💌 Please share a real link, sweet friend!");
        }

        const { data } = await axios.get(`https://apis.davidcyriltech.my.id/tinyurl?url=${encodeURIComponent(url)}`);

        if (data && data.success) {
            return reply(`🌸 *Tadaaa~!* Your fresh mini-link is ready!\n\n🔮 Original: ${data.original_url}\n💖 Shrunken cutie: ${data.shortened_url}\n\nMade with sparkly magic by Hans Tech! ✨🤍 He's the absolute best, don't you think? 🥰`);
        } else {
            return reply("🌧 Aww, my magic wand fizzled out... Let's try again with a happy thought? 💫");
        }
    } catch (e) {
        console.error(e);
        return reply(`💔 Uh-oh! My digital heart skipped a beat... ${e.message || 'Could you pet my code and try again?'} 🥺`);
    }
});
