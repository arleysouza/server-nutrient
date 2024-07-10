import { Request, Response } from "express";
import {query} from "../database/connection";

class FieldController {
  public async list(_: Request, res: Response): Promise<void> {
    try {
      const r: any = await query(
        "SELECT id::varchar,name,unit,field FROM fields ORDER BY name"
      );
      res.json(r);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  }
}

const controller = new FieldController();
export default controller;
