require('dotenv').config();
const { REST, Routes } = require('discord.js');
const agentCommand = require('./commands/agent');

const commands = [agentCommand.data.toJSON()];

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    const data = await rest.put(route, { body: commands });
    console.log(`Successfully registered ${data.length} application command(s).`);
  } catch (error) {
    console.error(error);
  }
})();
