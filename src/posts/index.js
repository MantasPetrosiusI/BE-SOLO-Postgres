import Express from "express";
import PostsModel from "./model.js";
import UsersModel from "../users/model.js";

const postsRouter = Express.Router();

postsRouter.post("/:userId/posts", async (req, res, next) => {
  try {
    const { id } = await PostsModel.create(req.body);
    res.status(201).send({ postId });
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

export default postsRouter;
