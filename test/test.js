#!/usr/bin/env node
"use strict"

let args = require('minimist')(process.argv.slice(2), {
   string: ['apostila','type']
	,default: {
		type: 'pdf'
	}
})

let tubaina2 = require('./tubaina2')
tubaina2.apostilaPath = args.apostila
tubaina2.type = args.type
tubaina2.plugins = ['caelum-anuncios']

const watch = require('glob-watcher')
const bs = require('browser-sync').create()
const promisify = require('bluebird').promisify
let build = tubaina2.build()

if(args.type === 'html'){
	build.then(apostila => {
		let initServer = promisify(bs.init)({
			server: [apostila.buildPath, apostila.plugin.assets.path]
			,rewriteRules: [{
			match: /gitbook\/plugins\/gitbook-plugin-caelum-anuncios\/(.*\.css)/g,
			replace: "$1"
			}]
		})
		initServer.then(()=>{
			watch([apostila.plugin.scripts.glob, apostila.plugin.templates.glob, 'package.json'], ()=>{
				bs.notify(`Rebuildando apostila`, 20000)
				return tubaina2.build().then(bs.reload)
			})
			watch(apostila.plugin.assets.glob).on('change', path => bs.reload(path))
		})
	})
	.then(()=>console.log("Browser will reload when necessary"))
} else {
	build.then(apostila => {
		watch([apostila.plugin.scripts.glob, apostila.plugin.templates.glob, apostila.plugin.assets.glob, 'package.json'], ()=>{
			console.log(`Rebuildando apostila`)
			return tubaina2.build().then(()=>console.log(`Open ${apostila.buildPath} file to see changes`))
		})
	})
}

build.catch(e => console.error(e))	
