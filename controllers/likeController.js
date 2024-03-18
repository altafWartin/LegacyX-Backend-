const Media = require("../models/media");
const Like = require("../models/likes");
const MediaDTO = require("../dto/media");
const validationSchema = require("../validation/validationSchema");
const LikeDto = require("../dto/like");

const likeController = {
  async like(req, res, next) {
    const user = req.user;
    // 1.Validate user input
    const { error } = validationSchema.getByIdSchema.validate(req.body);

    // 2.If error in validation__ return error via middleware
    if (error) {
      return next(error);
    }

    const { id } = req.body;

    let media = await Media.findById({ _id: id });

    if (!media) {
      const error = {
        status: 404,
        message: "No such media is found!",
      };
      return next(error);
    }

    if (!media.visibility) {
      const error = {
        status: 401,
        message: "This Image is private you can't like it!",
      };
      return next(error);
    }

    let alreadyLiked;
    try {
      alreadyLiked = await Like.findOneAndDelete({
        media: id,
        author: user._id,
      });
    } catch (error) {
      return next(error);
    }

    if (alreadyLiked) {
      try {
        media = await Media.findOneAndUpdate(
          { _id: id },
          { $set: { likes: media.likes - 1 } },
          { new: true }
        );
      } catch (error) {
        return next(error);
      }
      const mediaDto = new MediaDTO(media);
      return res.status(201).json({ message: "Unliked", media: mediaDto });
    }

    let newLike;
    try {
      newLike = new Like({
        media: id,
        author: user._id,
      });
      //saving in database
      await newLike.save();
    } catch (error) {
      return next(error);
    }

    try {
      media = await Media.findOneAndUpdate(
        { _id: id },
        { $set: { likes: media.likes + 1 } },
        { new: true }
      );
    } catch (error) {
      return next(error);
    }

    // 4. Send reponse
    // creating categoryDTO
    const mediaDto = new MediaDTO(media);

    const likeDto = new LikeDto(newLike);

    return res
      .status(201)
      .json({ message: "Liked", media: mediaDto, like: likeDto });
  },

  async likeNotification(req, res, next) {
    const user = req.user;
    // 1.Validate user input
    // const { error } = validationSchema.getByIdSchema.validate(req.body);

    // // 2.If error in validation__ return error via middleware
    // if (error) {
    //   return next(error);
    // }
    const allMedia = [];
    let media = [];
    try {
      media = await Media.find({
        author: user?._id,
      });

      media.map((media) => {
        const newMedia = new MediaDTO(media);
        allMedia.push(newMedia);
      });
    } catch (e) {
      console.log(e);
    }
    let likedMedia = [];
    try {
      if (media.length > 0) {
        var temp = media.map(async (m) => {
          let filterLike = await Like.findOne({
            author: m?.author,
            media: m?._id,
          })
            .populate("author")
            .populate("media");

          if (filterLike) {
            const newMedias = new LikeDto(filterLike);
            likedMedia.push(newMedias);
          }
        });
        await Promise.all(temp);
      }
    } catch (e) {
      console.log(e);
    }

    return res.status(201).json({ message: "Likes", like: likedMedia });
  },
};

module.exports = likeController;
