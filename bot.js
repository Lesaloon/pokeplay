const { Client, Collection, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

const config = require('./config.json');
const client = new Client();

const chanelID = "908466169516793937"
const GuildId = "865370404150968330"


client
	.on('ready', () => {
		console.log('Bot is ready...');
	})
	// Client message event, contains the logic for the command handler.
	.on('message', (message) => {
		
	});

client.login(config.token);

