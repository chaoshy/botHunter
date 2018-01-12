const Discord = module.require("discord.js");
const fs      = require("fs");

module.exports.run = async function (bot, message, args) {
	
	// Não tem permissão
	if ((!message.guild.members.get(message.author.id).permissions.has("ADMINISTRATOR"))||(!message.author.creator)) {

		message.return(`*<@${message.author.id}> Você não tem permissão para executar esta ação*`);
		return;
	}
	
	// Falta argumentos
	if ((!args[0]) || (!args[1])) {

		message.return(this.info.help);
		return;
	}

	// Criação de novo cargo
	if (args[1].startsWith("#")) {

		// Monta array de permissões
		let permissions = new Array();

		for (var i = 2; i < args.length; i++) {
			permissions.push(args[i]);
		}

		// Cria cargo
		message.guild.createRole({
			name: args[0], 
			color: args[1], 
			permissions: permissions
		})
		.then(function(role){

			message.return(
				`Cargo **${args[0]}** criado com sucesso \n` +
				"*Obs.: Utilize o comando ``!role`` para adicionar o cargo à usuários*"
			);
		})
		.catch(function(err){

			message.return(`*${message.author.mention} Erro ao criar cargo: ${err}*`);
		});	
	}

	// Adiciona usuário a um cargo
	else {

		// Abstrai usuário
		let id = args[1].replace(/([^\d])/g, "");
		let member = message.guild.members.get(id);

		// Usuário não existe
		if (!member) {

			message.return(`*${message.author.mention} Erro: usuário não encontrado*`);
			return;
		}


		let role = message.guild.roles.find("name", args[0]);

		// Cargo não existe
		if (!role) {

			message.return(`*${message.author.mention} Erro: cargo inexistente*`);
			return;
		}

		// Se tem o cargo, remove
		if (member.roles.has(role.id)) {

			member.removeRole(role);
			message.return(`***Cargo ${args[0]} removido ao usuário <@${member.id}>***`);
		}

		// Senão adiciona
		else {

			member.addRole(role);
			message.return(`***Cargo ${args[0]} adicionado ao usuário <@${member.id}>***`);
		}
	}

	// Retorna se tudo deu certo
	return;
}

module.exports.info = {
	name: "role", 
	admin: true, 
	hide: true, 
	desc: "Cria e gerencia cargos do servidor", 
	help: "**Comando Role** \n\n" +
		  "**1.** Adicione ou remova um cargo a um usuário: \n\n" +
		  "``!role [cargo] [@usuario]`` \n\n" +
		  "Exemplo: ``!role Moderador @BotHunter`` \n\n" +
		  "**2.** Crie um novo cargo: \n\n" +
		  "``!role [cargo] [#cor] [permições]`` \n\n" +
		  "Exemplo: ``!role Moderador #ff0000 KICK_MEMBERS BAN_MEMBERS`` \n\n" +
		  "*Obs.: Divida as permições com espaços* \n\n" +
		  "*Lista de permições: https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS*"
}