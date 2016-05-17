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

const bs = require('browser-sync').create()
const promisify = require('bluebird').promisify
tubaina2.build()
	.then(apostila => {
		return promisify(bs.init)({
			       server: [apostila.buildPath, apostila.src.themePath+'/assets']
			       ,rewriteRules: [{
	             match: /gitbook\/plugins\/gitbook-plugin-caelum-anuncios\/(.*\.css)/g,
	             replace: "$1"
		         }]
		       })
		       .then(() => apostila)
	})
	.then(apostila => {
		let watch = require('glob-watcher')
		watch([apostila.src.templatesPath, 'package.json', 'src/**/*.js'], ()=>{
			bs.notify(`Rebuildando apostila`, 20000)
			return tubaina2.build().then(bs.reload)
		})
		watch(apostila.src.stylesPath).on('change', path => bs.reload(path))
	})
	.catch(e => console.error(e))
