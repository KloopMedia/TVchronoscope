import { List, Set, Map } from 'immutable';

const TOKEN = 'wqoQbdovWC4KjqD7PA8B'

const getTextsFromEmbed = async (radius, sentences=null) => {
    const formData = new FormData();

    formData.append('token', TOKEN)
    formData.append('action', 'text_range_search')
    formData.append('radius', radius)
    // formData.append('with_embeddings', 'False')
    if (sentences !== null) {
        formData.append('sentences', sentences)
    } 
    else {
        alert("Ошибка: Нет текста")
        return;
    }

    try {
        const response = await fetch('https://lukoshkoapi.kloop.io/', {
            method: 'POST',
            body: formData
        });
        let result = await response.json();
        console.log(result)

        let data = {}
        Object.values(result[0].metadata).forEach((d, i) => {
            const key = d.post_id + '/' + d.clean_sentence
            const frame = Map({
                key: key,
                type: 'embed',
                id: d.post_id,
                distance: d.distance,
                clean_sentence: d.clean_sentence,
                text: d.post_text,
                sentence: d.sentence,
                date: new Date(d.post_date),
                tags: Set([]),
                negtags: Set([])
            })
            data[key] = frame
        })

        return Map(data)

    } catch (error) {
        alert('Пожалуйста убедитесь, что на фото есть одно лицо, и что ваше Интернет-соединение стабильно.', error)
        return Map({})
    }
}

export default getTextsFromEmbed;