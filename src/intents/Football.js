import Slack from 'node-slack';
import Intent from './Intent';

const defaults = {
    tables: {
        match: {
            name: '/football/match',
            value: []
        },
        player: {
            name: '/football/player',
            value: []
        }
    },
    schemas: {
        '/football/match': {
            date: {
                type: 'string',
                required: true
            },
            players: {
                type: 'object'
            }
        },
        '/football/player': {
            name: {
                type: 'string',
                required: true
            },
            skills: {
                type: 'object',
                required: true,
                schema: {
                    attack: {
                        type: 'number',
                        required: true
                    },
                    defence: {
                        type: 'number',
                        required: true
                    },
                    stamina: {
                        type: 'number',
                        required: true
                    }
                }
            }
        }
    }
};
const fakePlayer = {
    name: 'Fantozzi',
    skills: {
        attack: 0,
        defence: 0,
        stamina: 0
    }
};

export default class Football extends Intent {
    constructor(properties = {}) {
        super([properties, defaults]);

        this.slack = new Slack('https://hooks.slack.com/services/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');
    }

    _evenUpPlayers(players) {
        const isEven = players.length % 2 === 0;

        return isEven ? players : players.concat(fakePlayer);
    }

    _getPlayerLevel(player) {
        return Object.keys(player.skills).reduce((total, skill) => total + skill, 0);
    }

    _generateTeams(players) {
        // const teams = [[], []];
        return this._evenUpPlayers(players);
    }

    /**
     * Organise a football match, starting from the slack message
     *
     * @public
     * @since  0.1.0
     *
     * @param  {Object} parameters
     *
     * @return {String}
     */
    organise(parameters) {
        const day = parameters.dayofweek || parameters.date;

        super.save(this.props.tables.match.name, {
            date: day
        });

        return 'Nothing to say...';

        this.slack.send({
            text: `Hello <!channel>! Football on ${day}?\n\n1. Alex C`,
            username: 'Daisy'
        });

        return 'Asked, I will see what is going happen';
    }

    /**
     * Save a player in the database
     *
     * @public
     * @since  0.1.0
     *
     * @param  {Object} parameters
     *
     * @return {String}
     */
    savePlayer(parameters) {
        const { name, attack, defence, stamina } = parameters;
        const entry = {
            name,
            skills: {
                attack,
                defence,
                stamina
            }
        };

        super.save(this.props.tables.player.name, entry);

        return 'Player succesfully saved';
    }

    /**
     * Get player informations
     *
     * @public
     * @since 0.1.0
     *
     * @param  {Object} parameters
     *
     * @return {String}
     */
    getPlayer(parameters) {
        const { name } = parameters;
        const players = super.getBy(this.props.tables.player.name, 'name', name);

        if (!players.length) {
            return `Sorry, no matches found for ${name}`;
        }

        const { attack, defence, stamina } = players[0].skills;

        return `${name}'s skills are attack: ${attack}, defence: ${defence} and stamina: ${stamina}!`;
    }

    /**
     * Get the list of all the players
     *
     * @public
     * @since 0.1.0
     *
     * @return {String}
     */
    getPlayerList() {
        return this.db.getData(this.props.tables.player.name)
            .map(({ name }) => name)
            .join(', ');
    }

    /**
     * Generate an array of two teams, based on players skills
     *
     * @since  0.1.0
     * @public
     *
     * @param  {Array} players
     *
     * @return {Array}
     */
    generateTeams(players) {
        const teams = [0, 1];

        return teams.map(team => players);
    }
}
