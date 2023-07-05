const { Client, Events, ActivityType, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ComponentType, ChannelType, Partials, WebhookClient, embedLength, Webhook } = require('discord.js');
const memberJoin = require('./Modals/memberJoinSchema');
const path = require('path');
const config = require('./confg.json');
const fs = require('fs');

const {Guilds, GuildMembers, GuildMessages, MessageContent} = GatewayIntentBits;
const {User, Message, GuildMember, ThreadMember, Channel} = Partials;

const {loadEvents} = require('./Handlers/eventHandler');
const {loadCommands} = require('./Handlers/commandHandler');

const client = new Client({
	intents: [Guilds, GuildMembers, GuildMessages, MessageContent],
	partials: [User, Message, GuildMember, ThreadMember],
});

require("dotenv").config();

client.commands = new Collection();
client.config = require('./confg.json');

client.login(client.config.token).then(() => {
	loadEvents(client);
	loadCommands(client);
});

// Tickets
client.on("interactionCreate", async (interaction) => {

    await interaction.deferUpdate();
    if (interaction.isButton()) {
        if (interaction.customId === 'tic') {

            const thread = await interaction.channel.threads.create({
                name: `${interaction.user.tag}`,
                autoArchiveDuration: 1440, // this is 24hrs 60 will make it 1 hr
                //type: 'private_thread', // for private tickets u need server boosted to lvl 1 or 2 ok u need lvl 2, since mine is not boosted i will remove this LINE ONLY!
            });
            await thread.setLocked(true)
            const embed = new EmbedBuilder()
                .setTitle('Ticket')
                .setDescription('Hello there, \n The staff will be here as soon as possible mean while tell us about your issue!\nThank You!')
                .setColor('Green')
                .setTimestamp()
                .setAuthor(interaction.guild.name, interaction.guild.iconURL({
                    dynamic: true
                }));

            const del = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('del')
                    .setLabel('🗑️ Delete Ticket!')
                    .setStyle('DANGER'),
                );
            interaction.user.send('Your ticket has been opened!');
            thread.send({
                content: `Welcome <@${interaction.user.id}>`,
                embeds: [embed],
                components: [del]
            }).then(interaction.followUp({
                content: 'Created Ticket!',
                ephemeral: true
            }))
            console.log(`Created thread: ${thread.name}`);
            setTimeout(() => {
                interaction.channel.bulkDelete(1)
            }, 5000)
        } else if (interaction.customId === 'del') {

            const thread = interaction.channel
            thread.delete();

        }
    }
}) // you can put this code even in index.js to make it neat i put it in a event folder

// Event handler for messageCreate event
client.on('messageCreate', async (message) => {
	if (message.author.bot) return; // Ignore messages from bots
  
	// Handle flagged words
	await handleFlaggedWord(client, message);
  });
  
  async function handleFlaggedWord(client, message) {
	const flaggedWords = ['flagged', 'word1', 'word2']; // List of flagged words
	const channelId = '1094138026864685097'; // The ID of the Discord channel
	const flaggedFolderPath = 'C:/Users/ripol/OneDrive/Documents/AHHHHHHHH/Anti Cheat'; // The folder path to save the flagged files
	const content = message.content; // Get the original message content
  
	if (content) {
		for (const flaggedWord of flaggedWords) {
		  if (content.includes(flaggedWord)) {
			console.log(`Flagged word detected: ${flaggedWord}`);
	
			// Send flagged report to the Discord channel
			const channel = await client.channels.fetch(channelId);
			if (channel && channel.type === 'GuildText') {
			  await channel.send(`User ${message.author} has used the flagged word: ${flaggedWord}`);
			}
	
			// Generate and save file in the flagged folder
			const attachment = message.attachments.first();
			if (attachment) {
			  console.log('Attachment found!');
			  const attachment = message.attachments.first();
			  const fileExtension = attachment.name.split('.').pop();
			  const fileName = `${message.id}.${fileExtension}`;
			  const filePath = `${flaggedFolderPath}/${fileName}`;
			  await attachment.save(filePath);
			  console.log(`Flagged file saved at ${filePath}`);
			} else {
			  console.log('No attachment found!');
			}
  
		  // Reply with an embed
		  const embed = new EmbedBuilder()
			.setColor('#FF0000')
			.setTitle('Flagged Word Detected')
			.setDescription(`Your message contained the flagged word: ${flaggedWord}`)
			.addFields(
			  { name: 'Report Sent', value: 'A report has been sent to the developers.' },
			  { name: 'File Saved', value: 'The file has been saved for further review.' }
			);
  
		  message.reply({ embeds: [embed] });
  
		  break; // Exit the loop after the first flagged word is found
		}
	  }
	}
  }

//Member-Join Logs
client.on(Events.GuildMemberAdd, async (member) => {

	const Data = await memberJoin.findOne({ Guild: member.guild.id});
  
	if (!member.user.bot) {
  
	  const currentTime = new Date();
	  const accountAgeInDays = (currentTime - member.user.createdAt) / (1000 * 60 * 60 * 24);
	  let riskScale = 10 - Math.floor(accountAgeInDays / 30);
	  if (riskScale < 1) riskScale = 1;
  
	  let riskEmoji = "";
	  if (riskScale >= 10) riskEmoji = "😡";
	  else if (riskScale >= 9) riskEmoji = "😠";
	  else if (riskScale >= 8) riskEmoji = "😤";
	  else if (riskScale >= 7) riskEmoji = "😒";
	  else if (riskScale >= 6) riskEmoji = "🙁";
	  else if (riskScale >= 5) riskEmoji = "😕";
	  else if (riskScale >= 4) riskEmoji = "🙂";
	  else if (riskScale >= 3) riskEmoji = "😊";
	  else if (riskScale >= 2) riskEmoji = "😄";
	  else riskEmoji = "😁";
  
		const embed = new EmbedBuilder()
		.setColor("Green")
		.setAuthor({
			name: member.user.username,
			iconURL: member.user.avatarURL({ dynamic: true, size: 1024 }),
		  })
		.setThumbnail(member.user.avatarURL())
		.setDescription(`**Member Joined | ${member}**`)
		.addFields({name:"Joined Discord",value:`<t:${parseInt(member.user.createdAt/1000)}:f>\n (<t:${parseInt(member.user.createdAt/1000)}:R>)`,inline:true})
		.addFields({name:"Risk Scale",value:`${riskScale}/10 ${riskEmoji}`,inline:true})
		.setFooter({ text: `ID: ${member.id}`})
		.setTimestamp()
  
		const banEmbed = new EmbedBuilder()
		.setColor("Red")
		.setAuthor({
			name: member.user.username,
			iconURL: member.user.avatarURL({ dynamic: true, size: 1024 }),
		  })
		.setThumbnail(member.user.avatarURL())
		.setDescription(`The reason for banning ${member}`)
		.setFooter({ text: `ID: ${member.id}`})
		.setTimestamp()
  
		const warnEmbed = new EmbedBuilder()
		.setColor("Blue")
		.setAuthor({
			name: member.user.username,
			iconURL: member.user.avatarURL({ dynamic: true, size: 1024 }),
		  })
		.setThumbnail(member.user.avatarURL())
		.setDescription(`The reason for warning ${member}`)
		.setFooter({ text: `ID: ${member.id}`})
		.setTimestamp()
  
		const kickEmbed = new EmbedBuilder()
		.setColor('Grey')
		.setAuthor({
			name: member.user.username,
			iconURL: member.user.avatarURL({ dynamic: true, size: 1024 }),
		  })
		.setThumbnail(member.user.avatarURL())
		.setDescription(`The reason for kicking ${member}`)
		.setFooter({ text: `ID: ${member.id}`})
		.setTimestamp()
  
		if (Data) {
  
		  const channel1 = client.channels.cache.get(Data.Channel);
  
			const kickRow = new ActionRowBuilder()
			  .addComponents(
				new StringSelectMenuBuilder()
				  .setCustomId('kickselect')
				  .setMaxValues(1)
				  .setPlaceholder('Reason for kick')
				  .addOptions(
					{
					  label: 'Young Account Age',
					  value: 'Account too new to join. This ensures safety, prevents alt accounts and reduces suspicious activity.',
					},
					{
					  label: 'Suspicious Account Usage',
					  value: 'Your account has been kicked for suspicious usage. This ensures community safety and security.',
					},
					{
					  label: 'Inappropriate Username',
					  value: 'You have been kicked due to a violation of our username policy. This is to ensure community safety.',
					},
					{
					  label: 'Inappropriate Content',
					  value: 'Your account has been kicked due to a violation of our NSFW policy. This ensures community safety.',
					},
				  ),
			  );
  
			  const warnRow = new ActionRowBuilder()
			  .addComponents(
				new StringSelectMenuBuilder()
				  .setCustomId('warnselect')
				  .setMaxValues(1)
				  .setPlaceholder('Reason for warn')
				  .addOptions(
					{
					  label: 'Suspicious Account Usage',
					  value: 'Your account has been warned due to suspicious usage. This ensures community safety and security.',
					},
					{
					  label: 'Inappropriate Username',
					  value: 'You have been warned due to a violation of our username policy. This is to ensure community safety.',
					},
					{
					  label: 'Inappropriate Content',
					  value: 'Your account has been warned due to a violation of our NSFW policy. This ensures community safety.',
					},
				  ),
			  );
  
			  const banRow = new ActionRowBuilder()
			  .addComponents(
				new StringSelectMenuBuilder()
				  .setCustomId('banselect')
				  .setMaxValues(1)
				  .setPlaceholder('Reason for ban')
				  .addOptions(
					{
					  label: 'Young Account Age',
					  value: 'Account too new to join. This ensures safety, prevents alt accounts and reduces suspicious activity.',
					},
					{
					  label: 'Suspicious Account Usage',
					  value: 'Your account has been banned due to suspicious usage. This ensures community safety and security.',
					},
					{
					  label: 'Inappropriate Username',
					  value: 'You have been banned due to a violation of our username policy. This is to ensure community safety.',
					},
					{
					  label: 'Inappropriate Content',
					  value: 'Your account has been banned due to a violation of our NSFW policy. This ensures community safety.',
					},
				  ),
			  );
  
		  const button = new ActionRowBuilder()
		  .addComponents(
			  new ButtonBuilder()
			  .setCustomId(`kick`)
			  .setLabel(`🗑️ Kick`)
			  .setStyle(ButtonStyle.Secondary),
  
			  new ButtonBuilder()
			  .setCustomId(`warn`)
			  .setLabel(`🚨 Warn`)
			  .setStyle(ButtonStyle.Primary),
  
			  new ButtonBuilder()
			  .setCustomId(`ban`)
			  .setLabel(`🛠️ Ban`)
			  .setStyle(ButtonStyle.Danger),
		  )
  
		  const message = await channel1.send({ embeds: [embed], components: [button] });
		  const collector = await message.createMessageComponentCollector();
  
		  collector.on('collect', async i => {
			  
			  if (i.customId === 'kick') {
  
				const newMessage = await i.reply({ embeds: [kickEmbed], components: [kickRow] });
				const collector2 = newMessage.createMessageComponentCollector();
  
				 collector2.on('collect',  async interaction => {
		
				  let choices;
			  
				  if (interaction.customId === 'kickselect') {
  
					if (!member) return interaction.reply({ content: "This member is not in the server.", ephemeral: true });
					if (interaction.member === member) return interaction.reply({ content: "You cannot kick yourself.", ephemeral: true });
					if (!member.kickable) return interaction.reply({ content: "You cannot kick this person.", ephemeral: true });
					
					choices = interaction.values;
  
					const memberKickEmbed = new EmbedBuilder()
					.setColor('Grey')
					.setTitle(`Member Kicked | ${member.user.tag}`)
					.addFields(
						{ name: 'User', value: `${member}`, inline: true },
						{ name: 'Moderator', value: `${interaction.member}`, inline: true },
						{ name: 'Reason', value: `${choices}`, inline: false },
					)
					.setFooter({ text: `ID: ${member.id}`})
					.setTimestamp()
  
					const embed = new EmbedBuilder()
					.setColor("Blue")
					.setDescription(`:white_check_mark:  ${member} has been **kicked** | ${choices}`)
  
					const dmEmbed = new EmbedBuilder()
					.setColor("Grey")
					.setDescription(`:white_check_mark:  You were **kicked** from **${interaction.guild.name}** | ${choices}`)
	
					if (Data) {
					  const channel1 = client.channels.cache.get(Data.Channel);
				
					  await channel1.send({ embeds: [memberKickEmbed]})
				  }
				
					interaction.reply({ embeds: [embed] });
  
					await member.send({ embeds: [dmEmbed] }).catch(err => {
					  return ({ content: `${member} does not have their DMs open and can there for not recieve the kick DM.`, ephemeral: true })
				  })
  
					 member.kick({ reason: choices.join(' ') }).catch(err => {
					  return ({ content: `${member} could not be kicked.`, ephemeral: true })
				  })
				  collector2.stop();
				  }
		
				 })
  
			  }
			  if (i.customId === 'warn') {
  
				const newMessage = await i.reply({ embeds: [warnEmbed], components: [warnRow] });
				const collector2 = newMessage.createMessageComponentCollector();
  
				 collector2.on('collect',  async interaction => {
		
				  let choices;
			  
				  if (interaction.customId === 'warnselect') {
  
					if (!member) return interaction.reply({ content: "This member is not in the server.", ephemeral: true });
					if (interaction.member === member) return interaction.reply({ content: "You cannot warn yourself.", ephemeral: true });
					if (!member.kickable) return interaction.reply({ content: "You cannot warn this person.", ephemeral: true });
					
					choices = interaction.values;
  
					const memberWarnEmbed = new EmbedBuilder()
					.setColor('Blue')
					.setTitle(`Member Warned | ${member.user.tag}`)
					.addFields(
						{ name: 'User', value: `${member}`, inline: true },
						{ name: 'Moderator', value: `${interaction.member}`, inline: true },
						{ name: 'Reason', value: `${choices}`, inline: false },
					)
					.setFooter({ text: `ID: ${member.id}`})
					.setTimestamp()
  
					const embed = new EmbedBuilder()
					.setColor("Blue")
					.setDescription(`:white_check_mark:  ${member} has been **warned** | ${choices}`)
  
					const dmEmbed = new EmbedBuilder()
					.setColor("Blue")
					.setDescription(`:white_check_mark:  You were **warned** from **${interaction.guild.name}** | ${choices}`)
	
					if (Data) {
					  const channel1 = client.channels.cache.get(Data.Channel);
				
					  await channel1.send({ embeds: [memberWarnEmbed]})
				  }
				
					interaction.reply({ embeds: [embed] });
  
					await member.send({ embeds: [dmEmbed] }).catch(err => {
					  return ({ content: `${member} does not have their DMs open and can there for not recieve the warn DM.`, ephemeral: true })
				  })
				  collector2.stop();
				  }
		
				 })
  
			}
			if (i.customId === 'ban') {
  
			  const newMessage = await i.reply({ embeds: [banEmbed], components: [banRow] });
			  const collector2 = newMessage.createMessageComponentCollector();
  
			   collector2.on('collect',  async interaction => {
	  
				let choices;
			
				if (interaction.customId === 'banselect') {
  
				  if (!member) return interaction.reply({ content: "This member is not in the server.", ephemeral: true });
				  if (interaction.member === member) return interaction.reply({ content: "You cannot ban yourself.", ephemeral: true });
				  if (!member.kickable) return interaction.reply({ content: "You cannot ban this person.", ephemeral: true });
				  
				  choices = interaction.values;
  
				  const memberBanEmbed = new EmbedBuilder()
				  .setColor('Red')
				  .setTitle(`Member Banned | ${member.user.tag}`)
				  .addFields(
					  { name: 'User', value: `${member}`, inline: true },
					  { name: 'Moderator', value: `${interaction.member}`, inline: true },
					  { name: 'Reason', value: `${choices}`, inline: false },
				  )
				  .setFooter({ text: `ID: ${member.id}`})
				  .setTimestamp()
  
				  const embed = new EmbedBuilder()
				  .setColor("Red")
				  .setDescription(`:white_check_mark:  ${member} has been **banned** | ${choices}`)
  
				  const dmEmbed = new EmbedBuilder()
				  .setColor("Red")
				  .setDescription(`:white_check_mark:  You were **banned** from **${interaction.guild.name}** | ${choices}`)
  
				  if (Data) {
					const channel1 = client.channels.cache.get(Data.Channel);
			  
					await channel1.send({ embeds: [memberBanEmbed]})
				}
			  
				  interaction.reply({ embeds: [embed] });
  
				  await member.send({ embeds: [dmEmbed] }).catch(err => {
					return ({ content: `${member} does not have their DMs open and can there for not recieve the ban DM.`, ephemeral: true })
				})
  
				member.ban({ reason: choices.join(' ') }).catch(err => {
					return ({ content: `${member} could not be banned.`, ephemeral: true }) 
				})
  
				collector2.stop();
				}
	  
			   })
  
		  }
			}
		  )
		  
	  }
	}
  })