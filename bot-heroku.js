const settings = require("./settings.json");
const Discord  = require("discord.js");
const fs       = require("fs");
const prefix   = settings.prefix;


// Cria novo cliente
const bot = new Discord.Client();
bot.commands = new Discord.Collection();


// Seta comandos
fs.readdir("./cmd/", function (err, files) {
	
	if(err) console.error(err);

	let jsfiles = files.filter(f => f.split(".").pop() === "js");

	if (jsfiles.length <= 0) {
		console.log("No commands to load!");
		return;
	}

	console.log(`Loading ${jsfiles.length} commands!`);

	jsfiles.forEach(function (f, i) {

		let props = require(`./cmd/${f}`);
		
		//console.log(`${i + 1}: ${f} loaded!`);
		
		bot.commands.set(props.help.name, props);
	});
});


// Aviso de quando o bot estiver pronto
bot.on("ready", async function () {

	console.log("Bot is ready!");
	//console.log(bot.commands);
});


// Trata recebimento de mensagens
bot.on("message", async function (message) {

	// Se for um bot, retorna
	if (message.author.bot) return;
	if (message.channel.type === "dm") return;

	// Se a mensagem não iniciar com o prefixo, retorna
	if(!message.content.startsWith(prefix)) return;
	
	// Seta variáveis da mensagem recebida
	let messageArray = message.content.split(/\s+/g);
	let command = messageArray[0].slice(prefix.length);
	let args = messageArray.slice(1);

	let cmd = bot.commands.get(command);
	if(cmd) cmd.run(bot, message, args);
});


// Realiza login do bot no servidor
bot.login(process.env.BOT_TOKEN);
