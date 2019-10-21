import { encode, append } from './util';

import Promise from 'promise-polyfill';
import fetchPonyfill from 'fetch-ponyfill';
import objectAssign from 'object-assign';
import packageJson from '../package.json';

const serializeBody = data => {
  if (data instanceof FormData) return data;
  return JSON.stringify(data);
};

const submissionUrl = props => {
  const { id, site, form } = props;
  const endpoint = props.endpoint || 'https://api.statickit.com';

  if (site && form) {
    return `${endpoint}/j/sites/${site}/forms/${form}/submissions`;
  } else {
    return `${endpoint}/j/forms/${id}/submissions`;
  }
};

const clientHeader = ({ clientName }) => {
  const label = `@statickit/core@${packageJson.version}`;
  if (!clientName) return label;
  return `${clientName} ${label}`;
};

/**
 * The client constructor.
 */
function StaticKit() {
  this.session = {
    loadedAt: 1 * new Date(),
    mousemove: 0,
    keydown: 0,
    webdriver:
      navigator.webdriver ||
      document.documentElement.getAttribute('webdriver') ||
      !!window.callPhantom ||
      !!window._phantom
  };

  this._onMouseMove = () => {
    this.session.mousemove += 1;
  };

  this._onKeyDown = () => {
    this.session.keydown += 1;
  };

  window.addEventListener('mousemove', this._onMouseMove);
  window.addEventListener('keydown', this._onKeyDown);
}

/**
 * Tears down the client instance.
 */
StaticKit.prototype.teardown = function teardown() {
  window.removeEventListener('mousemove', this._onMouseMove);
  window.removeEventListener('keydown', this._onKeyDown);
};

/**
 * Submits a form.
 *
 * Returns a `Promise` that resolves to `{body, response}`.
 *
 * @param {object} props
 * @returns {Promise}
 */
StaticKit.prototype.submitForm = function submitForm(props) {
  if (!props.id && !(props.site && props.form)) {
    throw new Error('You must set an `id` or `site` & `form` properties');
  }

  const fetchImpl = props.fetchImpl || fetchPonyfill({ Promise }).fetch;
  const url = submissionUrl(props);
  const data = props.data || {};
  const session = objectAssign({}, this.session, {
    submittedAt: 1 * new Date()
  });

  append(data, '_t', encode(session));

  const request = {
    method: 'POST',
    mode: 'cors',
    body: serializeBody(data),
    headers: {
      'StaticKit-Client': clientHeader(props)
    }
  };

  if (!(data instanceof FormData)) {
    request.headers['Content-Type'] = 'application/json';
  }

  return fetchImpl(url, request).then(response => {
    return response.json().then(body => {
      return { body, response };
    });
  });
};

/**
 * Constructs the client object.
 */
export default () => {
  return new StaticKit();
};
