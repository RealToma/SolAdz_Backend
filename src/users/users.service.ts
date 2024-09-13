import { Inject, Injectable } from '@nestjs/common';
import { User } from './users.model';
import { CreateUserDto } from './users.dto';
import { createClaimCommissionTxn, getReward } from 'src/utils/anchor.utils';

@Injectable()
export class UsersService {
    constructor(
        @Inject("USERS_REPOSITORY")
        private users: typeof User
    ){}

    async create(data: CreateUserDto):Promise<User> {
        return this.users.create(data);
    }

    async getCommission(address: string) {
        // level1
        const level1 = await this.getRewardByReferrer(address);
        const amount1 = level1.amount;
        const users1 = level1.users;
        // level2
        let users2 = [];
        let amount2 = 0;
        for (const user of users1) {
            const { users, amount } = await this.getRewardByReferrer(user.address);
            amount2 += amount;
            users2 = [...users2, ...users];
        }
        // level3
        let users3 = [];
        let amount3 = 0;
        for (const user of users2) {
            const { users, amount } = await this.getRewardByReferrer(user.address);
            amount3 += amount;
            users3 = [...users3, ...users];
        }
        // level4
        let users4 = [];
        let amount4 = 0;
        for (const user of users3) {
            const { users, amount } = await this.getRewardByReferrer(user.address);
            amount4 += amount;
            users4 = [...users4, ...users];
        }
        // level5
        let users5 = [];
        let amount5 = 0;
        for (const user of users4) {
            const { users, amount } = await this.getRewardByReferrer(user.address);
            amount5 += amount;
            users5 = [...users5, ...users];
        }
        // level6
        let amount6 = 0;
        for (const user of users4) {
            const { amount } = await this.getRewardByReferrer(user.address);
            amount6 += amount;
        }
        const amount = amount1 / 10 + amount2 / 50 + (amount3 + amount4 + amount5 + amount6) / 100;
        return amount;
    }

    async getRewardByReferrer(address: string) {
        let amount = 0;
        const users = await this.users.findAll({where: {referrer: address}});
        for (const user of users) {
            amount += await getReward(user.address);
        }
        return {users, amount};
    }

    async withdrawCommission(address: string) {
        const amount = await this.getCommission(address);
        const txn = await createClaimCommissionTxn(address, amount);
        return txn;
    }

    async getUserbyAddress(address: string): Promise<User> {
        return this.users.findOne({where: {address}});
    }

    async getTopReferrers () {
        let referrers = [];
        const users = await this.users.findAll();
        referrers = [...users];
        const length = referrers.length > 4 ? 4 : referrers.length;
        for (let i = 0; i < length; i++) {
            for (let j = 1; j < referrers.length; j++) {
                const count1 = await this.users.count({where: {referrer: referrers[i].address}});
                const count2 = await this.users.count({where: {referrer: referrers[j].address}});
                if (count2 > count1) {
                    const temp = referrers[i];
                    referrers[i] = referrers[j];
                    referrers[j] = temp;
                }
            }
        }
        return referrers;
    }
}
