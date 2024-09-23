import { Column, DataType, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";


@Table
export class User extends Model {
    @PrimaryKey
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    id: string;

    @Unique
    @Column
    address: string;

    @Column
    referrer: string;

    @Column
    account: string;

    @Column({type: DataType.DOUBLE})
    topSponsorReward: number;

    @Column({type: DataType.DOUBLE})
    whalePoolReward: number;

    @Column({type: DataType.DOUBLE})
    amount: number;
}