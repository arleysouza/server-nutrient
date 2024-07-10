## Persistir dados de alimentação

A  aplicação tem como objetivo persistir no SGBD PostgreSQL os dados de alimentação do usuário. Os alimentos são divididos em alimentos não industrializados, com os de nutrientes obtidos na tabela TACO (Tabela Brasileira de Composição de Alimentos) e os alimentos industrizalizados, na qual o usuário deverá cadastrar a tabela de nutrientes e calorias.

### Instruções de uso
Utilize os comandos a seguir para clonar o projeto e instalar as dependências.
```
git clone https://github.com/arleysouza/server-nutrient.git server
cd server
npm i
```
A aplicação utiliza o SGBD PostgreSQL. Crie um BD no PostgreSQL de nome `bdnutrient` ou algum outro nome de sua preferência e altere as variáveis de ambiente do arquivo `.env` pelos parâmetros de conexão do SBGD PostgreSQL que você criou.
```
PORT = 3011
JWT_SECRET = @tokenJWT

DB_USER = postgres
DB_HOST = localhost
DB_NAME = bdnutrient
DB_PASSWORD = 123
DB_PORT = 5432
```

### SQL para criar as tabelas
No arquivo `src/database/create.ts` estão as instruções SQL para criar as tabelas no BD. Execute o comando `npm run create` para submeter as instruções SQL no SGBD. As tabelas estão organizadas da seguinte forma.
![](https://github.com/arleysouza/server-nutrient/blob/main/images/modelDB.png)

No arquivo `src/database/load.ts` estão as instruções SQL para carregar os dados nas tabelas `categories`, `foods` e `fields`. Execute o comando `npm run load` para submeter as instruções SQL no SGBD.

### Rotas
Rotas que não requer login:
- HTTP GET /login - usuário efetua o login e obtém o token de acesso;
- HTTP POST /user - usuário efetua o seu cadastro para criar uma conta;
- HTTP GET /food/search?term=café - obter os alimentos não industrializados que possuem um termo, por exemplo, _café_;
- HTTP GET /food/get?idfood=511 - obter os dados de um alimento não industrializado pelo identificador;
- HTTP GET /field - obter todos os campos;
- HTTP GET /category - obter todas as categorias dos alimentos não industrializados.

Rotas que requer estar logado, ou seja, é necessário enviar o token no header da requisição:
- HTTP PUT /user/alias - usuário altera o nome de usuário da sua conta;
- HTTP PUT /user/mail - usuário altera o e-mail da sua conta;
- HTTP PUT /user/password - usuário altera a senha de acesso da sua conta;
- HTTP GET /profile - usuário obtém os seus dados físicos;
- HTTP POST /profile - usuário cria ou altera os seus dados físicos;
- HTTP DELETE /profile - usuário remove os seus dados físicos;
- HTTP GET /product/all - obtém todos os produtos industrializados, independentemente do usuário que cadastrou;
- HTTP GET /product/byuser - obtém todos os produtos industrializados que o usuário cadastrou;
- HTTP POST /product - cria novo produto industrializado;
- HTTP POST /product/copy - cada usuário precisa ter os seus próprios produtos, ou seja, o mesmo produto pode existir na conta de vários usuários. Essa operação copia o produto de outro usuário para a conta do usuário;
- HTTP PUT /product - atualiza um produto que está na conta do usuário;
- HTTP DELETE /product - exclui um produto que está na conta do usuário;

Rotas que requer estar logado com o perfil _adm_:
- HTTP GET /user - usuário administrador lista todos os usuários;
- HTTP PUT /user/role - usuário administrador altera o perfil de acesso do usuário. Os tipos são _user_ e _adm_;