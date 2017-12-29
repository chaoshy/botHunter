const Discord = module.require("discord.js");
const fs      = require("fs");

module.exports.run = async function (bot, message, args) {

	// Falta argumentos
	if (args.length < 3) {
		message.channel.send("É necessário mais de um jogador para treinar");
		return;
	}

	// Modo deve ser válido
	var mode = args[0].toLowerCase();

	if ((mode != "default") &&
		(mode != "hardcore")&&
		(mode != "extreme") &&
		(mode != "hard")    &&
		(mode != "padrao")  &&
		(mode != "dificil") &&
		(mode != "extremo") &&
		(mode != "difícil") &&
		(mode != "padrão"))
	{
		message.channel.send("Modo de jogo inválido");
		return;
	}

	// Modo Padrão
	if ((mode == "default")||(mode == "padrao")||(mode == "padrão")) {

		mode = "default";
	}
	
	// Modo Difícil
	else if ((mode == "hardcore")||(mode == "hard")||(mode == "dificil")||(mode == "difícil")) {

		mode = "hardcore";
	}

	// Modo Extremo
	else {

		mode = "extreme";
	}

	// Define par de armamentos da partida
	var weapons_list = require(`../data/${mode}.json`);

	// Define armas principais
	var rand = Math.floor(Math.random() * weapons_list.length);
	var weapons = weapons_list[rand];
	var main_weapons = weapons.main;

	// Define armas de apoio
	rand = Math.floor(Math.random() * weapons.alt.length);
	var alt_weapons = weapons.alt[rand];

	// Define armas de cada time
	rand = Math.random() >= 0.5;

	var alfa = {};
	var bravo = {};

	if (rand == true) {

		alfa.main  = main_weapons[0];
		alfa.alt   = alt_weapons [0];

		bravo.main = main_weapons[1];
		bravo.alt  = alt_weapons [1];
	}
	else {

		alfa.main  = main_weapons[1];
		alfa.alt   = alt_weapons [1];

		bravo.main = main_weapons[0];
		bravo.alt  = alt_weapons [0];
	}

	// Adiciona armas de apoio adicionais
	if (mode == "default") {

		alfa.alt.push("Medkit (solo)");
		bravo.alt.push("Medkit (solo)");
	}
	else if (mode == "hardcore") {

		alfa.alt.push("Medkit (port)");
		bravo.alt.push("Medkit (port)");	
	}
	
	var players = args.splice(1);
	var aux = players;

	alfa.team  = new Array();
	bravo.team = new Array();

	while (aux.length > 0) {
	
		// Puxa aleatóriamente um jogador da lista
		rand = Math.floor(Math.random() * aux.length);
		player = aux[rand];
		aux.splice(rand, 1);
	
		// Se os times estiverem empatados faz um sorteio entre alfa e bravo
		if (alfa.team.length == bravo.team.length) {

			rand =  Math.random() >= 0.5;

			if (rand == true) {

				alfa.team.push(player);
			}
			else {

				bravo.team.push(player);
			}
		}

		// Se o time alfa estiver com menos jogadores adiciona
		else if (alfa.team.length < bravo.team.length) {

			alfa.team.push(player);
		}

		// Se o time bravo estiver com menos jogadores adiciona
		else {

			bravo.team.push(player);
		}
	}

	// Monta variáveis para impressão
	var team_alfa  = JSON.stringify(alfa.team) .replace(/[\[\] "']/g, "").replace(/,/g, "\n");
	var team_bravo = JSON.stringify(bravo.team).replace(/[\[\] "']/g, "").replace(/,/g, "\n");
	
	var weapons_alfa  = JSON.stringify(alfa.main).replace(/[\[\]"']/g, "").replace(",", ", ") + ", " + JSON.stringify(alfa.alt).replace(/[\[\]"']/g, "").replace(",", ", ");
	var weapons_bravo = JSON.stringify(bravo.main).replace(/[\[\]"']/g, "").replace(",", ", ") + ", " + JSON.stringify(bravo.alt).replace(/[\[\]"']/g, "").replace(",", ", ");
	
	var fields = new Array();

	fields.push({
		"name": "Armas Alfa", 
		"value": weapons_alfa
	});

	fields.push({
		"name": "Armas Bravo", 
		"value": weapons_bravo
	});
	
	fields.push({
		"name":  "Alfa", 
		"value": team_alfa, 
        "inline": true
	});

	fields.push({
		"name":  "Bravo", 
		"value": team_bravo, 
        "inline": true
	});

	var embed = {
	  "embed": {
	    "color": 7013394,
	    "author": {
	      "name": "Los Hunters",
	      "icon_url": "https://i.imgur.com/CgmJnyg.png"
	    },
	    "title": `Partida de Treino (${mode})`,
	    "description": "Times e armamentos montados aleatoriamente.", 
	    "fields": fields, 
	    "thumbnail": {
	    	"url": "http://icons.iconarchive.com/icons/3xhumed/mega-games-pack-23/256/Combat-Arms-3-icon.png"
	    }
	  }
	};

	message.channel.send(embed);
}

module.exports.help = {
	name: "treino"
}
