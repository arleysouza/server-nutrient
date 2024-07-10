import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.JWT_SECRET || "";

// Empacota o objeto em uma string codificada
export const tokenize = (object: any) => jwt.sign(object, secret);

export const validadeAcess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Token enviado pelo cliente no header da requisição
  const authorization: string | undefined = req.headers.authorization;
  if (!authorization) {
    res.send({ error: "Efetue o login para continuar" });
  } else {
    try {
      // Autorização no formato "Bearer+espaço+token"
      const [, token] = authorization.split(" ");
      // Decodifica a string codificada
      const decoded = <any>jwt.verify(token, secret);
      if (decoded) {
        // Salva o objeto com os dados de login na propriedade locals da requisição.
        // A propriedade locals pode ser acessa em qualquer parte da requisição.
        res.locals = decoded;
        // Chama a próxima função da requisição HTTP
        next(); 
      } else {
        res.send({ error: "Não autorizado" });
      }
    } catch (e: any) {
      if( e.message == "jwt malformed" ){
        res.send({ error: "Token inválido" });
      }
      else{
        res.send({ error: e.message });
      }
    }
  }
};

export const checkAdm = (_: Request, res: Response, next: NextFunction) => {
  // A propriedade locals possui o objeto com os dados de login
  const { role } = res.locals;
  if (role == "adm") {
    // Chama a próxima função da requisição HTTP
    next();
  } else {
    res.send({ error: "Acesso restrito a administrador" });
  }
};
