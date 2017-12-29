const Discord = module.require("discord.js");
const fs      = require("fs");

module.exports.run = async function (bot, message, args) {
	
	// Falta argumentos
	if ((!args[0]) || (!args[1])) {
		message.channel.send("Digite o nome do usuário e o nome da lista");
		return;
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

		lists[message.author.id][args[1]][(target.id || target)]++;
	}
	else {

		lists[message.author.id][args[1]][(target.id || target)] = 1;
	}

	// Seta variável com a quantidade de kills
	var kills = lists[message.author.id][args[1]][(target.id || target)];

	// Persiste os dados e retorna
	fs.writeFile("data/lists.json", JSON.stringify(lists, null, 4), err => {
		
		if (err) throw err;
		
		message.channel.send(`Uma kill foi adicionada para **${(target.username || target)}** na lista ${args[1]} (${kills} ${(kills<=1)? "kill" : "kills"})`);
	});
}

module.exports.help = {
	name: "add"
}