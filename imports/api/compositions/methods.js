import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Compositions } from './collections';

Meteor.methods({
  addComp() {
    const untitledCount = Compositions.find({ name: /^Untitled/ }).count();

    const compId = Compositions.insert({
      name: `Untitled ${untitledCount + 1}`,
      board: [],
    });

    return compId;
  },

  changeCompName(_id, newValue) {
    check(_id, String);
    check(newValue, String);

    Compositions.update({ _id }, { $set: { name: newValue } });
  },
});
