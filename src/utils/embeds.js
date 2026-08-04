const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EMBED_COLOR } = require('./constants');

const STATUS_UNRESOLVED = '⚠️未解決';
const STATUS_RESOLVED = '✅解決済み';
const NO_ANSWERER = '-';

function buildReportEmbed({ reportName, status, creatorTag, resolverTag }) {
  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(`レポート：${reportName}`)
    .addFields(
      { name: 'ステータス', value: status, inline: true },
      { name: '作成者', value: creatorTag, inline: true },
      { name: '回答者', value: resolverTag || NO_ANSWERER, inline: true },
    );
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
