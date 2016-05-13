"use strict"

module.exports = {
  hooks: {
    'page': function(page) {
			page.sections = page.sections.map((section, index)=>{
				let titleRegex = /<h2.*?>.*?<\/h2>/g
				let titles = section.content.match(titleRegex)
				section.content = section.content.split(titleRegex).reduce((last, current, index)=>{
					return last + titles[index] + current + (index%3 == 1 && "<strong>Anuncio</strong>" || "")
				}, "")
				return section
			})
			return page
    }
  }
};
