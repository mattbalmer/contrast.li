const MockAlbumData = {
  abc: {
    id: 'abc',
    title: 'Images - Originals',
    images: Array.from({ length: 4 }, () => ({
      title: 'The Colosseum',
      link: `/images/original.jpg`,
      description: 'This is an original image.'
    }))
  },
  def: {
    id: 'def',
    title: 'Images - Edits',
    images: Array.from({ length: 4 }, () => ({
      title: null,
      link: `/images/edit.jpg`,
      description: null
    }))
  }
};

function mockDataHandler(req, res) {
  let id = req.params.id;
  res
    .status(200)
    .set('Content-Type', 'application/json')
    .send(JSON.stringify({
      data: MockAlbumData[id]
    }))
}

module.exports = mockDataHandler;