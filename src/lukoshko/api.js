import { List, Set, Map } from 'immutable';

const TOKEN = 'wqoQbdovWC4KjqD7PA8B'

const getImgsFromImg = async (radius, img=null, urls=null) => {
    const formData = new FormData();

    formData.append('token', TOKEN)
    formData.append('action', 'faiss_search')
    formData.append('radius', radius)
    formData.append('with_embeddings', 'False')
    if (img === null) {
        formData.append('urls', urls)
    } else {
        formData.append('file1', img, 'image.jpg');
    }

    console.log(formData)

    try {
        const response = await fetch('https://lukoshkoapi.kloop.io/', {
            method: 'POST',
            body: formData
        });
        let result = await response.json();
        console.log(result)

        let data = {}
        Object.values(result[0].metadata).forEach((v, i) => {
            const frameId = (v.file_path.split("/")[3] +
                "/" +
                v.file_path.split("/")[4].replace(":", ".") +
                "/" +
                v.frame_index.toString())
            const box = JSON.parse(v.object_box)
            const key = frameId + '_' + box.join('_')
            const img = Map({
                key: key,
                type: 'image',
                date: new Date(v.appearance_time),
                box: JSON.parse(v.object_box),
                url: ("https://kloopstorage.blob.core.windows.net/activ-sync/" +
                    frameId + ".jpg"),
                distance: v.distance,
                tags: Set([]),
                negtags: Set([])
            })
            data[key] = img
        })

        return Map(data)

    } catch (error) {
        alert('Пожалуйста убедитесь, что на фото есть одно лицо, и что ваше Интернет-соединение стабильно.', error)
        return Map({})
    }
}

export default getImgsFromImg;