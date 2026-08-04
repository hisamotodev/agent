const agentCommand = require('../commands/agent');
const handleButtonInteraction = require('./buttonInteraction');

module.exports = async function handleInteractionCreate(interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'agent') {
        await agentCommand.execute(interaction);
      }
      return;
    }

    if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    }
  } catch (error) {
    console.error(error);
    const errorContent = { content: 'エラーが発生しました。', ephemeral: true };
    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorContent).catch(() => {});
      } else {
        await interaction.reply(errorContent).catch(() => {});
      }
    }
  }
};
