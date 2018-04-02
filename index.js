#!/usr/bin/env node
"use strict";

const { load, dump } = require("js-yaml");
const { readFileSync, writeFile } = require("fs");
const { join } = require("path");
const yargs = require("yargs");

const argv = yargs.usage("Usage: $0 --in [path] --out [path]")
	.demandOption([])
	.example("$0 --in ./ --out ./bin")
	.alias("o", "out")
	.describe("o", "Directory in which to write manifest files")
	.alias("i", "in")
	.describe("i", "Directory from which to read manifest files")
	.help("h")
	.alias("h", "help")
	.default({ i: "./", o: "./" })
	.argv;

const FILENAME = join(process.env.PWD, argv.i, `manifest.yml`);
const CONTENT = readFileSync(FILENAME);
const MANIFEST_YML = load(CONTENT);
const APPS = MANIFEST_YML.applications.slice(0);
delete MANIFEST_YML.applications;

if (!APPS.length) {
	console.error("manifest.yml apparently does not have any apps listed");
	return process.exit(1);
}

APPS.filter(({ name }) => name !== "THIS_SHOULD_NOT_BE_DEPLOYED")
	.forEach(createManifestForAppName);

function createManifestForAppName (APP) {
	const { name } = APP;
	const WRITE_FILE_PATH = join(process.env.PWD, argv.o, `manifest-${name}.yml`);

	for (const key in APP) {
		if (!Array.isArray(APP[key])) continue;

		APP[key] = APP[key].concat(MANIFEST_YML[key]);
	}

	const YML_COPY = {
		applications: [
			Object.assign({
				name: APP.name
			},
			MANIFEST_YML,
			APP)
		]
	};



	const YML_FILE_CONTENT = dump(YML_COPY);

	return writeFile(WRITE_FILE_PATH, YML_FILE_CONTENT, "utf-8", wroteFile);

	function wroteFile (err) {
		if (err) {
			console.error(`Encountered error writing ${WRITE_FILE_PATH}\n${err.stack}`);
			if (process.argv[2].includes("fail=true")) {
				process.exit(1);
			}
		} else {
			console.info(`Wrote new file ${WRITE_FILE_PATH}`)
		}
	}
}
