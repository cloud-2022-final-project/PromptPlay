import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
    async upsertUserScore(discordId: string, prompt: string): Promise<User> {
        // Upsert the user and update the totalScore if the user already exists
        console.log(prompt);

        const score = 20;
        const updatedUser = await prisma.user.upsert({
            where: { discordId },
            update: { totalScore: { increment: score } },
            create: { discordId, totalScore: score, updateTime: new Date() },
        });
        return updatedUser;
    }

    async getAllUsers(): Promise<User[]> {
        return prisma.user.findMany();
    }

    async deleteAllUsers(): Promise<void> {
        await prisma.user.deleteMany();
    }

    async getUser(discordId: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { discordId } });
    }
}
