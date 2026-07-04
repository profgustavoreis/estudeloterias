import { Router, type IRouter } from "express";
import healthRouter from "./health";
import loteriasRouter from "./loterias";
import megaSenaRouter from "./mega-sena";
import lotofacilRouter from "./lotofacil";
import quinaRouter from "./quina";
import lotomaniaRouter from "./lotomania";
import timemaniaRouter from "./timemania";
import diadesorteRouter from "./diadesorte";
import duplasenaRouter from "./duplasena";
import maismilionariaRouter from "./maismilionaria";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(loteriasRouter);
router.use(megaSenaRouter);
router.use(lotofacilRouter);
router.use(quinaRouter);
router.use(lotomaniaRouter);
router.use(timemaniaRouter);
router.use(diadesorteRouter);
router.use(duplasenaRouter);
router.use(maismilionariaRouter);
router.use(adminRouter);

export default router;
