import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().trim().min(2, "Ingresá al menos 2 caracteres").max(100),
});

export const venueSchema = z.object({
  name: z.string().trim().min(2).max(100),
  address: z.string().trim().max(180).optional(),
  city: z.string().trim().min(2).max(100),
});

export const roomSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(600).optional(),
  venueId: z.string().uuid().optional().or(z.literal("")),
  startAt: z.string().min(1, "Indicá el inicio"),
  endAt: z.string().min(1, "Indicá el final"),
}).refine((value) => new Date(value.endAt) > new Date(value.startAt), { message: "El final debe ser posterior al inicio", path: ["endAt"] });

export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  age: z.coerce.number().int().min(18, "Debés ser mayor de 18 años").max(99),
  bio: z.string().trim().max(240).optional(),
  intentId: z.string().uuid(),
  interestIds: z.array(z.string().uuid()).min(1, "Elegí al menos un interés").max(8),
});

export const reportSchema = z.object({ reasonId: z.string().uuid(), description: z.string().trim().max(1000).optional() });

