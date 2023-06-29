import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

Meteor.methods({
  appCreateUser(email, username, password) {
    check(email, String);
    check(username, String);
    check(password, String);

    if (Meteor.users.findOne({ username })) {
      throw new Meteor.Error(
        'username-already-exists',
        'A user with the same email already exists',
      );
    }

    if (Meteor.users.findOne({ 'emails.address': email })) {
      throw new Meteor.Error(
        'email-already-exists',
        'A user with the same username already exists',
      );
    }

    const user = {
      email,
      username,
      password,
      profile: {
        compositionsId: [],
      },
    };

    const userId = Accounts.createUser(user);
    return userId;
  },
});
