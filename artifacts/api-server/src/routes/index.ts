import { Router, type IRouter } from "express";
import healthRouter from "./health";
import loteriasRouter from "./loterias";
import megaSenaRouter from "./mega-sena";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(loteriasRouter);
router.use(megaSenaRouter);
router.use(adminRouter);

export default router;
