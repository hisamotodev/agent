const store = require('../store');
const { buildResolvePromptEmbed, buildResolveButtonRow } = require('../utils/embeds');

module.exports = async function handleMessageCreate(message) {
  if (message.author.bot) return;
  if (!message.channel.isThread()) return;

  const report = store.getReport(message.channel.id);
  if (!report) return;

  const embed = buildResolvePromptEmbed(message.author.tag);
  const row = buildResolveButtonRow(message.author.id);

  await message.channel.send({ embeds: [embed], components: [row] });
};
