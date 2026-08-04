const store = require('../store');
const {
  buildResolvedConfirmEmbed,
  buildResolveButtonRow,
  buildReportEmbed,
  STATUS_RESOLVED,
} = require('../utils/embeds');

module.exports = async function handleButtonInteraction(interaction) {
  const [action, authorId] = interaction.customId.split(':');
  if (action !== 'report_resolve') return;

  const thread = interaction.channel;
  const report = thread ? store.getReport(thread.id) : undefined;

  if (!report) {
    await interaction.reply({ content: 'このレポートの情報が見つかりませんでした。', ephemeral: true });
    return;
  }

  const answerer = await interaction.client.users.fetch(authorId);
  const resolverTag = answerer.tag;
  const markedByTag = interaction.user.tag;

  store.updateReport(thread.id, {
    status: 'resolved',
    resolverId: authorId,
    resolverTag,
  });

  await interaction.reply({
    embeds: [buildResolvedConfirmEmbed({ resolverTag, markedByTag })],
  });

  if (interaction.message.editable) {
    await interaction.message.edit({ components: [buildResolveButtonRow(authorId, true)] });
  }

  const creator = await interaction.client.users.fetch(report.creatorId);

  const channel = await interaction.client.channels.fetch(report.channelId);
  const originalMessage = await channel.messages.fetch(report.messageId);
  await originalMessage.edit({
    embeds: [
      buildReportEmbed({
        reportName: report.reportName,
        status: STATUS_RESOLVED,
        creatorTag: report.creatorTag,
        creatorIconURL: creator.displayAvatarURL(),
        resolverTag,
        resolverIconURL: answerer.displayAvatarURL(),
      }),
    ],
  });
};
