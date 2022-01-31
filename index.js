const mySecret = process.env['TOKEN'];
const discord = require('discord.js');

const client = new discord.Client();
const prefix = ';';
const fs = require('fs');
client.commands = new discord.Collection();
const { MessageEmbed } = require('discord.js');
const { MessageButton } = require('discord-buttons');
const { Player } = require('discord-player');
client.commands = new discord.Collection();
const db = require('quick.db');
const { Collection } = require('discord.js');

const Pings = new Collection();

client.on("message", (message) => {
  if(!message.mentions.members.first()) return;
  if(message.mentions.members.first().id === message.author.id) return;
  const time = 5000;
  Pings.set(`pinged:${message.mentions.members.first().id}`, Date.now() + time);
});

client.on("messageDelete", (message) => {
    if(!message.mentions.members.first()) return;
    const array = require(`./discord.json`)
    if (array.some(word => message.content.toLowerCase().includes(word))) {
      return;
    }
    console.log('There is a mention')
    if(Pings.has(`pinged:${message.mentions.members.first().id}`)) {
      let logsChannel = client.channels.cache.get(`841434290738429982`);
      const embed = new MessageEmbed()
        .setTitle('Ghost Ping Detected!')
        .addField('Author', message.author, true)
        .addField('Content', message.content, true)
        .setColor(`RED`)
        .setTimestamp()
        message.channel.send(embed)
        logsChannel.send(embed)
    }
})

client.on('messageUpdate', async message => {
  db.set(`editedmsg_${message.channel.id}`, message.content);
	db.set(`senderedited_${message.channel.id}`, message.author.id);
});

client.on('message', message => {
	if (message.content === ';snipedit') {
    const msg = db.get(`editedmsg_${message.channel.id}`);
    const senderid = db.get(`senderedited_${message.channel.id}`);
		if (!msg) {
			return message.channel.send(`There is nothing to edited to snipe.`);
    }
    const embed = new MessageEmbed()
			.setTitle(
				client.users.cache.get(senderid).username,
				client.users.cache
					.get(senderid)
					.displayAvatarURL({ format: 'png', dynamic: true })
			)
      .addField('Edited:', (msg))
			.setColor('#36393F')
			.setTimestamp();
		message.channel.send(embed);

}});

client.on('messageDelete', async message => {
	db.set(`snipemsg_${message.channel.id}`, message.content);
	db.set(`snipesender_${message.channel.id}`, message.author.id);
});

client.on('message', message => {
	if (message.content === ';snipe') {
		const msg = db.get(`snipemsg_${message.channel.id}`);
		const senderid = db.get(`snipesender_${message.channel.id}`);
	if (!msg) {
			return message.channel.send(`There is nothing deleted to snipe.`);
		}
		const embed = new MessageEmbed()
			.setTitle(
				client.users.cache.get(senderid).username,
				client.users.cache
					.get(senderid)
					.displayAvatarURL({ format: 'png', dynamic: true })
			)
      .addField('Deleted:', (msg))
			.setColor('#36393F')
			.setTimestamp();
     message.channel.send(embed);
	}
});

fs.readdirSync('./commands').forEach(dirs => {
	const commands = fs
		.readdirSync(`./commands/${dirs}`)
		.filter(files => files.endsWith('.js'));

	for (const file of commands) {
		const command = require(`./commands/${dirs}/${file}`);
		if (!command || !command.name) return;
		client.commands.set(command.name.toLowerCase(), command);
	}
});

client.on('error', e => console.error(e));
client.on('debug', e => console.info(e));

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity(`Dev's Blog|;help`, { type: `WATCHING` });
});

client.on('message', message => {
	if (message.author.bot || message.channel.type === 'dm') {
		return;
	}

	if (message.content.indexOf(prefix) !== 0) return;

	const args = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/g);
	const command = args.shift().toLowerCase();

	const cmd =
		client.commands.get(command) ||
		client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

	if (!cmd) {
		return;
	}

	try {
		if (cmd) cmd.run(client, message, args);
	} catch (err) {
		console.log(err);
	}

	try {
		if (cmd) cmd.execute(client, message, args);
	} catch (err) {
		console.log(err);
	}
});


var usage = "`;hangman <channel id> <your phrase>`\n`Example: ;hangman 368845035560763402 grandest nan is the man`";
var letters = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰", "🇱", "🇲", "🇳", "🇴", "🇵", "🇶", "🇷", "🇸", "🇹", "🇺", "🇻", "🇼", "🇽", "🇾", "🇿"];
var unicode = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

var games = [];

var stages = [`\`\`\`
/---|
|   
|
|
|
\`\`\`
`, `\`\`\`
/---|
|   o
|
|
|
\`\`\`
`, `\`\`\`
/---|
|   o
|   |
| 
|
\`\`\`
`, `\`\`\`
/---|
|   o
|  /|
|
|
\`\`\`
`, `\`\`\`
/---|
|   o
|  /|\\
|
|
\`\`\`
`, `\`\`\`
/---|
|   o
|  /|\\
|  /
|
\`\`\`
`, `\`\`\`
/---|
|   o ~ thanks
|  /|\\
|  / \\
|
\`\`\`
`];


function generateMessage(phrase, guesses) {
	var s = "";
	for(var i = 0; i < phrase.length; i++) {
		if(phrase[i] == ' ')
			s += " ";
		else {
			var c = phrase[i];
			if(guesses.indexOf(c) == -1)
				c = "\\_";
			s += "__" + c + "__ ";
		}
	}
	return s;
}

function nextLetter(message, index, word) {
    message.react(letters[index]).then(r => {
		index++;
		if(index < letters.length) {
			if(index == 13) {
				message.channel.send(generateMessage(word, [])).then(m => {
					games.push({
						stage: 0,
						msg0: message,
						msg1: m,
						phrase: word,
						guesses: []
					});
					nextLetter(m, index);
				});
			} else {
				nextLetter(message, index, word);
			}
		}
	});
}

client.on('messageReactionAdd', (reaction, user) => {
	var msg = reaction.message;
	if(!user.bot) {
		for(var i = 0; i < games.length; i++) {
			var game = games[i];
			if((msg.id == game.msg0.id || msg.id == game.msg1.id) && game.stage < stages.length) {
				var letter = unicode[letters.indexOf(reaction.emoji.name)];
				
				reaction.users.fetch().then(usrs => {
					var reactors = usrs.array();
					var remove_next = function(index) {
						if(index < reactors.length)
							reaction.remove(reactors[index]).then(() => remove_next(index + 1));
					};
					
					remove_next(0);
				});
				
				if(game.guesses.indexOf(letter) == -1) {
					game.guesses.push(letter);
					if(game.phrase.indexOf(letter) == -1) {
						game.stage ++;
						game.msg0.edit(stages[game.stage]);
					} else {
						var sik = true;
						for(var j = 0; j < game.phrase.length; j++) {
							var c = game.phrase[j];
							if(c != ' ' && game.guesses.indexOf(c) == -1) {
								sik = false;
							}
						}
						
						if(sik) {
							game.msg0.edit(stages[game.stage].replace("o", "o ~ ur alright.. for now"));
						}
						
						game.msg1.edit(generateMessage(game.phrase, game.guesses));
					}
				}
			}
			games[i] = game;
		}
	}
});

client.on('message', msg => {
    if(msg.content.startsWith(";hangman")) {
        var words = msg.content.split('\n')[0].split(' ');
        if(words.length < 2) {
            msg.reply(usage);
        } else {
            var channel = client.channels.cache.find(ch => ch.id == words[1]);
			var word = words.slice(2).join(' ').toLowerCase().replace(/[^a-z\s:]/g, '');
            if(channel != null) {
                channel.send(stages[0]).then(m => {
                    nextLetter(m, 0, word);
                });
            } else {
                msg.reply("No channel with the id `" + words[1] + "` exist! \n" + usage);
            }
        }
    }
});


client.login(process.env.TOKEN);
