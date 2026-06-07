import { Router, type IRouter } from "express";
import healthRouter from "./health";
import loteriasRouter from "./loterias";
import megaSenaRouter from "./mega-sena";

const router: IRouter = Router();

router.use(healthRouter);
router.use(loteriasRouter);
router.use(megaSenaRouter);

export default router;
