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

	var sizeOf = require('image-size')
	anuncios = Promise.all(anuncios.map(anuncio => {
		return new Promise((resolve, reject)=>{
			sizeOf(path.join(__dirname, `../theme/assets/imagens/${anuncio.icone}_2x.png`), (err, dimensions) =>{
				if(err){
					console.error(err)
					reject(err)
				} else {
					anuncio['icone_width'] = dimensions.width / 2
					anuncio['icone_height'] = dimensions.height / 2
					resolve(anuncio)
				}
			})
		})
	})).then(anuncios => {
		return Promise.all(anuncios.map(anuncio=>{
			let template = swig.compileFile(path.join(__dirname, '../theme/templates/anuncio.html'))
			anuncio['theme_path'] = `../gitbook/plugins/${themeName}`
			var output = template(anuncio)
			return output
		}))
	})

	module.exports = {
	  hooks: {
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
	}
} catch(e){
	console.log(e)
	throw new Error(e)
}
