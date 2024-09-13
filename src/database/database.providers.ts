import { Sequelize } from 'sequelize-typescript';
import { User } from 'src/users/users.model';



const port = Number(process.env.DB_PORT);
export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: port,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      });
      sequelize.addModels([
        User
      ]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
