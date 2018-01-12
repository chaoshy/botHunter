const Discord = module.require("discord.js");
const fs      = require("fs");

module.exports.run = async function (bot, message, args) {

	// Falta argumentos
	if (args.length < 3) {
		message.channel.send("É necessário mais de um jogador para treinar");
		return;
	}

	// Inicializa variáveis
	var register = new Register(); // Registro de logs
	var alfa     = {id: "alfa"};   // Objeto do time alfa
	var bravo    = {id: "bravo"};  // Objeto do time bravo

	// 1. DEFINE MODO
	var mode = setMode(args[0]);

	// 2. DEFINE ARMAS
	setWeapons(alfa, bravo, mode);

	// Registra armas da partida
	register.weapons.alfa  = alfa.main;
	register.weapons.bravo = bravo.main;

	// 3. DEFINE TIMES
	var players = args.splice(1);
	setTeams(alfa, bravo, players);

	// 4. BALANCEIA TIMES
	var scores = setScores(alfa, bravo, players);
	equalizeRounds(alfa, bravo, scores, register);

	// Registra a lista de jogadores
	scores.forEach(function (player, key) {
		register.players[key] = player;
	});
	
	// 5. RETORNO
	register.persist(); // Salva registros de log
	message.channel.send(buildResponse(alfa, bravo, mode, register.id));

	return;
}

// Objeto de registro de logs
function Register () {
	
	this.id         = Date.now();
	this.timestamp  = new Date().toString();
	this.mode       = "";
	this.weapons    = {alfa:0, bravo:0};
	this.players    = {};
	this.rounds     = [];
	this.best_round = 0;
	
	this.persist = function () {
		var matches = require('../data/matches.json');
		matches.push(this);
		matches = JSON.stringify(matches, null, 4);
		fs.writeFile('data/matches.json', matches, err => {});
	}
}

// Define modo de treinamento
function setMode (mode) {

	mode  = mode.toLowerCase();
	var modes = [
		["default", "padrao", "padrão"], 
		["hardcore", "hard", "dificil", "difícil"], 
		["extreme", "extremo"]
	];

	if ((modes[0].indexOf(mode) == -1)&&(modes[1].indexOf(mode) == -1)&&(modes[2].indexOf(mode) == -1))
	{
		message.channel.send("Modo de jogo inválido");
		return;
	}

	// Modo Padrão
	if (modes[0].indexOf(mode) >= 0) {

		mode = "default";
	}
	
	// Modo Difícil
	else if (modes[1].indexOf(mode) >= 0) {

		mode = "hardcore";
	}

	// Modo Extremo
	else if (modes[2].indexOf(mode) >= 0) {

		mode = "extreme";
	}

	return mode;
}

// Define armas aleatoriamente
function setWeapons (alfa, bravo, mode) {

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

	// Retorna
	return;
}

// Define times aleatoriamente
function setTeams (alfa, bravo, players) {

	var aux = players.slice(0);

	alfa.team  = new Array();
	bravo.team = new Array();

	while (aux.length > 0) {
	
		// Puxa aleatóriamente um jogador da lista
		rand = Math.floor(Math.random() * aux.length);
		player = aux[rand];
		aux.splice(rand, 1);
	
		// Se os times estiverem empatados faz um sorteio entre alfa e bravo
		if (alfa.team.length == bravo.team.length) {

			rand = Math.random() >= 0.5;

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
}

// Calcula a pontuação de cada jogador em cada time
function setScores (alfa, bravo, players) {

	// Puxa arquivos de rankings

	var weapons = ["AR", "SR", "SG", "SMG"];
	var ranking = { AR: null, SR: null, SG: null, SMG: null };

	for (i = 0; i < weapons.length; i++) {

		let w = weapons[i];

		if ((alfa.main.indexOf(w) >= 0)||(bravo.main.indexOf(w) >= 0)) {

			let aux = fs.readFileSync(`data/${w}.json`);
			ranking[w] = new Discord.Collection((JSON.parse(aux.toString())));
		}
	}
	
	// Determina o valor de cada jogador em cada time
	
	var scores = new Discord.Collection();
		
	for (i = 0; i < players.length; i++) {

		member = players[i];
		member = (member.startsWith("<@"))? member.replace(/([^\d])/g, "") : member;
		var score  = {alfa: 0, bravo: 0};
		
		for (j = 0; j < alfa.main.length; j++) {

			weapon = alfa.main[j];
			w_score = ranking[weapon].get(member);
			if (!w_score) w_score = 5;
			if (w_score > score.alfa) score.alfa = w_score;
		}

		for (j = 0; j < bravo.main.length; j++) {

			weapon = bravo.main[j];
			w_score = ranking[weapon].get(member);
			if (!w_score) w_score = 5;
			if (w_score > score.bravo) score.bravo = w_score;
		} 
		scores.set(players[i], score);
	}

	return scores;
}

// Realiza as rodadas de balanceamento dos times
function equalizeRounds (alfa, bravo, scores, register) {

	// Realiza as rodadas de balanceamento
	var lastMove = new Array();
	var rounds   = new Array();

	while (rounds.length < 4) {
		
		var difference = compare(alfa, bravo, scores);

		rounds.push({
			id: rounds.length, 
			alfa: clone(alfa), 
			bravo: clone(bravo), 
			diff: difference
		});

		// Registra dados do round
		register.rounds.push(rounds[rounds.length -1]);
	
		if (difference > 0) {

			lastMove = equalize(alfa, bravo, scores, lastMove);
		}
		else {

			break;
		}
	}

	// Compara os resultados das rodadas
	var best_round = rounds[0];

	for (i = 1; i < rounds.length; i++) {
		
		if (rounds[i].diff < best_round.diff) {

			best_round = rounds[i];
		}
	}

	// Seta melhor configuração
	alfa  = best_round.alfa;
	bravo = best_round.bravo;

	// Seta ID do melhor round nos logs
	register.best_round = best_round.id;

	return;
}

// Determina a nota dos times
function compare (alfa, bravo, scores) {

	// Calcula Alfa
	alfa.score = 0;

	alfa.team.forEach(function(player){
		alfa.score += scores.get(player).alfa;
	});
	alfa.score = Math.floor( alfa.score / alfa.team.length );

	// Calcula Bravo
	bravo.score = 0;

	bravo.team.forEach(function(player){
		bravo.score += scores.get(player).bravo;
	});
	bravo.score = Math.floor( bravo.score / bravo.team.length );

	// Diferença
	var difference = (alfa.score < bravo.score) ? bravo.score - alfa.score : alfa.score - bravo.score;
	
	return (scores.size > 3)? difference : 0;
}

// Realiza o balanceamento
function equalize (alfa, bravo, scores, lastMove) {

	// Determina time fraco e time forte
	var weak   = (alfa.score < bravo.score)? alfa : bravo;
	var strong = (alfa.score > bravo.score)? alfa : bravo;

	// Jogador mais fraco do time mais fraco
	var weaker_player = weak.team[0];

	for (i = 1; i < weak.team.length; i++) {

		weaker_player_score = scores.get(weaker_player)[weak.id];
		player_score        = scores.get(weak.team[i] )[weak.id];

		if ((player_score < weaker_player_score)&&(lastMove.indexOf(player_score) === -1)) {
			weaker_player = weak.team[i];
		}
	}
	
	// Jogador mais forte do time mais forte
	var stronger_player = strong.team[0];

	for (i = 1; i < strong.team.length; i++) {

		stronger_player_score = scores.get(stronger_player)[strong.id];
		player_score          = scores.get(strong.team[i] )[strong.id];

		if ((player_score > stronger_player_score)&&(lastMove.indexOf(player_score) === -1)) {
			stronger_player = strong.team[i];
		}
	}

	// Realiza substituição
	weak.team.push(stronger_player);
	strong.team.push(weaker_player);

	weak.team.splice(weak.team.indexOf(weaker_player), 1);
	strong.team.splice(strong.team.indexOf(stronger_player), 1);

	// Retorna último movimento
	lastMove = [weaker_player, stronger_player];
	return lastMove;
}

// Função que constrói o embed de retorno
function buildResponse (alfa, bravo, mode, id) {

	var team_alfa  = JSON.stringify(alfa .team).replace(/[\[\] "']/g, "").replace(/,/g, "\n");
	var team_bravo = JSON.stringify(bravo.team).replace(/[\[\] "']/g, "").replace(/,/g, "\n");
	
	var weapons_alfa  = JSON.stringify(alfa .main).replace(/[\[\]"']/g, "").replace(",", ", ") + ", " + JSON.stringify(alfa.alt).replace(/[\[\]"']/g, "").replace(",", ", ");
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
	    }, 
	    "footer": {
	    	"icon_url": "https://images.emojiterra.com/emojione/v2/512px/1f194.png",
	    	"text": id
	    }
	  }
	};

	return embed;
}

// Função para clonar objetos
function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

// Informações do comando
module.exports.info = {
	name: "treino", 
	desc: "Elabora um treino de acordo com a dificuldade definida", 
	help: "**Comando Treino** \n\n" +
		  "Para elaborar um treino defina a dificuldade e a lista de jogadores participantes: \n\n" +
		  "``!treino [dificuldade: default | hard | extreme] [jogadores]`` \n\n" +
		  "Exemplo: ``!treino hard player1 player2 player3 player4``"
}