const readline = require('readline-sync')

function start() {
	const content = {}

	content.searchTerm = askAndReturnSearchTerm()
	content.prefix = askAndReturnPrefix()

	function askAndReturnSearchTerm() {
		return readline.question('Digite um termo de pesquisa da Wikipedia: ')
	}
	function askAndReturnPrefix() {
		const prefixes = ['Quem e', 'O que e', 'A historia de']
		const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Escolha uma alternativa: ')
		const selectedPrefixText = prefixes[selectedPrefixIndex]

		return selectedPrefixText
	}

	console.log(content)
}
start()