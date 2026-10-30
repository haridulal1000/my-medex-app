import { z } from 'zod';

export const MoneyString = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, 'not a money string');

export const ServiceTypeSchema = z.enum([
  'package',
  'lab_test',
  'wellness',
  'service',
  'insurance',
]);
export type ServiceType = z.infer<typeof ServiceTypeSchema>;

export const DiscountTypeSchema = z.enum(['percent', 'amount']).nullish();
export const ChargeTypeSchema = z.enum(['percent', 'amount']).nullish();

export const CategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  type: ServiceTypeSchema,
  position: z.number().optional(),
  status: z.boolean(),
  parentId: z.string().nullish(),
});
export type Category = z.infer<typeof CategorySchema>;

export const CategoryWithChildrenSchema = CategorySchema.extend({
  children: z.array(CategorySchema).default([]),
});
export type CategoryWithChildren = z.infer<typeof CategoryWithChildrenSchema>;

export const ProviderInfoSchema = z.object({
  companyName: z.string(),
  slug: z.string(),
  types: z.array(ServiceTypeSchema).default([]),
  currency: z.enum(['THB', 'NPR', 'INR']),
  city: z
    .object({ id: z.string(), name: z.string(), slug: z.string() })
    .nullish(),
  country: z
    .object({ id: z.number(), name: z.string(), alphaCode: z.string() })
    .nullish(),
  rating: z.number().nullish(),
  reviewCount: z.number().nullish(),
});

export const ProviderSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  status: z.string(),
  providerInformation: ProviderInfoSchema.nullish(),
});
export type Provider = z.infer<typeof ProviderSchema>;

export const WellnessOptionSchema = z.object({
  id: z.string(),
  durationInMinutes: z.number(),
  price: MoneyString,
  discount: MoneyString.nullish(),
  discountType: DiscountTypeSchema,
  serviceCharge: MoneyString.nullish(),
  serviceChargeType: ChargeTypeSchema,
});
export type WellnessOption = z.infer<typeof WellnessOptionSchema>;

export const ServiceSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  type: ServiceTypeSchema,
  userId: z.number(),
  categoryId: z.string().nullish(),
  subCategoryId: z.string().nullish(),
  price: MoneyString.nullish(),
  discount: MoneyString.nullish(),
  discountType: DiscountTypeSchema,
  serviceCharge: MoneyString.nullish(),
  serviceChargeType: ChargeTypeSchema,
  status: z.boolean(),
  testAtHome: z.boolean().optional().default(false),
  homeTestCharge: MoneyString.nullish(),
  wellnessPricing: z.array(WellnessOptionSchema).optional().default([]),
  createdAt: z.string(),
});
export type Service = z.infer<typeof ServiceSchema>;