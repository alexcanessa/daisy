import ObjectAssign from 'object-assign-deep';
import apiai from 'apiai';
import colors from 'colors';
import * as intents from './intents/_intents';
import JsonDB from 'node-json-db';

const defaults = {
    baseurl: 'https://api.api.ai/api/query',
    options: {
        sessionId: '10d73c2b-8076-4408-ad8d-d502aaa1090d'
    },
    // dbName: '/Users/alexcanessa/Dropbox/daisy_db'
    dbName: 'daisy_db'
};

export default class Daisy {
    constructor(properties = {}) {
        this.properties = ObjectAssign({}, defaults, properties);
        this.app = apiai(this.properties.daisyToken);
        this.db = new JsonDB(this.properties.dbName, true, true);
        this.intents = this._generateIntents();
        this.contexts = [];
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
            carry[intent] = new intents[intent]({
                db: this.db
            });

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
        };
    }

    /**
     * Handle the response and use an intent based on the result action
     *
     * @private
     * @since 0.1.0
     *
     * @param  {Object}   response Response coming from api.ai
     *
     * @return {Object}
     */
    _handleResponse(response) {
        const { action, fulfillment, parameters, actionIncomplete, contexts } = response.result;
        const intent = this._getIntentData(action);
        const responseObject = {
            message: fulfillment.speech,
            end: Boolean(parameters.end),
            intentMessage: false
        };
        this.contexts = contexts;

        if (this.hasIntent(intent) && !actionIncomplete) {
            responseObject.intentMessage = this.intents[intent.name][intent.action](parameters);
        }

        return responseObject;
    }

    /**
     * Handle the error from the send request
     *
     * @private
     * @since 0.1.0
     *
     * @param  {String} error
     *
     * @return {String}
     */
    _handleError(error) {
        return error;
    }

    /**
     * Retun a daisy message
     *
     * @public
     * @since 0.1.0
     *
     * @param  {[type]} message [description]
     * @return {[type]}         [description]
     */
    speak(message) {
        return colors.green('Daisy: ') + message;
    }

    /**
     * Check wether the class intents contains the specified intent key
     *
     * @public
     * @since 0.1.0
     *
     * @param  {Object}  intent
     *
     * @return {Boolean}
     */
    hasIntent({ name, action }) {
        return Object.keys(this.intents).includes(name) && this.intents[name][action];
    }

    /**
     * Send a message to the api.ai and run a callback in the response
     *
     * @public
     * @since 0.1.0
     *
     * @param  {String}   message The query to send to the api
     * @param  {Function} callback The function to run in the response
     *
     * @return {Promise}
     */
    send(message) {
        const request = this.app.textRequest(message, this.properties.options);

        return new Promise((resolve, reject) => {
            request.on('response', response => {
                resolve(this._handleResponse(response));
            });

            request.on('error', error => {
                reject(this._handleError(error));
            });

            request.end();
        });
    }
}
