//FirstView Component Constructor
function Signup() {
  var Cloud = require('ti.cloud');
	//create object instance, a parasitic subclass of Observable
	var wndSignup = Ti.UI.createWindow({
		backgroundColor : 'white'
	});
	var self = Ti.UI.createScrollView({
		layout 			: 'vertical',
		contentWidth    : 'auto',
		contentHeight   : 'auto'
	});
	
	var txtEmail = Ti.UI.createTextField({
		top		: 30,
		width	: '70%',
		height	: 30,
		hintText : 'email',
		borderColor : 'black'
	});

	var txtFirstName = Ti.UI.createTextField({
		top		: 30,
		width	: '70%',
		height	: 30,
		hintText : 'First name',
		borderColor : 'black'
	});
	var txtLastName = Ti.UI.createTextField({
		top		: 30,
		width	: '70%',
		height	: 30,
		hintText : 'Last name',
		borderColor : 'black'
	});
	var txtPassword = Ti.UI.createTextField({
		top		: 30,
		width	: '70%',
		height	: 30,
		hintText : 'Password',
		passwordMask : true,
		borderColor : 'black'
	});
	var txtPasswordConfirm = Ti.UI.createTextField({
		top		: 30,
		width	: '70%',
		height	: 30,
		passwordMask : true,
		hintText : 'Confirm password',
		borderColor : 'black'
	});
	
	var btnBack = Ti.UI.createButton({
		top		: 30,
		width	: '70%',
		height	: 30,
		title	: 'Close'
	});
	
	var btnSignup = Ti.UI.createButton({
		top		: 30,
		width	: '70%',
		height	: 30,
		title	: 'Create Account'
	});
	
	function createAccount(){
		var email = txtEmail.value;
		var firstName = txtFirstName.value;
		var lastName = txtLastName.value;
		var password = txtPassword.value;
		var passwordConfirm = txtPasswordConfirm.value;
		if(email !== "" || firstName !== "" || lastName !== "" || password!=="" || passwordConfirm !== ""){
			Cloud.Users.create({
			    email: email,
			    first_name: firstName,
			    last_name: lastName,
			    password: password,
			    username : email,
			    password_confirmation: passwordConfirm
			}, function (e) {
			    if (e.success) {
			        var user = e.users[0];
			        createUserObject(user);
			    } else {
			        alert('Error: ' + ((e.error && e.message) || JSON.stringify(e)));
			    }
			});
		} else {
			alert('Please enter missing fields');
		}
	}
	
	function createUserObject(user){
		Cloud.Objects.create({
		    classname				: 'users',
		 	acl_name	 			: 'SampleApp',
		    fields: {
		 		pushNotifications   : 0	
		    }
		}, function (e) {
				if(e.success){
		  			var HomePage = require('ui/common/Home');
			        var homePage = new HomePage(user);
			        homePage.open();
				}else{
					alert(((e.error && e.message) || JSON.stringify(e)));
				}
		});
	}
	
	btnBack.addEventListener('click', function(){
		wndSignup.close();
	});
	btnSignup.addEventListener('click', createAccount);
	self.add(txtEmail);
	self.add(txtFirstName);
	self.add(txtLastName);
	self.add(txtPassword);
	self.add(txtPasswordConfirm);
	self.add(btnSignup);
	self.add(btnBack);
	wndSignup.add(self);
	return wndSignup;
}

module.exports = Signup;
