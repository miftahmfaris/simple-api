const express = require("express");
const router = express.Router();

const controller = require("./controller");

router.get("/", controller.get);
router.get("/:id", controller.getById);
router.post("/", controller.register);
router.post("/signin", controller.login);
router.delete("/", controller.delete);
router.delete("/:id", controller.deleteById);
router.put("/:id", controller.putById);
router.put("/password/:id", controller.putPasswordById);

module.exports = router;
