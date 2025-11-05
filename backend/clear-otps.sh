#!/bin/bash

# Helper script to clear old OTPs from database for testing
# Usage: ./clear-otps.sh [phone-number]

echo "🧹 Clearing OTPs from database..."
echo ""

if [ -z "$1" ]; then
    echo "Clearing all OTPs older than 1 hour..."
    npx ts-node -e "
    import { PrismaClient } from '@prisma/client';
    const prisma = new PrismaClient();
    (async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const result = await prisma.otpVerification.deleteMany({
        where: {
          createdAt: {
            lt: oneHourAgo,
          },
        },
      });
      console.log(\`✅ Deleted \${result.count} old OTP records\`);
      await prisma.\$disconnect();
    })();
    "
else
    echo "Clearing OTPs for phone: $1"
    npx ts-node -e "
    import { PrismaClient } from '@prisma/client';
    const prisma = new PrismaClient();
    (async () => {
      const result = await prisma.otpVerification.deleteMany({
        where: {
          phone: '$1',
        },
      });
      console.log(\`✅ Deleted \${result.count} OTP records for $1\`);
      await prisma.\$disconnect();
    })();
    "
fi

echo ""
echo "✅ Done!"

