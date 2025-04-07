"use server";

import { z } from "zod";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
 
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.string(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCents = Number(amount) * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
  // Test it out:
  // console.log(rawFormData);
}

// export async function createInvoice(formData: FormData) {
//   'use server';
//   const customerId = formData.get('customerId')?.toString();
//   const amount = formData.get('amount')?.toString();
//   const dueDate = formData.get('dueDate')?.toString();
//   const description = formData.get('description')?.toString();

//   if (!customerId || !amount || !dueDate || !description) {
//     throw new Error('Missing required fields');
//   }

//   const res = await fetch('/api/invoices', {
//     method: 'POST',
//     body: JSON.stringify({
//       customerId,
//       amount,
//       dueDate,
//       description,
//     }),
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!res.ok) {
//     throw new Error('Failed to create invoice');
//   }
// }
