const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Tests if commands work'),
    async execute(interaction) {
        await interaction.reply('Commands are working!');
    },
};
