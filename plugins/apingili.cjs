(async () => {
  const { cmd } = await import('../command.js');

  
  cmd({
    pattern: "pingili",
    alias: ["pili"],
    desc: "Simple ping test",
    react: "💥",
    use: ".pingili",
    category: "utility",
    filename: __filename,
  }, async (conn, mek, m, { reply }) => {
    await reply("💥 Pongili from LUNA MD!");
  });
})();
