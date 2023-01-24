type ngramTypes = {}

export const makeNgrams = (names: string[], order: number) => {
    let ngrams: Record<string, string[]> = {}
    let beginnings = []

    for (let j = 0; j < names.length; j++) {
        let txt = names[j].toLowerCase()
        for (let i = 0; i <= txt.length - order; i++) {
            let gram = txt.substring(i, i + order)
            if (i == 0) {
                beginnings.push(gram)
            }

            if (!ngrams[gram]) {
                ngrams[gram] = []
            }
            ngrams[gram].push(txt.charAt(i + order))
        }
    }

    return { ngrams: ngrams, beginnings: beginnings }
}

export const generateNames = (beginnings: string[], ngrams: Record<string, string[]>, order: number) => {
    let currentGram = beginnings[Math.floor(beginnings.length * Math.random())]
    let result = currentGram

    for (let i = 0; i < 8; i++) {
        let possibilities = ngrams[currentGram]
        if (!possibilities) {
            break
        }
        let next = possibilities[Math.floor(possibilities.length * Math.random())]
        result += next
        let len = result.length
        currentGram = result.substring(len - order, len)
    }

    return result
}
