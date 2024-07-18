import { queryCommitRollback, query, pool } from "./connection";

async function init() {
  try {
    await queryCommitRollback(`
    DO
    $$
    BEGIN
        DROP TABLE IF EXISTS users, profiles, fields, categories, foods, products, votes, eat_foods, eat_products;

        DROP TYPE IF EXISTS enum_sex, enum_role CASCADE;

        CREATE TYPE enum_sex AS ENUM ('female', 'male');
        CREATE TYPE enum_role AS ENUM ('user', 'adm');

        CREATE TABLE users (
            id SERIAL NOT NULL,
            alias VARCHAR(30) NOT NULL,
            mail VARCHAR(50) NOT NULL,
            password VARCHAR(100) NULL,
            role enum_role NOT NULL DEFAULT 'user',
            PRIMARY KEY(id),
            CONSTRAINT users_mail_unique UNIQUE (mail)
        );

        CREATE TABLE profiles (
            id SERIAL NOT NULL,
            _user INTEGER NOT NULL,
            birth_date DATE NOT NULL,
            weight FLOAT NOT NULL,
            sex enum_sex NULL,
            PRIMARY KEY(id),
            FOREIGN KEY(_user)
                REFERENCES users(id)
                ON DELETE RESTRICT
                ON UPDATE CASCADE
        );

        CREATE TABLE fields (
            id SERIAL NOT NULL,
            name VARCHAR(50) NULL,
            unit VARCHAR(5) NULL,
            field VARCHAR(30) NULL,
            PRIMARY KEY(id)
        );

        CREATE TABLE categories (
            id SERIAL NOT NULL,
            name VARCHAR(40) NULL,
            PRIMARY KEY(id)
        );

        CREATE TABLE foods (
            id SERIAL NOT NULL,
            category INTEGER NOT NULL,
            description VARCHAR(70) NULL,
            moisture FLOAT NULL,
            energy FLOAT NULL,
            protein FLOAT NULL,
            lipids FLOAT NULL,
            cholesterol FLOAT NULL,
            carbohydrate FLOAT NULL,
            dietary_fiber FLOAT NULL,
            ash FLOAT NULL,
            calcium FLOAT NULL,
            magnesium FLOAT NULL,
            manganese FLOAT NULL,
            phosphorus FLOAT NULL,
            iron FLOAT NULL,
            sodium FLOAT NULL,
            potassium FLOAT NULL,
            copper FLOAT NULL,
            zinc FLOAT NULL,
            retinol FLOAT NULL,
            re FLOAT NULL,
            era FLOAT NULL,
            thiamin FLOAT NULL,
            riboflavin FLOAT NULL,
            pyridoxine FLOAT NULL,
            niacin FLOAT NULL,
            vitamin_c FLOAT NULL,
            PRIMARY KEY(id),
            FOREIGN KEY(category)
                REFERENCES categories(id)
                ON DELETE RESTRICT
                ON UPDATE CASCADE
        );

        CREATE TABLE products (
            id SERIAL NOT NULL,
            _user INTEGER NOT NULL,
            description VARCHAR(50) NOT NULL,
            serving_size FLOAT NOT NULL,
            serving_size_unit VARCHAR(10) NOT NULL,
            quantity_per_serving FLOAT NULL,
            quantity_per_serving_unit VARCHAR(20) NULL,
            energy FLOAT NULL,
            protein FLOAT NULL,
            carbohydrate FLOAT NULL,
            sugar FLOAT NULL,
            dietary_fiber FLOAT NULL,
            total_fat FLOAT NULL,
            saturated_fat FLOAT NULL,
            trans_fat FLOAT NULL,
            calcium FLOAT NULL,
            sodium FLOAT NULL,
            PRIMARY KEY(id),
            FOREIGN KEY(_user)
                REFERENCES users(id)
                ON DELETE RESTRICT
                ON UPDATE CASCADE
        );

        CREATE TABLE eat_foods (
            id SERIAL NOT NULL,
            _user INTEGER NOT NULL,
            food INTEGER NOT NULL,
            date DATE NULL,
            quantity FLOAT NULL,
            PRIMARY KEY(id),
            FOREIGN KEY(food)
                REFERENCES foods(id)
                ON DELETE RESTRICT
                ON UPDATE CASCADE,
            FOREIGN KEY(_user)
                REFERENCES users(id)
                ON DELETE RESTRICT
                ON UPDATE CASCADE
        );

        CREATE TABLE eat_products (
            id SERIAL NOT NULL,
            _user INTEGER NOT NULL,
            product INTEGER NOT NULL,
            date DATE NULL,
            quantity FLOAT NULL,
            PRIMARY KEY(id),
            FOREIGN KEY(_user)
                REFERENCES users(id)
                ON DELETE RESTRICT
                ON UPDATE CASCADE,
            FOREIGN KEY(product)
                REFERENCES products(id)
                ON DELETE RESTRICT
                ON UPDATE CASCADE
        );
    END;
    $$;
    `);
    // Verifique se a tabela foi criada
    const result = await query(
      `SELECT table_name
        FROM information_schema.tables
        WHERE table_catalog = $1
        AND table_schema = 'public'
        AND table_type = 'BASE TABLE'`,
        [process.env.DB_NAME]
    );
    console.log("Comandos SQL submetidos ao SGBD. Tabelas:", result);
  } catch (e: any) {
    console.error("Erro ao submeter comandos SQL:", e.message);
  } finally {
    console.log("Finalizado");
    pool.end();
  }
}

init();
