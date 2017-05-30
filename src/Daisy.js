import ObjectAssign from 'object-assign-deep';
import apiai from 'apiai';
import colors from 'colors';
import * as intents from './intents/_intents'

const defaults = {
	baseurl: 'https://api.api.ai/api/query',
	options: {
		sessionId: '10d73c2b-8076-4408-ad8d-d502aaa1090d'
	}
};

export default class Daisy {
	constructor(properties = {}) {
		this.properties = ObjectAssign({}, defaults, properties);
		this.app = apiai(this.properties.daisyToken);
		console.log(intents);
		this.intents = this._generateIntents();
		this.contexts = null;
	}

	/**
	 * Generate all the instances of the intents
	 *
	 * @private
	 * @since 0.1.0
	 * 
	 * @return {Array}
	 */
	_generateIntents() {
		return Object.keys(intents).reduce((carry, intent) => {
			carry[intent] = new intents[intent]();

			return carry;
		}, {});
	}

	/**
	 * Get the intent and the action coming from the result
	 * 
	 * @private
	 * @since 0.1.0
	 * 
	 * @param  {String} action
	 * 
	 * @return {Object} e.g.
	 * {
	 *     name: 'football',
	 *     action: 'match'
	 * }
	 */
	_getIntentData(action) {
		return {
			name: action.split('.')[0],
			action: action.split('.')[1]
		}
	}

	/**
	 * Handle the response and use an intent based on the result action
	 * 
	 * @private
	 * @since 0.1.0
	 * 
	 * @param  {Function} callback Callback to run in case isn't the end of the conversation
	 * @param  {Object}   response Response coming from api.ai
	 */
	_handleResponse(callback, response) {
		const intent = this._getIntentData(response.result.action);

		this.contexts = response.result.contexts;

		if (this.hasIntent(intent.name)) {
			// this.intents[intent.name][intent.action](response.result.parameters);
		}
		
		console.log(colors.green('Daisy: ') + response.result.fulfillment.speech);
		!response.result.parameters.end && callback();
	}

	/**
	 * Handle the error from the send request
	 * 
	 * @private
	 * @since 0.1.0
	 * 
	 * @param  {String} error
	 */
	_handleError(error) {
		console.error(error);
	}

	/**
	 * Check wether the class intents contains the specified intent key
	 * 
	 * @public
	 * @since 0.1.0
	 * 
	 * @param  {String}  intent
	 * 
	 * @return {Boolean}
	 */
	hasIntent(intent) {
		return Object.keys(this.intents).includes(intent);
	}

	/**
	 * Send a message to the api.ai and run a callback in the response
	 * 
	 * @public
	 * @since 0.1.0
	 * 
	 * @param  {String}   message The query to send to the api
	 * @param  {Function} callback The function to run in the response
	 */
	send(message, callback = () => {}) {
		const request = this.app.textRequest(`${this.properties.baseurl}&query=${message}`, this.properties.options);
		
		request.on('response', this._handleResponse.bind(this, callback));
		request.on('error', this._handleError);

		request.end();
	}
}