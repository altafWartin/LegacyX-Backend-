class CategoryDto {
  constructor(category) {
    if (category) {
      this.id = category?._id;
      this.name = category?.name;
      this.createdAt = category?.createdAt;
      this.updatedAt = category?.updatedAt;
    }
  }
}
module.exports = CategoryDto;
