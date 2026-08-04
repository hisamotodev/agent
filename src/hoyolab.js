const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const { HoyoLabClient, Games } = require('@chiraitori/hoyolab-core');
const { EMBED_COLOR } = require('./utils/constants');

const COOKIE_PATH = path.join(__dirname, '..', 'cookie.json');
const CRON_SCHEDULE = '0 0 6 * * *';
const CRON_TIMEZONE = 'Asia/Tokyo';

const CHECKIN_GAMES = [
  { key: Games.GENSHIN_IMPACT, label: 'Genshin Impact' },
  { key: Games.HONKAI_STAR_RAIL, label: 'Honkai: Star Rail' },
];

function loadAccounts() {
  const raw = fs.readFileSync(COOKIE_PATH, 'utf-8');
  return JSON.parse(raw);
}

function formatGameResult({ result, error }) {
  if (error) return `❌ 失敗：${error.message}`;
  if (result.alreadyCheckedIn) return `☑️ 既にチェックイン済み（${result.totalSignDays}日目）`;
  const award = result.award ? `${result.award.name} x${result.award.count}` : '';
  return `✅ チェックイン完了（${result.totalSignDays}日目・${award}）`;
}

function buildResultEmbed(friendlyName, gameResults) {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(`HoYoLAB デイリーチェックイン：${friendlyName}`)
    .setTimestamp();

  for (const gameResult of gameResults) {
    embed.addFields({ name: gameResult.label, value: formatGameResult(gameResult) });
  }

  return embed;
}

async function checkInAccount(account) {
  const client = new HoyoLabClient({ cookie: account.cookie });
  const gameResults = [];

  for (const game of CHECKIN_GAMES) {
    try {
      const result = await client.dailyCheckIn(game.key);
      gameResults.push({ label: game.label, result });
    } catch (error) {
      gameResults.push({ label: game.label, error });
    }
  }

  return gameResults;
}

async function resolveNotifyChannel(client) {
  const notifyChannelId = process.env.HOYOLAB_NOTIFY_CHANNEL_ID;
  if (!notifyChannelId) {
    console.error('HOYOLAB_NOTIFY_CHANNEL_ID が .env に設定されていません。結果の通知はスキップします。');
    return null;
  }

  const channel = await client.channels.fetch(notifyChannelId).catch(() => null);
  if (!channel) {
    console.error(`HoYoLAB 通知チャンネル (${notifyChannelId}) が見つかりませんでした。結果の通知はスキップします。`);
  }
  return channel;
}

async function runDailyCheckIn(client) {
  let accounts;
  try {
    accounts = loadAccounts();
  } catch (error) {
    console.error('cookie.json の読み込みに失敗しました:', error);
    return;
  }

  const channel = await resolveNotifyChannel(client);

  for (const account of accounts) {
    try {
      const gameResults = await checkInAccount(account);
      console.log(`HoYoLAB チェックイン完了 (${account.friendlyName}):`, gameResults);
      if (channel) {
        await channel.send({ embeds: [buildResultEmbed(account.friendlyName, gameResults)] });
      }
    } catch (error) {
      console.error(`HoYoLAB チェックインに失敗しました (${account.friendlyName}):`, error);
      if (channel) {
        await channel.send(`❌ ${account.friendlyName} のチェックインに失敗しました：${error.message}`).catch(() => {});
      }
    }
  }
}

function scheduleHoyolabCheckIn(client) {
  cron.schedule(
    CRON_SCHEDULE,
    () => {
      runDailyCheckIn(client).catch((error) => {
        console.error('HoYoLAB cron 実行中にエラーが発生しました:', error);
      });
    },
    { timezone: CRON_TIMEZONE },
  );
}

module.exports = { scheduleHoyolabCheckIn };
