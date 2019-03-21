const algorithmia = require('algorithmia') //importando o modulo deles pro bot
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')

var nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api'
})

async function robot(content){
    await BuscaWikipedia(content)
    LimparConteudo(content)
    QuebrarSentencas(content)
    limitMaximumSentences(content)
    await BuscaKeywordsOfAllSentences(content)

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
                keywords: [],
                images: []
            })
        })
    }

    function limitMaximumSentences(content){
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function BuscaKeywordsOfAllSentences(content) {
        for (const sentence of content.sentences) {
          sentence.keywords = await BuscaWatsonERetornaKeywords(sentence.text)
        }
      }
    
    async function BuscaWatsonERetornaKeywords(sentence){
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if (error) {
                    throw error
                }

                const keywords = response.keywords.map((keyword) => {
                    return keyword.text
                })

                resolve(keywords)
            })
        })
    }
}
module.exports = robot