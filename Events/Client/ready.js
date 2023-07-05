const {Client} = require('discord.js');
const mongoose = require('mongoose');
const config = require('../../confg.json')

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        await mongoose.connect(config.mongo || '', {
        });

        if (mongoose.connect) {
            console.log('Connecting to the mongoose server')
            console.log('Database has been successfully connected');
        }
        
        console.log('Connecting to discord bot account:', `${client.user.tag}`);
        console.log(`${client.user.username} client has successfully connected`);
    },
};