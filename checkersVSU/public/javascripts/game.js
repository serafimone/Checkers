var size = 8;
var checkers = [];
var moves_from_start = 0;
var selected = "None";
var fight = false;
var double_kill = false;
var hist = [];
var empty_checker = {
	rank: "empty",
	team: "empty",
	dead: false
};

var GoldWay70_07 = [{i: 7, j: 0}, {i: 6, j: 1}, {i: 5, j: 2}, {i: 4, j: 3},
	{i: 3, j: 4}, {i: 2, j: 5}, {i: 1, j: 6}, {i: 0, j: 7}
]
var DoubleWay76_10 = [{i: 7, j: 6}, {i: 6, j: 5}, {i: 5, j: 4}, {i: 4, j: 3},
	{i: 3, j: 2}, {i: 2, j: 1}, {i: 1, j: 0}
]
var DoubleWay67_01 = [{i: 6, j: 7}, {i: 5, j: 6}, {i: 4, j: 5}, {i: 3, j: 4},
	{i: 2, j: 3}, {i: 1, j: 2}, {i: 0, j: 1}
]
var TripleWay72_50 = [{i: 7, j: 2}, {i: 6, j: 1}, {i: 5, j: 0}]
var TripleWay72_27 = [{i: 7, j: 2}, {i: 6, j: 3}, {i: 5, j: 4}, {i: 4, j: 5}, {i: 3, j: 6}, {i: 2, j: 7}]
var TripleWay50_05 = [{i: 5, j: 0}, {i: 4, j: 1}, {i: 3, j: 2}, {i: 2, j: 3}, {i: 1, j: 4}, {i: 0, j: 5}]
var TripleWay27_05 = [{i: 2, j: 7}, {i: 1, j: 6}, {i: 0, j: 5}]
var UltraWay74_47 = [{i: 7, j: 4}, {i: 6, j: 5}, {i: 5, j: 6}, {i: 4, j: 7}]
var UltraWay74_30 = [{i: 7, j: 4}, {i: 6, j: 3}, {i: 5, j: 2}, {i: 4, j: 1}, {i: 3, j: 0}]
var UltraWay47_03 = [{i: 4, j: 7}, {i: 3, j: 6}, {i: 2, j: 5}, {i: 1, j: 4}, {i: 0, j: 3}]
var UltraWay30_03 = [{i: 3, j: 0}, {i: 2, j: 1}, {i: 1, j: 2}, {i: 0, j: 3}]
var LastWay76_67 = [{i: 7, j: 6}, {i: 6, j: 7}];
var LastWay10_01 = [{i: 1, j: 0}, {i: 0, j: 1}];

var ways = [GoldWay70_07, DoubleWay76_10, DoubleWay67_01, TripleWay72_50, TripleWay72_27, TripleWay50_05,
	TripleWay27_05, UltraWay74_47, UltraWay74_30, UltraWay47_03, UltraWay30_03, LastWay76_67, LastWay10_01]


window.onload = function(){

	var socket = io();
	var startGame;

	socket.on('startgame', function(data){
		if (data.startgame == 1){
			startGame = true;
		}
	})

	var userteam1, userteam2;
	
	socket.on('userteam', function(team) {
		if (team.room == team.iduser) {
			userteam1 = true;
		} else {
			userteam2 = true;
		}
	});
	
	for (i = 0; i < size; i++) {
		a = [];
		for (j = 0; j < size; j++) {
			a[j] = empty_checker;
			if (i < 3) {
				if ((i + j) % 2 != 0) {
					a[j] = {
						i: i,
						j: j,
						rank: "minion",
						team: "white",
						dead: false
					};
				}
			}
			if (i >= size - 3) {
				if ((i + j) % 2 != 0){
					a[j] = {
						i: i,
						j: j,
						rank: "minion",
						team: "black",
						dead: false
					};
				}
			}
		}
		checkers.push(a);
	}


	function whitelose(){
		swal({
			title: "Ура!",
			text: "Победили черные !",
                    confirmButtonText: "Закрыть"
        }
		);
		socket.emit('gameend', black)
	}

	function blacklose(){
		swal({
			title: "Ура!",
			text: "Победили белые!",
                    confirmButtonText: "Закрыть"
        }
		);
		socket.emit('gameend', white)
	}

	function calculate_moves(checker){
		moves = [];
		fight = false;
		if (checker.team == "white") enemy_team = "black";
		else enemy_team = "white";
		if (checker.rank == "minion"){
			for (i = 0; i < ways.length; i++){
				for (j = 0; j < ways[i].length; j++){
					if ((checker.i == ways[i][j].i) && (checker.j == ways[i][j].j)){
						if (j > 1){
							if ((checkers[ways[i][j - 1].i][ways[i][j - 1].j].team == enemy_team) && (checkers[ways[i][j - 1].i][ways[i][j - 1].j].dead == false) && (checkers[ways[i][j - 2].i][ways[i][j - 2].j].team == "empty")){
								moves.push({i: ways[i][j - 2].i, j: ways[i][j - 2].j, action: "fight", kill: checkers[ways[i][j - 1].i][ways[i][j - 1].j]});
								fight = true;
							}
						}
						if (j < ways[i].length - 2){
							if ((checkers[ways[i][j + 1].i][ways[i][j + 1].j].team == enemy_team) && (checkers[ways[i][j + 1].i][ways[i][j + 1].j].dead == false) && (checkers[ways[i][j + 2].i][ways[i][j + 2].j].team == "empty")){
								moves.push({i: ways[i][j + 2].i, j: ways[i][j + 2].j, action: "fight", kill: checkers[ways[i][j + 1].i][ways[i][j + 1].j]});
								fight = true;
							}
						}
						if ((checker.team == "white") && (j > 0)) {
							if ((checkers[ways[i][j - 1].i][ways[i][j - 1].j].team == "empty") && (fight == false)){
								moves.push({i: ways[i][j - 1].i, j: ways[i][j - 1].j, action: "move"});
							}
						}
						if ((checker.team == "black") && (j < ways[i].length - 1)){
							if ((checkers[ways[i][j + 1].i][ways[i][j + 1].j].team == "empty") && (fight == false)){
								moves.push({i: ways[i][j + 1].i, j: ways[i][j + 1].j, action: "move"});
							}
						}
					}
				}
			}
		}
		console.log(moves);
		if (checker.rank == "queen"){
			for (i = 0; i < ways.length; i++){
				for (j = 0; j < ways[i].length; j++){
					if ((checker.i == ways[i][j].i) && (checker.j == ways[i][j].j)){
					
						console.log(moves);
						if (j > 1){
							for (place_before = j - 1; place_before >= 0; place_before--){
								next_checker = checkers[ways[i][place_before].i][ways[i][place_before].j];
								if ((next_checker.team == checker.team) || (next_checker.dead == true)){
									break;
								}
								if (next_checker.team == enemy_team){
									for (place_after = place_before - 1; place_after >= 0; place_after--){
										p = ways[i][place_after].i;
										q = ways[i][place_after].j;
										if (checkers[p][q].team == "empty"){
											fight = true;
											moves.push({i: p, j: q, action: "fight", kill: next_checker});
										}
										else{
											break;
										}
									}
									break;
								}
							}
						}
						//console.log(moves);
						if (j < ways[i].length - 2){
							for (place_before = j + 1; place_before < ways[i].length; place_before++){
								next_checker = checkers[ways[i][place_before].i][ways[i][place_before].j];
								if ((next_checker.team == checker.team) || (next_checker.dead == true)){
									break;
								}
								if (next_checker.team == enemy_team){
									for (place_after = place_before + 1; place_after < ways[i].length; place_after++){
										p = ways[i][place_after].i;
										q = ways[i][place_after].j;
										if (checkers[p][q].team == "empty"){
											fight = true;
											moves.push({i: p, j: q, action: "fight", kill: next_checker});
										}
										else{
											break;
										}
									}
									break;
								}
							}
						}

						if ((j > 0)/** && (fight == false)**/){
							for (place_before = j - 1; place_before >= 0; place_before--){
								p = ways[i][place_before].i;
								q = ways[i][place_before].j;
								if (checkers[p][q].team == "empty"){
									moves.push({i: p, j: q, action: "move"});
								}
								else{
									break;
								}
							}
						}
						if ((j < ways[i].length - 1)/** && (fight == false)**/){
							for (place_before = j + 1; place_before < ways[i].length; place_before++){
								p = ways[i][place_before].i;
								q = ways[i][place_before].j;
								if (checkers[p][q].team == "empty"){
									moves.push({i: p, j: q, action: "move"});
								}
								else{
									break;
								}
							}
						}

					}
				}
			}
		}

		if (fight == true){
			move = true;
			while (move == true){
				move = false;
				for (i = 0; i < moves.length; i++){
					if (moves[i].action == "move"){
						moves.splice(i, 1);
						move = true;
					}
				}
			}
		}

		moves.unshift({i: checker.i, j: checker.j, action: "from"});
		return moves;
	}

	function can_fight(checker_team){
		for (ii = 0; ii < size; ii++){
			for (jj = 0; jj < size; jj++){
				if (checkers[ii][jj].team == checker_team){
					if (can_fight_checker(checkers[ii][jj])){
						return true;
					}
				}
			}
		}
		return false;
	}

	function can_move(checker_team){
		for (ii = 0; ii < size; ii++){
			for (jj = 0; jj < size; jj++){
				if (checkers[ii][jj].team == checker_team){
					if (calculate_moves(checkers[ii][jj]).length > 1){
						return true;
					}
				}
			}
		}
		return false;
	}

	function can_fight_checker(checker){
		calculate_moves(checker);
		if (fight == true) return true;
		else return false;
	}

	function do_move(move){
		if (move[1].action == "move"){
			checker = checkers[move[0].i][move[0].j];
			checkers[move[0].i][move[0].j] = empty_checker;
			checker.i = move[1].i;
			checker.j = move[1].j;
			checkers[move[1].i][move[1].j] = checker;
		}
		else{
			checker = checkers[move[0].i][move[0].j];
			checkers[move[0].i][move[0].j] = empty_checker;
			checker.i = move[1].i;
			checker.j = move[1].j;
			checkers[move[1].i][move[1].j] = checker;
			checkers[move[1].kill.i][move[1].kill.j].dead = true;
		}
	}

	function remove_dead(){
		for (i = 0; i < size; i++)
			for (j = 0; j < size; j++)
				if (checkers[i][j].dead == true) checkers[i][j] = empty_checker;
	}


	function up_rank(checker){
		checker.rank = "queen";
	}

	function hodtouser() {
		socket.emit('shodiltouser', {checkers: checkers, moves_from_start: moves_from_start});
	};
	
	socket.on('movesbyserver', function(data){
		moves_from_start = data.moves_from_start;
		checkers = data.checkers;
		write_chekers();
	});

	function write_chekers(){
		for (i = 0; i < size; i++){
			for (j = 0; j < size; j++){
				if ((checkers[i][j].team != "empty")){
					way = "";
					if (checkers[i][j].team == "white"){
						way = "white";
					}
					else {
						way = "black";
					}
					way = way + '_';
					if (checkers[i][j].rank == "minion"){
						way = way + "minion";
					}
					else {
						way = way + "queen"
					}
					way = "images/" + way + ".png";
					document.getElementById("img_" + i + "_" + j).src = way;
				}
				else {
					document.getElementById("img_" + i + "_" + j).src = "images/invisible.gif";
				}
			}
		}
	}

	function select_moves(moves){
		if (selected == "None"){
			selected = moves;
			for (ii = 0; ii < moves.length; ii++){
				document.getElementById("img_" + moves[ii].i + "_" + moves[ii].j).parentElement.setAttribute("bgcolor", "#330000");		
			}
		}
		else{
			selected = "None";
			for (ii = 0; ii < moves.length; ii++){
				document.getElementById("img_" + moves[ii].i + "_" + moves[ii].j).parentElement.setAttribute("bgcolor", "#333333");				
			}
		}
	}


	write_chekers();

	articles = document.getElementsByTagName('img');
	for (var i = 0; i < articles.length; i++) {
		articles[i].addEventListener('click', redirect, false);
	}
	function redirect(){
		n = Number(this.id.match(/\d+/g)[0]);
		m = Number(this.id.match(/\d+/g)[1]);
		checker = checkers[n][m];
		moves = calculate_moves(checker);
		if (moves_from_start % 2 == 0){
			if ((startGame == true) && (userteam1 == true) && (checker.team == "white") && (can_fight("white") == can_fight_checker(checker)) && (((selected == "None") && (moves.length > 1)) || ((selected[0].i == n) && (selected[0].j == m) && (double_kill == false)))){
				select_moves(moves);
			}
			else {
				if (selected != "None"){
					for (ii = 1; ii < selected.length; ii++){
						if ((n == selected[ii].i) && (m == selected[ii].j)){
							move = [selected[0], selected[ii]];
							hist.push(move);
							do_move(move);
							if (can_fight_checker(checker) && (hist[hist.length - 1][1].action == "fight" )){
								double_kill = true;
								select_moves(selected);
								if (checker.i == 7) up_rank(checker);
								moves = calculate_moves(checker);
								select_moves(moves);
								write_chekers();
								hodtouser();
							}
							else {
								double_kill = false;
								select_moves(selected);
								remove_dead();
								moves_from_start++;

								
								if (checker.i == 7) up_rank(checker);
								write_chekers();
								hodtouser();
								if (!can_move('black')) blacklose();
							}
						}
					}
				}
				else{
					if (!can_move('white')) whitelose();
				}
			}
		}
		else {
			if ((userteam2 == true) && (checker.team == "black") && (can_fight("black") == can_fight_checker(checker)) && (((selected == "None") && (moves.length > 1)) || ((selected[0].i == n) && (selected[0].j == m) && (double_kill == false)))){
				select_moves(moves);
			}
			else{
				if (selected != "None"){
					for (ii = 1; ii < selected.length; ii++){
						if ((n == selected[ii].i) && (m == selected[ii].j)){
							move = [selected[0], selected[ii]];
							hist.push(move);
							do_move(move);
							if (can_fight_checker(checker) && (hist[hist.length - 1][1].action == "fight" )){
								double_kill = true;
								select_moves(selected);
								if (checker.i == 0) up_rank(checker);
								moves = calculate_moves(checker);
								select_moves(moves);
								write_chekers();
								hodtouser();
							}
							else {
								double_kill = false;
								select_moves(selected);
								remove_dead();
								moves_from_start++;

								
								if (checker.i == 0) up_rank(checker);
								write_chekers();
								hodtouser();
								if (!can_move('black')) blacklose();
							}
						}
					}
				}
				else{
					if (!can_move('black')) blacklose();
				}
			}
		}
	}

}










