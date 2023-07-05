const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuildr()
    .setName('ping')
    .setDescription('Pong'),
    async execute(interaction) {
        await interaction.reply({content: "Pong", ephemeral: true})
    },
};