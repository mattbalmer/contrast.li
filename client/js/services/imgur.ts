import http, { HttpResponse }  from 'utils/http';

function parseId(string: string) {
  let m = string.match(/a\/(.*)/);
  return m && m[1] ? m[1] : string;
}

function requestAlbumImages(sources) {
  let ids: Array<string> = sources.map(s => parseId(s));
  let requests: Array<Promise<HttpResponse>> = ids.map((id: string) => {
    return http.get(`/album/${id}`, {});
  });

  return Promise.all(requests)
    .then((responses) => {
      return responses.map((res: HttpResponse) => {
        if(res.status == 200) {
          return JSON.parse(res.body).data;
        } else {
          return {
            title: null,
            images: []
          };
        }
      });
    })
}

export default {
  requestAlbumImages
}