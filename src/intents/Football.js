import ObjectAssign from 'object-assign-deep';
import colors from 'colors';
import Slack from 'node-slack';

const defaults = {};

export default class Football {
	constructor(properties = {}) {
		this.properties = ObjectAssign({}, defaults, properties);
		this.slack = new Slack('https://hooks.slack.com/services/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');
	}

	/**
	 * Organise a football match, starting from the slack message
	 *
	 * @public
	 * @since  0.1.0
	 * 
	 * @param  {Object} parameters
	 */
	match(parameters) {
		const day = parameters.dayofweek || parameters.date;

		this.slack.send({
		    text: `Hello <!channel>! Football on ${day}?\n\n1. Alex C`,
		    username: 'Daisy'
		});
	}
}