"use strict"
const path = require('path')

const exec = require('./exec')

module.exports = {
	apostilaPath: undefined
	,type: undefined
	,plugins: []
	,build(){
		let courseCode
		let pluginSrc
		try {
			courseCode = path.basename(this.apostilaPath)
			pluginSrc = './src'
		} catch(e) {
			return Promise.reject("O tipo de apostila não existe")
		}

		return exec('npm install -g ./')
        		.then(()=>{
        			console.log(`[watch][STARTED] ${this.type} build`)
        			return exec(`tubaina2 --native --${this.type} --plugins ${this.plugins.join(",")}`, {cwd: this.apostilaPath})
        		})
        		.then(()=>{
		        	console.log(`[watch][FINISHED] ${this.type} build`)
		        	return {
						type: this.type
						,buildPath: path.join(this.apostilaPath, '.build/_book')
			        	,plugin: {
				        	scripts: {
								glob: path.join(pluginSrc, "*.js")
							}
				        	,templates: {
								path: path.join(pluginSrc, "templates")
								,glob: path.join(pluginSrc, "templates/**/*.html")
							}
				        	,assets: {
								path: path.join(pluginSrc, "assets")
								,glob: path.join(pluginSrc, "assets/**/*")
							}
			        	}
		        	}
        		})
				.catch(e => console.error(e))
	}
}
