import { Request, Response } from "express";
import { query } from "../database/connection";

class ProfileController {
  public async list(_: Request, res: Response): Promise<void> {
    const { id } = res.locals;
    try {
      const result: any = await query(
        "SELECT TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, weight, sex FROM profiles WHERE _user=$1",
        [id]
      );

      res.json(result);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  }

  public async save(req: Request, res: Response): Promise<void> {
    const { birth_date, weight, sex } = req.body;
    const { id } = res.locals;
    if (!birth_date) {
      res.json({ error: "Forneça a sua data de nascimento" });
    } else if (!weight) {
      res.json({ error: "Forneça o seu peso" });
    } else if (!sex || (sex !== "female" && sex !== "male")) {
      res.json({ error: "Forneça o sexo" });
    } else {
      try {
        // Verifica se o usuário já possui um perfil cadastrado
        const queryProfile: any = await query(
          "SELECT birth_date,weight,sex FROM profiles WHERE _user=$1",
          [id]
        );
        if (queryProfile.length === 0) {
          const result: any = await query(
            `INSERT INTO profiles(_user, birth_date, weight, sex) 
                VALUES($1,$2,$3,$4)
                RETURNING TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, weight, sex`,
            [id, birth_date, weight, sex]
          );
          res.json(result);
        } else {
          const result: any = await query(
            `UPDATE profiles 
                SET birth_date=$1, weight=$2, sex=$3 
                WHERE _user=$4
                RETURNING TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, weight, sex`,
            [birth_date, weight, sex, id]
          );
          if (result.rows) {
            res.json(result.rows);
          } else {
            res.json(result);
          }
        }
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  }

  public async delete(_: Request, res: Response): Promise<void> {
    const { id } = res.locals;

    try {
      const result: any = await query(
        `DELETE FROM profiles WHERE _user = $1 
        RETURNING TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, weight, sex`,
        [id]
      );
      if (result.rowcount > 0) {
        res.json(result.rows);
      } else if (result.rowcount === 0) {
        res.json({ error: "Não existe perfil cadastrado" });
      } else {
        res.json(result);
      }
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  }
}

const controller = new ProfileController();
export default controller;
