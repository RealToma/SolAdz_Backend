import { Sequelize } from 'sequelize-typescript';
import { User } from 'src/users/users.model';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT as any,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      });
      sequelize.addModels([User]);
      await sequelize.sync();
      console.log('here');
      console.log(typeof sequelize);
      return sequelize;
    },
  },
];
