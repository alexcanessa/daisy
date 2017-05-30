import Intent from './Intent';
import ip from 'ip';

const defaults = {};

export default class IP extends Intent {
    constructor(properties = {}) {
        super([properties, defaults]);

        delete this.db;
    }

    /**
     * Get the IP
     *
     * @return {String}
     */
    getIP() {
        return `Your IP is ${ip.address()}`;
    }
}
