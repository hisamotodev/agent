require('dotenv').config({ quiet: true });
const { PermissionFlagsBits, PermissionsBitField } = require('discord.js');

if (!process.env.CLIENT_ID) {
  console.error('CLIENT_ID が .env に設定されていません。');
  process.exit(1);
}

const permissions = new PermissionsBitField([
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.SendMessagesInThreads,
  PermissionFlagsBits.CreatePublicThreads,
  PermissionFlagsBits.EmbedLinks,
  PermissionFlagsBits.ReadMessageHistory,
]).bitfield.toString();

const url = `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=bot%20applications.commands&permissions=${permissions}`;

console.log(url);
