require('dotenv').config({ quiet: true });
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const handleInteractionCreate = require('./handlers/interactionCreate');
const handleMessageCreate = require('./handlers/messageCreate');
const { scheduleHoyolabCheckIn } = require('./hoyolab');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag} (${client.guilds.cache.size} guild(s))`);
  scheduleHoyolabCheckIn(client);
});

client.on('guildCreate', (guild) => {
  console.log(`Joined guild: ${guild.name} (${guild.id})`);
});

client.on('guildDelete', (guild) => {
  console.log(`Left guild: ${guild.name} (${guild.id})`);
});

client.on('interactionCreate', handleInteractionCreate);
client.on('messageCreate', handleMessageCreate);

client.login(process.env.DISCORD_TOKEN);
