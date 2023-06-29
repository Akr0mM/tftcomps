import './builder.html';
import './style/builder.css';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Compositions } from '../api/compositions/collections';
import championsData from '../../db/champions.json';

const IS_LOADING_STRING = 'isLoading';

Template.builder.onCreated(function () {
  document.title = 'TFT Team Builder';
  this.state = new ReactiveDict();
  this.champs = new ReactiveVar(championsData.champions);
  this.sortOption = new ReactiveVar('cost');
  const handlerComps = Meteor.subscribe('compositions');

  Tracker.autorun(() => {
    this.state.set(IS_LOADING_STRING, !handlerComps.ready());
  });

  document.addEventListener('dragover', event => {
    event.preventDefault();
    if (event.target.classList.contains('slot-cover')) {
      event.target.classList.remove('dragging-champion-highlight');
      event.target.classList.add('highlight');
    }
  });

  document.addEventListener('dragleave', event => {
    event.preventDefault();
    if (event.target.classList.contains('slot-cover')) {
      event.target.classList.remove('highlight');
      event.target.classList.add('dragging-champion-highlight');
    }
  });

  document.addEventListener('dragstart', event => {
    const champion = event.target.getAttribute('champion-id');
    event.dataTransfer.setData('champion', champion);
    if (champion) event.dataTransfer.setData('slot', true);

    if (event.target.classList.contains('slot-container')) {
      event.dataTransfer.setData('slotId', event.target.id);
    }

    const slots = document.querySelectorAll('.slot-cover');
    slots.forEach(slot => {
      slot.classList.add('dragging-champion-highlight');
    });
  });

  document.addEventListener('drop', event => {
    const slots = document.querySelectorAll('.slot-cover');
    slots.forEach(slot => {
      slot.classList.remove('dragging-champion-highlight');
      slot.classList.remove('highlight');
    });
    event.preventDefault();
    if (!event.target.classList.contains('slot-cover')) return;
    const championToPush = event.dataTransfer.getData('champion');
    const champion = this.champs.curValue.find(
      champ => champ._id === championToPush,
    );
    // console.log(champion);

    if (
      event.dataTransfer.getData('slotId') &&
      event.dataTransfer.getData('slot')
    ) {
      const previousSlot = document.getElementById(
        event.dataTransfer.getData('slotId'),
      );
      const slot = previousSlot.firstElementChild;
      slot.classList.forEach(className => {
        if (/^cost-\d$/.test(className)) {
          slot.classList.remove(className);
        }
      });
      const slotCover = slot.firstElementChild;
      slotCover.style.backgroundImage = '';
      slot.lastElementChild.remove();
      slot.nextElementSibling.remove();
      previousSlot.removeAttribute('champion-id');
    }

    // champion image
    event.target.style.backgroundImage = `url(https://ddragon.leagueoflegends.com/cdn/13.12.1/img/champion/${champion.picName}.png)`;
    event.target.parentElement.classList.add(`cost-${champion.cost}`);
    event.target.parentElement.parentElement.setAttribute(
      'champion-id',
      champion.name,
    );
    // champion stars
    const stars = document.createElement('div');
    stars.classList.add('champion-stars-container');
    for (let i = 0; i < 2; i++) {
      const star = document.createElement('div');
      star.classList.add('stars');
      stars.appendChild(star);
    }
    event.target.parentElement.parentElement.appendChild(stars);

    event.target.parentElement.parentElement.draggable = 'true';
    const champName = document.createElement('div');
    champName.classList.add('board-champion-name');
    champName.textContent = champion.name;
    event.target.parentElement.appendChild(champName);
  });
});

Template.builder.onRendered(() => {
  $('.board').on('contextmenu', event => {
    event.preventDefault();
    if (event.target.classList.contains('board-champion-name')) {
      const border = event.target.parentElement;
      border.classList.forEach(className => {
        if (/^cost-\d$/.test(className)) {
          border.classList.remove(className);
        }
      });
      border.nextElementSibling.remove();

      event.target.remove();
      const slot = event.target.previousElementSibling;
      slot.style.backgroundImage = '';
      slot.style.backgroundColor = '#222222';
    } else if (event.target.classList.contains('slot-cover')) {
      const border = event.target.parentElement;
      border.classList.forEach(className => {
        if (/^cost-\d$/.test(className)) {
          border.classList.remove(className);
        }
      });
      border.nextElementSibling.remove();

      const name = event.target.nextElementSibling;
      name.remove();
      const slotCover = event.target;
      slotCover.style.backgroundImage = '';
      slotCover.style.backgroundColor = '#222222';
    }
  });
});

Template.builder.helpers({
  isLoading() {
    const instance = Template.instance();
    return !instance?.state.get(IS_LOADING_STRING);
  },

  champs() {
    const instance = Template.instance();
    const champs = instance.champs.get();
    const sortOption = instance.sortOption.get();

    if (sortOption === 'name') {
      champs.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      champs.sort((a, b) => a.cost - b.cost);
    }

    champs.forEach(champ => {
      champ._id = champ.name;
      champ.picName = champ.picName || champ.name;
      champ.name = champ.shortName || champ.name;
    });

    return champs;
  },

  compName() {
    const compId = FlowRouter.getQueryParam('_id');
    const comp = Compositions.findOne({ _id: compId });
    return comp.name;
  },

  compId() {
    const compId = FlowRouter.getQueryParam('_id');
    return compId;
  },
});

Template.builder.events({
  'click .filter'(event, templateInstance) {
    event.preventDefault();

    const selected = document.querySelector('.filter-selected');
    const { target } = event;
    if (target === selected) return;

    selected.classList.remove('filter-selected');
    target.classList.add('filter-selected');

    templateInstance.sortOption.set(target.textContent.toLowerCase());
  },

  'click .champion-stars-container'(event) {
    const count = event.currentTarget.childNodes.length;
    if (count === 3) {
      for (let i = 0; i < 2; i++) {
        const star = event.currentTarget.firstChild;
        star.remove();
      }
    } else {
      const star = document.createElement('div');
      star.classList.add('stars');
      event.currentTarget.appendChild(star);
    }
  },

  'input .name-input'(event) {
    const newValue = event.target.value;
    const compId = event.target.getAttribute('comp-id');
    Meteor.call('changeCompName', compId, newValue);
  },
});
