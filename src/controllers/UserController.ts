import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { query } from "../database/connection";
import { tokenize } from "../middlewares";

class UserController {
  // Defina o número de saltos para o bcrypt
  private saltRounds = 10;

  public login = async (req: Request, res: Response): Promise<void> => {
    const { mail, password } = req.body;

    if (!mail) {
      res.json({ error: "Forneça o e-mail" });
    } else if (!password) {
      res.json({ error: "Forneça a senha" });
    } else {
      try {
        const result: any = await query(
          `SELECT id::varchar, alias, mail, role, password 
          FROM users 
          WHERE mail=$1`,
          [mail]
        );

        if (result.length === 0) {
          res.status(401).json({ error: "E-mail ou senha incorretos" });
          return;
        }

        const user = result[0];
        // Comparar a senha
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const object = {
            id: user.id,
            alias: user.alias,
            mail: user.mail,
            role: user.role,
          };
          res.json({ ...object, token: tokenize(object) });
        } else {
          res.status(401).json({ error: "E-mail ou senha incorretos" });
        }
      } catch (e: any) {
        res.status(502).json({ error: "Erro ao processar a solicitação" });
      }
    }
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    const { alias, mail, password } = req.body;

    if (!alias) {
      res.json({ error: "Forneça o nome de usuário" });
    } else if (!mail) {
      res.json({ error: "Forneça o e-mail" });
    } else if (!password || password.trim().length < 6) {
      res.json({ error: "Forneça a senha com o mínimo de 6 caracteres" });
    } else {
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      try {
        const result: any = await query(
          `INSERT INTO users(alias,mail,password) 
          VALUES($1,$2,$3)
          RETURNING id::varchar, alias, mail, role`,
          [alias, mail, hashedPassword]
        );

        res.json({ ...result, token: tokenize(result) });
      } catch (e: any) {
        if (e.message.includes("duplicate key")) {
          res.status(409).json({
            error:
              "O e-mail fornecido já está em uso. Por favor, forneça um e-mail diferente",
          });
        } else {
          res.status(502).json({ error: e.message });
        }
      }
    }
  };

  public async list(_: Request, res: Response): Promise<void> {
    try {
      const result: any = await query(
        "SELECT id::varchar,alias,mail,role FROM users ORDER BY mail"
      );
      res.json(result);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  }

  public async updateAlias(req: Request, res: Response): Promise<void> {
    const { alias } = req.body;
    const { id } = res.locals;
    if (!alias) {
      res.json({ error: "Forneça o nome de usuário" });
    } else {
      try {
        const result: any = await query(
          "UPDATE users SET alias=$2 WHERE id=$1 RETURNING id::varchar, alias, mail, role",
          [id, alias]
        );
        if (result.rowcount > 0) {
          res.json(result.rows);
        } else if (result.rowcount == 0) {
          res.json({ error: "Registro inexistente" });
        } else {
          res.json(result);
        }
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  }

  public async updateMail(req: Request, res: Response): Promise<void> {
    const { mail } = req.body;
    const { id } = res.locals;
    if (!mail) {
      res.json({ error: "Forneça o e-mail" });
    } else {
      try {
        const result: any = await query(
          "UPDATE users SET mail=$2 WHERE id=$1 RETURNING id::varchar, alias, mail, role",
          [id, mail]
        );
        if (result.rowcount > 0) {
          res.json(result.rows);
        } else if (result.rowcount == 0) {
          res.json({ error: "Registro inexistente" });
        } else {
          res.json(result);
        }
      } catch (e: any) {
        if (e.message.includes("duplicate key")) {
          res.status(409).json({
            error:
              "O e-mail fornecido já está em uso. Por favor, forneça um e-mail diferente",
          });
        } else {
          res.status(502).json({ error: e.message });
        }
      }
    }
  }

  public updatePassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { password } = req.body;
    const { id } = res.locals;
    if (!password || password.trim().length < 6) {
      res.json({ error: "Forneça a senha com o mínimo de 6 caracteres" });
    } else {
      try {
        const hashedPassword = await bcrypt.hash(password, this.saltRounds);
        const result: any = await query(
          "UPDATE users SET password=$2 WHERE id=$1 RETURNING id::varchar, alias, mail, role",
          [id, hashedPassword]
        );
        if (result.rowcount > 0) {
          res.json(result.rows);
        } else if (result.rowcount == 0) {
          res.json({ error: "Registro inexistente" });
        } else {
          res.json(result);
        }
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  };

  public async updateProfile(req: Request, res: Response): Promise<void> {
    const { id, role } = req.body;
    if (role === "adm" || role === "user") {
      try {
        const r: any = await query(
          "UPDATE users SET role=$2 WHERE id=$1 RETURNING id::varchar, alias, mail, role",
          [id, role]
        );
        if (r.rowcount > 0) {
          res.json(r.rows);
        } else if (r.rowcount == 0) {
          res.json({ error: "Registro inexistente" });
        } else {
          res.json(r);
        }
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    } else {
      res.json({ error: "Perfil inexistente" });
    }
  }
}

const controller = new UserController();
export default controller;
