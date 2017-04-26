import React from 'react';
import ReactDOM from 'react-dom';

// Copied from:
// https://github.com/reactjs/react-rails/blob/c4b33fbdadb31ea85cbb16fa84b91c8fccb6560d/lib/assets/javascripts/react_ujs_mount.js
// https://github.com/reactjs/react-rails/blob/e43aabbfc8e17b1f1ef253b9fad87f9cd1a99b28/lib/assets/javascripts/react_ujs_native.js

// jQuery is optional. Use it to support legacy browsers.
const $ = typeof window.jQuery !== 'undefined' && window.jQuery;

const ReactRailsUJS = {
  // This attribute holds the name of component which should be mounted
  // example: `data-react-class="MyApp.Items.EditForm"`
  CLASS_NAME_ATTR: 'data-react-class',

  // This attribute holds JSON stringified props for initializing the component
  // example: `data-react-props="{\"item\": { \"id\": 1, \"name\": \"My Item\"} }"`
  PROPS_ATTR: 'data-react-props',

  // helper method for the mount and unmount methods to find the
  // `data-react-class` DOM elements
  findDOMNodes: function(searchSelector) {
    // we will use fully qualified paths as we do not bind the callbacks
    var selector, parent;

    switch (typeof searchSelector) {
      case 'undefined':
        selector = `[${ReactRailsUJS.CLASS_NAME_ATTR}]`;
        parent = document;
        break;
      case 'object':
        selector = `[${ReactRailsUJS.CLASS_NAME_ATTR}]`;
        parent = searchSelector;
        break;
      case 'string':
        selector = `${searchSelector}[${ReactRailsUJS.CLASS_NAME_ATTR}], ${searchSelector} [${ReactRailsUJS.CLASS_NAME_ATTR}]`;
        parent = document;
        break;
      default:
        break;
    }

    if ($) {
      return $(selector, parent);
    } else {
      return parent.querySelectorAll(selector);
    }
  },

  // Get the constructor for a className
  getConstructor: function(className) {
    // Assume className is simple and can be found at top-level (window).
    // Fallback to eval to handle cases like 'My.React.ComponentName'.
    // Also, try to gracefully import Babel 6 style default exports
    //
    var constructor;

    // Try to access the class globally first
    constructor = window[className];

    // If that didn't work, try eval
    if (!constructor) {
      constructor = eval.call(window, className);
    }

    // Lastly, if there is a default attribute try that
    if (constructor && constructor['default']) {
      constructor = constructor['default'];
    }

    return constructor;
  },

  // Within `searchSelector`, find nodes which should have React components
  // inside them, and mount them with their props.
  mountComponents: function(searchSelector) {
    var nodes = ReactRailsUJS.findDOMNodes(searchSelector);

    for (var i = 0; i < nodes.length; ++i) {
      var node = nodes[i];
      var className = node.getAttribute(ReactRailsUJS.CLASS_NAME_ATTR);
      var constructor = this.getConstructor(className);
      var propsJson = node.getAttribute(ReactRailsUJS.PROPS_ATTR);
      var props = propsJson && JSON.parse(propsJson);

      if (typeof constructor === 'undefined') {
        var message = "Cannot find component: '" + className + "'";
        if (console && console.log) {
          console.log(
            '%c[react-rails] %c' + message + ' for element',
            'font-weight: bold',
            '',
            node
          );
        }
        var error = new Error(
          message + '. Make sure your component is globally available to render.'
        );
        throw error;
      } else {
        ReactDOM.render(React.createElement(constructor, props), node);
      }
    }
  },

  // Within `searchSelector`, find nodes which have React components
  // inside them, and unmount those components.
  unmountComponents: function(searchSelector) {
    var nodes = ReactRailsUJS.findDOMNodes(searchSelector);

    for (var i = 0; i < nodes.length; ++i) {
      var node = nodes[i];

      ReactDOM.unmountComponentAtNode(node);
    }
  }
};

ReactRailsUJS.Native = {
  // Attach handlers to browser events to mount & unmount components
  setup: function() {
    if ($) {
      $(function() {
        ReactRailsUJS.mountComponents();
      });
    } else if ('addEventListener' in window) {
      document.addEventListener('DOMContentLoaded', function() {
        ReactRailsUJS.mountComponents();
      });
    } else {
      // add support to IE8 without jQuery
      window.attachEvent('onload', function() {
        ReactRailsUJS.mountComponents();
      });
    }
  }
};

ReactRailsUJS.Native.setup();
