import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from 'src/users/users.service';
import { getTopSponsorPoolAmount, processTopSponsorPool } from 'src/utils/anchor.utils';

@Injectable()
export class TaskService {
    constructor(
        private userService: UsersService
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async processSponsorPool() {
        const tops = await this.userService.getTopReferrers();
        const sponsorPool = await getTopSponsorPoolAmount();
        if (!!tops[0]) {
            const amount = sponsorPool * 5 * 4 / 10000;
            await processTopSponsorPool(tops[0].address, amount);
        }
        if (!!tops[1]) {
            const amount = sponsorPool * 5 * 3 / 10000;
            await processTopSponsorPool(tops[1].address, amount);
        }
        if (!!tops[2]) {
            const amount = sponsorPool * 5 * 2 / 10000;
            await processTopSponsorPool(tops[2].address, amount);
        }
        if (!!tops[3]) {
            const amount = sponsorPool * 5 / 10000;
            await processTopSponsorPool(tops[3].address, amount);
        }
    }

    @Cron('0 22 * * 0')
    async weeklyProcess () {
        const tops = await this.userService.getTopReferrers();
        const sponsorPool = await getTopSponsorPoolAmount();
        if (!!tops[0]) {
            const amount = sponsorPool * 9 * 4 / 100;
            await processTopSponsorPool(tops[0].address, amount);
        }
        if (!!tops[1]) {
            const amount = sponsorPool * 9 * 2 / 100;
            await processTopSponsorPool(tops[1].address, amount);
        }
        if (!!tops[2]) {
            const amount = sponsorPool * 9 * 1.5 / 100;
            await processTopSponsorPool(tops[2].address, amount);
        }
        if (!!tops[3]) {
            const amount = sponsorPool * 9 * 1.5 / 100;
            await processTopSponsorPool(tops[3].address, amount);
        }
        if (!!tops[4]) {
            const amount = sponsorPool * 9  / 100;
            await processTopSponsorPool(tops[4].address, amount);
        }
    }
}
