const Discord = module.require("discord.js");
const fs      = require("fs");

module.exports.run = async function (bot, message, args) {
	
	// Falta argumentos
	if (!args[0]) {

		message.return(this.info.help);
		return;
	}

	// Valida categoria
	var types = ["AR", "SR", "SMG", "SG"];
	var type  = args[0].toUpperCase();

	if (types.indexOf(type) < 0) {

		message.error("categorias aceitas AR SR SMG SG");
		return;
	}

	// Se categoria existir extrai os dados armazenados
	else {

		var ranking = fs.readFileSync(`data/${type}.json`);
		ranking = new Map((JSON.parse(ranking.toString())));
	}

	// Exibe a lista de notas da categoria
	if (args.length === 1) {
		
		var embed = new Discord.RichEmbed();
		
		embed.setColor('DARK_GOLD');
		embed.setThumbnail('http://combatarms.uol.com.br/img/icons/rank_mais.png');
		
		embed.setTitle(`Ranking (${type})`);
		embed.setDescription("Pontuação de 1 a 10 do jogador segundo a maestria com a arma especificada.\n\n");
		
		ranking.forEach(function(value, key) {

			let name = message.guild.members.get(key);
			
			if (!name) name = key;

			else name = name.user.username;

			if ((value >= 1)&&(value <= 10)) {

				embed.addField(name, `**Nota: ${value}**`);
			}
		});
		
		message.return(embed);
	}

	// Persiste a nota de um jogador numa categoria
	else {

		var id = args[1].replace(/[^\d]/g, '');
		var jogador = (message.guild.members.has(id)) ? id : args[1];
		var score = parseInt(args[2]);

		ranking.set(jogador, score);

		ranking = JSON.stringify(Array.from(ranking), null, 4);

		fs.writeFile(`data/${type}.json`, ranking, err => {
			
			if (err) throw err;
			
			if ((score >= 1)&&(score <= 10)) {

				message.return(`***${args[1]} recebeu ${score} pontos na arma ${type}***`);
			}
			else {

				message.return(`***${args[1]} foi removido da lista da arma ${type}***`);
			}
		});
	}

	// Se tudo der certo, retorna
	return;
}

module.exports.info = {
	name: "rank", 
	admin: true, 
	hide: true, 
	desc: "Gerencia nota dos jogadores em cada categoria de armas", 
	help: "**Comando Rank** \n\n" +
		  "**1.** Adicione uma nota de 1 a 10 para um jogador em uma categoria de armas: \n\n" +
		  "``!rank [categoria: AR | SR | SG | SMG] [@username | username] [nota]`` \n\n" +
		  "Exemplo: ``!rank AR @BotHunter 9`` \n\n" +
		  "Exemplo: ``!rank SMG BotHunter 10`` \n\n" +
		  "*Obs.: Se o usuário não estiver na lista, será adicionado. Se estiver será atualizado.* \n" + 
		  "*Obs.: Se a nota for 0 o usuário será removido da lista.* \n\n" + 
		  "**2.** Exiba a lista de todos os usuários de uma categoria: \n\n" + 
		  "``!rank [categoria: AR | SR | SG | SMG]`` \n\n" +
		  "Exemplo: ``!rank SR``"
}