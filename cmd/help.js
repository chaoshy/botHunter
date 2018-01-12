const Discord = module.require("discord.js");
const fs      = require("fs");
const settings = require("../settings.json");

module.exports.run = async function (bot, message, args) {
	
	// Exibe descrição de um comando
	if (args[0]) {

		var cmd = bot.commands.get(args[0].toLowerCase());
		
		// Comando inexistente
		if ((!cmd)||(cmd.info.admin && !message.guild.members.get(message.author.id).hasPermission("ADMINISTRATOR"))) {
			message.error("Comando inexistente. Digite ``!help`` para ver todos os comandos disponíveis.");
			return;
		}

		message.channel.send(cmd.info.help);
		return;
	}

	// Exibe todos os comandos disponíveis
	else {

		var response = "**Comandos Disponíveis** \n\n";

		bot.commands.forEach((cmd) => {

			if (!cmd.info.admin || message.guild.members.get(message.author.id).hasPermission("ADMINISTRATOR")) {

				let admin = (cmd.info.admin)? "(admin)" : "";
				
				response += `***${settings.prefix + cmd.info.name}*** ${admin} \n*${cmd.info.desc}* \n\n`;
			}
		});

		response += "Para ver a descrição de um comando digite ``!help [nome do comando]``";

		message.channel.send(response);

		return;
	}
}

module.exports.info = {
	name: "help", 
	desc: "Exibe detalhes sobre os comandos do bot", 
	help: "**Comando Help** \n\n" +
		  "**1.** Visualize todos os comandos disponíveis: \n\n" +
		  "``!help`` \n\n" +
		  "**2.** Visualize a descrição de um comando específico \n\n" + 
		  "``!help [comando]`` \n\n" +
		  "Exemplo: ``!help treino``"
}