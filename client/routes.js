// @ts-ignore
import { FlowRouter } from 'meteor/kadira:flow-router';
// @ts-ignore
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.route('/', {
  triggersEnter: [
    function (context, redirect) {
      FlowRouter.withReplaceState(() => {
        redirect('/compositions');
      });
    },
  ],
});

FlowRouter.route('/compositions', {
  name: 'compositions',
  // eslint-disable-next-line consistent-return
  action() {
    if (!Meteor.userId()) return FlowRouter.redirect('/login');
    BlazeLayout.render('layout', { mainTemplate: 'compositions' });
  },
});

FlowRouter.route('/builder/:compId', {
  name: 'builderEdit',

  action(params, queryParams) {
    BlazeLayout.render('layout', { mainTemplate: 'builder' });
    console.log('Params:', params);
    console.log('Query Params:', queryParams);
  },
});

FlowRouter.route('/builder', {
  name: 'builderRedirect',
  // eslint-disable-next-line consistent-return
  action() {
    FlowRouter.redirect('/compositions');
    BlazeLayout.render('layout', { mainTemplate: 'compositions' });
  },
});

const route = name => FlowRouter.route(`/${name}`, {
  name,
  action() {
    BlazeLayout.render('layout', { mainTemplate: name });
  },
});

route('login');
route('register');
