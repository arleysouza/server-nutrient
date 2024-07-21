import { Request, Response } from "express";
import { query } from "../database/connection";

class ProcuctController {
  // Busca os produtos que não são do usuário
  public async search(req: Request, res: Response): Promise<void> {
    let term = req.query.term as string;
    if (!term || term.trim().length === 0) {
      res.json([]);
    } else {
      const { id } = res.locals;
      try {
        term = `%${term.trim()}%`;

        const result: any = await query(
          `SELECT id::varchar, description, serving_size, serving_size_unit, 
        quantity_per_serving, quantity_per_serving_unit, energy, protein, 
        carbohydrate, sugar, dietary_fiber, total_fat, trans_fat, calcium, sodium
        FROM products
        WHERE _user != $1 AND description ILIKE $2
        ORDER BY description
        LIMIT 10`,
          [id, term]
        );

        res.json(result);
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  }

  // Busca os produtos que são do usuário
  public async searchByUser(req: Request, res: Response): Promise<void> {
    let term = req.query.term as string;
    if (!term || term.trim().length === 0) {
      res.json([]);
    } else {
      const { id } = res.locals;
      try {
        term = `%${term.trim()}%`;

        const result: any = await query(
          `SELECT id::varchar, description, serving_size, serving_size_unit, 
        quantity_per_serving, quantity_per_serving_unit, energy, protein, 
        carbohydrate, sugar, dietary_fiber, total_fat, trans_fat, calcium, sodium
        FROM products
        WHERE _user = $1 AND description ILIKE $2
        ORDER BY description
        LIMIT 10`,
          [id, term]
        );

        res.json(result);
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  }

  public async listByUser(_: Request, res: Response): Promise<void> {
    const { id } = res.locals;
    try {
      const result: any = await query(
        `SELECT id::varchar, description, serving_size, serving_size_unit, 
        quantity_per_serving, quantity_per_serving_unit, energy, protein, 
        carbohydrate, sugar, dietary_fiber, total_fat, saturated_fat, trans_fat, calcium, sodium
        FROM products WHERE _user=$1
        ORDER BY description`,
        [id]
      );

      res.json(result);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  }

  private isInvalid(value: any) {
    return value === null || value === undefined || value === "";
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    let {
      description,
      serving_size,
      serving_size_unit,
      quantity_per_serving,
      quantity_per_serving_unit,
      energy,
      protein,
      carbohydrate,
      sugar,
      dietary_fiber,
      total_fat,
      saturated_fat,
      trans_fat,
      calcium,
      sodium,
    } = req.body;

    const { id: user } = res.locals;
    if (this.isInvalid(description)) {
      res.json({ error: "Forneça o nome do produto" });
    } else if (this.isInvalid(serving_size)) {
      res.json({ error: "Forneça o peso/volume de cada porção" });
    } else if (this.isInvalid(serving_size_unit)) {
      res.json({
        error:
          "Forneça a unidade de medida de cada porção, por exemplo, g (gramas)",
      });
    } else {
      if (this.isInvalid(quantity_per_serving)) {
        quantity_per_serving = null;
      }
      if (this.isInvalid(quantity_per_serving_unit)) {
        quantity_per_serving_unit = null;
      }
      if (this.isInvalid(energy)) {
        energy = null;
      }
      if (this.isInvalid(protein)) {
        protein = null;
      }
      if (this.isInvalid(carbohydrate)) {
        carbohydrate = null;
      }
      if (this.isInvalid(sugar)) {
        sugar = null;
      }
      if (this.isInvalid(dietary_fiber)) {
        dietary_fiber = null;
      }
      if (this.isInvalid(total_fat)) {
        total_fat = null;
      }
      if (this.isInvalid(saturated_fat)) {
        saturated_fat = null;
      }
      if (this.isInvalid(trans_fat)) {
        trans_fat = null;
      }
      if (this.isInvalid(calcium)) {
        calcium = null;
      }
      if (this.isInvalid(sodium)) {
        sodium = null;
      }
      try {
        const result: any = await query(
          `INSERT INTO products(_user, description, serving_size, serving_size_unit, 
              quantity_per_serving, quantity_per_serving_unit, energy, protein, 
              carbohydrate, sugar, dietary_fiber, total_fat, saturated_fat, trans_fat, calcium, sodium) 
             VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
             RETURNING id::varchar,_user, description, serving_size, serving_size_unit, 
              quantity_per_serving, quantity_per_serving_unit, energy, protein, 
              carbohydrate, sugar, dietary_fiber, total_fat, saturated_fat, trans_fat, calcium, sodium`,
          [
            user,
            description,
            serving_size,
            serving_size_unit,
            quantity_per_serving,
            quantity_per_serving_unit,
            energy,
            protein,
            carbohydrate,
            sugar,
            dietary_fiber,
            total_fat,
            saturated_fat,
            trans_fat,
            calcium,
            sodium,
          ]
        );
        res.json(result);
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    let {
      id,
      description,
      serving_size,
      serving_size_unit,
      quantity_per_serving,
      quantity_per_serving_unit,
      energy,
      protein,
      carbohydrate,
      sugar,
      dietary_fiber,
      total_fat,
      saturated_fat,
      trans_fat,
      calcium,
      sodium,
    } = req.body;

    const { id: user } = res.locals;
    if (this.isInvalid(id)) {
      res.status(500).json({ error: "Forneça o produto a ser atualizado" });
    } else if (this.isInvalid(description)) {
      res.json({ error: "Forneça o nome do produto" });
    } else if (this.isInvalid(serving_size)) {
      res.json({ error: "Forneça o peso/volume de cada porção" });
    } else if (this.isInvalid(serving_size_unit)) {
      res.json({
        error:
          "Forneça a unidade de medida de cada porção, por exemplo, g (gramas)",
      });
    } else {
      if (this.isInvalid(quantity_per_serving)) {
        quantity_per_serving = null;
      }
      if (this.isInvalid(quantity_per_serving_unit)) {
        quantity_per_serving_unit = null;
      }
      if (this.isInvalid(energy)) {
        energy = null;
      }
      if (this.isInvalid(protein)) {
        protein = null;
      }
      if (this.isInvalid(carbohydrate)) {
        carbohydrate = null;
      }
      if (this.isInvalid(sugar)) {
        sugar = null;
      }
      if (this.isInvalid(dietary_fiber)) {
        dietary_fiber = null;
      }
      if (this.isInvalid(total_fat)) {
        total_fat = null;
      }
      if (this.isInvalid(saturated_fat)) {
        saturated_fat = null;
      }
      if (this.isInvalid(trans_fat)) {
        trans_fat = null;
      }
      if (this.isInvalid(calcium)) {
        calcium = null;
      }
      if (this.isInvalid(sodium)) {
        sodium = null;
      }
      try {
        const result: any = await query(
          `UPDATE products
           SET description=$1, serving_size=$2, serving_size_unit=$3, 
              quantity_per_serving=$4 , quantity_per_serving_unit=$5, energy=$6, protein=$7, 
              carbohydrate=$8, sugar=$9, dietary_fiber=$10, total_fat=$11, saturated_fat=$12, 
              trans_fat=$13, calcium=$14, sodium=$15 
            WHERE id=$16 AND _user=$17 
            RETURNING id::varchar, description, serving_size, serving_size_unit, 
              quantity_per_serving, quantity_per_serving_unit, energy, protein, 
              carbohydrate, sugar, dietary_fiber, total_fat, saturated_fat, trans_fat, calcium, sodium`,
          [
            description,
            serving_size,
            serving_size_unit,
            quantity_per_serving,
            quantity_per_serving_unit,
            energy,
            protein,
            carbohydrate,
            sugar,
            dietary_fiber,
            total_fat,
            saturated_fat,
            trans_fat,
            calcium,
            sodium,
            id,
            user,
          ]
        );
        if (result.rows) {
          res.json(result.rows);
        } else if (result.rowcount == 0) {
          res.status(500).json({
            error: "O produto não foi localizado para ser atualizado",
          });
        } else {
          res.json(result);
        }
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  };

  /*
  O mesmo produto pode ser cadastrado por vários usuários.
  Um usuário pode copiar um produto de outro usuário para a sua conta.
  */
  public copy = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.body; // id do produto a ser copiado
    const { id: user } = res.locals;

    if (this.isInvalid(id)) {
      res.status(500).json({ error: "Forneça o produto a ser copiado" });
    } else {
      try {
        const result: any = await query(
          `INSERT INTO products (_user,description, serving_size, serving_size_unit, 
              quantity_per_serving, quantity_per_serving_unit, energy, protein, 
              carbohydrate, sugar, dietary_fiber, total_fat, saturated_fat, trans_fat, calcium, sodium)
          SELECT $1, description, serving_size, serving_size_unit, 
            quantity_per_serving, quantity_per_serving_unit, energy, protein, 
            carbohydrate, sugar, dietary_fiber, total_fat, saturated_fat, trans_fat, calcium, sodium
          FROM products WHERE id=$2
          RETURNING id::varchar, description, serving_size, serving_size_unit, 
              quantity_per_serving, quantity_per_serving_unit, energy, protein, 
              carbohydrate, sugar, dietary_fiber, total_fat, saturated_fat, trans_fat, calcium, sodium`,
          [user, id]
        );
        res.json(result);
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { id: user } = res.locals;

    if (this.isInvalid(id)) {
      res.status(500).json({ error: "Forneça o produto a ser excluído" });
    } else {
      try {
        const result: any = await query(
          `DELETE FROM products WHERE id=$1 AND _user = $2 
          RETURNING id::varchar, description, serving_size, serving_size_unit, 
          quantity_per_serving, quantity_per_serving_unit, energy, protein, 
          carbohydrate, sugar, dietary_fiber, total_fat, saturated_fat, trans_fat, calcium, sodium`,
          [id, user]
        );
        if (result.rowcount > 0) {
          res.json(result.rows);
        } else if (result.rowcount === 0) {
          res.json({ error: "O produto não estava cadastrado" });
        } else {
          res.json(result);
        }
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  };
}

const controller = new ProcuctController();
export default controller;
