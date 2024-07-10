import { Router, Request, Response } from "express";
import {ProfileController as controller} from "../controllers";

const routes = Router();

routes.get("/", controller.list);
routes.post("/", controller.save);
routes.delete("/", controller.delete);

//aceita qualquer método HTTP ou URL
routes.use( (_:Request,res:Response) => res.status(404).json({error:"Operação desconhecida com o perfil"}) );

export default routes;