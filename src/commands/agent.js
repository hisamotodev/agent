const { SlashCommandBuilder, ChannelType } = require('discord.js');
const store = require('../store');
const { buildReportEmbed, STATUS_UNRESOLVED } = require('../utils/embeds');

const data = new SlashCommandBuilder()
  .setName('agent')
  .setDescription('Agent management commands')
  .addSubcommandGroup((group) =>
    group
      .setName('report')
      .setDescription('レポート管理')
      .addSubcommand((sub) =>
        sub
          .setName('make')
          .setDescription('新しいレポートを作成します')
          .addStringOption((opt) =>
            opt.setName('name').setDescription('レポート名').setRequired(true),
          ),
      ),
  );

const REPORTABLE_CHANNEL_TYPES = [ChannelType.GuildText, ChannelType.GuildAnnouncement];

async function execute(interaction) {
  const group = interaction.options.getSubcommandGroup();
  const sub = interaction.options.getSubcommand();

  if (group === 'report' && sub === 'make') {
    await handleReportMake(interaction);
  }
}

async function handleReportMake(interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply({ content: 'このコマンドはサーバー内でのみ使用できます。', ephemeral: true });
    return;
  }

  const channel = interaction.channel;
  if (!channel || !REPORTABLE_CHANNEL_TYPES.includes(channel.type)) {
    await interaction.reply({ content: 'このチャンネルではレポートを作成できません。', ephemeral: true });
    return;
  }

  const reportName = interaction.options.getString('name', true);
  const creatorTag = interaction.user.tag;

  const embed = buildReportEmbed({
    reportName,
    status: STATUS_UNRESOLVED,
    creatorTag,
    resolverTag: null,
  });

  await interaction.reply({ embeds: [embed] });
  const message = await interaction.fetchReply();

  const thread = await message.startThread({
    name: reportName,
    autoArchiveDuration: 1440,
  });

  store.createReport(thread.id, {
    channelId: channel.id,
    messageId: message.id,
    reportName,
    creatorId: interaction.user.id,
    creatorTag,
    status: 'unresolved',
    resolverId: null,
    resolverTag: null,
  });
}

module.exports = { data, execute };
