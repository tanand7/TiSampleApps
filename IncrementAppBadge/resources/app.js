var Cloud = require('ti.cloud');
//create object instance, a parasitic subclass of Observable
var wndLogin = Ti.UI.createWindow({
  layout	: 'vertical',
	backgroundColor : 'white'
});

var txtUsername = Ti.UI.createTextField({
	top		: 50,
	width	: '70%',
	height	: 30,
	hintText : 'email',
	borderColor : 'black'
});

var txtPassword = Ti.UI.createTextField({
	top		: 30,
	width	: '70%',
	height	: 30,
	passwordMask : true,
	hintText : 'Password',
	borderColor : 'black'
});

var btnLogin = Ti.UI.createButton({
	top		: 30,
	width	: '70%',
	height	: 30,
	title	: 'Login'
});

var btnSignup = Ti.UI.createButton({
	top		: 30,
	width	: '70%',
	height	: 30,
	title	: 'Signup'
});

btnLogin.addEventListener('click', cloudLogin);
btnSignup.addEventListener('click', openSignup);
wndLogin.add(txtUsername);
wndLogin.add(txtPassword);
wndLogin.add(btnLogin);
wndLogin.add(btnSignup);
wndLogin.open();
	
function cloudLogin(){
	if(txtUsername.value !== "" || txtPassword.value !== ""){
		Cloud.Users.login({
		    login: txtUsername.value,
		    password: txtPassword.value
		}, function (e) {
		    if (e.success) {
		        var user = e.users[0];
		        var HomePage = require('ui/common/Home');
		        var homePage = new HomePage(user);
		        homePage.open();
		    } else {
		        alert('Error: ' + ((e.error && e.message) || JSON.stringify(e)));
		    }
		});
	} else{
		alert('Please enter email and password');
	}
}
	
function openSignup(){
	var SignupPage = require('ui/common/Signup');
    var signupPage = new SignupPage();
    signupPage.open();
}
