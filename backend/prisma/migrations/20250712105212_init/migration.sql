-- CreateEnum
CREATE TYPE "RiskTolerance" AS ENUM ('low', 'medium', 'high');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "age" INTEGER NOT NULL,
    "annual_income" DECIMAL(12,2) NOT NULL,
    "number_of_dependents" INTEGER NOT NULL,
    "risk_tolerance" "RiskTolerance" NOT NULL,
    "email" VARCHAR(255),
    "session_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "insurance_type" VARCHAR(50) NOT NULL,
    "coverage_amount" DECIMAL(12,2) NOT NULL,
    "term_length_years" INTEGER,
    "premium_estimate" DECIMAL(10,2),
    "explanation" TEXT NOT NULL,
    "confidence_score" DECIMAL(3,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_products" (
    "id" SERIAL NOT NULL,
    "product_name" VARCHAR(100) NOT NULL,
    "product_type" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "min_coverage" DECIMAL(12,2) DEFAULT 50000,
    "max_coverage" DECIMAL(12,2) DEFAULT 5000000,
    "min_term_years" INTEGER,
    "max_term_years" INTEGER,
    "target_risk_tolerance" "RiskTolerance",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurance_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_age_idx" ON "users"("age");

-- CreateIndex
CREATE INDEX "users_risk_tolerance_idx" ON "users"("risk_tolerance");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_session_id_idx" ON "users"("session_id");

-- CreateIndex
CREATE INDEX "recommendations_user_id_idx" ON "recommendations"("user_id");

-- CreateIndex
CREATE INDEX "recommendations_insurance_type_idx" ON "recommendations"("insurance_type");

-- CreateIndex
CREATE INDEX "recommendations_created_at_idx" ON "recommendations"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_products_product_name_key" ON "insurance_products"("product_name");

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
