const { Client, Collection, MessageEmbed, MessageAttachment } = require('discord.js');
const config = require('./config.json');
const utils = require("./utils")
const Gameboy = require("serverboy")
const imgur = require('imgur');
const fs = require("fs")
const PNG = require("pngjs").PNG
var gameboy = new Gameboy();

var rom = fs.readFileSync("./rom/Pokemon Rouge Feux.gba");

const db = require('monk')(config.dbsusr + ":" + config.dbspwd + "@localhost" + config.dbsport + "/GameBoyDiscord")
const dbmem = db.get('SaveMemory')

const client = new Client();


client.on('ready', () => {
	console.log('Bot is ready...');
	gameboy.loadRom(rom);
})
client.on('message', async (message) => {
	
	if (!message.guild) return;
	
	if (message.author.bot == true ) {
		for ( const element in utils.Controler) {
			message.react(utils.Controler[element])
		}
		return;
	}

	console.log(message.channel.name)
	console.log(message.content);
	if (message.channel.name == "pokemon") {
		if (message.content == "!start") {
			gameboy.doFrame();
			
			var screen = gameboy.getScreen();

			//write to PNG (using pngjs)
			var png = new PNG({ width: 160, height: 144 });
			for (let i=0; i<screen.length; i++) {
				png.data[i] = screen[i];
			}
			var buffer = PNG.sync.write(png);
			fs.writeFileSync('./out.png', buffer);

			//const Nmessage =new MessageAttachment(buffer, 'out.png')
			// let Attamessage = new MessageAttachment(buffer,"out.png");
			// console.log(Attamessage.path)
			// message.channel.send( "current image of the game", { file : [Attamessage] } );
			imgur
			.uploadFile('./out.png')
			.then( async (json) => {
				const EmMessage = new MessageEmbed()
					.setTitle("Current image of the game")
					.setColor(utils.Colors.RED)
					.setImage(json.link)
					.setTimestamp()
					.setAuthor("Pokemon Player", client.user.avatarURL())
				const NewMessage = await message.channel.send(EmMessage)
				setTimeout(() => UpdatePokemonPlayer(NewMessage), 10 * 1000)
			})
			.catch((err) => {
				console.error(err.message);
			});			
			}
	}
});


function UpdatePokemonPlayer(OldMessage) {
	// trouver les reaction
	OldMessage.reactions.cache.map( (a) => console.log(a._emoji.name, a.count) )
	

	// compter les reaction
	// faire l'action
	// refaire un msg

}


client.login(config.token);

