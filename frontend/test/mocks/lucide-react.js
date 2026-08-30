const React = require('react');

module.exports = new Proxy(
  {},
  {
    get: (_target, prop) => {
      const Icon = (props) =>
        React.createElement('svg', { 'data-icon': String(prop), ...props });
      Icon.displayName = String(prop);
      return Icon;
    },
  },
);
