var $window = $(window);
var $login = $('.loginInput.textinput');
var $password = $('.passwordInput.textinput');
var $loginPage = $('.loginpage');
var $gamePage = $('.gamepage');
var $menuPage = $('.menupage');
var $registerPage = $('.regpage');
var $ratingPage = $('.ratingpage');

console.log($registerPage);
$registerPage.hide();
$gamePage.hide();
$menuPage.hide();
$ratingPage.hide();

var typing = false;
var socket = io();

function registerClick() {
    $loginPage.hide();
    $registerPage.show();
}

function backClick() {
    $loginPage.show();
    $registerPage.hide();
}

//!!

function back(){
	$ratingPage.hide();
	$menuPage.fadeIn();
}
function showRating(){
	console.log("RATING");
	socket.on('ratingResp', function(res){
		var myTable= "<thead><th>Логин</th>";
		myTable+= "<th>Количество побед</th></thead>";
    
		for (var i=0; i<res.length; i++) {
			myTable+="<tr><td class='td'>" + res[i].login + "</td>";
			if(res[i].rating!=null){
				myTable+="<td class='td'>" + res[i].rating + "</td></tr>";
			}else{
				myTable+="<td class='td'>" + "0" + "</td></tr>";
			}
		}  
		document.getElementById('ratingtable').innerHTML = "<h1>РЕЙТИНГ</h1>";
		document.getElementById('ratingtable').innerHTML = myTable;
		$menuPage.hide();
		$ratingPage.fadeIn();
	});
	socket.emit('rating');
}

function giveUp() {
	swal({
			title: "Эх..",
			text: "До свидания!",
                    confirmButtonText: "Я вернусь"
        }
		);
	socket.emit('giveup');
    $gamePage.hide();
	$menuPage.fadeIn();
}
//!!


function register() {
    console.log("REGISTER");
    var $loginreg = $(".loginReg.textinput");
    var $password = $(".passwordReg.textinput");
    var $confPassword = $(".passwordRegConf.textinput");

    var login = $loginreg.val();
    var password = $password.val();
    var passwordConf = $confPassword.val();
    console.log(login);
    console.log(password);
    console.log(passwordConf);
    console.log(password == passwordConf);
    if (login && password && passwordConf){
        if (password == passwordConf){
            socket.on('registerresp', function (result) {
                if (result){
                    $registerPage.hide();
                    $loginPage.show();
                }
                else {
                    swal({
                    title: "Ошибка",
                    text: "Данный никнейм уже занят. Выберите другой.",
                    confirmButtonText: "Закрыть"
                }
				);
                }
            })
            socket.emit('register', {login: login, password: password});
        }
        else {
                    swal({
                    title: "Ошибка",
                    text: "Пароли не совпадают.",
                    confirmButtonText: "Закрыть"
                }
				);
        }
    }
}

function auth() {
    console.log("SUBMIT");
    var clogin = $login.val();
    var cpassword = $password.val();
    console.log(clogin);
    console.log(cpassword);
    if (clogin && cpassword) {
        socket.on('loginresp', function (result) {
            if (result) {
                console.log(clogin);
                $loginPage.hide();
                $menuPage.fadeIn();
                $loginPage.off('click');
                cm_createCookie("login", clogin, 10);
            }else {
                    swal({
                    title: "Ошибка",
                    text: "Неверный логин/пароль.",
                    confirmButtonText: "Закрыть"
                }
				);
			}
        });
    }
    socket.emit('auth user', {login: clogin, password: cpassword});
	document.getElementById('Username1').innerHTML = '<b>' + clogin + '</b>';
}

function joinGame() {
    console.log("JOIN");
    socket.emit('add user', {login: ' '});
    $menuPage.hide();
    $gamePage.fadeIn();
}

socket.on('joinResult', function(result) {

    if (result.userteam == 1){
        $('#clr').text('Вы играете белыми');
    }
    if (result.userteam == 2){
        $('#Username2').text(result.userHost);
        $('#clr').text('Вы играете черными');
    }
});

socket.on('userconnecttoroom', function(usertoroom){
    $('#Username2').text(usertoroom.user2);
})

function cleanInput (input) {
    return $('<div/>').text(input).text();
}







