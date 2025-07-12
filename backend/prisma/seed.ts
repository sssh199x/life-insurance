import { PrismaClient, RiskTolerance } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.recommendation.deleteMany()
  await prisma.user.deleteMany()
  await prisma.insuranceProduct.deleteMany()

  // Seed insurance products
  const products = await prisma.insuranceProduct.createMany({
    data: [
      {
        productName: 'Basic Term Life',
        productType: 'term_life',
        description: 'Affordable term life insurance for basic protection',
        minCoverage: 50000,
        maxCoverage: 1000000,
        minTermYears: 10,
        maxTermYears: 30,
        targetRiskTolerance: RiskTolerance.low,
      },
      {
        productName: 'Premium Term Life',
        productType: 'term_life', 
        description: 'Enhanced term life insurance with higher coverage options',
        minCoverage: 100000,
        maxCoverage: 5000000,
        minTermYears: 10,
        maxTermYears: 30,
        targetRiskTolerance: RiskTolerance.medium,
      },
      {
        productName: 'Whole Life Starter',
        productType: 'whole_life',
        description: 'Permanent life insurance with cash value component',
        minCoverage: 25000,
        maxCoverage: 500000,
        targetRiskTolerance: RiskTolerance.low,
      },
      {
        productName: 'Universal Life Plus',
        productType: 'universal_life',
        description: 'Flexible permanent insurance with investment options',
        minCoverage: 100000,
        maxCoverage: 2000000,
        targetRiskTolerance: RiskTolerance.high,
      },
    ],
  })

  console.log(`✅ Created ${products.count} insurance products`)
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
