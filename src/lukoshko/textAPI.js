import { List, Set, Map } from 'immutable';

const TOKEN = 'wqoQbdovWC4KjqD7PA8B'

const getTextsFromText = async (limit, text=null) => {
    const formData = new FormData();

    formData.append('token', TOKEN)
    formData.append('action', 'text_search')
    formData.append('limit', limit)
    // formData.append('with_embeddings', 'False')
    if (text !== null) {
        formData.append('text', text)
    } 
    else {
        alert("Ошибка: Нет текста")
        return;
    }

    try {
        const response = await fetch('http://9e94093f8750.sn.mynetname.net:5000/', {
            method: 'POST',
            body: formData
        });
        let result = await response.json();
        console.log(result)

        let data = {}
        result.forEach((d, i) => {
            const frameId = d.post_url.replace("https://", "") + "/" + d.comment_id
            console.log(frameId)
            const key = frameId
            const frame = Map({
                key: frameId,
                type: 'text',
                comment_id: d.comment_id,
                user_id: d.user_id,
                username: d.username,
                text: d.text,
                post_account: d.post_account,
                date: new Date(d.created_at),
                url: d.post_url,
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

export default getTextsFromText;