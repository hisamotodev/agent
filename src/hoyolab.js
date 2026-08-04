const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const { HoyoLabClient, Games } = require('@chiraitori/hoyolab-core');
const { EMBED_COLOR } = require('./utils/constants');

const COOKIE_PATH = path.join(__dirname, '..', 'cookie.json');
const CRON_SCHEDULE = '0 0 6 * * *';
const CRON_TIMEZONE = 'Asia/Tokyo';
const DEFAULT_FRIENDLY_NAME = 'HoYoLAB';

const CHECKIN_GAMES = [
  { key: Games.GENSHIN_IMPACT, label: 'Genshin Impact' },
  { key: Games.HONKAI_STAR_RAIL, label: 'Honkai: Star Rail' },
];

function loadCookieString() {
  const raw = fs.readFileSync(COOKIE_PATH, 'utf-8');
  const cookies = JSON.parse(raw);
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
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

async function resolveFriendlyName(hoyoClient) {
  try {
    const accounts = await hoyoClient.getAccounts();
    return accounts[0]?.nickname || DEFAULT_FRIENDLY_NAME;
  } catch (error) {
    console.error('HoYoLAB アカウント情報の取得に失敗しました:', error);
    return DEFAULT_FRIENDLY_NAME;
  }
}

async function runDailyCheckIn(client) {
  let cookie;
  try {
    cookie = loadCookieString();
  } catch (error) {
    console.error('cookie.json の読み込みに失敗しました:', error);
    return;
  }

  const channel = await resolveNotifyChannel(client);
  const hoyoClient = new HoyoLabClient({ cookie });
  const friendlyName = await resolveFriendlyName(hoyoClient);

  const gameResults = [];
  for (const game of CHECKIN_GAMES) {
    try {
      const result = await hoyoClient.dailyCheckIn(game.key);
      gameResults.push({ label: game.label, result });
    } catch (error) {
      gameResults.push({ label: game.label, error });
    }
  }

  console.log(`HoYoLAB チェックイン完了 (${friendlyName}):`, gameResults);

  if (channel) {
    await channel.send({ embeds: [buildResultEmbed(friendlyName, gameResults)] }).catch((error) => {
      console.error('HoYoLAB 結果の通知送信に失敗しました:', error);
    });
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
