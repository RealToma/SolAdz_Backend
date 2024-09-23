import { Inject, Injectable } from '@nestjs/common';
import { User } from './users.model';
import { CreateUserDto } from './users.dto';
import { createClaimCommissionTxn, getLastClaim, getReward } from 'src/utils/anchor.utils';
import { Op } from 'sequelize';

@Injectable()
export class UsersService {
    constructor(
        @Inject("USERS_REPOSITORY")
        private users: typeof User
    ) { }

    async create(data: CreateUserDto): Promise<User> {
        const findUser = await this.users.findOne({
            where: { address: data.address }
        });
        if (!findUser) {
            return this.users.create(data);
        } else {
            this.users.update({ amount: data.amount }, { where: { address: data.address } })
        }
    }

    async getCommission(address: string) {
        // level1
        const lastUpdate = await getLastClaim(address);
        const from = new Date(lastUpdate * 1000);
        const level1 = await this.getRewardByReferrer(address, from);
        const amount1 = level1.amount;
        const users1 = level1.users;
        // level2
        let users2 = [];
        let amount2 = 0;
        for (const user of users1) {
            const { users, amount } = await this.getRewardByReferrer(user.address, from);
            amount2 += amount;
            users2 = [...users2, ...users];
        }
        // level3
        let users3 = [];
        let amount3 = 0;
        for (const user of users2) {
            const { users, amount } = await this.getRewardByReferrer(user.address, from);
            amount3 += amount;
            users3 = [...users3, ...users];
        }
        // level4
        let users4 = [];
        let amount4 = 0;
        for (const user of users3) {
            const { users, amount } = await this.getRewardByReferrer(user.address, from);
            amount4 += amount;
            users4 = [...users4, ...users];
        }
        // level5
        let users5 = [];
        let amount5 = 0;
        for (const user of users4) {
            const { users, amount } = await this.getRewardByReferrer(user.address, from);
            amount5 += amount;
            users5 = [...users5, ...users];
        }
        // level6
        let amount6 = 0;
        for (const user of users4) {
            const { amount } = await this.getRewardByReferrer(user.address, from);
            amount6 += amount;
        }
        const amount = amount1 / 10 + amount2 / 50 + (amount3 + amount4 + amount5 + amount6) / 100;
        return amount;
    }

    async getRewardByReferrer(address: string, from: Date) {
        let amount = 0;
        const today = new Date();
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const users = await this.users.findAll({
            where: {
                referrer: address,
                updatedAt: {
                    [Op.gte]: from,
                    [Op.lt]: endOfToday
                }
            }
        });
        for (const user of users) {
            amount += user.amount;
        }
        return { users, amount };
    }

    async withdrawCommission(address: string) {
        const amount = await this.getCommission(address);
        const matchingBonus = await this.getMatchingBonus(address);
        const txn = await createClaimCommissionTxn(address, amount + matchingBonus);
        return txn;
    }

    async getUserbyAddress(address: string): Promise<User> {
        return this.users.findOne({ where: { address } });
    }

    async getTopReferrers(): Promise<User[]> {
        let referrers = [];
        const users = await this.users.findAll();
        referrers = [...users];
        const length = referrers.length > 5 ? 5 : referrers.length;
        for (let i = 0; i < length; i++) {
            for (let j = 1; j < referrers.length; j++) {
                const count1 = await this.users.count({ where: { referrer: referrers[i].address } });
                const count2 = await this.users.count({ where: { referrer: referrers[j].address } });
                if (count2 > count1) {
                    const temp = referrers[i];
                    referrers[i] = referrers[j];
                    referrers[j] = temp;
                }
            }
        }
        return referrers;
    }

    async getMatchingBonus(address: string) {
        const lastupdate = await getLastClaim(address);
        const now = Math.floor(Date.now() / 1000);
        if (now - lastupdate < 86400) return 0;
        const user = await this.users.findOne({ where: { address } });
        const bonus = await this.calculateMatchBonus([user]);
        return bonus;
    }

    async calculateMatchBonus(referredUsers: User[], level = 1): Promise<number> {
        if (level === 20) {
            let amount = 0;
            for (const referredUser of referredUsers) {
                const users = await this.users.findAll({
                    where: { referrer: referredUser.address }
                });
                amount += await this.getRewardofUsers(users) * 0.01;
            }
            return amount;
        } else {
            let amount = 0;
            let users = <User[]>[];
            for (const referredUser of referredUsers) {
                users = await this.users.findAll({
                    where: { referrer: referredUser.address }
                });
                amount += await this.getRewardofUsers(users);
            }
            let newAmount = 0;
            if (level < 30 && users.length > 0) {
                newAmount = await this.calculateMatchBonus(users, level++);
                if (level > 15) {
                    newAmount *= 0.01;
                } else if (level > 10 && level < 16) {
                    newAmount *= 0.05;
                } else if (level > 5 && level < 11) {
                    newAmount *= 0.08;
                } else if (level > 1 && level < 6) {
                    newAmount *= 0.1;
                } else if (level === 1) {
                    newAmount *= 0.3;
                }
            }
            amount += newAmount;
            return amount;
        }
    }
    async getRewardofUsers(users: User[]) {
        let amount = 0;
        for (const user of users) {
            amount += await getReward(user.address);
        }
        return amount;
    }
}
