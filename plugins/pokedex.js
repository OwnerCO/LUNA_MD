import config from "../config.cjs";
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

// Pokedex handler
const pokedexSearch = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["pokedex"].includes(cmd)) return;
  
  const ctx = getNewsletterContext([m.sender]);
  const pokemonName = m.body.slice(prefix.length + cmd.length).trim();
  
  try {
    // React with pokeball emoji
    await Matrix.sendMessage(m.from, {
      react: { text: "🔍", key: m.key },
    });

    if (!pokemonName) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "✨ *LUNA MD* here!\nPlease tell me a Pokémon name~ 🍥\nExample: .pokedex Pikachu",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    // Show searching message
    await Matrix.sendMessage(
      m.from,
      { 
        text: `🔍 *Searching Pokédex for "${pokemonName}"...*`,
        contextInfo: ctx
      },
      { quoted: m }
    );

    const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(pokemonName)}`;
    const response = await fetch(url);
    const json = await response.json();

    if (!response.ok || json.error) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: `❌ Couldn't find "${pokemonName}" in the Pokédex~ Try another Pokémon?`,
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    // Format Pokémon data beautifully
    const pokemonInfo = `
✨ *${json.name.toUpperCase()}* #${json.id}

╭─・─・─・─・─・─・─・─╮
│ 🧬 *Type:* ${json.type.join(', ')}
│ 📏 *Height:* ${json.height}
│ ⚖️ *Weight:* ${json.weight}
│ 🔰 *Abilities:* ${json.abilities.join(', ')}
╰─・─・─・─・─・─・─・─╯

📝 *Description:*
${json.description}

💖 *Powered by LUNA MD* 😇
    `.trim();

    // Send Pokémon image with info
    const imageUrl = json.sprites?.animated || json.sprites?.normal || '';
    if (imageUrl) {
      await Matrix.sendMessage(
        m.from,
        {
          image: { url: imageUrl },
          caption: pokemonInfo,
          contextInfo: ctx
        },
        { quoted: m }
      );
    } else {
      await Matrix.sendMessage(
        m.from,
        { 
          text: pokemonInfo,
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

  } catch (e) {
    console.error("LUNA MD Pokedex error:", e);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Oopsie~ Error: ${e.message || e}`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export default pokedexSearch;