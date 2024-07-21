import { Router, Request, Response } from "express";
import {ProcuctController as controller} from "../controllers";

const routes = Router();

routes.get("/search", controller.search);
routes.get("/searchbyuser", controller.searchByUser);
routes.get("/byuser", controller.listByUser);
routes.post("/", controller.create);
routes.post("/copy", controller.copy);
routes.put("/", controller.update);
routes.delete("/:id", controller.delete);

//aceita qualquer método HTTP ou URL
routes.use( (_:Request,res:Response) => res.status(404).json({error:"Operação desconhecida com o produto"}) );

export default routes;