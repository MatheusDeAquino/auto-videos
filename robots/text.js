const algorithmia = require('algorithmia') //importando o modulo deles pro bot
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content){
    await BuscaWikipedia(content)
    LimparConteudo(content)
    QuebrarSentencas(content)

    async function BuscaWikipedia(content) {
        const algorithmiaAutenticada = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAutenticada.algo('web/WikipediaParser/0.1.2') //link no site deles. Aba node JS
        const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponde.get()   
        
        content.sourceContentOriginal = wikipediaContent.content
    }

    function LimparConteudo(content){
        const semBlankLinesEmarcador = tirarBlankLinesEmarcador(content.sourceContentOriginal)
        const semDatasEmParenteses = removeDatasEmParenteses(semBlankLinesEmarcador)
        console.log(semDatasEmParenteses)

        content.sourceContentLimpo = semDatasEmParenteses

        function tirarBlankLinesEmarcador(text){
            const todasLinhas = text.split('\n')

            const semBlankLinesEmarcador = todasLinhas.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })

            return semBlankLinesEmarcador.join(' ') //Juntar o texto e espaçar com o ' '
        }
    }

    function removeDatasEmParenteses(text){
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }

    function QuebrarSentencas(content){
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentLimpo)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywwords: [],
                images: []
            })
        })
    }
}
module.exports = robot