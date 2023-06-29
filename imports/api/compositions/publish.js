import { Meteor } from 'meteor/meteor';
import { Compositions } from './collections';

Meteor.publish('compositions', () => Compositions.find({}));
