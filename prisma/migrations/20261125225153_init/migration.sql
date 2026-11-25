-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'SUPPORT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'AIRTEL_MONEY', 'MTN_MOBILE_MONEY', 'VISA_CARD', 'GLOVO');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PARTIAL', 'UNPAID');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('ACTIVE', 'VOID');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('RESTOCK', 'SALE', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "surname" TEXT,
    "other_names" TEXT,
    "avatar" TEXT,
    "gender" TEXT,
    "birth_date" DATE,
    "address" TEXT,
    "phone_number" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "art_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sub_category_id" UUID NOT NULL,
    "purchasing_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "selling_price" DECIMAL(12,2) NOT NULL,
    "image_url" TEXT,
    "stock_quantity" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "size" TEXT,
    "color" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "sale_item_id" UUID,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "note" TEXT,
    "user_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "receipt_no" INTEGER NOT NULL,
    "user_id" UUID NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'COMPLETED',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "total_amount" DECIMAL(12,2) NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL,
    "amount_due" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sold_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sale_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "product_name" TEXT NOT NULL,
    "art_number" TEXT NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "line_total" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ref" TEXT NOT NULL,
    "category_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "spent_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counters" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "counters_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "subscribers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "list" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "email" TEXT,
    "subject" TEXT,
    "message" TEXT,
    "list" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sub_categories_category_id_name_key" ON "sub_categories"("category_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "products_art_number_key" ON "products"("art_number");

-- CreateIndex
CREATE INDEX "products_sub_category_id_idx" ON "products"("sub_category_id");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_product_id_size_color_key" ON "product_variants"("product_id", "size", "color");

-- CreateIndex
CREATE UNIQUE INDEX "stock_movements_sale_item_id_key" ON "stock_movements"("sale_item_id");

-- CreateIndex
CREATE INDEX "stock_movements_product_id_created_at_idx" ON "stock_movements"("product_id", "created_at");

-- CreateIndex
CREATE INDEX "stock_movements_variant_id_idx" ON "stock_movements"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_receipt_no_key" ON "sales"("receipt_no");

-- CreateIndex
CREATE INDEX "sales_sold_at_idx" ON "sales"("sold_at");

-- CreateIndex
CREATE INDEX "sales_user_id_sold_at_idx" ON "sales"("user_id", "sold_at");

-- CreateIndex
CREATE INDEX "sale_items_sale_id_idx" ON "sale_items"("sale_id");

-- CreateIndex
CREATE INDEX "sale_items_product_id_idx" ON "sale_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_categories_name_key" ON "expense_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_ref_key" ON "expenses"("ref");

-- CreateIndex
CREATE INDEX "expenses_spent_at_idx" ON "expenses"("spent_at");

-- CreateIndex
CREATE INDEX "expenses_user_id_spent_at_idx" ON "expenses"("user_id", "spent_at");

-- CreateIndex
CREATE INDEX "expenses_category_id_idx" ON "expenses"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_email_list_key" ON "subscribers"("email", "list");

-- CreateIndex
CREATE INDEX "contact_messages_list_created_at_idx" ON "contact_messages"("list", "created_at");

-- AddForeignKey
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_sale_item_id_fkey" FOREIGN KEY ("sale_item_id") REFERENCES "sale_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
