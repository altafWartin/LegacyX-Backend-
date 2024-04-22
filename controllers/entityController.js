/** @format */

const Media = require("../models/media");
const Like = require("../models/likes");
const Share = require("../models/shares");
const MediaDTO = require("../dto/media");
const validationSchema = require("../validation/validationSchema");
const LikeDto = require("../dto/like");
const ShareDto = require("../dto/share");
const Category = require("../models/category");
const CategoryDto = require("../dto/category");
const shuffle = require("lodash/shuffle");

const entityController = {
  async createCategory(req, res, next) {
    let category;
    let newCategory;
    const { name } = req.body;
    if (!name) {
      return next(`'name' is a required field`);
    }
    try {
      category = await Category.findOne({
        name: name,
      });
      if (!category) {
        newCategory = new Category({ name: name });
        category = await newCategory.save();
        return res
          .status(201)
          .json({ message: "New Category Created", category: newCategory });
      }
      return res.status(201).json({ message: "This Category Already Exits" });
    } catch (e) {
      return next(e);
    }
  },
  async upload(req, res, next) {
    const { error } = validationSchema.uploadEntity.validate(req.body);
    // 2.If error in validation__ return error via middleware
    if (error) {
      return next(error);
    }
    const user = req.user;
    //getting data from request
    const { visibility, tags, caption } = req.body;
    const path = req.uploadUrl;
    const fileName = req.fileName;
    const entityType = req.entityType;
    const url = `https://${req.headers.host}/${
      path?.split("/")[1]
    }/${fileName}`;
    //3. Save category in Db
    //Creating BACKEND_SERVER_PATH in env
    let newMedia;
    let newCategory;
    let category;
    try {
      category = await Category.findOne({
        name: tags,
      });
      // if (!category) {
      //   newCategory = new Category({ name: tags });
      //   category = await newCategory.save();
      // }

      newMedia = new Media({
        path,
        name: fileName,
        url,
        entityType,
        visibility,
        caption,
        likes: 0,
        shares: 0,
        author: user._id,
        tags,
        category: category._id,
      });
      //saving in database
      await newMedia.save();
      await newMedia.populate("author");
      await newMedia.populate("category");
    } catch (error) {
      return next(error);
    }
    //4. Send reponse
    //creating categoryDTO
    const mediaDto = new MediaDTO(newMedia);
    return res.status(201).json({ media: mediaDto });
  },

  async getMediaByCategory(req, res, next) {
    const { categoryId } = req.params;
    // let media = await Media.find({ visibility: true, entityType });
    try {
      const media = [];
      // media.map((media) => {
      //   const newMedia = new MediaDTO(media);
      //   allMedia.push(newMedia);
      // });
      if (!categoryId) {
        const error = {
          status: 404,
          message: "Invalid Category!",
        };
        return next(error);
      }
      let mediaByCat = await Media.find({
        visibility: true,
        category: categoryId,
      }).populate("category");
      mediaByCat.map((cat) => {
        const newCat = new MediaDTO(cat);
        media.push(newCat);
      });

      return res
        .status(201)
        .json({ message: "All Media By Category", data: media });
    } catch (e) {
      return res.status(401).json({ message: "Invalid Category" });
    }
  },
  //get category
  async getAllCategory(req, res, next) {
    const { user } = req;
    const { id } = req.params;
    const { search } = req.query;

    // let media = await Media.find({ visibility: true, entityType });
    const allCat = [];
    // media.map((media) => {
    //   const newMedia = new MediaDTO(media);
    //   allMedia.push(newMedia);
    // });
    let category = await Category.find({});

    category.map((cat) => {
      const newCat = new CategoryDto(cat);
      allCat.push(newCat);
    });
    return res.status(201).json({ message: "All Category", data: allCat });
  },

  async getAll(req, res, next) {
    const { user } = req;
    const { entityType } = req.params;
    // let media = await Media.find({ visibility: true, entityType });
    const allMedia = [];
    // media.map((media) => {
    //   const newMedia = new MediaDTO(media);
    //   allMedia.push(newMedia);
    // });
    let media = await Media.find({
      // entityType,
      author: user?._id,
    });

    media.map((media) => {
      const newMedia = new MediaDTO(media);
      allMedia.push(newMedia);
    });

    return res.status(201).json({ message: "All Media", allMedia });
  },

  async getAllFeed(req, res, next) {
    const { entityType, search } = req.query;
    console.log(entityType, search);
    let media = await Media.find({
      visibility: true,
      // entityType: entityType ? entityType : "",
      $or: [
        { caption: { $in: new RegExp(search, "i") } },
        { tags: { $in: new RegExp(search, "i") } },
      ],
      // tags: { $in: new RegExp(search, "i") },
    });
    allMedia = [];
    media.map((media) => {
      const newMedia = new MediaDTO(media);
      allMedia.push(newMedia);
    });
    allMedia = shuffle(allMedia);
    return res.status(201).json({ message: "All Media", allMedia });
  },

  async getSingleById(req, res, next) {
    const { user } = req;
    // const { error } = validationSchema.getByIdSchema.validate(req.params);
    // if (error) {
    //   return next(error);
    // }

    const { id } = req.params;

    let media = await Media.findById({ _id: id })
      .populate("author")
      .populate("category");

    if (!media) {
      const error = {
        status: 404,
        message: "No Media found!",
      };
      return next(error);
    }

    if (
      media?.author?._id?.toString() !== user?._id.toString() &&
      !media.visibility
    ) {
      const error = {
        status: 401,
        message: "Unauthorized! this media is not visible to everyone",
      };
      return next(error);
    }

    let likes;
    try {
      likes = await Like.find({ media: id }).populate("author");
    } catch (error) {
      return next(error);
    }

    let allLikes = [];
    likes.map((like) => {
      const newLike = new LikeDto(like);
      allLikes.push(newLike);
    });

    let shares;
    try {
      shares = await Share.find({ media: id }).populate("author");
    } catch (error) {
      return next(error);
    }

    let allShares = [];
    shares.map((share) => {
      const newShare = new ShareDto(share);
      allShares.push(newShare);
    });
    return res
      .status(201)
      .json({ message: "Media", media, allLikes, allShares });
  },

  async getAllByUser(req, res, next) {
    const { user } = req;
    const { userId } = req.params;

    // let media = await Media.find({ visibility: true, entityType });
    const allMedia = [];
    let media = [];
    let comMedia = [];
    try {
      if (user?._id == userId) {
        media = await Media.find({
          author: userId,
        })
          .populate("category")
          .populate("author");
      } else {
        media = await Media.find({
          visibility: true,
          author: userId,
        })
          .populate("category")
          .populate("author");
      }
      media.map((media) => {
        const newMedia = new MediaDTO(media);
        allMedia.push(newMedia);
      });
      comMedia = await Media.find({}).populate("category").populate("author");
    } catch (e) {
      console.log(e);
    }
    let likedMedia = [];
    try {
      if (comMedia.length > 0) {
        var temp = comMedia.map(async (m) => {
          let filterMedia = await Like.findOne({
            media: m?.id,
            author: userId,
          });
          let media = await Media.findOne({
            author: filterMedia?.author,
            _id: filterMedia?.media,
          }).populate("category");
          if (media) {
            const newMedias = new MediaDTO(media);
            likedMedia.push(newMedias);
          }
        });
        await Promise.all(temp);
      }
    } catch (e) {
      console.log(e);
    }
    let collections = [];

    try {
      if (media.length > 0) {
        collections = [
          ...new Map(media.map((item) => [item["tags"], item])).values(),
        ];
        await Promise.all(collections);
      }
    } catch (e) {}
    return res.status(201).json({
      message: "All Media",
      allMedia,
      favorites: likedMedia,
      collections: collections,
    });
  },
  async deleteAllMediaAndCategory(req, res, next) {
    console.log("hello");
    try {
      await Media.deleteMany({});

      // await Category.deleteMany({});
    } catch (e) {
      console.log(e);
    }

    return res.status(201).json({
      message: "All Media and category has been deleted",
    });
  },

  async deleteMediaById(req, res, next) {
    console.log("hello");
    const { mediaId } = req.params;
    console.log(mediaId);
    try {
      await Media.deleteMany({ _id: mediaId });
    } catch (e) {
      console.log(e);
    }

    return res.status(201).json({
      message: "Media deleted successfully",
    });
  },

  async deleteMultipleMedia(req, res, next) {
    const { mediaIds } = req.body; // Assuming the array of IDs is sent in the request body
    console.log(mediaIds);
    try {
      await Media.deleteMany({ _id: { $in: mediaIds } });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: "Internal server error" });
    }

    return res.status(200).json({
      message: "Multiple media items deleted successfully",
    });
  },
};

module.exports = entityController;
