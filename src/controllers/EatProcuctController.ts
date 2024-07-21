import { Request, Response } from "express";
import { query } from "../database/connection";

class ConsumptionProcuctController {
  public async list(req: Request, res: Response): Promise<void> {
    const date = req.query.date as string;
    const { id:user } = res.locals;

    if (!isValidDate(date)) {
      res.json({ error: "Forneça uma data válida" });
    } else {
      try {
        const result: any = await query(
          `SELECT A.id::varchar, TO_CHAR(A.date, 'YYYY-MM-DD') AS date, A.quantity, 
            B.description, B.serving_size, B.serving_size_unit, 
            B.quantity_per_serving, B.quantity_per_serving_unit, B.energy, B.protein, 
            B.carbohydrate, B.sugar, B.dietary_fiber, B.total_fat, B.saturated_fat,
            B.trans_fat, B.calcium, B.sodium
          FROM eat_products AS A INNER JOIN products as B 
          ON A.product = B.id
          WHERE A._user=$1 AND A.date=$2
          ORDER BY B.description`,
          [user, date]
        );

        res.json(result);
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  }

  private isInvalid(value: any) {
    return value === undefined || value === "";
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    const { product, date, quantity } = req.body;
    const { id: user } = res.locals;
    if (this.isInvalid(product)) {
      res.json({ error: "Forneça o produto" });
    } else if (!isValidDate(date)) {
      res.json({ error: "Forneça uma data válida" });
    } else if (this.isInvalid(quantity)) {
      res.json({ error: "Forneça a quantidade consumida" });
    } else {
      try {
        const result: any = await query(
          `INSERT INTO eat_products(_user, product, date, quantity) 
             VALUES($1,$2,$3,$4)
             RETURNING id::varchar, product, TO_CHAR(date, 'YYYY-MM-DD') AS date, quantity`,
          [user, product, date, quantity]
        );
        res.json(result);
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    const { id, product, date, quantity } = req.body;
    const { id: user } = res.locals;
    if (this.isInvalid(id)) {
      res.status(500).json({ error: "Forneça o consumo a ser atualizado" });
    } else if (this.isInvalid(product)) {
      res.json({ error: "Forneça o produto" });
    } else if (!isValidDate(date)) {
      res.json({ error: "Forneça uma data válida" });
    } else if (this.isInvalid(quantity)) {
      res.json({ error: "Forneça a quantidade consumida" });
    } else {
      try {
        const result: any = await query(
          `UPDATE eat_products
           SET product=$1, date=$2, quantity=$3
            WHERE id=$4 AND _user=$5 
            RETURNING id::varchar, product, TO_CHAR(date, 'YYYY-MM-DD') AS date, quantity`,
          [product, date, quantity, id, user]
        );
        if (result.rows) {
          res.json(result.rows);
        } else if (result.rowcount == 0) {
          res.status(500).json({
            error: "O consumo não foi localizado para ser atualizado",
          });
        } else {
          res.json(result);
        }
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { id: user } = res.locals;

    if (this.isInvalid(id)) {
      res.status(500).json({ error: "Forneça o consumo a ser excluído" });
    } else {
      try {
        const result: any = await query(
          `DELETE FROM eat_products 
          WHERE id=$1 AND _user=$2 
          RETURNING id::varchar, product, TO_CHAR(date, 'YYYY-MM-DD') AS date, quantity`,
          [id, user]
        );
        if (result.rowcount > 0) {
          res.json(result.rows);
        } else if (result.rowcount === 0) {
          res.json({ error: "O consumo não está cadastrado" });
        } else {
          res.json(result);
        }
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  };
}

function isValidDate(dateString: string): boolean {
  // Verifica se a string está no formato YYYY-MM-DD usando uma expressão regular
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  // Divide a string em partes separadas de ano, mês e dia
  const [year, month, day] = dateString.split("-").map(Number);

  // Verifica se os valores de mês e dia estão no intervalo correto
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  // Cria um objeto Date com os valores fornecidos
  const date = new Date(year, month - 1, day);

  // Verifica se os componentes da data correspondem aos valores fornecidos
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

const controller = new ConsumptionProcuctController();
export default controller;
