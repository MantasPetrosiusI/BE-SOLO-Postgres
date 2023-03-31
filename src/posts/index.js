import Express from "express";
import PostsModel from "./model.js";
import UsersModel from "../users/model.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import createHTTPError from "http-errors";

const postsRouter = Express.Router();

const imageUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "backend-u2-w1/posts" },
  }),
}).single("post");

postsRouter.post("/:userId/posts", async (req, res, next) => {
  try {
    const { id } = await PostsModel.create(req.body);
    res.status(201).send({ id });
  } catch (error) {
    next(error);
  }
});

postsRouter.get("/:userId/posts", async (req, res, next) => {
  try {
    const posts = await PostsModel.findAll({
      include: [{ model: UsersModel, attributes: ["name", "surname"] }],
    });
    res.send(posts);
  } catch (error) {
    next(error);
  }
});

postsRouter.get("/:userId/posts/:postId", async (req, res, next) => {
  try {
    const posts = await PostsModel.findAll({
      attributes: ["text", "image"],
      where: { userId: req.params.userId, id: req.params.postId },
    });
    res.send(posts);
  } catch (error) {
    next(error);
  }
});

postsRouter.get("/:userId/posts/:postId", async (req, res, next) => {
  try {
    const post = await PostsModel.findByPk(req.params.postId, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [{ model: UsersModel, attributes: ["name", "surname"] }],
    });
    if (post) {
      res.send(post);
    } else {
      next(createHTTPError(404, `Post not found!`));
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.put("/:userId/posts/:postId", async (req, res, next) => {
  try {
    const [numberOfRowsUpdated, updatedPosts] = await PostsModel.update(
      req.body,
      {
        where: { id: req.params.postId },
        returning: true,
      }
    );
    if (numberOfRowsUpdated === 1) {
      res.send(updatedPosts[0]);
    } else {
      next(createHTTPError(404, `Post not found!`));
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.delete("/:userId/posts/:postId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await PostsModel.destroy({
      where: { postId: req.params.postId },
    });
    if (numberOfDeletedRows === 1) {
      res.status(204).send();
    } else {
      next(createHTTPError(404, `Post not found!`));
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.post(
  "/:userId/posts/:postId/image",
  imageUploader,
  async (request, response, next) => {
    try {
      if (request.file) {
        const [numberOfUpdatedPosts, updatedPosts] = await PostsModel.update(
          { image: request.file.path },
          { where: { id: request.params.postId }, returning: true }
        );
        if (numberOfUpdatedPosts === 1) {
          response.send(updatedPosts[0]);
        } else {
          next(createHTTPError(404, `Post not found!`));
        }
      } else {
        next(createHTTPError(400, `File not selected.`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default postsRouter;
