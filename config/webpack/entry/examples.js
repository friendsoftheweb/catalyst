import React from 'react';
import ReactDOM from 'react-dom';

import * as examples from 'examples';

const exampleName = location.search.replace('?example=', '');

document.addEventListener('DOMContentLoaded', function() {
  const navigation = document.getElementById('navigation');
  const container = document.getElementById('container');

  if (navigation) {
    Object.keys(examples).forEach(key => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="/${key}">${key}</a>`;

      if (location.pathname.replace(/^\//, '') === key) {
        li.classList.add('active');
      }

      navigation.appendChild(li);
    });
  }

  if (exampleName in examples) {
    ReactDOM.render(examples[exampleName](), container);
  } else if (container != null) {
    container.innerHTML = `<code>Couldn't find example: ${exampleName}</code>`;
  }
});
