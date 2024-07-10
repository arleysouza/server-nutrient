import { Request, Response } from "express";
import {query} from "../database/connection";
import fields from "./fields";

class FoodController {
  public listById = async (req: Request, res: Response): Promise<void> =>  {
    const id = req.query.idfood as string;
    if (!id || isNaN(parseInt(id)) || parseInt(id) < 1) {
      res.status(500).json({ error: "Forneça o identificador do alimento" });
    } else {
      try {
        const queryFood: any = await query(
          `SELECT A.id::varchar, B.id::varchar as idcategory, B.name as "category", A.description, moisture, energy, protein, lipids, cholesterol, carbohydrate, dietary_fiber, ash, calcium, magnesium, manganese, phosphorus, iron, sodium, potassium, copper, zinc, retinol, re, era, thiamin, riboflavin, pyridoxine, niacin, vitamin_c
            FROM foods as A, categories as B
            WHERE A.category = B.id AND A.id=$1`,
          [id]
        );
        if ("message" in queryFood) {
          res.status(500).json(queryFood);
        } else {
          if( queryFood.length === 1){
            const items = await this.formattedResult(queryFood);
            res.json(items[0]);
          }
          else{
            res.status(502).json({ error: "Alimento não catalogado" });
          }
        }
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  }

  public async listByDescription(req: Request, res: Response): Promise<void> {
    let term = req.query.term as string;
    if (!term || term.trim().length === 0) {
      res.status(500).json({ error: "Forneça a descrição do alimento" });
    } else {
      try {
        term = `%${term.trim()}%`;
        const queryTerm: any = await query(
          `SELECT id::varchar, description
            FROM foods
            WHERE description ILIKE $1
            ORDER BY description`,
          [term]
        );
        if ("message" in queryTerm) {
          res.status(500).json(queryTerm);
        } else {
          res.json({ items: queryTerm, total:queryTerm.length, page:1, pagesize:queryTerm.length });
        }
      } catch (e: any) {
        res.status(502).json({ error: e.message });
      }
    }
  }

  // para usar o this em this.formattedResult é preciso que list seja arrow function
  public list = async (req: Request, res: Response): Promise<void> => {
    let page: any = req.query.page as string;
    let pagesize: any = req.query.pagesize as string;

    if (!page || isNaN(parseInt(page)) || parseInt(page) < 1) {
      page = 1;
    }
    if (!pagesize || isNaN(parseInt(pagesize)) || parseInt(pagesize) < 1) {
      pagesize = 20;
    }
    try {
      page = parseInt(page);
      pagesize = parseInt(pagesize);

      // obtém a quantidade de registros da tabela
      const queryCount: any = await query(
        "SELECT count(id)::integer FROM foods"
      );
      if (queryCount.length === 1 && queryCount[0].count) {
        const total = queryCount[0].count;
        // obtém a quantidade de páginas
        const pages = Math.ceil(total / pagesize);
        if (page > pages) {
          page = pages;
        }
        // obtém o offset
        const offset = (page - 1) * pagesize;
        const queryFoods: any = await query(
          `SELECT id::varchar, description
            FROM foods
            ORDER BY description
            LIMIT $1 
            OFFSET $2`,
          [pagesize, offset]
        );
        if ("message" in queryFoods) {
          res.status(500).json(queryFoods);
        } else {
          res.json({ items:queryFoods, total, page, pagesize });
        }
      } else {
        res
          .status(500)
          .json({ error: "Problemas ao obter a quantidade de registros" });
      }
    } catch (e: any) {
      res.status(502).json({ message: e.message });
    }
  }

  private async formattedResult(foods:any[]): Promise<any[]> {

    const results = foods.map(food => {
      const formattedItem:any = {
        id: food.id,
        description: food.description,
        category: {
          id: food.idcategory,
          name: food.category,
        },
      };
    
      // Iterar sobre as propriedades do item, ignorando `id` e `description`
      for (const key in food) {
        if (key !== 'id' && key !== 'description' && key !== 'idcategory' && key !== 'category') {
          const field = fields.find(f => f.field === key);
          if (field) {
            formattedItem[key] = {
              label: field.name,
              value: food[key],
              unit: field.unit
            };
          }
        }
      }
    
      return formattedItem;
    });

    return results;
  }
}

const controller = new FoodController();
export default controller;
