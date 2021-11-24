const { Client, Collection, MessageEmbed, MessageAttachment } = require('discord.js');
const config = require('./config.json');
const utils = require("./utils")
const Gameboy = require("serverboy")
const fs = require("fs")
const PNG = require("pngjs").PNG
const mongoose = require('mongoose');
var gameboy = new Gameboy();

var rom = fs.readFileSync("./rom/Pokemon Red.gb");

mongoose.connect("mongodb://localhost:27017/GameBoyDiscord", {
	authSource: "admin",
    "user": config.dbsusr,
    "pass": config.dbspwd,
});

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const SaveSchema = new Schema({
	guildid: Number,
	memory: Buffer,
	date: Date
});

const SaveModel = mongoose.model('SaveMemory', SaveSchema);

// const db = require('monk')(config.dbsusr + ":" + config.dbspwd + "@0.0.0.0:" + config.dbsport + "/GameBoyDiscord")
// console.log(db);

// const db = require('monk')('user:pass@localhost:port/mydb')



const client = new Client();


client.on('ready', () => {
	console.log('Bot is ready...');
	
})
client.on('message', async (message) => {
	
	if (!message.guild) return;
	
	if (message.channel.name == "pokemon") {
		if (message.content == "!start") {		
			
			const doc = await SaveModel.findOne( {guildid: message.guild.id } );
			//console.log(doc)
			if (! doc) {
				gameboy.loadRom(rom);

				for (let i = 0; i < 10000; i++) {
					gameboy.doFrame();
					
				}
		
				const badMem = new Uint8Array(gameboy.getSaveData().buffer)
				const goodmem = new Buffer.from(badMem)
				console.log(goodmem);
				const save = new SaveModel();
				save.guildid = message.guild.id
				save.date = new Date()
				save.memory = goodmem
				
				await save.save()
				//dbmem.insert({ id: message.guild.id, memory: gameboy.getSaveData() })
				
			} else {
				gameboy.loadRom(rom, doc.memory);
				for (let i = 0; i < 10000; i++) {
					gameboy.doFrame();
					
				}
			}

			makeImageAndSend(message)
			
		} else if (message.content == "!removesave") {
			if (message.member.hasPermission('ADMINISTRATOR')) {
				SaveModel.deleteOne( {guildid: message.guild.id}, (e) => console.log(e))
				message.reply("c'est fait !")
			}
		}
	}
})


async function makeImageAndSend(message) {
	for (let i = 0; i < 150; i++) {
		gameboy.doFrame();
	}
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
	// const EmMessage = new MessageEmbed()
	// 		.setTitle("Current image of the game")
	// 		.setColor(utils.Colors.RED)
	// 			.setImage(json.link)
	// 		.setTimestamp()
	// 		.setAuthor("Pokemon Player", client.user.avatarURL())
	
	utils.resizer(buffer, 160*2, async buffer => {
		let NewBuffer = buffer 
		const file = new MessageAttachment(NewBuffer, "out.png"); 
		//console.log(file);
		
		const NewMessage = await message.channel.send( "current image of the game", file )

		for ( const element in utils.Controler) {
			await NewMessage.react(utils.Controler[element])
		}
			
		setTimeout(() => UpdatePokemonPlayer(NewMessage), 10 * 1000)
	})

	
}


async function UpdatePokemonPlayer(OldMessage) {
	// trouver les reaction
	let reactions = []
	OldMessage.reactions.cache.map( (a) => reactions.push({name :a._emoji.name, count : a.count}) )
	
	// compter les reaction
	reactions.sort( (a, b) => (a.count < b.count ) ? 1 : -1)
	
	// si persone n'a voter alors 
	if (reactions[0].count == 1) { 


		// sauvegarde
		
		const badMem = new Uint8Array(gameboy.getSaveData().buffer)
		const goodmem = new Buffer.from(badMem)


		const guildid = OldMessage.guild.id

		const memory = goodmem
		
		await SaveModel.findOneAndUpdate({guildid: guildid}, {memory: memory})

		OldMessage.reply("Persone n'a répondue donc je met la partie en pause, \n id : "+  OldMessage.guild.id.toString())
		return 
	}

	// faire l'action
	switch (reactions[0].name) {
		case utils.Controler.LEFT:
			gameboy.pressKey(Gameboy.KEYMAP.LEFT)
			break;
		case utils.Controler.UP:
			gameboy.pressKey(Gameboy.KEYMAP.UP)

			break;
		case utils.Controler.DOWN:
			gameboy.pressKey(Gameboy.KEYMAP.DOWN)

			break;
		case utils.Controler.RIGHT:
			gameboy.pressKey(Gameboy.KEYMAP.RIGHT)

			break;
		case utils.Controler.START:
			gameboy.pressKey(Gameboy.KEYMAP.START)

			break;
		case utils.Controler.SELECT:
			gameboy.pressKey(Gameboy.KEYMAP.SELECT)

			break;
		case utils.Controler.A:
			gameboy.pressKey(Gameboy.KEYMAP.A)

			break;
		case utils.Controler.B:
			gameboy.pressKey(Gameboy.KEYMAP.B)
			break;
		default:
			break;
	}

	// refaire un msg

	makeImageAndSend(OldMessage)

}


client.login(config.token);
