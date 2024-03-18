class UserDTO {
  constructor(user) {
    this._id = user._id;
    this.username = user.username;
    this.email = user.email;
    this.number = user.number;
    this.verified = user.verified;
    this.profileImage = user.profileImage;
    this.coverImage = user.coverImage;
    this.facebook = user.facebook;
    this.instagram = user.instagram;
    this.twitter = user.twitter;
    this.isSubscribed = user.isSubscribed;
  }
}

module.exports = UserDTO;
