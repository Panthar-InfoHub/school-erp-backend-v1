import { Router } from "express";
import getPaymentsInfo from "../controller/fees/getPaymentsInfo";


const router = Router({mergeParams: true});

router.get("/payments-info", getPaymentsInfo)

export default router;