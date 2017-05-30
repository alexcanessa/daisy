#!/usr/bin/env node

import prompt from 'prompt';
import colors from 'colors';
import Daisy from './Daisy';

// Create a prompt to create the configuration.

const daisy = new Daisy({
    daisyToken: process.env.DAISY_TOKEN,
    googleApiKey: process.env.GOOGLE_API_KEY,
    googleCX: process.env.GOOGLE_CX
});

prompt.message = colors.blue('You:');
prompt.delimiter = '';

function prompIt() {
    prompt.start();

    prompt.get({
        properties: {
            message: {
                description: '.'
            }
        }
    }, (err, result) => {
        if (err) {
            return;
        }

        daisy.send(result.message)
            .then(response => {
                console.log(daisy.speak(response.message));

                response.intentMessage && console.log(daisy.speak(response.intentMessage));
                !response.end && prompIt();
            })
            .catch(error => {
                console.log(error);
                prompIt();
            });
    });
}

prompIt();
