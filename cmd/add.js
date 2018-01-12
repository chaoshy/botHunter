const Discord = module.require("discord.js");
const fs      = require("fs");

module.exports.run = async function (bot, message, args) {
	
	// Falta argumentos
	if ((!args[0]) || (!args[1])) {
		message.channel.send("Digite o nome do usuário e o nome da lista");
		return;
	}

	// Precisa ser numérico
	if (isNaN(args[2])) {
		args[2] = 1;
	}
	else {
		args[2] = parseInt(args[2]);
	}

	// Seta o alvo
	var target_id = args[0].replace(/([^\d])/g, "");
	var target = message.guild.members.get(target_id);

	// Usuário inexistente no Discord, add string
	if (!target) {

		target = args[0];
	}

	let lists = require("../data/lists.json");

	// Caso não haja nada na lista
	if (!lists) {

		lists = {};
	}

	// Caso não haja uma lista do usuário
	if (!lists[message.author.id]) {

		lists[message.author.id] = {};
	}

	// Caso não haja a lista em questão
	if (!lists[message.author.id][args[1]]) {

		lists[message.author.id][args[1]] = {};
	}

	// Insere a kill na lista
	if (lists[message.author.id][args[1]][(target.id || target)]) {

		if (args[2]){

			lists[message.author.id][args[1]][(target.id || target)] += args[2];
		}
		else {

			lists[message.author.id][args[1]][(target.id || target)]++;
		}
	}
	else {

		lists[message.author.id][args[1]][(target.id || target)] = args[2] || 1;
	}

	// Seta variável com a quantidade de kills
	var kills = lists[message.author.id][args[1]][(target.id || target)];

	// Persiste os dados e retorna
	fs.writeFile("data/lists.json", JSON.stringify(lists, null, 4), err => {
		
		if (err) throw err;
		
		message.channel.send(`Uma kill foi adicionada para **${(target.username || target)}** na lista ${args[1]} (${kills} ${(kills<=1)? "kill" : "kills"})`);
	});
}

module.exports.info = {
	name: "add", 
	desc: "Adiciona kills a um jogador em uma lista de kills", 
	help: "**Comando Add** \n\n" +
		  "**1.** Adicione kills a um jogador em uma lista de kills \n\n" +
		  "``!add [@jogador | jogador] [lista] [kills]`` \n\n" +
		  "Exemplo: ``!add @BotHunter lista`` \n\n" +
		  "Exemplo: ``!add BotHunter lista 3`` \n\n" +
		  "*Obs.: Se o número de kills não for especificado será adicionada 1 kill.* \n" + 
		  "*Obs.: Se a lista não existir, ela será criada automaticamente.*"
}