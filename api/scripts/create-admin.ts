import { PrismaClient } from '@prisma/client';
import { userFactory } from '../prisma/seed-helpers/user-factory';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];
    const jurisdictionName = process.argv[4];

    if (!email || !password || !jurisdictionName) {
        console.error('Usage: npx ts-node scripts/create-admin.ts <email> <password> <jurisdictionName>');
        process.exit(1);
    }

    const jurisdiction = await prisma.jurisdictions.findFirst({
        where: { name: jurisdictionName },
    });

    if (!jurisdiction) {
        console.error(`Error: Jurisdiction "${jurisdictionName}" not found.`);
        process.exit(1);
    }

    console.log(`Creating admin user: ${email} for jurisdiction: ${jurisdiction.name}`);

    try {
        await prisma.userAccounts.create({
            data: await userFactory({
                roles: { isAdmin: true },
                email: email,
                confirmedAt: new Date(),
                jurisdictionIds: [jurisdiction.id],
                acceptedTerms: true,
                password: password,
            }),
        });
        console.log(`✅ Admin user created successfully.`);
    } catch (e) {
        console.error('Error creating user:', e);
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
