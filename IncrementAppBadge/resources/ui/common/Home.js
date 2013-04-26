//FirstView Component Constructor
function Home(currentUser) {
  var Cloud = require('ti.cloud');
	var totalUsers = 0;
	var allUsers = [];
	var customObjects = [];
	var selectedUsers = [];
	//create object instance, a parasitic subclass of Observable
	var self = Ti.UI.createWindow({
		backgroundColor : 'white',
		layout	: 'vertical'
	});
	
	var txtNotification = Ti.UI.createTextField({
		top		: 20,
		width	: '70%',
		height	: 30,
		hintText : 'Notification body',
		borderColor : 'black'
	});
	
	var btnSend = Ti.UI.createButton({
		top		: 30,
		width	: '70%',
		height	: 30,
		title	: 'Send Notification'
	});
	
	var btnGetAllUsers = Ti.UI.createButton({
		top		: 30,
		width	: '70%',
		height	: 30,
		title	: 'Get All Users'
	});
	
	var btnBack = Ti.UI.createButton({
		top		: 30,
		width	: '70%',
		height	: 30,
		title	: 'Logout'
	});
	
	var tblvUsers = Ti.UI.createTableView({
		top		: 30,
		height	: 'auto',
		width   : '100%',
		scrollable : true
	});
	
	btnBack.addEventListener('click', function(){
		var successCB;
		var errorCB = errorLogout;
		var deviceModel = Ti.Platform.model;
		if(deviceModel == 'Simulator'){
			successCB = successLogout;
		    cloudSignout(successCB,errorCB);
		}else{
			successCB = cloudSignout;
			unsubscribePush(successCB,errorCB);	
		}
	});
	
	self.addEventListener('open', function(){
		try{
			clearBadges();
			retrieveIPhoneDeviceToken(currentUser.username, 'ios');
		}catch(err){
			alert(err.message);
		}
	});
	Ti.App.addEventListener('resume', clearBadges);
	tblvUsers.addEventListener('click', selectUser);
	btnGetAllUsers.addEventListener('click', getAllUsers);
	btnSend.addEventListener('click', notifySelected);
	self.add(txtNotification);
	self.add(btnSend);
	self.add(btnGetAllUsers);
	self.add(btnBack);
	self.add(tblvUsers);
	return self;
	
	//Retrieve Device Token for ios
	function retrieveIPhoneDeviceToken(username, type)
	{
		var deviceToken;
		Titanium.Network.registerForPushNotifications({
		    types: [
		        Titanium.Network.NOTIFICATION_TYPE_BADGE,
		        Titanium.Network.NOTIFICATION_TYPE_ALERT,
		        Titanium.Network.NOTIFICATION_TYPE_SOUND
		    ],
			success:function(e)
			{
			    deviceToken = e.deviceToken;
			    Ti.App.Properties.setString('deviceToken',deviceToken);
			    subscribeToPush(username, deviceToken, type);
			},
			error:function(e)
			{
			    alert("Error: "+ ((e.error && e.message) || JSON.stringify(e.error)));
			},
			callback : function(e){
				clearBadges();
			}
		});
		
		return deviceToken;
	}
	
	function subscribeToPush(username, deviceToken, type)
	{	
	    Cloud.PushNotifications.subscribe({
		    channel: username,
		    device_token: deviceToken,
		    type : type
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('subscribed to push notification');
		    } else {
		        alert('Error: ' + ((e.error && e.message) || JSON.stringify(e.error)));
		    }
		});
	}
	
	function unsubscribePush(sCallback, eCallback){
		var deviceToken = Ti.App.Properties.getString('deviceToken');
		Cloud.PushNotifications.unsubscribe({
			channel		: currentUser.username,
		    device_token: deviceToken
		}, function (e) {
		    if (e.success) {
		    	var successCB = successLogout;
		        sCallback(successLogout,eCallback);
		    } else {
		    	eCallback();
		    }
		});
	}
	
	function cloudSignout(logoutSuccessCB,logoutErrorCB){
		Cloud.Users.logout(function (e) {
		    if (e.success) {
		 	    logoutSuccessCB(e);
		        Ti.API.info('Success: Logged out');
		    } else {
		 	    var error = ((e.error && e.message) || JSON.stringify(e));
		 		logoutErrorCBs(error);
		        Ti.API.info('Error: ' + ((e.error && e.message) || JSON.stringify(e)));
		    }
		});
	}
	
	function successLogout(){
		self.close();
	}

	function errorLogout(e){
		alert((e.error && e.message) || JSON.stringify(e));
	}
	
	function getAllUsers(){
		Cloud.Users.query({
		    where: {
		        admin: false,
		        "username": {"$ne":currentUser.username}
		    }
		}, function (e) {
		    if (e.success) {
		        totalUsers =  e.users.length;
		        allUsers = e.users;
		        createList(allUsers);
		    } else {
		        alert('Error: ' + ((e.error && e.message) || JSON.stringify(e)));
		    }
		});
	}
	
	function createList(allUsers){
		var tableData = [];
		for(var index=0; index< allUsers.length; index++){
			var row = Ti.UI.createTableViewRow({
				title    : allUsers[index].first_name + ' ' + allUsers[index].last_name,
				userData : allUsers[index],
				selected : false,
				color	 : '#e0e0e0'
			});
						
			tableData.push(row);
		}
		tblvUsers.setData(tableData);
	}
	
	function selectUser(e){
		try{
			var userData = e.rowData.userData;
			var selected = e.rowData.selected;
			if(selected){
				e.rowData.selected = false;
				e.source.color = '#e0e0e0';
				deselectUser(userData);
			} else {
				e.rowData.selected = true;
				e.source.color = 'red';
				selectedUsers.push(userData);
			}
		}catch(err){
			alert(err.message);
		}
	}
	
	function deselectUser(userData){
		try{
			var pos;
			for(var i = 0; i < selectedUsers.length; i++){
				if(selectedUsers[i].id === userData.id){
					pos = i;
					selectedUsers.splice(pos,1);
					break;
				}
			}
		}catch(err){
			alert(err.message);
		}
	}
	
	function notifySelected(){
		try{
			if(selectedUsers.length > 0){
				for(var index = 0; index < selectedUsers.length; index++){
					getCustomObjects(selectedUsers[index]);
				}
			} else {
				alert(selectedUsers.length + ' users were selected');
			}
		}catch(err){
			alert(err.message);
		}
	}
	
	function getCustomObjects(userInfo){
		try{
			var userID = userInfo.id;
			Cloud.Objects.query({
			    classname : 'users',
		 		acl_name  : 'SampleApp',
			    where: {
			        "user_id" : userID
			    }
			}, function (e) {
			    if (e.success) {
			    	var userObject = e.users[0];
			    	var badgeNumber = 0;
			    	badgeNumber = userObject.pushNotifications + 1;
			        sendPush(userObject, userInfo, badgeNumber);
			    } else {
			        alert('Error: ' + ((e.error && e.message) || JSON.stringify(e)));
			    }
			});
		}catch(err){
			alert(err.message);
		}
	}
	
	function sendPush(userObject, userInfo, badgeNumber){
		try{
			var channel = userInfo.username;
			var payload = {"alert" : txtNotification.value, "badge" : badgeNumber};
			Cloud.PushNotifications.notify({
			    channel: channel,
			    payload: payload
			}, function (e) {
			    if (e.success) {
			        updateCustomObject(userObject, badgeNumber);
			    } else {
			        alert('Error: ' + ((e.error && e.message) || JSON.stringify(e)));
			    }
			});
		}catch(err){
			alert(err.message);
		}
	}
	
	function updateCustomObject(userObject, badgeNumber){
		try{
			Cloud.Objects.update({
			    classname : 'users',
			    id		  : userObject.id,
			 	acl_name	 : 'SampleApp',
			    fields: {
			        pushNotifications  : badgeNumber
			    }
			}, function (e) {
			    if (e.success) {
			    	//Do nothing
			    } else {
			        alert('Error: ' + ((e.error && e.message) || JSON.stringify(e)));
			    }
			});
		}catch(err){
			alert(err.message);
		}
	}
	
	function clearBadges(){
		Ti.UI.iPhone.setAppBadge(0);
		Cloud.Objects.query({
		    classname : 'users',
	 		acl_name  : 'SampleApp',
		    where: {
		        "user_id" : currentUser.id
		    }
		}, function (e) {
		    if (e.success) {
		    	var userObject = e.users[0];
		    	var badgeNumber = 0;
		        updateCustomObject(userObject, badgeNumber);
		    } else {
		        alert('Error: ' + ((e.error && e.message) || JSON.stringify(e)));
		    }
		});
	}
}
module.exports = Home;
