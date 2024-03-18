const Media = require("../models/media");
const Share = require("../models/shares");
const MediaDTO = require("../dto/media");
const validationSchema = require("../validation/validationSchema");
const ShareDto = require("../dto/share");

const shareController = {
  async share(req, res, next) {
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
        message: "This Image is private you can't share it!",
      };
      return next(error);
    }

    let newShare;
    try {
      newShare = new Share({
        media: id,
        author: user._id,
      });
      //saving in database
      await newShare.save();
    } catch (error) {
      return next(error);
    }

    try {
      media = await Media.findOneAndUpdate(
        { _id: id },
        { $set: { shares: media.shares + 1 } },
        { new: true }
      );
    } catch (error) {
      return next(error);
    }

    // 4. Send reponse
    // creating categoryDTO
    const mediaDto = new MediaDTO(media);

    const shareDto = new ShareDto(newShare);

    return res
      .status(201)
      .json({ message: "Shared", media: mediaDto, share: shareDto });
  },
};

module.exports = shareController;
