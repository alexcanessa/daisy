import {assert} from 'chai';
import Intent from '../src/intents/Intent';
import JsonDB from 'node-json-db';
import fs from 'fs';

const dbName = 'test/test-db';
const properties = {
	tables: {
		food: {
			name: '/test/food',
			value: []
		},
        wine: {
            name: '/test/wine',
            value: []
        }
	},
	schemas: {
		'/test/food': {
			name: {
				type: 'string',
				required: true,
                unique: true
			},
			cousine: {
				type: 'string'
			},
			calories: {
				type: 'number'
			}
		},
        '/test/wine': {
            name: {
                type: 'string',
                required: true
            }
        }
	},
	db: new JsonDB(dbName, true, false)
};

const intent = new Intent([properties]);
const foodTable = intent.props.tables.food.name;
let entry = {};
let id = null;

beforeEach(() => {
    intent.reset('food');

    entry = {
        name: 'pasta',
        cousine: 'italian'
    };
    id = intent.save(foodTable, entry);
});

describe('src/intents/Intent.js', () => {
	it('Should create the database with the tables', () => {
		assert(fs.existsSync(`${dbName}.json`), 'The file exists');
	});

	it('Should save a new entry', () => {
        assert(id !== false && intent.get(foodTable, id), 'Entry without non-required fields');
        const newID = intent.save(foodTable, {
            name: 'hummus',
            cousine: 'lebanise',
            calories: 300
        });
        assert(intent.get(foodTable, newID), 'Entry with number type field');
    });

    it('Should not save a new entry', () => {
        const required = intent.save(foodTable, {
            cousine: 'italian'
        });
        assert(required === false, 'Entry without required fields');

        const wrongType = intent.save(foodTable, {
            name: 'banana',
            cousine: 123
        });
        assert(wrongType === false, 'Entry wrong type of fields');

        const extraData = intent.save(foodTable, {
            name: 'lasagna',
            cousine: 'italian',
            carbs: 123
        });
        assert(extraData === false, 'Entry with extra fields');

        const unique = intent.save(foodTable, {
            name: 'pasta',
            cousine: 'italian'
        });
        assert(unique === false, 'Entry with already used unique field');
    });

    it('Should edit an existing item', () => {
        assert(intent.get(foodTable, id).name === 'pasta', 'The name of the entry is the set one');

        intent.update(foodTable, id, 'name', 'spaghetti');
        assert(intent.get(foodTable, id).name === 'spaghetti', 'The name of the entry changed');
    });

    it('Should delete an entry', () => {
        intent.delete(foodTable, id);
        assert(intent.db.getData(foodTable).length === 0, 'The entry has been deleted');
    });

    it('Should get an entry', () => {
        const entries = intent.getBy(foodTable, 'name', 'pasta');
        assert(entries.length > 0, 'It returns the array of found items');
    });
});
