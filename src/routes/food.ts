import { Router, Request, Response } from "express";
import {FoodController as controller} from "../controllers";

const routes = Router();

// http://localhost:3021/food/list?page=5&pagesize=3
routes.get("/list", controller.list);

// http://localhost:3021/food/search?term=café
routes.get("/search", controller.listByDescription);

// http://localhost:3021/food/get?idfood=511
routes.get("/get", controller.listById);

//aceita qualquer método HTTP ou URL
routes.use( (_:Request,res:Response) => res.status(404).json({error:"Operação desconhecida com alimentos"}) );

export default routes;