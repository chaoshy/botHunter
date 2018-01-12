const Discord = module.require("discord.js");
const fs      = require("fs");

module.exports.run = async function (bot, message, args) {

	var lists = require("../data/lists.json");

	if ((!lists) || (!lists[message.author.id])) {
		message.channel.send("Não há listas para mostrar");
		return;
	}

	if (!args[0]) {
		message.channel.send("Digite o nome da lista que deseja exibir");
		return;
	}

	if (!lists[message.author.id][args[0]]) {
		message.channel.send("Nome da lista incorreto ou lista inexistente");
		return;	
	}

	var fields = new Array();

	var item = Object.entries(lists[message.author.id][args[0]]);

	for (var i = 0; i < item.length; i++) {
	
		member = message.guild.members.get(item[i][0]);
		
		if (!member) {
			name = item[i][0];
		}
		else {
			name = member.user.username;
		}
		
		fields.push({
			"name":  `💀 ${name}`, 
			"value": `Kills: ${item[i][1]}`
		});
	}

	var embed = {
	  "embed": {
	    "color": 7013394,
	    "author": {
	      "name": message.author.username,
	      "icon_url": message.author.avatarURL
	    },
	    "title": args[0],
	    "description": "exibição da lista de kills",
	    "fields": fields, 
	    "thumbnail": {
	    	"url": "http://icons.iconarchive.com/icons/3xhumed/mega-games-pack-23/256/Combat-Arms-3-icon.png"
	    }
	  }
	};

	message.channel.send(embed);
}

module.exports.info = {
	name: "show", 
	desc: "Exibe uma lista de kills", 
	help: "**Comando Show** \n\n" +
		  "Exibe uma lista de kills \n\n" +
		  "``!show [lista]`` \n\n" +
		  "Exemplo: ``!show lista`` \n\n" +
		  "*Obs.: O usuário só pode visualizar suas próprias listas*"
}