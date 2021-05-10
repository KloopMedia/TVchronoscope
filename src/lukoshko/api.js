import { List, Set, Map } from 'immutable';

const TOKEN = 'wqoQbdovWC4KjqD7PA8B'

const getImgsFromImg = async (radius, img=null, urls=null) => {
    const formData = new FormData();
    console.log(urls)

    formData.append('top_k', radius)
    formData.append('meta_with_embeddings', 'False')
    formData.append('table', 'ktrk')
    if (img === null) {
        formData.append('urls', urls)
    } else {
        formData.append('files', img, 'image.jpg');
    }
    // formData.append('urls', ['https://kloopstorage.blob.core.windows.net/activ-sync/KTRK/Time-2020-07-01_15.10-KTRK2020-07-0115-10.ts/1000200.jpg', 'https://kloopstorage.blob.core.windows.net/activ-sync/KTRK/Time-2020-07-01_15.10-KTRK2020-07-0115-10.ts/1000200.jpg'])

    console.log(formData)

    try {
        const response = await fetch('https://lukoshkoapi.kloop.io/api/v1/image_range_search/', {
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