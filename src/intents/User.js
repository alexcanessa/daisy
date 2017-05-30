import Intent from './Intent';

const defaults = {
    tables: {
        name: {
            name: '/user/name',
            value: []
        },
        nameType: {
            name: '/user/nameType',
            value: [
                'given-name',
                'last-name',
                'nick-name'
            ]
        }
    },
    schemas: {
        '/user/name': {
            type: {
                type: 'number',
                table: '/user/nameType',
                required: true
            },
            value: {
                type: 'string',
                required: true
            }
        },
        '/user/nameType': false
    }
};

export default class User extends Intent {
    constructor(properties = {}) {
        super([properties, defaults]);
    }

    /**
     * Get the name of the user
     *
     * @public
     * @since 0.1.0
     *
     * @param  {Object} parameters
     *
     * @return {String}
     */
    getName(parameters) {
        return '';
    }

    /**
     * Change the name of the user
     *
     * @public
     * @since 0.1.0
     *
     * @param  {Object} parameters
     *
     * @return {String}
     */
    changeName(parameters) {
        return '';
    }

    /**
     * Save the name of the user
     *
     * @public
     * @since 0.1.0
     *
     * @param  {Object} parameters
     *
     * @return {String}
     */
    saveName(parameters) {
        super.get(this.props.tables.nameType.name).forEach((nameType, index) => {
            if (parameters[nameType]) {
                super.save(this.props.tables.name.name, {
                    type: index,
                    value: parameters[nameType]
                });
            }
        });

        return 'Saved it!';
    }
}
