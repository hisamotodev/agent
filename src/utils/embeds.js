const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EMBED_COLOR } = require('./constants');

const STATUS_UNRESOLVED = '⚠️未解決';
const STATUS_RESOLVED = '✅解決済み';

function buildReportEmbed({
  reportName,
  status,
  creatorTag,
  creatorIconURL,
  resolverTag,
  resolverIconURL,
}) {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(`レポート：${reportName}`)
    .addFields({ name: 'ステータス', value: status, inline: true })
    .setFooter({ text: `作成者：${creatorTag}`, iconURL: creatorIconURL });

  if (resolverTag) {
    embed.setAuthor({ name: `回答者：${resolverTag}`, iconURL: resolverIconURL });
  }

  return embed;
}

function buildResolvePromptEmbed(senderTag) {
  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setDescription(`${senderTag} さんの回答で解決しましたか？解決した場合は下のボタンを押してください。`);
}

function buildResolveButtonRow(authorId, disabled = false) {
  const button = new ButtonBuilder()
    .setCustomId(`report_resolve:${authorId}`)
    .setLabel('解決済みにする')
    .setEmoji('✅')
    .setStyle(ButtonStyle.Success)
    .setDisabled(disabled);
  return new ActionRowBuilder().addComponents(button);
}

function buildResolvedConfirmEmbed({ resolverTag, markedByTag }) {
  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setDescription(`${resolverTag} さんの回答で解決済みとしてマークしました。（マークしたユーザー：${markedByTag}）`);
}

module.exports = {
  STATUS_UNRESOLVED,
  STATUS_RESOLVED,
  buildReportEmbed,
  buildResolvePromptEmbed,
  buildResolveButtonRow,
  buildResolvedConfirmEmbed,
};
