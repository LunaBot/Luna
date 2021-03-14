const fs = require('fs');
const path = require('path');
const generify = require('generify');
const { paramCase } = require('change-case');

function onData(file) {
	console.debug('Generating %s', file);
}

function done(err) {
	if (err) {
		console.log(err);
	} else {
		console.log('Done!');
	}
}

const generators = {
	// ./index.js module <moduleName>
	module(options) {
		// Bail if the user didn't provide a module name
		if (!options.moduleName) {
			throw new Error('Please provide a module name!');
		}

		// Bail if the module name is invalid
		if (!options.moduleName.match(/^[a-z]+$/)) {
			throw new Error(`Invalid module name "${options.moduleName}", only lowercase letters are allowed!`);
		}

		// Get the destination
		const destination = path.join(__dirname, '..', 'src', 'modules', options.moduleName);

		// Bail if it already exists
		if (fs.existsSync(destination)) {
			throw new Error(`There's an existing module in ${destination}`);
		}

		// Get module template
		const source = path.join(__dirname, './templates/module');
		const data = {
			Modulename: options.moduleName,
			modulename: options.moduleName,
			transforms: {
				Modulename: data => data.toLowerCase(),
				modulename: data => data.substring(0, 1).toUpperCase() + data.substring(1).toLowerCase()
			}
		};

		// Generate files
		generify(source, destination, data, onData, done);
	},
	// ./index.js <moduleName> <commandName>
	command(options) {
		// Bail if the user didn't provide a module name
		if (!options.moduleName) {
			throw new Error('Please provide a module name!');
		}

		// Bail if the module name is invalid
		if (!options.moduleName.match(/^[a-z]+$/)) {
			throw new Error(`Invalid module name "${options.moduleName}", only lowercase letters are allowed!`);
		}

		// Get the module directory
		const moduleDirectory = path.join(__dirname, '..', 'src', 'modules', options.moduleName);

		// Bail if it already exists
		if (!fs.existsSync(moduleDirectory)) {
			throw new Error(`I can't find a module called ${options.moduleName}`);
		}

		// Bail if the user didn't provide a command name
		if (!options.commandName) {
			throw new Error('Please provide a command name!');
		}

		// Bail if the command name is invalid
		if (!options.commandName.match(/^[-0-9a-z]+$/)) {
			throw new Error(`Invalid command name "${options.commandName}", only lowercase letters, numbers and hypens are allowed!`);
		}

		// Get the destination
		const destination = path.join(__dirname, '..', 'src', 'modules', options.moduleName, 'commands');

		// Bail if it already exists
		if (fs.existsSync(path.join(destination, options.commandName, '.ts'))) {
			throw new Error(`There's an existing command in ${destination}`);
		}

		// Get commands template
		const source = path.join(__dirname, './templates/commands');
		const data = {
			Modulename: options.moduleName,
			modulename: options.moduleName,
			'module-name': options.moduleName,
			Commandname: options.commandName,
			commandname: options.commandName,
			'command-name': options.commandName,
			transforms: {
				Modulename: data => data.substring(0, 1).toUpperCase() + data.substring(1).toLowerCase(),
				modulename: data => data.toLowerCase(),
				'module-name': data => paramCase(data),
				Commandname: data => data.substring(0, 1).toUpperCase() + data.substring(1).toLowerCase(),
				commandname: data => data.toLowerCase(),
				'command-name': data => paramCase(data)
			}
		};

		// Generate files
		generify(source, destination, data, onData, done);
	}
};

const options = {
	moduleName: process.argv[2],
	commandName: process.argv[3]
};

const main = async () => {
	// Command generator
	if (options.commandName) {
		await generators.command(options);
		return;
	}

	// Module generator
	if (options.moduleName) {
		await generators.module(options);
	}
};

// Kick things off
main().catch(error => {
	console.error(error.message);
	process.exit(1);
});
