import ObjectAssign from 'object-assign-deep';
import ObjectDeepFreeze from 'deep-freeze';
import colors from 'colors';
import { exec } from 'child_process';

const defaults = {
    tables: {},
    schemas: {}
};

export default class Intent {
    constructor(members = []) {
        const [properties] = members;
        this.props = ObjectAssign({}, defaults, ...members);
        this.db = properties.db;

        delete this.props.db;

        ObjectDeepFreeze(this.props);

        this._createDatabaseTables();
    }

    /**
     * Create the tables for the intent
     *
     * @private
     * @since 0.1.0
     */
    _createDatabaseTables() {
        Object.keys(this.props.tables).forEach(table => {
            const { name, value } = this.props.tables[table];

            if (!this.props.schemas[name]) {
                this.reset(table);

                return;
            }

            this.db.push(`${name}/`, this._copy(value), false);
        });
    }

    /**
     * Check that an entry follows the given schema
     *
     * @private
     * @since 0.1.0
     *
     * @param  {Object} schema
     * @param  {Object} entry
     *
     * @return {Boolean}
     */
    _checkSchema(schema, entry, table) {
        return Object.keys(entry).every(property => {
            const entryProperty = !isNaN(entry[property]) ? parseFloat(entry[property]) : entry[property];
            const isValid = typeof schema[property] !== 'undefined';
            const assumtions = [
                isValid && typeof entryProperty === schema[property].type,
                isValid && !(typeof schema[property].type === 'object' && !this._checkSchema(schema[property].schema, entryProperty, table)),
                isValid && !(schema[property].unique && this.getBy(table, property, entry[property]).length)
            ];

            return assumtions.every(Boolean);
        }) && Object.keys(schema).every(property => !(schema[property].required && typeof entry[property] === 'undefined'));
    }

    /**
     * Copy an Object or an array
     *
     * @private
     * @since 0.1.0
     *
     * @param  {Object|Array} object
     *
     * @return {Object|Array}
     */
    _copy(object) {
        return JSON.parse(JSON.stringify(object));
    }

    /**
     * Reset a specific table from the database
     *
     * @public
     * @since 0.1.0
     *
     * @param  {String} table The key of the tables object of the instance
     */
    reset(table) {
        const { name, value } = this.props.tables[table];

        this.db.delete(name);
        this.db.push(`${name}/`, this._copy(value));
    }

    /**
     * Save a value in a table
     *
     * @public
     * @since 0.1.0
     *
     * @param  {String} table
     * @param  {Object} value
     *
     * @return {Object}
     */
    save(table, value) {
        if (!this._checkSchema(this.props.schemas[table], value, table) || !this.props.schemas[table]) {
            return false;
        }

        this.db.push(`${table}[]`, value);

        return this.db.getData(`${table}`).length - 1;
    }

    /**
     * Delete an entry from a table, based on the id
     *
     * @public
     * @since 0.1.0
     *
     * @param  {String} table
     * @param  {[type]} id
     *
     * @return {Boolean}
     */
    delete(table, id) {
        if (!this.props.schemas[table]) {
            return false;
        }

        return this.db.delete(`${table}[${id}]`);
    }

    /**
     * Update an entry property with a new value
     *
     * @public
     * @since 0.1.0
     *
     * @param  {String} table
     * @param  {Number} id
     * @param  {String} property
     * @param  {*} value
     *
     * @return {Number}
     */
    update(table, id, property, value) {
        if (!this.props.schemas[table]) {
            return false;
        }

        const entry = this.get(table, id);

        entry[property] = value;

        this.db.push(`${table}[${id}]`, entry);

        return id;
    }

    /**
     * Get an entry by a property value
     *
     * @public
     * @since 0.1.0
     *
     * @param  {String} table
     * @param  {String} property
     * @param  {*} value
     *
     * @return {Array}
     */
    getBy(table, property, value) {
        if (!this.props.schemas[table]) {
            return [];
        }

        return this.db.getData(table).filter(entry => entry[property] === value);
    }

    /**
     * Get the ID of a table entry
     *
     * @public
     * @since 0.1.0
     *
     * @param  {String} table
     * @param  {Object} entry
     *
     * @return {Number}
     */
    getID(table, entry) {
        return this.db.getData(table).indexOf(entry);
    }

    /**
     * Get an entry of a table by ID
     *
     * @public
     * @since 0.1.0
     *
     * @param  {String} table
     * @param  {Number} id
     *
     * @return {Array}
     */
    get(table, id) {
        if (id === undefined) {
            return this.db.getData(table);
        }

        return this.db.getData(`${table}[${id}]`);
    }

    /**
     * Execute a command in the bash and run a callback
     *
     * @public
     * @since 0.1.0
     *
     * @param  {string}   command The command to execute
     * @param  {Function} callback The callback which returns the stdout
     *
     * @return {Promise}
     */
    executeCommand(command, callback) {
        return new Promise((resolve, reject) => {
            exec(command, (err, stdout, stderr) => {
                if (err || stderr) {
                    reject(err || stderr);
                } else {
                    resolve(stdout.replace('\n', ''));
                }
            });
        })
            .then(callback)
            .catch((error) => {
                throw new Error(colors.red(error));
            });
    }
}
