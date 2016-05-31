"use strict"
try{
	let promisify = require('bluebird').promisify
	let path = require('path')
	let swig = require('swig')
	let anuncios = require('../theme/conteudo').anuncios
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
				var sizeOf = require('image-size')
				anuncios = Promise.all(anuncios.map(anuncio => {
					return new Promise((resolve, reject)=>{
						sizeOf(path.join(__dirname, `../theme/assets/imagens/${anuncio.icone}_2x.png`), (err, dimensions) =>{
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
					apostilaSpecificContent['nome_apostila'] = this.options.title
					apostilaSpecificContent['sigla_curso'] = this.options.bookCode
					apostilaSpecificContent['meta.sobre'] = "<b>SOBRE</b>"
					apostilaSpecificContent['nome_apostila'] = "<b>NOME APOSTILA</b>"
					apostilaSpecificContent['meta.url_curso'] = "<b>URL CURSO</b>"
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
					return anuncios.map(anuncio=>{
						anuncio['theme_path'] = `../gitbook/plugins/${themeName}`
						return swig.compileFile(path.join(__dirname, '../theme/templates/anuncio.html'), {autoescape: false})(anuncio)
					})
				})
			},
			'page': function(page) {
				return anuncios.then(anuncios=>{
					page.sections = page.sections.map((section, index)=>{
						let titleRegex = /<h2.*?>.*?<\/h2>/g
						let titles = section.content.match(titleRegex)
						section.content = section.content.split(titleRegex).reduce((last, current, index)=>{
							return last + titles[index] + current + (index%3 == 1 && anuncios[proximoAnuncio()] || '')
						}, "")
						return section
					})
					return page
				})
			}
		}
		,book: {
			assets: './theme/assets',
			css: [
				'anuncio.css'
			]
		}
		,ebook: {
			assets: './theme/assets',
			css: [
				'anuncio.css'
			]
		}
	}
} catch(e){
	console.log(e)
	throw new Error(e)
}
