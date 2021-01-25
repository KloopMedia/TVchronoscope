import { List, Set, Map } from 'immutable';

const TOKEN = 'wqoQbdovWC4KjqD7PA8B'

const getTextsFromText = async (limit, text=null, table) => {
    const formData = new FormData();

    formData.append('limit', limit)
    formData.append('table', table)

    if (text !== null) {
        formData.append('text', text)
    } 
    else {
        alert("Ошибка: Нет текста")
        return;
    }

    try {
        const response = await fetch('https://lukoshkoapi.kloop.io/text_search', {
            method: 'POST',
            body: formData
        });
        let result = await response.json();
        console.log(result)

        let data = {}
        await result.forEach((d, i) => {
            let key = d.faiss_index.toString()
            console.log(key)
            const frame = Map({
                key: key,
                type: 'text',
                text: d.post_text,
                account: d.account,
                sentence: d.sentence,
                comments_count: d.comments_count,
                clean_sentence: d.clean_sentence,
                post_id: d.post_id,
                post_img_files: d.post_img_files,
                post_img_urls: d.post_img_urls,
                likes_count: d.likes_count,
                date: new Date(d.post_date),
                post_tags: d.post_tags,
                tags: Set([]),
                negtags: Set([])
            })
            data[key] = frame
        })

        return Map(data)

    } catch (error) {
        alert('Пожалуйста убедитесь, что на фото есть одно лицо, и что ваше Интернет-соединение стабильно.', error)
        console.log(error)
        return Map({})
    }
}

export default getTextsFromText;