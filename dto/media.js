class MediaDTO {
  constructor(media) {
    if (media) {
      this.id = media?._id;
      this.path = media.path;
      this.url = media?.url;
      this.name = media?.name;
      this.visibility = media?.visibility;
      this.shares = media?.shares;
      this.collection = media?.collections;
      this.likes = media?.likes;
      this.entityType = media?.entityType;
      this.category = media?.category;
      this.caption = media?.caption;
      this.createdById = media?.author?._id;
      this.author = media?.author;
      this.createdBy = media?.author?.username;
      this.lastUpdatedAt = media?.createdAt;
      this.tags = media?.tags;
    }
  }
}
module.exports = MediaDTO;
