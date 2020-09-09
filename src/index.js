"use strict"

let promisify = require('bluebird').promisify
let path = require('path')
let swig = require('swig')
let anuncios = require('./conteudo').anuncios
let qtAnuncios = anuncios.length
let themeName = require('../package').name

let anuncioAtual = -1;
function proximoAnuncio(){
	anuncioAtual++;
	return anuncioAtual % qtAnuncios
}

module.exports = {
	hooks: {
		'init': function(){
			let sizeOf = require('image-size')
			anuncios = Promise.all(anuncios.map(anuncio => {
				return new Promise((resolve, reject)=>{
					sizeOf(path.join(__dirname, `../src/assets/imagens/${anuncio.icone}_2x.png`), (err, dimensions) =>{
						if(err){
							console.error(err)
							reject(err)
						} else {
							anuncio['icone_width'] = (dimensions.width / 2).toFixed(2)
							anuncio['icone_height'] = (dimensions.height / 2).toFixed(2)
							resolve(anuncio)
						}
					})
				})
			}))
			.then(anuncios => {
				let apostilaSpecificContent = {}
				let anuncioOpts = this.options.pluginsConfig["caelum-anuncios"] || {}
				let caelumSiteUrlCurso = this.options.pluginsConfig['caelum-tema'].caelumsite_url_curso || "<b>URL</b>";
				apostilaSpecificContent['nome'] = anuncioOpts.nome || this.options.title
				apostilaSpecificContent['sigla'] = anuncioOpts.codigoCurso || this.options.bookCode
				apostilaSpecificContent['sobre'] = anuncioOpts.about || "<b>SOBRE</b>"
				apostilaSpecificContent['url'] = anuncioOpts.url || caelumSiteUrlCurso.replace(/https?:?\/\//g, '')

				return anuncios.map(anuncio => {
					return Object.keys(anuncio).reduce((anuncioParseado, prop)=>{
						anuncioParseado[prop] = swig.render(anuncio[prop], {
							locals: apostilaSpecificContent,
							autoescape: false
						})
						return anuncioParseado
					}, {})
				})
			})
			.then(anuncios => {
				let buildType = this.options.generator
				let assetsPath = {
					ebook: ``
					,site: `..`
				}[buildType]
				return anuncios.map(anuncio => {
					anuncio['assets_path'] = path.join(assetsPath, 'gitbook', 'plugins', themeName)
					return swig.compileFile(path.join(__dirname, '../src/templates/anuncio.html'), {autoescape: false})(anuncio)
				})
			})
		},
		'page': function(page) {
			return anuncios.then(anuncios => {
				page.sections = page.sections.map((section, index)=>{
					let titleRegex = /<h2.*?>.*?<\/h2>/g
					let titles = section.content.match(titleRegex) || []
					section.content = section.content.split(titleRegex).reduce((last, current, index)=>{
						return last + (titles[index-1] || "") + current + (index%3 == 1 && anuncios[proximoAnuncio()] || '')
					}, "")
					return section
				})
				return page
			})
		}
	}
	,book: {
		assets: './src/assets',
		css: [
			'anuncio.css'
		]
	}
	,ebook: {
		assets: './src/assets',
		css: [
			'anuncio.css'
		]
	}
}
