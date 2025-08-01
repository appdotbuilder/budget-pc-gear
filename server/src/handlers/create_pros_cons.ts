
import { db } from '../db';
import { prosConsTable } from '../db/schema';
import { type CreateProsConsInput, type ProsCons } from '../schema';

export const createProsCons = async (input: CreateProsConsInput): Promise<ProsCons> => {
  try {
    // Insert pros/cons record
    const result = await db.insert(prosConsTable)
      .values({
        product_id: input.product_id,
        type: input.type,
        content: input.content
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Pros/cons creation failed:', error);
    throw error;
  }
};
