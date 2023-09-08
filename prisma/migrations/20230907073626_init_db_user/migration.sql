-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'SALESMAN', 'PURCHASER');

-- CreateEnum
CREATE TYPE "StatusUser" AS ENUM ('INIT', 'BANNED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "address" TEXT,
    "role" "Role" NOT NULL,
    "status" "StatusUser" NOT NULL DEFAULT 'INIT',
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMPTZ,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "salesmanId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_salesmanId_key" ON "User"("salesmanId");
