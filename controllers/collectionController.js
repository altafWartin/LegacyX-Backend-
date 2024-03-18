const Media = require("../models/media");
const Collection = require("../models/collection");

const Like = require("../models/likes");
const MediaDTO = require("../dto/media");
const validationSchema = require("../validation/validationSchema");
const LikeDto = require("../dto/like");
const CollectionDto = require("../dto/collection");

const collectionController = {
  async create(req, res, next) {
    const user = req.user;
    // 1.Validate user input
    const { error } = validationSchema.createCollection.validate(req.body);

    // 2.If error in validation__ return error via middleware
    if (error) {
      return next(error);
    }

    const { name } = req.body;

    let collection;
    try {
      collection = new Collection({
        name,
        author: user._id,
      });
      //saving in database
      await collection.save();
      await collection.populate("author");
    } catch (error) {
      return next(error);
    }

    collection = new CollectionDto(collection);
    return res
      .status(201)
      .json({ message: "Created Successfully", collections: CollectionDto });
  },

  async getAll(req, res, next) {
    const { user } = req;
    // 1.Validate user input
    const { error } = validationSchema.getByIdSchema.validate(req.params);

    // 2.If error in validation__ return error via middleware
    if (error) {
      return next(error);
    }

    const { id } = req.params;

    let collections = await Collection.find({ author: id });

    if (!collections) {
      const error = {
        status: 404,
        message: "This user does not have any collections!",
      };
      return next(error);
    }

    return res.status(201).json({ message: "All Collections", collections });
  },

  async getSingleById(req, res, next) {
    const { user } = req;
    // 1.Validate user input
    const { error } = validationSchema.getByIdSchema.validate(req.params);

    // 2.If error in validation__ return error via middleware
    if (error) {
      return next(error);
    }

    const { id } = req.params;

    let collection = await Collection.findById({ _id: id }).populate("author");

    if (!collection) {
      const error = {
        status: 404,
        message: "No such collection found!",
      };
      return next(error);
    }

    const visibility = user._id.toString() !== collection.author._id.toString();
    console.log(visibility);
    let allMedia;
    try {
      if (visibility) {
        allMedia = await Media.find({ collections: id, visibility });
      } else {
        allMedia = await Media.find({ collections: id });
      }
    } catch (error) {
      return next(error);
    }
    const medias = [];
    allMedia.map((media) => {
      newMedia = new MediaDTO(media);
      medias.push(newMedia);
    });

    return res.status(201).json({ message: "All Likes", medias, collection });
  },
};

module.exports = collectionController;
