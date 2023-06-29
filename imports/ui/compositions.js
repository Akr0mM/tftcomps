import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Compositions } from '../api/compositions/collections';

import './compositions.html';
import './style/compositions.css';

Template.compositions.onCreated(() => {
  Meteor.subscribe('compositions');
});

Template.compositions.helpers({
  comps() {
    return Compositions.find({});
  },
});
Template.compositions.events({
  'click .add-comp'() {
    Meteor.call('addComp', (error, result) => {
      if (error) {
        console.log('Erreur lors de l\'appel de la méthode :', error);
      } else {
        const compId = result;

        FlowRouter.go(`/builder/edit?_id=${compId}`);
      }
    });
  },
});
