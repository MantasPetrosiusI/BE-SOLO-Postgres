import Express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const usersRouter = Express.Router();

const imageUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "backend-u2-w1/users" },
  }),
}).single("user");

usersRouter.post("/", async (req, res, next) => {
  try {
    const { id } = await UsersModel.create(req.body);
    res.status(201).send({ id });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.findAndCountAll({
      order: [
        ["name", "ASC"],
        ["surname", "ASC"],
      ],
    });
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findByPk(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `User not found!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const [numberOfUpdatedRows, updatedUsers] = await UsersModel.update(
      req.body,
      { where: { id: req.params.userId }, returning: true }
    );
    if (numberOfUpdatedRows === 1) {
      res.send(updatedUsers[0]);
    } else {
      next(createHttpError(404, `User not found!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await UsersModel.destroy({
      where: { id: req.params.userId },
    });
    if (numberOfDeletedRows === 1) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `User not found!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post(
  "/:userId/image",
  imageUploader,
  async (request, response, next) => {
    try {
      if (request.file) {
        const [numberOfUpdatedUsers, updatedUsers] = await UsersModel.update(
          { image: request.file.path },
          { where: { id: request.params.userId }, returning: true }
        );
        if (numberOfUpdatedUsers === 1) {
          response.send(updatedUsers[0]);
        } else {
          next(createHttpError(404, `User not found!`));
        }
      } else {
        next(createHttpError(400, `File not selected.`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;
