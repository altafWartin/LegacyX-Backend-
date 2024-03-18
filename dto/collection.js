class CollectionDto {
  constructor(collection) {
    if (collection) {
      this.id = collection?._id;
      this.name = collection?.name;
      this.createdBy = collection?.author?.username;
      this.userId = collection?.author?._id;
      this.collectiondAt = collection?.createdAt;
    }
  }
}
module.exports = CollectionDto;
