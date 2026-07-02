import { Router, type IRouter } from "express";
import healthRouter from "./health";
import loteriasRouter from "./loterias";
import megaSenaRouter from "./mega-sena";
import lotofacilRouter from "./lotofacil";
import quinaRouter from "./quina";
import lotomaniaRouter from "./lotomania";
import timemaniaRouter from "./timemania";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(loteriasRouter);
router.use(megaSenaRouter);
router.use(lotofacilRouter);
router.use(quinaRouter);
router.use(lotomaniaRouter);
router.use(timemaniaRouter);
router.use(adminRouter);

export default router;
