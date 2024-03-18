class LikeDto {
  constructor(like) {
    if (like) {
      this.id = like?._id;
      this.likedBy = like?.author?.username;
      this.userId = like?.author?._id;
      this.likedAt = like?.createdAt;
      this.media = like?.media;
    }
  }
}
module.exports = LikeDto;
