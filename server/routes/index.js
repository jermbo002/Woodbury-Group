const routes = [
    'home',
    'generic'
];

module.exports = app => routes.forEach( route => require( `./${route}` )( app ) );