class ShareDto {
  constructor(share) {
    if (share) {
      this.id = share?._id;
      this.sharedBy = share?.author?.username;
      this.userId = share?.author?._id;
      this.sharedAt = share?.createdAt;
    }
  }
}
module.exports = ShareDto;
