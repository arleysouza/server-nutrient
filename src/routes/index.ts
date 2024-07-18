import { Router, Request, Response } from "express";
import { UserController } from "../controllers";
import { validadeAcess } from "../middlewares";
import field from "./field";
import category from "./category";
import food from "./food";
import profile from "./profile";
import user from "./user";
import product from "./product";
import eatProduct from "./eatProduct";
import eatFood from "./eatFood";

const routes = Router();

routes.post("/login", UserController.login);
routes.use("/food", food);
routes.use("/category", category);
routes.use("/eat/food", validadeAcess, eatFood);
routes.use("/eat/product", validadeAcess, eatProduct);
routes.use("/field", field);
routes.use("/product", validadeAcess, product);
routes.use("/profile", validadeAcess, profile);
routes.use("/user", user);

//aceita qualquer método HTTP ou URL
routes.use( (_:Request,res:Response) => res.status(404).json({error:"Requisição desconhecida"}) );

export default routes;
