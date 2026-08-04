require('dotenv').config({ quiet: true });
const { REST, Routes } = require('discord.js');

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    await rest.put(route, { body: [] });
    console.log('Successfully cleared application command(s).');
  } catch (error) {
    console.error(error);
  }
})();
