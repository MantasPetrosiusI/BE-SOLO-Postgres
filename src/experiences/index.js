import Express from "express";
import ExperiencesModel from "./model.js";
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const experiencesRouter = Express.Router();

const imageUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "backend-u2-w1/experiences" },
  }),
}).single("exp");

experiencesRouter.post("/:userId/experiences", async (req, res, next) => {
  try {
    const { id } = await ExperiencesModel.create({
      ...req.body,
      userId: req.params.userId,
    });

    res.status(201).send({ id });
  } catch (error) {
    next(error);
  }
});

experiencesRouter.get("/:userId/experiences/", async (req, res, next) => {
  try {
    const experiences = await ExperiencesModel.findAll({
      where: { userId: req.params.userId },
    });
    res.send(experiences);
  } catch (error) {
    next(error);
  }
});

experiencesRouter.get(
  "/:userId/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const experience = await ExperiencesModel.findByPk(
        req.params.experienceId,
        { attributes: { exclude: ["createdAt", "updatedAt"] } }
      );
      if (experience) {
        res.send(experience);
      } else {
        next(createHttpError(404, `Experience not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

experiencesRouter.put(
  "/:userId/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const [numberOfUpdatedRows, updatedExperiences] =
        await ExperiencesModel.update(req.body, {
          where: { id: req.params.experienceId },
          returning: true,
        });
      if (numberOfUpdatedRows === 1) {
        res.send(updatedExperiences[0]);
      } else {
        next(createHttpError(404, `Experience not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

experiencesRouter.delete(
  "/:userId/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const numberOfDeletedRows = await ExperiencesModel.destroy({
        where: { id: req.params.experienceId },
      });
      if (numberOfDeletedRows === 1) {
        res.status(204).send();
      } else {
        next(createHttpError(404, `Experience not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

experiencesRouter.post(
  "/:userId/experiences/:experienceId/image",
  imageUploader,
  async (request, response, next) => {
    try {
      if (request.file) {
        const [numberOfUpdatedExperiences, updatedExperiences] =
          await ExperiencesModel.update(
            { image: request.file.path },
            { where: { id: request.params.experienceId }, returning: true }
          );
        if (numberOfUpdatedExperiences === 1) {
          response.send(updatedExperiences[0]);
        } else {
          next(createHttpError(404, `Experience not found!`));
        }
      } else {
        next(createHttpError(400, `No file selected.`));
      }
    } catch (error) {
      next(error);
    }
  }
);
export default experiencesRouter;
