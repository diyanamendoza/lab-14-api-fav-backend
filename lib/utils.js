
function editedYelpData(body) {
  return body.map(entry => {
    const container = {};
    container['name'] = entry.name;
    container['image'] = entry.image_url;
    container['rating'] = entry.rating;
    container['url'] = entry.url;
    return container;
  });
}

module.exports = {
  editedYelpData
};
