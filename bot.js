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
		
		bot.commands.set(props.info.name, props);
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
	if ((!message.content.startsWith(prefix)) && (!message.content.startsWith("<@396003761904025601>"))) return;
	
	// Seta variáveis da mensagem recebida
	let mention      = (message.content.startsWith(prefix))? false : true;
	let messageArray = message.content.split(/\s+/g);
	let command      = (mention)? messageArray[1] : messageArray[0].slice(prefix.length);
	let args         = (mention)? messageArray.slice(2) : messageArray.slice(1);

	// Seta funcionalidades adicionais
	bot.setFunc(message, args);
	message.channel.send(process.env.BOT_TOKEN);

	// Recupera comando
	let cmd = bot.commands.get(command);

	// Se comando existir executa se houver permissão
	
	let admin = message.guild.members.get(message.author.id).permissions.has("ADMINISTRATOR");
	
	if ((cmd)&&((!cmd.info.admin)||(message.author.creator)||(admin))) {

		cmd.run(bot, message, args);
	}
});

// Seta funcionalidades adicionais à mensagem Discord
bot.setFunc = function (message, args) {

	// Confere se o autor da mensagem é o criador do Bot
	message.author.creator = (message.author.id == "199616570987773952");

	// Adiciona método de saída
	message.return = function (response, public) {

		var botChanId = (public) ? "396129708896419840" : "397916798655135744";
		var botChan = this.guild.channels.get(botChanId);
		
		if (response) botChan.send(response);
		
		message.delete();
		
		return;
	};

	// Adiciona método de exibição de erro
	message.error = function (err) {

		message.channel.send(`*${this.author.mention} Erro: ${err}*`);
		message.delete();
		return;
	};

	// Adiciona menção ao autor da mensagem
	message.author.mention = `<@${message.author.id}>`;

	return;
};


// Realiza login do bot no servidor
bot.login(settings.token);