const readline = require('readline-sync')
const robots = {
	text: require('./robots/text.js')
}

async function start() {
	const content = {
		maximumSentences: 7
	}

	content.searchTerm = askAndReturnSearchTerm()
	content.prefix = askAndReturnPrefix()

	await robots.text(content)

	function askAndReturnSearchTerm() {
		return readline.question('Digite um termo de pesquisa da Wikipedia: ')
	}
	
	function askAndReturnPrefix() {
		const prefixes = ['Quem e', 'O que e', 'A historia de']
		const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Escolha uma alternativa: ')
		const selectedPrefixText = prefixes[selectedPrefixIndex]

		return selectedPrefixText
	}

	console.log(JSON.stringify(content, null, 4))
}
start()