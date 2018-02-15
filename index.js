#!/usr/bin/env node
"use strict";

const { load, dump } = require("js-yaml");
const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

const FILENAME = join(process.env.PWD, `manifest.yml`);
const CONTENT = readFileSync(FILENAME);
const MANIFEST_YML = load(CONTENT);
const APPS = MANIFEST_YML.applications.slice(0);
delete MANIFEST_YML.applications;

const DEPLOYMENT_APPS = process.argv.slice(2);

if (!DEPLOYMENT_APPS.length) {
	console.error("Expected at least one argument [app-name-from-manifest]")
	process.exit(1);
}

DEPLOYMENT_APPS.forEach(createManifestForAppName);

function createManifestForAppName (appName) {
	const WRITE_FILE_PATH = join(process.env.PWD, `manifest-${appName}.yml`);
	const APP = APPS.find(appEntry => appEntry.name === appName);

	for (const key in APP) {
		if (!Array.isArray(APP[key])) continue;

		APP[key] = APP[key].concat(MANIFEST_YML[key]);
		// APP[key] = [...new Set(APP[key])]
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

	writeFileSync(WRITE_FILE_PATH, YML_FILE_CONTENT);

	console.info(`Wrote new file ${WRITE_FILE_PATH}`);
}
