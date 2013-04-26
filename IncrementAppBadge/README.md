Increment App Badge : Titanium
===============================

This is an iPhone application software which is used to increment the iPhone Appbadge. I have searched a lot for such one and unfortunately I didn't get one. Even Appcelerator doesn't provide such a facility. Atlast I found a solution for it.

You have to do the following things to do it.

1. Create a new mobile application project in Titanium.
2. Replace the resources folder with mine.
3. Login to www.appcelerator.com, go to your app then go to Manage ACS
4. Create a new user as admin, set user as admin
5. Create a new Access Control List(ACS) using the admin user and give the ACS Name as 'SampleApp'
6. Upload the p12 certificate for push notification
7. Now Install the application to your iPhone and run the app...
