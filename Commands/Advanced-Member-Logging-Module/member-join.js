const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require(`discord.js`);
const memberJoin = require('../../Modals/memberJoinSchema');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('setup-member-join')
    .setDescription('Setup the member join system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(command => command.setName('setup').setDescription('Setup the member join system')
    .addChannelOption(option => option.setName('channel').setDescription('The channel you want the logs to be sent to').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(command => command.setName('disable').setDescription('Disable the member join system'))
    .addSubcommand(command => command.setName('edit').setDescription('Change the channel you want the logs to be sent to')
    .addChannelOption(option => option.setName('channel').setDescription('The channel you want the logs to be sent to').addChannelTypes(ChannelType.GuildText).setRequired(true))),
    async execute (interaction) {

        if (!interaction.guild) return await interaction.reply({ content: "This command is only usable in the server!", ephemeral: true });

        const { options } = interaction;
        const sub = options.getSubcommand();

        switch (sub) {
            case 'setup':

            const setupData = await memberJoin.findOne({ Guild: interaction.guild.id});

            const setupChannel = interaction.options.getChannel('channel')
    
            if (setupData) return await interaction.reply({ content: 'You already have the logs system setup', ephemeral: true });
            else {
                await memberJoin.create({
                    Guild: interaction.guild.id,
                    Channel: setupChannel.id,
                })
    
                const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`:white_check_mark:  The logs system has been setup to ${setupChannel}!`)
    
                await interaction.reply({ embeds: [embed] })
            }

            break;

            case 'disable':

            const Data = await memberJoin.findOne({ Guild: interaction.guild.id});

            if (!Data) return await interaction.reply({ content: 'The logs system is not setup!', ephemeral: true });
            else {
                await memberJoin.deleteMany({ Guild: interaction.guild.id});
    
                const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`:white_check_mark:  The logs system has been disabled.`)
    
                await interaction.reply({ embeds: [embed] })
            }

            break;

            case 'edit':

            const data = await memberJoin.findOne({ Guild: interaction.guild.id});

            const channel = interaction.options.getChannel('channel')
    
            if (!data) return await interaction.reply({ content: 'You have not setup the member join system setup within the server!', ephemeral: true});
            else {
                await memberJoin.deleteMany();
    
                await memberJoin.create({
                    Guild: interaction.guild.id,
                    Channel: channel.id
                })
    
            const embed3 = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`:white_check_mark:  You have changed the logs channel to ${channel}!`)
    
            await interaction.reply({ embeds: [embed3]});
        }
        }
    }

}